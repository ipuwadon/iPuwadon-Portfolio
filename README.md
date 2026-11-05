# Puwadon's Engineering Journey

A modern personal portfolio platform for **Puwadon Hamvivil** — not a traditional resume website, but an interactive journey through career milestones, projects, lessons learned, and knowledge sharing. It spans early web development, enterprise software and insurance domain expertise, through to modern AI and cloud technologies.

## Architecture

| Service  | Tech                                                     | Port |
|----------|----------------------------------------------------------|------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion | 3000 |
| Backend  | FastAPI, SQLAlchemy 2, PyJWT                             | 8000 |
| Database | PostgreSQL 16 (Docker) / SQLite fallback (local dev)     | 5432 |

Content is authored as Markdown files with YAML frontmatter under [`content/`](./content/) (types: `journey`, `project`, `article`, `lesson`, `page`), loaded by the backend at request time. The backend also provides search, reactions, threaded comments, page-view tracking, rate limiting, and a JWT-protected admin login.

## Quick start

### Option A — Docker (recommended)

Requires Docker Desktop running.

```powershell
docker compose up --build
```

Open <http://localhost:3000>. The API is at <http://localhost:8000>.

### Option B — Run locally without Docker

The backend falls back to a local SQLite database when `DATABASE_URL` is unset, so PostgreSQL is not required for development.

Requires **Python 3.10–3.13** (3.15 cannot build PyYAML yet) and **Node.js 18+**.

```powershell
# Terminal 1 — backend
cd backend
py -3.10 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --port 8000

# Terminal 2 — frontend
cd frontend
npm install
npm run build
npm run start        # or: npm run dev
```

Open <http://localhost:3000>.

## Testing

```powershell
# Backend unit tests (20 tests)
cd backend
.\.venv\Scripts\python.exe -m pytest -q

# Acceptance tests (19 tests) — run from the repo root
.\backend\.venv\Scripts\python.exe -m pytest tests\test_acceptance.py -q
```

## Configuration

All settings are environment variables (see `backend/app/config.py` and `docker-compose.yml`). Key ones:

| Variable                | Default                           | Purpose                                   |
|-------------------------|-----------------------------------|-------------------------------------------|
| `DATABASE_URL`          | `sqlite:///./dev.db`              | SQLAlchemy connection string               |
| `CONTENT_DIR`           | `<repo>/content`                  | Markdown content root                      |
| `JWT_SECRET`            | dev-only value                    | Token signing secret (change in prod)      |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | `admin` / empty       | Admin account (created only if password set) |
| `CORS_ORIGINS`          | `http://localhost:3000`           | Allowed origins                            |
| `EXPERIENCE_START_DATE` | `2014-01-01`                      | Drives the "years of experience" counter   |
| `RATE_LIMIT` / `RATE_WINDOW` | `10` / `60`                  | Engagement rate limiting                   |
| `API_URL` (frontend)    | `http://localhost:8000`           | Server-side API base URL                   |
| `NEXT_PUBLIC_API_URL` (frontend) | `http://localhost:8000`  | Browser-side API base URL                  |

## Frontend design

Dark-mode-by-default, futuristic AI-inspired design influenced by Vercel, Linear, Stripe and OpenAI:

- Black / deep navy background with soft blue & purple radial glows
- Glassmorphism cards (`backdrop-blur`, translucent borders) with hover glow
- Gradient typography (sky → blue → violet) and Inter via `next/font`
- Smooth scroll-reveal and stagger animations with Framer Motion
- Skill badges, project cards, and a hero section with strong personal branding
- Mobile-first responsive layout
- Accessibility: semantic landmarks, skip link, visible focus rings, and full `prefers-reduced-motion` support

## Deployment (Vercel + separate backend host)

Vercel hosts the **Next.js frontend** only. The FastAPI backend, PostgreSQL database, and the `content/` folder it reads must be hosted elsewhere (e.g., Render, Railway, Fly.io).

1. Push this repository to GitHub.
2. In Vercel: **Import project** → set **Root Directory** to `frontend`.
3. Deploy the backend (e.g., build `backend/Dockerfile` on Render/Railway/Fly.io) with production values for `DATABASE_URL`, `JWT_SECRET`, `ADMIN_PASSWORD`, `CORS_ORIGINS` (your Vercel domain), and `COOKIE_SECURE=true`.
4. In Vercel project settings, add environment variables:
   - `API_URL` — the backend's public URL (server-side fetches)
   - `NEXT_PUBLIC_API_URL` — the backend's public URL (browser fetches)
   - `SITE_URL` — your Vercel/custom domain (sitemap & robots)

Never reuse the dev-only fallback secrets from `docker-compose.yml` in production.

## Repository layout

```
├── frontend/             # Next.js app (Vercel Root Directory)
├── backend/              # FastAPI app + unit tests
├── content/              # Markdown content (journey, projects, articles, …)
├── tests/                # Acceptance tests
├── docs/                 # Additional documentation
├── docker-compose.yml    # Local full-stack orchestration
├── requirement.md        # Product requirements
└── archive/              # AI agent workflow artifacts (BA/Dev/Review/Test outputs)
```

## Known notes

- The sample SDAT project page references an architecture diagram image that is not included, producing a harmless 404.
- Python 3.15 cannot install the backend dependencies (no PyYAML wheel yet) — use Python 3.10–3.13.
