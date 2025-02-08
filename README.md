# t h u m
A lightweight web application that collects real-time temperature and humidity data from a DHT11 sensor and displays it in a simple and user-friendly interface.

![monthly](https://github.com/user-attachments/assets/1c922bf8-6a29-41ae-b6ba-7da8f6098bf4)

### Usage
```sh
git clone https://github.com/JokkeeZ/thum.git
cd thum
python sensor_reader.py & python app.py &
```

# Dependencies
- [Quart](https://github.com/pallets/quart)
- [aiosqlite](https://github.com/omnilib/aiosqlite)
- [adafruit_dht](https://github.com/adafruit/DHT-sensor-library)

# License
thum is licensed under the [MIT License](https://github.com/JokkeeZ/thum/blob/main/LICENSE)
