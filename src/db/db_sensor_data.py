import calendar
from datetime import datetime, timedelta
from aiosqlite import Row, connect
from thum_config import CONFIG

class DatabaseSensorData:
	def __init__(self):
		self.dbfile:str = CONFIG['db.file']
		self.dateformat:str = CONFIG['db.dateformat']
		self.timeformat:str = CONFIG['db.timeformat']

	async def get_all_async(self) -> dict[any, dict[str, any]]:
		async with connect(self.dbfile) as db:
			cursor = await db.execute("""
				SELECT timestamp_date, AVG(temperature) AS avg_temp, AVG(humidity) AS avg_hum
				FROM sensor_data
				GROUP BY timestamp_date;
			""")

			result = await cursor.fetchall()
		return {row[0]: {'temperature': row[1], 'humidity': row[2]} for row in result}

	async def get_year_month_async(self, year: str, month: str) -> dict[str, list[any]]:
		(_, days) = calendar.monthrange(int(year), int(month))

		start_date = f'{year}-{month}-01'
		end_date = f'{year}-{month}-{str(days).zfill(2)}'

		async with connect(self.dbfile) as db:
			cursor = await db.execute("""
				SELECT strftime('%d', timestamp_date) AS day, AVG(temperature) AS avg_temp, AVG(humidity) AS avg_hum
				FROM sensor_data
				WHERE timestamp_date BETWEEN ? AND ?
				GROUP BY day
				ORDER BY day;
			""", [start_date, end_date])

			result = await cursor.fetchall()

		temps = []
		hums = []
		for row in result:
			temps.append(row[1])
			hums.append(row[2])

		return {
			'labels': [f'{str(x).zfill(2)}.{month}.{year}' for x in range(1, days + 1)],
			'temperatures': temps,
			'humidities': hums
		}

	async def get_week_async(self, week: str) -> dict[str, any]:
		temps = []
		hums = []

		async with connect(self.dbfile) as db:
			first = datetime.strptime(f'{week}-1', '%Y-W%W-%w')

			for date in [first + timedelta(days=i) for i in range(0, 7)]:
				cursor = await db.execute("""
					SELECT AVG(temperature), AVG(humidity)
					FROM sensor_data
					WHERE timestamp_date = ?;
				""", [date.strftime('%Y-%m-%d')])

				(temp, hum) = await cursor.fetchone()

				temps.append(temp)
				hums.append(hum)

		return {
			'labels': [n for n in calendar.day_name],
			'temperatures': temps,
			'humidities': hums
		}

	async def get_date_async(self, date: str) -> list[dict[str, any]]:
		async with connect(self.dbfile) as db:
			cursor = await db.execute("""
			SELECT temperature, humidity, timestamp_time
			FROM sensor_data
			WHERE timestamp_date = ?;
			""", [date])

			rows = await cursor.fetchall()

		return [{'temperature': row[0], 'humidity': row[1], 'timestamp': row[2]} for row in rows]

	async def get_date_range_async(self) -> tuple[str, str]:
		async with connect(self.dbfile) as db:
			cursor = await db.execute('SELECT MIN(timestamp_date), MAX(timestamp_date) FROM sensor_data;')
			(min, max) = await cursor.fetchone()

		now = datetime.now()
		min_date = (now.strftime(self.dateformat) if min is None else min)
		max_date = (now.strftime(self.dateformat) if max is None else max)
		return (min_date, max_date)

	async def get_week_range_async(self) -> tuple[str, str]:
		async with connect(self.dbfile) as db:
			cursor = await db.execute('SELECT MIN(timestamp_date), MAX(timestamp_date) FROM sensor_data;')
			(min, max) = await cursor.fetchone()

		now = datetime.now()
		min_week = (now.strftime('%Y-W%W') if min is None else datetime.strptime(min, self.dateformat).strftime('%Y-W%W'))
		max_week = (now.strftime('%Y-W%W') if max is None else datetime.strptime(max, self.dateformat).strftime('%Y-W%W'))
		return (min_week, max_week)

	async def get_month_range_async(self) -> tuple[str, str]:
		async with connect(self.dbfile) as db:
			cursor = await db.execute('SELECT MIN(timestamp_date), MAX(timestamp_date) FROM sensor_data;')
			(min, max) = await cursor.fetchone()

		now = datetime.now()
		min_month = (now.strftime('%Y-%m') if min is None else datetime.strptime(min, self.dateformat).strftime('%Y-%m'))
		max_month = (now.strftime('%Y-%m') if max is None else datetime.strptime(max, self.dateformat).strftime('%Y-%m'))
		return (min_month, max_month)

	async def get_statistics_async(self) -> tuple[Row, Row, Row]:
		async with connect(self.dbfile) as db:
			cursor = await db.execute("""
			SELECT
				COUNT(*),
				MIN(timestamp_date),
				MAX(timestamp_date),
				AVG(temperature),
				AVG(humidity),
				(SELECT timestamp_date
				FROM sensor_data
				WHERE temperature = (SELECT MIN(temperature) FROM sensor_data)
				ORDER BY timestamp_date LIMIT 1),
				(SELECT temperature
				FROM sensor_data
				WHERE temperature = (SELECT MIN(temperature) FROM sensor_data)
				ORDER BY timestamp_date LIMIT 1),
				(SELECT humidity
				FROM sensor_data
				WHERE temperature = (SELECT MIN(temperature) FROM sensor_data)
				ORDER BY timestamp_date LIMIT 1),
				(SELECT timestamp_date
				FROM sensor_data
				WHERE temperature = (SELECT MAX(temperature) FROM sensor_data)
				ORDER BY timestamp_date LIMIT 1),
				(SELECT temperature
				FROM sensor_data
				WHERE temperature = (SELECT MAX(temperature) FROM sensor_data)
				ORDER BY timestamp_date LIMIT 1),
				(SELECT humidity
				FROM sensor_data
				WHERE temperature = (SELECT MAX(temperature) FROM sensor_data)
				ORDER BY timestamp_date LIMIT 1)
			FROM sensor_data;
			""")

			data = await cursor.fetchone()
			return {
				"count": data[0],
				"first_date": data[1],
				"last_date": data[2],
				"avg_temperature": data[3],
				"avg_humidity": data[4],
				"coldest_day": {
					"date": data[5],
					"temperature": data[6],
					"humidity": data[7]
				},
				"warmest_day": {
					"date": data[8],
					"temperature": data[9],
					"humidity": data[10]
				}
			}
