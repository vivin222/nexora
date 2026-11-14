import uuid
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

@router.get("/smart-revision/feed")
def get_smart_revision_feed(user_id: str = Depends(get_current_user_id)) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()

        # Find recent assessment results where percentage < 60% or specific subtopic gaps
        cursor.execute("""
            SELECT ar.*, a.title as assessment_title, a.skill_id, s.name as skill_name
            FROM assessment_results ar
            JOIN assessments a ON ar.assessment_id = a.id
            JOIN skills s ON a.skill_id = s.id
            WHERE ar.learner_id = ? AND ar.status != 'incomplete'
            ORDER BY ar.created_at DESC LIMIT 10
        """, (user_id,))
        results = [dict(r) for r in cursor.fetchall()]

        revision_feed = []
        seen_skills = set()

        for res in results:
            skill_id = res["skill_id"]
            if skill_id in seen_skills:
                continue

            # Check if scored < 60 or had misconceptions
            try:
                misconceptions = json.loads(res.get("misconceptions_json") or "[]")
            except Exception:
                misconceptions = []

            is_deficit = res["percentage"] < 60.0 or len(misconceptions) > 0
            if is_deficit:
                seen_skills.add(skill_id)

                # Fetch targeted micro-lesson
                cursor.execute("""
                    SELECT cl.id, cl.title, cl.estimated_minutes, c.id as course_id, c.title as course_title
                    FROM course_lessons cl
                    JOIN courses c ON cl.course_id = c.id
                    WHERE c.skill_id = ?
                    ORDER BY cl.order_index ASC LIMIT 1
                """, (skill_id,))
                lesson = cursor.fetchone()

                # Fetch targeted algorithmic challenge
                cursor.execute("""
                    SELECT id, slug, title, difficulty
                    FROM coding_problems
                    WHERE skill_id = ?
                    LIMIT 1
                """, (skill_id,))
                prob = cursor.fetchone()

                revision_feed.append({
                    "assessment_id": res["assessment_id"],
                    "assessment_title": res["assessment_title"],
                    "skill_id": skill_id,
                    "skill_name": res["skill_name"],
                    "last_score": res["percentage"],
                    "misconceptions": misconceptions[:3],
                    "recommended_micro_lesson": dict(lesson) if lesson else None,
                    "recommended_practice_challenge": dict(prob) if prob else None,
                    "estimated_revision_minutes": 15,
                    "reassessment_ready": True
                })

        return revision_feed

@router.post("/{assessment_id}/abandon")
def abandon_assessment(assessment_id: str, user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO assessment_results (
                id, learner_id, assessment_id, score, total_questions, percentage,
                passed, answers_json, feedback, status
            )
            VALUES (?, ?, ?, 0, 0, 0.0, 0, '{}', 'Assessment abandoned before completion. Session flagged as incomplete.', 'incomplete')
        """, (str(uuid.uuid4()), user_id, assessment_id))

        return {
            "status": "RECORDED",
            "message": "Incomplete assessment logged permanently in audit history."
        }

