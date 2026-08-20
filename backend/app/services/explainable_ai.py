import pandas as pd
from typing import List, Dict, Any
from app.services import model_loader

def explain_prediction(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Computes explainable feature importance for a single prediction row
    by mapping Logistic Regression classifier coefficients back to the raw feature columns.
    """
    model = model_loader.get_model()
    label_encoder = model_loader.get_label_encoder()
    if not model or not label_encoder:
        raise ValueError("Model pipeline or label encoder is not loaded.")
        
    classifier = model.named_steps['classifier']
    preprocessor = model.named_steps['preprocessor']

    feature_names = preprocessor.get_feature_names_out()

    # Determine predicted class for this specific dataframe row
    pred = model.predict(df)[0]
    try:
        if not isinstance(pred, str):
            pred_label = label_encoder.inverse_transform([int(pred)])[0]
        else:
            pred_label = pred
    except Exception:
        pred_label = str(pred)

    # Get class index in label encoder classes
    classes = list(label_encoder.classes_)
    try:
        class_idx = classes.index(pred_label)
    except ValueError:
        class_idx = 0

    # Get coefficients for predicted class (shape: n_features,)
    if classifier.coef_.ndim > 1:
        coefs = classifier.coef_[class_idx]
    else:
        coefs = classifier.coef_

    # Feature importance is the absolute value of the coefficient
    importances = [abs(c) for c in coefs]

    categorical_features = [
        "Gender", "Attendance_Classification", "Mother_Education", "Father_Education",
        "Family_Support", "School_Support", "Internet_Access", "Health_Status",
        "Family_Income", "Financial_Difficulty", "Homework_Completion", "Low_Motivation",
        "Mental_Health_Risk", "Child_Labour_Risk", "Computer_Access", "Smartphone_Access",
        "Electricity_Availability"
    ]

    # Aggregate one-hot categories back to raw features
    raw_importances = {}
    for name, imp in zip(feature_names, importances):
        if name.startswith("num__"):
            raw_name = name[5:]
        elif name.startswith("cat__"):
            raw_name = None
            s = name[5:]
            for cat_feat in categorical_features:
                if s.startswith(cat_feat + "_"):
                    raw_name = cat_feat
                    break
            if not raw_name:
                raw_name = s.split("_")[0]
        else:
            raw_name = name
            
        raw_importances[raw_name] = raw_importances.get(raw_name, 0.0) + float(imp)

    # Convert to relative percentage importances
    total_imp = sum(raw_importances.values())
    if total_imp > 0:
        for k in raw_importances:
            raw_importances[k] = (raw_importances[k] / total_imp) * 100.0

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
        elif feat_name == "Academic_Backlogs" or feat_name == "Number_of_Failures":
            reason = f"Failures or backlogs flag immediate academic risk."
        elif feat_name == "Financial_Difficulty":
            reason = f"Financial difficulty ('{val}') is a critical stress factor on persistence."
        elif feat_name == "Low_Motivation":
            reason = f"Low student motivation ('{val}') acts as a behavioral barrier."
        elif feat_name == "Homework_Completion":
            reason = f"Homework completion rate reflects study habits and engagement."
        elif feat_name == "Child_Labour_Risk":
            reason = f"Child labour risk status ('{val}') compromises school attendance."
        elif feat_name == "Family_Income":
            reason = f"Family income status of '{val}' affects educational stability."

        explanations.append({
            "name": feat_name,
            "label": feat_label,
            "value": str(val),
            "importance": round(score, 2),
            "reason": reason
        })

    return explanations
