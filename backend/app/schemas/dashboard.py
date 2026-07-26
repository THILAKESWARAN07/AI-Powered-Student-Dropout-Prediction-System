from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DashboardSummaryResponse(BaseModel):
    total_students: int
    total_predictions: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    avg_confidence: float
    model_accuracy: float
    roc_auc: float

class ChartDataPoint(BaseModel):
    name: str
    value: int

class RiskGroupedDataPoint(BaseModel):
    name: str
    High: int
    Medium: int
    Low: int

class TrendDataPoint(BaseModel):
    date: str
    High: int
    Medium: int
    Low: int

class DashboardChartsResponse(BaseModel):
    risk_distribution: List[ChartDataPoint]
    prediction_trend: List[TrendDataPoint]
    attendance_distribution: List[ChartDataPoint]
    academics_distribution: List[ChartDataPoint]
    gender_distribution: List[ChartDataPoint]
    community_distribution: List[ChartDataPoint]
    school_risk_comparison: List[RiskGroupedDataPoint]
    class_risk_comparison: List[RiskGroupedDataPoint]
    financial_difficulty_analysis: List[RiskGroupedDataPoint]
    child_labour_risk_analysis: List[RiskGroupedDataPoint]
    backlogs_analysis: List[RiskGroupedDataPoint]
    motivation_analysis: List[RiskGroupedDataPoint]

class RecentPredictionItem(BaseModel):
    id: int
    student_name: str
    student_id: str
    risk_level: str
    predicted_at: str
    probability: float
    confidence: float
    school_name: str

class FeatureImportanceItem(BaseModel):
    feature: str
    label: str
    importance: float

class ModelDetailsResponse(BaseModel):
    model_name: str
    algorithm: str
    features_count: int
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    training_dataset_size: int
    prediction_version: str
    feature_importance: List[FeatureImportanceItem]
