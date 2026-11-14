import uuid
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Query
from app.database import get_db
from app.routers.auth import require_admin
from app.models.schemas import (
    AdminStudentActionRequest,
    AdminResourceCreateRequest,
    AdminResourceUpdateRequest
)

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

def log_audit_event(cursor, admin_id: str, admin_email: str, action: str, target_type: str, target_id: str, details: Dict[str, Any]):
    cursor.execute("""
        INSERT INTO admin_audit_logs (id, admin_id, admin_email, action, target_type, target_id, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (str(uuid.uuid4()), admin_id, admin_email, action, target_type, target_id, json.dumps(details)))

def get_admin_email(cursor, admin_id: str) -> str:
    cursor.execute("SELECT email FROM learners WHERE id = ?", (admin_id,))
    row = cursor.fetchone()
    return row["email"] if row else "admin@nexora.ai"

@router.get("/stats")
def get_admin_dashboard_stats(admin_id: str = Depends(require_admin)):
    with get_db() as conn:
        cursor = conn.cursor()

        # Student counts by status
        cursor.execute("SELECT COUNT(*) FROM learners WHERE role = 'student'")
        total_students = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM learners WHERE role = 'student' AND DATE(created_at) = DATE('now')")
        new_registrations_today = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM learners WHERE role = 'student' AND status = 'pending'")
        pending_students = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM learners WHERE role = 'student' AND status = 'approved'")
        approved_students = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM learners WHERE role = 'student' AND status = 'rejected'")
        rejected_students = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM learners WHERE role = 'student' AND status = 'suspended'")
        suspended_students = cursor.fetchone()[0]

        # Assessment participation count
        cursor.execute("SELECT COUNT(*) FROM progress_records")
        assessment_submissions = cursor.fetchone()[0]

        # Coding and Project counts
        cursor.execute("SELECT COUNT(*) FROM coding_submissions")
        coding_submissions = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM project_submissions")
        project_submissions = cursor.fetchone()[0]

        # Skill gap distributions across enrolled learners
        cursor.execute("""
            SELECT s.name, COUNT(*) as gap_count
            FROM learner_skills ls
            JOIN skills s ON ls.skill_id = s.id
            WHERE ls.proficiency < 60
            GROUP BY s.name
            ORDER BY gap_count DESC
            LIMIT 6
        """)
        gap_rows = cursor.fetchall()
        skill_gaps = {r["name"]: r["gap_count"] for r in gap_rows}

        # Registration trends (last 7 days counts)
        cursor.execute("""
            SELECT DATE(created_at) as reg_date, COUNT(*) as count
            FROM learners
            WHERE role = 'student'
            GROUP BY DATE(created_at)
            ORDER BY reg_date DESC
            LIMIT 7
        """)
        trend_rows = cursor.fetchall()
        trends = [{"date": r["reg_date"], "count": r["count"]} for r in reversed(trend_rows)]

        # Recent 6 registered students for monitoring
        cursor.execute("""
            SELECT l.id, l.email, l.full_name, l.status, l.institution, l.department, l.created_at,
                   cr.title as target_career_title
            FROM learners l
            LEFT JOIN profiles p ON l.id = p.learner_id
            LEFT JOIN career_roles cr ON p.target_career_id = cr.id
            WHERE l.role = 'student'
            ORDER BY l.created_at DESC
            LIMIT 6
        """)
        recent_students = [dict(r) for r in cursor.fetchall()]

        return {
            "total_students": total_students,
            "new_registrations_today": new_registrations_today,
            "pending_registrations": pending_students,
            "approved_students": approved_students,
            "active_students": approved_students,
            "rejected_registrations": rejected_students,
            "suspended_students": suspended_students,
            "assessment_submissions": assessment_submissions,
            "coding_submissions": coding_submissions,
            "project_submissions": project_submissions,
            "skill_gap_distribution": skill_gaps,
            "registration_trends": trends,
            "recent_registrations": recent_students
        }

@router.get("/students")
def list_students(
    status: Optional[str] = Query("all"),
    department: Optional[str] = Query(None),
    institution: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    admin_id: str = Depends(require_admin)
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT l.id, l.email, l.full_name, l.headline, l.status, l.role, l.rejection_reason,
                   l.education_level, l.institution, l.department, l.graduation_year, l.created_at,
                   p.target_career_id, p.onboarding_completed,
                   cr.title as target_career_title
            FROM learners l
            LEFT JOIN profiles p ON l.id = p.learner_id
            LEFT JOIN career_roles cr ON p.target_career_id = cr.id
            WHERE l.role = 'student'
        """
        params = []

        if status and status != "all":
            query += " AND l.status = ?"
            params.append(status)

        if department:
            query += " AND l.department LIKE ?"
            params.append(f"%{department}%")

        if institution:
            query += " AND l.institution LIKE ?"
            params.append(f"%{institution}%")

        if search:
            query += " AND (l.full_name LIKE ? OR l.email LIKE ?)"
            params.extend([f"%{search}%", f"%{search}%"])

        query += " ORDER BY l.created_at DESC"
        cursor.execute(query, params)
        rows = cursor.fetchall()

        students = []
        for r in rows:
            students.append({
                "id": r["id"],
                "email": r["email"],
                "full_name": r["full_name"],
                "headline": r["headline"],
                "status": r["status"] or "approved",
                "role": r["role"],
                "rejection_reason": r["rejection_reason"] or "",
                "education_level": r["education_level"] or "",
                "institution": r["institution"] or "",
                "department": r["department"] or "",
                "graduation_year": r["graduation_year"] or "",
                "target_career_id": r["target_career_id"] or "",
                "target_career_title": r["target_career_title"] or "Full Stack Developer",
                "onboarding_completed": bool(r["onboarding_completed"]),
                "created_at": r["created_at"]
            })

        return students

@router.get("/students/{student_id}")
def get_student_details(student_id: str, admin_id: str = Depends(require_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT l.*, p.target_career_id, p.bio, p.github_url, p.portfolio_url,
                   p.weekly_hours, p.short_term_goal, p.long_term_goal, p.onboarding_completed,
                   cr.title as target_career_title
            FROM learners l
            LEFT JOIN profiles p ON l.id = p.learner_id
            LEFT JOIN career_roles cr ON p.target_career_id = cr.id
            WHERE l.id = ? AND l.role = 'student'
        """, (student_id,))
        student = cursor.fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found.")

        # Skills
        cursor.execute("""
            SELECT s.id, s.name, s.category, ls.proficiency, ls.verified
            FROM learner_skills ls
            JOIN skills s ON ls.skill_id = s.id
            WHERE ls.learner_id = ?
        """, (student_id,))
        skills = [dict(r) for r in cursor.fetchall()]

        # Milestones
        cursor.execute("""
            SELECT m.*
            FROM milestones m
            JOIN roadmaps r ON m.roadmap_id = r.id
            WHERE r.learner_id = ?
            ORDER BY m.order_index ASC
        """, (student_id,))
        milestones = [dict(r) for r in cursor.fetchall()]

        # Progress assessments
        cursor.execute("""
            SELECT pr.*, a.title as assessment_title
            FROM progress_records pr
            LEFT JOIN assessments a ON pr.assessment_id = a.id
            WHERE pr.learner_id = ?
            ORDER BY pr.completed_at DESC
        """, (student_id,))
        assessments = [dict(r) for r in cursor.fetchall()]

        return {
            "student": dict(student),
            "skills": skills,
            "milestones": milestones,
            "assessments": assessments
        }

@router.post("/students/{student_id}/approve")
def approve_student(student_id: str, admin_id: str = Depends(require_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, full_name FROM learners WHERE id = ? AND role = 'student'", (student_id,))
        student = cursor.fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found.")

        cursor.execute("UPDATE learners SET status = 'approved', rejection_reason = '' WHERE id = ?", (student_id,))
        admin_email = get_admin_email(cursor, admin_id)
        log_audit_event(cursor, admin_id, admin_email, "APPROVE_STUDENT", "learner", student_id, {
            "student_name": student["full_name"],
            "student_email": student["email"]
        })

        return {"status": "SUCCESS", "message": f"Student '{student['full_name']}' has been approved and activated."}

@router.post("/students/{student_id}/reject")
def reject_student(student_id: str, payload: AdminStudentActionRequest, admin_id: str = Depends(require_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, full_name FROM learners WHERE id = ? AND role = 'student'", (student_id,))
        student = cursor.fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found.")

        reason = payload.rejection_reason or "Registration details could not be validated by administration."
        cursor.execute("UPDATE learners SET status = 'rejected', rejection_reason = ? WHERE id = ?", (reason, student_id))
        admin_email = get_admin_email(cursor, admin_id)
        log_audit_event(cursor, admin_id, admin_email, "REJECT_STUDENT", "learner", student_id, {
            "student_name": student["full_name"],
            "student_email": student["email"],
            "rejection_reason": reason
        })

        return {"status": "SUCCESS", "message": f"Student registration has been rejected. Reason saved."}

@router.post("/students/{student_id}/status")
def update_student_status(student_id: str, payload: AdminStudentActionRequest, admin_id: str = Depends(require_admin)):
    if not payload.status or payload.status not in ("approved", "pending", "rejected", "suspended", "inactive"):
        raise HTTPException(status_code=400, detail="Invalid account status value.")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, full_name FROM learners WHERE id = ? AND role = 'student'", (student_id,))
        student = cursor.fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found.")

        cursor.execute("UPDATE learners SET status = ? WHERE id = ?", (payload.status, student_id))
        admin_email = get_admin_email(cursor, admin_id)
        log_audit_event(cursor, admin_id, admin_email, "UPDATE_STATUS", "learner", student_id, {
            "student_name": student["full_name"],
            "student_email": student["email"],
            "new_status": payload.status
        })

        return {"status": "SUCCESS", "message": f"Account status updated to '{payload.status}'."}

@router.post("/students/{student_id}/suspend")
def suspend_student(student_id: str, admin_id: str = Depends(require_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, full_name FROM learners WHERE id = ? AND role = 'student'", (student_id,))
        student = cursor.fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found.")

        cursor.execute("UPDATE learners SET status = 'suspended' WHERE id = ?", (student_id,))
        admin_email = get_admin_email(cursor, admin_id)
        log_audit_event(cursor, admin_id, admin_email, "SUSPEND_STUDENT", "learner", student_id, {
            "student_name": student["full_name"],
            "student_email": student["email"]
        })

        return {"status": "SUCCESS", "message": f"Student account for '{student['full_name']}' has been suspended."}

@router.post("/students/{student_id}/reactivate")
def reactivate_student(student_id: str, admin_id: str = Depends(require_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, full_name FROM learners WHERE id = ? AND role = 'student'", (student_id,))
        student = cursor.fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found.")

        cursor.execute("UPDATE learners SET status = 'approved', rejection_reason = '' WHERE id = ?", (student_id,))
        admin_email = get_admin_email(cursor, admin_id)
        log_audit_event(cursor, admin_id, admin_email, "REACTIVATE_STUDENT", "learner", student_id, {
            "student_name": student["full_name"],
            "student_email": student["email"]
        })

        return {"status": "SUCCESS", "message": f"Student account for '{student['full_name']}' has been reactivated."}

@router.get("/resources")
def list_curriculum_resources(admin_id: str = Depends(require_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT lr.*, s.name as skill_name
            FROM learning_resources lr
            LEFT JOIN skills s ON lr.skill_id = s.id
            ORDER BY lr.skill_id, lr.title
        """)
        resources = [dict(r) for r in cursor.fetchall()]
        return resources

@router.post("/resources")
def create_curriculum_resource(req: AdminResourceCreateRequest, admin_id: str = Depends(require_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        new_id = f"res-{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO learning_resources (id, skill_id, title, url, provider, resource_type, difficulty, estimated_duration, is_free)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (new_id, req.skill_id, req.title, req.url, req.provider, req.resource_type, req.difficulty, req.estimated_duration, req.is_free))

        admin_email = get_admin_email(cursor, admin_id)
        log_audit_event(cursor, admin_id, admin_email, "CREATE_RESOURCE", "learning_resource", new_id, {
            "title": req.title,
            "skill_id": req.skill_id
        })

        return {"status": "SUCCESS", "id": new_id, "message": "Curriculum resource created."}

@router.delete("/resources/{resource_id}")
def delete_curriculum_resource(resource_id: str, admin_id: str = Depends(require_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT title FROM learning_resources WHERE id = ?", (resource_id,))
        res = cursor.fetchone()
        if not res:
            raise HTTPException(status_code=404, detail="Resource not found.")

        cursor.execute("DELETE FROM learning_resources WHERE id = ?", (resource_id,))
        admin_email = get_admin_email(cursor, admin_id)
        log_audit_event(cursor, admin_id, admin_email, "DELETE_RESOURCE", "learning_resource", resource_id, {
            "title": res["title"]
        })

        return {"status": "SUCCESS", "message": f"Resource '{res['title']}' deleted."}

@router.get("/audit-logs")
def get_audit_logs(admin_id: str = Depends(require_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM admin_audit_logs
            ORDER BY created_at DESC
            LIMIT 50
        """)
        logs = []
        for r in cursor.fetchall():
            details_obj = {}
            try:
                details_obj = json.loads(r["details"]) if r["details"] else {}
            except Exception:
                pass
            logs.append({
                "id": r["id"],
                "admin_id": r["admin_id"],
                "admin_email": r["admin_email"],
                "action": r["action"],
                "target_type": r["target_type"],
                "target_id": r["target_id"],
                "details": details_obj,
                "created_at": r["created_at"]
            })
        return logs
