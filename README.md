# VEIN – Blood Donation Management and Inventory Control System

MERN stack: **React + Tailwind** (client), **Express + JWT + Bcrypt + Multer** (API), **MongoDB + Mongoose** (database).

## What it does
| Role | Can do |
|---|---|
| Donor | Register, book a donation with a health declaration, upload a medical certificate, track status, cancel |
| Receiver | Register, raise a blood request with a prescription, track status, cancel |
| Admin | Approve/reject donations and requests, record collections, issue blood, edit stock, manage users |
| Anyone | See live stock for the 8 blood groups, read reviews |

**Workflow**
- Donation: `pending → approved → completed` (stock **+** units) or `rejected / cancelled`
- Request: `pending → approved → fulfilled` (stock **−** units) or `rejected / cancelled`. Approval is blocked when stock is too low.
- Eligibility is checked on the server before a donation is created: age 18–65, weight ≥ 45 kg, hemoglobin ≥ 13 (male) / 12.5 (others), 90 days since last donation, and no declared condition (see `server/utils/eligibility.js`).

## Run locally
Requirements: Node 18+, MongoDB (local, or a free MongoDB Atlas cluster).

```bash
cp server/.env.example server/.env     # then edit MONGO_URI and JWT_SECRET
npm run install:all
npm run seed                           # optional demo data
npm run dev:server                     # terminal 1 → http://localhost:5000
npm run dev:client                     # terminal 2 → http://localhost:5173
```
Admin login comes from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `server/.env` (created automatically on first start).
Seed demo users: `donor@vein.local`, `receiver@vein.local`, password `Demo@12345`.

## Deploy
The server serves the built React app, so you deploy **one service**.

**Option A – Render (easiest)**
1. Create a free cluster on MongoDB Atlas, allow access from anywhere (0.0.0.0/0), copy the connection string.
2. Push this folder to GitHub → Render → New → Blueprint → select the repo (uses `render.yaml`).
3. Set `MONGO_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`. `JWT_SECRET` is generated for you.
4. Uploads need the persistent disk in `render.yaml` (paid plan). On a free plan files are lost on restart.

**Option B – Docker / VPS**
```bash
printf "JWT_SECRET=$(openssl rand -hex 32)\nADMIN_PASSWORD=choose-a-strong-one\n" > .env
docker compose up -d --build        # app on port 5000, MongoDB and uploads in volumes
```

**Option C – Split hosting** (Vercel/Netlify for client, Render/Railway for API): set `VITE_API_URL=https://your-api/api` when building the client and `CLIENT_URL=https://your-client` on the API.

## API summary
`POST /api/auth/register|login`, `GET /api/auth/me` · `POST/GET /api/donations`, `/mine`, `PATCH /:id/cancel` · `POST/GET /api/requests`, `/mine`, `PATCH /:id/cancel` · `GET /api/inventory` · `GET/POST/DELETE /api/reviews` · `GET /api/files/:name` (owner or admin) · `/api/admin/*` (stats, donations, requests, inventory, users).

## Before going live
- Change the admin password and use a long random `JWT_SECRET`.
- Keep `server/.env` out of git (already in `.gitignore`).
