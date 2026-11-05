import os
from pathlib import Path

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./dev.db')
CONTENT_DIR = Path(os.getenv('CONTENT_DIR', str(Path(__file__).resolve().parents[2] / 'content')))
JWT_SECRET = os.getenv('JWT_SECRET', 'dev-only-secret-change-me-dev-only-secret')
JWT_TTL_MINUTES = int(os.getenv('JWT_TTL_MINUTES', '30'))
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', '')
CORS_ORIGINS = [o.strip() for o in os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',') if o.strip()]
EXPERIENCE_START_DATE = os.getenv('EXPERIENCE_START_DATE', '2014-01-01')
RATE_LIMIT = int(os.getenv('RATE_LIMIT', '10'))
RATE_WINDOW = int(os.getenv('RATE_WINDOW', '60'))
COMMENT_DEFAULT_STATUS = os.getenv('COMMENT_DEFAULT_STATUS', 'approved')
VISITOR_SALT = os.getenv('VISITOR_SALT', 'dev-salt')
COOKIE_SECURE = os.getenv('COOKIE_SECURE', 'false').lower() == 'true'
