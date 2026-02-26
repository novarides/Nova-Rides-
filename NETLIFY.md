# Deploying Nova Rides to Netlify

This project is set up for Netlify. Netlify auto-detects Next.js and uses the [OpenNext adapter](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) for full App Router, API routes, and SSR support.

## Quick deploy

1. Push your code to GitHub (already connected to `https://github.com/novarides/Nova-Rides-.git`).
2. In [Netlify](https://app.netlify.com), click **Add new site** → **Import an existing project** and connect the **Nova-Rides-** repo.
3. Netlify will suggest:
   - **Build command:** `npm run build`
   - **Publish directory:** (leave default; set by Next.js adapter)
4. Add the environment variables below in **Site settings** → **Environment variables**.
5. Deploy.

## Required environment variables

Set these in Netlify **Site settings** → **Environment variables** (and in **Build** so they are available at build time if needed):

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_APP_URL` | Your site URL, e.g. `https://your-site.netlify.app` | Yes (for auth, payments, emails) |
| `JWT_SECRET` | Long random string for JWT signing | Yes |
| `RESEND_API_KEY` | Resend API key for verification emails | Optional (emails fallback if unset) |
| `EMAIL_FROM` | Sender for emails, e.g. `Nova Rides <noreply@yourdomain.com>` | Optional |
| `PAYSTACK_SECRET_KEY` | Paystack secret (NGN payments) | Optional |
| `STRIPE_SECRET_KEY` | Stripe secret (USD payments) | Optional |
| `NGN_TO_USD_RATE` | e.g. `0.0006` for Stripe conversion | Optional |
| `OPENAI_API_KEY` | For AI price recommendation (otherwise heuristic used) | Optional |
| `CRON_SECRET` | Secret for cron endpoint (e.g. license expiry check) | Optional |

Use the same names and values as in `.env.example`; only `NEXT_PUBLIC_APP_URL` must be your Netlify URL (or custom domain).

## Limitations on Netlify (serverless)

- **Data persistence:** The app uses an in-memory store with optional file persistence. On Netlify the filesystem is read-only, so:
  - Data does **not** persist across requests or deployments (each serverless invocation may see a fresh in-memory state).
  - For production you should add a database (e.g. PostgreSQL with Prisma, Supabase, or PlanetScale) and replace `lib/store.ts` with DB calls.
- **File uploads:** Avatar and document uploads write to the local filesystem. On Netlify those writes are not persistent, so:
  - Upload APIs return a clear error: *"File storage is not available in this environment..."* instead of crashing.
  - For production, use cloud storage (e.g. Netlify Blobs, S3, or Cloudinary) and update `lib/documents.ts` and the avatar API route accordingly.

With the above in mind, the site will **build and run** on Netlify; auth, browsing, and API routes work, but data and uploads are not persistent until you add a database and blob storage.

## Optional: skew protection

To reduce issues when a new deployment goes live while users are active, you can enable [skew protection](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/#skew-protection):

1. In Netlify, set environment variable: `NETLIFY_NEXT_SKEW_PROTECTION` = `true`.
2. If using Next.js &lt; 14.1.4, add to `next.config.js`:
   ```js
   experimental: {
     useDeploymentId: true,
     useDeploymentIdServerActions: true,
   },
   ```
3. Redeploy.

## Build and run locally

```bash
npm install
npm run build
npm run start
```

For local dev with file persistence and uploads:

```bash
npm run dev
```

Ensure `.env` is present (copy from `.env.example` and fill in values).
