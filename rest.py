import sqlite3

from calendar import monthrange, day_name
from datetime import datetime, timedelta
from flask import jsonify
from restroutes import *

#
#
# Handles the GET request for getting weekly sensor data.
@app.route('/sensor/weekly/<string:week>')
def get_sensor_data_from_week(week):
	temps = []
	hums = []
	labels = [n for n in day_name]

	with sqlite3.connect(DB_FILE) as db:
		first = datetime.strptime(f'{week}-1', '%Y-W%W-%w')
		for date in [first + timedelta(days=i) for i in range(0, 7)]:
			(temp, hum) = db.execute('SELECT AVG(temperature), AVG(humidity) FROM sensor WHERE instr(timestamp, ?) > 0',
					   [date.strftime('%Y-%m-%d')]).fetchone()

			temps.append(temp)
			hums.append(hum)

	return jsonify({'labels': labels, 'temperatures': temps, 'humidities': hums})

#
#
# Handles the GET request for getting all of the sensor data.
@app.route('/sensor')
def get_sensor_data_all():
	with sqlite3.connect(DB_FILE) as db:
		result = db.execute('SELECT * FROM sensor').fetchall()

	return jsonify([{'temperatures': x[0],'humidities': x[1],'timestamp': x[2]} for x in result])

#
#
# Handles the GET request for getting monthly sensor data.
@app.route('/sensor/monthly/<string:year>/<string:month>')
def get_sensor_data_from_year_month(year, month):
	(_, days) = monthrange(int(year), int(month))

	labels = [f'{str(x).zfill(2)}.{month}.{year}' for x in range(1, days + 1)]
	temps = []
	hums = []

	with sqlite3.connect(DB_FILE) as db:
		for i in range(1, days + 1):
			(temp, hum) = db.execute('SELECT AVG(temperature), AVG(humidity) FROM sensor WHERE instr(timestamp, ?) > 0',
					   [f'{year}-{month}-{str(i).zfill(2)}']).fetchone()

			temps.append(temp)
			hums.append(hum)

	return jsonify({'labels': labels, 'temperatures': temps, 'humidities': hums})

#
#
# Handles the GET request for getting daily sensor data.
@app.route('/sensor/<string:date>')
def get_sensor_data_from_date(date):
	with sqlite3.connect(DB_FILE) as db:
		result = db.execute('SELECT * FROM sensor WHERE instr(timestamp, ?) > 0', [date]).fetchall()

	return jsonify([{'temperatures': x[0],'humidities': x[1],'timestamp': x[2]} for x in result])

@app.route('/sensor/logs/<string:timestamp>', methods=['DELETE'])
def delete_log_by_timestamp(timestamp):
	with sqlite3.connect(DB_FILE) as db:
		result = db.execute('DELETE FROM logs WHERE timestamp = ?',
		[timestamp])
		db.commit()

	return jsonify({'count': result.rowcount})

if __name__ == '__main__':
	app.run(debug=True, host='0.0.0.0')
