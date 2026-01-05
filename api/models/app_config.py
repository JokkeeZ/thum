from typing import ClassVar
from aiosqlite import Row
from pydantic import BaseModel
from asyncio import Event

class AppConfig(BaseModel):
  id: int
  sensor_interval: int
  dateformat: str
  timeformat: str
  weekformat: str
  monthformat: str
  iso_week_format: str
  use_sensor: bool

  settings_changed: ClassVar[Event] = Event()

  @classmethod
  def from_row(cls, row: Row):
    return cls(
      id=row["id"],
      sensor_interval=row["sensor_interval"],
      dateformat=row["dateformat"],
      timeformat=row["timeformat"],
      weekformat=row["weekformat"],
      monthformat=row["monthformat"],
      iso_week_format=row["iso_week_format"],
      use_sensor=bool(row["use_sensor"])
    )

  @classmethod
  def default(cls):
    return cls(
      id=0,
      sensor_interval=600,
      dateformat='%Y-%m-%d',
      timeformat='%H:%M:%S',
      weekformat='%G-W%V',
      monthformat='%Y-%m',
      iso_week_format='%G-W%V-%u',
      use_sensor=False
    )
