import asyncio
import board

from thum_config import ThumConfig

from aiosqlite import connect
from datetime import datetime
from adafruit_dht import DHT11

cfg = ThumConfig('./config.json')
dht = DHT11(board.D4, use_pulseio=False)

def poll_sensor_data():
  try:
    (date, time) = get_timestamp()

    return {
      'success': True,
      'temperature': dht.temperature,
      'humidity': dht.humidity,
      'timestamp_date': date,
      'timestamp_time': time
    }
  except (RuntimeError, Exception) as e:
    return { 'success': False, 'err': str(e), 'timestamp': f'{date} {time}'}

def get_timestamp():
	dt = datetime.now()
	return (dt.strftime(cfg.get('db.dateformat')), dt.strftime(cfg.get('db.timeformat')))

async def db_initialize():
	async with connect(cfg.get('db.file')) as db:
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

async def db_insert_log_entry(entry):
	async with connect(cfg.get('db.file')) as db:
		await db.execute(f'INSERT INTO logs VALUES (?, ?);', (entry['err'], entry['timestamp']))
		await db.commit()

async def db_insert_sensor_entry(entry):
	async with connect(cfg.get('db.file')) as db:
		await db.execute("""
			INSERT INTO sensor_data(temperature, humidity, timestamp_date, timestamp_time) VALUES (?, ?, ?, ?);
		""",
		(
			entry['temperature'],
			entry['humidity'],
			entry['timestamp_date'],
			entry['timestamp_time'])
		)

async def main():
	print('Loading configuration ...')
	cfg.load()
	print('Initializing the database ...')
	await db_initialize()

	print(f'Reading sensor data every {cfg.get("sensor.interval")} seconds ...')
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
		await asyncio.sleep(cfg.get('sensor.interval'))

if __name__ == '__main__':
	asyncio.run(main())
