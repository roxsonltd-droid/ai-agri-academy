from faststream.rabbit import RabbitBroker
from faststream import Context, Depends
from core.events import broker
from backend.prediction.engine import PredictionEngine
import numpy as np

# Initialize the engine once (singleton-like)
_engine = PredictionEngine()

# FastStream router for prediction requests
prediction_router = broker

@prediction_router.subscriber("prediction.request")
async def handle_prediction(message: dict, context: Context = Depends()):
    """Handle on‑the‑fly prediction requests.
    Expected message format:
        {"model": "yield_random_forest", "features": [0.1, 0.2, ...]}
    The worker returns a ``prediction.created`` event with the result.
    """
    model_name = message.get("model")
    features = message.get("features", [])
    if not model_name or not features:
        # ignore malformed messages
        return
    arr = np.array(features)
    try:
        pred = _engine.predict(model_name, arr)
        result = {"model": model_name, "prediction": pred}
        # Try to add confidence if supported
        try:
            conf = _engine.predict_proba(model_name, arr)
            result["confidence"] = conf.tolist()
        except Exception:
            pass
        await broker.publish(result, "prediction.created")
    except Exception as e:
        # Log error – in a real system use proper logger
        print(f"Prediction worker error: {e}")
