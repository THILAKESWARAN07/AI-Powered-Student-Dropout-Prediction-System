from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create engine
# In production, we might want pool size configuration, etc.
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True  # checks connection freshness
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
