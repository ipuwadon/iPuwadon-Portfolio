# Business Analysis: Puwadon's Engineering Journey

## Summary
Build a personal website that presents Puwadon Hamvivil's career as an interactive journey. It covers a timeline, projects, a knowledge base, lessons learned and a "Now" page. Visitors can react, comment and search. Administrators manage content, moderate comments and view analytics. Content is Markdown-based and version-control friendly. The stack is Next.js, TypeScript, Tailwind, FastAPI (Python 3.12+), PostgreSQL, JWT auth and Docker. The architecture must allow later AI search, RAG and chatbot features. AI features are out of scope for this phase.

**Assumptions** (not stated in the requirements):
- Content is authored as Markdown files in the repository. The database stores engagement and analytics data and indexes the content.
- Visitors are anonymous. Comments require a name, and an optional email address is the only contact data collected.
- Admin is a single role.

## User Stories
1. As a recruiter, I want a home page summary so that I can quickly judge Puwadon's background.
2. As a visitor, I want a timeline of milestones with reflections so that I can follow his engineering evolution.
3. As a hiring manager, I want project case studies so that I can assess his problem-solving and architecture skills.
4. As an engineer or student, I want searchable, categorized and tagged articles so that I can learn from his write-ups.
5. As a visitor, I want lessons learned in a consistent format so that I can reuse his insights.
6. As a visitor, I want a "Now" page so that I can see his current focus.
7. As a visitor, I want to react to and comment on content so that I can give feedback.
8. As a visitor, I want global search with filters and sorting so that I can find content quickly.
9. As an administrator, I want to manage content without code changes so that maintenance takes minimal effort.
10. As an administrator, I want to moderate comments and view analytics so that I can keep quality high and understand my audience.
11. As an owner, I want an extensible architecture so that AI search and a chatbot can be added later.

## Acceptance Criteria
**Home**
- AC1: The home page shows all eight required sections: introduction, professional summary, years of experience, core expertise, current learning, featured projects, latest articles and recent journey updates.
- AC2: The years of experience value is calculated from a configured start date, not hardcoded.

**Journey**
- AC3: The timeline lists entries in chronological order.
- AC4: Each entry page shows title, date or year, story, technologies, challenges, lessons learned and a reflection.
- AC5: The reflection contains three labeled parts: What Happened, What I Learned, and What I Would Do Differently Today.
- AC6: An entry with a missing required field fails content validation and is not published.

**Projects**
- AC7: Each project page shows all 10 required fields: name, overview, business problem, solution, architecture overview, tech stack, challenges, lessons learned, media and status.
- AC8: Status is one of a defined set of values (for example Planned, In Progress, Completed).

**Knowledge Base**
- AC9: Markdown renders with syntax-highlighted code blocks.
- AC10: Content can be filtered by category and by tag.
- AC11: Content supports all four types: article, note, technical write-up and learning summary.

**Lessons and Now**
- AC12: A lesson page shows Context, Experience, Key Insights and Recommendations.
- AC13: The Now page shows all five groups: Learning, Building, Experiments, Books and Certifications.
- AC14: The Now page is updated by editing content only, with no code change or rebuild of application code.

**Engagement**
- AC15: Visitors can add one reaction of each of the four types per content item. Duplicates from the same visitor are rejected.
- AC16: Reaction counts per type are shown on the content page and update after a reaction is added.
- AC17: A visitor can create a comment and reply to one.
- AC18: Comment history displays in threaded, chronological order.
- AC19: Comment input is validated for length and required fields and sanitized so that submitted script tags are not executed.
- AC20: Comments and reactions are rate-limited per visitor.
- AC21: An admin can approve, hide or delete comments. Hidden or deleted comments are not shown publicly.

**Search**
- AC22: Search covers journey, projects, articles and lessons.
- AC23: Results can be filtered by content type, category and tag, and sorted by relevance and date.
- AC24: A search with no matches shows an empty-state message.

**Analytics**
- AC25: The dashboard shows total visitors, most viewed pages, most reacted content, most commented content, visitor trends over a selectable date range, and search keywords.
- AC26: Unauthenticated or non-admin requests to analytics return 401 or 403.

**Administration and content**
- AC27: Admins can create, update and delete content, and can mark it featured or unfeatured. Changes appear on the public site.
- AC28: The five content types (journey, project, article, lesson, static page) are stored as Markdown with front matter and are diffable in version control.
- AC29: All admin endpoints require a valid JWT with the admin role.
- AC30: Expired or invalid tokens are rejected, and passwords are stored hashed.

**Non-functional**
- AC31: The initial page load completes in under 3 seconds on a simulated Fast 3G or broadband profile (to be agreed). Lighthouse performance is ≥ 80.
- AC32: Images use lazy loading and responsive sizes.
- AC33: Every public page has a title, meta description and Open Graph tags. A valid `sitemap.xml` and `robots.txt` are generated.
- AC34: Layouts work without horizontal scroll at 360px and 1280px widths.
- AC35: Lighthouse accessibility score is ≥ 90 and there are no critical axe violations. Pages are keyboard navigable and images have alt text.
- AC36: Protection against OWASP Top 10 basics: XSS, SQL injection (via parameterized queries or an ORM), CSRF where relevant, CORS allow-list and security headers.
- AC37: `docker compose up` starts the frontend, backend and PostgreSQL. Automated unit and API tests run in CI and pass.
- AC38: Content access goes through a service or repository abstraction, so a search or indexing implementation can be swapped without changing the content model. No AI features are required now.

## Implementation Tasks
1. **Foundation:** Set up the repo structure, Next.js/TS/Tailwind app, FastAPI project, PostgreSQL, Docker Compose and CI with test tooling.
2. **Content model:** Define Markdown front-matter schemas and validation for the five content types. Add a loader/indexer that syncs content to the database.
3. **Backend APIs:** Build content read endpoints, search, reactions, comments (threaded), analytics event capture and admin CRUD.
4. **Auth:** Add admin login, JWT issue and validation, role-based authorization, password hashing and rate limiting.
5. **Frontend pages:** Build Home, Journey timeline and detail, Projects, Knowledge Base (Markdown, highlighting, filters), Lessons, Now and static pages.
6. **Engagement UI:** Reaction buttons and counts, comment threads and forms.
7. **Search UI:** Global search with filters, sorting and an empty state.
8. **Admin UI:** Content management, featured toggles, comment moderation and analytics dashboard.
9. **Analytics:** Capture page views, visits and search keywords with privacy-conscious storage. Build aggregations and charts.
10. **NFRs:** Image optimization, SEO metadata, sitemap and robots, accessibility audit, security headers and input sanitization.
11. **Testing:** Unit, API, component and E2E tests for the key flows (view, react, comment, moderate, search).
12. **Future-readiness:** Define the content abstraction and a design note for embeddings, a vector store and RAG integration points.
13. **Seed content:** Create sample entries (Puwadon.com, Oracle, insurance, SDAT) to validate the templates.

**Open questions:**
- Is visitor identity cookie- or IP-based for reaction de-duplication?
- Is comment moderation pre-approval or post-moderation?
- Is single-admin enough?
- Is there a visual or brand direction?
- What is the hosting target?