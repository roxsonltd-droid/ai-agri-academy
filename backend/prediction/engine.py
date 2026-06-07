import os
import joblib
from pathlib import Path
from typing import Any, Dict
import numpy as np

class PredictionEngine:
    """Loads and serves ML models for crop disease, yield, price and water stress predictions.
    Models are stored under ``backend/models/prediction/`` as ``*.joblib`` files.
    """

    def __init__(self):
        self.models: Dict[str, Any] = {}
        self._load_models()

    def _load_models(self) -> None:
        models_path = Path(__file__).parent / "prediction"
        if not models_path.exists():
            raise FileNotFoundError(f"Prediction models directory not found: {models_path}")
        for file in models_path.glob("*.joblib"):
            model_name = file.stem
            self.models[model_name] = joblib.load(file)
        # Simple sanity check
        if not self.models:
            raise RuntimeError("No prediction models were loaded.")

    def predict(self, model_name: str, features: np.ndarray) -> Any:
        if model_name not in self.models:
            raise ValueError(f"Model '{model_name}' not found.")
        model = self.models[model_name]
        return model.predict(features.reshape(1, -1))[0]

    def predict_proba(self, model_name: str, features: np.ndarray) -> Any:
        if model_name not in self.models:
            raise ValueError(f"Model '{model_name}' not found.")
        model = self.models[model_name]
        if hasattr(model, "predict_proba"):
            return model.predict_proba(features.reshape(1, -1))[0]
        raise AttributeError(f"Model '{model_name}' does not support probability predictions.")
