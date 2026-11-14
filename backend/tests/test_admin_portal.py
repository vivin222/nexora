import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_free_registration_and_admin_portal_flow():
    # 1. Public student can register without admin approval
    test_email = f"free_student_{uuid.uuid4().hex[:8]}@univ.edu"
    test_password = "StudentPass2026!"
    reg_res = client.post("/api/auth/register", json={
        "email": test_email,
        "password": test_password,
        "full_name": "Priya Nair",
        "education_level": "Undergraduate",
        "institution": "Birla Institute of Technology",
        "department": "Computer Science & Engineering",
        "graduation_year": "2026"
    })
    assert reg_res.status_code == 200, reg_res.text
    reg_data = reg_res.json()

    # 2. New account becomes active immediately
    assert reg_data["user"]["role"] == "student"
    assert reg_data["user"]["status"] == "approved"
    student_id = reg_data["user"]["id"]
    student_token = reg_data["token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 3. Student can log in immediately
    student_login = client.post("/api/auth/login", json={
        "email": test_email,
        "password": test_password
    })
    assert student_login.status_code == 200, student_login.text
    assert student_login.json()["user"]["status"] == "approved"

    # 4. Duplicate registration is rejected
    dup_res = client.post("/api/auth/register", json={
        "email": test_email,
        "password": test_password,
        "full_name": "Priya Nair"
    })
    assert dup_res.status_code == 400
    assert "already exists" in dup_res.json()["detail"]

    # 5. Student cannot access admin dashboard/API
    forbidden_res = client.get("/api/admin/stats", headers=student_headers)
    assert forbidden_res.status_code == 403

    student_admin_login = client.post("/api/auth/admin-login", json={
        "email": test_email,
        "password": test_password
    })
    assert student_admin_login.status_code == 403
    assert "administrator privileges" in student_admin_login.json()["detail"].lower()

    # 6. Admin can log in separately via dedicated endpoint
    admin_login = client.post("/api/auth/admin-login", json={
        "email": "admin@nexora.ai",
        "password": "AdminPassword2026!"
    })
    assert admin_login.status_code == 200, admin_login.text
    admin_data = admin_login.json()
    assert admin_data["user"]["role"] == "admin"
    admin_token = admin_data["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 7. Admin can view registrations and student activity
    stats_res = client.get("/api/admin/stats", headers=admin_headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "total_students" in stats
    assert "active_students" in stats
    assert "recent_registrations" in stats
    assert any(s["id"] == student_id for s in stats["recent_registrations"])

    # 8. Admin can suspend and reactivate accounts
    suspend_res = client.post(f"/api/admin/students/{student_id}/suspend", headers=admin_headers)
    assert suspend_res.status_code == 200
    assert suspend_res.json()["status"] == "SUCCESS"

    # Suspended student cannot log in
    suspended_login = client.post("/api/auth/login", json={
        "email": test_email,
        "password": test_password
    })
    assert suspended_login.status_code == 403
    assert "suspended" in suspended_login.json()["detail"].lower()

    # Admin reactivates student
    reactivate_res = client.post(f"/api/admin/students/{student_id}/reactivate", headers=admin_headers)
    assert reactivate_res.status_code == 200
    assert reactivate_res.json()["status"] == "SUCCESS"

    # Reactivated student can log in
    reactivated_login = client.post("/api/auth/login", json={
        "email": test_email,
        "password": test_password
    })
    assert reactivated_login.status_code == 200
    assert reactivated_login.json()["user"]["status"] == "approved"

    # 9. Existing student data remains intact
    students_res = client.get("/api/admin/students", headers=admin_headers)
    assert students_res.status_code == 200
    student_list = students_res.json()
    assert len(student_list) >= 34
