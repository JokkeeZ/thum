class Sensor:
  async def read(self) -> tuple[None, None] | tuple[float, float]:
    raise NotImplementedError
