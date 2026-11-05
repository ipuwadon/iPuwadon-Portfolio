import hashlib
import re
import uuid
from collections import Counter
from contextlib import asynccontextmanager
from datetime import date, timedelta
from typing import Literal

from fastapi import Depends, FastAPI, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from . import config
from .content import (ContentError, FileContentRepository, SimpleSearchIndex, TYPES, summarize)
from .db import Base, SessionLocal, engine, get_db
from .models import AdminUser, Comment, PageView, Reaction, SearchLog, now
from .security import RateLimiter, create_token, hash_password, require_admin, verify_password

REACTIONS = ('helpful', 'interesting', 'inspiring', 'appreciate')
TAG_RE = re.compile(r'<[^>]*>')

repo = FileContentRepository(config.CONTENT_DIR)
search_index = SimpleSearchIndex()
limiter = RateLimiter()


def init_db() -> None:
    Base.metadata.create_all(engine)
    if config.ADMIN_PASSWORD:
        with SessionLocal() as db:
            if not db.scalar(select(AdminUser).where(AdminUser.username == config.ADMIN_USERNAME)):
                db.add(AdminUser(username=config.ADMIN_USERNAME, password_hash=hash_password(config.ADMIN_PASSWORD)))
                db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="Puwadon's Engineering Journey API", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=config.CORS_ORIGINS, allow_credentials=True,
                   allow_methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], allow_headers=['Authorization', 'Content-Type'])


@app.middleware('http')
async def security_headers(request: Request, call_next):
    resp = await call_next(request)
    resp.headers['X-Content-Type-Options'] = 'nosniff'
    resp.headers['X-Frame-Options'] = 'DENY'
    resp.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    if request.url.path.startswith('/api'):
        resp.headers['Content-Security-Policy'] = "default-src 'none'; frame-ancestors 'none'"
    return resp


def visitor(request: Request, response: Response) -> str:
    vid = request.cookies.get('vid')
    if not vid or not re.fullmatch(r'[0-9a-f]{32}', vid):
        vid = uuid.uuid4().hex
        response.set_cookie('vid', vid, max_age=31536000, httponly=True, samesite='lax', secure=config.COOKIE_SECURE)
    return hashlib.sha256((config.VISITOR_SALT + vid).encode()).hexdigest()


def limited(action: str):
    def dep(v: str = Depends(visitor)) -> str:
        limiter.check(f'{v}:{action}')
        return v
    return dep


def years_since(start: date, today: date) -> int:
    return today.year - start.year - ((today.month, today.day) < (start.month, start.day))


def sort_key(it: dict):
    return it.get('date') or ''


def require_content(type_: str, slug: str) -> dict:
    item = repo.get(type_, slug)
    if not item:
        raise HTTPException(404, 'Content not found')
    return item


def reaction_counts(db: Session, key: str) -> dict:
    rows = db.execute(select(Reaction.kind, func.count()).where(Reaction.content_key == key).group_by(Reaction.kind)).all()
    counts = {k: 0 for k in REACTIONS}
    counts.update({k: n for k, n in rows})
    return counts


@app.get('/api/health')
def health():
    return {'status': 'ok'}


@app.get('/api/home')
def home():
    page = repo.get('page', 'home') or {}
    items = repo.list()
    by = lambda t: [i for i in items if i['type'] == t]
    years = years_since(date.fromisoformat(config.EXPERIENCE_START_DATE), date.today())
    return {
        'intro': page.get('intro', ''),
        'professional_summary': page.get('professional_summary', ''),
        'years_of_experience': years,
        'core_expertise': page.get('core_expertise', []),
        'current_learning': page.get('current_learning', []),
        'featured_projects': [summarize(i) for i in by('project') if i.get('featured')],
        'latest_articles': [summarize(i) for i in sorted(by('article'), key=sort_key, reverse=True)[:3]],
        'recent_journey': [summarize(i) for i in sorted(by('journey'), key=sort_key, reverse=True)[:3]],
    }


@app.get('/api/content/{type_}')
def list_content(type_: str, category: str | None = None, tag: str | None = None):
    if type_ not in TYPES:
        raise HTTPException(404, 'Unknown content type')
    items = repo.list(type_)
    if category:
        items = [i for i in items if i.get('category') == category]
    if tag:
        items = [i for i in items if tag in i.get('tags', [])]
    items.sort(key=sort_key, reverse=type_ != 'journey')
    return [summarize(i) for i in items]


@app.get('/api/content/{type_}/{slug}')
def get_content(type_: str, slug: str, db: Session = Depends(get_db)):
    item = require_content(type_, slug)
    return {**item, 'reactions': reaction_counts(db, f'{type_}/{slug}')}


@app.get('/api/sitemap')
def sitemap():
    out = []
    for i in repo.list():
        if i['type'] == 'page':
            if i['slug'] == 'home':
                continue
            path = '/now' if i['slug'] == 'now' else f"/page/{i['slug']}"
        else:
            path = f"/{i['type']}/{i['slug']}"
        out.append({'path': path, 'lastmod': i.get('date')})
    return out


@app.get('/api/search')
def search(q: str = Query(min_length=1, max_length=100), type: str | None = None, category: str | None = None,
           tag: str | None = None, sort: Literal['relevance', 'date'] = 'relevance',
           v: str = Depends(limited('search')), db: Session = Depends(get_db)):
    results = search_index.search(repo.list(), q, type, category, tag, sort)
    db.add(SearchLog(keyword=q.strip().lower()[:100]))
    db.commit()
    return {'query': q, 'total': len(results), 'results': results}


class ReactionIn(BaseModel):
    kind: Literal['helpful', 'interesting', 'inspiring', 'appreciate']


@app.get('/api/content/{type_}/{slug}/reactions')
def get_reactions(type_: str, slug: str, db: Session = Depends(get_db)):
    require_content(type_, slug)
    return reaction_counts(db, f'{type_}/{slug}')


@app.post('/api/content/{type_}/{slug}/reactions', status_code=201)
def add_reaction(type_: str, slug: str, body: ReactionIn, v: str = Depends(limited('reaction')),
                 db: Session = Depends(get_db)):
    require_content(type_, slug)
    key = f'{type_}/{slug}'
    if db.scalar(select(Reaction.id).where(Reaction.content_key == key, Reaction.kind == body.kind, Reaction.visitor == v)):
        raise HTTPException(409, 'Already reacted')
    db.add(Reaction(content_key=key, kind=body.kind, visitor=v))
    db.commit()
    return reaction_counts(db, key)


class CommentIn(BaseModel):
    author: str = Field(min_length=1, max_length=80)
    body: str = Field(min_length=1, max_length=2000)
    email: str | None = Field(default=None, max_length=254, pattern=r'^[^@ ]+@[^@ ]+$')
    parent_id: int | None = None


def clean(text: str) -> str:
    return TAG_RE.sub('', text).strip()


def thread(rows: list[Comment]) -> list[dict]:
    nodes: dict[int, dict] = {}
    roots: list[dict] = []
    for r in rows:
        node = {'id': r.id, 'author': r.author, 'body': r.body, 'created_at': r.created_at.isoformat(), 'replies': []}
        if r.parent_id is None:
            roots.append(node)
        elif r.parent_id in nodes:
            nodes[r.parent_id]['replies'].append(node)
        else:
            continue
        nodes[r.id] = node
    return roots


@app.get('/api/content/{type_}/{slug}/comments')
def get_comments(type_: str, slug: str, db: Session = Depends(get_db)):
    require_content(type_, slug)
    rows = db.scalars(select(Comment).where(Comment.content_key == f'{type_}/{slug}', Comment.status == 'approved')
                      .order_by(Comment.created_at, Comment.id)).all()
    return thread(list(rows))


@app.post('/api/content/{type_}/{slug}/comments', status_code=201)
def add_comment(type_: str, slug: str, body: CommentIn, v: str = Depends(limited('comment')),
                db: Session = Depends(get_db)):
    require_content(type_, slug)
    key = f'{type_}/{slug}'
    author, text = clean(body.author), clean(body.body)
    if not author or not text:
        raise HTTPException(422, 'Author and body must not be empty')
    if body.parent_id is not None:
        parent = db.get(Comment, body.parent_id)
        if not parent or parent.content_key != key or parent.status != 'approved':
            raise HTTPException(404, 'Parent comment not found')
    c = Comment(content_key=key, parent_id=body.parent_id, author=author, email=body.email, body=text,
                status=config.COMMENT_DEFAULT_STATUS)
    db.add(c)
    db.commit()
    return {'id': c.id, 'status': c.status}


class PageViewIn(BaseModel):
    path: str = Field(min_length=1, max_length=255, pattern=r'^/')


@app.post('/api/events/pageview', status_code=202)
def pageview(body: PageViewIn, v: str = Depends(limited('pageview')), db: Session = Depends(get_db)):
    db.add(PageView(path=body.path, visitor=v))
    db.commit()
    return {'ok': True}


class LoginIn(BaseModel):
    username: str = Field(max_length=64)
    password: str = Field(max_length=256)


@app.post('/api/auth/login')
def login(body: LoginIn, v: str = Depends(limited('login')), db: Session = Depends(get_db)):
    user = db.scalar(select(AdminUser).where(AdminUser.username == body.username))
    ok = verify_password(body.password, user.password_hash if user else 'pbkdf2$1$00$00')
    if not user or not ok:
        raise HTTPException(401, 'Invalid credentials')
    return {'access_token': create_token(user.username, 'admin'), 'token_type': 'bearer'}


class ContentIn(BaseModel):
    meta: dict
    body: str = ''


class FeaturedIn(BaseModel):
    featured: bool


def _save(type_: str, slug: str, body: ContentIn) -> dict:
    try:
        return repo.save(type_, slug, body.meta, body.body)
    except ContentError as e:
        raise HTTPException(422, str(e))


@app.post('/api/admin/content/{type_}/{slug}', status_code=201)
def create_content(type_: str, slug: str, body: ContentIn, _=Depends(require_admin)):
    if repo.get(type_, slug):
        raise HTTPException(409, 'Already exists')
    return _save(type_, slug, body)


@app.put('/api/admin/content/{type_}/{slug}')
def update_content(type_: str, slug: str, body: ContentIn, _=Depends(require_admin)):
    require_content(type_, slug)
    return _save(type_, slug, body)


@app.delete('/api/admin/content/{type_}/{slug}', status_code=204)
def delete_content(type_: str, slug: str, _=Depends(require_admin)):
    try:
        found = repo.delete(type_, slug)
    except ContentError:
        found = False
    if not found:
        raise HTTPException(404, 'Content not found')
    return Response(status_code=204)


@app.put('/api/admin/content/{type_}/{slug}/featured')
def set_featured(type_: str, slug: str, body: FeaturedIn, _=Depends(require_admin)):
    item = require_content(type_, slug)
    meta = {k: v for k, v in item.items() if k not in ('type', 'slug', 'body')}
    meta['featured'] = body.featured
    return _save(type_, slug, ContentIn(meta=meta, body=item['body']))


@app.get('/api/admin/comments')
def admin_comments(status: Literal['pending', 'approved', 'hidden'] | None = None, _=Depends(require_admin),
                   db: Session = Depends(get_db)):
    q = select(Comment).order_by(Comment.created_at.desc())
    if status:
        q = q.where(Comment.status == status)
    return [{'id': c.id, 'content_key': c.content_key, 'parent_id': c.parent_id, 'author': c.author,
             'email': c.email, 'body': c.body, 'status': c.status, 'created_at': c.created_at.isoformat()}
            for c in db.scalars(q).all()]


class ModerateIn(BaseModel):
    status: Literal['approved', 'hidden', 'pending']


@app.patch('/api/admin/comments/{comment_id}')
def moderate(comment_id: int, body: ModerateIn, _=Depends(require_admin), db: Session = Depends(get_db)):
    c = db.get(Comment, comment_id)
    if not c:
        raise HTTPException(404, 'Comment not found')
    c.status = body.status
    db.commit()
    return {'id': c.id, 'status': c.status}


@app.delete('/api/admin/comments/{comment_id}', status_code=204)
def delete_comment(comment_id: int, _=Depends(require_admin), db: Session = Depends(get_db)):
    c = db.get(Comment, comment_id)
    if not c:
        raise HTTPException(404, 'Comment not found')
    ids, frontier = [comment_id], [comment_id]
    while frontier:
        frontier = list(db.scalars(select(Comment.id).where(Comment.parent_id.in_(frontier))).all())
        ids += frontier
    for cid in reversed(ids):
        db.delete(db.get(Comment, cid))
        db.flush()
    db.commit()
    return Response(status_code=204)


@app.get('/api/admin/analytics')
def analytics(days: int = Query(30, ge=1, le=365), _=Depends(require_admin), db: Session = Depends(get_db)):
    since = now() - timedelta(days=days)
    views = db.execute(select(PageView.path, PageView.visitor, PageView.created_at).where(PageView.created_at >= since)).all()
    trend = Counter(v.created_at.date().isoformat() for v in views)
    keywords = db.execute(select(SearchLog.keyword, func.count().label('n')).where(SearchLog.created_at >= since)
                          .group_by(SearchLog.keyword).order_by(func.count().desc()).limit(20)).all()
    reacted = db.execute(select(Reaction.content_key, func.count().label('n')).group_by(Reaction.content_key)
                         .order_by(func.count().desc()).limit(10)).all()
    commented = db.execute(select(Comment.content_key, func.count().label('n')).where(Comment.status != 'hidden')
                           .group_by(Comment.content_key).order_by(func.count().desc()).limit(10)).all()
    return {
        'days': days,
        'total_visitors': len({v.visitor for v in views}),
        'total_page_views': len(views),
        'most_viewed_pages': [{'path': p, 'views': n} for p, n in Counter(v.path for v in views).most_common(10)],
        'most_reacted': [{'content': k, 'count': n} for k, n in reacted],
        'most_commented': [{'content': k, 'count': n} for k, n in commented],
        'visitor_trend': [{'date': d, 'views': n} for d, n in sorted(trend.items())],
        'search_keywords': [{'keyword': k, 'count': n} for k, n in keywords],
    }
