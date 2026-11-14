import datetime
import json
import uuid
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from app.database import get_db
from app.routers.auth import get_current_user_id
from app.models.schemas import ProfileUpdateRequest, OnboardingSubmitRequest, ResumeExtractRequest
from app.services.orchestrator import orchestrator

router = APIRouter(prefix="/profile", tags=["Learner Profile"])

@router.get("")
def get_profile(user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    profile_data = orchestrator.profile_agent.analyze(user_id)
    if "error" in profile_data:
        raise HTTPException(status_code=404, detail=profile_data["error"])
    return profile_data

@router.post("/extract-resume")
def extract_resume(req: ResumeExtractRequest) -> Dict[str, Any]:
    """
    Parses resume text using ResumeAnalysisAgent, extracting candidate background,
    education, detected skills, projects, and portfolio links for user review.
    """
    if not req.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")
    
    extracted = orchestrator.resume_agent.extract_profile_data(req.resume_text)
    return {
        "status": "SUCCESS",
        "data": extracted
    }

@router.post("/onboarding")
def complete_onboarding(req: OnboardingSubmitRequest, user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    """
    Submits full learner onboarding profile.
    Saves to SQLite under user's unique ID, executes multi-agent DAG intelligence cycle,
    and initializes personalized career matching, skill gap matrix, and custom roadmap.
    """
    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Update basic learner account details
        cursor.execute("""
            UPDATE learners 
            SET full_name = ?, headline = ?
            WHERE id = ?
        """, (req.full_name, req.headline or f"{req.department or 'Software'} Student", user_id))

        # 2. Update comprehensive profile table
        education_str = req.education_level or "Bachelor's Degree"
        cursor.execute("""
            UPDATE profiles SET
                education = ?,
                institution = ?,
                department = ?,
                academic_year = ?,
                target_career_id = ?,
                interests = ?,
                short_term_goal = ?,
                long_term_goal = ?,
                weekly_hours = ?,
                learning_preferences = ?,
                certifications = ?,
                projects = ?,
                github_url = ?,
                portfolio_url = ?,
                resume_text = ?,
                resume_extracted_data = ?,
                onboarding_completed = 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE learner_id = ?
        """, (
            education_str,
            req.institution or "Accredited University",
            req.department or "Computer Science",
            req.academic_year or "Senior Year",
            req.target_career_id or "career-full-stack-developer",
            json.dumps(req.career_interests or []),
            req.short_term_goal or "",
            req.long_term_goal or "",
            req.weekly_hours or 10,
            json.dumps(req.learning_preferences or []),
            json.dumps(req.certifications or []),
            json.dumps(req.projects or []),
            req.github_url or "",
            req.portfolio_url or "",
            req.resume_text or "",
            json.dumps(req.resume_extracted_data or {}),
            user_id
        ))

        # 3. Save submitted skills with declared proficiencies
        if req.skills:
            for s in req.skills:
                cursor.execute("SELECT id FROM skills WHERE id = ?", (s.skill_id,))
                if not cursor.fetchone():
                    clean_name = s.skill_id.replace("skill-", "").replace("-", " ").title()
                    cursor.execute("""
                        INSERT INTO skills (id, name, category, description)
                        VALUES (?, ?, 'Technical', ?)
                    """, (s.skill_id, clean_name, f"Core competency in {clean_name}"))

                cursor.execute("""
                    INSERT INTO learner_skills (id, learner_id, skill_id, proficiency, verified)
                    VALUES (?, ?, ?, ?, 0)
                    ON CONFLICT(learner_id, skill_id) DO UPDATE SET
                    proficiency = excluded.proficiency, updated_at = CURRENT_TIMESTAMP
                """, (str(uuid.uuid4()), user_id, s.skill_id, s.proficiency))

        # 4. Initialize Weekly Goals for this learner if not already seeded
        cursor.execute("SELECT id FROM weekly_goals WHERE learner_id = ?", (user_id,))
        if not cursor.fetchone():
            today_str = datetime.date.today().isoformat()
            cursor.execute("""
                INSERT INTO weekly_goals (id, learner_id, target_hours, target_lessons, target_assessments, completed_hours, completed_lessons, completed_assessments, week_start_date, streak_days)
                VALUES (?, ?, ?, ?, ?, 0.0, 0, 0, ?, 1)
            """, (str(uuid.uuid4()), user_id, float(req.weekly_hours or 10), 5, 2, today_str))

    # 5. Execute Multi-Agent DAG Intelligence Cycle specifically for THIS user
    updated_intel = orchestrator.run_full_intelligence_cycle(user_id, req.target_career_id)

    # 6. Retrieve synthesized unified profile
    unified_profile = orchestrator.profile_agent.analyze(user_id)

    return {
        "status": "SUCCESS",
        "message": "Learner onboarding completed successfully. Knowledge graph synthesized.",
        "profile": unified_profile,
        "intelligence": updated_intel
    }

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