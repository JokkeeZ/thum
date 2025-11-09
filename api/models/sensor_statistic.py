from aiosqlite import Row
from pydantic import BaseModel

class ValueDatePair(BaseModel):
  value: float
  date: str

  @classmethod
  def from_rows(cls, v: float, d: str):
    return cls(value=v, date=d)

class SensorStatistic(BaseModel):
  total_entries: int
  avg_temperature: float
  avg_humidity: float
  max_temperature: ValueDatePair
  min_temperature: ValueDatePair
  max_humidity: ValueDatePair
  min_humidity: ValueDatePair

  @classmethod
  def from_row(cls, row: Row):
    return cls(total_entries=row[0],
               avg_temperature=row[1],
               avg_humidity=row[2],
               max_temperature=ValueDatePair.from_rows(row[3], row[4]),
               min_temperature=ValueDatePair.from_rows(row[5], row[6]),
               max_humidity=ValueDatePair.from_rows(row[7], row[8]),
               min_humidity=ValueDatePair.from_rows(row[9], row[10]))
