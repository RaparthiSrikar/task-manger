# Dispatch — Task Manager

A full-stack task management app with per-user accounts, JWT auth, and three
third-party integrations built around real task workflows: email
notifications, file attachments, and live weather for task locations.

- **Backend:** NestJS 10 + MongoDB (Mongoose) + JWT auth
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind + React Query + Zustand

```
task-manager/
├── backend/     # NestJS REST API
├── frontend/    # Next.js app
└── README.md    # you are here
```

---

## 1. Architecture notes

### Backend module layout

```
backend/src/
├── auth/        # register/login, JWT strategy, guard, @CurrentUser() decorator
├── users/       # User schema + service (password hashing lives in AuthService)
├── tasks/       # Task schema, DTOs, CRUD service, controller — the core resource
├── email/       # Nodemailer/SMTP notifications (task created / task done)
├── upload/      # Cloudinary attachment upload/delete
├── weather/     # OpenWeatherMap client + 10-min in-memory cache
├── common/      # Global exception filter
└── config/      # Typed env var loader
```

**Why this shape:** each third-party integration is its own module with a
single-responsibility service (`EmailService`, `UploadService`,
`WeatherService`), injected into `TasksService`. That keeps `TasksService`
readable — it orchestrates CRUD and *calls out* to integrations — and makes
each integration trivially mockable/testable in isolation, and swappable
(e.g. Resend instead of SMTP, S3 instead of Cloudinary) without touching task
logic.

**Data model.** `Task` references `User` via a Mongoose `ObjectId` (`user`
field). Every query, update, and delete in `TasksService` filters by the
authenticated user's ID and throws `403 Forbidden` on a mismatch — this is
what makes tasks private per-account, enforced at the data-access layer
rather than trusted to the client. Compound indexes on `{ user, status }` and
`{ user, dueDate }` keep the dashboard's common queries fast.

**Auth.** Passwords are hashed with `bcrypt` (10 salt rounds) and the schema
marks the field `select: false` so it's never accidentally returned by a
query. `POST /auth/login` and `/register` issue a signed JWT (`sub` = user
id); `JwtAuthGuard` + `JwtStrategy` protect every task/weather route and
populate `request.user`.

**Error handling.** A single global `HttpExceptionFilter` catches everything
— Nest's own `HttpException`s and unexpected errors alike — and returns one
consistent JSON shape (`{ success, statusCode, path, timestamp, message }`),
so the frontend has one error format to parse everywhere (see
`getApiErrorMessage`).

**Resilience around integrations.** Email sending is fire-and-forget: a slow
or misconfigured SMTP provider never blocks task creation/update. Weather
lookups fail closed (`null`, not a thrown error) so a bad location string or
a flaky third-party API never breaks task CRUD — the UI just shows
"conditions unavailable."

### Frontend structure

```
frontend/
├── app/                    # App Router pages
│   ├── login/ register/    # auth pages
│   └── dashboard/           # protected — layout redirects if logged out
│       ├── page.tsx         # task list: filters, pagination
│       └── tasks/new, [id]  # create / detail+edit
├── components/
│   ├── ui/                 # small design-system primitives (Button, Input, Card…)
│   ├── layout/              # Navbar
│   └── tasks/               # TaskCard, TaskForm, filters, weather widgets, attachment card
├── hooks/                   # React Query hooks (use-tasks, use-weather) + use-auth
├── store/                   # Zustand auth store (persisted to localStorage)
├── lib/                     # axios client (attaches JWT, handles 401), utils
└── types/                   # types shared across the app, mirroring the API
```

**State management split, deliberately:**
- **Zustand** (`store/auth-store.ts`) owns *client* state — the logged-in
  user and JWT — persisted to `localStorage` so a refresh doesn't log you
  out. `hasHydrated` gates rendering so we never flash a "logged out" state
  before the persisted store loads.
- **React Query** (`hooks/use-tasks.ts`, `use-weather.ts`) owns *server*
  state — task lists, individual tasks, weather. It gives caching,
  request de-duplication, `placeholderData` for smooth pagination, and
  automatic invalidation after mutations, for free.

**Protected routes.** `app/dashboard/layout.tsx` checks the persisted auth
state client-side and redirects to `/login` if absent, showing a spinner
until the store has hydrated (see trade-offs below for what a
production-grade version would add).

**Design direction.** The app is styled like a dispatch/ops board rather
than a generic dashboard template — a paper/ink palette with a monospace
utility face for status pills, priorities, and the weather "conditions
ticker" (`components/tasks/weather-ticker.tsx`), since location + weather is
the feature the assignment centers on. Loading, error, and empty states are
handled explicitly on every data-fetching screen.

---

## 2. Setup instructions

### Prerequisites
- Node.js 18+
- A MongoDB instance — local (`mongod`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- (Optional but needed for full functionality) accounts for:
  - An SMTP provider — a Gmail account with an [App Password](https://myaccount.google.com/apppasswords) is the fastest way to test
  - [Cloudinary](https://cloudinary.com/console) (free tier)
  - [OpenWeatherMap](https://openweathermap.org/api) (free tier)

### Backend

```bash
cd backend
cp .env.example .env      # fill in the values below
npm install
npm run start:dev         # http://localhost:3001/api
```

Swagger docs are served at `http://localhost:3001/api/docs`.

### Frontend

```bash
cd frontend
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL if not localhost:3001
npm install
npm run dev                # http://localhost:3000
```

### Environment variables

**`backend/.env`** (see `backend/.env.example`)

| Variable | Required | Notes |
|---|---|---|
| `PORT` | no | defaults to `3001` |
| `FRONTEND_URL` | yes (prod) | comma-separated allowed CORS origins |
| `MONGODB_URI` | yes | local or Atlas connection string |
| `JWT_SECRET` | yes | long random string |
| `JWT_EXPIRES_IN` | no | defaults to `7d` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | no* | *emails are logged, not sent, if unset — everything else keeps working |
| `EMAIL_FROM` | no | display name/address for outgoing mail |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | no* | *file upload endpoint returns a clear 500 if unset |
| `OPENWEATHER_API_KEY` | no* | *weather panel shows "unavailable" if unset |

**`frontend/.env.local`** (see `frontend/.env.local.example`)

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | e.g. `http://localhost:3001/api` locally, your deployed API URL in prod |

---

## 3. API summary

All routes are under `/api`. `/tasks/*` and `/weather` require
`Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create an account, returns `{ accessToken, user }` |
| POST | `/auth/login` | Log in, returns `{ accessToken, user }` |
| GET | `/tasks` | List current user's tasks — `page`, `limit`, `status`, `priority`, `dueDateFrom`, `dueDateTo`, `search`, `sortBy`, `sortOrder` |
| POST | `/tasks` | Create a task (triggers a confirmation email) |
| GET | `/tasks/:id` | Get one task, enriched with live weather for its location |
| PATCH | `/tasks/:id` | Update a task (triggers a "done" email when status → `done`) |
| DELETE | `/tasks/:id` | Delete a task and its Cloudinary attachment, if any |
| POST | `/tasks/:id/attachment` | `multipart/form-data`, field name `file`, max 5 MB |
| GET | `/weather?location=` | Standalone weather lookup (used by task cards) |

---

## 4. Deployment

- **Frontend → Vercel:** import the `frontend/` directory as the project
  root, set `NEXT_PUBLIC_API_URL` to your deployed backend URL.
- **Backend → Render/Railway/Fly.io:** set the root directory to `backend/`,
  build command `npm install && npm run build`, start command
  `npm run start:prod`, and set all the env vars above. Point `MONGODB_URI`
  at an Atlas cluster (not localhost) and set `FRONTEND_URL` to your Vercel
  domain so CORS allows it.

---

## 5. Trade-offs and what I'd improve with more time

- **Route protection is client-side only.** The dashboard layout checks
  Zustand's persisted state and redirects if absent, which is simple and
  works, but means a logged-out user briefly sees a spinner rather than
  being blocked at the edge. A production version would also store the
  token in an httpOnly cookie and add `middleware.ts` for server-side
  redirects.
- **No automated tests.** Given the time box, I prioritized a correct,
  complete feature set over test coverage. I'd add Jest unit tests for
  `TasksService` (ownership checks, status-transition email trigger) and
  Playwright/Cypress e2e coverage for the auth → create → complete flow.
- **No refresh tokens.** JWTs are long-lived (7 days) with no rotation or
  revocation list. A refresh-token flow would let access tokens be
  short-lived without forcing re-login every few minutes.
- **Weather is looked up per-location, not stored.** This keeps data fresh
  but means a location typo only surfaces as "conditions unavailable" —
  I'd add geocoding validation (or an autocomplete input backed by
  OpenWeatherMap's geocoding API) so users get feedback at task-creation
  time instead.
- **Single attachment per task.** The schema stores one `attachmentUrl`; a
  next iteration would make it an array with per-file delete.
- **No optimistic UI on mutations.** React Query invalidates and refetches
  rather than optimistically updating the cache — simpler and safer, but a
  touch less snappy on slow connections.
- **No rate limiting** on `/auth/login` or `/auth/register` — I'd add
  `@nestjs/throttler` before shipping this for real.
