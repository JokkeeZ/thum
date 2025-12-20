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
    return cls(
      total_entries=row["total_entries"],
      avg_temperature=row["avg_temperature"],
      avg_humidity=row["avg_humidity"],
      min_temperature=ValueDatePair.from_rows(
        row["min_temperature"],
        row["min_temperature_date"]
      ),
      max_temperature=ValueDatePair.from_rows(
        row["max_temperature"],
        row["max_temperature_date"]
      ),
      min_humidity=ValueDatePair.from_rows(
        row["min_humidity"],
        row["min_humidity_date"]
      ),
      max_humidity=ValueDatePair.from_rows(
        row["max_humidity"],
        row["max_humidity_date"]
      )
    )
