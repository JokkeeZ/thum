from aiosqlite import Row
from pydantic import BaseModel

class SensorEntry(BaseModel):
  temperature: float
  humidity: float
  ts: str

  @classmethod
  def from_row(cls, row: Row):
    return cls(
      ts=row["ts"],
      temperature=row["temperature"],
      humidity=row["humidity"]
    )
