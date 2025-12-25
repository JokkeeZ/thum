from pydantic import BaseModel


class StatusTemplate(BaseModel):
  success: bool
  message: str

