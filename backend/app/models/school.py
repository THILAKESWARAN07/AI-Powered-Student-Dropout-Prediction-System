from sqlalchemy import String, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from app.db.base_class import Base


class School(Base):
    __tablename__ = "schools"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    school_name: Mapped[str] = mapped_column(String(255), index=True)
    district: Mapped[str] = mapped_column(String(100), index=True)
    block: Mapped[str] = mapped_column(String(100))
    village: Mapped[str] = mapped_column(String(100))
    school_type: Mapped[str] = mapped_column(String(50))
    medium: Mapped[str] = mapped_column(String(50))
    headmaster_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    student_strength: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )
