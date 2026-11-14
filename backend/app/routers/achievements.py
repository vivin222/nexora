from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from app.database import get_db
from app.routers.auth import get_current_user_id

router = APIRouter(prefix="/achievements", tags=["Achievements & Certificates"])

@router.get("")
def list_achievements(user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT a.*, 
                   CASE WHEN la.achievement_id IS NOT NULL THEN 1 ELSE 0 END as unlocked,
                   la.unlocked_at
            FROM achievements a
            LEFT JOIN learner_achievements la ON a.id = la.achievement_id AND la.learner_id = ?
            ORDER BY a.category, a.threshold_val ASC
        """, (user_id,))
        achievements = [dict(r) for r in cursor.fetchall()]

        cursor.execute("SELECT * FROM certificates WHERE learner_id = ? ORDER BY issue_date DESC", (user_id,))
        certificates = [dict(c) for c in cursor.fetchall()]

        return {
            "achievements": achievements,
            "certificates": certificates,
            "total_unlocked": sum(1 for a in achievements if a["unlocked"] == 1),
            "total_available": len(achievements)
        }
