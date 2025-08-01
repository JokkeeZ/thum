from quart import Quart, render_template, jsonify, send_file
from db.db_thum import ThumDatabase
from thum_config import CONFIG
import sensor_reader as sensor_reader

app = Quart(__name__)
db = ThumDatabase()

@app.route('/api/sensor/all')
async def get_sensor_all_data():
	all_values = await db.sensor.get_all_async()
	return jsonify(all_values)

@app.route('/api/sensor/monthly/<int:year>/<int:month>')
async def get_sensor_data_from_year_month(year, month):
	try:
		monthly_values = await db.sensor.get_year_month_async(year, month)
		return jsonify(monthly_values)
	except Exception as e:
		return jsonify({'success': False, 'message': str(e)})

@app.route('/api/sensor/weekly/<string:week>')
async def get_sensor_data_from_week(week):
	try:
		weekly_data = await db.sensor.get_week_async(week)
		return jsonify(weekly_data)
	except Exception as e:
		return jsonify({'success': False, 'message': str(e)})

@app.route('/api/sensor/daily/<string:date>')
async def get_sensor_data_from_date(date):
	try:
		daily_data = await db.sensor.get_date_async(date)
		return jsonify(daily_data)
	except Exception as e:
		return jsonify({'success': False, 'message': str(e)})

@app.route('/api/logs/delete-entry/<string:timestamp>', methods=['DELETE'])
async def delete_log_by_timestamp(timestamp):
	try:
		result_count = await db.log.delete_by_timestamp_async(timestamp)
		return jsonify({'count': result_count})
	except Exception as e:
		return jsonify({'success': False, 'message': str(e)})

@app.route('/api/logs/purge', methods=['DELETE'])
async def delete_logs_all():
	result_count = await db.log.delete_all_async()
	return jsonify({'count': result_count})

@app.route('/api/sensor/range/<string:start_date>/<string:end_date>')
async def get_sensor_data_range(start_date, end_date):
	try:
		range_data = await db.sensor.get_data_range_async(start_date, end_date)
		return jsonify(range_data)
	except Exception as e:
		return jsonify({'success': False, 'message': str(e)})

@app.route('/api/tools/database/backup')
async def thum_backup_db():
	file_path = await db.thum_make_db_backup_async()
	return jsonify({'success': file_path != None, 'path': file_path})

@app.route('/api/tools/database/optimize')
async def thum_optimize_db():
	success = await db.optimize_async()
	return jsonify({'success': success})

@app.route('/api/statistics')
async def get_sensor_statistics():
	try:
		stats = await db.sensor.get_statistics_async()
		return jsonify(stats)
	except Exception as e:
		return jsonify({'success': False, 'message': str(e)})

@app.route('/api/sensor/temperature/current')
async def get_sensor_data_current():
	try:
		temp = sensor_reader.dht.temperature
		hum = sensor_reader.dht.humidity

		if temp is not None and hum is not None:
			return jsonify({'success': True, 'temperature': temp, 'humidity': hum})

		return jsonify({'success': False})

	except (RuntimeError, Exception):
		return jsonify({'success': False})

@app.route('/api/tools/database/backup/download')
async def download_backup():
	file_path = await db.thum_make_db_backup_async()

	if not file_path:
		return jsonify({'success': False, 'path': None})

	return await send_file(file_path,
		'application/vnd.sqlite3',
		as_attachment=True,
		attachment_filename=file_path.split('/')[1])

@app.route('/')
async def index():
	return await render_template('index.html')

@app.route('/daily')
async def daily():
	(min_date, max_date) = await db.sensor.get_date_range_async()
	return await render_template('daily.html', Min=min_date, Max=max_date)

@app.route('/range')
async def range():
	(min_date, max_date) = await db.sensor.get_date_range_async()
	return await render_template('range.html', Min=min_date, Max=max_date)

@app.route('/weekly')
async def weekly():
	(min_week, max_week) = await db.sensor.get_week_range_async()
	return await render_template('weekly.html', Min=min_week, Max=max_week)

@app.route('/monthly')
async def monthly():
	(min_month, max_month) = await db.sensor.get_month_range_async()
	return await render_template('monthly.html', Min=min_month, Max=max_month)

@app.route('/tools')
async def tools():
	return await render_template('tools.html')

@app.route('/logs')
async def logs():
	all_logs = await db.log.get_all_async()
	return await render_template('logs.html', Logs=all_logs)

@app.route('/api')
async def api():
	routes = [(r.rule, [m for m in r.methods if m not in {'HEAD', 'OPTIONS'}])
		for r in app.url_map.iter_rules() if r.rule.startswith('/api/')]

	return await render_template('api.html', Routes=routes)

async def start_server():
	await app.run_task(host=CONFIG['app.host'], port=CONFIG['app.port'], debug=CONFIG['app.debug'])
