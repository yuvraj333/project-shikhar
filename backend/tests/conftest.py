import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def api_client():
    """Provides a test client for integration testing the FastAPI application."""
    return TestClient(app)