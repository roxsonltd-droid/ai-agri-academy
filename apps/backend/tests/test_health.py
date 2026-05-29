from __future__ import annotations

from fastapi.testclient import TestClient


def test_health_ok(client: TestClient) -> None:
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


def test_openapi_json(client: TestClient) -> None:
    r = client.get("/openapi.json")
    assert r.status_code == 200
    body = r.json()
    assert body.get("openapi")
    assert body.get("info", {}).get("title")


def test_swagger_ui(client: TestClient) -> None:
    r = client.get("/docs")
    assert r.status_code == 200
    assert "swagger" in r.text.lower() or "openapi" in r.text.lower()


def test_redoc(client: TestClient) -> None:
    r = client.get("/redoc")
    assert r.status_code == 200
    assert "redoc" in r.text.lower()
