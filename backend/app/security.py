import hashlib
import hmac
import os
import time
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from . import config

ITERATIONS = 200_000


def hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    digest = hashlib.pbkdf2_hmac('sha256', password.encode(), bytes.fromhex(salt), ITERATIONS).hex()
    return f'pbkdf2${ITERATIONS}${salt}${digest}'


def verify_password(password: str, stored: str) -> bool:
    try:
        _, iters, salt, digest = stored.split('$')
        calc = hashlib.pbkdf2_hmac('sha256', password.encode(), bytes.fromhex(salt), int(iters)).hex()
    except ValueError:
        return False
    return hmac.compare_digest(calc, digest)


def create_token(sub: str, role: str = 'admin', ttl_minutes: int | None = None) -> str:
    ttl = config.JWT_TTL_MINUTES if ttl_minutes is None else ttl_minutes
    exp = datetime.now(timezone.utc) + timedelta(minutes=ttl)
    return jwt.encode({'sub': sub, 'role': role, 'exp': exp}, config.JWT_SECRET, algorithm='HS256')


_bearer = HTTPBearer(auto_error=False)


def require_admin(cred: HTTPAuthorizationCredentials | None = Depends(_bearer)) -> dict:
    if cred is None:
        raise HTTPException(401, 'Not authenticated')
    try:
        claims = jwt.decode(cred.credentials, config.JWT_SECRET, algorithms=['HS256'], options={'require': ['exp', 'sub']})
    except jwt.PyJWTError:
        raise HTTPException(401, 'Invalid or expired token')
    if claims.get('role') != 'admin':
        raise HTTPException(403, 'Admin role required')
    return claims


class RateLimiter:
    def __init__(self):
        self.hits: dict[str, deque] = defaultdict(deque)

    def check(self, key: str) -> None:
        now = time.monotonic()
        q = self.hits[key]
        while q and now - q[0] > config.RATE_WINDOW:
            q.popleft()
        if len(q) >= config.RATE_LIMIT:
            raise HTTPException(429, 'Too many requests')
        q.append(now)
