import asyncio
import signal

from sensor_reader import start_sensor_reader
from server import start_server

async def main():
	loop = asyncio.get_event_loop()
	loop.add_signal_handler(signal.SIGINT, loop.stop)

	server = asyncio.create_task(start_server())
	reader = asyncio.create_task(start_sensor_reader())

	await asyncio.gather(server, reader)

if __name__ == '__main__':
  asyncio.run(main())

