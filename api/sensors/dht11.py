import board
from adafruit_dht import DHT11
from api.sensors.sensor import Sensor

class DHT11Sensor(Sensor):
  def __init__(self):
    super().__init__('DHT11')
    self.sensor = DHT11(board.D4)

  async def read(self) -> tuple[None, None] | tuple[float, float]:
    temperature = self.sensor.temperature
    humidity = self.sensor.humidity

    if not temperature or not humidity:
      return None, None

    return float(temperature), float(humidity)
