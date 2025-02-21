import asyncio

from db.sensor_reader import start_sensor_reader
from server import start_server

async def main():
	asyncio.create_task(start_sensor_reader())

	server = asyncio.create_task(start_server())
	await asyncio.gather(server)

if __name__ == '__main__':
  asyncio.run(main())

