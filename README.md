<div align="center">

<img src="public/images/groupchat-logo.svg" alt="Group Chat logo" width="96" height="96" />

# Group Chat

A realtime, channel-based group chat app — a place for your team to talk.

Live demo link:**[🚀 Live Demo](https://group-chat-app-lime-alpha.vercel.app)**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

<div align="center">

<img width="800" height="500" alt="ScreenRecording2026-06-02at1 01 15PM-ezgif com-video-to-gif-converter (1)" src="https://github.com/user-attachments/assets/755d25be-1d2e-4ed8-a54b-f1b5aeb33696" />

</div>


---

> **🚧 Backend in progress.** This project originally ran on **Supabase** (Auth, Postgres, Realtime). Supabase has been **fully removed**, and a custom backend is being built in its place. The **UI is complete and server-rendered**, but data, auth, and realtime are currently **stubbed with placeholder values** — the app builds and every screen renders, but channels and messages don't persist yet. The demo gif above shows the original Supabase-backed build.

## Overview

Group Chat is a small full-stack app built with the **Next.js App Router**. The idea: users sign up with an email and password, browse a list of channels, and chat inside them, with new messages appearing live for everyone in the channel.

It's a learning project. The frontend leans on modern Next.js patterns (Server Components, Server Actions), and the backend is being written from scratch to replace Supabase.

## Status

| Area                              | State                                          |
| --------------------------------- | ---------------------------------------------- |
| UI & routing                      | ✅ Complete                                     |
| Server Components / Actions wiring | ✅ In place (currently reading placeholder data) |
| Auth                              | 🚧 To build                                    |
| Database / persistence            | 🚧 To build                                    |
| Realtime updates                  | 🚧 To build                                    |

## Features

- 💬 **Channels** — the home page lists channels with create and delete controls
- 🧑 **Message bubbles** — sender name, avatar initials, and timestamps, with your own messages aligned to the right
- 🖥️ **Server-rendered** — channel lists and message history load in async React Server Components
- 🔐 **Auth screens** — email/password login + sign-up UI, ready to wire to a backend
- 🎨 **Styled with CSS Modules** — scoped styles per route, Geist font via `next/font`

## Tech Stack

| Layer     | Choice                                                |
| --------- | ----------------------------------------------------- |
| Framework | [Next.js 16](https://nextjs.org) (App Router)         |
| UI        | [React 19](https://react.dev)                         |
| Backend   | Custom — **in progress** (replacing Supabase)         |
| Language  | [TypeScript](https://www.typescriptlang.org)          |
| Styling   | CSS Modules + `next/font` (Geist)                     |

## Project Structure

```
src/
└── app/
    ├── page.tsx                 # Home: landing page (logged out) / channel list (logged in)
    ├── layout.tsx               # Root layout, fonts, metadata
    ├── actions.ts               # Server Actions: signOut, createChannel, sendMessage, deleteChannel
    ├── login/page.tsx           # Email/password sign up + log in (client component)
    └── channels/[id]/
        ├── page.tsx             # Channel view: renders the message list + composer
        └── messages.tsx         # Client component that renders the message list
```

> The Server Components and Server Actions currently read placeholder values — `null` for the current user/channel and empty arrays for channels/messages — where Supabase used to provide data. Those placeholders are the seams the new backend plugs into.

## Getting Started

### Prerequisites

- **Node.js 20+**

### 1. Clone and install

```bash
git clone <your-repo-url>
cd groupchat
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The landing page renders immediately; because there's no backend yet, you'll see the logged-out view and empty channels until the backend is wired up.

## How It Works

- **Pages** — `page.tsx` and `channels/[id]/page.tsx` are async Server Components. They currently use placeholder data (`user = null`, empty channel and message lists) in the spot where they'll fetch from the backend.
- **Writing data** — forms post to **Server Actions** in `actions.ts` (`createChannel`, `sendMessage`, `deleteChannel`, `signOut`). Each one parses the submitted form and calls `revalidatePath`; the persistence step in the middle is where the backend goes.
- **Auth UI** — `login/page.tsx` collects an email and password. Its `handleLogIn` / `handleSignUp` handlers are placeholders until real auth is wired in.
- **Messages list** — `messages.tsx` is a client component that renders the `initialMessages` passed from the server. Live updates went away with Supabase Realtime; re-adding them (polling, SSE, or websockets) is a backend task — the `channelId` prop is already threaded through for it.

## Available Scripts

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start the development server             |
| `npm run build` | Create a production build                |
| `npm run start` | Run the production build                 |
| `npm run lint`  | Lint the project with ESLint             |

## Deploy

This app is deployed on [Vercel](https://vercel.com) at **[group-chat-app-lime-alpha.vercel.app](https://group-chat-app-lime-alpha.vercel.app)**. That deployment still reflects the earlier Supabase-backed build — redeploy once the new backend lands. No Supabase environment variables are needed anymore; add whatever your new backend requires instead.
