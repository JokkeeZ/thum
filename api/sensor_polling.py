import asyncio
import board
from datetime import datetime
from adafruit_dht import DHT11
from api.db.database import Database

dht = DHT11(board.D4)

async def sensor_poll(db: Database):
  while True:
    now = datetime.now()
    date = now.strftime(db.config.dateformat)
    time = now.strftime(db.config.timeformat)

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

    await asyncio.sleep(db.config.sensor_interval)

async def get_sensor_reading():
  try:
    temperature = dht.temperature
    humidity = dht.humidity
    return temperature, humidity
  except RuntimeError as e:
    print(f'Error reading sensor: {e}')
    return None, None
