# Deploy Nova Rides to Vercel

## Option A: Deploy with Vercel CLI (from your machine)

1. **Log in to Vercel** (one time):
   ```bash
   npx vercel login
   ```
   Use your email or GitHub; complete the login in the browser if prompted.

2. **Deploy** from the project folder (use the folder with **one space**: `NOVA RIDES 2`):
   ```bash
   cd "C:\Users\dieko\NOVA RIDES 2"
   npm run deploy
   ```
   Or run `npx vercel --prod` directly.

3. **First time**: Vercel will ask to link to an existing project or create a new one. Choose **Create new** and accept the defaults. It will build and deploy and give you a URL like `https://nova-rides-xxx.vercel.app`.

4. **Environment variables**: In [Vercel Dashboard](https://vercel.com/dashboard) → your project → **Settings** → **Environment Variables**, add the same variables you have in `.env` (at least for production):
   - `NEXT_PUBLIC_APP_URL` = your production URL (e.g. `https://nova-rides-xxx.vercel.app`)
   - `JWT_SECRET`
   - `PAYSTACK_SECRET_KEY` (if using Paystack)
   - `STRIPE_SECRET_KEY` (if using Stripe)
   - `RESEND_API_KEY`, `EMAIL_FROM` (for email verification)
   - `CRON_SECRET` (same value as in `.env` – required for the daily licence-expiry cron)

   Then trigger a **Redeploy** (Deployments → … → Redeploy) so the new env vars are used.

---

## Option B: Deploy from GitHub (recommended)

1. **Push your code to GitHub** (if not already):
   - Create a repo on GitHub, then:
   ```bash
   cd "C:\Users\dieko\NOVA RIDES 2"
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Import in Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - **Import** your GitHub repo
   - Leave **Framework Preset** as Next.js and **Root Directory** as `.`
   - Click **Deploy**

3. **Add environment variables** (as in Option A, step 4), then redeploy.

4. **Set production URL**: Set `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g. `https://your-project.vercel.app`).

---

## Troubleshooting: NOT_FOUND (404)

If you see Vercel’s **NOT_FOUND** error:

1. **Check the URL** – Use the exact deployment URL from the Vercel dashboard (e.g. `https://your-project.vercel.app`). No typos, and include `https://`.
2. **Confirm the deployment exists** – In [Vercel Dashboard](https://vercel.com/dashboard) → your project → **Deployments**, ensure there is a successful deployment. If the latest one failed, fix the build and redeploy.
3. **Review deployment logs** – Open the deployment → **Building** / **Runtime Logs** to see build or runtime errors that might make the app unavailable.
4. **Permissions** – Ensure your account has access to the project (team/role).
5. **After linking GitHub** – If you just connected the repo, wait for the first build to finish; the project URL is only valid once a deployment succeeds.

If a *specific path* on your app returns 404 (e.g. `/some-page`), that route may be missing in the app (no `page.tsx` for that segment). Add the route or use the in-app 404 (Back to home) for unknown paths.

---

After deployment, the daily cron (licence expiry check) runs automatically at 6:00 AM UTC as long as `CRON_SECRET` is set in the Vercel project.
