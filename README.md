# t h u m

A web application that displays temperature and humidity data
from a DHT11/DHT21/DHT22 sensor in clean and user-friendly interface.

> [!NOTE]
> Developed with Raspberry Pi 4B and DHT11 sensor.

## Usage

Clone the repository:

```sh
git clone https://github.com/JokkeeZ/thum.git
cd thum
```

### Configure backend

Create venv and install requirements:

```sh
python -m venv .venv
source .venv/bin/activate # .\.venv\Scripts\activate on Windows
python -m pip install -r ./requirements.txt
```

Start backend:

```sh
fastapi run api/main.py
```

### Configure frontend

> [!IMPORTANT]
> In `app/` folder, rename `.env.template` file to `.env` and make sure `VITE_API_BASE_URL` env key
> has the correct FastAPI url and port.

Install npm packages for the frontend:

```sh
cd app
npm install
```

Start frontend:

```sh
npm run host
```

# License

thum is licensed under the [MIT License](https://github.com/JokkeeZ/thum/blob/main/LICENSE)
