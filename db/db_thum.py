from datetime import datetime
from pathlib import Path
from shutil import copyfile
from aiosqlite import connect
from db.db_log import DatabaseLog
from db.db_sensor_data import DatabaseSensorData
from thum_config import ThumConfig

class ThumDatabase:
	def __init__(self, config: ThumConfig):
		self.dbfile = config.get('db.file')
		self.log = DatabaseLog(self.dbfile)
		self.sensor = DatabaseSensorData(
			self.dbfile,
			config.get('db.dateformat'),
			config.get('db.timeformat')
		)

	async def optimize_async(self) -> bool:
		async with connect(self.dbfile) as db:
			cursor = await db.execute('PRAGMA optimize;')
			return cursor.rowcount > 0

	async def empty_all_tables_async(self) -> tuple[int, int]:
		async with connect(self.dbfile) as db:
			cursor = await db.execute('DELETE FROM sensor_data')
			await db.commit();
			cursor1 = await db.execute('DELETE FROM logs')
			await db.commit()

		return (cursor.rowcount, cursor1.rowcount)

	async def thum_make_db_backup_async(self) -> str | None:
		ts = datetime.now().strftime('%Y%m%d%H%M%S')
		Path('backup').mkdir(parents=True, exist_ok=True)

		dest = copyfile(self.dbfile, f'backup/{ts}.db')
		return dest if Path(dest).is_file else None

