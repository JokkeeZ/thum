import asyncio
import board

from thum_config import ThumConfig

from aiosqlite import connect
from datetime import datetime
from adafruit_dht import DHT11

config = ThumConfig('./config.json')
dht = DHT11(board.D4, use_pulseio=False)

def poll_sensor_data():
	try:
		return {
			'success': True,
			'temp': dht.temperature,
			'hum': dht.humidity,
			'ts': get_timestamp()
		}
	except (RuntimeError, Exception) as e:
		return { 'success': False, 'err': str(e), 'ts': get_timestamp() }

def get_timestamp():
	return datetime.now().strftime(config.get('db.timeformat'))

async def db_initialize():
	async with connect(config.get('db.file')) as db:
		await db.execute('CREATE TABLE IF NOT EXISTS logs(message, timestamp)')
		await db.execute('CREATE TABLE IF NOT EXISTS sensor(temperature, humidity, timestamp)')

async def db_insert_log_entry(e):
	async with connect(config.get('db.file')) as db:
		await db.execute(f'INSERT INTO logs VALUES (?, ?)', (e['err'], e['ts']))
		await db.commit()

async def db_insert_sensor_entry(e):
	async with connect(config.get('db.file')) as db:
		await db.execute(f'INSERT INTO sensor VALUES (?, ?, ?)', (e['temp'], e['hum'], e['ts']))
		await db.commit()

async def start_reader():
	print('Loading configuration ...')
	config.load()
	print('Initializing the database ...')
	await db_initialize()

	print(f'Reading sensor data every {config.get("sensor.interval")}ms ...')
	while True:
		data = poll_sensor_data()

		# Incase sensor reading fails, add log of
		# the error that occurred to the database
		# and jump back to the start of the loop;
		# not waiting the config.get('sensor.interval') ms for new reading.
		if not data['success']:
			print('OOPS, error occurred. Attempting again ...')
			await db_insert_log_entry(data)
			continue

		await db_insert_sensor_entry(data)
		await asyncio.sleep(config.get('sensor.interval'))
