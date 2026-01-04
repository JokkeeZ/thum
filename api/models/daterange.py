from pydantic import BaseModel

class DateRange(BaseModel):
  first: str
  last: str
