# Training script for Future Prediction Engine models
# ---------------------------------------------------
# This script expects CSV files in the project "data/" directory:
#   - yields.csv      : columns [region, year, crop, yield]
#   - prices.csv      : columns [date, price] (time series for Prophet)
#   - water.csv       : columns [region, date, moisture]
#   - disease.csv     : columns [region, year, crop, disease_label]
#
# The script trains four models:
#   1. RandomForestRegressor – predicts crop yield (numeric).
#   2. Prophet               – forecasts price over time.
#   3. Prophet               – forecasts water stress over time.
#   4. RandomForestClassifier – predicts disease risk (binary/multi‑class).
#
# Trained models are saved as ``*.joblib`` files under
#   ``backend/models/prediction/`` and will be automatically loaded by
#   ``backend/prediction/engine.py``.
#
# NOTE: This is a starter script. Replace the dummy data generation with
# your real datasets before running in production.

import os
import joblib
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, accuracy_score
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from prophet import Prophet

MODEL_DIR = Path(__file__).parent / "models" / "prediction"
DATA_DIR = Path(__file__).parent.parent / "data"

def ensure_dirs() -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    if not DATA_DIR.exists():
        raise FileNotFoundError(f"Data directory not found: {DATA_DIR}")

def train_yield_model() -> None:
    yields_path = DATA_DIR / "yields.csv"
    if not yields_path.is_file():
        raise FileNotFoundError("yields.csv not found in data directory")
    df = pd.read_csv(yields_path)
    X = pd.get_dummies(df[["region", "year", "crop"]])
    y = df["yield"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=200, max_depth=10, random_state=42)
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    print(f"Yield model MAE: {mae:.3f}")
    joblib.dump(model, MODEL_DIR / "yield_random_forest.joblib")

def train_price_model() -> None:
    prices_path = DATA_DIR / "prices.csv"
    if not prices_path.is_file():
        raise FileNotFoundError("prices.csv not found in data directory")
    df = pd.read_csv(prices_path)
    df.rename(columns={"date": "ds", "price": "y"}, inplace=True)
    model = Prophet(yearly_seasonality=True, daily_seasonality=False)
    model.fit(df)
    joblib.dump(model, MODEL_DIR / "price_prophet.joblib")
    print("Price Prophet model trained and saved.")

def train_water_model() -> None:
    water_path = DATA_DIR / "water.csv"
    if not water_path.is_file():
        raise FileNotFoundError("water.csv not found in data directory")
    df = pd.read_csv(water_path)
    df.rename(columns={"date": "ds", "moisture": "y"}, inplace=True)
    model = Prophet(yearly_seasonality=True, daily_seasonality=False)
    model.fit(df)
    joblib.dump(model, MODEL_DIR / "water_prophet.joblib")
    print("Water stress Prophet model trained and saved.")

def train_disease_model() -> None:
    disease_path = DATA_DIR / "disease.csv"
    if not disease_path.is_file():
        raise FileNotFoundError("disease.csv not found in data directory")
    df = pd.read_csv(disease_path)
    X = pd.get_dummies(df[["region", "year", "crop"]])
    y = df["disease_label"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"Disease classifier accuracy: {acc:.3%}")
    joblib.dump(model, MODEL_DIR / "disease_random_forest.joblib")

if __name__ == "__main__":
    ensure_dirs()
    train_yield_model()
    train_price_model()
    train_water_model()
    train_disease_model()
    print("All models trained and saved to", MODEL_DIR)
