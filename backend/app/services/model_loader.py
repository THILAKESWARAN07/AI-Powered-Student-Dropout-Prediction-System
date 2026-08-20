import os
import json
import joblib
from app.core.logging import logger

class ModelLoader:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(ModelLoader, cls).__new__(cls, *args, **kwargs)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        self.model = None
        self.label_encoder = None
        self.feature_columns = []
        self.metrics = {}
        self._initialized = True
        self.load_all_artifacts()

    def load_all_artifacts(self):
        # Determine path relative to app folder
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        ml_dir = os.path.join(base_dir, "ml")

        model_path = os.path.join(ml_dir, "dropguard_model.pkl")
        encoder_path = os.path.join(ml_dir, "label_encoder.pkl")
        features_path = os.path.join(ml_dir, "feature_names.pkl")
        metrics_path = os.path.join(ml_dir, "metrics.json")

        logger.info(f"Loading ML model artifacts from: {ml_dir}")

        # Load Feature Columns (Authoritative feature names list from pickle)
        if os.path.exists(features_path):
            try:
                self.feature_columns = joblib.load(features_path)
                logger.info(f"Successfully loaded feature columns ({len(self.feature_columns)} features).")
            except Exception as e:
                logger.error(f"Failed to load feature_names.pkl: {e}")
                self.feature_columns = []
        else:
            logger.error(f"feature_names.pkl missing at {features_path}")

        # Load Metrics
        if os.path.exists(metrics_path):
            try:
                with open(metrics_path, "r") as f:
                    self.metrics = json.load(f)
                logger.info("Successfully loaded model metrics.")
            except Exception as e:
                logger.error(f"Failed to load metrics.json: {e}")
        else:
            logger.error(f"metrics.json missing at {metrics_path}")

        # Load Label Encoder
        if os.path.exists(encoder_path):
            try:
                self.label_encoder = joblib.load(encoder_path)
                logger.info("Successfully loaded label encoder.")
            except Exception as e:
                logger.error(f"Failed to load label_encoder.pkl: {e}")
        else:
            logger.error(f"label_encoder.pkl missing at {encoder_path}")

        # Load Tuned Logistic Regression Model Pipeline
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                logger.info("Successfully loaded Tuned Logistic Regression dropout model pipeline.")
            except Exception as e:
                logger.error(f"Failed to load dropguard_model.pkl: {e}")
        else:
            logger.error(f"dropguard_model.pkl missing at {model_path}")

        # Validate loaded artifacts
        errors = []
        if self.model is None:
            errors.append("dropguard_model.pkl missing or could not be loaded")
        if self.label_encoder is None:
            errors.append("label_encoder.pkl missing or could not be loaded")
        if not self.feature_columns:
            errors.append("feature_names.pkl missing or could not be loaded")

        if self.feature_columns and len(self.feature_columns) != 24:
            errors.append(f"feature_names must have length 24, got {len(self.feature_columns)}")

        if self.label_encoder is not None:
            try:
                classes = list(self.label_encoder.classes_)
                required = {"At_Risk", "No", "Yes"}
                if not required.issubset(set(classes)):
                    errors.append(f"label_encoder classes must contain At_Risk, No, Yes. Got {classes}")
            except Exception as e:
                errors.append(f"Failed to read classes from label_encoder: {str(e)}")

        if errors:
            logger.error(f"Model initialization validation errors: {', '.join(errors)}")

# Initialize the singleton instance
_loader = ModelLoader()

def get_model():
    return _loader.model

def get_label_encoder():
    return _loader.label_encoder

def get_feature_columns():
    return _loader.feature_columns

def get_model_metrics():
    return _loader.metrics

