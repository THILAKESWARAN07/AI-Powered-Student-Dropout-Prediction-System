from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), index=True)
    gender: Mapped[str] = mapped_column(String(50))
    age: Mapped[int] = mapped_column(Integer)
    class_name: Mapped[str] = mapped_column(String(50))
    section: Mapped[str] = mapped_column(String(50))
    medium_of_instruction: Mapped[str] = mapped_column(String(100))
    community: Mapped[str] = mapped_column(String(100))
    distance_to_school_km: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    transport_mode: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    travel_time_min: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    school_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    teacher_student_ratio: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    school_id: Mapped[int] = mapped_column(ForeignKey("schools.id", ondelete="CASCADE"), index=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    school = relationship("School")
    academics: Mapped["StudentAcademics"] = relationship(back_populates="student", cascade="all, delete-orphan", uselist=False)
    attendance: Mapped["StudentAttendance"] = relationship(back_populates="student", cascade="all, delete-orphan", uselist=False)
    behaviour: Mapped["StudentBehaviour"] = relationship(back_populates="student", cascade="all, delete-orphan", uselist=False)
    family: Mapped["StudentFamily"] = relationship(back_populates="student", cascade="all, delete-orphan", uselist=False)
    health: Mapped["StudentHealth"] = relationship(back_populates="student", cascade="all, delete-orphan", uselist=False)
    technology: Mapped["StudentTechnology"] = relationship(back_populates="student", cascade="all, delete-orphan", uselist=False)
    predictions: Mapped[List["StudentPrediction"]] = relationship(back_populates="student", cascade="all, delete-orphan", order_by="desc(StudentPrediction.predicted_at)")


class StudentAcademics(Base):
    __tablename__ = "student_academics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), unique=True, index=True)
    previous_year_percentage: Mapped[float] = mapped_column(Float)
    unit_test_average: Mapped[float] = mapped_column(Float)
    quarterly_exam: Mapped[float] = mapped_column(Float)
    half_yearly_exam: Mapped[float] = mapped_column(Float)
    annual_exam: Mapped[float] = mapped_column(Float)
    mathematics_marks: Mapped[float] = mapped_column(Float)
    science_marks: Mapped[float] = mapped_column(Float)
    english_marks: Mapped[float] = mapped_column(Float)
    social_science_marks: Mapped[float] = mapped_column(Float)
    regional_language_marks: Mapped[float] = mapped_column(Float)
    overall_percentage: Mapped[float] = mapped_column(Float)
    number_of_failed_subjects: Mapped[int] = mapped_column(Integer)
    academic_backlogs: Mapped[str] = mapped_column(String(50))  # "Yes" / "No"
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="academics")


class StudentAttendance(Base):
    __tablename__ = "student_attendance"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), unique=True, index=True)
    attendance_percentage: Mapped[float] = mapped_column(Float)
    consecutive_absences: Mapped[int] = mapped_column(Integer)
    leave_days: Mapped[int] = mapped_column(Integer)
    late_arrivals: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="attendance")


class StudentBehaviour(Base):
    __tablename__ = "student_behaviour"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), unique=True, index=True)
    homework_completion: Mapped[float] = mapped_column(Float)
    assignment_submission_rate: Mapped[float] = mapped_column(Float)
    classroom_participation: Mapped[str] = mapped_column(String(100))  # "High" / "Medium" / "Low"
    discipline_incidents: Mapped[int] = mapped_column(Integer)
    teacher_feedback: Mapped[str] = mapped_column(String(255))
    participation_in_extracurricular: Mapped[str] = mapped_column(String(50))  # "Yes" / "No"
    library_usage: Mapped[str] = mapped_column(String(100))  # "High" / "Medium" / "Low"
    low_motivation: Mapped[str] = mapped_column(String(50))  # "Yes" / "No"
    bullying_experience: Mapped[str] = mapped_column(String(50))  # "Yes" / "No"
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="behaviour")


class StudentFamily(Base):
    __tablename__ = "student_family"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), unique=True, index=True)
    family_income: Mapped[float] = mapped_column(Float)
    parents_education: Mapped[str] = mapped_column(String(255))
    parents_occupation: Mapped[str] = mapped_column(String(255))
    single_parent: Mapped[str] = mapped_column(String(50))  # "Yes" / "No"
    number_of_siblings: Mapped[int] = mapped_column(Integer)
    guardian_support: Mapped[str] = mapped_column(String(100))  # "High" / "Medium" / "Low"
    home_study_hours: Mapped[float] = mapped_column(Float)
    financial_difficulty: Mapped[str] = mapped_column(String(50))  # "Yes" / "No"
    child_labour_risk: Mapped[str] = mapped_column(String(50))  # "Yes" / "No"
    frequent_migration: Mapped[str] = mapped_column(String(50))  # "Yes" / "No"
    family_issues: Mapped[str] = mapped_column(String(50))  # "Yes" / "No"
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="family")


class StudentHealth(Base):
    __tablename__ = "student_health"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), unique=True, index=True)
    chronic_illness: Mapped[str] = mapped_column(String(50))  # "Yes" / "No"
    nutrition_status: Mapped[str] = mapped_column(String(100))  # "Good" / "Average" / "Poor"
    vision_problems: Mapped[str] = mapped_column(String(50))  # "Yes" / "No"
    mental_health_risk: Mapped[str] = mapped_column(String(100))  # "High" / "Medium" / "Low"
    disability_status: Mapped[str] = mapped_column(String(50))  # "Yes" / "No"
    midday_meal_beneficiary: Mapped[str] = mapped_column(String(50))  # "Yes" / "No"
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="health")


class StudentTechnology(Base):
    __tablename__ = "student_technology"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), unique=True, index=True)
    internet_access: Mapped[str] = mapped_column(String(50))  # "Yes" / "No"
    smartphone_access: Mapped[str] = mapped_column(String(50))  # "Yes" / "No"
    computer_access: Mapped[str] = mapped_column(String(50))  # "Yes" / "No"
    electricity_availability: Mapped[str] = mapped_column(String(50))  # "Yes" / "No"
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="technology")


class StudentPrediction(Base):
    __tablename__ = "student_predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    dropout_risk: Mapped[str] = mapped_column(String(50))  # "Low" / "Medium" / "High"
    dropout_status: Mapped[str] = mapped_column(String(50))  # "Yes" / "No"
    probability: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    top_features: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    recommended_actions: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    model_version: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    predicted_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="predictions")
