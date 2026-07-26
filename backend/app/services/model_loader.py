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

        model_path = os.path.join(ml_dir, "dropout_model.pkl")
        encoder_path = os.path.join(ml_dir, "label_encoder.pkl")
        features_path = os.path.join(ml_dir, "feature_columns.json")
        metrics_path = os.path.join(ml_dir, "metrics.json")

        logger.info(f"Loading ML model artifacts from: {ml_dir}")

        # Load Feature Columns
        if os.path.exists(features_path):
            try:
                with open(features_path, "r") as f:
                    self.feature_columns = json.load(f)
                logger.info(f"Successfully loaded feature columns ({len(self.feature_columns)} features).")
            except Exception as e:
                logger.error(f"Failed to load feature_columns.json: {e}")
        else:
            logger.error(f"feature_columns.json missing at {features_path}")

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

        # Load CatBoost Model
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                logger.info("Successfully loaded CatBoost dropout model pipeline.")
            except Exception as e:
                logger.error(f"Failed to load dropout_model.pkl: {e}")
        else:
            logger.error(f"dropout_model.pkl missing at {model_path}")

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
