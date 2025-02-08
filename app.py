from asyncio import sleep
from os import path
from shutil import copyfile
from pathlib import Path
from calendar import monthrange, day_name
from aiosqlite import connect
from quart import Quart, render_template, jsonify, request, send_file
from datetime import datetime as dt, timedelta
from thum_config import ThumConfig

app = Quart(__name__)
cfg = ThumConfig('config.json')

ROUTE_NAMES = {
	'/': 'All',
	'/monthly': 'Monthly',
	'/weekly': 'Weekly',
	'/daily': 'Daily',
	'/logs': 'Logs',
	'/commands': 'Commands'
}

@app.route('/sensor')
async def get_sensor_all_data():
	dates = {}
	async with connect(cfg.get('db.file')) as db:
		cursor = await db.execute("""
			SELECT timestamp_date, AVG(temperature) AS avg_temp, AVG(humidity) AS avg_hum
			FROM sensor_data
			GROUP BY timestamp_date
		""")

		result = await cursor.fetchall()
		dates = {row[0]: {'temperature': row[1], 'humidity': row[2]} for row in result}

		return jsonify(dates)

@app.route('/sensor/monthly/<string:year>/<string:month>')
async def get_sensor_data_from_year_month(year, month):
  (_, days) = monthrange(int(year), int(month))
  temps = []
  hums = []

  start_date = f'{year}-{month}-01'
  end_date = f'{year}-{month}-{str(days).zfill(2)}'

  async with connect(cfg.get('db.file')) as db:
    cursor = await db.execute("""
      SELECT strftime('%d', timestamp_date) AS day, AVG(temperature) AS avg_temp, AVG(humidity) AS avg_hum
      FROM sensor_data
      WHERE timestamp_date BETWEEN ? AND ?
      GROUP BY day
      ORDER BY day
    """, [start_date, end_date])

    result = await cursor.fetchall()

    for row in result:
      temps.append(row[1])
      hums.append(row[2])

  return jsonify({
    'labels': [f'{str(x).zfill(2)}.{month}.{year}' for x in range(1, days + 1)],
    'temperatures': temps,
    'humidities': hums
  })

@app.route('/sensor/weekly/<string:week>')
async def get_sensor_data_from_week(week):
	temps = []
	hums = []

	async with connect(cfg.get('db.file')) as db:
		first = dt.strptime(f'{week}-1', '%Y-W%W-%w')

		for date in [first + timedelta(days=i) for i in range(0, 7)]:
			cursor = await db.execute("""
				SELECT AVG(temperature), AVG(humidity)
				FROM sensor_data
				WHERE timestamp_date = ?
			""", [date.strftime('%Y-%m-%d')])

			(temp, hum) = await cursor.fetchone()

			temps.append(temp)
			hums.append(hum)

	return jsonify({
		'labels': [n for n in day_name],
		'temperatures': temps,
		'humidities': hums
	})

@app.route('/sensor/daily/<string:date>')
async def get_sensor_data_from_date2(date):
	async with connect(cfg.get('db.file')) as db:
		cursor = await db.execute("""
			SELECT temperature, humidity, timestamp_time
			FROM sensor_data
			WHERE timestamp_date = ?
		""", [date])

		result = await cursor.fetchall()

	return jsonify([{'temperature': x[0], 'humidity': x[1], 'timestamp': x[2]} for x in result])

@app.route('/sensor/logs/<string:timestamp>', methods=['DELETE'])
async def delete_log_by_timestamp(timestamp):
	async with connect(cfg.get('db.file')) as db:
		cursor = await db.execute('DELETE FROM logs WHERE timestamp = ?',
		[timestamp])
		await db.commit()

	return jsonify({'count': cursor.rowcount})

@app.route('/sensor/logs/all', methods=['DELETE'])
async def delete_logs_all():
	async with connect(cfg.get('db.file')) as db:
		cursor = await db.execute('DELETE FROM logs')
		await db.commit()

	return jsonify({'count': cursor.rowcount})

async def thum_make_db_backup():
	ts = dt.now().strftime('%Y%m%d%H%M%S')
	Path('backup').mkdir(parents=True, exist_ok=True)

	dest = copyfile(cfg.get('db.file'), f'backup/{ts}.db')
	return {'success': path.isfile(dest), 'path': dest}

@app.route('/sensor/database/backup')
async def thum_backup_db():
	return jsonify(thum_make_db_backup())

@app.route('/sensor/database/optimize')
async def thum_optimize_db():
	async with connect(cfg.get('db.file')) as db:
		cursor = await db.execute('PRAGMA optimize;')

	return jsonify({'success': cursor.rowcount > 0})

@app.route('/sensor/database/empty')
async def thum_empty_db():
	async with connect(cfg.get('db.file')) as db:
		cursor = await db.execute('DELETE FROM sensor_data')
		await db.commit();
		cursor1 = db.execute('DELETE FROM logs')
		await db.commit()

	return jsonify({'sensor_count': cursor.rowcount, 'logs_count': cursor1.rowcount})

@app.template_global()
def title():
	return cfg.get('app.title')

@app.template_global()
def get_navbar_items():
	links = []

	for rule in app.url_map.iter_rules():
		if not rule.rule.startswith('/sensor') and not rule.rule.startswith('/tv') and not rule.rule.startswith('/static/'):
			links.append({'path': rule.rule, 'text': ROUTE_NAMES[rule.rule], 'active': rule.rule == request.path})

	return links

@app.route('/')
async def route_index():
	return await render_template('index.html')

@app.route('/commands')
async def route_commands():
	async with connect(cfg.get('db.file')) as db:
		cursor = await db.execute('SELECT COUNT(*), MIN(timestamp_date), MAX(timestamp_date), AVG(temperature), AVG(humidity) FROM sensor_data')
		data = await cursor.fetchone()

		cursor = await db.execute('SELECT timestamp_date, MIN(temperature), MIN(humidity) FROM sensor_data')
		data1 = await cursor.fetchone()

		cursor = await db.execute('SELECT timestamp_date, MAX(temperature), MAX(humidity) FROM sensor_data')
		data2 = await cursor.fetchone()

	return await render_template('commands.html', Data = data, ColdestData = data1, HottestData = data2)

@app.route('/daily')
async def route_daily():
	async with connect(cfg.get('db.file')) as db:
		cursor = await db.execute('SELECT MIN(timestamp_date), MAX(timestamp_date) FROM sensor_data')
		(mi, ma) = await cursor.fetchone()

	min_date = (dt.now().strftime(cfg.get('db.dateformat')) if mi is None else mi)
	max_date = (dt.now().strftime(cfg.get('db.dateformat')) if ma is None else ma)

	return await render_template('daily.html', Min=min_date, Max=max_date)

@app.route('/weekly')
async def route_weekly():
	async with connect(cfg.get('db.file')) as db:
		cursor = await db.execute('SELECT MIN(timestamp_date), MAX(timestamp_date) FROM sensor_data')
		(mi, ma) = await cursor.fetchone()

	min_week = (dt.now().strftime('%Y-W%W') if mi is None else dt.strptime(mi, cfg.get('db.dateformat')).strftime('%Y-W%W'))
	max_week = (dt.now().strftime('%Y-W%W') if ma is None else dt.strptime(ma, cfg.get('db.dateformat')).strftime('%Y-W%W'))

	return await render_template('weekly.html', Min=min_week, Max=max_week)

@app.route('/monthly')
async def route_monthly():
	async with connect(cfg.get('db.file')) as db:
		cursor = await db.execute('SELECT MIN(timestamp_date), MAX(timestamp_date) FROM sensor_data')
		(mi, ma) = await cursor.fetchone()

	min_month = (dt.now().strftime('%Y-%m') if mi is None else dt.strptime(mi, cfg.get('db.dateformat')).strftime('%Y-%m'))
	max_month = (dt.now().strftime('%Y-%m') if ma is None else dt.strptime(ma, cfg.get('db.dateformat')).strftime('%Y-%m'))

	return await render_template('monthly.html', Min=min_month, Max=max_month)

@app.route('/logs')
async def route_logs():
	async with connect(cfg.get('db.file')) as db:
		cursor = await db.execute('SELECT * FROM logs')
		result = await cursor.fetchall()

		return await render_template('logs.html', Logs = result)

@app.route('/sensor/temperature/current')
async def get_sensor_data_current():
	import board
	from adafruit_dht import DHT11

	dht = DHT11(board.D4, use_pulseio=False)

	while True:
		try:
			temp = dht.temperature
			hum = dht.humidity

			if temp is not None and hum is not None:
				return jsonify({'temperature': temp, 'humidity': hum})

		except (RuntimeError, Exception):
			await sleep(0.2)

@app.route('/sensor/database/backup/download')
async def download_backup():
	resp = await thum_make_db_backup()

	if not resp['success']:
		return jsonify(resp)

	return await send_file(resp['path'],
					'application/vnd.sqlite3',
					as_attachment=True,
					attachment_filename=resp['path'].split('/')[1])

if __name__ == '__main__':
	cfg.load()
	app.run(host=cfg.get('app.host'), port=cfg.get('app.port'), debug=cfg.get('app.debug'))
