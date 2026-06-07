import datetime
import numpy as np
import pandas as pd
import strawberry
from strawberry.fastapi import GraphQLRouter

from backend.prediction.engine import PredictionEngine

engine = PredictionEngine()


def _encode_features(model_name: str, **kwargs) -> np.ndarray:
    """Build a feature vector that matches the columns used when the model was trained.
    For the RandomForest models (yield & disease) the training used:
        pd.get_dummies(df[[ "region", "year", "crop" ]])
    For Prophet models we just pass the raw value – the engine will ignore the
    encoding and use the value directly (Prophet works on a DataFrame, not an array).
    """
    if model_name.startswith("yield") or model_name.startswith("disease"):
        df = pd.DataFrame([kwargs])
        X = pd.get_dummies(df[["region", "year", "crop"]])
        model = engine.models[model_name]
        expected_cols = getattr(model, "feature_names_in_", None)
        if expected_cols is not None:
            for col in expected_cols:
                if col not in X.columns:
                    X[col] = 0
            X = X[expected_cols]
        return X.to_numpy().astype(float).reshape(1, -1)
    # Prophet models – they expect a pandas DataFrame with ``ds`` and ``y``.
    # Here we just forward the raw value; the engine will ignore the array.
    return np.array([list(kwargs.values())], dtype=float)


def _predict_with_confidence(model_name: str, **kwargs):
    """Returns (prediction, confidence).  Confidence is:
      - For classifiers: the max probability from ``predict_proba``.
      - For regressors (RandomForest): standard deviation of predictions
        from individual trees.
    """
    feats = _encode_features(model_name, **kwargs)
    pred = engine.predict(model_name, feats)
    try:
        proba = engine.predict_proba(model_name, feats)
        if isinstance(proba, (list, np.ndarray)):
            confidence = float(np.max(proba))
        else:
            confidence = float(proba)
    except Exception:
        model = engine.models[model_name]
        if hasattr(model, "estimators_"):
            tree_preds = np.stack([est.predict(feats) for est in model.estimators_])
            confidence = float(np.std(tree_preds))
        else:
            confidence = 0.0
    return pred, confidence


@strawberry.type
class Prediction:
    model: str
    prediction: float
    confidence: float


@strawberry.type
class Query:
    @strawberry.field
    def predictYield(self, region: str, year: int, crop: str) -> Prediction:
        pred, conf = _predict_with_confidence(
            "yield_random_forest", region=region, year=year, crop=crop
        )
        return Prediction(model="yield_random_forest", prediction=pred, confidence=conf)

    @strawberry.field
    def predictDiseaseRisk(self, region: str, year: int, crop: str) -> Prediction:
        pred, conf = _predict_with_confidence(
            "disease_random_forest", region=region, year=year, crop=crop
        )
        return Prediction(model="disease_random_forest", prediction=pred, confidence=conf)

    @strawberry.field
    def predictPrice(self, date: datetime.date) -> Prediction:
        pred, conf = _predict_with_confidence("price_prophet", ds=str(date))
        return Prediction(model="price_prophet", prediction=pred, confidence=conf)

    @strawberry.field
    def predictWaterStress(self, region: str, date: datetime.date) -> Prediction:
        pred, conf = _predict_with_confidence(
            "water_prophet", region=region, ds=str(date)
        )
        return Prediction(model="water_prophet", prediction=pred, confidence=conf)


router = GraphQLRouter(schema=strawberry.Schema(query=Query))
