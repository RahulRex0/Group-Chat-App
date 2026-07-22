<div align="center">

<img src="public/images/groupchat-logo.svg" alt="Group Chat logo" width="96" height="96" />

# Group Chat

A realtime, channel-based group chat app — a place for your team to talk.

Live demo: **[🚀 grpchat.org](https://grpchat.org)**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![WebSocket](https://img.shields.io/badge/WebSocket-ws-010101?logo=websocket&logoColor=white)](https://github.com/websockets/ws)

</div>

<div align="center">

<img width="800" height="500" alt="ScreenRecording2026-06-02at1 01 15PM-ezgif com-video-to-gif-converter (1)" src="https://github.com/user-attachments/assets/755d25be-1d2e-4ed8-a54b-f1b5aeb33696" />

</div>


---

> **✅ Backend complete.** This project originally ran on **Supabase** (Auth, Postgres, Realtime). Supabase has been fully replaced by a hand-rolled backend — an **Express 5 REST API**, **PostgreSQL**, and a raw **WebSocket** layer. Auth, persistence, and live updates all work end to end.

## Overview

Group Chat is a small full-stack app. The frontend is built with the **Next.js App Router** (Server Components + Server Actions); the backend is written from scratch: an **Express** API, **Postgres** for persistence, **JWT auth** in an httpOnly cookie, and a **`ws`** WebSocket server for realtime — everything Supabase used to provide, rebuilt by hand.

It's a learning project, and rebuilding the backend without a BaaS was the point.

## Features

- 💬 **Channels** — create, browse, and delete channels from the home page
- ⚡ **Live messages** — new messages are pushed over a WebSocket to everyone in the channel, no refresh needed
- 🔐 **Real auth** — email + password sign-up, bcrypt-hashed passwords, 7-day JWT in an httpOnly cookie
- 🧑 **Message bubbles** — sender name, avatar initials, and timestamps, with your own messages aligned to the right
- 🖥️ **Server-rendered** — channel lists and message history load in async React Server Components
- 🎨 **Styled with CSS Modules** — scoped styles per route, Geist font via `next/font`

## Tech Stack

| Layer     | Choice                                                  |
| --------- | ------------------------------------------------------- |
| Frontend  | [Next.js 16](https://nextjs.org) (App Router), [React 19](https://react.dev), TypeScript |
| API       | [Express 5](https://expressjs.com) on Node.js (ESM)     |
| Database  | [PostgreSQL](https://www.postgresql.org) via `pg`       |
| Realtime  | [`ws`](https://github.com/websockets/ws) — raw WebSockets on the same server |
| Auth      | `jsonwebtoken` + `bcrypt`, JWT in an httpOnly cookie    |
| Styling   | CSS Modules + `next/font` (Geist)                       |

## How It Works

- **Reads** — `page.tsx` and `channels/[id]/page.tsx` are async Server Components that fetch `/me`, `/channels`, and `/channels/:id/messages` from the API with `cache: 'no-store'`, forwarding the JWT cookie. A missing or rejected token redirects to `/login`.
- **Writes** — forms post to **Server Actions** in `actions.ts` (`createChannel`, `sendMessage`, `deleteChannel`), which call the API and `revalidatePath`.
- **Realtime** — `messages.tsx` opens a WebSocket to the API and sends `{ type: "subscribe", channelId }`. When anyone posts a message, the server broadcasts a `message_created` event to every socket subscribed to that channel, and the client merges it into the list (deduped by id).
- **Auth** — `/register` hashes the password with bcrypt (username is derived from the email prefix); `/login` verifies it and sets the JWT cookie; a `requireAuth` middleware guards every data route; the WebSocket handshake verifies the same cookie before accepting the connection.

## API

All data routes require the JWT cookie (or `Authorization: Bearer <token>`).

| Method | Route                        | Auth | Description                                |
| ------ | ---------------------------- | ---- | ------------------------------------------ |
| POST   | `/register`                  | –    | Create an account                          |
| POST   | `/login`                     | –    | Verify credentials, set the JWT cookie     |
| POST   | `/logout`                    | –    | Clear the cookie                           |
| GET    | `/me`                        | 🔒   | Current user from the token                |
| GET    | `/channels`                  | 🔒   | List channels                              |
| POST   | `/channels`                  | 🔒   | Create a channel (names are unique)        |
| DELETE | `/channels/:id`              | 🔒   | Delete a channel                           |
| GET    | `/channels/:id/messages`     | 🔒   | Message history with sender usernames      |
| POST   | `/channels/:id/messages`     | 🔒   | Send a message (max 2000 chars) + broadcast |
| GET    | `/health`                    | –    | DB connectivity check                      |

**WebSocket** — connect to the same origin (`ws://` in dev, `wss://` in prod), then send `{ "type": "subscribe", "channelId": "…" }` to receive `message_created` events for that channel.

## Project Structure

```
server/                      # Express backend
├── index.js                 # REST API, auth middleware, WebSocket server
├── db.js                    # pg connection pool (DATABASE_URL)
└── schema.sql               # users, channels, messages — uuid PKs, cascade deletes

src/app/                     # Next.js frontend
├── page.tsx                 # Home: channel list (redirects to /login when signed out)
├── layout.tsx               # Root layout, fonts, metadata
├── actions.ts               # Server Actions: createChannel, sendMessage, deleteChannel, signOut
├── login/page.tsx           # Email/password log in + sign up
└── channels/[id]/
    ├── page.tsx             # Channel view: message history + composer
    └── messages.tsx         # Renders messages and subscribes to the WebSocket
```

## Getting Started

### Prerequisites

- **Node.js 20+**
- A **PostgreSQL** database (local, or hosted like [Neon](https://neon.tech))

### 1. Clone and install

```bash
git clone <your-repo-url>
cd groupchat
npm install
cd server && npm install
```

### 2. Create the schema

```bash
psql "$DATABASE_URL" -f server/schema.sql
```

### 3. Configure environment

`server/.env`:

```bash
DATABASE_URL=postgres://user:pass@host/db
JWT_SECRET=any-long-random-string
# optional:
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
```

`.env.local` (repo root):

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 4. Run both servers

```bash
cd server && npm run dev   # API + WebSocket on :4000
npm run dev                # Next.js on :3000 (separate terminal)
```

Open [http://localhost:3000](http://localhost:3000), sign up, create a channel — then open the same channel in a second browser to watch messages arrive live.

## Available Scripts

**Frontend** (repo root):

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the Next.js dev server |
| `npm run build` | Create a production build    |
| `npm run start` | Run the production build     |
| `npm run lint`  | Lint with ESLint             |

**Server** (`server/`):

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the API with `node --watch`    |
| `npm run start` | Start the API                        |

## Deploy

Three pieces, deployed separately:

| Piece            | Where                                      | Env                                                            |
| ---------------- | ------------------------------------------ | -------------------------------------------------------------- |
| Frontend         | [Vercel](https://vercel.com) — [grpchat.org](https://grpchat.org) | `NEXT_PUBLIC_API_URL=https://api.grpchat.org`                  |
| API + WebSocket  | [Render](https://render.com) — `api.grpchat.org` | `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_ORIGIN`, `COOKIE_DOMAIN`, `NODE_ENV=production` |
| Postgres         | [Neon](https://neon.tech)                  | Apply `server/schema.sql` once                                 |

Serving the API from a subdomain keeps auth same-site: the cookie is set for the shared domain (`COOKIE_DOMAIN`, e.g. `.grpchat.org`), so the browser sends it to both the site and the API — including on the WebSocket handshake.
