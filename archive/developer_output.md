# Developer Output

## Puwadon's Engineering Journey: minimal implementation

Nothing here has been run or tested. Run `pytest` in `backend/` and `npm run build` in `frontend/` to verify it.

### Implemented
- **Content model (AC3-8, 11-14, 28, 38).** Content is Markdown with YAML front matter under `content/{journey,project,article,lesson,page}/`.
  - `app/content.py` holds pydantic validation per type and a `ContentRepository` protocol, with `FileContentRepository` as the file-based implementation.
  - A `SearchIndex` protocol has a `SimpleSearchIndex` implementation. These abstractions are the swap points for a vector index or RAG (see `docs/ai-readiness.md`).
  - Invalid files are logged and not published (AC6).
  - Content is read from disk on every request, so editing the `now` page needs no rebuild (AC14).
  - Slugs are regex-validated to prevent path traversal.
- **API (FastAPI, SQLAlchemy 2).**
  - Content list/detail with category and tag filters.
  - `/api/home`, with years of experience calculated from `EXPERIENCE_START_DATE`.
  - Search with type, category, tag and sort filters, plus keyword logging.
  - Reactions: the four types, one per visitor, duplicates return 409, counts are returned.
  - Threaded comments, with tags stripped, length validation, and a rate limit.
  - Page-view events.
  - `/api/sitemap`.
- **Admin.**
  - Content create, update, delete and featured toggle.
  - Comment approve, hide and delete.
  - Analytics with a selectable date range.
  - JWT login. Passwords are hashed with PBKDF2. Expired or invalid tokens return 401 and a non-admin role returns 403.
- **Security.** CORS allow-list, API security headers, ORM parameterised queries.
  - CSRF is not a concern for the API because it uses bearer tokens.
  - The visitor cookie `vid` is HttpOnly and SameSite=Lax. Only a salted hash is stored (privacy-conscious analytics).
- **Frontend (Next.js 14, TS, Tailwind).** Home, list, detail (react-markdown with highlight.js), Now, and Search with an empty state.
  - Reactions and comments UI.
  - Metadata and Open Graph tags, sitemap.ts, robots.ts, security headers.
  - Lazy-loaded images with alt text.
- **Ops.** `docker compose up` starts Postgres, the backend and the frontend. `content/` is mounted into the backend. GitHub Actions CI runs the backend tests and the frontend build.
- **Tests.** `backend/tests` covers validation, the repository, and the main API flows.

### Not implemented (follow-ups)
- Admin UI and analytics dashboard UI. Only the admin API exists.
- Component and E2E tests, and Lighthouse and axe audits (AC31, AC35).
- Responsive image sizes beyond `loading=lazy`.
- Database migrations (uses `create_all`).

### Assumptions on the open questions
- Visitor identity is cookie-based. The reaction de-duplication key is the visitor hash.
- Moderation is post-moderation. Set `COMMENT_DEFAULT_STATUS=pending` for pre-approval.
- There is a single admin role.
- The rate limiter is in-memory and per process. Use Redis for multi-worker deployments.
- The default `EXPERIENCE_START_DATE=2014-01-01` is a placeholder. Set the real date.
- Seed content is placeholder text. Replace it.
- Front-matter dates must be full ISO dates (`YYYY-MM-DD`).

### Running
- Set `JWT_SECRET`, `ADMIN_PASSWORD` and `POSTGRES_PASSWORD` in the environment or a `.env` file. Compose defaults are for development only.
- `docker compose up --build`
- Backend tests: `cd backend && pip install -r requirements.txt && pytest`

## Generated Files

- `.github/workflows/ci.yml`
- `backend/.dockerignore`
- `backend/Dockerfile`
- `backend/app/__init__.py`
- `backend/app/config.py`
- `backend/app/content.py`
- `backend/app/db.py`
- `backend/app/main.py`
- `backend/app/models.py`
- `backend/app/security.py`
- `backend/pytest.ini`
- `backend/requirements.txt`
- `backend/tests/conftest.py`
- `backend/tests/test_api.py`
- `backend/tests/test_content.py`
- `content/article/oracle-basics.md`
- `content/journey/first-website.md`
- `content/journey/sdat.md`
- `content/lesson/insurance-lessons.md`
- `content/page/home.md`
- `content/page/now.md`
- `content/project/sdat.md`
- `docker-compose.yml`
- `docs/ai-readiness.md`
- `frontend/.dockerignore`
- `frontend/Dockerfile`
- `frontend/app/[type]/[slug]/page.tsx`
- `frontend/app/[type]/page.tsx`
- `frontend/app/globals.css`
- `frontend/app/layout.tsx`
- `frontend/app/now/page.tsx`
- `frontend/app/page.tsx`
- `frontend/app/robots.ts`
- `frontend/app/search/page.tsx`
- `frontend/app/sitemap.ts`
- `frontend/components/Engagement.tsx`
- `frontend/lib/api.ts`
- `frontend/next.config.mjs`
- `frontend/package.json`
- `frontend/postcss.config.js`
- `frontend/tailwind.config.ts`
- `frontend/tsconfig.json`