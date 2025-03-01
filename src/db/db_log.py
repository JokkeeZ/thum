from typing import Iterable
from aiosqlite import Row, connect
from thum_config import CONFIG

class DatabaseLog:
	def __init__(self):
		self.dbfile = CONFIG['db.file']

	async def delete_by_timestamp_async(self, timestamp: str) -> int:
		async with connect(self.dbfile) as db:
			cursor = await db.execute('DELETE FROM logs WHERE timestamp = ?',
			[timestamp])
			await db.commit()

		return cursor.rowcount

	async def get_all_async(self) -> Iterable[Row]:
		async with connect(self.dbfile) as db:
			cursor = await db.execute('SELECT * FROM logs')
			return await cursor.fetchall()

	async def delete_all_async(self) -> int:
		async with connect(self.dbfile) as db:
			cursor = await db.execute('DELETE FROM logs')
			await db.commit()

			return cursor.rowcount

	async def insert_log_entry_async(self, entry):
		async with connect(self.dbfile) as db:
			await db.execute(f'INSERT INTO logs VALUES (?, ?);', [entry['err'], entry['timestamp']])
			await db.commit()
