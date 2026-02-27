# Supabase setup for Nova Rides

Nova Rides can use **Supabase** as a real database so logins and registrations work reliably on Netlify.

This guide assumes you are a beginner and walks you through step by step.

---

## 1. Create a Supabase project

1. Go to `https://supabase.com` and sign in with GitHub or email.
2. Click **New project**.
3. Choose a **strong database password** (save it somewhere).
4. Wait for the project to finish provisioning.

---

## 2. Get your Supabase API keys

1. In your Supabase project, go to **Settings → API**.
2. Under **Project URL**, copy the URL that looks like:
   - `https://your-project-id.supabase.co`
3. Under **Service role** (at the bottom), click **Reveal** and copy the long key.
   - This is **sensitive**, do not share it publicly.

You will use these values in Netlify:

- `SUPABASE_URL` = your project URL
- `SUPABASE_SERVICE_ROLE_KEY` = the service role key

---

## 3. Create the `users` table in Supabase

In Supabase, open the **SQL Editor** and run this SQL once:

```sql
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text,
  role text not null default 'renter',
  verified boolean not null default false,
  email_verify_token text,
  email_verify_expires timestamptz,
  first_name text not null,
  last_name text not null,
  phone text,
  banned boolean default false,
  banned_at timestamptz,
  banned_reason text,
  banned_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_email_idx on public.users (email);
create index if not exists users_email_verify_token_idx on public.users (email_verify_token) where email_verify_token is not null;
```

If you already created the table without the verification columns, run this in the SQL Editor to add them:

```sql
alter table public.users add column if not exists email_verify_token text;
alter table public.users add column if not exists email_verify_expires timestamptz;
create index if not exists users_email_verify_token_idx on public.users (email_verify_token) where email_verify_token is not null;
```

This matches the minimal fields used by `lib/supabase.ts`.

---

## 4. Add Supabase env vars in Netlify

In the Netlify dashboard for your **Nova Rides** site:

1. Go to **Site settings → Build & deploy → Environment → Environment variables**.
2. Add:

   - `SUPABASE_URL` = your Supabase project URL  
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key

3. Click **Save**.
4. Trigger a new deploy (Deploys → **Trigger deploy** → **Deploy site**).

> Note: The code is written to **fall back to the existing in-memory store** when Supabase is not configured. Once we finish wiring auth to Supabase, production will use Supabase if these env vars are present.

---

## 5. Next steps (code)

The next steps in code (which the assistant will handle) are:

- On **register/login**, read/write users from Supabase instead of the in-memory store when Supabase is configured.
- For **sessions**, look up the user in Supabase by `id` from the JWT.
- Keep the JSON store for local development or for environments without Supabase configured.

