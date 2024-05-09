import time
import sqlite3
import board

from datetime import datetime
from adafruit_dht import DHT11

dht = DHT11(board.D4)

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
	return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

def db_initialize():
	with sqlite3.connect('sensordata.db') as db:
		db.execute('CREATE TABLE IF NOT EXISTS logs(message, timestamp)')
		db.execute('CREATE TABLE IF NOT EXISTS sensor(temperature, humidity, timestamp)')

def db_insert_log_entry(e):
	with sqlite3.connect('sensordata.db') as db:
		db.execute(f'INSERT INTO logs VALUES (?, ?)', (e['err'], e['ts']))
		db.commit()

def db_insert_sensor_entry(e):
	with sqlite3.connect('sensordata.db') as db:
		db.execute(f'INSERT INTO sensor VALUES (?, ?, ?)', (e['temp'], e['hum'], e['ts']))
		db.commit()

print('Initializing the database ...')
db_initialize()

print('Reading sensor data ever 600ms ...')
while True:
	data = poll_sensor_data()

	# Incase sensor reading fails, add log of
	# the error that occurred to the database
	# and jump back to the start of the loop;
  # not waiting the 600ms for new reading.
	if not data['success']:
		print('OOPS, error occurred. Attempting again ...')
		db_insert_log_entry(data)
		continue

	db_insert_sensor_entry(data)
	time.sleep(600)
