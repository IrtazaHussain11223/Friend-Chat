# Friend Chat

A private, mobile-first real-time chat app built with Next.js App Router, TypeScript, Tailwind CSS, and Pusher.

## Setup

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
```

`CHAT_ACCESS_CODE` stays server-side. Successful entry creates an HTTP-only session cookie, and `/api/messages` rejects unauthenticated posts.

## Deploy To Vercel

1. Create a new Vercel project using this `friend-chat` directory as the root.
2. Add all environment variables above.
3. Deploy.

## Future Database Hook

The message API is already the right place to add persistence:

Client -> `/api/messages` -> Save to database -> Trigger Pusher -> Broadcast to connected clients.
