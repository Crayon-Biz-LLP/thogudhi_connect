# Thogudhi Inai (தொகுதி இணை)

A bilingual (English / Tamil) civic engagement platform for the **Thousand Lights
Constituency, Chennai** — an initiative of **We The Leaders**.

Residents can report local issues, ask questions, share ideas and views, and track
what happens next with a private reference code. Approved, sanitized summaries appear
on a public Community Board. Volunteers and moderators review submissions in a
private dashboard.

> A neutral, non-partisan community initiative. Not a government grievance portal.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | [TanStack Start](https://tanstack.com/start) v1 (SSR) |
| Language | TypeScript 5.8 (strict) |
| UI | React 19 |
| Routing | TanStack Router — file-based, `src/routes/` |
| Build | Vite 8 + Nitro (Cloudflare Workers target) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Data fetching | TanStack Query |
| Validation | Zod |
| Icons | lucide-react |
| i18n | Hand-rolled dictionary (`src/lib/i18n.tsx`), `localStorage`-backed |
| Database | **Supabase** — Postgres + Row Level Security + Auth + Storage |
| Auth | Supabase Auth (email/password) |

Supabase is the intended backend. The database schema, RLS policies and triggers ship
in `supabase/migrations/` and are ready to apply — see
[Database](#database) below.

---

## Prerequisites

- **Node.js 20+** or [Bun](https://bun.sh) (recommended — the repo ships a `bun.lock`)
- A Supabase project (free tier is fine)

Check what you have:

```sh
node --version   # v20 or newer
bun --version    # optional
```

---

## Installation

### 1. Install dependencies

Using **Bun** (recommended — uses the committed `bun.lock`):

```sh
bun install
```

Using **npm**:

```sh
npm install
```

> `bunfig.toml` sets `minimumReleaseAge = 86400`, a 24-hour supply-chain guard that
> makes Bun refuse package versions published less than a day ago. This is
> intentional. If installation fails on a recent version, that guard is working.

If you just installed Bun and get `command not found: bun`, reload your shell so the
updated `PATH` takes effect:

```sh
exec /bin/zsh     # or: source ~/.zshrc
```

### 2. Configure environment variables

```sh
cp .env.example .env
```

Then fill in `.env` with the values from **Supabase Dashboard → your project →
Settings → API**:

| Variable | Required | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | yes | Server-side project URL |
| `SUPABASE_PUBLISHABLE_KEY` | yes | Server-side auth verification |
| `SUPABASE_SERVICE_ROLE_KEY` | yes¹ | Admin client, bypasses RLS |
| `VITE_SUPABASE_URL` | yes | Browser-visible project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | yes | Browser-visible key |
| `SUPABASE_PROJECT_ID` | no | Salt for IP hashing in rate limiting |

¹ Required for the public submission, tracking and attachment features. Without it
those actions fail; page rendering is unaffected.

> **`.env` is gitignored. Never commit it.**
> `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security entirely and grants full
> read/write on every table and storage bucket. Any Vite variable prefixed
> `VITE_` is inlined into the public browser bundle — only ever put the
> *publishable* key behind that prefix.

### 3. Start the dev server

```sh
bun run dev     # or: npm run dev
```

Open the URL it prints (default <http://localhost:5173>).

The Vite config enables `strictPort`, so if 5173 is taken the server will fail
rather than pick another port. Use `bun run dev --port 5174` to change it.

---

## Available scripts

| Command | Description |
| --- | --- |
| `dev` | Start the dev server with HMR |
| `build` | Production build |
| `build:dev` | Production build in development mode |
| `preview` | Preview a production build |
| `lint` | Run ESLint |
| `format` | Format the codebase with Prettier |

---

## Project structure

```
src/
  routes/                  File-based routes (see src/routes/README.md)
    index.tsx              /                 Landing page
    submit.tsx             /submit           Submission form
    track.tsx              /track            Track by reference ID + code
    board.tsx              /board            Public Community Board
    submitted/$publicId    /submitted/:id    Post-submission confirmation
    auth.tsx               /auth             Team sign-in
    _authenticated/        Team-only routes (SSR disabled)
      dashboard.tsx        /dashboard
      submissions/$id      /submissions/:id  Review + moderation
  lib/
    *.functions.ts         Server functions (TanStack Start `createServerFn`)
    constants.ts           Status/category enums + bilingual labels
    i18n.tsx               Language provider + string dictionary
  integrations/supabase/   Supabase clients, auth middleware (generated)
  components/
    site/                  App-specific components
    ui/                    shadcn/ui primitives
supabase/
  migrations/              Schema, RLS policies, triggers
```

### Routes

| Route | Access | Description |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/submit` | Public | Submission form (rate-limited) |
| `/track` | Public | Track with reference ID + private tracking code |
| `/board` | Public | Moderated public board |
| `/submitted/:publicId` | Public | Confirmation, shows the private tracking code |
| `/auth` | Public | Team sign-in / sign-up |
| `/dashboard` | Team | Submission queue with metrics |
| `/submissions/:id` | Team | Review, assign, publish, add notes |

---

## Database

The schema is defined in `supabase/migrations/` and targets Supabase Postgres.
It is ready to apply but **not yet connected** in a fresh clone.

Core tables:

| Table | Visibility | Purpose |
| --- | --- | --- |
| `submissions` | Private | Original submissions, including PII |
| `submission_public` | Public (anon read) | Sanitized, approved summaries |
| `submission_history` | Team | Status audit trail (trigger-maintained) |
| `submission_notes` | Team / public subset | Team notes and public updates |
| `assignments` | Team | Assignment log |
| `attachments` | Team | Image metadata (files in Supabase Storage) |
| `profiles` | Authenticated | Display names |
| `user_roles` | Authenticated | `admin` / `moderator` / `volunteer` |
| `yearly_counters` | Service role | Reference-ID sequence |
| `submission_rate_limits` | Service role | Anonymous submission throttling |

Notable behaviours implemented in the database layer:

- **Reference IDs** are generated by a `BEFORE INSERT` trigger using a per-year
  counter in `Asia/Kolkata`, producing `WTL-TL-<year>-<seq>`.
- **Authorization is layered**: RLS policies are the source of truth, reinforced by
  a `protect_submission_fields` trigger that freezes generated identifiers and
  restricts assigned volunteers to updating `status` only.
- **The public board is a sanitized projection.** Contact details never leave
  `submissions`; only moderator-approved `submission_public` rows are anon-readable.
- **Submission status is recorded automatically** by an `AFTER INSERT OR UPDATE`
  trigger, and mirrored onto the public entry.

To apply the schema to a Supabase project, use the
[Supabase CLI](https://supabase.com/docs/guides/cli):

```sh
supabase link --project-ref <your-project-ref>
supabase db push
```

Two manual steps are not covered by the migrations:

1. **Create the `submission-images` storage bucket** (private).
2. **Create the first admin** — either pre-insert into `user_roles`, or note that
   `bootstrap_first_admin()` grants `admin` to the first account that authenticates.
   Disable public sign-ups in Supabase Auth before going live.

---

## Security notes

- Public submissions are written with the service-role client after a Zod schema
  check, a honeypot field, and a 5-per-hour per-IP rate limit (IPs are SHA-256
  hashed with a project-specific salt before storage).
- Anonymous citizens track their submission with a reference ID **and** a separate
  unguessable tracking token. Both are required.
- Contact details are visible only to the authorised moderation team, and are
  excluded from the public board by design.

---

## Contributing

This project is connected to [Lovable](https://lovable.dev). Commits pushed to the
connected branch sync back to the Lovable editor, so keep the branch in a working
state and avoid rewriting published history.

---

## License

Private — © Crayon Biz LLP. All rights reserved.
