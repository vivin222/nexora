from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from app.database import get_db
from app.routers.auth import get_current_user_id
from app.models.schemas import CareerSelectRequest
from app.services.orchestrator import orchestrator

router = APIRouter(prefix="/careers", tags=["Career Intelligence"])

@router.get("")
def list_careers() -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM career_roles ORDER BY title ASC")
        careers = [dict(c) for c in cursor.fetchall()]

        for c in careers:
            cursor.execute("""
                SELECT csr.*, s.name as skill_name, s.category as skill_category
                FROM career_skill_requirements csr
                JOIN skills s ON csr.skill_id = s.id
                WHERE csr.career_id = ?
                ORDER BY csr.importance_weight DESC
            """, (c["id"],))
            c["requirements"] = [dict(r) for r in cursor.fetchall()]

        return careers

@router.get("/{career_id}")
def get_career_details(career_id: str) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM career_roles WHERE id = ? OR slug = ?", (career_id, career_id))
        career = cursor.fetchone()
        if not career:
            raise HTTPException(status_code=404, detail="Career role not found")
        
        c_dict = dict(career)
        cursor.execute("""
            SELECT csr.*, s.name as skill_name, s.category as skill_category
            FROM career_skill_requirements csr
            JOIN skills s ON csr.skill_id = s.id
            WHERE csr.career_id = ?
            ORDER BY csr.importance_weight DESC
        """, (c_dict["id"],))
        c_dict["requirements"] = [dict(r) for r in cursor.fetchall()]
        return c_dict

@router.post("/select")
def select_target_career(req: CareerSelectRequest, user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    # Validate career exists
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM career_roles WHERE id = ? OR slug = ?", (req.career_id, req.career_id))
        career = cursor.fetchone()
        if not career:
            raise HTTPException(status_code=404, detail="Career role not found")
        career_id = career["id"]

    # Trigger orchestrator to update profile, recalculate gaps, and rebuild roadmap
    orchestration_result = orchestrator.run_full_intelligence_cycle(user_id, career_id)
    return {
        "status": "SUCCESS",
        "message": f"Target career updated to {career['title']}. Roadmap and skill gaps re-calibrated.",
        "orchestration": orchestration_result
    }
