import io
import csv
import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import or_, and_, desc, asc
from sqlalchemy.orm import Session, joinedload
from openpyxl import Workbook

from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user, RoleChecker
from app.models.user import User
from app.models.student import (
    Student, StudentAcademics, StudentAttendance, 
    StudentBehaviour, StudentFamily, StudentHealth, 
    StudentTechnology, StudentPrediction
)
from app.models.school import School
from app.core.logging import logger
from app.schemas.student import (
    StudentCreate, StudentUpdate, StudentResponse,
    BulkDeleteRequest, BulkStatusUpdateRequest,
    CSVImportPreviewResponse, ImportSummaryReport,
    StudentListResponse
)
from app.services.activity_log import log_activity
from app.services.student import parse_csv_or_excel_headers, import_mapped_records

router = APIRouter(prefix="/students", tags=["Students"])


# Helper function to enforce school-level boundaries on students
def check_student_scope(current_user: User, student: Student):
    if current_user.role in ["headmaster", "teacher"]:
        if current_user.school_id != student.school_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to students outside of your assigned school."
            )


@router.get("/", response_model=StudentListResponse)
def list_students(
    search: Optional[str] = None,
    school_id: Optional[int] = None,
    class_name: Optional[str] = None,
    section: Optional[str] = None,
    gender: Optional[str] = None,
    school_type: Optional[str] = None,
    community: Optional[str] = None,
    attendance_min: Optional[float] = None,
    attendance_max: Optional[float] = None,
    marks_min: Optional[float] = None,
    marks_max: Optional[float] = None,
    family_income_min: Optional[float] = None,
    family_income_max: Optional[float] = None,
    dropout_status: Optional[str] = None,
    financial_difficulty: Optional[str] = None,
    child_labour_risk: Optional[str] = None,
    low_motivation: Optional[str] = None,
    academic_backlogs: Optional[str] = None,
    skip: int = 0,
    limit: Optional[int] = None,
    sort_by: str = "student_id",
    sort_dir: str = "asc",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List, search, filter and paginate student records.
    Permissions:
    - Admin/DEO: View all students.
    - Headmaster/Teacher: Restricted to their assigned school.
    """
    query = db.query(Student).filter(Student.is_deleted == False)

    # 1. Enforce school scope based on role
    if current_user.role in ["headmaster", "teacher"]:
        school_id = current_user.school_id
        query = query.filter(Student.school_id == school_id)
    elif school_id:
        query = query.filter(Student.school_id == school_id)

    # 2. Join sub-tables for filtering and response efficiency
    query = query.outerjoin(StudentAcademics).outerjoin(StudentAttendance).outerjoin(StudentBehaviour).outerjoin(StudentFamily)

    # 3. Apply search
    if search:
        search_filter = or_(
            Student.full_name.ilike(f"%{search}%"),
            Student.student_id.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)

    # 4. Apply categorical filters
    if class_name:
        query = query.filter(Student.class_name == class_name)
    if section:
        query = query.filter(Student.section == section)
    if gender:
        query = query.filter(Student.gender == gender)
    if school_type:
        query = query.filter(Student.school_type == school_type)
    if community:
        query = query.filter(Student.community == community)

    # 5. Apply range filters
    if attendance_min is not None:
        query = query.filter(StudentAttendance.attendance_percentage >= attendance_min)
    if attendance_max is not None:
        query = query.filter(StudentAttendance.attendance_percentage <= attendance_max)
    if marks_min is not None:
        query = query.filter(StudentAcademics.overall_percentage >= marks_min)
    if marks_max is not None:
        query = query.filter(StudentAcademics.overall_percentage <= marks_max)
    if family_income_min is not None:
        query = query.filter(StudentFamily.family_income >= family_income_min)
    if family_income_max is not None:
        query = query.filter(StudentFamily.family_income <= family_income_max)

    # Apply new sub-table binary / target filters
    if financial_difficulty:
        query = query.filter(StudentFamily.financial_difficulty == financial_difficulty)
    if child_labour_risk:
        query = query.filter(StudentFamily.child_labour_risk == child_labour_risk)
    if low_motivation:
        query = query.filter(StudentBehaviour.low_motivation == low_motivation)
    if academic_backlogs:
        query = query.filter(StudentAcademics.academic_backlogs == academic_backlogs)
    if dropout_status:
        from sqlalchemy import func
        latest_pred_sub = db.query(
            StudentPrediction.student_id,
            func.max(StudentPrediction.id).label("latest_id")
        ).group_by(StudentPrediction.student_id).subquery()
        
        query = query.join(
            latest_pred_sub,
            Student.id == latest_pred_sub.c.student_id
        ).join(
            StudentPrediction,
            StudentPrediction.id == latest_pred_sub.c.latest_id
        ).filter(
            StudentPrediction.dropout_status == dropout_status
        )

    # Count total matching records before paginating
    total = query.count()

    # 6. Apply sorting
    sort_attr = getattr(Student, sort_by, None)
    if sort_attr is None:
        # Check sub-tables sorting
        if sort_by == "overall_percentage":
            sort_attr = StudentAcademics.overall_percentage
        elif sort_by == "attendance_percentage":
            sort_attr = StudentAttendance.attendance_percentage
        else:
            sort_attr = Student.student_id

    if sort_dir == "desc":
        query = query.order_by(desc(sort_attr))
    else:
        query = query.order_by(asc(sort_attr))

    # Apply pagination offset & limit
    if limit is not None:
        students_list = query.offset(skip).limit(limit).all()
    else:
        students_list = query.offset(skip).all()

    return {
        "total": total,
        "results": students_list
    }


@router.get("/{id}", response_model=StudentResponse)
def get_student(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve single nested student record.
    """
    student = db.query(Student).filter(Student.id == id, Student.is_deleted == False).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found."
        )
    check_student_scope(current_user, student)
    return student


@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    student_in: StudentCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new student record.
    Admin / Headmaster only. (Teachers / DEOs restricted).
    """
    if current_user.role not in ["admin", "headmaster"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Admins and Headmasters are permitted to create student records."
        )

    # Force assigned school for Headmaster
    target_school_id = student_in.school_id
    if current_user.role == "headmaster":
        target_school_id = current_user.school_id

    # Check duplicate student_id
    exists = db.query(Student).filter(Student.student_id == student_in.student_id, Student.is_deleted == False).first()
    if exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Student ID '{student_in.student_id}' already exists."
        )

    student = Student(
        student_id=student_in.student_id,
        full_name=student_in.full_name,
        gender=student_in.gender,
        age=student_in.age,
        class_name=student_in.class_name,
        section=student_in.section,
        medium_of_instruction=student_in.medium_of_instruction,
        community=student_in.community,
        distance_to_school_km=student_in.distance_to_school_km,
        transport_mode=student_in.transport_mode,
        travel_time_min=student_in.travel_time_min,
        school_type=student_in.school_type,
        teacher_student_ratio=student_in.teacher_student_ratio,
        school_id=target_school_id
    )
    db.add(student)
    db.flush()  # Populates student.id

    # Sub-tables instantiation
    ac = StudentAcademics(**student_in.academics.model_dump(), student_id=student.id)
    att = StudentAttendance(**student_in.attendance.model_dump(), student_id=student.id)
    be = StudentBehaviour(**student_in.behaviour.model_dump(), student_id=student.id)
    fa = StudentFamily(**student_in.family.model_dump(), student_id=student.id)
    he = StudentHealth(**student_in.health.model_dump(), student_id=student.id)
    tech = StudentTechnology(**student_in.technology.model_dump(), student_id=student.id)

    db.add_all([ac, att, be, fa, he, tech])

    # Initial Prediction if provided
    if student_in.initial_prediction:
        pred = StudentPrediction(
            student_id=student.id,
            dropout_risk=student_in.initial_prediction.dropout_risk,
            dropout_status=student_in.initial_prediction.dropout_status
        )
        db.add(pred)

    db.commit()
    db.refresh(student)

    # Log action
    client_ip = request.client.host if request.client else None
    log_activity(
        db=db,
        user_id=current_user.id,
        action="student_created",
        description=f"Created student record {student.student_id} ({student.full_name})",
        ip_address=client_ip
    )

    return student


@router.put("/{id}", response_model=StudentResponse)
def update_student(
    id: int,
    student_in: StudentUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a student record.
    Admin / Headmaster / Teacher. (DEO restricted).
    """
    if current_user.role == "deo":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="DEOs have read-only access and cannot perform updates."
        )

    student = db.query(Student).filter(Student.id == id, Student.is_deleted == False).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found."
        )
    check_student_scope(current_user, student)

    # 1. Update Core info
    update_data = student_in.model_dump(exclude_unset=True)
    
    # Restrict school update for Headmaster/Teacher
    if current_user.role in ["headmaster", "teacher"] and "school_id" in update_data:
        update_data.pop("school_id")

    for field, val in update_data.items():
        if field not in ["academics", "attendance", "behaviour", "family", "health", "technology"]:
            setattr(student, field, val)

    # 2. Update Academics sub-table
    if student_in.academics:
        ac_data = student_in.academics.model_dump(exclude_unset=True)
        if not student.academics:
            student.academics = StudentAcademics(student_id=student.id)
        for field, val in ac_data.items():
            setattr(student.academics, field, val)

    # 3. Update Attendance sub-table
    if student_in.attendance:
        att_data = student_in.attendance.model_dump(exclude_unset=True)
        if not student.attendance:
            student.attendance = StudentAttendance(student_id=student.id)
        for field, val in att_data.items():
            setattr(student.attendance, field, val)

    # 4. Update Behaviour sub-table
    if student_in.behaviour:
        be_data = student_in.behaviour.model_dump(exclude_unset=True)
        if not student.behaviour:
            student.behaviour = StudentBehaviour(student_id=student.id)
        for field, val in be_data.items():
            setattr(student.behaviour, field, val)

    # 5. Update Family sub-table
    if student_in.family:
        fa_data = student_in.family.model_dump(exclude_unset=True)
        if not student.family:
            student.family = StudentFamily(student_id=student.id)
        for field, val in fa_data.items():
            setattr(student.family, field, val)

    # 6. Update Health sub-table
    if student_in.health:
        he_data = student_in.health.model_dump(exclude_unset=True)
        if not student.health:
            student.health = StudentHealth(student_id=student.id)
        for field, val in he_data.items():
            setattr(student.health, field, val)

    # 7. Update Technology sub-table
    if student_in.technology:
        tech_data = student_in.technology.model_dump(exclude_unset=True)
        if not student.technology:
            student.technology = StudentTechnology(student_id=student.id)
        for field, val in tech_data.items():
            setattr(student.technology, field, val)

    db.commit()
    db.refresh(student)

    # Log action
    client_ip = request.client.host if request.client else None
    log_activity(
        db=db,
        user_id=current_user.id,
        action="student_updated",
        description=f"Updated student record {student.student_id}",
        ip_address=client_ip
    )

    return student


@router.delete("/{id}")
def delete_student(
    id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Soft-delete a student record.
    Admin / Headmaster only.
    """
    if current_user.role not in ["admin", "headmaster"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Admins and Headmasters can delete student records."
        )

    student = db.query(Student).filter(Student.id == id, Student.is_deleted == False).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found."
        )
    check_student_scope(current_user, student)

    # Soft delete
    student.is_deleted = True
    db.commit()

    # Log action
    client_ip = request.client.host if request.client else None
    log_activity(
        db=db,
        user_id=current_user.id,
        action="student_deleted",
        description=f"Soft deleted student {student.student_id}",
        ip_address=client_ip
    )

    return {"detail": "Student record soft deleted successfully."}


@router.post("/bulk-delete")
def bulk_delete_students(
    req_body: BulkDeleteRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Bulk soft-delete student records.
    Admin / Headmaster only.
    """
    if current_user.role not in ["admin", "headmaster"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permissions restricted to Admins and Headmasters."
        )

    query = db.query(Student).filter(Student.id.in_(req_body.student_ids), Student.is_deleted == False)
    if current_user.role == "headmaster":
        query = query.filter(Student.school_id == current_user.school_id)

    students = query.all()
    if not students:
        return {"detail": "No records matched the criteria."}

    for s in students:
        s.is_deleted = True
    db.commit()

    # Log action
    client_ip = request.client.host if request.client else None
    log_activity(
        db=db,
        user_id=current_user.id,
        action="student_deleted_bulk",
        description=f"Bulk soft deleted {len(students)} student records",
        ip_address=client_ip
    )

    return {"detail": f"Successfully soft deleted {len(students)} students."}


@router.post("/bulk-status-update")
def bulk_update_students(
    req_body: BulkStatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Bulk update Class, Section, or School assignments.
    Admin / Headmaster only.
    """
    if current_user.role not in ["admin", "headmaster"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permissions restricted to Admins and Headmasters."
        )

    query = db.query(Student).filter(Student.id.in_(req_body.student_ids), Student.is_deleted == False)
    if current_user.role == "headmaster":
        query = query.filter(Student.school_id == current_user.school_id)

    students = query.all()
    if not students:
        return {"detail": "No records matched."}

    updated_count = 0
    for s in students:
        if req_body.class_name:
            s.class_name = req_body.class_name
        if req_body.section:
            s.section = req_body.section
        if req_body.school_id and current_user.role == "admin":
            s.school_id = req_body.school_id
        updated_count += 1

    db.commit()
    return {"detail": f"Successfully updated {updated_count} student records."}


@router.post("/export")
def export_students(
    export_format: str = "csv",
    search: Optional[str] = None,
    school_id: Optional[int] = None,
    class_name: Optional[str] = None,
    section: Optional[str] = None,
    gender: Optional[str] = None,
    school_type: Optional[str] = None,
    community: Optional[str] = None,
    attendance_min: Optional[float] = None,
    attendance_max: Optional[float] = None,
    marks_min: Optional[float] = None,
    marks_max: Optional[float] = None,
    family_income_min: Optional[float] = None,
    family_income_max: Optional[float] = None,
    dropout_status: Optional[str] = None,
    financial_difficulty: Optional[str] = None,
    child_labour_risk: Optional[str] = None,
    low_motivation: Optional[str] = None,
    academic_backlogs: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export students matching filters as CSV or Excel (.xlsx).
    """
    query = db.query(Student).filter(Student.is_deleted == False)
    if current_user.role in ["headmaster", "teacher"]:
        query = query.filter(Student.school_id == current_user.school_id)
    elif school_id:
        query = query.filter(Student.school_id == school_id)

    # Join sub-tables
    query = query.outerjoin(StudentAcademics).outerjoin(StudentAttendance).outerjoin(StudentBehaviour).outerjoin(StudentFamily)

    if search:
        query = query.filter(or_(
            Student.full_name.ilike(f"%{search}%"),
            Student.student_id.ilike(f"%{search}%")
        ))
    if class_name:
        query = query.filter(Student.class_name == class_name)
    if section:
        query = query.filter(Student.section == section)
    if gender:
        query = query.filter(Student.gender == gender)
    if school_type:
        query = query.filter(Student.school_type == school_type)
    if community:
        query = query.filter(Student.community == community)

    if attendance_min is not None:
        query = query.filter(StudentAttendance.attendance_percentage >= attendance_min)
    if attendance_max is not None:
        query = query.filter(StudentAttendance.attendance_percentage <= attendance_max)
    if marks_min is not None:
        query = query.filter(StudentAcademics.overall_percentage >= marks_min)
    if marks_max is not None:
        query = query.filter(StudentAcademics.overall_percentage <= marks_max)
    if family_income_min is not None:
        query = query.filter(StudentFamily.family_income >= family_income_min)
    if family_income_max is not None:
        query = query.filter(StudentFamily.family_income <= family_income_max)

    if financial_difficulty:
        query = query.filter(StudentFamily.financial_difficulty == financial_difficulty)
    if child_labour_risk:
        query = query.filter(StudentFamily.child_labour_risk == child_labour_risk)
    if low_motivation:
        query = query.filter(StudentBehaviour.low_motivation == low_motivation)
    if academic_backlogs:
        query = query.filter(StudentAcademics.academic_backlogs == academic_backlogs)
    if dropout_status:
        from sqlalchemy import func
        latest_pred_sub = db.query(
            StudentPrediction.student_id,
            func.max(StudentPrediction.id).label("latest_id")
        ).group_by(StudentPrediction.student_id).subquery()
        
        query = query.join(
            latest_pred_sub,
            Student.id == latest_pred_sub.c.student_id
        ).join(
            StudentPrediction,
            StudentPrediction.id == latest_pred_sub.c.latest_id
        ).filter(
            StudentPrediction.dropout_status == dropout_status
        )

    students = query.all()

    # Column headers exactly matching dataset
    headers = [
        "Student_ID", "Gender", "Age", "Class", "Section", "Medium_of_Instruction",
        "Community", "Previous_Year_Percentage", "Unit_Test_Average", "Quarterly_Exam",
        "Half_Yearly_Exam", "Annual_Exam", "Mathematics_Marks", "Science_Marks",
        "English_Marks", "Social_Science_Marks", "Regional_Language_Marks", "Overall_Percentage",
        "Number_of_Failed_Subjects", "Attendance_Percentage", "Consecutive_Absences",
        "Leave_Days", "Late_Arrivals", "Homework_Completion", "Assignment_Submission_Rate",
        "Classroom_Participation", "Discipline_Incidents", "Teacher_Feedback", "Family_Income",
        "Parents_Education", "Parents_Occupation", "Single_Parent", "Number_of_Siblings",
        "Guardian_Support", "Home_Study_Hours", "Distance_to_School_km", "Transport_Mode",
        "Travel_Time_min", "Chronic_Illness", "Nutrition_Status", "Vision_Problems",
        "Mental_Health_Risk", "Disability_Status", "Internet_Access", "Smartphone_Access",
        "Computer_Access", "Electricity_Availability", "School_Type", "Teacher_Student_Ratio",
        "Midday_Meal_Beneficiary", "Participation_in_Extracurricular", "Library_Usage",
        "Financial_Difficulty", "Child_Labour_Risk", "Frequent_Migration", "Family_Issues",
        "Academic_Backlogs", "Low_Motivation", "Bullying_Experience", "Dropout_Risk", "Dropout_Status"
    ]

    def generate_row(s: Student):
        ac = s.academics or StudentAcademics(
            previous_year_percentage=0.0, unit_test_average=0.0, quarterly_exam=0.0,
            half_yearly_exam=0.0, annual_exam=0.0, mathematics_marks=0.0, science_marks=0.0,
            english_marks=0.0, social_science_marks=0.0, regional_language_marks=0.0,
            overall_percentage=0.0, number_of_failed_subjects=0, academic_backlogs="No"
        )
        att = s.attendance or StudentAttendance(
            attendance_percentage=0.0, consecutive_absences=0, leave_days=0, late_arrivals=0
        )
        be = s.behaviour or StudentBehaviour(
            homework_completion=0.0, assignment_submission_rate=0.0, classroom_participation="Medium",
            discipline_incidents=0, teacher_feedback="Average", participation_in_extracurricular="No",
            library_usage="Medium", low_motivation="No", bullying_experience="No"
        )
        fa = s.family or StudentFamily(
            family_income=0.0, parents_education="Primary", parents_occupation="Farmer",
            single_parent="No", number_of_siblings=0, guardian_support="Medium",
            home_study_hours=0.0, financial_difficulty="No", child_labour_risk="No",
            frequent_migration="No", family_issues="No"
        )
        he = s.health or StudentHealth(
            chronic_illness="No", nutrition_status="Average", vision_problems="No",
            mental_health_risk="Low", disability_status="No", midday_meal_beneficiary="No"
        )
        tech = s.technology or StudentTechnology(
            internet_access="No", smartphone_access="No", computer_access="No", electricity_availability="Yes"
        )
        # Fetch latest prediction
        pred_risk = "Low"
        pred_status = "No"
        if s.predictions:
            pred_risk = s.predictions[0].dropout_risk
            pred_status = s.predictions[0].dropout_status

        return [
            s.student_id, s.gender, s.age, s.class_name, s.section, s.medium_of_instruction,
            s.community, ac.previous_year_percentage, ac.unit_test_average, ac.quarterly_exam,
            ac.half_yearly_exam, ac.annual_exam, ac.mathematics_marks, ac.science_marks,
            ac.english_marks, ac.social_science_marks, ac.regional_language_marks, ac.overall_percentage,
            ac.number_of_failed_subjects, att.attendance_percentage, att.consecutive_absences,
            att.leave_days, att.late_arrivals, be.homework_completion, be.assignment_submission_rate,
            be.classroom_participation, be.discipline_incidents, be.teacher_feedback, fa.family_income,
            fa.parents_education, fa.parents_occupation, fa.single_parent, fa.number_of_siblings,
            fa.guardian_support, fa.home_study_hours, s.distance_to_school_km, s.transport_mode,
            s.travel_time_min, he.chronic_illness, he.nutrition_status, he.vision_problems,
            he.mental_health_risk, he.disability_status, tech.internet_access, tech.smartphone_access,
            tech.computer_access, tech.electricity_availability, s.school_type, s.teacher_student_ratio,
            he.midday_meal_beneficiary, be.participation_in_extracurricular, be.library_usage,
            fa.financial_difficulty, fa.child_labour_risk, fa.frequent_migration, fa.family_issues,
            ac.academic_backlogs, be.low_motivation, be.bullying_experience, pred_risk, pred_status
        ]

    # Return Excel download
    if export_format == "xlsx":
        wb = Workbook()
        ws = wb.active
        ws.title = "Students Export"
        ws.append(headers)
        for s in students:
            ws.append(generate_row(s))
        
        file_stream = io.BytesIO()
        wb.save(file_stream)
        file_stream.seek(0)
        
        return StreamingResponse(
            file_stream,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=students_export.xlsx"}
        )
        
    # Return CSV download
    else:
        file_stream = io.StringIO()
        writer = csv.writer(file_stream)
        writer.writerow(headers)
        for s in students:
            writer.writerow(generate_row(s))
        
        output = io.BytesIO(file_stream.getvalue().encode('utf-8'))
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=students_export.csv"}
        )


@router.post("/import/preview", response_model=CSVImportPreviewResponse)
def preview_import_file(
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user)
):
    """
    Upload CSV or Excel, reading columns and preview rows for map UI.
    Falls back to loading the sample dataset if no file is uploaded.
    """
    if current_user.role == "deo":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="DEOs have read-only access."
        )

    import os
    if not file:
        path = os.path.abspath(__file__)
        for _ in range(5):
            path = os.path.dirname(path)
        sample_path = os.path.join(path, "dataset", "sample_dataset.csv")
        try:
            with open(sample_path, "rb") as sf:
                file_content = sf.read()
            filename = "sample_dataset.csv"
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Could not load fallback sample dataset preview: {str(e)}"
            )
    else:
        file_content = file.file.read()
        filename = file.filename
        logger.info("=" * 60)
        logger.info(f"PREVIEW FILENAME: {file.filename}")
        logger.info(f"PREVIEW FILE SIZE: {len(file_content)} bytes")
        logger.info(file_content[:500].decode("utf-8", errors="ignore"))
        logger.info("=" * 60)

    headers, preview_rows, total_rows = parse_csv_or_excel_headers(file_content, filename)
    
    return {
        "headers": headers,
        "preview_rows": preview_rows,
        "total_rows": total_rows
    }


@router.post("/import/run", response_model=ImportSummaryReport)
def run_import_file(
    request: Request,
    file: Optional[UploadFile] = File(None),
    mapping_json: Optional[str] = Form(None),
    school_id: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Commit mappings and imports dataset records directly to normalized sub-tables.
    Falls back to loading the sample dataset if no file is uploaded.
    """
    try:
        if current_user.role not in ["admin", "headmaster"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permissions restricted to Admins and Headmasters."
            )

        # Resolve school_id fallback
        resolved_school_id = None
        if school_id is not None and school_id not in ("", "0", 0):
            try:
                resolved_school_id = int(school_id)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid school_id configuration: '{school_id}'."
                )

        if resolved_school_id is None:
            if current_user.school_id is not None:
                resolved_school_id = current_user.school_id
            else:
                first_school = db.query(School).first()
                if not first_school:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="No target school specified and no school exists in the database to fallback on."
                    )
                resolved_school_id = first_school.id

        # Restrict Headmaster school choice
        if current_user.role == "headmaster" and current_user.school_id != resolved_school_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Headmasters can only import students into their own assigned school."
            )

        mapping = {}
        if mapping_json and mapping_json not in ("string", "{}", ""):
            try:
                mapping = json.loads(mapping_json)
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid mapping JSON configuration: '{mapping_json}'."
                )

        import os
        if not file:
            path = os.path.abspath(__file__)
            for _ in range(5):
                path = os.path.dirname(path)
            sample_path = os.path.join(path, "dataset", "sample_dataset.csv")
            try:
                with open(sample_path, "rb") as sf:
                    file_content = sf.read()
                filename = "sample_dataset.csv"
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Could not load fallback sample dataset: {str(e)}"
                )
        else:
            file_content = file.file.read()
            filename = file.filename
            logger.info("=" * 60)
            logger.info(f"RUN FILENAME: {file.filename}")
            logger.info(f"RUN FILE SIZE: {len(file_content)} bytes")
            logger.info(file_content[:500].decode("utf-8", errors="ignore"))
            logger.info("=" * 60)

        report = import_mapped_records(
            db=db,
            file_content=file_content,
            filename=filename,
            mapping=mapping,
            school_id=resolved_school_id
        )

        # Immediately check count using the same session as the API
        from sqlalchemy import text
        try:
            sql_count = db.execute(text("SELECT COUNT(*) FROM students WHERE is_deleted = false")).scalar()
            logger.info(f"[IMPORT DIAGNOSTIC] SQL Count after import in same session: {sql_count}")
        except Exception as e:
            logger.error(f"[IMPORT DIAGNOSTIC] Failed to count students: {e}")

        # Audit log
        client_ip = request.client.host if request.client else None
        log_activity(
            db=db,
            user_id=current_user.id,
            action="student_csv_imported",
            description=f"CSV/Excel imported to school {resolved_school_id}: {report.imported} success, {report.failed} failures (Demo Mode)" if not file else f"CSV/Excel imported to school {resolved_school_id}: {report.imported} success, {report.failed} failures",
            ip_address=client_ip
        )

        return report
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        logger.error(f"EXCEPTION IN IMPORT ROUTER:\n{tb}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=500,
            detail=f"Import router exception: {str(e)}\nTraceback:\n{tb}"
        )
