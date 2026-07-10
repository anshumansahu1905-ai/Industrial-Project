# Northbound — MERN E-Commerce Platform

A full-stack store: product catalog with search/filters, cart, Stripe checkout,
an admin dashboard, and a lightweight recommendation engine. Built on MongoDB,
Express, React (Vite), and Node.

## Structure

```
ecommerce-platform/
  backend/     Express API, MongoDB models, Stripe webhook
  frontend/    React app (Vite)
```

## Prerequisites

- Node 18+
- A MongoDB instance (local `mongod`, or a free Atlas cluster)
- A Stripe account (test mode is fine) for the secret key, publishable key,
  and webhook signing secret

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
npm run seed     # loads sample products + an admin user (admin@example.com / admin1234)
npm run dev      # starts on http://localhost:5000
```

To receive Stripe webhooks locally, run the Stripe CLI in a separate terminal:

```bash
stripe listen --forward-to localhost:5000/api/orders/webhook
```

It will print a `whsec_...` value — put that in `STRIPE_WEBHOOK_SECRET`.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
# edit .env: set VITE_STRIPE_PUBLISHABLE_KEY
npm run dev      # starts on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `localhost:5000`, so no CORS
config is needed in development.

## What's implemented

- **Auth**: JWT-based register/login, password hashing with bcrypt, protected
  and admin-only routes.
- **Catalog**: text search, category/price filters, sorting, pagination.
- **Cart & checkout**: server-side cart, Stripe PaymentIntent flow, order
  totals recomputed server-side (never trusts client-sent prices), stock
  decremented via webhook once payment actually succeeds.
- **Admin dashboard**: revenue/order/product stats, low-stock alerts, product
  CRUD, stock editing, order status updates.
- **Recommendations**: two blended signals — content similarity (shared
  category/tags) and co-purchase history ("customers who bought this also
  bought") — surfaced on the homepage, product pages, and a personalized
  "for you" rail based on recently viewed items. No external ML service
  required; it's all computed from the existing product/order data.

## Notes on going to production

- Swap the polling-free Stripe webhook handler in for a real endpoint (already
  wired up) and register it in the Stripe dashboard.
- Add rate limiting on `/api/auth` routes.
- Move product images to a CDN/object storage rather than storing URLs only.
- The recommendation queries are fine at small-to-medium catalog size; if the
  product/order collections get large, precompute the co-purchase matrix in a
  scheduled job instead of computing it per-request.
