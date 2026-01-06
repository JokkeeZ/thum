import asyncio
from datetime import datetime
from api.db.database import Database
from api.sensors.sensor import Sensor

class SensorPoll:
  def __init__(self, sensor: Sensor):
    self.sensor = sensor

  async def poll(self, db: Database):
    while True:
      # instantly skip if we don't want to use the sensor.
      if not db.config.use_sensor:
        continue

      # we can skip polling if sensor is dummy dum dum
      if self.sensor.name == 'dummy':
        await asyncio.sleep(2)
        continue

      now = datetime.now()
      date = now.strftime(db.config.dateformat)
      time = now.strftime(db.config.timeformat)

      try:
        temp, humi = await self.sensor.read()

        # if reading fails -> retry
        if not temp or not humi:
          await asyncio.sleep(2)
          continue

        await db.insert_sensor_entry_async(temp, humi, date, time)
        await asyncio.wait_for(
          db.config.settings_changed.wait(),
          timeout=db.config.sensor_interval
        )
      except RuntimeError as e:
        await db.insert_log_entry_async(str(e), f'{date} {time}')
        await asyncio.sleep(2)
        continue
      except asyncio.TimeoutError:
        pass
      finally:
        db.config.settings_changed.clear()

  async def get_sensor_reading(self) -> tuple[float, float] | tuple[None, None]:
    try:
      temp, humi = await self.sensor.read()

      if temp is not None and humi is not None:
        return float(temp), float(humi)

      return None, None
    except RuntimeError as e:
      print(f'Error reading sensor: {e}')
      return None, None
