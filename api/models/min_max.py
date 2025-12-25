from pydantic import BaseModel

class MinMax(BaseModel):
  first: str
  last: str
