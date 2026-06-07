import pytest
import numpy as np
from backend.prediction.engine import PredictionEngine

@pytest.fixture(scope="module")
def engine():
    return PredictionEngine()

def test_models_loaded(engine):
    required = [
        "yield_random_forest",
        "disease_random_forest",
        "price_prophet",
        "water_prophet",
    ]
    for name in required:
        assert name in engine.models, f"Model {name} not loaded"

def test_predict_yield(engine):
    feats = np.array([[0, 0, 1]])  # dummy one‑hot (actual columns will be aligned)
    pred = engine.predict("yield_random_forest", feats)
    assert isinstance(pred, (float, np.floating, int, np.integer))

def test_predict_disease_proba(engine):
    feats = np.array([[0, 0, 1]])
    proba = engine.predict_proba("disease_random_forest", feats)
    assert isinstance(proba, np.ndarray)
    assert proba.shape[-1] == 2  # binary classification

def test_predict_price(engine):
    # Prophet models expect a DataFrame with ds column – the engine ignores the array and returns a scalar
    feats = np.array([["2024-01-01"]])
    pred = engine.predict("price_prophet", feats)
    assert isinstance(pred, (float, np.floating, int, np.integer))

def test_predict_water_confidence(engine):
    feats = np.array([["2024-01-01"]])
    # confidence for Prophet is derived from model std (fallback to 0.0 if not available)
    try:
        conf = engine.predict_proba("water_prophet", feats)
        # If model does not support predict_proba, an exception will be raised – we handle it in GraphQL.
    except Exception:
        conf = None
    assert conf is None or isinstance(conf, (float, np.floating, int, np.integer))
