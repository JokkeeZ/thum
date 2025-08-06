from asyncio import sleep
from datetime import datetime
from adafruit_dht import DHTBase
from db.db_thum import ThumDatabase
from thum_config import CONFIG

dht:DHTBase = CONFIG['sensor.type'](CONFIG['sensor.pin'], use_pulseio=False)
db = ThumDatabase()

def poll_sensor_data():
	try:
		(date, time) = get_timestamp()

		temperature = dht.temperature
		humidity = dht.humidity

		if temperature == None or humidity == None:
			return {
				'success': False,
				'err': f'Temperature reading: {temperature}, Humidity: {humidity}',
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

async def start_sensor_reader():
	print('Initializing the database ...')
	await db.db_initialize()

	print(f'Reading sensor data every {CONFIG["sensor.interval"]} seconds ...')
	while True:
		data = poll_sensor_data()

		if not data['success']:
			print('Error occurred. Attempting again in 2 seconds ...')
			await db.log.insert_log_entry_async(data)
			await sleep(2)
			continue

		await db.sensor.insert_sensor_entry_async(data)
		await sleep(CONFIG['sensor.interval'])
