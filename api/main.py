import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from api.db.db_sensor import DatabaseSensor
from api.sensor import sensor_poll

@asynccontextmanager
async def lifespan(_app: FastAPI):
  # asyncio.create_task(sensor_poll())
  yield

app = FastAPI(redoc_url=None, docs_url=None, openapi_url=None, lifespan=lifespan)
db = DatabaseSensor('test_db.db')

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

@app.get('/')
def get_all_urls_from_request(request: Request):
  return [route.path for route in request.app.routes]

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
