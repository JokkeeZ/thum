import sqlite3

from calendar import monthrange
from datetime import datetime, timedelta
from flask import jsonify

import restroutes as rr

#
#
# arg is in format 0000-W00. Example: 2024-W10
def get_week_dates(year_week_num):
	first = datetime.strptime(f'{year_week_num}-1', '%Y-W%W-%w')
	return [first + timedelta(days=i) for i in range(0, 7)]

#
#
# Handles the GET request for getting weekly sensor data.
@rr.app.route('/sensor/weekly/<string:week>')
def get_sensor_data_from_date_range(week):
	temps = []
	hums = []

	with sqlite3.connect('sensordata.db') as db:
		for date in get_week_dates(week):
			(temp, hum) = db.execute('SELECT AVG(temperature), AVG(humidity) FROM sensor WHERE instr(timestamp, ?) > 0',
					   [date.strftime('%Y-%m-%d')]).fetchone()

			temps.append(temp)
			hums.append(hum)

	return jsonify({'temperatures': temps, 'humidities': hums})

#
#
# Handles the GET request for getting all of the sensor data.
@rr.app.route('/sensor')
def get_sensor_data_all():
	with sqlite3.connect('sensordata.db') as db:
		result = db.execute('SELECT * FROM sensor').fetchall()

	return jsonify([{'temperature': x[0],'humidity': x[1],'timestamp': x[2]} for x in result])

#
#
# Handles the GET request for getting monthly sensor data.
@rr.app.route('/sensor/monthly/<string:year>/<string:month>')
def get_sensor_data_from_year_month(year, month):
	(_, days) = monthrange(int(year), int(month))

	temps = []
	hums = []

	with sqlite3.connect('sensordata.db') as db:
		for i in range(1, days + 1):
			(temp, hum) = db.execute('SELECT AVG(temperature), AVG(humidity) FROM sensor WHERE instr(timestamp, ?) > 0',
					   [f'{year}-{month}-{str(i).zfill(2)}']).fetchone()

			temps.append(temp)
			hums.append(hum)

	return jsonify({'temperatures': temps, 'humidities': hums})

#
#
# Handles the GET request for getting daily sensor data.
@rr.app.route('/sensor/<string:date>')
def get_sensor_data_from_date(date):
	with sqlite3.connect('sensordata.db') as db:
		result = db.execute('SELECT * FROM sensor WHERE instr(timestamp, ?) > 0', [date]).fetchall()

	return jsonify([{'temperature': x[0],'humidity': x[1],'timestamp': x[2]} for x in result])


if __name__ == '__main__':
	rr.app.run(debug=True, host='0.0.0.0')
