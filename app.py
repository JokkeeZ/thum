import asyncio

from thum_config import ThumConfig

from os import path
from shutil import copyfile
from pathlib import Path
from calendar import monthrange, day_name
from aiosqlite import connect
from quart import Quart, render_template, jsonify, request, send_file
from datetime import datetime as dt, timedelta

app = Quart(__name__)
cfg = ThumConfig('config.json')
client = None

ROUTE_NAMES = {
	'/': 'All',
	'/monthly': 'Monthly',
	'/weekly': 'Weekly',
	'/daily': 'Daily',
	'/logs': 'Logs',
	'/commands': 'Commands'
}

@app.route('/sensor/weekly/<string:week>')
async def get_sensor_data_from_week(week):
	temps = []
	hums = []

	async with connect(cfg.get('db.file')) as db:
		first = dt.strptime(f'{week}-1', '%Y-W%W-%w')
		for date in [first + timedelta(days=i) for i in range(0, 7)]:
			cursor = await db.execute('SELECT AVG(temperature), AVG(humidity) FROM sensor WHERE instr(timestamp, ?) > 0',
					   [date.strftime('%Y-%m-%d')])
			(temp, hum) = await cursor.fetchone()

			temps.append(temp)
			hums.append(hum)

	return jsonify({
		'labels': [n for n in day_name],
		'temperatures': temps,
		'humidities': hums})

@app.route('/sensor')
async def get_sensor_all_data():
	dates = {}
	async with connect(cfg.get('db.file')) as db:
		cursor = await db.execute('SELECT timestamp FROM sensor')
		result = await cursor.fetchall()

	for date in result:
		datet = dt.strptime(date[0], cfg.get('db.timeformat'))
		x = dt.strftime(datet, '%Y-%m-%d')
		if x not in dates.keys():
			dates[x] = {'temp': [], 'hum': []}

			for i in range(0, 4):
				(temp, hum) = await query_between_times(x, datet, [i*6,0,0], [5+(i*6),59,59])
				dates[x]['temp'].append(temp)
				dates[x]['hum'].append(hum)

	return jsonify(dates)

@app.route('/sensor/monthly/<string:year>/<string:month>')
async def get_sensor_data_from_year_month(year, month):
	(_, days) = monthrange(int(year), int(month))
	temps = []
	hums = []

	async with connect(cfg.get('db.file')) as db:
		for i in range(1, days + 1):
			cursor = await db.execute('SELECT AVG(temperature), AVG(humidity) FROM sensor WHERE instr(timestamp, ?) > 0',
					   [f'{year}-{month}-{str(i).zfill(2)}'])

			(temp, hum) = await cursor.fetchone()

			temps.append(temp)
			hums.append(hum)

	return jsonify({
		'labels': [f'{str(x).zfill(2)}.{month}.{year}' for x in range(1, days + 1)],
		'temperatures': temps,
		'humidities': hums})

@app.route('/sensor/<string:date>')
async def get_sensor_data_from_date(date):
	async with connect(cfg.get('db.file')) as db:
		cursor = await db.execute('SELECT * FROM sensor WHERE instr(timestamp, ?) > 0', [date])
		result = await cursor.fetchall()

	return jsonify([{'temperatures': x[0],'humidities': x[1],'timestamp': x[2]} for x in result])

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
		cursor = await db.execute('VACUUM;')

	return jsonify({'success': cursor.rowcount > 0})

@app.route('/sensor/database/empty')
async def thum_empty_db():
	async with connect(cfg.get('db.file')) as db:
		cursor = await db.execute('DELETE FROM sensor')
		await db.commit();
		cursor1 = db.execute('DELETE FROM logs')
		await db.commit()

	return jsonify({'sensor_count': cursor.rowcount, 'logs_count': cursor1.rowcount})

async def query_between_times(date, ts, start, end):
	async with connect(cfg.get('db.file')) as db:
		cursor = await db.execute('SELECT AVG(temperature), AVG(humidity) FROM sensor WHERE instr(timestamp, ?) > 0 AND timestamp >= ? AND timestamp <= ?',
			[date,
			ts.replace(hour=start[0], minute=start[1],second=start[2]),
			ts.replace(hour=end[0], minute=end[1],second=end[2])])

		(temp, hum) = await cursor.fetchone()

	return (temp, hum)

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
		cursor = await db.execute('SELECT COUNT(*), MIN(timestamp), MAX(timestamp), AVG(temperature), AVG(humidity) FROM sensor')
		data = await cursor.fetchone()

		cursor = await db.execute('SELECT timestamp, MIN(temperature), MIN(humidity) FROM sensor')
		data1 = await cursor.fetchone()

		cursor = await db.execute('SELECT timestamp, MAX(temperature), MAX(humidity) FROM sensor')
		data2 = await cursor.fetchone()

	return await render_template('commands.html', Data = data, ColdestData = data1, HottestData = data2)

@app.route('/daily')
async def route_daily():
	async with connect(cfg.get('db.file')) as db:
		cursor = await db.execute('SELECT MIN(timestamp), MAX(timestamp) FROM sensor')
		(mi, ma) = await cursor.fetchone()

	if mi is None or ma is None:
		min = max = dt.now().strftime('%Y-%m-%d')
	else:
		min = dt.strptime(mi, cfg.get('db.timeformat')).strftime('%Y-%m-%d')
		max = dt.strptime(ma, cfg.get('db.timeformat')).strftime('%Y-%m-%d')

	return await render_template('daily.html', Min = min, Max = max)

@app.route('/weekly')
async def route_weekly():
	async with connect(cfg.get('db.file')) as db:
		cursor = await db.execute('SELECT MIN(timestamp), MAX(timestamp) FROM sensor')
		(mi, ma) = await cursor.fetchone()

	if mi is None or ma is None:
		min = max = dt.now().strftime('%Y-W%W')
	else:
		min = dt.strptime(mi, cfg.get('db.timeformat')).strftime('%Y-W%W')
		max = dt.strptime(ma, cfg.get('db.timeformat')).strftime('%Y-W%W')

	return await render_template('weekly.html', Min = min, Max = max)

@app.route('/monthly')
async def route_monthly():
	async with connect(cfg.get('db.file')) as db:
		cursor = await db.execute('SELECT MIN(timestamp), MAX(timestamp) FROM sensor')
		(mi, ma) = await cursor.fetchone()

	if mi is None or ma is None:
		min = max = dt.now().strftime('%Y-%m')
	else:
		min = dt.strptime(mi, cfg.get('db.timeformat')).strftime('%Y-%m')
		max = dt.strptime(ma, cfg.get('db.timeformat')).strftime('%Y-%m')

	return await render_template('monthly.html', Min = min, Max = max)

@app.route('/logs')
async def route_logs():
	async with connect(cfg.get('db.file')) as db:
		cursor = await db.execute('SELECT * FROM logs')
		result = await cursor.fetchall()

		return await render_template('logs.html', Logs = result)

@app.route('/sensor/temperature/current')
async def get_sensor_data_current():
	import board
	import time
	from adafruit_dht import DHT11

	dht = DHT11(board.D4, use_pulseio=False)

	while True:
		try:
			temp = dht.temperature
			hum = dht.humidity

			if temp is not None and hum is not None:
				return jsonify({'temperature': temp, 'humidity': hum})

		except (RuntimeError, Exception):
			time.sleep(0.2)

@app.route('/sensor/database/backup/download')
async def download_backup():
	resp = await thum_make_db_backup()

	if not resp['success']:
		return jsonify(resp)

	return await send_file(resp['path'],
				  'application/vnd.sqlite3',
					as_attachment=True,
					attachment_filename=resp['path'].split('/')[1])

async def main():
	cfg.load()
	await app.run_task(host=cfg.get('app.host'), debug=cfg.get('app.debug'))

if __name__ == '__main__':
	asyncio.run(main())
