import json
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from app.database import get_db
from app.routers.auth import get_current_user_id
from app.models.schemas import AssessmentSubmitRequest
from app.services.orchestrator import orchestrator

router = APIRouter(prefix="/assessments", tags=["Adaptive Assessments"])

@router.get("")
def list_assessments(user_id: str = Depends(get_current_user_id)) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT a.*, s.name as skill_name, s.category as skill_category
            FROM assessments a
            JOIN skills s ON a.skill_id = s.id
            ORDER BY a.title ASC
        """)
        assessments = [dict(a) for a in cursor.fetchall()]

        for a in assessments:
            # Check if user has taken this
            cursor.execute("""
                SELECT score, total_questions, percentage, passed, created_at
                FROM assessment_results
                WHERE learner_id = ? AND assessment_id = ?
                ORDER BY created_at DESC LIMIT 1
            """, (user_id, a["id"]))
            last_result = cursor.fetchone()
            a["last_result"] = dict(last_result) if last_result else None

            # Count questions
            cursor.execute("SELECT COUNT(*) as qcount FROM assessment_questions WHERE assessment_id = ?", (a["id"],))
            a["question_count"] = cursor.fetchone()["qcount"]

        return assessments

@router.get("/{assessment_id}")
def get_assessment(assessment_id: str) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT a.*, s.name as skill_name, s.category as skill_category
            FROM assessments a
            JOIN skills s ON a.skill_id = s.id
            WHERE a.id = ?
        """, (assessment_id,))
        asmt = cursor.fetchone()
        if not asmt:
            raise HTTPException(status_code=404, detail="Assessment not found")

        asmt_dict = dict(asmt)

        # Retrieve questions without exposing correct answer index to client
        cursor.execute("""
            SELECT id, question_text, options_json, weight
            FROM assessment_questions
            WHERE assessment_id = ?
            ORDER BY id ASC
        """, (assessment_id,))
        raw_questions = cursor.fetchall()
        questions = []
        for q in raw_questions:
            questions.append({
                "id": q["id"],
                "question_text": q["question_text"],
                "options": json.loads(q["options_json"]),
                "weight": q["weight"]
            })

        asmt_dict["questions"] = questions
        return asmt_dict

@router.post("/submit")
def submit_assessment(
    req: AssessmentSubmitRequest,
    user_id: str = Depends(get_current_user_id)
) -> Dict[str, Any]:
    evaluation = orchestrator.process_assessment_submission(user_id, req.assessment_id, req.answers)
    return {
        "status": "SUCCESS",
        "evaluation": evaluation
    }
