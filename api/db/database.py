import calendar
import aiosqlite
from datetime import datetime, timedelta
from api.models.app_config import AppConfig
from api.models.status_response import StatusResponse
from api.models.entries.log_entry import LogEntry
from api.models.log_delete_result import LogDeleteResult
from api.models.min_max import MinMax
from api.models.entries.statistic_entry import StatisticEntry
from api.models.entries.sensor_entry import SensorEntry
from api.models.week_response import WeekResponse

class Database:
  def __init__(self, db_file: str):
    self.dbfile = db_file
    self.config: AppConfig = AppConfig(
      id=0,
      sensor_interval=600,
      dateformat='%Y-%m-%d',
      timeformat='%H:%M:%S',
      weekformat='%G-W%V',
      monthformat='%Y-%m',
      iso_week_format='%G-W%V-%u',
      use_sensor=True
    )

  async def get_all_async(self) -> list[SensorEntry]:
    async with aiosqlite.connect(self.dbfile) as db:
      db.row_factory = aiosqlite.Row
      cursor = await db.execute("""
        SELECT timestamp_date as ts, AVG(temperature) AS temperature, AVG(humidity) AS humidity
        FROM sensor_data
        GROUP BY ts
        ORDER BY ts;
      """)

      return [SensorEntry.from_row(row) for row in await cursor.fetchall()]

  async def get_year_month_async(self, year: int, month: int) -> list[SensorEntry]:
    (_, days) = calendar.monthrange(year, month)
    start_date = datetime(year, month, 1).strftime(self.config.dateformat)
    end_date = datetime(year, month, days).strftime(self.config.dateformat)

    async with aiosqlite.connect(self.dbfile) as db:
      db.row_factory = aiosqlite.Row
      cursor = await db.execute("""
        SELECT timestamp_date as ts, AVG(temperature) AS temperature, AVG(humidity) AS humidity
        FROM sensor_data
        WHERE timestamp_date BETWEEN ? AND ?
        GROUP BY ts
        ORDER BY ts;
      """, [start_date, end_date])

      return [SensorEntry.from_row(row) for row in await cursor.fetchall()]

  async def get_week_async(self, week: str) -> WeekResponse:
    first = datetime.strptime(f'{week}-1', self.config.iso_week_format)
    dates = [(first + timedelta(days=i)).strftime(self.config.dateformat) for i in range(7)]

    async with aiosqlite.connect(self.dbfile) as db:
      cursor = await db.execute("""
        SELECT timestamp_date as ts, AVG(temperature) AS temperature, AVG(humidity) AS humidity
        FROM sensor_data
        WHERE ts BETWEEN ? AND ?
        GROUP BY ts
        ORDER BY ts;
      """, [dates[0], dates[-1]])

      result = {row[0]: (row[1], row[2]) for row in await cursor.fetchall()}

      temperatures = []
      humidities = []

      for date in dates:
        temp, hum = result.get(date, (None, None))
        temperatures.append(temp)
        humidities.append(hum)

    return WeekResponse(
      labels=list(calendar.day_name),
      temperatures=temperatures,
      humidities=humidities
    )

  async def get_date_async(self, day, month, year) -> list[SensorEntry]:
    date = datetime(year, month, day).strftime(self.config.dateformat)
    async with aiosqlite.connect(self.dbfile) as db:
      db.row_factory = aiosqlite.Row
      cursor = await db.execute("""
        SELECT timestamp_time as ts, temperature, humidity
        FROM sensor_data
        WHERE timestamp_date = ?
        GROUP BY ts
        ORDER BY ts;
      """, [date])

      return [SensorEntry.from_row(row) for row in await cursor.fetchall()]

  async def get_data_range_async(self, start_date: str, end_date: str) -> list[SensorEntry]:
    start = datetime.strptime(start_date, self.config.dateformat)
    end = datetime.strptime(end_date, self.config.dateformat)

    async with aiosqlite.connect(self.dbfile) as db:
      db.row_factory = aiosqlite.Row
      cursor = await db.execute(f"""
        SELECT timestamp_date as ts, AVG(temperature) as temperature, AVG(humidity) as humidity
        FROM sensor_data
        WHERE timestamp_date BETWEEN ? AND ?
        GROUP BY ts
        ORDER BY ts;
      """, [start, end])

      return [SensorEntry.from_row(row) for row in await cursor.fetchall()]

  async def get_min_max_dates_async(self) -> MinMax | StatusResponse:
    async with aiosqlite.connect(self.dbfile) as db:
      db.row_factory = aiosqlite.Row
      cursor = await db.execute('SELECT MIN(timestamp_date) as min, MAX(timestamp_date) as max FROM sensor_data;')

      row = await cursor.fetchone()
      if row is None:
        return StatusResponse(success=False, message='Could not fetch dates(min, max)')

      return MinMax(first=row["min"], last=row["max"])

  async def get_min_max_weeks_async(self) -> MinMax | StatusResponse:
    async with aiosqlite.connect(self.dbfile) as db:
      db.row_factory = aiosqlite.Row
      cursor = await db.execute('SELECT MIN(timestamp_date) as min, MAX(timestamp_date) as max FROM sensor_data;')

      row = await cursor.fetchone()
      if row is None:
        return StatusResponse(success=False, message='Could not fetch weeks(min, max)')

    return self._get_min_max_with_fmt(row["min"], row["max"], self.config.weekformat)

  async def get_min_max_months_async(self) -> MinMax | StatusResponse:
    async with aiosqlite.connect(self.dbfile) as db:
      db.row_factory = aiosqlite.Row
      cursor = await db.execute('SELECT MIN(timestamp_date), MAX(timestamp_date) FROM sensor_data;')

      row = await cursor.fetchone()
      if row is None:
        return StatusResponse(success=False, message='Could not fetch weeks(min, max)')

    return self._get_min_max_with_fmt(row["min"], row["max"], self.config.monthformat)

  async def sensor_insert_entry_async(self, temperature: float, humidity: float, date: str, time: str):
    async with aiosqlite.connect(self.dbfile) as db:
      await db.execute("""
        INSERT INTO sensor_data(temperature, humidity, timestamp_date, timestamp_time) VALUES (?, ?, ?, ?);
      """, [temperature, humidity, date, time])
      await db.commit()

  async def log_delete_by_timestamp_async(self, timestamp: str) -> LogDeleteResult:
    async with aiosqlite.connect(self.dbfile) as db:
      cursor = await db.execute('DELETE FROM logs WHERE timestamp = ?;',
      [timestamp])
      await db.commit()

    return LogDeleteResult(count=cursor.rowcount)

  def _get_min_max_with_fmt(self, min: str, max: str | None, fmt: str) -> MinMax:
    now_str = datetime.now().strftime(fmt)

    def _fmt_internal(val: str | None) -> str:
      if val is None:
        return now_str
      return datetime.strptime(val, self.config.dateformat).strftime(fmt)

    return MinMax(first=_fmt_internal(min), last=_fmt_internal(max))

  async def log_get_all_async(self) -> list[LogEntry]:
    async with aiosqlite.connect(self.dbfile) as db:
      db.row_factory = aiosqlite.Row
      cursor = await db.execute("""
        SELECT message as msg, timestamp as ts
        FROM logs
        GROUP BY ts
        ORDER BY ts;
      """)

      return [LogEntry.from_row(row) for row in await cursor.fetchall()]

    async with aiosqlite.connect(self.dbfile) as db:
      cursor = await db.execute('SELECT * FROM logs;')
      return await cursor.fetchall()

  async def log_delete_all_async(self) -> LogDeleteResult:
    async with aiosqlite.connect(self.dbfile) as db:
      cursor = await db.execute('DELETE FROM logs;')
      await db.commit()

      return LogDeleteResult(count=cursor.rowcount)

  async def log_insert_entry_async(self, msg: str, ts: str):
    async with aiosqlite.connect(self.dbfile) as db:
      await db.execute(f'INSERT INTO logs VALUES (?, ?);', [msg, ts])
      await db.commit()

  async def initialize_database(self):
    async with aiosqlite.connect(self.dbfile) as db:
      await db.execute("""
      CREATE TABLE IF NOT EXISTS logs (
        message	TEXT NOT NULL,
        timestamp	TEXT NOT NULL
      );
      """)

      await db.execute("""
      CREATE TABLE IF NOT EXISTS sensor_data (
        temperature	NUMERIC NOT NULL,
        humidity	NUMERIC NOT NULL,
        timestamp_date	date NOT NULL,
        timestamp_time	time NOT NULL
      );
      """)

      await db.execute("""
      CREATE TABLE IF NOT EXISTS config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        sensor_interval NUMERIC NOT NULL DEFAULT 600,
        dateformat TEXT NOT NULL DEFAULT "%Y-%m-%d",
        timeformat TEXT NOT NULL DEFAULT "%H:%M:%S",
        weekformat TEXT NOT NULL DEFAULT "%G-W%V",
        monthformat TEXT NOT NULL DEFAULT "%Y-%m",
        iso_week_format TEXT NOT NULL DEFAULT "%G-W%V-%u",
        use_sensor BOOLEAN NOT NULL DEFAULT 1 CHECK (use_sensor IN (0, 1))
      )
      """)

      await db.execute("CREATE INDEX IF NOT EXISTS idx_timestamp_date ON sensor_data (timestamp_date);")
      await db.commit()

  async def configure_async(self):
    async with aiosqlite.connect(self.dbfile) as db:
      db.row_factory = aiosqlite.Row

      await db.execute("""
      INSERT OR IGNORE INTO config (
          id, sensor_interval, dateformat, timeformat,
          weekformat, monthformat, iso_week_format, use_sensor
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?)
      """, [
        self.config.sensor_interval,
        self.config.dateformat,
        self.config.timeformat,
        self.config.weekformat,
        self.config.monthformat,
        self.config.iso_week_format,
        self.config.use_sensor
      ])
      await db.commit()

      async with db.execute("SELECT * FROM config WHERE id = 1") as cursor:
        row = await cursor.fetchone()
        if not row:
          raise Exception("Failed to retrieve database configuration!")
        else:
          self.config = AppConfig.from_row(row)

  def get_app_config_async(self) -> AppConfig:
    return self.config

  async def update_config_async(self, cfg: AppConfig):
    async with aiosqlite.connect(self.dbfile) as db:
      await db.execute("""
      UPDATE config
      SET sensor_interval = ?,
          dateformat = ?,
          timeformat = ?,
          weekformat = ?,
          monthformat = ?,
          iso_week_format = ?,
          use_sensor = ?
      WHERE id = 1;
      """, [
        cfg.sensor_interval,
        cfg.dateformat,
        cfg.timeformat,
        cfg.weekformat,
        cfg.monthformat,
        cfg.iso_week_format,
        cfg.use_sensor
      ])
      await db.commit()

  async def get_statistics_async(self) -> StatisticEntry:
    async with aiosqlite.connect(self.dbfile) as db:
      db.row_factory = aiosqlite.Row
      cursor = await db.execute("""
        SELECT
          COUNT(*) AS total_entries,
          AVG(temperature) AS avg_temperature,
          AVG(humidity) AS avg_humidity,
          MIN(temperature) AS min_temperature,
          (SELECT MIN(timestamp_date) FROM sensor_data
            WHERE temperature = (SELECT MIN(temperature) FROM sensor_data)) AS min_temperature_date,
          MAX(temperature) AS max_temperature,
          (SELECT MIN(timestamp_date) FROM sensor_data
            WHERE temperature = (SELECT MAX(temperature) FROM sensor_data)) AS max_temperature_date,
          MIN(humidity) AS min_humidity,
          (SELECT MIN(timestamp_date) FROM sensor_data
            WHERE humidity = (SELECT MIN(humidity) FROM sensor_data)) AS min_humidity_date,
          MAX(humidity) AS max_humidity,
          (SELECT MIN(timestamp_date) FROM sensor_data
            WHERE humidity = (SELECT MAX(humidity) FROM sensor_data)) AS max_humidity_date
        FROM sensor_data;
      """)

      row = await cursor.fetchone()
      if row is None:
        raise Exception("Failed to fetch statistics!")

      return StatisticEntry.from_row(row)
