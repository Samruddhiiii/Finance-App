
# Welth — AI-powered Personal Finance Platform

Welth is a Next.js finance app that helps you track accounts, record transactions, set budgets, and get AI assistance for receipt capture and monthly insights.

This repo is built as a real, deployable product (auth, DB, background jobs, email delivery) — not a toy demo.

## What you can do

- **Sign in / Sign up** with Clerk
- **Create accounts** (Current / Savings) and mark a **default account**
- **Add transactions** (Income / Expense) with categories
- **Scan receipts with AI** (Gemini) to auto-fill amount/date/description/category
- **Budgets**: set a monthly budget and track progress on the dashboard
- **Recurring transactions** processed automatically via Inngest
- **Monthly email reports** with AI insights + **budget alerts** (Resend)
- **INR-first UI**: currency is formatted consistently as ₹ across the app

## Tech stack

- **Next.js 15** (App Router + Server Actions)
- **Prisma** + **PostgreSQL**
- **Clerk** for authentication
- **Gemini** via `@google/genai` (`gemini-2.5-flash`) for receipt parsing + insights
- **Inngest** for cron + background workflows
- **Resend** for email delivery
- **Arcjet** for bot protection + rate limiting
- Tailwind + shadcn/ui components

## Local setup

### Prerequisites

- Node.js **20+** (recommended)
- PostgreSQL database (local Docker or hosted)
- Clerk application (publishable + secret keys)

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env` file in the project root.

Minimum required:

```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Gemini
GEMINI_API_KEY="..."
```

Optional (recommended for full functionality):

```bash
# Optional direct DB URL for Prisma CLI operations (migrate/introspect)
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME"

# Arcjet (security + rate limits)
ARCJET_KEY="..."

# Resend (emails)
RESEND_API_KEY="..."
```

Notes:

- `.env` is ignored by git (see `.gitignore`). Don’t commit secrets.
- In development, Arcjet middleware runs in **DRY_RUN** mode (so it won’t hard-block your requests).

### 3) Set up the database

Run Prisma migrations and generate the client:

```bash
npx prisma migrate dev
```

If you ever need a fresh DB during development:

```bash
npx prisma migrate reset
```

### 4) Start the app

```bash
npm run dev
```

Open http://localhost:3000

## How the app works (quick mental model)

- Clerk handles auth. On each request, the header calls `checkUser()` to ensure a matching `User` row exists in Postgres.
- Accounts and transactions are stored in Postgres via Prisma.
- Receipt scan runs as a Server Action (`scanReceipt(file)`). The client uploads the file and the server calls Gemini.
- Inngest handles background tasks:
	- recurring transactions (daily trigger + per-transaction processing)
	- monthly report emails (1st of month)
	- budget alert checks (every 6 hours)

## Running background jobs locally (Inngest)

The app exposes an Inngest handler at `/api/inngest`.

Typical local workflow:

1. Run the Next.js dev server:
	 ```bash
	 npm run dev
	 ```
2. In a second terminal, run Inngest Dev pointed at your endpoint:
	 ```bash
	 npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
	 ```

If the CLI command differs on your machine, follow the Inngest docs and keep the endpoint as `/api/inngest`.

## Receipt scanning behavior (Gemini)

- Works best with clear photos (good lighting, minimal blur).
- If the receipt **doesn’t include an explicit TOTAL**, the prompt asks Gemini to **sum line-item prices** and return that as the total.
- The app accepts `image/*` and `application/pdf`, but results are usually best with images.

## Deployment notes

Checklist before deploying:

- Set all production env vars (DB, Clerk, Gemini, and optional Resend/Arcjet).
- Run migrations in your deploy pipeline:
	```bash
	npx prisma migrate deploy
	```
- Ensure your deployment uses a Node.js runtime for server actions that rely on `Buffer` (receipt scanning).
- Configure Inngest (cloud) to call your deployed `/api/inngest` endpoint for cron + jobs.

## Docker

This repo includes a `Dockerfile` and `docker-compose.yaml`.

Quick start:

1. Create your env file:
	```bash
	cp .env.example .env
	```
2. Fill `.env` with real keys (Clerk, Gemini, DB, etc.).
3. Build and run:
	```bash
	docker compose up --build
	```

Notes:

- Don’t put secrets directly inside `docker-compose.yaml`.
- The compose file includes an optional local Postgres service. If you use Supabase/Neon, set `DATABASE_URL`/`DIRECT_URL` in `.env` and you can remove the `db` service.

## Troubleshooting

- **Signed out users seeing protected pages**: `(main)` routes are protected at the layout level and should redirect to `/sign-in`.
- **Arcjet blocking in dev**: middleware uses DRY_RUN in development; if you’re still blocked, temporarily unset `ARCJET_KEY`.
- **Prisma issues after install**: the repo runs `prisma generate` on `postinstall`, but you can always re-run:
	```bash
	npx prisma generate
	```

---

Maintained by **samruddhi**.

# finance
