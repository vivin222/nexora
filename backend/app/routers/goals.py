import uuid
from datetime import date
from fastapi import APIRouter, Depends
from typing import Dict, Any
from pydantic import BaseModel
from app.database import get_db
from app.routers.auth import get_current_user_id

router = APIRouter(prefix="/goals", tags=["Weekly Learning Goals"])

class UpdateGoalsRequest(BaseModel):
    target_hours: float
    target_lessons: int
    target_assessments: int

@router.get("")
def get_weekly_goals(user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        today = date.today().isoformat()
        cursor.execute("SELECT * FROM weekly_goals WHERE learner_id = ? ORDER BY week_start_date DESC LIMIT 1", (user_id,))
        row = cursor.fetchone()

        if not row:
            # Create default weekly goal
            goal_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO weekly_goals (id, learner_id, target_hours, target_lessons, target_assessments, completed_hours, completed_lessons, completed_assessments, week_start_date, streak_days)
                VALUES (?, ?, 10.0, 5, 2, 4.0, 2, 1, ?, 3)
            """, (goal_id, user_id, today))
            cursor.execute("SELECT * FROM weekly_goals WHERE id = ?", (goal_id,))
            row = cursor.fetchone()

        r_dict = dict(row)
        hours_pct = round((r_dict["completed_hours"] / max(1.0, r_dict["target_hours"])) * 100, 1)
        lessons_pct = round((r_dict["completed_lessons"] / max(1, r_dict["target_lessons"])) * 100, 1)
        r_dict["overall_progress"] = round((hours_pct + lessons_pct) / 2.0, 1)

        return r_dict

@router.put("")
def update_weekly_goals(req: UpdateGoalsRequest, user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE weekly_goals
            SET target_hours = ?, target_lessons = ?, target_assessments = ?, updated_at = CURRENT_TIMESTAMP
            WHERE learner_id = ?
        """, (req.target_hours, req.target_lessons, req.target_assessments, user_id))

        return {"status": "SUCCESS", "message": "Weekly goals updated successfully"}
