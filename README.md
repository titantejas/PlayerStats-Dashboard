# PlayerStats Dashboard

Real-time leaderboard and analytics platform for competitive player stats.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47a248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/WebSocket-Socket.io-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![Jest](https://img.shields.io/badge/Tested-Jest-C21325?style=flat-square&logo=jest)](https://jestjs.io/)

React + TypeScript frontend. Node.js + Express + MongoDB + WebSocket backend. JWT auth. REST + live updates.

---

## Features

- **Live leaderboard** — top players stream over WebSockets on every stat submit
- **Analytics overview** — totals, averages, best scores, top teams by rating
- **JWT auth** — register / login with bcrypt hashing, 24h token expiry
- **Stat ingestion** — authenticated match submit with automatic rating update
- **Indexed queries** — compound MongoDB indexes for leaderboard and history reads
- **Zero-config local run** — in-memory fallback when `MONGO_URI` is not set
- **Load tested** — simulation script for 500+ concurrent socket clients

## Tech stack

| Layer    | Technology                              |
| -------- | --------------------------------------- |
| Frontend | React 18, TypeScript, Vite, Recharts, socket.io-client |
| Backend  | Node.js 20, Express 4, Socket.io, Mongoose, JWT, bcryptjs |
| Data     | MongoDB 7 (in-memory fallback for local dev) |
| Testing  | Jest, Supertest                         |

## Getting started

Prerequisites: Node.js 20+.

```powershell
# Backend — http://localhost:4000
cd backend
npm install
npm run dev

# Frontend — http://localhost:5173
cd frontend
npm install
npm run dev
```

With MongoDB:

```powershell
# backend/.env
MONGO_URI=mongodb://localhost:27017/playerstats
JWT_SECRET=your-secret
PORT=4000
CLIENT_URL=http://localhost:5173
```

Or with Docker:

```powershell
docker-compose up --build
```

## API reference

Base URL: `http://localhost:4000`

| Method | Endpoint               | Auth   | Description                              |
| ------ | ---------------------- | ------ | ---------------------------------------- |
| POST   | `/api/auth/register`   | —      | Register `{username, password}` → `{token, user}` |
| POST   | `/api/auth/login`      | —      | Login `{username, password}` → `{token, user}` |
| GET    | `/api/players`         | —      | List players `?sort=rating&order=desc&limit=20` |
| POST   | `/api/players`         | Bearer | Create player `{name, team}`             |
| GET    | `/api/players/:id`     | —      | Get player by id                         |
| GET    | `/api/leaderboard`     | —      | Top players `?limit=10`, sorted by rating |
| GET    | `/api/analytics/summary` | —    | Totals, averages, top teams              |
| POST   | `/api/stats/submit`    | Bearer | Submit `{playerId, score, kills, deaths, assists}` |
| GET    | `/health`              | —      | Health check                             |

## Real-time

Connect with socket.io and subscribe to two events:

```typescript
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

socket.on("leaderboard:update", (board) => {
  // refreshed top-10 after every submit
});

socket.on("stats:new", (stat) => {
  // single match result as submitted
});
```

Every `POST /api/stats/submit` updates the player rating, persists the stat, and broadcasts both events.

## Data model

```text
users   { username (unique), passwordHash }
players { name, team, rating, gamesPlayed, totalScore, wins, losses }
stats   { playerId -> players, score, kills, deaths, assists, createdAt }
```

Indexes:

```javascript
// players — global + per-team leaderboards, name search
db.players.createIndex({ rating: -1 });
db.players.createIndex({ team: 1, rating: -1 });
db.players.createIndex({ name: "text" });

// stats — player history, global ranking, recency
db.stats.createIndex({ playerId: 1, createdAt: -1 });
db.stats.createIndex({ score: -1 });
db.stats.createIndex({ createdAt: -1 });
```

Leaderboard reads are covered sorts (`sort rating desc + limit`), avoiding collection scans. See `backend/src/models/Player.ts` and `backend/src/models/Stat.ts`.

## Testing and load simulation

```powershell
cd backend
npm test        # Jest + Supertest, 3 suites / 6 tests
npm run simulate  # 500 concurrent WS clients + burst submits
```

## Project structure

```text
backend/
  src/
    app.ts              # Express factory
    index.ts            # HTTP + Socket.io bootstrap
    socket.ts           # WebSocket init and broadcast
    config/db.ts        # Mongoose connect + memory fallback
    models/             # User, Player, Stat schemas + indexes
    routes/             # auth, players, leaderboard, analytics, stats
    store/              # DB-or-memory repositories
    __tests__/          # auth, leaderboard, analytics
frontend/
  src/
    App.tsx
    api.ts              # typed REST helpers
    auth/AuthContext.tsx
    components/         # Leaderboard, Analytics, Login, SubmitStat
    socket.ts
```

## Workflow

`main` ← `dev` ← `feat/*`. Pull requests require `npm test` green and one review.

---

MIT. Built as an MVP — MongoDB connection, auth secret, and client URL are the only production settings.
