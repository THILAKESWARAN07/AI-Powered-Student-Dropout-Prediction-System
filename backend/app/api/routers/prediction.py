from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.models.student import Student, StudentPrediction
from app.schemas.prediction import (
    PredictionResponse, BatchPredictionRequest, BatchPredictionResponse,
    ModelInfoResponse, HistoryPredictionItem
)
from app.services import prediction_service, model_loader

router = APIRouter(prefix="/predictions", tags=["Predictions & Machine Learning"])

@router.post("/student/{student_id}", response_model=PredictionResponse)
def predict_student_risk(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Triggers the real CatBoost ML prediction pipeline for a single student.
    Analyzes academics, attendance, behavior, family metrics, and returns risk assessment,
    explainable AI reasons, and recommendation actions. Persists prediction history.
    """
    try:
        result = prediction_service.predict_student(db, student_id)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.post("/batch", response_model=BatchPredictionResponse)
def predict_batch_risk(
    payload: BatchPredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Triggers batch predictions for a list of student database IDs.
    Excludes failed records dynamically to ensure completion of the request.
    """
    try:
        results = prediction_service.predict_batch(db, payload.student_ids)
        return {"results": results}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch prediction execution failed: {str(e)}"
        )


@router.get("/history/{student_id}", response_model=List[HistoryPredictionItem])
def get_prediction_history(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the prediction history logs for a specific student, ordered by timestamp.
    """
    # Verify student exists first
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student record not found."
        )
        
    history = db.query(StudentPrediction).filter(
        StudentPrediction.student_id == student_id
    ).order_by(StudentPrediction.predicted_at.desc()).all()
    
    return history


@router.get("/stats")
def get_prediction_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns prediction stats breakdown (High, Medium, Low risk counts)
    based on the latest prediction for each student, and recent predictions log.
    """
    from sqlalchemy import func
    
    # Enforce school boundary
    if current_user.role in ["headmaster", "teacher"]:
        latest_pred_sub = db.query(
            StudentPrediction.student_id,
            func.max(StudentPrediction.id).label("latest_id")
        ).join(
            Student, Student.id == StudentPrediction.student_id
        ).filter(
            Student.school_id == current_user.school_id,
            Student.is_deleted == False
        ).group_by(StudentPrediction.student_id).subquery()
    else:
        latest_pred_sub = db.query(
            StudentPrediction.student_id,
            func.max(StudentPrediction.id).label("latest_id")
        ).join(
            Student, Student.id == StudentPrediction.student_id
        ).filter(
            Student.is_deleted == False
        ).group_by(StudentPrediction.student_id).subquery()

    total_predicted = db.query(latest_pred_sub).count()

    risk_counts = db.query(
        StudentPrediction.dropout_risk,
        func.count(StudentPrediction.id)
    ).join(
        latest_pred_sub, StudentPrediction.id == latest_pred_sub.c.latest_id
    ).group_by(StudentPrediction.dropout_risk).all()

    stats = {"High": 0, "Medium": 0, "Low": 0}
    for risk, count in risk_counts:
        if risk in stats:
            stats[risk] = count

    if current_user.role in ["headmaster", "teacher"]:
        recent_preds = db.query(StudentPrediction).join(
            Student, Student.id == StudentPrediction.student_id
        ).filter(
            Student.school_id == current_user.school_id,
            Student.is_deleted == False
        ).order_by(StudentPrediction.predicted_at.desc()).limit(5).all()
    else:
        recent_preds = db.query(StudentPrediction).join(
            Student, Student.id == StudentPrediction.student_id
        ).filter(
            Student.is_deleted == False
        ).order_by(StudentPrediction.predicted_at.desc()).limit(5).all()

    recent_list = []
    for p in recent_preds:
        recent_list.append({
            "id": p.id,
            "student_name": p.student.full_name,
            "student_id": p.student.student_id,
            "risk_level": p.dropout_risk,
            "probability": p.probability,
            "predicted_at": p.predicted_at.isoformat()
        })

    return {
        "total_predicted": total_predicted,
        "high_risk": stats["High"],
        "medium_risk": stats["Medium"],
        "low_risk": stats["Low"],
        "recent_predictions": recent_list
    }


@router.get("/model-info", response_model=ModelInfoResponse)
def get_model_information(
    current_user: User = Depends(get_current_user)
):
    """
    Returns performance metrics (accuracy, precision, recall, f1, roc-auc)
    and feature schema details of the active CatBoost classifier.
    """
    metrics = model_loader.get_model_metrics()
    features = model_loader.get_feature_columns()
    
    if not metrics or not features:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model metrics or features are currently unavailable."
        )
        
    return {
        "model_name": "CatBoost Dropout Prediction Pipeline",
        "algorithm": "CatBoost Classifier",
        "features_count": len(features),
        "accuracy": metrics.get("accuracy", 0.0),
        "precision": metrics.get("precision", 0.0),
        "recall": metrics.get("recall", 0.0),
        "f1_score": metrics.get("f1_score", 0.0),
        "roc_auc": metrics.get("roc_auc", 0.0)
    }
