import pandas as pd
from typing import List, Dict, Any
from app.services import model_loader

def explain_prediction(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Computes explainable feature importance for a single prediction row
    by mapping CatBoost classifier importances back to the raw feature columns.
    """
    model = model_loader.get_model()
    if not model:
        raise ValueError("Model pipeline is not loaded.")
        
    classifier = model.named_steps['classifier']
    preprocessor = model.named_steps['preprocessor']

    feature_names = preprocessor.get_feature_names_out()
    importances = classifier.feature_importances_

    categorical_features = [
        "Gender", "Section", "Medium_of_Instruction", "Community", "Classroom_Participation", 
        "Teacher_Feedback", "Parents_Education", "Parents_Occupation", "Single_Parent", "Guardian_Support",
        "Transport_Mode", "Chronic_Illness", "Nutrition_Status", "Vision_Problems", "Mental_Health_Risk",
        "Disability_Status", "Internet_Access", "Smartphone_Access", "Computer_Access", 
        "Electricity_Availability", "School_Type", "Teacher_Student_Ratio", "Midday_Meal_Beneficiary",
        "Participation_in_Extracurricular", "Library_Usage", "Financial_Difficulty", "Child_Labour_Risk",
        "Frequent_Migration", "Family_Issues", "Academic_Backlogs", "Low_Motivation", "Bullying_Experience"
    ]

    # Aggregate one-hot categories back to raw features
    raw_importances = {}
    for name, imp in zip(feature_names, importances):
        if name.startswith("num__"):
            raw_name = name[5:]
        elif name.startswith("cat__"):
            raw_name = None
            for cat_feat in categorical_features:
                if name.startswith(f"cat__{cat_feat}_"):
                    raw_name = cat_feat
                    break
            if not raw_name:
                raw_name = name[5:].split("_")[0]
        else:
            raw_name = name
            
        raw_importances[raw_name] = raw_importances.get(raw_name, 0.0) + float(imp)

    # Sort by descending importance and get top 5
    sorted_features = sorted(raw_importances.items(), key=lambda x: x[1], reverse=True)[:5]

    explanations = []
    row = df.iloc[0]

    for feat_name, score in sorted_features:
        val = row.get(feat_name)
        feat_label = feat_name.replace("_", " ")
        
        # Build premium reasons
        reason = f"Feature '{feat_label}' with value '{val}' had a significant impact of {round(score, 1)}% on this prediction."
        
        if feat_name == "Attendance_Percentage":
            reason = f"Attendance rate of {val}% directly affects school engagement."
        elif feat_name == "Overall_Percentage":
            reason = f"Academic grade average of {val}% indicates student performance level."
        elif feat_name == "Academic_Backlogs":
            reason = f"Presence of academic backlogs ('{val}') highlights learning gaps."
        elif feat_name == "Financial_Difficulty":
            reason = f"Financial difficulty ('{val}') is a critical stress factor on persistence."
        elif feat_name == "Low_Motivation":
            reason = f"Low student motivation ('{val}') acts as a behavioral barrier."
        elif feat_name == "Number_of_Failed_Subjects":
            reason = f"Failing in {val} subjects flags immediate academic risk."
        elif feat_name == "Consecutive_Absences":
            reason = f"Consecutive absences of {val} days indicates a risk of drop-out."
        elif feat_name == "Homework_Completion":
            reason = f"Homework completion of {val}% reflects active study habits."
        elif feat_name == "Child_Labour_Risk":
            reason = f"Child labour risk status ('{val}') compromises school attendance."
        elif feat_name == "Family_Income":
            reason = f"Family income of ₹{val:,.0f} affects educational stability."

        explanations.append({
            "name": feat_name,
            "label": feat_label,
            "value": str(val),
            "importance": round(score, 2),
            "reason": reason
        })

    return explanations
