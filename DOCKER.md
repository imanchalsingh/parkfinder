# Docker Local Development Setup

Run the entire ParkFinder stack — MongoDB, Express API, and React frontend — with a single command.

## Prerequisites

| Tool | Minimum version |
|------|-----------------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | 24+ |
| [Docker Compose](https://docs.docker.com/compose/) | v2 (bundled with Desktop) |

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Madhavi1108/parkfinder.git
cd parkfinder

# 2. Create the backend env file (required)
cp server/.env.example server/.env
#    → Edit server/.env and set JWT_SECRET, ADMIN_SECRET, and any SMTP_* vars

# 3. (Optional) Create the frontend env file
cp client/.env.example client/.env   # if the file exists; VITE_API_URL defaults to http://localhost:5000

# 4. Start all services
docker compose up --build
```

That's it. All three services start in the correct order.

---

## Service URLs

| Service | URL |
|---------|-----|
| Frontend (Vite HMR) | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| MongoDB | mongodb://localhost:27017/parkfinder |

---

## Common Commands

```bash
# Start in detached (background) mode
docker compose up -d --build

# View live logs for all services
docker compose logs -f

# View logs for a single service
docker compose logs -f server
docker compose logs -f client

# Stop all containers (preserves volumes)
docker compose down

# Stop and remove all data (wipe MongoDB)
docker compose down -v

# Rebuild a single service after dependency changes
docker compose up --build server

# Open a shell in the server container
docker compose exec server sh

# Seed the database (run inside container)
docker compose exec server node seed.js
```

---

## Hot Reloading

Both services support hot reloading via volume mounts:

- **Frontend** — Vite HMR detects file changes instantly.
- **Backend** — nodemon restarts the server automatically on file changes.

> **Note (Windows / WSL2)**: If file-change events are not detected, enable polling:
> - Vite: add `--poll` to the dev command in `client/Dockerfile`.
> - nodemon: add `"legacyWatch": true` to a `nodemon.json` in `server/`.

---

## Environment Variables

All secrets live in `server/.env` and are **never** committed to git.

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | ✅ | 32+ character random string for signing JWTs |
| `ADMIN_SECRET` | ✅ | 32+ character secret for admin creation bypass |
| `MONGO_URI` | ✅ | Overridden automatically to point at the `mongo` container |
| `PORT` | ❌ | Defaults to `5000` |
| `SMTP_*` | ❌ | Nodemailer config for email features |

---

## Architecture

```
┌──────────────────────────────────────┐
│           Docker Network             │
│                                      │
│  ┌─────────┐     ┌──────────────┐   │
│  │  client │────▶│    server    │   │
│  │  :5173  │     │    :5000     │   │
│  └─────────┘     └──────┬───────┘   │
│                         │           │
│                  ┌──────▼───────┐   │
│                  │    mongo     │   │
│                  │   :27017     │   │
│                  └──────────────┘   │
└──────────────────────────────────────┘
```
