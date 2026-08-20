from typing import List, Dict, Any

def generate_recommendations(risk_level: str, student_data: Dict[str, Any]) -> List[str]:
    """
    Generates personalized recommendations/interventions for a student based on 
    their dropout risk level and specific risk factor thresholds.
    """
    recommendations = []

    # 1. Base Recommendations by Risk Tier
    if risk_level == "High":
        recommendations.extend(["Parent Meeting", "Counselling", "Weekly Monitoring"])
    elif risk_level == "Medium":
        recommendations.extend(["Teacher Mentoring", "Parent Communication"])
    else:
        recommendations.extend(["Continue Monitoring", "Regular Follow-up"])

    # 2. Targeted Risk Triggers
    # Academic support triggers
    overall_percentage = student_data.get("Overall_Percentage", 100.0)
    failed_subjects = student_data.get("Number_of_Failures", student_data.get("Number_of_Failed_Subjects", 0))
    backlogs = student_data.get("Academic_Backlogs", "No")
    if overall_percentage < 60.0 or failed_subjects > 0 or backlogs == "Yes":
        recommendations.append("Extra Classes")

    # Financial barriers triggers
    financial_difficulty = student_data.get("Financial_Difficulty", "No")
    child_labour = student_data.get("Child_Labour_Risk", "No")
    if financial_difficulty == "Yes" or child_labour == "Yes":
        recommendations.append("Financial Assistance")

    # Attendance risk triggers
    attendance = student_data.get("Attendance_Percentage", 100.0)
    consec_absences = student_data.get("Consecutive_Absences", student_data.get("Number_of_Absences", 0))
    if attendance < 75.0 or consec_absences > 3:
        recommendations.append("Attendance Monitoring")
        if risk_level == "High":
            recommendations.append("Home Visit")

    # Behavioral & homework triggers
    homework_val = student_data.get("Homework_Completion", 100.0)
    is_hw_low = False
    if isinstance(homework_val, (int, float)):
        is_hw_low = homework_val < 60.0
    else:
        is_hw_low = str(homework_val).strip().title() in ['Poor', 'Average']
        
    low_motivation = student_data.get("Low_Motivation", "No")
    if is_hw_low or low_motivation == "Yes":
        recommendations.append("Homework Tracking")
        if "Counselling" not in recommendations:
            recommendations.append("Counselling")

    # Low risk performance reward
    if risk_level == "Low" and overall_percentage >= 80.0:
        recommendations.append("Positive Reinforcement")

    # Deduplicate while preserving order
    seen = set()
    deduped_recommendations = []
    for rec in recommendations:
        if rec not in seen:
            seen.add(rec)
            deduped_recommendations.append(rec)

    return deduped_recommendations
