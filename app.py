from os import path
from shutil import copyfile
from pathlib import Path
from calendar import monthrange, day_name
from sqlite3 import connect
from flask import Flask, render_template, jsonify, request, send_file
from datetime import datetime as dt, timedelta

app = Flask(__name__)

TITLE = 'Apartment Temperature And Humidity'
ROUTE_NAMES = {
	'/': 'All',
	'/monthly': 'Monthly',
	'/weekly': 'Weekly',
	'/daily': 'Daily',
	'/logs': 'Logs',
	'/commands': 'Commands'
}

DB_FILE = 'sensordata.db'

@app.route('/sensor/weekly/<string:week>')
def get_sensor_data_from_week(week):
	temps = []
	hums = []

	with connect(DB_FILE) as db:
		first = dt.strptime(f'{week}-1', '%Y-W%W-%w')
		for date in [first + timedelta(days=i) for i in range(0, 7)]:
			(temp, hum) = db.execute('SELECT AVG(temperature), AVG(humidity) FROM sensor WHERE instr(timestamp, ?) > 0',
					   [date.strftime('%Y-%m-%d')]).fetchone()

			temps.append(temp)
			hums.append(hum)

	return jsonify({
		'labels': [n for n in day_name],
		'temperatures': temps,
		'humidities': hums})

@app.route('/sensor')
def get_expr():
	dates = {}
	with connect(DB_FILE) as db:
		result = db.execute('SELECT timestamp FROM sensor').fetchall()

	for date in result:
		datet = dt.strptime(date[0], '%Y-%m-%d %H:%M:%S')
		x = dt.strftime(datet, '%Y-%m-%d')
		if x not in dates.keys():
			dates[x] = {'temp': [], 'hum': []}

			for i in range(0, 4):
				(temp, hum) = query_between_times(x, datet, [i*6,0,0], [5+(i*6),59,59])
				dates[x]['temp'].append(temp)
				dates[x]['hum'].append(hum)

	return jsonify(dates)

@app.route('/sensor/monthly/<string:year>/<string:month>')
def get_sensor_data_from_year_month(year, month):
	(_, days) = monthrange(int(year), int(month))
	temps = []
	hums = []

	with connect(DB_FILE) as db:
		for i in range(1, days + 1):
			(temp, hum) = db.execute('SELECT AVG(temperature), AVG(humidity) FROM sensor WHERE instr(timestamp, ?) > 0',
					   [f'{year}-{month}-{str(i).zfill(2)}']).fetchone()

			temps.append(temp)
			hums.append(hum)

	return jsonify({
		'labels': [f'{str(x).zfill(2)}.{month}.{year}' for x in range(1, days + 1)],
		'temperatures': temps,
		'humidities': hums})

@app.route('/sensor/<string:date>')
def get_sensor_data_from_date(date):
	with connect(DB_FILE) as db:
		result = db.execute('SELECT * FROM sensor WHERE instr(timestamp, ?) > 0', [date]).fetchall()

	return jsonify([{'temperatures': x[0],'humidities': x[1],'timestamp': x[2]} for x in result])

@app.route('/sensor/logs/<string:timestamp>', methods=['DELETE'])
def delete_log_by_timestamp(timestamp):
	with connect(DB_FILE) as db:
		result = db.execute('DELETE FROM logs WHERE timestamp = ?',
		[timestamp])
		db.commit()

	return jsonify({'count': result.rowcount})

@app.route('/sensor/logs/all', methods=['DELETE'])
def delete_logs_all():
	with connect(DB_FILE) as db:
		result = db.execute('DELETE FROM logs')
		db.commit()

	return jsonify({'count': result.rowcount})

def thum_make_db_backup():
	ts = dt.now().strftime('%Y-%m-%d_%H:%M:%S')
	Path('backup').mkdir(parents=True, exist_ok=True)

	dest = copyfile(DB_FILE, f'backup/sensordata_{ts}.db')
	return {'success': path.isfile(dest), 'path': dest}

@app.route('/sensor/database/backup')
def thum_backup_db():
	return jsonify(thum_make_db_backup())

@app.route('/sensor/database/optimize')
def thum_optimize_db():
	with connect(DB_FILE) as db:
		result = db.execute('VACUUM;')

	return jsonify({'success': result.rowcount > 0})

@app.route('/sensor/database/empty')
def thum_empty_db():
	with connect(DB_FILE) as db:
		result = db.execute('DELETE FROM sensor')
		db.commit();
		result1 = db.execute('DELETE FROM logs')
		db.commit()

	return jsonify({'sensor_count': result.rowcount, 'logs_count': result1.rowcount})

def query_between_times(date, ts, start, end):
	with connect(DB_FILE) as db:
		(temp, hum) = db.execute('SELECT AVG(temperature), AVG(humidity) FROM sensor WHERE instr(timestamp, ?) > 0 AND timestamp >= ? AND timestamp <= ?',
			[date,
			ts.replace(hour=start[0], minute=start[1],second=start[2]),
			ts.replace(hour=end[0], minute=end[1],second=end[2])]).fetchone()

	return (temp, hum)

@app.template_global()
def title():
	return TITLE

@app.template_global()
def get_navbar_items():
	links = []

	for rule in app.url_map.iter_rules():
		if not rule.rule.startswith('/sensor') and not rule.rule.startswith('/static/'):
			links.append({'path': rule.rule, 'text': ROUTE_NAMES[rule.rule], 'active': rule.rule == request.path})

	return links

@app.route('/')
def route_index():
	return render_template('index.html')

@app.route('/commands')
def route_commands():
	with connect(DB_FILE) as db:
		data = db.execute('SELECT COUNT(*), MIN(timestamp), MAX(timestamp), AVG(temperature), AVG(humidity) FROM sensor').fetchone()
		ldata = db.execute('SELECT COUNT(*), MAX(timestamp) FROM logs').fetchone()

	return render_template('commands.html', Data = data, LogData = ldata)

@app.route('/daily')
def route_daily():
	with connect(DB_FILE) as db:
		(mi, ma) = db.execute('SELECT MIN(timestamp), MAX(timestamp) FROM sensor').fetchone()

	if mi is None or ma is None:
		min = max = dt.now().strftime('%Y-%m-%d')
	else:
		min = dt.strptime(mi, '%Y-%m-%d %H:%M:%S').strftime('%Y-%m-%d')
		max = dt.strptime(ma, '%Y-%m-%d %H:%M:%S').strftime('%Y-%m-%d')

	return render_template('daily.html', Min = min, Max = max)

@app.route('/weekly')
def route_weekly():
	with connect(DB_FILE) as db:
		(mi, ma) = db.execute('SELECT MIN(timestamp), MAX(timestamp) FROM sensor').fetchone()

	if mi is None or ma is None:
		print('hereee')
		min = max = dt.now().strftime('%Y-W%W')
	else:
		print('here')
		min = dt.strptime(mi, '%Y-%m-%d %H:%M:%S').strftime('%Y-W%W')
		max = dt.strptime(ma, '%Y-%m-%d %H:%M:%S').strftime('%Y-W%W')

	return render_template('weekly.html', Min = min, Max = max)

@app.route('/monthly')
def route_monthly():
	with connect(DB_FILE) as db:
		(mi, ma) = db.execute('SELECT MIN(timestamp), MAX(timestamp) FROM sensor').fetchone()

	if mi is None or ma is None:
		min = max = dt.now().strftime('%Y-%m')
	else:
		min = dt.strptime(mi, '%Y-%m-%d %H:%M:%S').strftime('%Y-%m')
		max = dt.strptime(ma, '%Y-%m-%d %H:%M:%S').strftime('%Y-%m')

	return render_template('monthly.html', Min = min, Max = max)

@app.route('/logs')
def route_logs():
	with connect(DB_FILE) as db:
		result = db.execute('SELECT * FROM logs').fetchall()
		return render_template('logs.html', Logs = result)

@app.route('/sensor/database/backup/download')
def download_backup():
	resp = thum_make_db_backup()

	if not resp['success']:
		return jsonify(resp)

	return send_file(resp['path'],
				  'application/vnd.sqlite3',
					as_attachment=True,
					download_name=resp['path'].split('/')[1])

if __name__ == '__main__':
	app.run(debug=True, host='0.0.0.0')
