from aiosqlite import Row
from pydantic import BaseModel

class SensorData(BaseModel):
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
