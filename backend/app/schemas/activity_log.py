from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserMini(BaseModel):
    full_name: str
    email: str

    class Config:
        from_attributes = True


class ActivityLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    ip_address: Optional[str]
    timestamp: datetime
    description: str
    user: Optional[UserMini] = None

    class Config:
        from_attributes = True
