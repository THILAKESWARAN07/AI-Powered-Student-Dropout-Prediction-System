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
from app.core.logging import logger


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
        logger.info(f"CSV newline count: {text_content.count(chr(10))}")
        logger.info(f"CSV length: {len(text_content)} characters")
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
            exists = db.query(Student).filter(Student.student_id == student_id).first()
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
        
    gender = model_fields.get("gender")
    if not gender:
        errors.append("Gender is required.")
    elif gender not in ["Male", "Female"]:
        errors.append(f"Gender ('{gender}') must be 'Male' or 'Female'.")
        
    age = get_int("age", "Age", required=True, min_val=4)
    
    medium = model_fields.get("medium_of_instruction")
    if not medium:
        errors.append("Medium of Instruction is required.")
    elif medium not in ["English", "Regional Language"]:
        errors.append(f"Medium of Instruction ('{medium}') must be 'English' or 'Regional Language'.")
        
    community = model_fields.get("community")
    if not community:
        errors.append("Community is required.")
    elif community not in ["General", "OBC", "SC", "ST", "EWS"]:
        errors.append(f"Community ('{community}') must be 'General', 'OBC', 'SC', 'ST', or 'EWS'.")
    
    # Optional travel columns
    distance = get_float("distance_to_school_km", "Distance to School", required=False, min_val=0, max_val=100)
    transport = model_fields.get("transport_mode") or "Walking"
    travel_time = get_float("travel_time_min", "Travel Time", required=False, min_val=0, max_val=300)
    school_type = model_fields.get("school_type") or "Government"
    ratio = model_fields.get("teacher_student_ratio") or "1:35"

    # Validate Academics
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
    backlogs = model_fields.get("academic_backlogs")
    if not backlogs:
        errors.append("Academic Backlogs is required.")
    elif backlogs not in ["Yes", "No"]:
        errors.append(f"Academic Backlogs ('{backlogs}') must be 'Yes' or 'No'.")

    # Validate Attendance
    att_pct = get_float("attendance_percentage", "Attendance Percentage")
    consec = get_int("consecutive_absences", "Consecutive Absences")
    leaves = get_int("leave_days", "Leave Days")
    late = get_int("late_arrivals", "Late Arrivals")

    # Validate Behaviour
    hw = get_float("homework_completion", "Homework Completion")
    assign = get_float("assignment_submission_rate", "Assignment Submission Rate")
    
    participate = model_fields.get("classroom_participation")
    if not participate:
        errors.append("Classroom Participation is required.")
    elif participate not in ["High", "Medium", "Low"]:
        errors.append(f"Classroom Participation ('{participate}') must be 'High', 'Medium', or 'Low'.")
        
    discipline = get_int("discipline_incidents", "Discipline Incidents")
    feedback = model_fields.get("teacher_feedback") or "Average"
    
    extracur = model_fields.get("participation_in_extracurricular")
    if not extracur:
        errors.append("Participation in Extracurricular is required.")
    elif extracur not in ["Yes", "No"]:
        errors.append(f"Participation in Extracurricular ('{extracur}') must be 'Yes' or 'No'.")
        
    lib = model_fields.get("library_usage")
    if not lib:
        errors.append("Library Usage is required.")
    elif lib not in ["High", "Medium", "Low"]:
        errors.append(f"Library Usage ('{lib}') must be 'High', 'Medium', or 'Low'.")
        
    motivation = model_fields.get("low_motivation")
    if not motivation:
        errors.append("Low Motivation is required.")
    elif motivation not in ["Yes", "No"]:
        errors.append(f"Low Motivation ('{motivation}') must be 'Yes' or 'No'.")
        
    bullying = model_fields.get("bullying_experience")
    if not bullying:
        errors.append("Bullying Experience is required.")
    elif bullying not in ["Yes", "No"]:
        errors.append(f"Bullying Experience ('{bullying}') must be 'Yes' or 'No'.")

    # Validate Family
    income = get_float("family_income", "Family Income", min_val=0, max_val=10000000)
    edu = model_fields.get("parents_education") or "Primary"
    job = model_fields.get("parents_occupation") or "Farmer"
    
    single = model_fields.get("single_parent")
    if not single:
        errors.append("Single Parent is required.")
    elif single not in ["Yes", "No"]:
        errors.append(f"Single Parent ('{single}') must be 'Yes' or 'No'.")
        
    siblings = get_int("number_of_siblings", "Number of Siblings")
    
    guard = model_fields.get("guardian_support")
    if not guard:
        errors.append("Guardian Support is required.")
    elif guard not in ["High", "Medium", "Low"]:
        errors.append(f"Guardian Support ('{guard}') must be 'High', 'Medium', or 'Low'.")
        
    hours = get_float("home_study_hours", "Home Study Hours", min_val=0, max_val=24)
    
    difficulty = model_fields.get("financial_difficulty")
    if not difficulty:
        errors.append("Financial Difficulty is required.")
    elif difficulty not in ["Yes", "No"]:
        errors.append(f"Financial Difficulty ('{difficulty}') must be 'Yes' or 'No'.")
        
    labour = model_fields.get("child_labour_risk")
    if not labour:
        errors.append("Child Labour Risk is required.")
    elif labour not in ["Yes", "No"]:
        errors.append(f"Child Labour Risk ('{labour}') must be 'Yes' or 'No'.")
        
    migration = model_fields.get("frequent_migration")
    if not migration:
        errors.append("Frequent Migration is required.")
    elif migration not in ["Yes", "No"]:
        errors.append(f"Frequent Migration ('{migration}') must be 'Yes' or 'No'.")
        
    issues = model_fields.get("family_issues")
    if not issues:
        errors.append("Family Issues is required.")
    elif issues not in ["Yes", "No"]:
        errors.append(f"Family Issues ('{issues}') must be 'Yes' or 'No'.")

    # Validate Health
    illness = model_fields.get("chronic_illness")
    if not illness:
        errors.append("Chronic Illness is required.")
    elif illness not in ["Yes", "No"]:
        errors.append(f"Chronic Illness ('{illness}') must be 'Yes' or 'No'.")
        
    nutrition = model_fields.get("nutrition_status")
    if not nutrition:
        errors.append("Nutrition Status is required.")
    elif nutrition not in ["Good", "Average", "Poor"]:
        errors.append(f"Nutrition Status ('{nutrition}') must be 'Good', 'Average', or 'Poor'.")
        
    vision = model_fields.get("vision_problems")
    if not vision:
        errors.append("Vision Problems is required.")
    elif vision not in ["Yes", "No"]:
        errors.append(f"Vision Problems ('{vision}') must be 'Yes' or 'No'.")
        
    mental = model_fields.get("mental_health_risk")
    if not mental:
        errors.append("Mental Health Risk is required.")
    elif mental not in ["Low", "Medium", "High"]:
        errors.append(f"Mental Health Risk ('{mental}') must be 'Low', 'Medium', or 'High'.")
        
    disability = model_fields.get("disability_status")
    if not disability:
        errors.append("Disability Status is required.")
    elif disability not in ["Yes", "No"]:
        errors.append(f"Disability Status ('{disability}') must be 'Yes' or 'No'.")
        
    meal = model_fields.get("midday_meal_beneficiary")
    if not meal:
        errors.append("Midday Meal Beneficiary is required.")
    elif meal not in ["Yes", "No"]:
        errors.append(f"Midday Meal Beneficiary ('{meal}') must be 'Yes' or 'No'.")

    # Validate Tech
    internet = model_fields.get("internet_access")
    if not internet:
        errors.append("Internet Access is required.")
    elif internet not in ["Yes", "No"]:
        errors.append(f"Internet Access ('{internet}') must be 'Yes' or 'No'.")
        
    phone = model_fields.get("smartphone_access")
    if not phone:
        errors.append("Smartphone Access is required.")
    elif phone not in ["Yes", "No"]:
        errors.append(f"Smartphone Access ('{phone}') must be 'Yes' or 'No'.")
        
    comp = model_fields.get("computer_access")
    if not comp:
        errors.append("Computer Access is required.")
    elif comp not in ["Yes", "No"]:
        errors.append(f"Computer Access ('{comp}') must be 'Yes' or 'No'.")
        
    elec = model_fields.get("electricity_availability")
    if not elec:
        errors.append("Electricity Availability is required.")
    elif elec not in ["Yes", "No"]:
        errors.append(f"Electricity Availability ('{elec}') must be 'Yes' or 'No'.")

    # Predictions
    risk = model_fields.get("dropout_risk")
    if not risk:
        errors.append("Dropout Risk is required.")
    elif risk not in ["Low", "Medium", "High"]:
        errors.append(f"Dropout Risk ('{risk}') must be 'Low', 'Medium', or 'High'.")
        
    status = model_fields.get("dropout_status")
    if not status:
        errors.append("Dropout Status is required.")
    elif status not in ["Yes", "No"]:
        errors.append(f"Dropout Status ('{status}') must be 'Yes' or 'No'.")

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

    logger.info("=" * 60)
    logger.info(f"TOTAL ROWS PARSED: {len(rows_raw)}")

    if rows_raw:
        logger.info(f"FIRST STUDENT: {rows_raw[0].get('Student_ID')}")
        logger.info(f"LAST STUDENT : {rows_raw[-1].get('Student_ID')}")

    logger.info("=" * 60)

    # 1.1 Automatic column detection if mapping is empty
    expected_db_cols = [
        'student_id', 'full_name', 'gender', 'age', 'class_name', 'section', 'medium_of_instruction', 'community',
        'distance_to_school_km', 'transport_mode', 'travel_time_min', 'school_type', 'teacher_student_ratio',
        'previous_year_percentage', 'unit_test_average', 'quarterly_exam', 'half_yearly_exam', 'annual_exam',
        'mathematics_marks', 'science_marks', 'english_marks', 'social_science_marks', 'regional_language_marks',
        'overall_percentage', 'number_of_failed_subjects', 'academic_backlogs',
        'attendance_percentage', 'consecutive_absences', 'leave_days', 'late_arrivals',
        'homework_completion', 'assignment_submission_rate', 'classroom_participation', 'discipline_incidents',
        'teacher_feedback', 'participation_in_extracurricular', 'library_usage', 'low_motivation', 'bullying_experience',
        'family_income', 'parents_education', 'parents_occupation', 'single_parent', 'number_of_siblings',
        'guardian_support', 'home_study_hours', 'financial_difficulty', 'child_labour_risk', 'frequent_migration',
        'family_issues',
        'chronic_illness', 'nutrition_status', 'vision_problems', 'mental_health_risk', 'disability_status',
        'midday_meal_beneficiary',
        'internet_access', 'smartphone_access', 'computer_access', 'electricity_availability',
        'dropout_risk', 'dropout_status'
    ]

    def normalize_name(name: str) -> str:
        return name.lower().replace(" ", "").replace("_", "").replace("-", "")

    if not mapping:
        mapping = {}

    mapped_values = set(mapping.values())
    for header in headers:
        if header in mapping:
            continue
        norm_header = normalize_name(header)
        for col in expected_db_cols:
            if col in mapped_values:
                continue
            norm_col = normalize_name(col)
            if norm_col == "classname" and norm_header == "class":
                mapping[header] = col
                mapped_values.add(col)
                break
            elif norm_col == "overallpercentage" and norm_header == "overallpercentage":
                mapping[header] = col
                mapped_values.add(col)
                break
            elif norm_col == norm_header:
                mapping[header] = col
                mapped_values.add(col)
                break

    # 1.2 Column Validation (reject invalid datasets gracefully)
    REQUIRED_FIELDS = {
        "student_id": "Student ID",
        "gender": "Gender",
        "age": "Age",
        "class_name": "Class",
        "section": "Section",
        "previous_year_percentage": "Previous Year Percentage",
        "unit_test_average": "Unit Test Average",
        "overall_percentage": "Overall Percentage",
        "number_of_failed_subjects": "Number of Failed Subjects",
        "attendance_percentage": "Attendance Percentage",
        "homework_completion": "Homework Completion",
        "assignment_submission_rate": "Assignment Submission Rate",
        "family_income": "Family Income",
        "home_study_hours": "Home Study Hours"
    }

    mapped_db_cols = set(mapping.values())
    missing_required = [label for field, label in REQUIRED_FIELDS.items() if field not in mapped_db_cols]
    if missing_required:
        raise ValueError(f"Missing required columns in mapping: {', '.join(missing_required)}")

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
