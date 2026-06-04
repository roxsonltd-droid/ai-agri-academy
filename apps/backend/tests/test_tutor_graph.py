from __future__ import annotations

from fastapi.testclient import TestClient


def test_tutor_graph_stub(client: TestClient) -> None:
    r = client.post("/api/tutor/graph", json={"question": "Тестов въпрос за tutor"})
    assert r.status_code == 200
    data = r.json()
    assert "answer" in data
    assert data.get("topic") in ("general", "weather", "market", None)
    assert "trace" in data
    assert isinstance(data["trace"], list)
