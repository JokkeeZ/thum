# t h u m
A lightweight web application that collects real-time temperature and humidity data from a DHT11/DHT21/DHT22 sensor and displays it in a simple and user-friendly interface.

![monthly](https://github.com/user-attachments/assets/1c922bf8-6a29-41ae-b6ba-7da8f6098bf4)

### Usage
Clone the repository and install requirements:
```sh
git clone https://github.com/JokkeeZ/thum.git
cd thum
pip install -r requirements.txt
```

Configuration is located at:
```sh
./thum_config.py
```

Run the app:
```
python3 app.py
```

# Dependencies
- [Quart](https://github.com/pallets/quart)
- [aiosqlite](https://github.com/omnilib/aiosqlite)
- [Adafruit_CircuitPython_DHT](https://github.com/adafruit/Adafruit_CircuitPython_DHT)

# License
thum is licensed under the [MIT License](https://github.com/JokkeeZ/thum/blob/main/LICENSE)
