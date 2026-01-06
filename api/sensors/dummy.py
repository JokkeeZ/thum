from api.sensors.sensor import Sensor

class Dummy(Sensor):
  async def read(self) -> tuple[None, None] | tuple[float, float]:
    return None, None
