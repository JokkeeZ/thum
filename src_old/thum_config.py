import board
import adafruit_dht

#
# Thum settings
#
CONFIG:dict = {

  # Name and/or path for the database file
	'db.file': 					'sensordata.db',

  # Specifies in what format will data be saved and displayed
	'db.dateformat': 		'%Y-%m-%d',

  # Specifies in what format will data be saved and displayed
	'db.timeformat': 		'%H:%M:%S',

  # How often should sensor_reader read values from the sensor
  #	Value is in milliseconds
	'sensor.interval': 	600,

  # Specifies the pin which sensor is connected to
	'sensor.pin': 			board.D4,

  # What DHT sensor is used
	'sensor.type':			adafruit_dht.DHT11, # DHT22, DHT21

	# App hosting ip address
	'app.host': 				'0.0.0.0',

	# App hosting port
	'app.port': 				5000,

  # Specifies if Quart is started with debug mode
	'app.debug': 				True,
}
