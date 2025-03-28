# t h u m
A lightweight web application that collects real-time temperature and humidity data from a DHT11/DHT21/DHT22 sensor and displays it in a simple and user-friendly interface.

![thum_monthly](https://github.com/user-attachments/assets/0f72e5e4-8393-4b76-b83b-b785aca523b4)

> [!NOTE]
> Developed with Raspberry Pi 4B and DHT11 sensor.

### Usage
Clone the repository:
```sh
git clone https://github.com/JokkeeZ/thum.git
cd thum
```

Create venv and install requirements:
```sh
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r ./requirements.txt
```

Run the app:
```sh
python3 src/app.py
```

# Dependencies
- [Quart](https://github.com/pallets/quart)
- [aiosqlite](https://github.com/omnilib/aiosqlite)
- [Adafruit_CircuitPython_DHT](https://github.com/adafruit/Adafruit_CircuitPython_DHT)
- [Bootstrap](https://getbootstrap.com/)
- [Bootswatch theme](https://bootswatch.com/)
- [Chart.js](https://www.chartjs.org)
- [@kurkle/color](https://github.com/kurkle/color)

# License
thum is licensed under the [MIT License](https://github.com/JokkeeZ/thum/blob/main/LICENSE)
