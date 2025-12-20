from aiosqlite import Row
from pydantic import BaseModel

class LogData(BaseModel):
  message: str
  timestamp: str

  @classmethod
  def from_row(cls, row: Row):
    return cls(message=row["msg"], timestamp=row["ts"])
