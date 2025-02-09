from datetime import datetime
from pathlib import Path
from shutil import copyfile
from aiosqlite import connect, Error
from db.db_log import DatabaseLog
from db.db_sensor_data import DatabaseSensorData
from thum_config import CONFIG

class ThumDatabase:
	def __init__(self):
		self.dbfile = CONFIG['db.file']
		self.log = DatabaseLog()
		self.sensor = DatabaseSensorData()

	async def optimize_async(self) -> bool:
		async with connect(self.dbfile) as db:
			try:
				await db.execute('PRAGMA optimize;')
				return True
			except Error as e:
				return False

	async def empty_all_tables_async(self) -> tuple[int, int]:
		async with connect(self.dbfile) as db:
			cursor = await db.execute('DELETE FROM sensor_data')
			cursor1 = await db.execute('DELETE FROM logs')
			await db.commit()

		return (cursor.rowcount, cursor1.rowcount)

	async def thum_make_db_backup_async(self) -> str | None:
		ts = datetime.now().strftime('%Y%m%d%H%M%S')
		Path('backup').mkdir(parents=True, exist_ok=True)

		dest = copyfile(self.dbfile, f'backup/{ts}.db')
		return dest if Path(dest).is_file else None

