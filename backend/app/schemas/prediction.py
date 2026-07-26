from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class FeatureExplanation(BaseModel):
    name: str = Field(..., description="Raw column name")
    label: str = Field(..., description="Human-readable feature name")
    value: str = Field(..., description="Actual feature value for the student")
    importance: float = Field(..., description="Calculated feature contribution score")
    reason: str = Field(..., description="Natural language explanation of the impact")

class PredictionResponse(BaseModel):
    prediction_id: Optional[int] = None
    student_db_id: int
    student_id: str
    full_name: str
    prediction: str
    probability: float
    confidence: float
    risk_level: str
    predicted_at: str
    top_features: List[FeatureExplanation]
    recommended_actions: List[str]

    class Config:
        from_attributes = True

class BatchPredictionRequest(BaseModel):
    student_ids: List[int] = Field(..., description="List of internal student database IDs")

class BatchPredictionResponse(BaseModel):
    results: List[PredictionResponse]

class ModelInfoResponse(BaseModel):
    model_name: str
    algorithm: str
    features_count: int
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float

class HistoryPredictionItem(BaseModel):
    id: int
    student_id: int
    dropout_risk: str
    dropout_status: str
    probability: Optional[float] = None
    confidence: Optional[float] = None
    top_features: Optional[Dict[str, Any]] = None
    recommended_actions: Optional[List[str]] = None
    model_version: Optional[str] = None
    predicted_at: datetime

    class Config:
        from_attributes = True
