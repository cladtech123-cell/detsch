"""Smoke test for the health endpoint (uses FastAPI TestClient)."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_ok() -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"


def test_root() -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert "docs" in response.json()
