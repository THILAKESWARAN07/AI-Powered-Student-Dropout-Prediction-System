from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    full_name: str = Field(..., max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)
    school_id: Optional[int] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    role: Optional[str] = Field("teacher", description="admin, headmaster, teacher, deo")


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    school_id: Optional[int] = None
    profile_image: Optional[str] = Field(None, max_length=255)


class UserRoleUpdate(BaseModel):
    role: str = Field(..., description="admin, headmaster, teacher, deo")


class UserPasswordChange(BaseModel):
    old_password: str = Field(...)
    new_password: str = Field(..., min_length=6)


class UserResponse(UserBase):
    id: int
    role: str
    profile_image: Optional[str] = None
    email_verified: bool
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
