# Approved Content Variant Generator (POC)

Internal POC for generating channel-appropriate content variants from approved source material. Uses Next.js, Supabase (auth + DB), and n8n (+ LLM) for generation.

## What’s in the repo

- **Library** – Store and manage approved source content (CRUD).
- **Generate** – Pick content + channel/audience/tone; app calls n8n webhook; variants saved as drafts.
- **Review** – List variants, move draft → in review → approve/reject.
- **Export** – List approved variants; copy or download (TXT/CSV).

## Setup

### 1. Env

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – anon key
- `N8N_WEBHOOK_URL` – n8n webhook URL for variant generation (see [docs/N8N_CONTRACT.md](docs/N8N_CONTRACT.md))
- Optional: `SUPABASE_SERVICE_ROLE_KEY` for the seed script

### 2. Database

In the [Supabase SQL Editor](https://supabase.com/dashboard), run the script:

`supabase/schema.sql`

This creates `approved_content`, `content_variants`, enums, and RLS.

### 3. Seed (optional)

Create a test user and mock approved content:

```bash
pnpm run seed
```

Sign in with the email/password printed (default `test@example.com` / `test-password-seed` unless you set `SEED_USER_EMAIL` / `SEED_USER_PASSWORD`).

### 4. Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in (or sign up), then use Library, Generate, Review, and Export.

## n8n contract

The app POSTs to `N8N_WEBHOOK_URL` with `{ title, body, channel, audience, tone }` and expects `{ variants: [ { channel, audience, tone, text } ] }`. See [docs/N8N_CONTRACT.md](docs/N8N_CONTRACT.md) for the full contract and guardrails notes.

## Stack

- Next.js (App Router), React, TypeScript
- Supabase (auth, Postgres, RLS)
- shadcn/ui, Tailwind
- n8n + LLM (e.g. Requesty) for variant generation
