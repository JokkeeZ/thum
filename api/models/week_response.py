from pydantic import BaseModel

class WeekResponse(BaseModel):
  labels: list[str]
  temperatures: list[float | int]
  humidities: list[float | int]
