import os
import asyncio
import board
from datetime import datetime
from adafruit_dht import DHT11
from api.db.database import Database

dht = DHT11(board.D4)

async def poll_loop(interval: int, db: Database):
  while True:
    now = datetime.now()
    date = now.strftime('%Y-%m-%d')
    time = now.strftime('%H:%M:%S')

    try:
      temp = dht.temperature
      hum = dht.humidity

      if temp is None or hum is None:
        await db.log_insert_entry_async(
          f'Temperature reading: {temp}, Humidity: {hum}',
          f'{date} {time}'
        )
        await asyncio.sleep(2)
        continue

      await db.sensor_insert_entry_async(temp, hum, date, time)
      print('Inserted sensor data:', temp, hum, date, time)
    except (RuntimeError, Exception) as e:
      await db.log_insert_entry_async(str(e), f'{date} {time}')
      await asyncio.sleep(2)
      continue

    await asyncio.sleep(interval)

async def get_sensor_reading():
  try:
    temperature = dht.temperature
    humidity = dht.humidity
    return temperature, humidity
  except RuntimeError as e:
    print(f'Error reading sensor: {e}')
    return None, None

async def sensor_poll():
  db_name = os.getenv('DB_FILE')
  if db_name is None:
    exit('Failed to launch: DB_FILE environment variable not set.')

  print('Initializing the database')
  db = Database(db_name)
  await db.initialize_database()

  interval = int(os.getenv('SENSOR_INTERVAL_SECONDS', 600))
  await poll_loop(interval, db)
