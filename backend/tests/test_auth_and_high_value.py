import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)

def test_google_auth_flow():
    # 1. New Google user registration/login
    res = client.post("/api/auth/google", json={"id_token": "mock_google_token_12345"})
    assert res.status_code == 200, res.text
    data = res.json()
    assert "token" in data
    assert data["user"]["role"] == "student"
    assert data["user"]["status"] == "approved"
    assert data["onboarding_completed"] is False
    token = data["token"]

    # 2. Re-login with same Google token links to same account
    res2 = client.post("/api/auth/google", json={"id_token": "mock_google_token_12345"})
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["token"] == token

def test_github_auth_flow():
    # 1. New GitHub user registration/login
    res = client.post("/api/auth/github", json={"code": "mock_github_code_abc123"})
    assert res.status_code == 200, res.text
    data = res.json()
    assert "token" in data
    assert data["user"]["role"] == "student"
    assert data["user"]["status"] == "approved"
    token = data["token"]

    # 2. Re-login with same GitHub code
    res2 = client.post("/api/auth/github", json={"code": "mock_github_code_abc123"})
    assert res2.status_code == 200
    assert res2.json()["token"] == token

def test_jury_admin_login():
    # 1. Jury login with default / valid passkey
    res = client.post("/api/auth/jury-login", json={"passkey": settings.JURY_ADMIN_PASSWORD})
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["user"]["role"] == "admin"
    assert data["user"]["status"] == "approved"
    admin_token = data["token"]

    # 2. Admin platform health accessible by jury admin
    health_res = client.get("/api/admin/platform-health", headers={"Authorization": f"Bearer {admin_token}"})
    assert health_res.status_code == 200, health_res.text
    h_data = health_res.json()
    assert h_data["status"] == "OPTIMAL"
    assert h_data["total_registered_learners"] > 0
    assert h_data["admin_accounts"] >= 1

    # 3. Invalid passkey rejected
    bad_res = client.post("/api/auth/jury-login", json={"passkey": "WrongPassword"})
    assert bad_res.status_code == 401

def test_student_activity_timeline():
    import uuid
    # Register a new student with unique email
    unique_email = f"timeline_{uuid.uuid4().hex[:6]}@test.edu"
    reg_res = client.post("/api/auth/register", json={
        "email": unique_email,
        "password": "Password123!",
        "full_name": "Timeline Student",
        "education_level": "Undergraduate",
        "institution": "MIT",
        "department": "Computer Science",
        "graduation_year": "2026"
    })
    assert reg_res.status_code == 200
    token = reg_res.json()["token"]

    # Fetch timeline
    res = client.get("/api/profile/timeline", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200, res.text
    events = res.json()
    assert isinstance(events, list)
    assert len(events) >= 1
    # Check registration event exists
    assert any("Welcome" in e["title"] or "Registered" in e["title"] or "Created" in e["title"] for e in events)

def test_career_readiness_report():
    # Get any active student token
    login_res = client.post("/api/auth/google", json={"id_token": "mock_google_report_user"})
    token = login_res.json()["token"]

    res = client.get("/api/profile/readiness-report", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200, res.text
    report = res.json()
    assert "readiness_score" in report
    assert "formula_explanation" in report
    assert "score_breakdown" in report
    assert report["readiness_score"] >= 0 and report["readiness_score"] <= 100
    assert "estimated_weeks_to_market_ready" in report

def test_weekly_growth_review():
    login_res = client.post("/api/auth/github", json={"code": "mock_growth_user"})
    token = login_res.json()["token"]

    res = client.get("/api/profile/weekly-growth", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200, res.text
    growth = res.json()
    assert "hours_invested" in growth
    assert "target_hours" in growth
    assert "velocity_indicator" in growth
    assert "ai_sprint_actions" in growth
    assert len(growth["ai_sprint_actions"]) > 0

def test_strict_rbac_protection():
    # Student cannot access admin endpoints
    login_res = client.post("/api/auth/google", json={"id_token": "mock_google_student_rbac"})
    student_token = login_res.json()["token"]

    admin_res = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {student_token}"})
    assert admin_res.status_code == 403, "Student must receive 403 Forbidden on admin endpoints"

    health_res = client.get("/api/admin/platform-health", headers={"Authorization": f"Bearer {student_token}"})
    assert health_res.status_code == 403, "Student must receive 403 Forbidden on platform health"
