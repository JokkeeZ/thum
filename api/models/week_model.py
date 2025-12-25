from pydantic import BaseModel

class Week(BaseModel):
  labels: list[str]
  temperatures: list[float]
  humidities: list[float]
