import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Any, List, Optional
from app.database import get_db
from app.routers.auth import get_current_user_id
from app.models.schemas import SkillItem
from app.services.orchestrator import orchestrator

router = APIRouter(prefix="/skills", tags=["Skills & Gap Analysis"])

@router.get("")
def list_skills() -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM skills ORDER BY category, name")
        return [dict(s) for s in cursor.fetchall()]

@router.get("/analysis")
def get_skill_analysis(
    career_id: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id)
) -> Dict[str, Any]:
    profile_data = orchestrator.profile_agent.analyze(user_id)
    target_career = career_id or profile_data.get("target_career_id") or "career-full-stack-developer"
    
    analysis = orchestrator.skill_analysis_agent.analyze(profile_data.get("skill_map", {}), target_career)
    career_info = orchestrator.career_agent.evaluate(target_career, analysis["overall_score"], analysis["detailed_gaps"])
    
    return {
        "career": career_info,
        "analysis": analysis,
        "learner_skills": profile_data.get("skills", [])
    }

@router.post("/update")
def update_learner_skill(skill: SkillItem, user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO learner_skills (id, learner_id, skill_id, proficiency, verified)
            VALUES (?, ?, ?, ?, 0)
            ON CONFLICT(learner_id, skill_id) DO UPDATE SET
            proficiency = excluded.proficiency, updated_at = CURRENT_TIMESTAMP
        """, (str(uuid.uuid4()), user_id, skill.skill_id, skill.proficiency))

    # Re-evaluate
    intel = orchestrator.run_full_intelligence_cycle(user_id)
    return {
        "status": "SUCCESS",
        "message": "Skill updated successfully and readiness recalculated.",
        "intelligence": intel
    }
