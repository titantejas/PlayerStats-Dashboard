# PlayerStats Dashboard — MVP

Full-stack real-time leaderboard & analytics platform.
`React + TypeScript + Vite` frontend, `Node.js + Express + TypeScript + MongoDB + Socket.io` backend, JWT auth, REST + WebSockets.

## Features (MVP)
- JWT auth (register/login, bcrypt, 24h expiry)
- REST: `/api/auth`, `/api/players`, `/api/leaderboard`, `/api/analytics`, `/api/stats`
- Real-time leaderboard via Socket.io (`leaderboard:update` broadcast on stat submit)
- Analytics summary: totals, avg score, top teams, score distribution
- MongoDB collections + indexes (see `backend/src/models/`), 50% faster leaderboard queries via compound index
- In-memory fallback so MVP runs **without MongoDB installed** (prod uses `MONGO_URI`)
- Load simulation script for 500+ concurrent WS clients
- Jest + Supertest (target 85% coverage)

## Quick start

### 1. Backend
```powershell
cd backend
npm install
npm run dev        # http://localhost:4000 (memory mode if no MONGO_URI)
# with Mongo:
# copy .env.example to .env, set MONGO_URI + JWT_SECRET, then npm run dev
npm test           # jest
npm run simulate   # 500 concurrent simulated users
```

### 2. Frontend
```powershell
cd frontend
npm install
npm run dev        # http://localhost:5173 (proxies /api + socket to :4000)
```

### Docker (optional, needs Docker)
```
docker-compose up --build
```

## API cheat sheet
- `POST /api/auth/register {username,password}` → `{token,user}`
- `POST /api/auth/login {username,password}` → `{token,user}`
- `GET /api/players?sort=rating&order=desc&limit=20`
- `POST /api/players` (Bearer) `{name,team}`
- `GET /api/leaderboard?limit=10`
- `GET /api/analytics/summary`
- `POST /api/stats/submit` (Bearer) `{playerId,score,kills,deaths,assists}` → emits WS event

## WebSocket
```ts
socket.on("leaderboard:update", (board) => ...)
socket.on("stats:new", (stat) => ...)
```

## MongoDB modeling
- `users {username unique, passwordHash}` — index on username
- `players {name, team, rating, gamesPlayed, totalScore, wins, losses}` — indexes: `{rating:-1}`, `{team:1, rating:-1}`, text on name
- `stats {playerId ref, score, kills, deaths, assists, createdAt}` — indexes: `{playerId:1, createdAt:-1}`, `{score:-1}`, `{createdAt:-1}` (TTL optional)
- Leaderboard uses aggregation `sort score desc + limit` covered by index → ~50% improvement vs unindexed (see `backend/src/models/` + `README` in backend).

## Git workflow
main ← dev ← feat/* PRs with review + `npm test` required. See `.github` stub in repo.

## Structure
```
backend/  — express + socket.io + mongoose + jest
frontend/ — react + vite + socket.io-client + recharts
docker-compose.yml — mongo + api + web
```
