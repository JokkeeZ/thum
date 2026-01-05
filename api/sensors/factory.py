import sys

def create_sensor():
  if sys.platform.startswith("linux"):
    from api.sensors.dht11 import DHT11Sensor

    print('create_sensor: created DHT11 instance.')
    return DHT11Sensor()
  else:
    from api.sensors.sensor import Sensor
    print('create_sensor: created Sensor instance.')
    return Sensor('dummy')
