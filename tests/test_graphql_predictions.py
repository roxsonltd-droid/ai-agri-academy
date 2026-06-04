import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def _graphql_query(query: str):
    payload = {"query": query}
    response = client.post("/api/v1/graphql", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    return data["data"]

def test_predict_yield_graphql():
    query = """
    query {
      predictYield(region: \"SouthBulgaria\", year: 2024, crop: \"Wheat\") {
        model
        prediction
        confidence
      }
    }
    """
    result = _graphql_query(query)
    pred = result["predictYield"]
    assert pred["model"] == "yield_random_forest"
    assert isinstance(pred["prediction"], (float, int))
    assert isinstance(pred["confidence"], (float, int))

def test_predict_disease_graphql():
    query = """
    query {
      predictDiseaseRisk(region: \"SouthBulgaria\", year: 2024, crop: \"Wheat\") {
        model
        prediction
        confidence
      }
    }
    """
    result = _graphql_query(query)
    pred = result["predictDiseaseRisk"]
    assert pred["model"] == "disease_random_forest"
    assert isinstance(pred["prediction"], (float, int))
    assert isinstance(pred["confidence"], (float, int))

def test_predict_price_graphql():
    query = """
    query {
      predictPrice(date: \"2024-01-01\") {
        model
        prediction
        confidence
      }
    }
    """
    result = _graphql_query(query)
    pred = result["predictPrice"]
    assert pred["model"] == "price_prophet"
    assert isinstance(pred["prediction"], (float, int))
    assert isinstance(pred["confidence"], (float, int))

def test_predict_water_graphql():
    query = """
    query {
      predictWaterStress(region: \"SouthBulgaria\", date: \"2024-01-01\") {
        model
        prediction
        confidence
      }
    }
    """
    result = _graphql_query(query)
    pred = result["predictWaterStress"]
    assert pred["model"] == "water_prophet"
    assert isinstance(pred["prediction"], (float, int))
    assert isinstance(pred["confidence"], (float, int))
