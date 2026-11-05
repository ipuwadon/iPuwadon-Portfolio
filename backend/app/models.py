from datetime import datetime, timezone

from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


def now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class AdminUser(Base):
    __tablename__ = 'admin_users'
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))


class Reaction(Base):
    __tablename__ = 'reactions'
    __table_args__ = (UniqueConstraint('content_key', 'kind', 'visitor'),)
    id: Mapped[int] = mapped_column(primary_key=True)
    content_key: Mapped[str] = mapped_column(String(255), index=True)
    kind: Mapped[str] = mapped_column(String(20))
    visitor: Mapped[str] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(default=now)


class Comment(Base):
    __tablename__ = 'comments'
    id: Mapped[int] = mapped_column(primary_key=True)
    content_key: Mapped[str] = mapped_column(String(255), index=True)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey('comments.id'), nullable=True)
    author: Mapped[str] = mapped_column(String(80))
    email: Mapped[str | None] = mapped_column(String(254), nullable=True)
    body: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(16), index=True)
    created_at: Mapped[datetime] = mapped_column(default=now)


class PageView(Base):
    __tablename__ = 'page_views'
    id: Mapped[int] = mapped_column(primary_key=True)
    path: Mapped[str] = mapped_column(String(255))
    visitor: Mapped[str] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(default=now, index=True)


class SearchLog(Base):
    __tablename__ = 'search_logs'
    id: Mapped[int] = mapped_column(primary_key=True)
    keyword: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(default=now, index=True)
