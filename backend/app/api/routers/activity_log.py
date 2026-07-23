from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.api.dependencies.db import get_db
from app.api.dependencies.auth import RoleChecker
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.schemas.activity_log import ActivityLogResponse

router = APIRouter()


@router.get("/", response_model=List[ActivityLogResponse])
def get_activity_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin"]))
):
    """
    Retrieve all audit activity logs. Admin only.
    """
    return db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).all()
