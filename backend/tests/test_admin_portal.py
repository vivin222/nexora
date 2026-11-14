import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_admin_portal_flow():
    # 1. Admin login
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@nexora.ai",
        "password": "AdminPassword2026!"
    })
    assert admin_login.status_code == 200, admin_login.text
    admin_data = admin_login.json()
    assert admin_data["user"]["role"] == "admin"
    admin_token = admin_data["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Register a new student
    test_email = f"student_test_{uuid.uuid4().hex[:8]}@univ.edu"
    reg_res = client.post("/api/auth/register", json={
        "email": test_email,
        "password": "StudentPass2026!",
        "full_name": "Rohan Deshmukh",
        "education_level": "Undergraduate",
        "institution": "National Institute of Technology",
        "department": "Computer Science & Engineering",
        "graduation_year": "2026"
    })
    assert reg_res.status_code == 200, reg_res.text
    reg_data = reg_res.json()
    assert reg_data["user"]["role"] == "student"
    assert reg_data["user"]["status"] == "pending"
    student_id = reg_data["user"]["id"]
    student_token = reg_data["token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 3. Student tries to access admin stats -> MUST be 403 Forbidden
    forbidden_res = client.get("/api/admin/stats", headers=student_headers)
    assert forbidden_res.status_code == 403

    # 4. Admin checks stats
    stats_res = client.get("/api/admin/stats", headers=admin_headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "total_students" in stats
    assert "pending_registrations" in stats
    assert stats["pending_registrations"] >= 1

    # 5. Admin lists students with pending status
    pending_list = client.get("/api/admin/students?status=pending", headers=admin_headers)
    assert pending_list.status_code == 200
    students = pending_list.json()
    assert any(s["id"] == student_id for s in students)

    # 6. Admin approves the student
    approve_res = client.post(f"/api/admin/students/{student_id}/approve", headers=admin_headers)
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "SUCCESS"

    # 7. Student can now log in and status is approved
    student_login = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "StudentPass2026!"
    })
    assert student_login.status_code == 200
    assert student_login.json()["user"]["status"] == "approved"

    # 8. Admin resource creation and deletion
    res_create = client.post("/api/admin/resources", headers=admin_headers, json={
        "skill_id": "skill-python",
        "title": "Advanced Python Systems Programming",
        "url": "https://docs.python.org/3/howto/",
        "provider": "Official Python Foundation",
        "resource_type": "Documentation",
        "difficulty": "Advanced",
        "estimated_duration": "4 hours",
        "is_free": True
    })
    assert res_create.status_code == 200
    res_id = res_create.json()["id"]

    res_delete = client.delete(f"/api/admin/resources/{res_id}", headers=admin_headers)
    assert res_delete.status_code == 200

    # 9. Admin audit log verification
    audit_res = client.get("/api/admin/audit-logs", headers=admin_headers)
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) >= 2
    actions = [log["action"] for log in logs]
    assert "APPROVE_STUDENT" in actions
    assert "CREATE_RESOURCE" in actions
