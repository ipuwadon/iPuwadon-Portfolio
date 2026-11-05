import os, shutil, tempfile, unittest
from pathlib import Path

TMP = Path(tempfile.mkdtemp())
os.environ.update(DATABASE_URL='sqlite:///' + (TMP / 't.db').as_posix(), JWT_SECRET='x' * 40,
                  ADMIN_USERNAME='admin', ADMIN_PASSWORD='pw-123456', RATE_LIMIT='50', RATE_WINDOW='60')

import sys
BACKEND = Path(__file__).resolve().parents[1] / 'backend'
if not BACKEND.exists():
    BACKEND = Path.cwd() / 'backend'
sys.path.insert(0, str(BACKEND))

from fastapi.testclient import TestClient
from app import main
from app.db import Base, engine
from app.content import ContentError, validate_meta, FileContentRepository
from app.security import create_token, hash_password, verify_password

ROOT = BACKEND.parent


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        shutil.copytree(ROOT / 'content', self.tmp / 'content')
        self.orig = main.repo.root
        main.repo.root = self.tmp / 'content'
        Base.metadata.drop_all(engine)
        main.init_db()
        main.limiter.hits.clear()
        self.c = TestClient(main.app)
        r = self.c.post('/api/auth/login', json={'username': 'admin', 'password': 'pw-123456'})
        self.h = {'Authorization': 'Bearer ' + r.json()['access_token']}

    def tearDown(self):
        main.repo.root = self.orig
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_home_sections(self):
        d = self.c.get('/api/home').json()
        for k in ('intro', 'professional_summary', 'years_of_experience', 'core_expertise',
                  'current_learning', 'featured_projects', 'latest_articles', 'recent_journey'):
            self.assertIn(k, d)

    def test_years_calculation(self):
        from datetime import date
        self.assertEqual(main.years_since(date(2014, 6, 1), date(2024, 5, 31)), 9)
        self.assertEqual(main.years_since(date(2014, 6, 1), date(2024, 6, 1)), 10)

    def test_journey_chronological(self):
        dates = [i['date'] for i in self.c.get('/api/content/journey').json()]
        self.assertEqual(dates, sorted(dates))

    def test_now_edit_without_rebuild(self):
        f = self.tmp / 'content' / 'page' / 'now.md'
        f.write_text(f.read_text(encoding='utf-8').replace('SDAT, This website', 'Zebra project'), encoding='utf-8')
        self.assertIn('Zebra project', self.c.get('/api/content/page/now').json()['building'])

    def test_reaction_duplicate_and_counts(self):
        u = '/api/content/article/oracle-basics/reactions'
        self.assertEqual(self.c.post(u, json={'kind': 'helpful'}).status_code, 201)
        self.assertEqual(self.c.post(u, json={'kind': 'helpful'}).status_code, 409)
        self.assertEqual(self.c.get(u).json()['helpful'], 1)

    def test_comment_thread_and_sanitize(self):
        u = '/api/content/article/oracle-basics/comments'
        a = self.c.post(u, json={'author': 'A', 'body': '<script>alert(1)</script>hi'}).json()
        self.c.post(u, json={'author': 'B', 'body': 'r', 'parent_id': a['id']})
        t = self.c.get(u).json()
        self.assertNotIn('<script>', t[0]['body'])
        self.assertEqual(len(t[0]['replies']), 1)
        self.assertEqual(self.c.post(u, json={'author': 'A', 'body': ''}).status_code, 422)

    def test_hidden_comment_not_public(self):
        u = '/api/content/article/oracle-basics/comments'
        cid = self.c.post(u, json={'author': 'A', 'body': 'x'}).json()['id']
        self.c.patch(f'/api/admin/comments/{cid}', json={'status': 'hidden'}, headers=self.h)
        self.assertEqual(self.c.get(u).json(), [])

    def test_search_empty_and_filter(self):
        self.assertEqual(self.c.get('/api/search?q=zzzqqq').json()['results'], [])
        rs = self.c.get('/api/search?q=oracle&type=article&sort=date').json()['results']
        self.assertTrue(all(r['type'] == 'article' for r in rs))

    def test_admin_auth(self):
        self.assertEqual(self.c.get('/api/admin/analytics').status_code, 401)
        bad = {'Authorization': 'Bearer ' + create_token('u', 'user')}
        self.assertEqual(self.c.get('/api/admin/analytics', headers=bad).status_code, 403)
        exp = {'Authorization': 'Bearer ' + create_token('admin', 'admin', ttl_minutes=-1)}
        self.assertEqual(self.c.get('/api/admin/analytics', headers=exp).status_code, 401)
        self.assertEqual(self.c.get('/api/admin/analytics', headers=self.h).status_code, 200)

    def test_admin_crud_persists_markdown(self):
        meta = {'title': 'N', 'kind': 'note', 'category': 'AI', 'tags': ['a'], 'date': '2025-01-01'}
        u = '/api/admin/content/article/n-1'
        self.assertEqual(self.c.post(u, json={'meta': meta, 'body': 'hi'}, headers=self.h).status_code, 201)
        text = (self.tmp / 'content' / 'article' / 'n-1.md').read_text(encoding='utf-8')
        self.assertTrue(text.startswith('---'))
        self.assertEqual(self.c.delete(u, headers=self.h).status_code, 204)

    def test_security_headers(self):
        self.assertEqual(self.c.get('/api/health').headers['x-frame-options'], 'DENY')


class ContentTests(unittest.TestCase):
    def test_article_kinds(self):
        for k in ('article', 'note', 'technical-write-up', 'learning-summary'):
            validate_meta('article', 'x', {'title': 't', 'kind': k, 'category': 'AI'}, 'b')
        with self.assertRaises(ContentError):
            validate_meta('article', 'x', {'title': 't', 'kind': 'zzz', 'category': 'AI'}, 'b')

    def test_project_requires_fields(self):
        with self.assertRaises(ContentError):
            validate_meta('project', 'x', {'title': 'p', 'status': 'Completed'}, '')

    def test_lesson_sections(self):
        body = '\n'.join('## ' + s for s in ('Context', 'Experience', 'Key Insights', 'Recommendations'))
        validate_meta('lesson', 'x', {'title': 'L'}, body)

    def test_repo_traversal(self):
        repo = FileContentRepository(Path(tempfile.mkdtemp()))
        self.assertIsNone(repo.get('journey', '../x'))

    def test_password_hash(self):
        h = hash_password('abc')
        self.assertNotIn('abc', h)
        self.assertTrue(verify_password('abc', h))
        self.assertFalse(verify_password('abd', h))


class StaticTests(unittest.TestCase):
    def read(self, p):
        return (ROOT / p).read_text(encoding='utf-8')

    def test_compose_services(self):
        t = self.read('docker-compose.yml')
        for s in ('db:', 'backend:', 'frontend:', 'postgres'):
            self.assertIn(s, t)

    def test_seo_files(self):
        self.assertIn('sitemap', self.read('frontend/app/robots.ts'))
        self.assertIn('openGraph', self.read('frontend/app/layout.tsx'))
        self.assertTrue((ROOT / 'frontend/app/sitemap.ts').exists())

    def test_lazy_images(self):
        self.assertIn("loading='lazy'", self.read('frontend/app/[type]/[slug]/page.tsx'))


if __name__ == '__main__':
    unittest.main()
