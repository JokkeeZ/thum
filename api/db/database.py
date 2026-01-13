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
    self.config: AppConfig = AppConfig.default()

  async def all_async(self) -> list[SensorEntry]:
    async with self.ctx.execute("""
      SELECT
        timestamp_date as ts,
        AVG(temperature) AS temperature,
        AVG(humidity) AS humidity
      FROM sensor_data
      GROUP BY ts
      ORDER BY ts;
    """) as cursor:

      return [SensorEntry.from_row(row) for row in await cursor.fetchall()]

  async def by_month_async(self, year: int, month: int) -> list[SensorEntry]:
    (_, days) = calendar.monthrange(year, month)
    start_date = datetime(year, month, 1).strftime(self.config.dateformat)
    end_date = datetime(year, month, days).strftime(self.config.dateformat)

    async with self.ctx.execute("""
      SELECT
        timestamp_date as ts,
        AVG(temperature) AS temperature,
        AVG(humidity) AS humidity
      FROM sensor_data
      WHERE timestamp_date BETWEEN ? AND ?
      GROUP BY ts
      ORDER BY ts;
    """, [start_date, end_date]) as cursor:

      return [SensorEntry.from_row(row) for row in await cursor.fetchall()]

  async def by_week_async(self, week: str) -> list[SensorEntry]:
    first = datetime.strptime(f'{week}-1', self.config.iso_week_format)

    data_by_weekday: dict[str, SensorEntry] = {}

    start_date = first.strftime(self.config.dateformat)
    end_date = (first + timedelta(days=6)).strftime(self.config.dateformat)

    async with self.ctx.execute("""
      SELECT
        timestamp_date AS ts,
        AVG(temperature) AS temperature,
        AVG(humidity) AS humidity
      FROM sensor_data
      WHERE timestamp_date BETWEEN ? AND ?
      GROUP BY ts
      ORDER BY ts ASC;
    """, [start_date, end_date]) as cursor:
      rows = await cursor.fetchall()

      for row in rows:
        dt = datetime.strptime(row["ts"], self.config.dateformat)
        weekday = calendar.day_name[dt.weekday()]

        data_by_weekday[weekday] = SensorEntry(
          ts=weekday,
          temperature=row["temperature"],
          humidity=row["humidity"],
        )

    entries: list[SensorEntry] = []

    for weekday in calendar.day_name:
      entries.append(
        data_by_weekday.get(
          weekday,
          SensorEntry(
            ts=weekday,
            temperature=None,
            humidity=None,
          ),
        )
      )

    return entries

  async def by_date_async(self, day, month, year) -> list[SensorEntry]:
    date = datetime(year, month, day).strftime(self.config.dateformat)
    async with self.ctx.execute("""
      SELECT
        timestamp_time as ts,
        temperature,
        humidity
      FROM sensor_data
      WHERE timestamp_date = ?
      GROUP BY ts
      ORDER BY ts;
    """, [date]) as cursor:

      return [SensorEntry.from_row(row) for row in await cursor.fetchall()]

  async def by_range_async(self, start: str, end: str) -> list[SensorEntry]:
    start_date = datetime.strptime(start, self.config.dateformat).date()
    end_date = datetime.strptime(end, self.config.dateformat).date()

    async with self.ctx.execute(f"""
      SELECT
        timestamp_date as ts,
        AVG(temperature) as temperature,
        AVG(humidity) as humidity
      FROM sensor_data
      WHERE DATE(timestamp_date) BETWEEN ? AND ?
      GROUP BY ts
      ORDER BY ts;
    """, [start_date, end_date]) as cursor:

      return [SensorEntry.from_row(row) for row in await cursor.fetchall()]

  async def daterange_async(self):
    async with self.ctx.execute("""
      SELECT
        MIN(timestamp_date) as min,
        MAX(timestamp_date) as max
      FROM sensor_data;
    """) as cursor:

      row = await cursor.fetchone()
      if row is None:
        return StatusResponse(success=False, message='Could not fetch dates')

      return {
        'dates': DateRange(first=row["min"], last=row["max"]),
        'weeks': self._fmt_range(row["min"], row["max"], self.config.weekformat),
        'months': self._fmt_range(row["min"], row["max"], self.config.monthformat)
      }

  async def insert_sensor_entry_async(self, temp: float, humi: float, date: str, time: str):
    await self.ctx.execute_insert("""
      INSERT INTO sensor_data(temperature, humidity, timestamp_date, timestamp_time)
      VALUES (?, ?, ?, ?);
    """, [temp, humi, date, time])

  async def delete_log_by_ts_async(self, timestamp: str) -> LogDeleteResult:
    async with self.ctx.execute('DELETE FROM logs WHERE timestamp = ?;', [timestamp]) as cursor:
      await self.ctx.commit()
      return LogDeleteResult(count=cursor.rowcount)

  def _fmt_range(self, min: str, max: str | None, fmt: str) -> DateRange:
    now_str = datetime.now().strftime(fmt)

    def _fmt_internal(val: str | None) -> str:
      if val is None:
        return now_str
      return datetime.strptime(val, self.config.dateformat).strftime(fmt)

    return DateRange(first=_fmt_internal(min), last=_fmt_internal(max))

  async def all_logs_async(self) -> list[LogEntry]:
    async with self.ctx.execute("""
      SELECT message as msg, timestamp as ts
      FROM logs
      GROUP BY ts
      ORDER BY ts;
    """) as cursor:

      return [LogEntry.from_row(row) for row in await cursor.fetchall()]

  async def delete_all_logs_async(self) -> LogDeleteResult:
    async with self.ctx.execute('DELETE FROM logs;') as cursor:
      await self.ctx.commit()
      return LogDeleteResult(count=cursor.rowcount)

  async def insert_log_entry_async(self, msg: str, ts: str):
    await self.ctx.execute_insert('INSERT INTO logs VALUES (?, ?);', [msg, ts])

  async def shutdown_async(self):
    if self.ctx:
      await self.ctx.close()

  async def init_database_async(self):
    self.ctx = await aiosqlite.connect(self.dbfile)
    self.ctx.row_factory = aiosqlite.Row

    await self.ctx.execute("""
      CREATE TABLE IF NOT EXISTS logs (
        message TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );
    """)

    await self.ctx.execute("""
      CREATE TABLE IF NOT EXISTS sensor_data (
        temperature NUMERIC NOT NULL,
        humidity NUMERIC NOT NULL,
        timestamp_date date NOT NULL,
        timestamp_time time NOT NULL
      );
    """)

    await self.ctx.execute("""
      CREATE TABLE IF NOT EXISTS config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        sensor_interval NUMERIC NOT NULL,
        dateformat TEXT NOT NULL,
        timeformat TEXT NOT NULL,
        weekformat TEXT NOT NULL,
        monthformat TEXT NOT NULL,
        iso_week_format TEXT NOT NULL,
        use_sensor BOOLEAN NOT NULL CHECK (use_sensor IN (0, 1))
      );
    """)
    await self.ctx.execute("""
      INSERT OR IGNORE INTO config (
        id,
        sensor_interval,
        dateformat,
        timeformat,
        weekformat,
        monthformat,
        iso_week_format,
        use_sensor
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

  async def statistics_async(self) -> StatisticEntry:
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
