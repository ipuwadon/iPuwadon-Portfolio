import datetime as dt
import logging
import re
from pathlib import Path
from typing import Literal, Protocol

import yaml
from pydantic import BaseModel, ConfigDict, Field, ValidationError

log = logging.getLogger(__name__)

TYPES = ('journey', 'project', 'article', 'lesson', 'page')
SEARCHABLE = ('journey', 'project', 'article', 'lesson')
SLUG_RE = re.compile(r'^[a-z0-9]+(-[a-z0-9]+)*$')
LESSON_SECTIONS = ('Context', 'Experience', 'Key Insights', 'Recommendations')
NOW_GROUPS = ('learning', 'building', 'experiments', 'books', 'certifications')
HOME_FIELDS = ('intro', 'professional_summary', 'core_expertise', 'current_learning')


class ContentError(ValueError):
    pass


class Common(BaseModel):
    model_config = ConfigDict(extra='allow')
    title: str = Field(min_length=1)
    summary: str = ''
    date: dt.date | None = None
    category: str = ''
    tags: list[str] = []
    featured: bool = False


class Reflection(BaseModel):
    what_happened: str = Field(min_length=1)
    what_i_learned: str = Field(min_length=1)
    what_i_would_do_differently: str = Field(min_length=1)


class Journey(Common):
    date: dt.date
    technologies: list[str] = Field(min_length=1)
    challenges: list[str] = Field(min_length=1)
    lessons: list[str] = Field(min_length=1)
    reflection: Reflection


class Media(BaseModel):
    src: str = Field(min_length=1)
    alt: str = Field(min_length=1)


class Project(Common):
    overview: str = Field(min_length=1)
    business_problem: str = Field(min_length=1)
    solution: str = Field(min_length=1)
    architecture: str = Field(min_length=1)
    tech_stack: list[str] = Field(min_length=1)
    challenges: list[str] = Field(min_length=1)
    lessons: list[str] = Field(min_length=1)
    media: list[Media] = Field(min_length=1)
    status: Literal['Planned', 'In Progress', 'Completed']


class Article(Common):
    kind: Literal['article', 'note', 'technical-write-up', 'learning-summary']
    category: str = Field(min_length=1)


class Lesson(Common):
    pass


class Page(Common):
    pass


MODELS = {'journey': Journey, 'project': Project, 'article': Article, 'lesson': Lesson, 'page': Page}


def parse_document(text: str) -> tuple[dict, str]:
    lines = text.splitlines()
    if not lines or lines[0].strip() != '---':
        raise ContentError('missing front matter')
    try:
        end = next(i for i in range(1, len(lines)) if lines[i].strip() == '---')
    except StopIteration:
        raise ContentError('unterminated front matter')
    try:
        meta = yaml.safe_load('\n'.join(lines[1:end])) or {}
    except yaml.YAMLError as e:
        raise ContentError(f'invalid YAML: {e}')
    if not isinstance(meta, dict):
        raise ContentError('front matter must be a mapping')
    return meta, '\n'.join(lines[end + 1:]).strip()


def validate_meta(type_: str, slug: str, meta: dict, body: str) -> dict:
    if type_ not in MODELS:
        raise ContentError('unknown content type')
    try:
        data = MODELS[type_].model_validate(meta).model_dump(mode='json')
    except ValidationError as e:
        raise ContentError(str(e))
    problems = []
    if type_ in ('journey', 'article', 'lesson') and not body.strip():
        problems.append('body is required')
    if type_ == 'lesson':
        heads = {ln.strip() for ln in body.splitlines()}
        problems += [f'missing section: {s}' for s in LESSON_SECTIONS if '## ' + s not in heads]
    if type_ == 'page' and slug == 'now':
        problems += [f'missing group: {g}' for g in NOW_GROUPS if g not in data]
    if type_ == 'page' and slug == 'home':
        problems += [f'missing field: {f}' for f in HOME_FIELDS if f not in data]
    if problems:
        raise ContentError('; '.join(problems))
    return data


class ContentRepository(Protocol):
    def list(self, type_: str | None = None) -> list[dict]: ...
    def get(self, type_: str, slug: str) -> dict | None: ...
    def save(self, type_: str, slug: str, meta: dict, body: str) -> dict: ...
    def delete(self, type_: str, slug: str) -> bool: ...


class SearchIndex(Protocol):
    def search(self, items: list[dict], q: str, type_: str | None, category: str | None,
               tag: str | None, sort: str) -> list[dict]: ...


class FileContentRepository:
    def __init__(self, root):
        self.root = Path(root)

    def _file(self, type_: str, slug: str) -> Path:
        if type_ not in TYPES or not SLUG_RE.match(slug):
            raise ContentError('invalid type or slug')
        return self.root / type_ / (slug + '.md')

    def _load(self, type_: str, slug: str, f: Path) -> dict:
        meta, body = parse_document(f.read_text(encoding='utf-8'))
        data = validate_meta(type_, slug, meta, body)
        return {'type': type_, 'slug': slug, **data, 'body': body}

    def get(self, type_: str, slug: str) -> dict | None:
        try:
            f = self._file(type_, slug)
            return self._load(type_, slug, f) if f.is_file() else None
        except ContentError as e:
            log.warning('unpublished %s/%s: %s', type_, slug, e)
            return None

    def list(self, type_: str | None = None) -> list[dict]:
        items = []
        for t in [type_] if type_ else TYPES:
            d = self.root / t
            if t not in TYPES or not d.is_dir():
                continue
            for f in sorted(d.glob('*.md')):
                if not SLUG_RE.match(f.stem):
                    continue
                try:
                    items.append(self._load(t, f.stem, f))
                except ContentError as e:
                    log.warning('unpublished %s/%s: %s', t, f.stem, e)
        return items

    def save(self, type_: str, slug: str, meta: dict, body: str) -> dict:
        data = validate_meta(type_, slug, meta, body)
        f = self._file(type_, slug)
        f.parent.mkdir(parents=True, exist_ok=True)
        front = yaml.safe_dump(data, sort_keys=False, allow_unicode=True)
        f.write_text('---\n' + front + '---\n\n' + body.strip() + '\n', encoding='utf-8')
        return {'type': type_, 'slug': slug, **data, 'body': body.strip()}

    def delete(self, type_: str, slug: str) -> bool:
        f = self._file(type_, slug)
        if not f.is_file():
            return False
        f.unlink()
        return True


class SimpleSearchIndex:
    def search(self, items, q, type_=None, category=None, tag=None, sort='relevance'):
        terms = q.lower().split()
        out = []
        for it in items:
            if it['type'] not in SEARCHABLE:
                continue
            if type_ and it['type'] != type_:
                continue
            if category and it.get('category') != category:
                continue
            if tag and tag not in it.get('tags', []):
                continue
            title = it['title'].lower()
            tags = ' '.join(it.get('tags', [])).lower()
            text = (it.get('summary', '') + ' ' + it['body']).lower()
            score = sum(3 * title.count(t) + 2 * tags.count(t) + text.count(t) for t in terms)
            if score:
                out.append({**summarize(it), 'score': score})
        if sort == 'date':
            out.sort(key=lambda r: r.get('date') or '', reverse=True)
        else:
            out.sort(key=lambda r: r['score'], reverse=True)
        return out


def summarize(it: dict) -> dict:
    return {k: it.get(k) for k in ('type', 'slug', 'title', 'summary', 'category', 'tags', 'date', 'featured', 'status', 'kind')}
