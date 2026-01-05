import asyncio
from typing import Optional
from api.db.database import Database
from api.sensors.sensor_poll import SensorPoll
from api.sensors.factory import create_sensor

class SensorService:
  def __init__(self):
    self._task: Optional[asyncio.Task] = None
    self.sensor_poll: Optional[SensorPoll] = None

  def is_running(self) -> bool:
    return self._task is not None and not self._task.done()

  def init_sensor(self):
    self.sensor_poll = SensorPoll(create_sensor())
    print('sensor_service(init_sensor): sensor initialized.')

  async def start(self, db: Database):
    if self.is_running():
      print('sensor_service(start): already running; failed to start.')
      return

    if not self.sensor_poll:
      print('sensor_service(start): sensor_poll is None.')
      return

    self._task = asyncio.create_task(self.sensor_poll.poll(db))
    print('sensor_service(start): task created.')

  async def stop(self):
    if not self.is_running():
      print('sensor_service(stop): not running; failed to stop.')
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
