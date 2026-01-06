import board
from adafruit_dht import DHT22
from api.sensors.sensor import Sensor

class DHT22Sensor(Sensor):
  def __init__(self):
    self.sensor = DHT22(board.D4)

  async def read(self) -> tuple[None, None] | tuple[float, float]:
    temperature = self.sensor.temperature
    humidity = self.sensor.humidity

    if not temperature or not humidity:
      return None, None

    return float(temperature), float(humidity)
