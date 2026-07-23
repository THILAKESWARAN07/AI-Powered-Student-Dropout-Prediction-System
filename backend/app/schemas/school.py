from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SchoolBase(BaseModel):
    school_name: str = Field(..., max_length=255)
    district: str = Field(..., max_length=100)
    block: str = Field(..., max_length=100)
    village: str = Field(..., max_length=100)
    school_type: str = Field(..., max_length=50)
    medium: str = Field(..., max_length=50)
    headmaster_name: Optional[str] = Field(None, max_length=255)
    student_strength: int = Field(0, ge=0)


class SchoolCreate(SchoolBase):
    pass


class SchoolUpdate(BaseModel):
    school_name: Optional[str] = Field(None, max_length=255)
    district: Optional[str] = Field(None, max_length=100)
    block: Optional[str] = Field(None, max_length=100)
    village: Optional[str] = Field(None, max_length=100)
    school_type: Optional[str] = Field(None, max_length=50)
    medium: Optional[str] = Field(None, max_length=50)
    headmaster_name: Optional[str] = Field(None, max_length=255)
    student_strength: Optional[int] = Field(None, ge=0)


class SchoolResponse(SchoolBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
