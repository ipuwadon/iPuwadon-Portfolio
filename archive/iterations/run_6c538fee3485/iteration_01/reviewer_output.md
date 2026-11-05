# Review: REWORK

## Decision: REWORK

### Blocking: test execution failed
The actual run exited with code 1. `test_acceptance` failed to import because `fastapi` was not installed (`ModuleNotFoundError`). Zero tests ran, so none of the acceptance criteria are verified. The tester report also says nothing was run, and the developer says nothing was run or tested. The test report is therefore not credible evidence.

**Required:**
- Install `backend/requirements.txt` in the test environment, or make the test harness do so. Python 3.15 is the interpreter in the log, so also confirm that the dependencies support it, or use 3.12 as required.
- Re-run the full suite and show that it passes. That means the tester's `test_acceptance.py` and the developer's `backend/tests`.
- The tester's tests are unittest files, while the developer's are pytest. Consolidate them so one command runs everything.

### Unmet acceptance criteria
- **AC25 and AC27 (UI):** there is no admin UI, content management UI, moderation UI or analytics dashboard. Only the API exists. The requirement lists these as features (Admin UI task 8).
- **AC31 and AC35:** no Lighthouse or axe audit was done.
- **AC32:** images use only `loading=lazy`, with no responsive sizes. Use `next/image` or `srcset`/`sizes`.
- **Testing:** there are no component or E2E tests (task 11).

### Defects to fix
1. **Journey `lessons` (AC4):** the journey page shows lessons through the generic field loop. Add a dedicated "Lessons learned" section, and also dedicated sections for technologies and challenges. Give the project page clear labelled sections too (AC7).
2. **Lesson page (AC12):** lessons rely on Markdown headings in the body. This is acceptable, but test the rendering.
3. **Comment deletion:** the tester flagged that `delete_comment` cascades to replies. Confirm this is intended and document it.
4. **Sanitization (AC19):** the tag regex is weak. Use `html.escape` or a proper sanitizer, and add tests for malformed payloads such as `<script` without a closing `>`.
5. **Rate limiting (AC20):** the limiter is in-memory and per process, and it is keyed on a cookie that an attacker can rotate. Add an IP-based component, or document the limitation.
6. **Security:** the default JWT secret and salt are used silently. Fail startup when production is configured with defaults. `ADMIN_PASSWORD` defaults to empty, so no admin user is created. Document this clearly.
7. **Dockerfile and CI:** the backend Dockerfile runs as root. The frontend lacks a lockfile, so use `npm ci`. The CI frontend job has no lint or test step.
8. **Postgres:** the tests run only on SQLite. Add a Postgres-backed CI check for AC37.
9. **Migrations:** `create_all` is used with no migrations. Add Alembic or document why it is deferred.
10. **Tests:** `test_sitemap_and_headers` contains a meaningless assertion. Remove it.

Resubmit once the tests actually run and pass, and the admin UI and analytics dashboard are implemented or explicitly descoped by agreement.