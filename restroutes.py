import sqlite3

from datetime import datetime
from flask import Flask, render_template, request

app = Flask(__name__)

ROUTE_NAMES = {
	'/': 'All',
	'/monthly': 'Monthly',
	'/weekly': 'Weekly',
	'/daily': 'Daily',
	'/logs': 'Logs'
}

@app.template_global('Title')
def title():
	return ':3'

@app.template_global('Nav')
def navbar():
	links = []

	for rule in app.url_map.iter_rules():
		if not rule.rule.startswith('/sensor') and not rule.rule.startswith('/static/'):
			links.append('\n\t\t<a href="%s"%s>%s</a>' %
				(rule.rule,
	 			' class="active"' if rule.rule == request.path else '',
				ROUTE_NAMES[rule.rule]))

	return f'<nav>{"".join(links)}\n\t</nav>'

@app.route('/')
def route_index():
	with sqlite3.connect('sensordata.db') as db:
		result = db.execute('SELECT COUNT(*), MIN(timestamp), MAX(timestamp), AVG(temperature), AVG(humidity) FROM sensor').fetchone()
		result_l = db.execute('SELECT COUNT(*), MAX(timestamp) FROM logs').fetchone()

	return render_template('index.html',
						Count = result[0],
						Min = result[1],
						Max = result[2],
						AvgTemp = round(result[3], 2),
						AvgHum = round(result[4], 2),
						Errors = result_l[0],
						ErrorLatest = result_l[1])

@app.route('/daily')
def route_daily():
	with sqlite3.connect('sensordata.db') as db:
		result = db.execute('SELECT MIN(timestamp), MAX(timestamp) FROM sensor').fetchone()

	return render_template('daily.html',
						Min = result[0].split(' ')[0],
						Max = result[1].split(' ')[0])

@app.route('/weekly')
def route_weekly():
	now = datetime.now()
	week = f'{now.year}-W{now.isocalendar().week}'

	return render_template('weekly.html', Week = week)

@app.route('/monthly')
def route_monthly():
	now = datetime.now()
	month = f'{now.year}-{str(now.month).zfill(2)}'
	return render_template('monthly.html', Month = month)

@app.route('/logs')
def route_logs():
	with sqlite3.connect('sensordata.db') as db:
		result = db.execute('SELECT * FROM logs').fetchall()
		return render_template('logs.html', Logs = result)
