import pandas as pd
from typing import List, Dict, Any, Tuple
from app.models.student import Student
from app.services import model_loader

def prepare_student_features(student: Student) -> pd.DataFrame:
    """
    Extracts, validates, and engineers features from a Student ORM object
    and its nested relationships into a single-row Pandas DataFrame.
    """
    feature_cols = model_loader.get_feature_columns()
    if not feature_cols:
        raise ValueError("Feature columns list is not loaded from feature_columns.json.")

    academics = student.academics
    attendance = student.attendance
    behaviour = student.behaviour
    family = student.family
    health = student.health
    technology = student.technology

    # 1. Validate required relations exist
    errors = []
    if not academics:
        errors.append("Student lacks academic record relations.")
    if not attendance:
        errors.append("Student lacks attendance record relations.")
    if not behaviour:
        errors.append("Student lacks behaviour record relations.")
    if not family:
        errors.append("Student lacks family record relations.")
    if not health:
        errors.append("Student lacks health record relations.")
    if not technology:
        errors.append("Student lacks technology record relations.")
    
    if errors:
        raise ValueError(f"Feature engineering validation errors: {'; '.join(errors)}")

    # 2. Extract feature mapping
    raw_data = {
        "Gender": student.gender,
        "Age": student.age,
        "Class": int(student.class_name) if student.class_name and student.class_name.isdigit() else student.class_name,
        "Section": student.section,
        "Medium_of_Instruction": student.medium_of_instruction,
        "Community": student.community,
        "Previous_Year_Percentage": academics.previous_year_percentage,
        "Unit_Test_Average": academics.unit_test_average,
        "Quarterly_Exam": academics.quarterly_exam,
        "Half_Yearly_Exam": academics.half_yearly_exam,
        "Annual_Exam": academics.annual_exam,
        "Mathematics_Marks": academics.mathematics_marks,
        "Science_Marks": academics.science_marks,
        "English_Marks": academics.english_marks,
        "Social_Science_Marks": academics.social_science_marks,
        "Regional_Language_Marks": academics.regional_language_marks,
        "Overall_Percentage": academics.overall_percentage,
        "Number_of_Failed_Subjects": academics.number_of_failed_subjects,
        "Attendance_Percentage": attendance.attendance_percentage,
        "Consecutive_Absences": attendance.consecutive_absences,
        "Leave_Days": attendance.leave_days,
        "Late_Arrivals": attendance.late_arrivals,
        "Homework_Completion": behaviour.homework_completion,
        "Assignment_Submission_Rate": behaviour.assignment_submission_rate,
        "Classroom_Participation": behaviour.classroom_participation,
        "Discipline_Incidents": behaviour.discipline_incidents,
        "Teacher_Feedback": behaviour.teacher_feedback,
        "Family_Income": family.family_income,
        "Parents_Education": family.parents_education,
        "Parents_Occupation": family.parents_occupation,
        "Single_Parent": family.single_parent,
        "Number_of_Siblings": family.number_of_siblings,
        "Guardian_Support": family.guardian_support,
        "Home_Study_Hours": family.home_study_hours,
        "Distance_to_School_km": student.distance_to_school_km,
        "Transport_Mode": student.transport_mode,
        "Travel_Time_min": student.travel_time_min,
        "Chronic_Illness": health.chronic_illness,
        "Nutrition_Status": health.nutrition_status,
        "Vision_Problems": health.vision_problems,
        "Mental_Health_Risk": health.mental_health_risk,
        "Disability_Status": health.disability_status,
        "Internet_Access": technology.internet_access,
        "Smartphone_Access": technology.smartphone_access,
        "Computer_Access": technology.computer_access,
        "Electricity_Availability": technology.electricity_availability,
        "School_Type": student.school_type,
        "Teacher_Student_Ratio": student.teacher_student_ratio,
        "Midday_Meal_Beneficiary": health.midday_meal_beneficiary,
        "Participation_in_Extracurricular": behaviour.participation_in_extracurricular,
        "Library_Usage": behaviour.library_usage,
        "Financial_Difficulty": family.financial_difficulty,
        "Child_Labour_Risk": family.child_labour_risk,
        "Frequent_Migration": family.frequent_migration,
        "Family_Issues": family.family_issues,
        "Academic_Backlogs": academics.academic_backlogs,
        "Low_Motivation": behaviour.low_motivation,
        "Bullying_Experience": behaviour.bullying_experience
    }

    # 3. Perform detailed field validation
    missing_cols = []
    invalid_types = []

    for col in feature_cols:
        val = raw_data.get(col)
        if val is None:
            missing_cols.append(col)
            continue
        
        # Verify types and convert where needed
        # Categorical strings
        if col in ["Gender", "Section", "Medium_of_Instruction", "Community", "Classroom_Participation", 
                   "Teacher_Feedback", "Parents_Education", "Parents_Occupation", "Single_Parent", "Guardian_Support",
                   "Transport_Mode", "Chronic_Illness", "Nutrition_Status", "Vision_Problems", "Mental_Health_Risk",
                   "Disability_Status", "Internet_Access", "Smartphone_Access", "Computer_Access", 
                   "Electricity_Availability", "School_Type", "Teacher_Student_Ratio", "Midday_Meal_Beneficiary",
                   "Participation_in_Extracurricular", "Library_Usage", "Financial_Difficulty", "Child_Labour_Risk",
                   "Frequent_Migration", "Family_Issues", "Academic_Backlogs", "Low_Motivation", "Bullying_Experience"]:
            if not isinstance(val, str):
                raw_data[col] = str(val)
        
        # Numerical integers
        elif col in ["Age", "Class", "Number_of_Failed_Subjects", "Consecutive_Absences", "Leave_Days", 
                     "Late_Arrivals", "Discipline_Incidents", "Number_of_Siblings"]:
            try:
                raw_data[col] = int(val)
            except (ValueError, TypeError):
                invalid_types.append(f"{col} must be an integer, got {type(val)}")

        # Numerical floats
        elif col in ["Previous_Year_Percentage", "Unit_Test_Average", "Quarterly_Exam", "Half_Yearly_Exam", 
                     "Annual_Exam", "Mathematics_Marks", "Science_Marks", "English_Marks", "Social_Science_Marks",
                     "Regional_Language_Marks", "Overall_Percentage", "Homework_Completion", 
                     "Assignment_Submission_Rate", "Family_Income", "Home_Study_Hours", "Distance_to_School_km",
                     "Travel_Time_min"]:
            try:
                raw_data[col] = float(val)
            except (ValueError, TypeError):
                invalid_types.append(f"{col} must be a float, got {type(val)}")

    validation_errors = []
    if missing_cols:
        validation_errors.append(f"Missing values for columns: {', '.join(missing_cols)}")
    if invalid_types:
        validation_errors.append(f"Invalid datatypes: {'; '.join(invalid_types)}")

    if validation_errors:
        raise ValueError(f"Feature engineering validation failed: {'. '.join(validation_errors)}")

    # 4. Construct single row DataFrame in exact feature order
    df = pd.DataFrame([raw_data])
    df = df[feature_cols]

    return df


def prepare_student_batch_features(students: List[Student]) -> pd.DataFrame:
    """
    Transforms a batch list of Student ORM objects into a single multi-row Pandas DataFrame.
    """
    dfs = []
    for s in students:
        df_row = prepare_student_features(s)
        dfs.append(df_row)
    
    if not dfs:
        feature_cols = model_loader.get_feature_columns()
        return pd.DataFrame(columns=feature_cols)

    return pd.concat(dfs, ignore_index=True)
