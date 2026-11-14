import json
import time
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from app.database import get_db
from app.routers.auth import get_current_user_id
from app.models.schemas import (
    CareerSelectRequest,
    CareerDiscoveryRequest,
    CareerDiscoveryResponse
)
from app.services.orchestrator import orchestrator
from app.services.career_matcher import evaluate_career_matches

router = APIRouter(prefix="/careers", tags=["Career Intelligence"])

_CAREERS_CACHE: Dict[str, Any] = {"data": None, "timestamp": 0.0}
_CACHE_TTL_SECONDS = 30.0

@router.get("")
def list_careers() -> List[Dict[str, Any]]:
    now = time.time()
    if _CAREERS_CACHE["data"] is not None and (now - _CAREERS_CACHE["timestamp"]) < _CACHE_TTL_SECONDS:
        return _CAREERS_CACHE["data"]

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM career_roles ORDER BY title ASC")
        careers = [dict(c) for c in cursor.fetchall()]

        # High-efficiency batch query: resolves N+1 query overhead in a single scan
        cursor.execute("""
            SELECT csr.*, s.name as skill_name, s.category as skill_category
            FROM career_skill_requirements csr
            JOIN skills s ON csr.skill_id = s.id
            ORDER BY csr.importance_weight DESC
        """)
        all_reqs = cursor.fetchall()
        reqs_by_career: Dict[str, List[Dict[str, Any]]] = {}
        for r in all_reqs:
            cid = r["career_id"]
            if cid not in reqs_by_career:
                reqs_by_career[cid] = []
            reqs_by_career[cid].append(dict(r))

        for c in careers:
            c["requirements"] = reqs_by_career.get(c["id"], [])

        _CAREERS_CACHE["data"] = careers
        _CAREERS_CACHE["timestamp"] = now
        return careers

@router.post("/discover", response_model=CareerDiscoveryResponse)
def discover_careers(req: CareerDiscoveryRequest) -> Dict[str, Any]:
    """
    Evaluates learner's multidimensional profile evidence (academic background,
    domain interests, self-rated skills, and projects) to generate a personalized
    Top 3 candidate career shortlist with match scores, overlap, and gap vectors.
    """
    skill_dict = {}
    if req.skills:
        for s in req.skills:
            skill_dict[s.skill_id] = s.proficiency

    discovery_result = evaluate_career_matches(
        learner_skills=skill_dict,
        interests=req.interests or [],
        department=req.department or "",
        academic_year=req.academic_year or "",
        education_level=req.education_level or "",
        projects=req.projects or [],
        certifications=req.certifications or [],
        weekly_hours=req.weekly_hours or 10,
        current_target_career_id=""
    )
    return discovery_result

@router.get("/recommendations", response_model=CareerDiscoveryResponse)
def get_learner_career_recommendations(user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    """
    Computes real-time personalized career recommendations for the authenticated learner
    using their actual stored profile, verified skill competencies, and projects in SQLite.
    """
    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Fetch learner profile
        cursor.execute("""
            SELECT p.*, l.full_name, l.department as learner_dept, l.education_level as learner_edu
            FROM profiles p
            JOIN learners l ON p.learner_id = l.id
            WHERE p.learner_id = ?
        """, (user_id,))
        prow = cursor.fetchone()
        if not prow:
            raise HTTPException(status_code=404, detail="Learner profile not found")

        interests = []
        try:
            interests = json.loads(prow["interests"]) if prow["interests"] else []
        except Exception:
            pass

        projects = []
        try:
            projects = json.loads(prow["projects"]) if prow["projects"] else []
        except Exception:
            pass

        certifications = []
        try:
            certifications = json.loads(prow["certifications"]) if prow["certifications"] else []
        except Exception:
            pass

        weekly_hours = (prow["weekly_hours"] if prow["weekly_hours"] else 10) or 10
        current_target = prow["target_career_id"] or ""
        department = prow["department"] or prow["learner_dept"] or ""
        education_level = prow["education"] or prow["learner_edu"] or ""

        # 2. Fetch learner skills
        cursor.execute("""
            SELECT skill_id, proficiency, verified
            FROM learner_skills
            WHERE learner_id = ?
        """, (user_id,))
        skill_rows = cursor.fetchall()
        skill_dict = {r["skill_id"]: r["proficiency"] for r in skill_rows}

    # Evaluate matches against all careers
    return evaluate_career_matches(
        learner_skills=skill_dict,
        interests=interests,
        department=department,
        education_level=education_level,
        projects=projects,
        certifications=certifications,
        weekly_hours=weekly_hours,
        current_target_career_id=current_target
    )

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
