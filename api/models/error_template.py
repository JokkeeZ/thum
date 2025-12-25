from pydantic import BaseModel


class ErrorTemplate(BaseModel):
  success: bool
  message: str

