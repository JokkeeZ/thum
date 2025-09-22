import calendar
import aiosqlite
from datetime import datetime, timedelta
from api.sensor_data import SensorData

class Database:
  def __init__(self, db_file: str):
    self.dbfile = db_file
    self.dateformat = '%Y-%m-%d'
    self.timeformat = '%H:%M:%S'

    self.wformat = '%G-W%V'
    self.mformat = '%Y-%m'
    self.iso_w_format = '%G-W%V-%u'

  async def get_all_async(self):
    async with aiosqlite.connect(self.dbfile) as db:
      cursor = await db.execute("""
        SELECT timestamp_date as ts, AVG(temperature) AS temperature, AVG(humidity) AS humidity
        FROM sensor_data
        GROUP BY ts
        ORDER BY ts;
      """)

      return [SensorData.from_row(row) for row in await cursor.fetchall()]

  async def get_year_month_async(self, year: int, month: int):
    (_, days) = calendar.monthrange(year, month)
    start_date = datetime(year, month, 1).strftime(self.dateformat)
    end_date = datetime(year, month, days).strftime(self.dateformat)

    async with aiosqlite.connect(self.dbfile) as db:
      cursor = await db.execute("""
        SELECT timestamp_date as ts, AVG(temperature) AS temperature, AVG(humidity) AS humidity
        FROM sensor_data
        WHERE timestamp_date BETWEEN ? AND ?
        GROUP BY ts
        ORDER BY ts;
      """, [start_date, end_date])

      return [SensorData.from_row(row) for row in await cursor.fetchall()]

  async def get_week_async(self, week: str):
    first = datetime.strptime(f'{week}-1', self.iso_w_format)
    dates = [(first + timedelta(days=i)).strftime(self.dateformat) for i in range(7)]

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

    return {
      'labels': list(calendar.day_name),
      'temperatures': temperatures,
      'humidities': humidities
    }

  async def get_date_async(self, day, month, year):
    date = datetime(year, month, day).strftime(self.dateformat)
    async with aiosqlite.connect(self.dbfile) as db:
      cursor = await db.execute("""
        SELECT timestamp_time as ts, temperature, humidity
        FROM sensor_data
        WHERE timestamp_date = ?
        GROUP BY ts
        ORDER BY ts;
      """, [date])

      return [SensorData.from_row(row) for row in await cursor.fetchall()]

  async def get_data_range_async(self, start_date: str, end_date: str):
    start = datetime.strptime(start_date, self.dateformat)
    end = datetime.strptime(end_date, self.dateformat)

    async with aiosqlite.connect(self.dbfile) as db:
      cursor = await db.execute(f"""
        SELECT timestamp_date as ts, AVG(temperature) as temperature, AVG(humidity) as humidity
        FROM sensor_data
        WHERE timestamp_date BETWEEN ? AND ?
        GROUP BY ts
        ORDER BY ts;
      """, [start, end])

      return [SensorData.from_row(row) for row in await cursor.fetchall()]

  async def get_min_max_dates_async(self):
    async with aiosqlite.connect(self.dbfile) as db:
      cursor = await db.execute('SELECT MIN(timestamp_date), MAX(timestamp_date) FROM sensor_data;')
      (min, max) = await cursor.fetchone()
      return { "first": min, "last": max }

  async def get_min_max_weeks_async(self):
    async with aiosqlite.connect(self.dbfile) as db:
      cursor = await db.execute('SELECT MIN(timestamp_date), MAX(timestamp_date) FROM sensor_data;')
      (min, max) = await cursor.fetchone()

    now = datetime.now()
    min_week = (now.strftime(self.wformat) if min is None else datetime.strptime(min, self.dateformat).strftime(self.wformat))
    max_week = (now.strftime(self.wformat) if max is None else datetime.strptime(max, self.dateformat).strftime(self.wformat))
    return { "first": min_week, "last": max_week }

  async def get_min_max_months_async(self):
    async with aiosqlite.connect(self.dbfile) as db:
      cursor = await db.execute('SELECT MIN(timestamp_date), MAX(timestamp_date) FROM sensor_data;')
      (min, max) = await cursor.fetchone()

    now = datetime.now()
    min_month = (now.strftime(self.mformat) if min is None else datetime.strptime(min, self.dateformat).strftime(self.mformat))
    max_month = (now.strftime(self.mformat) if max is None else datetime.strptime(max, self.dateformat).strftime(self.mformat))
    return { "first": min_month, "last": max_month }

  async def sensor_insert_entry_async(self, temperature: float, humidity: float, date: str, time: str):
    async with aiosqlite.connect(self.dbfile) as db:
      await db.execute("""
        INSERT INTO sensor_data(temperature, humidity, timestamp_date, timestamp_time) VALUES (?, ?, ?, ?);
      """, (
        entry['temperature'],
        entry['humidity'],
        entry['timestamp_date'],
        entry['timestamp_time'])
      )

  async def log_delete_by_timestamp_async(self, timestamp: str) -> int:
    async with aiosqlite.connect(self.dbfile) as db:
      cursor = await db.execute('DELETE FROM logs WHERE timestamp = ?;',
      [timestamp])
      await db.commit()

    return cursor.rowcount

  async def log_get_all_async(self):
    async with aiosqlite.connect(self.dbfile) as db:
      cursor = await db.execute('SELECT * FROM logs;')
      return await cursor.fetchall()

  async def log_delete_all_async(self) -> int:
    async with aiosqlite.connect(self.dbfile) as db:
      cursor = await db.execute('DELETE FROM logs;')
      await db.commit()

      return cursor.rowcount

  async def log_insert_entry_async(self, entry):
    async with aiosqlite.connect(self.dbfile) as db:
      await db.execute(f'INSERT INTO logs VALUES (?, ?);', [entry['err'], entry['timestamp']])
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

      await db.execute("CREATE INDEX IF NOT EXISTS idx_timestamp_date ON sensor_data (timestamp_date);")
      await db.commit()
