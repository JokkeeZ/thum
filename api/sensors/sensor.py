class Sensor:
  def __init__(self, name: str):
    self.name = name

  async def read(self) -> tuple[None, None] | tuple[float, float]:
    return None, None
