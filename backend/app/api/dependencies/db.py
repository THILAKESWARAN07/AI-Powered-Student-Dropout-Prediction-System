from typing import Generator
from app.db.session import SessionLocal


def get_db() -> Generator:
    """Dependency to provide database session per request and close it after."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
