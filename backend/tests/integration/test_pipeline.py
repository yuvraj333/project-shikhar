def test_health_check(api_client):
    """Ensures the API is alive and routing correctly."""
    response = api_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "shikhar-ai-backend"}

def test_process_incident_validation_error(api_client):
    """Ensures Pydantic strictness catches empty or malformed requests before hitting the LLM."""
    # Sending an empty payload
    response = api_client.post("/api/process", json={})
    assert response.status_code == 422  # Unprocessable Entity
    
def test_process_incident_type_enforcement(api_client):
    """Ensures integers are rejected if a string report is expected."""
    response = api_client.post("/api/process", json={"report_text": 12345})
    assert response.status_code == 422