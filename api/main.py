import asyncio
import os
from contextlib import asynccontextmanager
from api.db.database import Database
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

DB_FILE = os.getenv('DB_FILE')
if not DB_FILE:
  exit('Failed to launch: Could not load environment variables.')

db = Database(DB_FILE)

@asynccontextmanager
async def lifespan(_app: FastAPI):
  use_sensor = os.getenv('USE_SENSOR')
  if use_sensor is None:
    exit('Failed to launch: USE_SENSOR environment variable not set.')

  if use_sensor.lower() == 'true':
    from api.sensor_polling import sensor_poll
    asyncio.create_task(sensor_poll())

  yield

app = FastAPI(redoc_url=None, docs_url=None, openapi_url=None, lifespan=lifespan)

app.add_middleware(
  CORSMiddleware,
  allow_origin_regex=r"http?://(localhost(:\d+)?|(192\.168|10)\.\d+\.\d+(:\d+)?)",
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

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

@app.get('/api/sensor/current')
async def get_sensor_current():
  use_sensor = os.getenv('USE_SENSOR')
  if use_sensor is None or use_sensor.lower() != 'true':
    return { 'success': False, 'message': 'Sensor is not available.' }

  try:
    from api.sensor_polling import get_sensor_reading
    temperature, humidity = await get_sensor_reading()
    if temperature is None or humidity is None:
      return { 'success': False, 'message': 'Failed to read from sensor.' }
    return { 'success': True, 'temperature': temperature, 'humidity': humidity }
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

@app.delete('/api/logs')
async def remove_all_logs():
  try:
    return await db.log_delete_all_async()
  except Exception as e:
    return error_template(e)

@app.get('/')
async def get_all_urls_from_request(request: Request):
  return [route.path for route in request.app.routes]
