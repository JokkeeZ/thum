import asyncio
import sys
from typing import Optional
from api.db.database import Database
from api.sensors.sensor import Sensor
from api.sensors.sensor_poll import SensorPoll

class SensorService:
  def __init__(self):
    self._task: Optional[asyncio.Task] = None
    self.sensor_poll: Optional[SensorPoll] = None

  def is_running(self) -> bool:
    return self._task is not None and not self._task.done()

  def init_sensor(self):
    sensor: Sensor

    # TODO: impl DHT21, DHT22
    if sys.platform.startswith("linux"):
      from api.sensors.dht11 import DHT11Sensor
      sensor = DHT11Sensor()
    else:
      from api.sensors.dummy import Dummy
      sensor = Dummy()

    self.sensor_poll = SensorPoll(sensor)
    print(f'sensor_service(init_sensor): sensor "{sensor.__class__.__name__}" initialized.')

  def start(self, db: Database):
    if self.is_running():
      print('sensor_service(start): already running')
      return

    if not self.sensor_poll:
      print('sensor_service(start): sensor_poll is None.')
      return

    self._task = asyncio.create_task(self.sensor_poll.poll(db))
    print('sensor_service(start): task created.')

  async def stop(self):
    if not self.is_running():
      print('sensor_service(stop): not running')
      return

    if self._task is not None:
      self._task.cancel()
      print('sensor_service(stop): task canceled.')

      try:
        await self._task
      except asyncio.CancelledError:
        pass
      finally:
        self._task = None
