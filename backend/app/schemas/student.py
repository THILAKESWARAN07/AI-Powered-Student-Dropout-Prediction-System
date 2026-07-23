from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ==========================================
# SUB-TABLE SCHEMAS
# ==========================================

class StudentAcademicsBase(BaseModel):
    previous_year_percentage: float = Field(..., ge=0, le=100)
    unit_test_average: float = Field(..., ge=0, le=100)
    quarterly_exam: float = Field(..., ge=0, le=100)
    half_yearly_exam: float = Field(..., ge=0, le=100)
    annual_exam: float = Field(..., ge=0, le=100)
    mathematics_marks: float = Field(..., ge=0, le=100)
    science_marks: float = Field(..., ge=0, le=100)
    english_marks: float = Field(..., ge=0, le=100)
    social_science_marks: float = Field(..., ge=0, le=100)
    regional_language_marks: float = Field(..., ge=0, le=100)
    overall_percentage: float = Field(..., ge=0, le=100)
    number_of_failed_subjects: int = Field(..., ge=0)
    academic_backlogs: str = Field(..., description="Yes/No")


class StudentAcademicsCreate(StudentAcademicsBase):
    pass


class StudentAcademicsUpdate(BaseModel):
    previous_year_percentage: Optional[float] = Field(None, ge=0, le=100)
    unit_test_average: Optional[float] = Field(None, ge=0, le=100)
    quarterly_exam: Optional[float] = Field(None, ge=0, le=100)
    half_yearly_exam: Optional[float] = Field(None, ge=0, le=100)
    annual_exam: Optional[float] = Field(None, ge=0, le=100)
    mathematics_marks: Optional[float] = Field(None, ge=0, le=100)
    science_marks: Optional[float] = Field(None, ge=0, le=100)
    english_marks: Optional[float] = Field(None, ge=0, le=100)
    social_science_marks: Optional[float] = Field(None, ge=0, le=100)
    regional_language_marks: Optional[float] = Field(None, ge=0, le=100)
    overall_percentage: Optional[float] = Field(None, ge=0, le=100)
    number_of_failed_subjects: Optional[int] = Field(None, ge=0)
    academic_backlogs: Optional[str] = None


class StudentAcademicsResponse(StudentAcademicsBase):
    id: int
    student_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class StudentAttendanceBase(BaseModel):
    attendance_percentage: float = Field(..., ge=0, le=100)
    consecutive_absences: int = Field(..., ge=0)
    leave_days: int = Field(..., ge=0)
    late_arrivals: int = Field(..., ge=0)


class StudentAttendanceCreate(StudentAttendanceBase):
    pass


class StudentAttendanceUpdate(BaseModel):
    attendance_percentage: Optional[float] = Field(None, ge=0, le=100)
    consecutive_absences: Optional[int] = Field(None, ge=0)
    leave_days: Optional[int] = Field(None, ge=0)
    late_arrivals: Optional[int] = Field(None, ge=0)


class StudentAttendanceResponse(StudentAttendanceBase):
    id: int
    student_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class StudentBehaviourBase(BaseModel):
    homework_completion: float = Field(..., ge=0, le=100)
    assignment_submission_rate: float = Field(..., ge=0, le=100)
    classroom_participation: str = Field(..., description="High/Medium/Low")
    discipline_incidents: int = Field(..., ge=0)
    teacher_feedback: str
    participation_in_extracurricular: str = Field(..., description="Yes/No")
    library_usage: str = Field(..., description="High/Medium/Low")
    low_motivation: str = Field(..., description="Yes/No")
    bullying_experience: str = Field(..., description="Yes/No")


class StudentBehaviourCreate(StudentBehaviourBase):
    pass


class StudentBehaviourUpdate(BaseModel):
    homework_completion: Optional[float] = Field(None, ge=0, le=100)
    assignment_submission_rate: Optional[float] = Field(None, ge=0, le=100)
    classroom_participation: Optional[str] = None
    discipline_incidents: Optional[int] = Field(None, ge=0)
    teacher_feedback: Optional[str] = None
    participation_in_extracurricular: Optional[str] = None
    library_usage: Optional[str] = None
    low_motivation: Optional[str] = None
    bullying_experience: Optional[str] = None


class StudentBehaviourResponse(StudentBehaviourBase):
    id: int
    student_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class StudentFamilyBase(BaseModel):
    family_income: float = Field(..., ge=0)
    parents_education: str
    parents_occupation: str
    single_parent: str = Field(..., description="Yes/No")
    number_of_siblings: int = Field(..., ge=0)
    guardian_support: str = Field(..., description="High/Medium/Low")
    home_study_hours: float = Field(..., ge=0)
    financial_difficulty: str = Field(..., description="Yes/No")
    child_labour_risk: str = Field(..., description="Yes/No")
    frequent_migration: str = Field(..., description="Yes/No")
    family_issues: str = Field(..., description="Yes/No")


class StudentFamilyCreate(StudentFamilyBase):
    pass


class StudentFamilyUpdate(BaseModel):
    family_income: Optional[float] = Field(None, ge=0)
    parents_education: Optional[str] = None
    parents_occupation: Optional[str] = None
    single_parent: Optional[str] = None
    number_of_siblings: Optional[int] = Field(None, ge=0)
    guardian_support: Optional[str] = None
    home_study_hours: Optional[float] = Field(None, ge=0)
    financial_difficulty: Optional[str] = None
    child_labour_risk: Optional[str] = None
    frequent_migration: Optional[str] = None
    family_issues: Optional[str] = None


class StudentFamilyResponse(StudentFamilyBase):
    id: int
    student_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class StudentHealthBase(BaseModel):
    chronic_illness: str = Field(..., description="Yes/No")
    nutrition_status: str = Field(..., description="Good/Average/Poor")
    vision_problems: str = Field(..., description="Yes/No")
    mental_health_risk: str = Field(..., description="High/Medium/Low")
    disability_status: str = Field(..., description="Yes/No")
    midday_meal_beneficiary: str = Field(..., description="Yes/No")


class StudentHealthCreate(StudentHealthBase):
    pass


class StudentHealthUpdate(BaseModel):
    chronic_illness: Optional[str] = None
    nutrition_status: Optional[str] = None
    vision_problems: Optional[str] = None
    mental_health_risk: Optional[str] = None
    disability_status: Optional[str] = None
    midday_meal_beneficiary: Optional[str] = None


class StudentHealthResponse(StudentHealthBase):
    id: int
    student_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class StudentTechnologyBase(BaseModel):
    internet_access: str = Field(..., description="Yes/No")
    smartphone_access: str = Field(..., description="Yes/No")
    computer_access: str = Field(..., description="Yes/No")
    electricity_availability: str = Field(..., description="Yes/No")


class StudentTechnologyCreate(StudentTechnologyBase):
    pass


class StudentTechnologyUpdate(BaseModel):
    internet_access: Optional[str] = None
    smartphone_access: Optional[str] = None
    computer_access: Optional[str] = None
    electricity_availability: Optional[str] = None


class StudentTechnologyResponse(StudentTechnologyBase):
    id: int
    student_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class StudentPredictionBase(BaseModel):
    dropout_risk: str = Field(..., description="Low/Medium/High")
    dropout_status: str = Field(..., description="Yes/No")


class StudentPredictionResponse(StudentPredictionBase):
    id: int
    student_id: int
    predicted_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# CORE STUDENT SCHEMAS
# ==========================================

class StudentBase(BaseModel):
    student_id: str = Field(..., description="Unique Student ID from Dataset")
    full_name: str
    gender: str
    age: int = Field(..., ge=0)
    class_name: str = Field(..., alias="Class")
    section: str = Field(..., alias="Section")
    medium_of_instruction: str
    community: str
    distance_to_school_km: Optional[float] = Field(None, ge=0)
    transport_mode: Optional[str] = None
    travel_time_min: Optional[float] = Field(None, ge=0)
    school_type: Optional[str] = None
    teacher_student_ratio: Optional[str] = None

    class Config:
        populate_by_name = True


class StudentCreate(StudentBase):
    school_id: int
    academics: StudentAcademicsCreate
    attendance: StudentAttendanceCreate
    behaviour: StudentBehaviourCreate
    family: StudentFamilyCreate
    health: StudentHealthCreate
    technology: StudentTechnologyCreate
    initial_prediction: Optional[StudentPredictionBase] = None


class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = Field(None, ge=0)
    class_name: Optional[str] = Field(None, alias="Class")
    section: Optional[str] = Field(None, alias="Section")
    medium_of_instruction: Optional[str] = None
    community: Optional[str] = None
    distance_to_school_km: Optional[float] = Field(None, ge=0)
    transport_mode: Optional[str] = None
    travel_time_min: Optional[float] = Field(None, ge=0)
    school_type: Optional[str] = None
    teacher_student_ratio: Optional[str] = None
    school_id: Optional[int] = None
    
    academics: Optional[StudentAcademicsUpdate] = None
    attendance: Optional[StudentAttendanceUpdate] = None
    behaviour: Optional[StudentBehaviourUpdate] = None
    family: Optional[StudentFamilyUpdate] = None
    health: Optional[StudentHealthUpdate] = None
    technology: Optional[StudentTechnologyUpdate] = None

    class Config:
        populate_by_name = True


class StudentResponse(StudentBase):
    id: int
    school_id: int
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    academics: Optional[StudentAcademicsResponse] = None
    attendance: Optional[StudentAttendanceResponse] = None
    behaviour: Optional[StudentBehaviourResponse] = None
    family: Optional[StudentFamilyResponse] = None
    health: Optional[StudentHealthResponse] = None
    technology: Optional[StudentTechnologyResponse] = None
    predictions: List[StudentPredictionResponse] = []

    class Config:
        from_attributes = True
        populate_by_name = True


# ==========================================
# BULK & IMPORT SCHEMAS
# ==========================================

class BulkDeleteRequest(BaseModel):
    student_ids: List[int]


class BulkStatusUpdateRequest(BaseModel):
    student_ids: List[int]
    class_name: Optional[str] = Field(None, alias="Class")
    section: Optional[str] = Field(None, alias="Section")
    school_id: Optional[int] = None

    class Config:
        populate_by_name = True


class CSVPreviewRow(BaseModel):
    row_index: int
    data: dict


class CSVImportPreviewResponse(BaseModel):
    headers: List[str]
    preview_rows: List[CSVPreviewRow]
    total_rows: int


class ImportErrorDetail(BaseModel):
    row_index: int
    student_id: Optional[str] = None
    errors: List[str]


class ImportSummaryReport(BaseModel):
    total_records: int
    imported: int
    skipped: int
    failed: int
    duplicates: int
    errors: List[ImportErrorDetail]
    failed_rows_json: Optional[str] = None  # JSON string containing all failed rows to download


class StudentListResponse(BaseModel):
    total: int
    results: List[StudentResponse]

    class Config:
        from_attributes = True
        populate_by_name = True
