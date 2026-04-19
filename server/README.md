# HackJayhawk auth API

Minimal JWT authentication for the mobile app. User records (email + password hash) live in **MongoDB Atlas**; on-chain identity is handled elsewhere.

## Setup

1. Create a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier is fine).
2. **Database Access**: add a database user with password.
3. **Network Access**: add your IP, or `0.0.0.0/0` for development only.
4. **Connect** → Drivers → copy the connection string, replace `<password>` and set the database name (e.g. `hackjayhawk`).
5. Copy `.env.example` to `.env` and fill in `MONGODB_URI` and a long random `JWT_SECRET`.

```bash
cd server
cp .env.example .env
# edit .env
npm install
npm run dev
```

## Endpoints

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | `{ "email", "password" }` | Create user, returns JWT |
| `POST` | `/auth/login` | `{ "email", "password" }` | Returns JWT |
| `GET` | `/auth/me` | — | `Authorization: Bearer <token>` — validate session |
| `GET` | `/health` | — | Liveness |

Passwords must be at least 8 characters. JWTs expire in 7 days.

## Mobile app

Set `EXPO_PUBLIC_API_URL` in the Expo app (see `mobile/.env.example`) to this server’s base URL. For a physical device, use your machine’s LAN IP instead of `localhost`.
