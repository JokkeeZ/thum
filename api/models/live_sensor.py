from pydantic import BaseModel

class LiveSensor(BaseModel):
  success: bool
  temperature: float
  humidity: float
