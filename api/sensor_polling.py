import asyncio
import board
from datetime import datetime
from adafruit_dht import DHT11 #, DHT21, DHT22, DHTBase
from api.db.database import Database

dht = DHT11(board.D4)

async def sensor_poll(db: Database):
  while True:
    # instantly skip if we don't want to use the sensor.
    if not db.config.use_sensor:
      continue

    now = datetime.now()
    date = now.strftime(db.config.dateformat)
    time = now.strftime(db.config.timeformat)

    try:
      temp = dht.temperature
      humi = dht.humidity

      # if reading fails -> retry
      if not temp or not humi:
        await asyncio.sleep(2)
        continue

      await db.sensor_insert_entry_async(temp, humi, date, time)
      await asyncio.wait_for(
        db.config.settings_changed.wait(),
        timeout=db.config.sensor_interval
      )
    except RuntimeError as e:
      await db.log_insert_entry_async(str(e), f'{date} {time}')
      await asyncio.sleep(2)
      continue
    except asyncio.TimeoutError:
      pass
    finally:
      db.config.settings_changed.clear()

def get_sensor_reading():
  try:
    temperature = dht.temperature
    humidity = dht.humidity

    return temperature, humidity
  except RuntimeError as e:
    print(f'Error reading sensor: {e}')
    return None, None
