# Friend Chat

A private, mobile-first real-time chat app built with Next.js App Router, TypeScript, Tailwind CSS, Pusher, and Supabase.

## Features

- Access-code protected entry
- Username onboarding
- Realtime Pusher broadcasts
- Supabase message persistence
- Saved chat history on room entry
- Responsive WhatsApp/Discord-style UI
- Vercel-ready API routes

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Add these locally in `.env.local` and in Vercel Project Settings:

```env
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=ap2
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=ap2

CHAT_ACCESS_CODE=FriendChat2026
CHAT_SESSION_SECRET=replace_with_a_long_random_secret

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

`CHAT_ACCESS_CODE` is preferred because it stays server-side. The app also accepts `NEXT_PUBLIC_CHAT_ACCESS_CODE` as a compatibility fallback, but do not use the public variable unless you need it for an existing deployment.

Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code. This project only uses it inside Next.js API routes.

## Supabase Setup

1. Create a Supabase project.
2. Open Supabase SQL Editor.
3. Run the SQL from `database.sql`.
4. Go to Project Settings -> API.
5. Copy `Project URL` into `SUPABASE_URL`.
6. Copy `service_role` key into `SUPABASE_SERVICE_ROLE_KEY`.

The app saves messages through `/api/messages` before broadcasting them with Pusher.

## Pusher Setup

1. Create a Pusher Channels app.
2. Copy App ID, Key, Secret, and Cluster into your environment variables.
3. Use the same key and cluster for `NEXT_PUBLIC_PUSHER_KEY` and `NEXT_PUBLIC_PUSHER_CLUSTER`.

## Vercel Deployment

1. Push this project to GitHub.
2. In Vercel, create or open the project.
3. Set the project root to this folder if needed: `friend-chat`.
4. Go to Settings -> Environment Variables.
5. Add every variable from the Environment Variables section.
6. Redeploy from Vercel Deployments after changing env variables.

Recommended production access variables:

```env
CHAT_ACCESS_CODE=irtash123_123
CHAT_SESSION_SECRET=use_a_long_random_secret
```

If your current Vercel project only has `NEXT_PUBLIC_CHAT_ACCESS_CODE`, either add `CHAT_ACCESS_CODE` too or keep the public fallback. Adding `CHAT_ACCESS_CODE` is safer.

## Message Flow

Client -> `/api/messages` -> Supabase insert -> Pusher trigger -> connected clients receive `new-message`.

When a user enters the chat, the client calls `GET /api/messages` and loads the latest saved messages.
