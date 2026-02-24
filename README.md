# Nova Rides

Peer-to-peer car sharing platform (like Turo) – **Nova Rides** brand. MVP with JSON API and web UI.

## Features (MVP)

- **User & account**: Registration with **real email** and **email verification** (Resend), login (JWT), roles (host, renter, admin), **profile editing** and **display picture (avatar)** upload, terms/privacy acceptance
- **Vehicle listings**: Create/edit/delete, categories, pricing (daily/weekly), availability, location, instant vs approval booking
- **Search**: Location, dates, price range, vehicle type, sorting (featured, price, rating)
- **Bookings**: Create, approve/reject, status, payment status, security deposit
- **Payments**: **Paystack** (Nigeria, NGN) and **Stripe** (international, USD); test-mode fallback when no keys set
- **Reviews**: Post-trip reviews and star ratings
- **Dashboards**: Host (vehicles, earnings, bookings), Renter (trip history), Admin (placeholder)

## Tech stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, in-memory JSON store (replace with PostgreSQL/MongoDB for production)
- **Auth**: JWT (httpOnly cookie), bcrypt passwords

## Quick start

**Use the project folder with exactly one space:** `NOVA RIDES 2` (not `NOVA RIDES  2`). If you see `ENOENT: no such file or directory, open '...\package.json'`, your terminal is in the wrong folder.

```bash
cd "C:\Users\dieko\NOVA RIDES 2"
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo login

- **Host**: `host@novarides.com` / `password123`
- **Renter**: `renter@novarides.com` / `password123`

## API (JSON)

All API responses are JSON. See `api-structure.json` for endpoint list and data models.

- `POST /api/auth/register` – Register
- `POST /api/auth/login` – Login
- `GET /api/auth/me` – Current user
- `GET /api/vehicles` – List vehicles
- `GET /api/vehicles/[id]` – Get vehicle
- `POST /api/vehicles` – Create vehicle (host)
- `GET /api/search` – Search (city, dates, price, type, sort)
- `GET /api/bookings` – My bookings
- `POST /api/bookings` – Create booking
- `PATCH /api/bookings/[id]` – Update (e.g. confirm/reject)
- `GET /api/payments/config` – Which gateways are enabled
- `POST /api/payments/paystack/initialize` – Start Paystack (NGN); returns redirect URL
- `GET /api/payments/paystack/verify?reference=` – Verify Paystack payment
- `POST /api/payments/stripe/create-session` – Start Stripe Checkout (USD); returns redirect URL
- `GET /api/payments/stripe/verify?session_id=` – Verify Stripe payment
- `POST /api/payments/authorize` – Test-mode payment (when no gateway keys)
- `GET /api/reviews`, `POST /api/reviews` – Reviews

## Project structure

```
app/
  api/          # JSON API routes (auth, vehicles, search, bookings, reviews, payments)
  page.tsx      # Home
  search/       # Search results
  vehicles/[id] # Vehicle detail + booking widget
  bookings/[id] # Booking confirmation + pay
  login/        # Login
  register/     # Sign up (host/renter)
  dashboard/
    host/       # Host dashboard + vehicles
    renter/     # Renter trips
    admin/      # Admin panel (placeholder)
lib/
  types.ts      # TypeScript types (User, Vehicle, Booking, etc.)
  store.ts      # In-memory data store
  auth.ts       # JWT helpers
components/      # Header, Footer, SearchForm, VehicleGrid
```

## Payments (Nigeria & international)

- **Nigeria (NGN)**: [Paystack](https://paystack.com). Set `PAYSTACK_SECRET_KEY` in `.env`. Users see “Pay with Paystack (NGN)” and are redirected to Paystack to pay; callback verifies and marks booking paid.
- **International (USD)**: [Stripe](https://stripe.com). Set `STRIPE_SECRET_KEY`. Amount is converted from NGN using `NGN_TO_USD_RATE` (default 0.0006). Users see “Pay with Card / Stripe (USD)”.
- **Test mode**: If neither key is set, “Pay now (test mode)” uses the simulated authorize endpoint.

Copy `.env.example` to `.env` and set `NEXT_PUBLIC_APP_URL` and the keys you need.

## Email verification & profile

- **Verification**: On sign-up, a verification email is sent via [Resend](https://resend.com). Set `RESEND_API_KEY` and `EMAIL_FROM` in `.env`. Users click the link in the email (or open `/verify-email?token=...`) to verify. Without Resend, the verification link is logged to the server console for testing.
- **Profile**: Logged-in users can go to **Profile** (header → name/avatar) to edit first name, last name, phone, and upload a **display picture** (JPEG/PNG/GIF/WebP, max 5MB). Avatars are stored under `public/avatars/`.
- **Resend verification**: From the profile page, unverified users can click “Resend verification email”.

## ID & driver's licence verification

- **Government-issued ID**: On **Profile**, users upload front and back (images or PDF). Stored under `public/documents/{userId}/identity/`. Once both are uploaded, the account is marked identity-verified.
- **Driver's licence**: Users upload front, back, and **expiry date**. If the expiry date is in the future, the licence is marked verified. Required to **book** as a renter; if the licence is missing or expired, booking is blocked with a message to update in Profile.
- **Expiry reminder**: A **daily cron** is configured in `vercel.json` to call `/api/cron/check-license-expiry` at 6:00 AM UTC. It (1) sends an email one week before a licence expires, (2) marks licence as unverified when expired. **On Vercel**: set the `CRON_SECRET` env var in your project (same value as in `.env`); Vercel will send it as `Authorization: Bearer <CRON_SECRET>`. **Not on Vercel**: call `GET /api/cron/check-license-expiry?secret=YOUR_CRON_SECRET` daily via [cron-job.org](https://cron-job.org) or similar, using your deployed URL.

## Production notes

- Replace in-memory store with PostgreSQL or MongoDB
- Add image upload (e.g. Cloudinary/S3)
- Add email/SMS notifications
- Enforce identity and license verification flows
- Set `JWT_SECRET` and payment keys in environment
