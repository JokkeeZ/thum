# t h u m
A web application that collects real-time temperature and humidity data from a DHT11/DHT21/DHT22 sensor and displays it in a simple and user-friendly interface.

> [!NOTE]
> Developed with Raspberry Pi 4B and DHT11 sensor.

## Usage
Clone the repository:
```sh
git clone https://github.com/JokkeeZ/thum.git
cd thum
```

### Backend
Create venv and install requirements:

```sh
python -m venv .venv
./.venv/Scripts/activate
python -m pip install -r ./requirements.txt
```

Start FastAPI backend
```sh
uvicorn api.main:app --reload
```

### Frontend
Install npm packages and run frontend:
```sh
cd app
npm install
npm run dev
```

# License
thum is licensed under the [MIT License](https://github.com/JokkeeZ/thum/blob/main/LICENSE)
