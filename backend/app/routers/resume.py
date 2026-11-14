import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.database import get_db
from app.routers.auth import get_current_user_id
from app.services.orchestrator import orchestrator

router = APIRouter(prefix="/resume", tags=["Resume and Portfolio Analyzer"])

class ResumeAnalyzeRequest(BaseModel):
    resume_text: str
    filename: Optional[str] = "Uploaded_Resume.txt"
    career_id: Optional[str] = None

@router.post("/analyze")
def analyze_resume(req: ResumeAnalyzeRequest, user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        c_id = req.career_id
        if not c_id:
            cursor.execute("SELECT target_career_id FROM profiles WHERE learner_id = ?", (user_id,))
            p = cursor.fetchone()
            c_id = p["target_career_id"] if p and p["target_career_id"] else "career-full-stack-developer"

        # Analyze via ResumeAgent
        analysis = orchestrator.resume_agent.analyze_resume_text(req.resume_text, c_id)

        analysis_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO resume_analyses (id, learner_id, career_id, filename, detected_skills_json, missing_skills_json, match_percentage, actionable_feedback_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            analysis_id, user_id, c_id, req.filename,
            json.dumps(analysis["detected_skills"]),
            json.dumps(analysis["missing_skills"]),
            analysis["match_percentage"],
            json.dumps(analysis["actionable_feedback"])
        ))

        cursor.execute("""
            INSERT INTO progress_records (id, learner_id, event_type, description, metric_name, new_value)
            VALUES (?, ?, 'RESUME_ANALYZED', 'Analyzed resume against target career benchmarks', 'RESUME_MATCH_SCORE', ?)
        """, (str(uuid.uuid4()), user_id, analysis["match_percentage"]))

        return {
            "analysis_id": analysis_id,
            "career_id": c_id,
            **analysis
        }

@router.get("/latest")
def get_latest_resume_analysis(user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM resume_analyses
            WHERE learner_id = ?
            ORDER BY created_at DESC LIMIT 1
        """, (user_id,))
        row = cursor.fetchone()
        if not row:
            return {"has_analysis": False}

        r_dict = dict(row)
        return {
            "has_analysis": True,
            "analysis_id": r_dict["id"],
            "career_id": r_dict["career_id"],
            "filename": r_dict["filename"],
            "match_percentage": r_dict["match_percentage"],
            "detected_skills": json.loads(r_dict["detected_skills_json"]),
            "missing_skills": json.loads(r_dict["missing_skills_json"]),
            "actionable_feedback": json.loads(r_dict["actionable_feedback_json"]),
            "created_at": r_dict["created_at"]
        }
