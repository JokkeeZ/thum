import asyncio

async def sensor_poll():
  while True:
    print('start_sensor_polling: Some value from pin')
    await asyncio.sleep(2)
