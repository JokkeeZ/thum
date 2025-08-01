import calendar
from datetime import datetime, timedelta
from aiosqlite import Row, connect
from thum_config import CONFIG

class DatabaseSensorData:
	def __init__(self):
		self.dbfile:str = CONFIG['db.file']
		self.dateformat:str = CONFIG['db.dateformat']
		self.timeformat:str = CONFIG['db.timeformat']

		self.wformat = '%G-W%V'
		self.mformat = '%Y-%m'
		self.iso_w_format = '%G-W%V-%u'

	async def get_all_async(self) -> dict[any, dict[str, any]]:
		async with connect(self.dbfile) as db:
			cursor = await db.execute("""
				SELECT timestamp_date, AVG(temperature) AS avg_temp, AVG(humidity) AS avg_hum
				FROM sensor_data
				GROUP BY timestamp_date;
			""")

			result = await cursor.fetchall()
		return {row[0]: {'temperature': row[1], 'humidity': row[2]} for row in result}

	async def get_year_month_async(self, year: int, month: int) -> dict[str, list[any]]:
		(_, days) = calendar.monthrange(year, month)

		start_date = datetime(year, month, 1).strftime(CONFIG['db.dateformat'])
		end_date = datetime(year, month, days).strftime(CONFIG['db.dateformat'])

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

		for i in range(1, days + 1):
			day_str = str(i).zfill(2)
			row = next((row for row in result if row[0] == day_str), None)

			if row:
				temps.append(row[1])
				hums.append(row[2])
			else:
				temps.append(None)
				hums.append(None)

		return {
			'labels': [datetime(year, month, day).strftime(CONFIG['db.dateformat']) for day in range(1, days + 1)],
			'temperatures': temps,
			'humidities': hums
		}

	async def get_week_async(self, week: str) -> dict[str, any]:
		first = datetime.strptime(f'{week}-1', self.iso_w_format)
		dates = [(first + timedelta(days=i)).strftime(CONFIG['db.dateformat']) for i in range(7)]

		async with connect(self.dbfile) as db:
			cursor = await db.execute(f"""
			SELECT timestamp_date, AVG(temperature), AVG(humidity)
			FROM sensor_data
			WHERE timestamp_date BETWEEN ? AND ?
			GROUP BY timestamp_date
			ORDER BY timestamp_date;
			""", [dates[0], dates[-1]])

			results = {row[0]: (row[1], row[2]) for row in await cursor.fetchall()}

		return {
			'labels': list(calendar.day_name),
			'temperatures': [results.get(date, (None, None))[0] for date in dates],
			'humidities': [results.get(date, (None, None))[1] for date in dates]
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
		min_week = (now.strftime(self.wformat) if min is None else datetime.strptime(min, self.dateformat).strftime(self.wformat))
		max_week = (now.strftime(self.wformat) if max is None else datetime.strptime(max, self.dateformat).strftime(self.wformat))
		return (min_week, max_week)

	async def get_month_range_async(self) -> tuple[str, str]:
		async with connect(self.dbfile) as db:
			cursor = await db.execute('SELECT MIN(timestamp_date), MAX(timestamp_date) FROM sensor_data;')
			(min, max) = await cursor.fetchone()

		now = datetime.now()
		min_month = (now.strftime(self.mformat) if min is None else datetime.strptime(min, self.dateformat).strftime(self.mformat))
		max_month = (now.strftime(self.mformat) if max is None else datetime.strptime(max, self.dateformat).strftime(self.mformat))
		return (min_month, max_month)

	async def insert_sensor_entry_async(self, entry):
		async with connect(self.dbfile) as db:
			await db.execute("""
			INSERT INTO sensor_data(temperature, humidity, timestamp_date, timestamp_time) VALUES (?, ?, ?, ?);
			""", (
				entry['temperature'],
				entry['humidity'],
				entry['timestamp_date'],
				entry['timestamp_time'])
			)

			await db.commit()

	async def get_statistics_async(self) -> tuple[Row, Row, Row]:
		async with connect(self.dbfile) as db:
			cursor = await db.execute("""
			SELECT
					COUNT(*),
					MIN(sd.timestamp_date),
					MAX(sd.timestamp_date),
					AVG(sd.temperature),
					AVG(sd.humidity),
					min_temp.timestamp_date,
					min_temp.temperature,
					min_temp.humidity,
					max_temp.timestamp_date,
					max_temp.temperature,
					max_temp.humidity
			FROM sensor_data sd
			CROSS JOIN (
					SELECT timestamp_date, temperature, humidity
					FROM sensor_data
					ORDER BY temperature ASC, timestamp_date ASC
					LIMIT 1
			) AS min_temp
			CROSS JOIN (
					SELECT timestamp_date, temperature, humidity
					FROM sensor_data
					ORDER BY temperature DESC, timestamp_date ASC
					LIMIT 1
			) AS max_temp;
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
