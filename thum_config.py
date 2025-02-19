import board
import adafruit_dht

#
# Thum settings
#
CONFIG:dict = {

	#
	# Database specific settings
  #
	'db.file': 					'sensordata.db',
	'db.dateformat': 		'%Y-%m-%d',
	'db.timeformat': 		'%H:%M:%S',

	#
  # Sensor specific settings
  #
	'sensor.interval': 	600,
	'sensor.pin': 			board.D4,
	'sensor.type':			adafruit_dht.DHT11, # DHT22, DHT21

	#
  # App specific settings
  #
	'app.host': 				'0.0.0.0',
	'app.port': 				5000,
	'app.debug': 				True,
  'app.locale':				'en'
}
