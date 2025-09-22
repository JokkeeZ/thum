import asyncio
from contextlib import asynccontextmanager
from api.db.database import Database
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(_app: FastAPI):
  # Polling tasks for the DHT11 sensor are commented out.
  # Without them, the app still runs, but no new sensor data
  # will be stored in the database.

  # asyncio.create_task(start_sensor_polling())
  # asyncio.create_task(start_sensor_updater())
  yield

app = FastAPI(redoc_url=None, docs_url=None, openapi_url=None, lifespan=lifespan)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

db = Database('test_db.db')

def error_template(e: Exception):
	return { 'success': False, 'message': str(e) }

@app.get('/api/sensor/all')
async def get_sensor_all():
  try:
    return await db.get_all_async()
  except Exception as e:
    return error_template(e)

@app.get('/api/sensor/monthly/{year}/{month}')
async def get_sensor_monthly(year: int, month: int):
  try:
    return await db.get_year_month_async(year, month)
  except Exception as e:
    return error_template(e)

@app.get('/api/sensor/weekly/{week}')
async def get_sensor_weekly(week: str):
  try:
    return await db.get_week_async(week)
  except Exception as e:
    return error_template(e)

@app.get('/api/sensor/daily/{day}/{month}/{year}')
async def get_sensor_daily(day: int, month: int, year: int):
  try:
    return await db.get_date_async(day, month, year)
  except Exception as e:
    return error_template(e)

@app.get('/api/sensor/range/{start_date}/{end_date}')
async def get_sensor_data_range(start_date: str, end_date: str):
  try:
    return await db.get_data_range_async(start_date, end_date)
  except Exception as e:
    return error_template(e)

@app.get('/api/range/dates')
async def get_range_dates():
  try:
    return await db.get_min_max_dates_async()
  except Exception as e:
    return error_template(e)

@app.get('/api/range/weeks')
async def get_range_weeks():
  try:
    return await db.get_min_max_weeks_async()
  except Exception as e:
    return error_template(e)

@app.get('/api/range/months')
async def get_range_months():
  try:
    return await db.get_min_max_months_async()
  except Exception as e:
    return error_template(e)

@app.get('/api/logs')
async def get_logs_all():
  try:
    return await db.log_get_all_async()
  except Exception as e:
    return error_template(e)

@app.delete('/api/logs/{timestamp}')
async def remove_log_by_timestamp(timestamp: str):
  try:
    return await db.log_delete_by_timestamp_async(timestamp)
  except Exception as e:
    return error_template(e)

@app.get('/')
async def get_all_urls_from_request(request: Request):
  return [route.path for route in request.app.routes]

	# async def get_date_range_async(self) -> tuple[str, str]:
	# 	async with connect(self.dbfile) as db:
	# 		cursor = await db.execute('SELECT MIN(timestamp_date), MAX(timestamp_date) FROM sensor_data;')
	# 		(min, max) = await cursor.fetchone()

	# 	now = datetime.now()
	# 	min_date = (now.strftime(self.dateformat) if min is None else min)
	# 	max_date = (now.strftime(self.dateformat) if max is None else max)
	# 	return (min_date, max_date)

	# async def get_week_range_async(self) -> tuple[str, str]:
	# 	async with connect(self.dbfile) as db:
	# 		cursor = await db.execute('SELECT MIN(timestamp_date), MAX(timestamp_date) FROM sensor_data;')
	# 		(min, max) = await cursor.fetchone()

	# 	now = datetime.now()
	# 	min_week = (now.strftime(self.wformat) if min is None else datetime.strptime(min, self.dateformat).strftime(self.wformat))
	# 	max_week = (now.strftime(self.wformat) if max is None else datetime.strptime(max, self.dateformat).strftime(self.wformat))
	# 	return (min_week, max_week)

	# async def get_month_range_async(self) -> tuple[str, str]:
	# 	async with connect(self.dbfile) as db:
	# 		cursor = await db.execute('SELECT MIN(timestamp_date), MAX(timestamp_date) FROM sensor_data;')
	# 		(min, max) = await cursor.fetchone()

	# 	now = datetime.now()
	# 	min_month = (now.strftime(self.mformat) if min is None else datetime.strptime(min, self.dateformat).strftime(self.mformat))
	# 	max_month = (now.strftime(self.mformat) if max is None else datetime.strptime(max, self.dateformat).strftime(self.mformat))
	# 	return (min_month, max_month)

# @app.route('/api/logs/delete-entry/<string:timestamp>', methods=['DELETE'])
# async def delete_log_by_timestamp(timestamp):
# 	try:
# 		result_count = await db.log.delete_by_timestamp_async(timestamp)
# 		return jsonify({'count': result_count})
# 	except Exception as e:
# 		return jsonify({'success': False, 'message': str(e)})

# @app.route('/api/logs/purge', methods=['DELETE'])
# async def delete_logs_all():
# 	result_count = await db.log.delete_all_async()
# 	return jsonify({'count': result_count})

# @app.route('/api/tools/database/backup/download')
# async def download_backup():
# 	file_path = await db.thum_make_db_backup_async()

# 	if not file_path:
# 		return jsonify({'success': False, 'path': None})

# 	return await send_file(file_path,
# 		'application/vnd.sqlite3',
# 		as_attachment=True,
# 		attachment_filename=file_path.split('/')[1])
