from datetime import datetime
from contextlib import asynccontextmanager
from fastapi.responses import FileResponse
from api.db.database import Database
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from api.models.app_config import AppConfig
from api.models.status_response import StatusResponse
from api.models.entries.log_entry import LogEntry
from api.models.log_delete_result import LogDeleteResult
from api.models.entries.sensor_entry import SensorEntry
from api.models.live_sensor import LiveSensor
from api.models.entries.statistic_entry import StatisticEntry
from api.services.sensor_service import SensorService

DB_FILE = './thum.db'
db = Database(DB_FILE)
sensor_service = SensorService()

@asynccontextmanager
async def lifespan(_app: FastAPI):
  await db.init_database_async()
  await db.configure_async()

  sensor_service.init_sensor()

  if db.config.use_sensor:
    await sensor_service.start(db)

  yield

  await sensor_service.stop()
  await db.shutdown_async()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

def fail_with_http_400(response: Response, e: Exception) -> StatusResponse:
  response.status_code = status.HTTP_400_BAD_REQUEST
  return StatusResponse(success=False, message=str(e))

@app.get('/api/sensor/all')
async def all(response: Response) -> list[SensorEntry] | StatusResponse:
  try:
    return await db.all_async()
  except Exception as e:
    return fail_with_http_400(response, e)

@app.get('/api/sensor/monthly/{year}/{month}')
async def monthly(year: int, month: int, response: Response) -> list[SensorEntry] | StatusResponse:
  try:
    return await db.by_month_async(year, month)
  except Exception as e:
    return fail_with_http_400(response, e)

@app.get('/api/sensor/weekly/{week}')
async def weekly(week: str, response: Response):
  try:
    return await db.by_week_async(week)
  except Exception as e:
    return fail_with_http_400(response, e)

@app.get('/api/sensor/daily/{day}/{month}/{year}')
async def daily(day: int, month: int, year: int, response: Response) -> list[SensorEntry] | StatusResponse:
  try:
    return await db.by_date_async(day, month, year)
  except Exception as e:
    return fail_with_http_400(response, e)

@app.get('/api/sensor/range/{start_date}/{end_date}')
async def range(start_date: str, end_date: str, response: Response) -> list[SensorEntry] | StatusResponse:
  try:
    return await db.by_range_async(start_date, end_date)
  except Exception as e:
    return fail_with_http_400(response, e)

@app.get('/api/sensor/current')
async def current(response: Response) -> LiveSensor | StatusResponse:
  if not db.config.use_sensor:
    return StatusResponse(success=False, message='Sensor is not available.')

  if not sensor_service.sensor_poll:
    return StatusResponse(success=False, message='Sensor is not available.')

  try:
    temp, humi = await sensor_service.sensor_poll.get_sensor_reading()
    if temp is None or humi is None:
      return StatusResponse(success=False, message='Invalid temperature or humidity reading.')

    return LiveSensor(success=True, temperature=temp, humidity=humi)
  except Exception as e:
    return fail_with_http_400(response, e)

@app.get('/api/daterange')
async def get_daterange(response: Response):
  try:
    return await db.daterange_async()
  except Exception as e:
    return fail_with_http_400(response, e)

@app.get('/api/logs')
async def get_logs_all(response: Response) -> list[LogEntry] | StatusResponse:
  try:
    return await db.all_logs_async()
  except Exception as e:
    return fail_with_http_400(response, e)

@app.delete('/api/logs/{timestamp}')
async def remove_log_by_timestamp(timestamp: str, response: Response) -> LogDeleteResult | StatusResponse:
  try:
    return await db.delete_log_by_ts_async(timestamp)
  except Exception as e:
    return fail_with_http_400(response, e)

@app.delete('/api/logs')
async def remove_all_logs(response: Response) -> LogDeleteResult | StatusResponse:
  try:
    return await db.delete_all_logs_async()
  except Exception as e:
    return fail_with_http_400(response, e)

@app.get('/api/statistics')
async def get_statistics(response: Response) -> StatisticEntry | StatusResponse:
  try:
    return await db.statistics_async()
  except Exception as e:
    return fail_with_http_400(response, e)

@app.get('/')
async def get_all_urls_from_request(request: Request) -> list[str]:
  return [route.path for route in request.app.routes]

@app.get('/api/config')
async def get_app_config() -> AppConfig:
  return db.config

@app.put('/api/config')
async def update_config(cfg: AppConfig, response: Response) -> StatusResponse:
  try:
    await db.update_config_async(cfg)
    await db.configure_async()

    if db.config.use_sensor:
      await sensor_service.start(db)
    else:
      await sensor_service.stop()

    db.config.settings_changed.set()

    return StatusResponse(success=True, message='Configuration updated successfully!')
  except Exception as e:
    return fail_with_http_400(response, e)

@app.get('/api/dump')
async def get_database_dump() -> FileResponse:
  timestamp = datetime.now().strftime("%d%m%Y%H%M%S")

  return FileResponse(
    path=DB_FILE,
    filename=f'thum-{timestamp}.db',
    media_type='application/x-sqlite3'
  )
