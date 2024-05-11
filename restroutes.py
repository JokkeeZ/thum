import sqlite3

from datetime import datetime as dt
from flask import Flask, render_template, request

app = Flask(__name__)

ROUTE_NAMES = {
	'/': 'All',
	'/monthly': 'Monthly',
	'/weekly': 'Weekly',
	'/daily': 'Daily',
	'/logs': 'Logs'
}

DB_FILE = 'sensordata.db'

@app.template_global('Title')
def title():
	return ':3'

@app.template_global('Nav')
def navbar():
	links = []

	for rule in app.url_map.iter_rules():
		if not rule.rule.startswith('/sensor') and not rule.rule.startswith('/static/'):
			links.append('<a href="{}"{}>{}</a>'
				.format(rule.rule,
				' class="active"' if rule.rule == request.path else '',
				ROUTE_NAMES[rule.rule]))

	return f"""<a class="github-fork-ribbon" href="https://github.com/jokkeez/thum" data-ribbon="Find me on GitHub" title="Fork me on GitHub">Fork me on GitHub</a>
	<nav>{''.join(links)}</nav>
	"""

@app.route('/')
def route_index():
	with sqlite3.connect(DB_FILE) as db:
		result = db.execute('SELECT COUNT(*), MIN(timestamp), MAX(timestamp), AVG(temperature), AVG(humidity) FROM sensor').fetchone()
		result_l = db.execute('SELECT COUNT(*), MAX(timestamp) FROM logs').fetchone()

	return render_template('index.html', Data = result, LogData = result_l)

@app.route('/daily')
def route_daily():
	with sqlite3.connect(DB_FILE) as db:
		result = db.execute('SELECT MIN(timestamp), MAX(timestamp) FROM sensor').fetchone()

	return render_template('daily.html',
						Min = result[0].split(' ')[0],
						Max = result[1].split(' ')[0])

@app.route('/weekly')
def route_weekly():
	return render_template('weekly.html', Week = dt.now().strftime('%Y-W%W'))

@app.route('/monthly')
def route_monthly():
	return render_template('monthly.html', Month = dt.now().strftime('%Y-%m'))

@app.route('/logs')
def route_logs():
	with sqlite3.connect(DB_FILE) as db:
		result = db.execute('SELECT * FROM logs').fetchall()
		return render_template('logs.html', Logs = result)
