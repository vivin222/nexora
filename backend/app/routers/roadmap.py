import uuid
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from app.database import get_db
from app.routers.auth import get_current_user_id
from app.models.schemas import MilestoneToggleRequest
from app.services.orchestrator import orchestrator

router = APIRouter(prefix="/roadmap", tags=["Learning Roadmap"])

@router.get("")
def get_roadmap(user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        # Find active profile career
        cursor.execute("SELECT target_career_id FROM profiles WHERE learner_id = ?", (user_id,))
        p_row = cursor.fetchone()
        career_id = p_row["target_career_id"] if p_row and p_row["target_career_id"] else "career-full-stack-developer"

        # Check existing roadmap
        cursor.execute("SELECT * FROM roadmaps WHERE learner_id = ? AND career_id = ?", (user_id, career_id))
        roadmap = cursor.fetchone()

        if not roadmap:
            # Generate new roadmap via orchestrator
            intel = orchestrator.run_full_intelligence_cycle(user_id, career_id)
            return intel["roadmap"]

        r_dict = dict(roadmap)
        cursor.execute("""
            SELECT m.*, s.name as skill_name, s.category as skill_category
            FROM milestones m
            LEFT JOIN skills s ON m.skill_id = s.id
            WHERE m.roadmap_id = ?
            ORDER BY m.order_index ASC
        """, (r_dict["id"],))
        milestones = [dict(m) for m in cursor.fetchall()]
        r_dict["milestones"] = milestones
        r_dict["progress_percentage"] = round((r_dict["completed_milestones"] / max(1, r_dict["total_milestones"])) * 100, 1)

        return r_dict

@router.post("/generate")
def generate_roadmap(user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    intel = orchestrator.run_full_intelligence_cycle(user_id)
    return intel["roadmap"]

@router.put("/milestones/{milestone_id}")
def toggle_milestone(
    milestone_id: str,
    req: MilestoneToggleRequest,
    user_id: str = Depends(get_current_user_id)
) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM milestones WHERE id = ?", (milestone_id,))
        m = cursor.fetchone()
        if not m:
            raise HTTPException(status_code=404, detail="Milestone not found")

        roadmap_id = m["roadmap_id"]
        new_status = "completed" if req.completed else "pending"
        completed_at = "CURRENT_TIMESTAMP" if req.completed else "NULL"

        if req.completed:
            cursor.execute("""
                UPDATE milestones
                SET status = 'completed', completed_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (milestone_id,))
        else:
            cursor.execute("""
                UPDATE milestones
                SET status = 'pending', completed_at = NULL
                WHERE id = ?
            """, (milestone_id,))

        # Recount completed milestones
        cursor.execute("SELECT COUNT(*) as comp FROM milestones WHERE roadmap_id = ? AND status = 'completed'", (roadmap_id,))
        comp_count = cursor.fetchone()["comp"]

        cursor.execute("SELECT COUNT(*) as total FROM milestones WHERE roadmap_id = ?", (roadmap_id,))
        total_count = cursor.fetchone()["total"]

        cursor.execute("""
            UPDATE roadmaps
            SET completed_milestones = ?, total_milestones = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (comp_count, total_count, roadmap_id))

        # Record progress event
        cursor.execute("""
            INSERT INTO progress_records (id, learner_id, event_type, description, metric_name, new_value)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            str(uuid.uuid4()),
            user_id,
            "MILESTONE_UPDATED",
            f"Milestone '{m['title']}' marked as {new_status}",
            "ROADMAP_PROGRESS",
            round((comp_count / max(1, total_count)) * 100, 1)
        ))

    return {
        "status": "SUCCESS",
        "milestone_id": milestone_id,
        "new_status": new_status,
        "completed_milestones": comp_count,
        "total_milestones": total_count,
        "progress_percentage": round((comp_count / max(1, total_count)) * 100, 1)
    }
