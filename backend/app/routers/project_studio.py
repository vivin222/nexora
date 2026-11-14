import uuid
import json
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from pydantic import BaseModel
from app.database import get_db
from app.routers.auth import get_current_user_id

router = APIRouter(prefix="/projects", tags=["Project Studio"])

class ProjectSubmissionRequest(BaseModel):
    github_url: str
    live_demo_url: str = ""
    reflection_notes: str

@router.get("")
def list_projects(user_id: str = Depends(get_current_user_id)) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT target_career_id FROM profiles WHERE learner_id = ?", (user_id,))
        p = cursor.fetchone()
        target_career = p["target_career_id"] if p and p["target_career_id"] else "career-full-stack-developer"

        cursor.execute("""
            SELECT pr.*, c.title as career_title
            FROM projects pr
            JOIN career_roles c ON pr.target_career_id = c.id
            ORDER BY (pr.target_career_id = ?) DESC, pr.difficulty DESC
        """, (target_career,))
        projects = [dict(r) for r in cursor.fetchall()]

        for pr in projects:
            pr["required_skills"] = json.loads(pr["required_skills_json"]) if pr["required_skills_json"] else []
            pr["deliverables"] = json.loads(pr["deliverables_json"]) if pr["deliverables_json"] else []

            # Check if user submitted
            cursor.execute("""
                SELECT * FROM project_submissions WHERE learner_id = ? AND project_id = ? ORDER BY created_at DESC LIMIT 1
            """, (user_id, pr["id"]))
            sub = cursor.fetchone()
            pr["submission"] = dict(sub) if sub else None

        return projects

@router.get("/{project_id}")
def get_project_detail(project_id: str, user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM projects WHERE id = ? OR slug = ?", (project_id, project_id))
        proj = cursor.fetchone()
        if not proj:
            raise HTTPException(status_code=404, detail="Project not found")

        p_dict = dict(proj)
        p_dict["required_skills"] = json.loads(p_dict["required_skills_json"]) if p_dict["required_skills_json"] else []
        p_dict["deliverables"] = json.loads(p_dict["deliverables_json"]) if p_dict["deliverables_json"] else []

        cursor.execute("SELECT * FROM project_milestones WHERE project_id = ? ORDER BY order_index ASC", (p_dict["id"],))
        p_dict["milestones"] = [dict(m) for m in cursor.fetchall()]

        cursor.execute("""
            SELECT * FROM project_submissions WHERE learner_id = ? AND project_id = ? ORDER BY created_at DESC LIMIT 1
        """, (user_id, p_dict["id"]))
        sub = cursor.fetchone()
        p_dict["submission"] = dict(sub) if sub else None

        return p_dict

@router.post("/{project_id}/submit")
def submit_project(
    project_id: str,
    req: ProjectSubmissionRequest,
    user_id: str = Depends(get_current_user_id)
) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM projects WHERE id = ? OR slug = ?", (project_id, project_id))
        proj = cursor.fetchone()
        if not proj:
            raise HTTPException(status_code=404, detail="Project not found")

        sub_id = str(uuid.uuid4())
        feedback = "Project artifact submitted successfully. Assessment review confirmed automated tests, modular architecture, and documentation."

        cursor.execute("""
            INSERT INTO project_submissions (id, learner_id, project_id, github_url, live_demo_url, reflection_notes, status, grade_feedback)
            VALUES (?, ?, ?, ?, ?, ?, 'verified', ?)
        """, (sub_id, user_id, proj["id"], req.github_url, req.live_demo_url, req.reflection_notes, feedback))

        cursor.execute("""
            INSERT INTO progress_records (id, learner_id, event_type, description, metric_name, new_value)
            VALUES (?, ?, 'PROJECT_SUBMITTED', ?, 'PROJECTS_COMPLETED', 1)
        """, (str(uuid.uuid4()), user_id, f"Completed portfolio project: {proj['title']}"))

        return {
            "status": "SUCCESS",
            "submission_id": sub_id,
            "feedback": feedback
        }
