<div align="center">

<img src="public/images/groupchat-logo.svg" alt="Group Chat logo" width="96" height="96" />

# Group Chat

A realtime, channel-based group chat app — a place for your team to talk.

Live demo link:**[🚀 Live Demo](https://group-chat-app-lime-alpha.vercel.app)**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

<div align="center">

<img width="800" height="500" alt="ScreenRecording2026-06-02at1 01 15PM-ezgif com-video-to-gif-converter (1)" src="https://github.com/user-attachments/assets/755d25be-1d2e-4ed8-a54b-f1b5aeb33696" />

</div>


---

## Overview

Group Chat is a small full-stack app built with the **Next.js App Router** and **Supabase**. Users sign up with an email and password, browse a list of channels, and chat inside them. New messages show up **live** for everyone in the channel — no refresh needed — thanks to Supabase Realtime.

It's a learning project, so the code leans on modern Next.js patterns (Server Components, Server Actions) and keeps the moving parts small and readable.

## Features

- 🔐 **Email + password auth** — sign up and log in, backed by Supabase Auth
- 💬 **Channels** — create new channels, browse them on the home page, delete the ones you don't need
- ⚡ **Realtime messages** — messages appear instantly via Supabase Realtime (`postgres_changes`)
- 🧑 **Message bubbles** — sender name, avatar initials, and timestamps, with your own messages aligned to the right
- 🖥️ **Server-rendered** — channel lists and message history are fetched on the server with React Server Components
- 🎨 **Styled with CSS Modules** — scoped styles per route, Geist font via `next/font`

## Tech Stack

| Layer       | Choice                                                        |
| ----------- | ------------------------------------------------------------- |
| Framework   | [Next.js 16](https://nextjs.org) (App Router)                 |
| UI          | [React 19](https://react.dev)                                 |
| Backend     | [Supabase](https://supabase.com) — Auth, Postgres, Realtime   |
| Auth helper | [`@supabase/ssr`](https://github.com/supabase/auth-helpers)   |
| Language    | [TypeScript](https://www.typescriptlang.org)                  |
| Styling     | CSS Modules + `next/font` (Geist)                             |

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Home: landing page (logged out) / channel list (logged in)
│   ├── layout.tsx               # Root layout, fonts, metadata
│   ├── actions.ts               # Server Actions: signOut, createChannel, sendMessage, deleteChannel
│   ├── login/page.tsx           # Email/password sign up + log in (client component)
│   └── channels/[id]/
│       ├── page.tsx             # Channel view: loads history, renders the message list + composer
│       └── messages.tsx         # Client component that subscribes to realtime inserts
└── utils/supabase/
    ├── server.ts                # Supabase client for Server Components / Actions
    ├── client.ts                # Supabase client for the browser
    └── middleware.ts            # Refreshes the auth session on each request
proxy.ts                         # Wires the session-refresh logic into the request pipeline
```

> **Note:** In this version of Next.js, the request-level hook lives in `proxy.ts` (exporting a `proxy` function) rather than the `middleware.ts` you may have seen elsewhere. It calls into `src/utils/supabase/middleware.ts` to keep the Supabase session fresh.

## Getting Started

### Prerequisites

- **Node.js 20+**
- A free [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone <your-repo-url>
cd groupchat
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root with your Supabase project's URL and publishable (anon) key — both are found under **Project Settings → API** in the Supabase dashboard:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

> `.env.local` is gitignored, so your keys stay out of version control.

### 3. Set up the database

The app expects three tables in your Supabase project — `profiles`, `channels`, and `messages` — plus Realtime enabled on `messages`. Run the SQL below in the Supabase **SQL Editor** to get a working starting point.

<details>
<summary><strong>Show starter SQL</strong></summary>

```sql
-- One profile per user, holds the display name shown next to messages
create table public.profiles (
  id       uuid primary key references auth.users (id) on delete cascade,
  username text
);

-- Chat rooms
create table public.channels (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  created_by  uuid references auth.users (id),
  created_at  timestamptz not null default now()
);

-- Individual messages
create table public.messages (
  id         uuid primary key default gen_random_uuid(),
  content    text not null,
  channel_id uuid references public.channels (id) on delete cascade,
  user_id    uuid references auth.users (id),
  created_at timestamptz not null default now()
);

-- Create a profile automatically when a new user signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Let Realtime broadcast inserts on the messages table
alter publication supabase_realtime add table public.messages;

-- Enable Row Level Security and allow signed-in users to read/write.
-- These are permissive starter policies — tighten them before going to production.
alter table public.profiles enable row level security;
alter table public.channels enable row level security;
alter table public.messages enable row level security;

create policy "authenticated can read profiles"
  on public.profiles for select to authenticated using (true);

create policy "authenticated can read channels"
  on public.channels for select to authenticated using (true);
create policy "authenticated can insert channels"
  on public.channels for insert to authenticated with check (true);
create policy "authenticated can delete channels"
  on public.channels for delete to authenticated using (true);

create policy "authenticated can read messages"
  on public.messages for select to authenticated using (true);
create policy "authenticated can insert messages"
  on public.messages for insert to authenticated with check (auth.uid() = user_id);
```

</details>

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and start a channel.

## How It Works

- **Auth & sessions** — `login/page.tsx` calls Supabase Auth in the browser. On every request, `proxy.ts` → `utils/supabase/middleware.ts` refreshes the session cookie so Server Components always see the current user.
- **Reading data** — `page.tsx` and `channels/[id]/page.tsx` are async Server Components. They use the server Supabase client to fetch channels and message history before the page is sent to the browser.
- **Writing data** — forms post to **Server Actions** in `actions.ts` (`createChannel`, `sendMessage`, `deleteChannel`), which insert into Postgres and call `revalidatePath` to refresh the affected page.
- **Going realtime** — `messages.tsx` is a client component. It subscribes to a Supabase channel and listens for `INSERT`s on `messages` filtered by `channel_id`, appending each new row to the list as it arrives.

## Available Scripts

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start the development server             |
| `npm run build` | Create a production build                |
| `npm run start` | Run the production build                 |
| `npm run lint`  | Lint the project with ESLint             |

## Deploy

This app is deployed on [Vercel](https://vercel.com) at **[group-chat-app-lime-alpha.vercel.app](https://group-chat-app-lime-alpha.vercel.app)**. To deploy your own, import the repo into Vercel, add the two `NEXT_PUBLIC_SUPABASE_*` environment variables in your project settings, and point your Supabase project at the deployed URL.
