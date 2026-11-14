import json
from fastapi import APIRouter, Depends, Query
from typing import Dict, Any, List, Optional
from app.database import get_db
from app.routers.auth import get_current_user_id

router = APIRouter(prefix="/opportunities", tags=["Career Opportunity Matching"])

@router.get("")
def list_opportunities(
    career_id: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id)
) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        c_id = career_id
        if not c_id:
            cursor.execute("SELECT target_career_id FROM profiles WHERE learner_id = ?", (user_id,))
            p = cursor.fetchone()
            c_id = p["target_career_id"] if p and p["target_career_id"] else "career-full-stack-developer"

        # Fetch learner's verified skills
        cursor.execute("SELECT skill_id FROM learner_skills WHERE learner_id = ? AND proficiency >= 50", (user_id,))
        learner_skills = {r["skill_id"] for r in cursor.fetchall()}

        cursor.execute("""
            SELECT o.*, c.title as career_title
            FROM career_opportunities o
            JOIN career_roles c ON o.career_id = c.id
            WHERE o.career_id = ?
            ORDER BY o.company_name ASC
        """, (c_id,))
        opportunities = [dict(r) for r in cursor.fetchall()]

        for op in opportunities:
            req_skills = json.loads(op["required_skills_json"]) if op["required_skills_json"] else []
            matched = [s for s in req_skills if s in learner_skills]
            op["required_skills"] = req_skills
            op["match_score"] = round((len(matched) / max(1, len(req_skills))) * 100, 1)

        return opportunities
