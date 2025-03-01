# t h u m
A lightweight web application that collects real-time temperature and humidity data from a DHT11/DHT21/DHT22 sensor and displays it in a simple and user-friendly interface.

![monthly](https://github.com/user-attachments/assets/1c922bf8-6a29-41ae-b6ba-7da8f6098bf4)

> [!NOTE]
> Tested with DHT11 and Raspberry Pi 4B

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

# License
thum is licensed under the [MIT License](https://github.com/JokkeeZ/thum/blob/main/LICENSE)
