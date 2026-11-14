import json
import uuid
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from app.database import get_db
from app.routers.auth import get_current_user_id
from app.models.schemas import ProfileUpdateRequest
from app.services.orchestrator import orchestrator

router = APIRouter(prefix="/profile", tags=["Learner Profile"])

@router.get("")
def get_profile(user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    profile_data = orchestrator.profile_agent.analyze(user_id)
    if "error" in profile_data:
        raise HTTPException(status_code=404, detail=profile_data["error"])
    return profile_data

@router.put("")
def update_profile(req: ProfileUpdateRequest, user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()

        # Update basic details
        if req.full_name is not None or req.headline is not None:
            fields = []
            vals = []
            if req.full_name is not None:
                fields.append("full_name = ?")
                vals.append(req.full_name)
            if req.headline is not None:
                fields.append("headline = ?")
                vals.append(req.headline)
            vals.append(user_id)
            cursor.execute(f"UPDATE learners SET {', '.join(fields)} WHERE id = ?", vals)

        # Update profile fields
        profile_fields = []
        profile_vals = []
        if req.education is not None:
            profile_fields.append("education = ?")
            profile_vals.append(req.education)
        if req.bio is not None:
            profile_fields.append("bio = ?")
            profile_vals.append(req.bio)
        if req.target_career_id is not None:
            profile_fields.append("target_career_id = ?")
            profile_vals.append(req.target_career_id)
        if req.interests is not None:
            profile_fields.append("interests = ?")
            profile_vals.append(json.dumps(req.interests))

        if profile_fields:
            profile_fields.append("updated_at = CURRENT_TIMESTAMP")
            profile_vals.append(user_id)
            cursor.execute(f"UPDATE profiles SET {', '.join(profile_fields)} WHERE learner_id = ?", profile_vals)

        # Update skills
        if req.skills is not None:
            for s in req.skills:
                cursor.execute("""
                    INSERT INTO learner_skills (id, learner_id, skill_id, proficiency, verified)
                    VALUES (?, ?, ?, ?, 0)
                    ON CONFLICT(learner_id, skill_id) DO UPDATE SET
                    proficiency = excluded.proficiency, updated_at = CURRENT_TIMESTAMP
                """, (str(uuid.uuid4()), user_id, s.skill_id, s.proficiency))

    # Re-run intelligence cycle
    updated_intel = orchestrator.run_full_intelligence_cycle(user_id, req.target_career_id)
    return {
        "status": "SUCCESS",
        "message": "Profile updated and intelligence graph re-calibrated.",
        "intelligence": updated_intel
    }
