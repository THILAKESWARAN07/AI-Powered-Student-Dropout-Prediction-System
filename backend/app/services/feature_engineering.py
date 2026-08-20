import pandas as pd
from typing import List, Dict, Any, Tuple
from app.models.student import Student
from app.services import model_loader

def prepare_student_features(student: Student) -> pd.DataFrame:
    """
    Extracts, validates, and engineers features from a Student ORM object
    and its nested relationships into a single-row Pandas DataFrame of 24 features.
    """
    feature_cols = model_loader.get_feature_columns()
    if not feature_cols:
        raise ValueError("Feature columns list is not loaded from feature_names.pkl.")

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

    # Helper mapping functions
    def map_gender(val):
        if not val:
            return 'M'
        val = str(val).lower()
        if val in ['female', 'f']:
            return 'F'
        return 'M'

    def map_attendance_classification(pct):
        if pct >= 95.0:
            return 'Excellent'
        elif pct >= 85.0:
            return 'Good'
        elif pct >= 70.0:
            return 'Moderate'
        return 'Poor'

    def map_education(val):
        if not val:
            return 'Primary'
        val = str(val).lower()
        if 'college' in val or 'graduate' in val or 'degree' in val or 'higher' in val or 'university' in val:
            return 'College'
        elif 'secondary' in val or 'high' in val:
            return 'High School'
        elif 'middle' in val or 'junior' in val:
            return 'Middle School'
        elif 'primary' in val:
            return 'Primary'
        elif 'illiterate' in val or 'no' in val or 'none' in val:
            return 'No Education'
        return 'Primary'

    def map_yes_no_lower(val):
        if not val:
            return 'no'
        val = str(val).lower()
        if val in ['yes', 'y', 'true', '1']:
            return 'yes'
        return 'no'

    def map_yes_no_title(val):
        if not val:
            return 'No'
        val = str(val).lower()
        if val in ['yes', 'y', 'true', '1']:
            return 'Yes'
        return 'No'

    def map_health_status(nutrition):
        if not nutrition:
            return 'Average'
        val = str(nutrition).title()
        if val in ['Good', 'Average', 'Poor', 'Excellent', 'Very Poor']:
            return val
        return 'Average'

    def map_family_income(income):
        try:
            val = float(income)
            if val < 30000.0:
                return 'Low'
            elif val < 100000.0:
                return 'Medium'
            else:
                return 'High'
        except (ValueError, TypeError):
            val_str = str(income).title()
            if val_str in ['Low', 'Medium', 'High']:
                return val_str
            return 'Medium'

    def map_homework_completion(hw):
        try:
            val = float(hw)
            if val >= 90.0:
                return 'Excellent'
            elif val >= 75.0:
                return 'Good'
            elif val >= 50.0:
                return 'Average'
            else:
                return 'Poor'
        except (ValueError, TypeError):
            val_str = str(hw).title()
            if val_str in ['Excellent', 'Good', 'Average', 'Poor']:
                return val_str
            return 'Average'

    def map_mental_health_risk(risk):
        if not risk:
            return 'No'
        val = str(risk).lower()
        if val in ['high', 'medium', 'yes', 'true', '1']:
            return 'Yes'
        return 'No'

    # Extract raw data using exact feature names of the 24 features
    att_pct = attendance.attendance_percentage
    raw_data = {
        "Gender": map_gender(student.gender),
        "Age": float(student.age),
        "Previous_Year_Percentage": float(academics.previous_year_percentage),
        "Current_Year_Percentage": float(academics.overall_percentage),
        "Overall_Percentage": (float(academics.previous_year_percentage) + float(academics.overall_percentage)) / 2.0,
        "Number_of_Failures": int(academics.number_of_failed_subjects),
        "Number_of_Absences": int(round(220.0 * (1.0 - att_pct / 100.0))),
        "Attendance_Percentage": float(att_pct),
        "Attendance_Classification": map_attendance_classification(att_pct),
        "Mother_Education": map_education(family.parents_education),
        "Father_Education": map_education(family.parents_education),
        "Family_Support": map_yes_no_lower(family.guardian_support),
        "School_Support": map_yes_no_lower(behaviour.teacher_feedback),
        "Internet_Access": map_yes_no_lower(technology.internet_access),
        "Health_Status": map_health_status(health.nutrition_status),
        "Family_Income": map_family_income(family.family_income),
        "Financial_Difficulty": map_yes_no_title(family.financial_difficulty),
        "Homework_Completion": map_homework_completion(behaviour.homework_completion),
        "Low_Motivation": map_yes_no_title(behaviour.low_motivation),
        "Mental_Health_Risk": map_mental_health_risk(health.mental_health_risk),
        "Child_Labour_Risk": map_yes_no_title(family.child_labour_risk),
        "Computer_Access": map_yes_no_title(technology.computer_access),
        "Smartphone_Access": map_yes_no_title(technology.smartphone_access),
        "Electricity_Availability": map_yes_no_title(technology.electricity_availability)
    }

    # Verify that all 24 required features exist and are correctly formatted
    missing_cols = []
    invalid_types = []

    for col in feature_cols:
        val = raw_data.get(col)
        if val is None:
            missing_cols.append(col)
            continue
        
        # Verify types and convert where needed
        if col in ["Age", "Previous_Year_Percentage", "Current_Year_Percentage", "Overall_Percentage", "Attendance_Percentage"]:
            try:
                raw_data[col] = float(val)
            except (ValueError, TypeError):
                invalid_types.append(f"{col} must be a float, got {type(val)}")
        elif col in ["Number_of_Failures", "Number_of_Absences"]:
            try:
                raw_data[col] = int(val)
            except (ValueError, TypeError):
                invalid_types.append(f"{col} must be an integer, got {type(val)}")
        else:
            raw_data[col] = str(val)

    validation_errors = []
    if missing_cols:
        validation_errors.append(f"Missing values for columns: {', '.join(missing_cols)}")
    if invalid_types:
        validation_errors.append(f"Invalid datatypes: {'; '.join(invalid_types)}")

    if validation_errors:
        raise ValueError(f"Feature engineering validation failed: {'. '.join(validation_errors)}")

    # Construct single row DataFrame in exact feature order
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

