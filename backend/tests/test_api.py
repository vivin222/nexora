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
    assert "learner_id" in data and len(data["learner_id"]) > 0
    assert "skills" in data

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
    assert len(data["agents"]) >= 6
    assert data["orchestrator"]["status"] == "ONLINE"

def test_career_discovery_and_recommendations():
    # 1. Discover careers with empty profile
    disc_empty = client.post("/api/careers/discover", json={
        "education_level": "Undergraduate",
        "department": "Computer Science",
        "interests": ["Machine Learning", "Neural Networks"],
        "skills": []
    })
    assert disc_empty.status_code == 200
    res_empty = disc_empty.json()
    assert len(res_empty["top_matches"]) == 3
    assert len(res_empty["missing_profile_data"]) > 0
    # First match should be AI/ML Engineer due to strong domain interest
    assert res_empty["top_matches"][0]["career_id"] == "career-ai-ml-engineer"

    # 2. Discover careers with rich student evidence
    disc_rich = client.post("/api/careers/discover", json={
        "education_level": "Undergraduate",
        "department": "Computer Science",
        "interests": ["Cloud Architecture", "DevOps", "Infrastructure"],
        "skills": [
            {"skill_id": "skill-docker", "proficiency": 85},
            {"skill_id": "skill-cloud-aws-gcp", "proficiency": 80},
            {"skill_id": "skill-kubernetes", "proficiency": 75},
            {"skill_id": "skill-git", "proficiency": 80}
        ],
        "weekly_hours": 15
    })
    assert disc_rich.status_code == 200
    res_rich = disc_rich.json()
    assert len(res_rich["top_matches"]) == 3
    top_career = res_rich["top_matches"][0]
    assert top_career["career_id"] == "career-cloud-devops-architect"
    assert top_career["match_score"] >= 60.0
    assert top_career["overlapping_skills_count"] >= 3
    assert len(top_career["critical_gaps"]) >= 0
    assert "leverage" in top_career["match_rationale"].lower() or len(top_career["match_rationale"]) > 10

