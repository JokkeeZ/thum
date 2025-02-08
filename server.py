from asyncio import sleep
from quart import Quart, render_template, jsonify, send_file
from db.db_thum import ThumDatabase
import sensor_reader
from thum_config import ThumConfig

app = Quart(__name__)
cfg:ThumConfig = ThumConfig('config.json')
cfg.load()

db:ThumDatabase = ThumDatabase(cfg)

@app.route('/sensor')
async def get_sensor_all_data():
	all_values = await db.sensor.get_all_async()
	return jsonify(all_values)

@app.route('/sensor/monthly/<string:year>/<string:month>')
async def get_sensor_data_from_year_month(year, month):
  monthly_values = await db.sensor.get_year_month_async(year, month)
  return jsonify(monthly_values)

@app.route('/sensor/weekly/<string:week>')
async def get_sensor_data_from_week(week):
	weekly_data = await db.sensor.get_week_async(week)
	return jsonify(weekly_data)

@app.route('/sensor/daily/<string:date>')
async def get_sensor_data_from_date2(date):
	daily_data = await db.sensor.get_date_async(date)
	return jsonify(daily_data)

@app.route('/sensor/logs/<string:timestamp>', methods=['DELETE'])
async def delete_log_by_timestamp(timestamp):
	result_count = await db.log.delete_by_timestamp_async(timestamp)
	return jsonify({'count': result_count})

@app.route('/sensor/logs/all', methods=['DELETE'])
async def delete_logs_all():
	result_count = await db.log.delete_all_async()
	return jsonify({'count': result_count})

@app.route('/sensor/database/backup')
async def thum_backup_db():
	file_path = await db.thum_make_db_backup_async()
	return jsonify({'success': file_path != None, 'path': file_path})

@app.route('/sensor/database/optimize')
async def thum_optimize_db():
	success = await db.optimize_async()
	return jsonify({'success': success})

@app.route('/sensor/database/empty')
async def thum_empty_db():
	(sensor_rows_deleted, log_rows_deleted) = await db.empty_all_tables_async()
	return jsonify({'sensor_count': sensor_rows_deleted, 'logs_count': log_rows_deleted})

@app.route('/')
async def index():
	return await render_template('index.html')

@app.route('/daily')
async def daily():
	(min_date, max_date) = await db.sensor.get_date_range_async()
	return await render_template('daily.html', Min=min_date, Max=max_date)

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
	(data, coldest, warmest) = await db.sensor.get_summary_async()
	return await render_template('tools.html', Data = data, ColdestData = coldest, HottestData = warmest)

@app.route('/logs')
async def logs():
	all_logs = await db.log.get_all_async()
	return await render_template('logs.html', Logs = all_logs)

@app.route('/sensor/temperature/current')
async def get_sensor_data_current():
	while True:
		try:
			temp = sensor_reader.dht.temperature
			hum = sensor_reader.dht.humidity

			if temp is not None and hum is not None:
				return jsonify({'temperature': temp, 'humidity': hum})

		except (RuntimeError, Exception):
			await sleep(5.0)

@app.route('/sensor/database/backup/download')
async def download_backup():
	file_path = await db.thum_make_db_backup_async()

	if not file_path:
		return jsonify({'success': False, 'path': None})

	return await send_file(file_path,
		'application/vnd.sqlite3',
		as_attachment=True,
		attachment_filename=file_path.split('/')[1])

async def start_server():
	await app.run_task(host=cfg.get('app.host'), port=cfg.get('app.port'), debug=cfg.get('app.debug'))
