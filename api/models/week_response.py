from pydantic import BaseModel

class WeekResponse(BaseModel):
  labels: list[str]
  temperatures: list[float]
  humidities: list[float]
