import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db
from app.database_expansion import run_database_expansion
from app.data.seed_data import seed_database
from app.data.seed_expansion import seed_expanded_features

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    init_db()
    run_database_expansion()
    seed_database()
    seed_expanded_features()

def test_full_user_onboarding_and_isolation():
    client = TestClient(app)

    # 1. Register User A (Jane Doe)
    user_a_email = f"jane.doe.{uuid.uuid4().hex[:8]}@nexora.ai"
    reg_a = client.post("/api/auth/register", json={
        "email": user_a_email,
        "password": "SecurePassword123!",
        "full_name": "Jane Doe",
        "headline": "Full Stack Software Engineer"
    })
    assert reg_a.status_code == 200
    data_a = reg_a.json()
    token_a = data_a["token"]
    assert data_a["onboarding_completed"] is False
    assert data_a["user"]["full_name"] == "Jane Doe"

    # 2. Test Resume Extraction API for auto-fill
    sample_resume = """
    JANE DOE
    jane.doe@nexora.ai | github.com/janedoe | Seattle, WA
    
    EDUCATION:
    Bachelor of Science in Computer Science
    University of Washington, Seattle (Senior Year)
    
    TECHNICAL SKILLS:
    Languages: JavaScript, TypeScript, Python, SQL
    Frameworks: React, FastAPI, Node.js, TailwindCSS
    Tools: Docker, Git, PostgreSQL
    
    PROJECTS:
    Distributed Telemetry System
    Architected an asynchronous metrics aggregation platform handling streaming WebSocket data.
    """
    ext_res = client.post("/api/profile/extract-resume", json={"resume_text": sample_resume})
    assert ext_res.status_code == 200
    ext_data = ext_res.json()["data"]
    assert "JavaScript" in ext_data["frameworks_and_tools"] or len(ext_data["skills"]) > 0

    # 3. Submit Onboarding Form for User A
    onboard_payload_a = {
        "full_name": "Jane Doe",
        "headline": "Computer Science Senior @ UW",
        "education_level": "Bachelor's Degree",
        "institution": "University of Washington",
        "department": "Computer Science & Engineering",
        "academic_year": "Senior Year (4th Year)",
        "target_career_id": "career-full-stack-developer",
        "career_interests": ["Web Systems", "Cloud Architecture"],
        "short_term_goal": "Secure a Junior Full Stack role at a high-growth tech startup",
        "long_term_goal": "Architect large scale distributed applications",
        "weekly_hours": 15,
        "learning_preferences": ["Hands-on Coding Labs", "System Design"],
        "skills": [
            {"skill_id": "skill-javascript", "proficiency": 80},
            {"skill_id": "skill-react", "proficiency": 75},
            {"skill_id": "skill-sql", "proficiency": 70},
            {"skill_id": "skill-python", "proficiency": 60}
        ],
        "frameworks_and_tools": ["React", "FastAPI", "Docker", "Git"],
        "certifications": ["AWS Certified Cloud Practitioner"],
        "projects": [
            {
                "title": "Distributed Telemetry Platform",
                "tech": "React, FastAPI, WebSocket",
                "description": "Real-time metrics stream with interactive visual charts."
            }
        ],
        "github_url": "https://github.com/janedoe",
        "portfolio_url": "https://janedoe.dev",
        "resume_text": sample_resume,
        "resume_extracted_data": ext_data
    }

    onboard_res_a = client.post(
        "/api/profile/onboarding",
        json=onboard_payload_a,
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert onboard_res_a.status_code == 200
    res_a_json = onboard_res_a.json()
    assert res_a_json["status"] == "SUCCESS"
    assert res_a_json["profile"]["institution"] == "University of Washington"
    assert res_a_json["profile"]["onboarding_completed"] is True
    assert res_a_json["profile"]["weekly_hours"] == 15

    # 4. Verify User A's Personalized Dashboard Progress
    prog_a = client.get("/api/progress", headers={"Authorization": f"Bearer {token_a}"})
    assert prog_a.status_code == 200
    prog_a_data = prog_a.json()
    assert prog_a_data["overall_readiness_score"] > 50
    assert prog_a_data["career"]["title"] == "Full Stack Developer"
    assert prog_a_data["roadmap_total"] > 0

    # 5. Register User B (Bob Builder) with completely different profile
    user_b_email = f"bob.builder.{uuid.uuid4().hex[:8]}@nexora.ai"
    reg_b = client.post("/api/auth/register", json={
        "email": user_b_email,
        "password": "SecurePassword456!",
        "full_name": "Bob Builder",
        "headline": "DevOps Specialist"
    })
    assert reg_b.status_code == 200
    token_b = reg_b.json()["token"]

    onboard_payload_b = {
        "full_name": "Bob Builder",
        "headline": "DevOps & Cloud Engineer",
        "education_level": "Master's Degree",
        "institution": "Georgia Tech",
        "department": "Electrical & Computer Engineering",
        "academic_year": "Graduated",
        "target_career_id": "career-cloud-devops-architect",
        "career_interests": ["Kubernetes", "Infrastructure as Code"],
        "short_term_goal": "Cloud Architect certification",
        "long_term_goal": "Principal SRE",
        "weekly_hours": 20,
        "learning_preferences": ["Deep Infrastructure Labs"],
        "skills": [
            {"skill_id": "skill-python", "proficiency": 90},
            {"skill_id": "skill-docker", "proficiency": 85}
        ],
        "frameworks_and_tools": ["Docker", "Kubernetes", "Terraform"],
        "certifications": ["CKA"],
        "projects": [],
        "github_url": "https://github.com/bobbuilder"
    }

    onboard_res_b = client.post(
        "/api/profile/onboarding",
        json=onboard_payload_b,
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert onboard_res_b.status_code == 200

    # 6. Verify User Isolation: Profile A vs Profile B
    profile_a = client.get("/api/profile", headers={"Authorization": f"Bearer {token_a}"}).json()
    profile_b = client.get("/api/profile", headers={"Authorization": f"Bearer {token_b}"}).json()

    assert profile_a["full_name"] == "Jane Doe"
    assert profile_b["full_name"] == "Bob Builder"
    assert profile_a["institution"] == "University of Washington"
    assert profile_b["institution"] == "Georgia Tech"
    assert profile_a["target_career_id"] == "career-full-stack-developer"
    assert profile_b["target_career_id"] == "career-cloud-devops-architect"
    assert profile_a["weekly_hours"] == 15
    assert profile_b["weekly_hours"] == 20

    # Check roadmaps are independent
    roadmap_a = client.get("/api/roadmap", headers={"Authorization": f"Bearer {token_a}"}).json()
    roadmap_b = client.get("/api/roadmap", headers={"Authorization": f"Bearer {token_b}"}).json()
    assert roadmap_a["career_id"] == "career-full-stack-developer"
    assert roadmap_b["career_id"] == "career-cloud-devops-architect"