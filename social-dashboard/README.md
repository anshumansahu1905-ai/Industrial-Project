# PulseGrid

A social media dashboard: profiles with media uploads, a following-based feed with likes/comments, real-time
one-to-one messaging over WebSockets, and an analytics view of your own engagement. Notifications (likes,
comments, follows) are fanned out through Redis pub/sub so they land on the right open connection in real time.

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.IO, Redis (ioredis), JWT auth, Multer for uploads
- **Frontend:** React (Vite), React Router, Tailwind CSS, Recharts, Socket.IO client

## Prerequisites

You'll need these running locally (or pointed at hosted instances):

- Node.js 18+
- MongoDB (e.g. `brew install mongodb-community` or a free Atlas cluster)
- Redis (e.g. `brew install redis` or a free Upstash/Redis Cloud instance)

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI, REDIS_URL, and a real JWT_SECRET
npm run dev
```

The API listens on `http://localhost:5000` by default. `GET /api/health` should return `{ "status": "ok" }`
once Mongo and Redis are reachable.

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api`, `/uploads`, and `/socket.io` to the backend,
so you don't need to configure CORS URLs beyond what's in `.env`.

## 3. Try it out

1. Register two accounts (use two browser profiles or an incognito window for the second).
2. Post something from account A, including an image if you'd like.
3. Follow account A from account B, then like/comment on the post — account A gets a real-time notification.
4. Open Messages from either account and send a message — it arrives instantly over the socket, with a
   typing indicator.
5. Check the Analytics tab on account A: the pulse graph and bar chart are built from real like/comment counts
   on that account's own posts, not sample data.

## Project structure

```
backend/
  config/        Mongo + Redis connections
  models/        Mongoose schemas (User, Post, Comment, Message, Notification)
  middleware/    JWT auth guard, Multer upload config, error handler
  controllers/   Route logic
  routes/        Express routers
  sockets/       Socket.IO auth + real-time messaging + Redis-bridged notifications
  utils/         Token signing, notification publish helper

frontend/
  src/context/       Auth state, socket connection
  src/hooks/         useNotifications (live + fetched)
  src/components/    PostCard, ComposeBox, CommentThread, ChatWindow, ConversationList,
                     NotificationDrawer, PulseGraph (the engagement waveform), layout shell
  src/pages/         Login, Register, Feed, Profile, Messages, Analytics
```

## Notes on the Redis notification design

Notifications are written to Mongo *and* published on a Redis channel (`pulsegrid:notifications`) in the same
step (see `backend/utils/notify.js`). Every server process subscribes to that channel and re-emits matching
events to whichever of its own sockets belongs to the recipient. That indirection is what lets this scale
past a single Node process — the process that creates a like doesn't need to be the one holding the
recipient's WebSocket connection.

## Where to take it next

- Pagination/infinite scroll on the feed (the API already accepts `?page=`)
- Group conversations instead of 1:1 only
- Media uploads to S3/Cloudinary instead of local disk
- Rate limiting on auth and post-creation routes
