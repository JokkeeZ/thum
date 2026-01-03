import calendar
import aiosqlite
from datetime import datetime, timedelta
from api.models.app_config import AppConfig
from api.models.status_response import StatusResponse
from api.models.entries.log_entry import LogEntry
from api.models.log_delete_result import LogDeleteResult
from api.models.daterange import DateRange
from api.models.entries.statistic_entry import StatisticEntry
from api.models.entries.sensor_entry import SensorEntry

class Database:
  def __init__(self, db_file: str):
    self.dbfile = db_file
    self.ctx: aiosqlite.Connection

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
    async with self.ctx.execute("""
      SELECT timestamp_date as ts, AVG(temperature) AS temperature, AVG(humidity) AS humidity
      FROM sensor_data
      GROUP BY ts
      ORDER BY ts;
    """) as cursor:

      return [SensorEntry.from_row(row) for row in await cursor.fetchall()]

  async def get_year_month_async(self, year: int, month: int) -> list[SensorEntry]:
    (_, days) = calendar.monthrange(year, month)
    start_date = datetime(year, month, 1).strftime(self.config.dateformat)
    end_date = datetime(year, month, days).strftime(self.config.dateformat)

    async with self.ctx.execute("""
      SELECT timestamp_date as ts, AVG(temperature) AS temperature, AVG(humidity) AS humidity
      FROM sensor_data
      WHERE timestamp_date BETWEEN ? AND ?
      GROUP BY ts
      ORDER BY ts;
    """, [start_date, end_date]) as cursor:

      return [SensorEntry.from_row(row) for row in await cursor.fetchall()]

  async def get_week_async(self, week: str) -> dict[str, list[str] | list[float]]:
    first = datetime.strptime(f'{week}-1', self.config.iso_week_format)
    dates = [(first + timedelta(days=i)).strftime(self.config.dateformat) for i in range(7)]

    async with self.ctx.execute("""
      SELECT timestamp_date, AVG(temperature), AVG(humidity)
      FROM sensor_data
      WHERE timestamp_date BETWEEN ? AND ?
      GROUP BY timestamp_date
      ORDER BY timestamp_date ASC;
    """, [dates[0], dates[-1]]) as cursor:
      rows = await cursor.fetchall()
      data_map = {row[0]: (row[1], row[2]) for row in rows}

    stats = [data_map.get(date, (None, None)) for date in dates]
    temperatures, humidities = zip(*stats) if stats else ([], [])

    return {
      'labels': list(calendar.day_name),
      'temperatures': list(temperatures),
      'humidities': list(humidities)
    }

  async def get_date_async(self, day, month, year) -> list[SensorEntry]:
    date = datetime(year, month, day).strftime(self.config.dateformat)
    async with self.ctx.execute("""
      SELECT timestamp_time as ts, temperature, humidity
      FROM sensor_data
      WHERE timestamp_date = ?
      GROUP BY ts
      ORDER BY ts;
    """, [date]) as cursor:

      return [SensorEntry.from_row(row) for row in await cursor.fetchall()]

  async def get_data_range_async(self, start_date: str, end_date: str) -> list[SensorEntry]:
    start = datetime.strptime(start_date, self.config.dateformat)
    end = datetime.strptime(end_date, self.config.dateformat)

    async with self.ctx.execute(f"""
      SELECT timestamp_date as ts, AVG(temperature) as temperature, AVG(humidity) as humidity
      FROM sensor_data
      WHERE timestamp_date BETWEEN ? AND ?
      GROUP BY ts
      ORDER BY ts;
    """, [start, end]) as cursor:

      return [SensorEntry.from_row(row) for row in await cursor.fetchall()]

  async def get_dates_range_async(self) -> DateRange | StatusResponse:
    async with self.ctx.execute("""
      SELECT MIN(timestamp_date) as min, MAX(timestamp_date) as max FROM sensor_data;
    """) as cursor:

      row = await cursor.fetchone()
      if row is None:
        return StatusResponse(success=False, message='Could not fetch dates(min, max)')

      return DateRange(first=row["min"], last=row["max"])

  async def get_weeks_range_async(self) -> DateRange | StatusResponse:
    async with self.ctx.execute("""
      SELECT MIN(timestamp_date) as min, MAX(timestamp_date) as max FROM sensor_data;
    """) as cursor:

      row = await cursor.fetchone()
      if row is None:
        return StatusResponse(success=False, message='Could not fetch weeks(min, max)')

    return self._get_range_with_fmt(row["min"], row["max"], self.config.weekformat)

  async def get_months_range_async(self) -> DateRange | StatusResponse:
    async with self.ctx.execute("""
      SELECT MIN(timestamp_date) as min, MAX(timestamp_date) as max FROM sensor_data;
    """) as cursor:

      row = await cursor.fetchone()
      if row is None:
        return StatusResponse(success=False, message='Could not fetch weeks(min, max)')

    return self._get_range_with_fmt(row["min"], row["max"], self.config.monthformat)

  async def sensor_insert_entry_async(self, temperature: float, humidity: float, date: str, time: str):
    async with self.ctx.execute("""
      INSERT INTO sensor_data(temperature, humidity, timestamp_date, timestamp_time)
      VALUES (?, ?, ?, ?);
    """, [temperature, humidity, date, time]):
      await self.ctx.commit()

  async def log_delete_by_timestamp_async(self, timestamp: str) -> LogDeleteResult:
    async with self.ctx.execute('DELETE FROM logs WHERE timestamp = ?;', [timestamp]) as cursor:
      await self.ctx.commit()
      return LogDeleteResult(count=cursor.rowcount)

  def _get_range_with_fmt(self, min: str, max: str | None, fmt: str) -> DateRange:
    now_str = datetime.now().strftime(fmt)

    def _fmt_internal(val: str | None) -> str:
      if val is None:
        return now_str
      return datetime.strptime(val, self.config.dateformat).strftime(fmt)

    return DateRange(first=_fmt_internal(min), last=_fmt_internal(max))

  async def log_get_all_async(self) -> list[LogEntry]:
    async with self.ctx.execute("""
      SELECT message as msg, timestamp as ts
      FROM logs
      GROUP BY ts
      ORDER BY ts;
    """) as cursor:

      return [LogEntry.from_row(row) for row in await cursor.fetchall()]

  async def log_delete_all_async(self) -> LogDeleteResult:
    async with self.ctx.execute('DELETE FROM logs;') as cursor:
      await self.ctx.commit()
      return LogDeleteResult(count=cursor.rowcount)

  async def log_insert_entry_async(self, msg: str, ts: str):
    async with self.ctx.execute('INSERT INTO logs VALUES (?, ?);', [msg, ts]):
      await self.ctx.commit()

  async def shutdown_async(self):
    if self.ctx:
      await self.ctx.close()

  async def initialize_database(self):
    self.ctx = await aiosqlite.connect(self.dbfile)
    self.ctx.row_factory = aiosqlite.Row

    await self.ctx.execute("""
      CREATE TABLE IF NOT EXISTS logs (
        message	TEXT NOT NULL,
        timestamp	TEXT NOT NULL
      );
    """)

    await self.ctx.execute("""
      CREATE TABLE IF NOT EXISTS sensor_data (
        temperature	NUMERIC NOT NULL,
        humidity	NUMERIC NOT NULL,
        timestamp_date	date NOT NULL,
        timestamp_time	time NOT NULL
      );
    """)

    await self.ctx.execute("""
      CREATE TABLE IF NOT EXISTS config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        sensor_interval NUMERIC NOT NULL DEFAULT 600,
        dateformat TEXT NOT NULL DEFAULT "%Y-%m-%d",
        timeformat TEXT NOT NULL DEFAULT "%H:%M:%S",
        weekformat TEXT NOT NULL DEFAULT "%G-W%V",
        monthformat TEXT NOT NULL DEFAULT "%Y-%m",
        iso_week_format TEXT NOT NULL DEFAULT "%G-W%V-%u",
        use_sensor BOOLEAN NOT NULL DEFAULT 1 CHECK (use_sensor IN (0, 1))
      );
    """)

    await self.ctx.execute("CREATE INDEX IF NOT EXISTS idx_timestamp_date ON sensor_data (timestamp_date);")
    await self.ctx.commit()

  async def configure_async(self):
    await self.ctx.execute("""
      INSERT OR IGNORE INTO config (
        id, sensor_interval, dateformat, timeformat,
        weekformat, monthformat, iso_week_format, use_sensor
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?);
    """, [
        self.config.sensor_interval,
        self.config.dateformat,
        self.config.timeformat,
        self.config.weekformat,
        self.config.monthformat,
        self.config.iso_week_format,
        self.config.use_sensor
      ])
    await self.ctx.commit()

    async with self.ctx.execute("""
      SELECT * FROM config WHERE id = 1;
    """) as cursor:
      row = await cursor.fetchone()
      if not row:
        raise Exception("Failed to retrieve database configuration!")
      else:
        self.config = AppConfig.from_row(row)

  def get_app_config_async(self) -> AppConfig:
    return self.config

  async def update_config_async(self, cfg: AppConfig):
    await self.ctx.execute("""
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
    await self.ctx.commit()

  async def get_statistics_async(self) -> StatisticEntry:
    async with self.ctx.execute("""
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
    """) as cursor:

      row = await cursor.fetchone()
      if row is None:
        raise Exception("Failed to fetch statistics!")

      return StatisticEntry.from_row(row)
