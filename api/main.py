import asyncio
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi.responses import FileResponse
from api.db.database import Database
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from api.models.database_config import DatabaseConfig
from api.models.status_template import StatusTemplate
from api.models.log_data import LogData
from api.models.log_delete_result import LogDeleteResult
from api.models.min_max_model import MinMax
from api.models.sensor_data import SensorData
from api.models.live_sensor import LiveSensor
from api.models.sensor_statistic import SensorStatistic
from api.models.week_model import Week

DB_FILE = './thum.db'
db = Database(DB_FILE)

@asynccontextmanager
async def lifespan(_app: FastAPI):

  print('initializing database...')
  await db.initialize_database()
  print('initializing database configuration...')
  await db.configure_async()

  if db.config.use_sensor:
    print('db: use_sensor=True')
    from api.sensor_polling import sensor_poll
    asyncio.create_task(sensor_poll(db))

  yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

def error_template(e: Exception) -> StatusTemplate:
	return StatusTemplate(success=False, message=str(e))

@app.get('/api/sensor/all')
async def all() -> list[SensorData] | StatusTemplate:
  try:
    return await db.get_all_async()
  except Exception as e:
    return error_template(e)

@app.get('/api/sensor/monthly/{year}/{month}')
async def monthly(year: int, month: int) -> list[SensorData] | StatusTemplate:
  try:
    return await db.get_year_month_async(year, month)
  except Exception as e:
    return error_template(e)

@app.get('/api/sensor/weekly/{week}')
async def weekly(week: str) -> Week | StatusTemplate:
  try:
    return await db.get_week_async(week)
  except Exception as e:
    return error_template(e)

@app.get('/api/sensor/daily/{day}/{month}/{year}')
async def daily(day: int, month: int, year: int) -> list[SensorData] | StatusTemplate:
  try:
    return await db.get_date_async(day, month, year)
  except Exception as e:
    return error_template(e)

@app.get('/api/sensor/range/{start_date}/{end_date}')
async def range(start_date: str, end_date: str) -> list[SensorData] | StatusTemplate:
  try:
    return await db.get_data_range_async(start_date, end_date)
  except Exception as e:
    return error_template(e)

@app.get('/api/sensor/current')
async def current() -> LiveSensor | StatusTemplate:
  if not db.config.use_sensor:
    return StatusTemplate(success=False, message='Sensor is not available.')

  try:
    from api.sensor_polling import get_sensor_reading
    temperature, humidity = get_sensor_reading()
    if temperature is None or humidity is None:
      return StatusTemplate(success=False, message='Invalid temperature or humidity reading.')

    return LiveSensor(success=True, temperature=temperature, humidity=humidity)
  except Exception as e:
    return error_template(e)

@app.get('/api/range/dates')
async def range_dates() -> MinMax | StatusTemplate:
  try:
    return await db.get_min_max_dates_async()
  except Exception as e:
    return error_template(e)

@app.get('/api/range/weeks')
async def get_range_weeks() -> MinMax | StatusTemplate:
  try:
    return await db.get_min_max_weeks_async()
  except Exception as e:
    return error_template(e)

@app.get('/api/range/months')
async def get_range_months() -> MinMax | StatusTemplate:
  try:
    return await db.get_min_max_months_async()
  except Exception as e:
    return error_template(e)

@app.get('/api/logs')
async def get_logs_all() -> list[LogData] | StatusTemplate:
  try:
    return await db.log_get_all_async()
  except Exception as e:
    return error_template(e)

@app.delete('/api/logs/{timestamp}')
async def remove_log_by_timestamp(timestamp: str) -> LogDeleteResult | StatusTemplate:
  try:
    return await db.log_delete_by_timestamp_async(timestamp)
  except Exception as e:
    return error_template(e)

@app.delete('/api/logs')
async def remove_all_logs() -> LogDeleteResult | StatusTemplate:
  try:
    return await db.log_delete_all_async()
  except Exception as e:
    return error_template(e)

@app.get('/api/statistics')
async def get_statistics() -> SensorStatistic | StatusTemplate:
  try:
    return await db.get_statistics_async()
  except Exception as e:
    return error_template(e)

@app.get('/')
async def get_all_urls_from_request(request: Request) -> list[str]:
  return [route.path for route in request.app.routes]

@app.get('/api/config')
async def get_app_config() -> DatabaseConfig:
  return db.get_app_config_async()

@app.put('/api/config')
async def update_config(cfg: DatabaseConfig) -> StatusTemplate:
  try:
    await db.update_config_async(cfg)
    await db.configure_async()
    db.config.settings_changed.set()

    return StatusTemplate(success=True, message='Configuration updated successfully!')
  except Exception as e:
    return error_template(e)

@app.get('/api/dump')
async def get_database_dump():
  timestamp = datetime.now().strftime("%d%m%Y%H%M%S")

  return FileResponse(
    path=DB_FILE,
    filename=f'thum-{timestamp}.db',
    media_type='application/x-sqlite3'
  )
