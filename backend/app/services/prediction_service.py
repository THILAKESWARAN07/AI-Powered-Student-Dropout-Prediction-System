import pandas as pd
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.core.logging import logger
from app.models.student import Student, StudentPrediction
from app.services import model_loader, feature_engineering, explainable_ai, recommendation_engine

def predict_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Performs raw pipeline classification and probability extraction on a pre-formatted DataFrame.
    """
    model = model_loader.get_model()
    label_encoder = model_loader.get_label_encoder()

    if not model or not label_encoder:
        raise ValueError("ML model or label encoder is not loaded in memory.")

    # 1. Execute classification probabilities
    proba = model.predict_proba(df)[0]  # Shape (3,)
    classes = list(label_encoder.classes_)
    probabilities_dict = {cls: float(prob) for cls, prob in zip(classes, proba)}

    # 2. Execute target class prediction
    pred = model.predict(df)[0]
    try:
        if not isinstance(pred, str):
            pred_label = label_encoder.inverse_transform([int(pred)])[0]
        else:
            pred_label = pred
    except Exception:
        pred_label = str(pred)

    # 3. Calculate model confidence and risk level
    confidence = max(probabilities_dict.values())
    
    # Risk classification mapping
    risk_mapping = {
        "No": "Low",
        "At_Risk": "Medium",
        "Yes": "High"
    }
    risk_level = risk_mapping.get(pred_label, "Low")

    # Set overall dropout probability as the probability of the 'Yes' class
    prob_yes = probabilities_dict.get("Yes", 0.0)

    return {
        "prediction": pred_label,  # "No" / "At_Risk" / "Yes"
        "probability": round(prob_yes, 4),
        "confidence": round(confidence, 4),
        "risk_level": risk_level,
        "probabilities": {k: round(v, 4) for k, v in probabilities_dict.items()},
        "predicted_at": datetime.now(timezone.utc).isoformat()
    }


def predict_student(db: Session, student_id: Any) -> Dict[str, Any]:
    """
    Executes end-to-end prediction for a single student, calculates explanations,
    recommendations, and saves the history log.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        student = db.query(Student).filter(Student.student_id == str(student_id)).first()
    if not student:
        raise ValueError(f"Student with identifier {student_id} was not found.")

    try:
        # Run feature engineering
        df = feature_engineering.prepare_student_features(student)
        
        # Run prediction
        pred_res = predict_dataframe(df)

        # Generate explainability and recommendations
        explanations = explainable_ai.explain_prediction(df)
        student_data = df.iloc[0].to_dict()
        recommendations = recommendation_engine.generate_recommendations(pred_res["risk_level"], student_data)

        # Assemble response
        result = {
            "student_db_id": student.id,
            "student_id": student.student_id,
            "full_name": student.full_name,
            "prediction": pred_res["prediction"],
            "probability": pred_res["probability"],
            "confidence": pred_res["confidence"],
            "risk_level": pred_res["risk_level"],
            "probabilities": pred_res["probabilities"],
            "predicted_at": pred_res["predicted_at"],
            "top_features": explanations,
            "recommended_actions": recommendations
        }

        # Save to database prediction history
        db_prediction = StudentPrediction(
            student_id=student.id,
            dropout_risk=result["risk_level"],
            dropout_status=result["prediction"],
            probability=result["probability"],
            confidence=result["confidence"],
            top_features={"features": explanations},
            recommended_actions=recommendations,
            model_version="2.0.0",
            predicted_at=datetime.now(timezone.utc)
        )
        db.add(db_prediction)
        db.commit()
        db.refresh(db_prediction)

        result["prediction_id"] = db_prediction.id
        return result
    except Exception as e:
        import traceback
        logger.error(f"Prediction failed for student {student_id}: {traceback.format_exc()}")
        raise e


def predict_batch(db: Session, student_ids: List[Any]) -> List[Dict[str, Any]]:
    """
    Executes prediction and logs history for a batch of student records.
    """
    results = []
    for sid in student_ids:
        try:
            res = predict_student(db, sid)
            results.append(res)
        except Exception as e:
            # Skip failed record predictions to prevent blocking the rest of the batch
            continue
    return results

