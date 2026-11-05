from datetime import date, timedelta

from fastapi.testclient import TestClient

from app import config, main
from app.security import create_token


def test_home_has_all_sections(client):
    d = client.get('/api/home').json()
    for k in ('intro', 'professional_summary', 'years_of_experience', 'core_expertise', 'current_learning',
              'featured_projects', 'latest_articles', 'recent_journey'):
        assert k in d
    start = date.fromisoformat(config.EXPERIENCE_START_DATE)
    assert d['years_of_experience'] == main.years_since(start, date.today())
    assert d['featured_projects']


def test_journey_chronological_and_detail(client):
    items = client.get('/api/content/journey').json()
    dates = [i['date'] for i in items]
    assert dates == sorted(dates) and len(dates) >= 2
    d = client.get(f"/api/content/journey/{items[0]['slug']}").json()
    assert d['reflection']['what_i_learned'] and d['technologies']


def test_now_page_groups(client):
    d = client.get('/api/content/page/now').json()
    for g in ('learning', 'building', 'experiments', 'books', 'certifications'):
        assert g in d


def test_filter_by_category_and_tag(client):
    assert client.get('/api/content/article?category=Oracle').json()
    assert client.get('/api/content/article?category=Nope').json() == []
    assert client.get('/api/content/article?tag=oracle').json()


def test_reactions_unique_and_counted(client):
    url = '/api/content/article/oracle-basics/reactions'
    r = client.post(url, json={'kind': 'helpful'})
    assert r.status_code == 201 and r.json()['helpful'] == 1
    assert client.post(url, json={'kind': 'helpful'}).status_code == 409
    assert client.post(url, json={'kind': 'inspiring'}).json()['inspiring'] == 1
    assert client.post(url, json={'kind': 'bogus'}).status_code == 422
    assert client.get(url).json()['helpful'] == 1
    other = TestClient(main.app)
    assert other.post(url, json={'kind': 'helpful'}).json()['helpful'] == 2


def test_comments_threaded_and_sanitized(client):
    url = '/api/content/article/oracle-basics/comments'
    first = client.post(url, json={'author': 'A', 'body': 'hi <script>alert(1)</script>'}).json()
    client.post(url, json={'author': 'B', 'body': 'reply', 'parent_id': first['id']})
    tree = client.get(url).json()
    assert len(tree) == 1 and tree[0]['replies'][0]['body'] == 'reply'
    assert '<script>' not in tree[0]['body']
    assert client.post(url, json={'author': '', 'body': 'x'}).status_code == 422
    assert client.post(url, json={'author': 'A', 'body': 'x' * 2001}).status_code == 422
    assert client.post(url, json={'author': 'A', 'body': '<b></b>'}).status_code == 422


def test_comment_rate_limit(client):
    url = '/api/content/article/oracle-basics/comments'
    codes = [client.post(url, json={'author': 'A', 'body': 'x'}).status_code for _ in range(7)]
    assert codes[:6] == [201] * 6 and codes[6] == 429


def test_moderation_hides_comments(client, admin_headers):
    url = '/api/content/article/oracle-basics/comments'
    cid = client.post(url, json={'author': 'A', 'body': 'x'}).json()['id']
    assert client.patch(f'/api/admin/comments/{cid}', json={'status': 'hidden'}).status_code == 401
    r = client.patch(f'/api/admin/comments/{cid}', json={'status': 'hidden'}, headers=admin_headers)
    assert r.status_code == 200 and client.get(url).json() == []
    client.patch(f'/api/admin/comments/{cid}', json={'status': 'approved'}, headers=admin_headers)
    assert len(client.get(url).json()) == 1
    assert client.delete(f'/api/admin/comments/{cid}', headers=admin_headers).status_code == 204
    assert client.get(url).json() == []


def test_search_filters_sort_and_empty(client):
    d = client.get('/api/search?q=oracle').json()
    assert d['total'] >= 1
    assert all(r['type'] == 'article' for r in client.get('/api/search?q=oracle&type=article').json()['results'])
    assert client.get('/api/search?q=oracle&sort=date').status_code == 200
    empty = client.get('/api/search?q=zzzznotfound').json()
    assert empty['total'] == 0 and empty['results'] == []


def test_analytics_requires_admin(client, admin_headers):
    assert client.get('/api/admin/analytics').status_code == 401
    user = {'Authorization': 'Bearer ' + create_token('x', 'user')}
    assert client.get('/api/admin/analytics', headers=user).status_code == 403
    expired = {'Authorization': 'Bearer ' + create_token('admin', 'admin', ttl_minutes=-5)}
    assert client.get('/api/admin/analytics', headers=expired).status_code == 401
    assert client.get('/api/admin/analytics', headers={'Authorization': 'Bearer junk'}).status_code == 401
    client.post('/api/events/pageview', json={'path': '/journey/sdat'})
    client.get('/api/search?q=sdat')
    d = client.get('/api/admin/analytics?days=7', headers=admin_headers).json()
    assert d['total_visitors'] == 1
    assert d['most_viewed_pages'][0]['path'] == '/journey/sdat'
    assert d['search_keywords'][0]['keyword'] == 'sdat'


def test_login_rejects_bad_password(client):
    r = client.post('/api/auth/login', json={'username': 'admin', 'password': 'wrong'})
    assert r.status_code == 401


def test_admin_content_crud_and_featured(client, admin_headers):
    meta = {'title': 'New note', 'kind': 'note', 'category': 'AI', 'tags': ['mcp'], 'date': str(date.today())}
    url = '/api/admin/content/article/new-note'
    assert client.post(url, json={'meta': meta, 'body': 'hello'}).status_code == 401
    assert client.post(url, json={'meta': meta, 'body': 'hello'}, headers=admin_headers).status_code == 201
    assert client.get('/api/content/article/new-note').json()['title'] == 'New note'
    assert client.post(url, json={'meta': meta, 'body': 'x'}, headers=admin_headers).status_code == 409
    r = client.put(url + '/featured', json={'featured': True}, headers=admin_headers)
    assert r.json()['featured'] is True
    bad = client.put(url, json={'meta': {'title': 'x'}, 'body': 'x'}, headers=admin_headers)
    assert bad.status_code == 422
    assert client.delete(url, headers=admin_headers).status_code == 204
    assert client.get('/api/content/article/new-note').status_code == 404


def test_sitemap_and_headers(client):
    r = client.get('/api/sitemap')
    assert any(p['path'] == '/now' for p in r.json())
    assert r.headers['x-content-type-options'] == 'nosniff'
    assert (date.today() - timedelta(days=0)).year > 2000
