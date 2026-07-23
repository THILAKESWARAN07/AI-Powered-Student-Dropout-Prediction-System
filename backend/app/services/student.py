import csv
import io
import json
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
from openpyxl import load_workbook

from app.models.student import (
    Student, StudentAcademics, StudentAttendance, 
    StudentBehaviour, StudentFamily, StudentHealth, 
    StudentTechnology, StudentPrediction
)
from app.models.school import School
from app.schemas.student import ImportSummaryReport, ImportErrorDetail


def parse_csv_or_excel_headers(file_content: bytes, filename: str) -> Tuple[List[str], List[Dict[str, Any]], int]:
    """
    Parses a CSV or Excel file, extracting column headers, preview rows, and total row count.
    """
    headers = []
    rows = []
    
    if filename.endswith(('.xlsx', '.xls')):
        # Load Excel
        wb = load_workbook(io.BytesIO(file_content), read_only=True, data_only=True)
        sheet = wb.active
        
        # Extract headers
        header_row = next(sheet.iter_rows(values_only=True), None)
        if header_row:
            headers = [str(h).strip() for h in header_row if h is not None]
            
        # Extract preview rows (up to 5) and count total
        total_rows = 0
        for i, row in enumerate(sheet.iter_rows(values_only=True)):
            if i == 0:
                continue
            total_rows += 1
            if len(rows) < 5:
                row_data = {}
                for idx, val in enumerate(row):
                    if idx < len(headers):
                        row_data[headers[idx]] = val
                rows.append({"row_index": total_rows, "data": row_data})
                
    else:
        # Load CSV
        text_content = file_content.decode('utf-8', errors='ignore')
        reader = csv.reader(io.StringIO(text_content))
        
        header_row = next(reader, None)
        if header_row:
            headers = [str(h).strip() for h in header_row if h]
            
        total_rows = 0
        for row in reader:
            if not row:
                continue
            total_rows += 1
            if len(rows) < 5:
                row_data = {}
                for idx, val in enumerate(row):
                    if idx < len(headers):
                        row_data[headers[idx]] = val.strip()
                rows.append({"row_index": total_rows, "data": row_data})
                
    return headers, rows, total_rows


def validate_and_convert_row(
    row_data: Dict[str, Any], 
    mapping: Dict[str, str], 
    row_idx: int,
    db: Session,
    imported_student_ids: set
) -> Tuple[Optional[Dict[str, Any]], List[str]]:
    """
    Validates a single row mapping dataset values to schema elements.
    """
    errors = []
    mapped_data = {}
    
    # 1. Reverse-map the dataset keys to model attributes
    model_fields = {}
    for dataset_col, db_col in mapping.items():
        if not dataset_col or not db_col:
            continue
        val = row_data.get(dataset_col)
        model_fields[db_col] = str(val).strip() if val is not None else None

    # Helper function to extract float/int safely
    def get_float(field: str, label: str, required: bool = True, min_val: float = 0.0, max_val: float = 100.0) -> Optional[float]:
        val_str = model_fields.get(field)
        if val_str is None or val_str == "":
            if required:
                errors.append(f"{label} is required.")
            return None
        try:
            val = float(val_str)
            if val < min_val or val > max_val:
                errors.append(f"{label} ({val}) must be between {min_val} and {max_val}.")
                return None
            return val
        except ValueError:
            errors.append(f"{label} ('{val_str}') must be a valid decimal number.")
            return None

    def get_int(field: str, label: str, required: bool = True, min_val: int = 0) -> Optional[int]:
        val_str = model_fields.get(field)
        if val_str is None or val_str == "":
            if required:
                errors.append(f"{label} is required.")
            return None
        try:
            val = int(val_str)
            if val < min_val:
                errors.append(f"{label} ({val}) must be greater than or equal to {min_val}.")
                return None
            return val
        except ValueError:
            errors.append(f"{label} ('{val_str}') must be a valid integer.")
            return None

    # Validate Core Student info
    student_id = model_fields.get("student_id")
    if not student_id:
        errors.append("Student_ID is required.")
    else:
        # Check duplicate within this CSV
        if student_id in imported_student_ids:
            errors.append(f"Duplicate Student_ID '{student_id}' in the import file.")
        else:
            # Check duplicate in database
            exists = db.query(Student).filter(Student.student_id == student_id, Student.is_deleted == False).first()
            if exists:
                errors.append(f"Student_ID '{student_id}' already exists in database.")

    # Name: default to Student_ID if missing
    full_name = model_fields.get("full_name") or f"Student {student_id}"
    
    # Class / Section
    class_name = model_fields.get("class_name")
    if not class_name:
        errors.append("Class is required.")
    section = model_fields.get("section")
    if not section:
        errors.append("Section is required.")
        
    gender = model_fields.get("gender") or "Male"
    age = get_int("age", "Age", required=True, min_val=4)
    medium = model_fields.get("medium_of_instruction") or "Regional Language"
    community = model_fields.get("community") or "General"
    
    # Optional travel columns
    distance = get_float("distance_to_school_km", "Distance to School", required=False, min_val=0, max_val=100)
    transport = model_fields.get("transport_mode") or "Walking"
    travel_time = get_float("travel_time_min", "Travel Time", required=False, min_val=0, max_val=300)
    school_type = model_fields.get("school_type") or "Government"
    ratio = model_fields.get("teacher_student_ratio") or "1:35"

    if errors:
        return None, errors

    # Academics
    prev_pct = get_float("previous_year_percentage", "Previous Year Percentage")
    ut_avg = get_float("unit_test_average", "Unit Test Average")
    q_exam = get_float("quarterly_exam", "Quarterly Exam")
    hy_exam = get_float("half_yearly_exam", "Half Yearly Exam")
    a_exam = get_float("annual_exam", "Annual Exam")
    math = get_float("mathematics_marks", "Mathematics Marks")
    sci = get_float("science_marks", "Science Marks")
    eng = get_float("english_marks", "English Marks")
    soc = get_float("social_science_marks", "Social Science Marks")
    lang = get_float("regional_language_marks", "Regional Language Marks")
    overall = get_float("overall_percentage", "Overall Percentage")
    failed = get_int("number_of_failed_subjects", "Number of Failed Subjects")
    backlogs = model_fields.get("academic_backlogs") or "No"

    # Attendance
    att_pct = get_float("attendance_percentage", "Attendance Percentage")
    consec = get_int("consecutive_absences", "Consecutive Absences")
    leaves = get_int("leave_days", "Leave Days")
    late = get_int("late_arrivals", "Late Arrivals")

    # Behaviour
    hw = get_float("homework_completion", "Homework Completion")
    assign = get_float("assignment_submission_rate", "Assignment Submission Rate")
    participate = model_fields.get("classroom_participation") or "Medium"
    discipline = get_int("discipline_incidents", "Discipline Incidents")
    feedback = model_fields.get("teacher_feedback") or "Average"
    extracur = model_fields.get("participation_in_extracurricular") or "No"
    lib = model_fields.get("library_usage") or "Medium"
    motivation = model_fields.get("low_motivation") or "No"
    bullying = model_fields.get("bullying_experience") or "No"

    # Family
    income = get_float("family_income", "Family Income", min_val=0, max_val=10000000)
    edu = model_fields.get("parents_education") or "Primary"
    job = model_fields.get("parents_occupation") or "Farmer"
    single = model_fields.get("single_parent") or "No"
    siblings = get_int("number_of_siblings", "Number of Siblings")
    guard = model_fields.get("guardian_support") or "Medium"
    hours = get_float("home_study_hours", "Home Study Hours", min_val=0, max_val=24)
    difficulty = model_fields.get("financial_difficulty") or "No"
    labour = model_fields.get("child_labour_risk") or "No"
    migration = model_fields.get("frequent_migration") or "No"
    issues = model_fields.get("family_issues") or "No"

    # Health
    illness = model_fields.get("chronic_illness") or "No"
    nutrition = model_fields.get("nutrition_status") or "Average"
    vision = model_fields.get("vision_problems") or "No"
    mental = model_fields.get("mental_health_risk") or "Low"
    disability = model_fields.get("disability_status") or "No"
    meal = model_fields.get("midday_meal_beneficiary") or "No"

    # Tech
    internet = model_fields.get("internet_access") or "No"
    phone = model_fields.get("smartphone_access") or "No"
    comp = model_fields.get("computer_access") or "No"
    elec = model_fields.get("electricity_availability") or "Yes"

    # Predictions
    risk = model_fields.get("dropout_risk") or "Low"
    status = model_fields.get("dropout_status") or "No"

    if errors:
        return None, errors

    # Package objects
    mapped_data = {
        "student": Student(
            student_id=student_id,
            full_name=full_name,
            gender=gender,
            age=age,
            class_name=class_name,
            section=section,
            medium_of_instruction=medium,
            community=community,
            distance_to_school_km=distance,
            transport_mode=transport,
            travel_time_min=travel_time,
            school_type=school_type,
            teacher_student_ratio=ratio
        ),
        "academics": StudentAcademics(
            previous_year_percentage=prev_pct,
            unit_test_average=ut_avg,
            quarterly_exam=q_exam,
            half_yearly_exam=hy_exam,
            annual_exam=a_exam,
            mathematics_marks=math,
            science_marks=sci,
            english_marks=eng,
            social_science_marks=soc,
            regional_language_marks=lang,
            overall_percentage=overall,
            number_of_failed_subjects=failed,
            academic_backlogs=backlogs
        ),
        "attendance": StudentAttendance(
            attendance_percentage=att_pct,
            consecutive_absences=consec,
            leave_days=leaves,
            late_arrivals=late
        ),
        "behaviour": StudentBehaviour(
            homework_completion=hw,
            assignment_submission_rate=assign,
            classroom_participation=participate,
            discipline_incidents=discipline,
            teacher_feedback=feedback,
            participation_in_extracurricular=extracur,
            library_usage=lib,
            low_motivation=motivation,
            bullying_experience=bullying
        ),
        "family": StudentFamily(
            family_income=income,
            parents_education=edu,
            parents_occupation=job,
            single_parent=single,
            number_of_siblings=siblings,
            guardian_support=guard,
            home_study_hours=hours,
            financial_difficulty=difficulty,
            child_labour_risk=labour,
            frequent_migration=migration,
            family_issues=issues
        ),
        "health": StudentHealth(
            chronic_illness=illness,
            nutrition_status=nutrition,
            vision_problems=vision,
            mental_health_risk=mental,
            disability_status=disability,
            midday_meal_beneficiary=meal
        ),
        "technology": StudentTechnology(
            internet_access=internet,
            smartphone_access=phone,
            computer_access=comp,
            electricity_availability=elec
        ),
        "prediction": StudentPrediction(
            dropout_risk=risk,
            dropout_status=status
        )
    }
    
    return mapped_data, []


def import_mapped_records(
    db: Session,
    file_content: bytes,
    filename: str,
    mapping: Dict[str, str],
    school_id: int
) -> ImportSummaryReport:
    """
    Iterates over the import sheet, validates row schemas, maps fields, and writes to database.
    """
    total_records = 0
    imported = 0
    skipped = 0
    failed = 0
    duplicates = 0
    error_list = []
    
    imported_student_ids = set()
    failed_rows = []

    # Verify target school exists
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise ValueError(f"School with ID {school_id} does not exist.")

    # 1. Parse rows
    headers = []
    rows_raw = []
    
    if filename.endswith(('.xlsx', '.xls')):
        wb = load_workbook(io.BytesIO(file_content), read_only=True, data_only=True)
        sheet = wb.active
        header_row = next(sheet.iter_rows(values_only=True), None)
        if header_row:
            headers = [str(h).strip() for h in header_row if h is not None]
        for row in sheet.iter_rows(values_only=True):
            if not rows_raw and len(row) > 0: # skip first row (header)
                rows_raw.append(row) # dummy push to skip header
                continue
            row_data = {}
            for idx, val in enumerate(row):
                if idx < len(headers):
                    row_data[headers[idx]] = val
            rows_raw.append(row_data)
        rows_raw = rows_raw[1:] # strip header
    else:
        text_content = file_content.decode('utf-8', errors='ignore')
        reader = csv.reader(io.StringIO(text_content))
        header_row = next(reader, None)
        if header_row:
            headers = [str(h).strip() for h in header_row if h]
        for row in reader:
            if not row:
                continue
            row_data = {}
            for idx, val in enumerate(row):
                if idx < len(headers):
                    row_data[headers[idx]] = val.strip()
            rows_raw.append(row_data)

    total_records = len(rows_raw)

    # 2. Iterate and validate
    for idx, row_data in enumerate(rows_raw):
        row_idx = idx + 1
        
        # Execute validation
        mapped_data, row_errors = validate_and_convert_row(
            row_data=row_data,
            mapping=mapping,
            row_idx=row_idx,
            db=db,
            imported_student_ids=imported_student_ids
        )
        
        if row_errors:
            failed += 1
            error_list.append(ImportErrorDetail(
                row_index=row_idx,
                student_id=row_data.get("Student_ID") or row_data.get("student_id"),
                errors=row_errors
            ))
            
            # Record failed row data for download
            failed_row_record = dict(row_data)
            failed_row_record["_row_index"] = row_idx
            failed_row_record["_errors"] = ", ".join(row_errors)
            failed_rows.append(failed_row_record)
            
            # Count duplicates if it was a duplicate error
            if any("already exists" in e or "Duplicate Student_ID" in e for e in row_errors):
                duplicates += 1
            continue

        # Save to database
        try:
            student = mapped_data["student"]
            student.school_id = school_id
            
            # Save core student record
            db.add(student)
            db.flush() # populates student.id
            
            # Assign relations
            academics = mapped_data["academics"]
            academics.student_id = student.id
            db.add(academics)
            
            attendance = mapped_data["attendance"]
            attendance.student_id = student.id
            db.add(attendance)
            
            behaviour = mapped_data["behaviour"]
            behaviour.student_id = student.id
            db.add(behaviour)
            
            family = mapped_data["family"]
            family.student_id = student.id
            db.add(family)
            
            health = mapped_data["health"]
            health.student_id = student.id
            db.add(health)
            
            tech = mapped_data["technology"]
            tech.student_id = student.id
            db.add(tech)
            
            pred = mapped_data["prediction"]
            pred.student_id = student.id
            db.add(pred)
            
            db.commit()
            
            imported += 1
            imported_student_ids.add(student.student_id)
            
        except Exception as e:
            db.rollback()
            failed += 1
            error_msg = f"Database write error: {str(e)}"
            error_list.append(ImportErrorDetail(
                row_index=row_idx,
                student_id=row_data.get("Student_ID") or row_data.get("student_id"),
                errors=[error_msg]
            ))
            failed_row_record = dict(row_data)
            failed_row_record["_row_index"] = row_idx
            failed_row_record["_errors"] = error_msg
            failed_rows.append(failed_row_record)

    failed_json = json.dumps(failed_rows) if failed_rows else None

    return ImportSummaryReport(
        total_records=total_records,
        imported=imported,
        skipped=skipped,
        failed=failed,
        duplicates=duplicates,
        errors=error_list,
        failed_rows_json=failed_json
    )
