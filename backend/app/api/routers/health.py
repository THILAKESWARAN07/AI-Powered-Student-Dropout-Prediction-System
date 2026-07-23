from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.api.dependencies.db import get_db
from app.core.logging import logger
from app.schemas.health import HealthCheckResponse

router = APIRouter()


@router.get("/health", response_model=HealthCheckResponse)
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint to verify backend and database connection status."""
    db_status = "disconnected"
    try:
        # Ping the database
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        logger.error(f"Health check database ping failed: {e}")

    return {
        "status": "healthy",
        "database": db_status,
        "version": "1.0.0"
    }
