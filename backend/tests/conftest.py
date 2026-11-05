import os
import shutil
import tempfile
from pathlib import Path

_tmp = Path(tempfile.mkdtemp())
os.environ.update(
    DATABASE_URL='sqlite:///' + (_tmp / 'test.db').as_posix(),
    JWT_SECRET='test-secret-test-secret-test-secret-123',
    ADMIN_USERNAME='admin',
    ADMIN_PASSWORD='test-pass-123',
    RATE_LIMIT='6',
    RATE_WINDOW='60',
)

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app import main  # noqa: E402
from app.db import Base, engine  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]


@pytest.fixture
def client(tmp_path, monkeypatch):
    shutil.copytree(ROOT / 'content', tmp_path / 'content')
    monkeypatch.setattr(main.repo, 'root', tmp_path / 'content')
    Base.metadata.drop_all(engine)
    main.init_db()
    main.limiter.hits.clear()
    return TestClient(main.app)


@pytest.fixture
def admin_headers(client):
    r = client.post('/api/auth/login', json={'username': 'admin', 'password': 'test-pass-123'})
    assert r.status_code == 200
    return {'Authorization': 'Bearer ' + r.json()['access_token']}
