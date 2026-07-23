from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog
from typing import Optional


def log_activity(
    db: Session,
    user_id: Optional[int],
    action: str,
    description: str,
    ip_address: Optional[str] = None
) -> ActivityLog:
    """Helper service to log user actions in the database."""
    log_entry = ActivityLog(
        user_id=user_id,
        action=action,
        ip_address=ip_address,
        description=description
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
