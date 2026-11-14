import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["service"] == "NEXORA Intelligence Core"

def test_list_careers():
    response = client.get("/api/careers")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 4
    slugs = [c["slug"] for c in data]
    assert "full-stack-developer" in slugs

def test_get_profile():
    response = client.get("/api/profile")
    assert response.status_code == 200
    data = response.json()
    assert data["learner_id"] == "learner-alex-mercer"
    assert "skills" in data
    assert len(data["skills"]) >= 3

def test_skill_analysis():
    response = client.get("/api/skills/analysis")
    assert response.status_code == 200
    data = response.json()
    assert "analysis" in data
    assert "overall_score" in data["analysis"]
    assert "detailed_gaps" in data["analysis"]

def test_get_roadmap():
    response = client.get("/api/roadmap")
    assert response.status_code == 200
    data = response.json()
    assert "milestones" in data
    assert len(data["milestones"]) > 0

def test_mentor_chat():
    response = client.post("/api/mentor/chat", json={"message": "What should I learn next for Full Stack?"})
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert len(data["message"]) > 20
    assert "metadata" in data

def test_agent_telemetry():
    response = client.get("/api/agents/status")
    assert response.status_code == 200
    data = response.json()
    assert len(data["agents"]) == 6
    assert data["orchestrator"]["status"] == "ONLINE"
