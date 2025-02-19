import asyncio
from aiosqlite import connect
from datetime import datetime
from adafruit_dht import DHTBase
from thum_config import CONFIG

dht:DHTBase = CONFIG['sensor.type'](CONFIG['sensor.pin'], use_pulseio=False)

def poll_sensor_data():
	try:
		(date, time) = get_timestamp()

		temperature = dht.temperature
		humidity = dht.humidity

		if temperature == None or humidity == None:
			return {
				'success': False,
				'err': 'Temperature reading: {temperature}, Humidity: {humidity}',
				'timestamp': f'{date} {time}'
			}

		return {
			'success': True,
			'temperature': temperature,
			'humidity': humidity,
			'timestamp_date': date,
			'timestamp_time': time
		}
	except (RuntimeError, Exception) as e:
		return { 'success': False, 'err': str(e), 'timestamp': f'{date} {time}'}

def get_timestamp():
	dt = datetime.now()
	return (dt.strftime(CONFIG['db.dateformat']), dt.strftime(CONFIG['db.timeformat']))

async def db_initialize():
	async with connect(CONFIG['db.file']) as db:
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

async def db_insert_log_entry(entry):
	async with connect(CONFIG['db.file']) as db:
		await db.execute(f'INSERT INTO logs VALUES (?, ?);', (entry['err'], entry['timestamp']))
		await db.commit()

async def db_insert_sensor_entry(entry):
	async with connect(CONFIG['db.file']) as db:
		await db.execute("""
			INSERT INTO sensor_data(temperature, humidity, timestamp_date, timestamp_time) VALUES (?, ?, ?, ?);
		""",
		(
			entry['temperature'],
			entry['humidity'],
			entry['timestamp_date'],
			entry['timestamp_time'])
		)
		await db.commit()

async def start_sensor_reader():
	print('Initializing the database ...')
	await db_initialize()

	print(f'Reading sensor data every {CONFIG["sensor.interval"]} seconds ...')
	while True:
		data = poll_sensor_data()

		# Incase sensor reading fails, add log of the error that occurred to the database
		# the error that occurred to the database and jump back to the start of the loop;
		# not waiting the config.get('sensor.interval') ms for new reading.
		#
		# Same goes if temperature or humidity is None; just try again, since we want
		# both of those readings to be inserted in to the database.
		if not data['success']:
			print('OOPS, error occurred. Attempting again in 2 seconds...')
			await db_insert_log_entry(data)
			continue

		await db_insert_sensor_entry(data)
		await asyncio.sleep(CONFIG['sensor.interval'])
