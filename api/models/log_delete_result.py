from pydantic import BaseModel

class LogDeleteResult(BaseModel):
  count: int
