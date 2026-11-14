import uuid
import json
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from app.database import get_db
from app.routers.auth import get_current_user_id
from app.services.orchestrator import orchestrator

router = APIRouter(prefix="/interview", tags=["Career Interview Simulator"])

class StartSessionRequest(BaseModel):
    career_id: Optional[str] = None
    interview_type: str = "Technical"
    difficulty: str = "Intermediate"

class EvaluateAnswerRequest(BaseModel):
    session_id: Optional[str] = None
    question_id: str
    user_answer: str

@router.get("/questions")
def get_questions(career_id: Optional[str] = None, user_id: str = Depends(get_current_user_id)) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        c_id = career_id
        if not c_id:
            cursor.execute("SELECT target_career_id FROM profiles WHERE learner_id = ?", (user_id,))
            p = cursor.fetchone()
            c_id = p["target_career_id"] if p and p["target_career_id"] else "career-full-stack-developer"

        cursor.execute("SELECT * FROM interview_questions WHERE career_id = ? ORDER BY category ASC", (c_id,))
        return [dict(q) for q in cursor.fetchall()]

@router.post("/start")
def start_interview_session(req: StartSessionRequest, user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        c_id = req.career_id
        if not c_id:
            cursor.execute("SELECT target_career_id FROM profiles WHERE learner_id = ?", (user_id,))
            p = cursor.fetchone()
            c_id = p["target_career_id"] if p and p["target_career_id"] else "career-full-stack-developer"

        session_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO interview_sessions (id, learner_id, career_id, interview_type, difficulty)
            VALUES (?, ?, ?, ?, ?)
        """, (session_id, user_id, c_id, req.interview_type, req.difficulty))

        return {"session_id": session_id, "career_id": c_id, "status": "in_progress"}

@router.post("/evaluate")
def evaluate_answer(req: EvaluateAnswerRequest, user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT iq.*, c.title as career_title
            FROM interview_questions iq
            JOIN career_roles c ON iq.career_id = c.id
            WHERE iq.id = ?
        """, (req.question_id,))
        q = cursor.fetchone()
        if not q:
            raise HTTPException(status_code=404, detail="Question not found")

        # Evaluate via InterviewAgent
        eval_result = orchestrator.interview_agent.evaluate_response(
            q["question_text"],
            q["criteria_notes"],
            req.user_answer,
            q["career_title"]
        )

        sess_id = req.session_id
        if not sess_id:
            sess_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO interview_sessions (id, learner_id, career_id, interview_type, difficulty)
                VALUES (?, ?, ?, 'Technical', 'Intermediate')
            """, (sess_id, user_id, q["career_id"]))
        else:
            cursor.execute("SELECT id FROM interview_sessions WHERE id = ?", (sess_id,))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO interview_sessions (id, learner_id, career_id, interview_type, difficulty)
                    VALUES (?, ?, ?, 'Technical', 'Intermediate')
                """, (sess_id, user_id, q["career_id"]))

        ans_id = str(uuid.uuid4())

        cursor.execute("""
            INSERT INTO interview_answers (id, session_id, learner_id, question_id, user_answer_text, score, ai_feedback, strengths_json, improvements_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            ans_id, sess_id, user_id, req.question_id, req.user_answer,
            eval_result["score"], eval_result["ai_feedback"],
            json.dumps(eval_result["strengths"]), json.dumps(eval_result["improvements"])
        ))

        cursor.execute("""
            INSERT INTO progress_records (id, learner_id, event_type, description, metric_name, new_value)
            VALUES (?, ?, 'INTERVIEW_ANSWER_EVALUATED', ?, 'INTERVIEW_SCORE', ?)
        """, (str(uuid.uuid4()), user_id, f"Answered interview question in {q['category']}", eval_result["score"]))

        return {
            "answer_id": ans_id,
            "score": eval_result["score"],
            "ai_feedback": eval_result["ai_feedback"],
            "strengths": eval_result["strengths"],
            "improvements": eval_result["improvements"]
        }

@router.get("/history")
def get_interview_history(user_id: str = Depends(get_current_user_id)) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT ia.*, iq.question_text, iq.category as question_category
            FROM interview_answers ia
            JOIN interview_questions iq ON ia.question_id = iq.id
            WHERE ia.learner_id = ?
            ORDER BY ia.created_at DESC LIMIT 15
        """, (user_id,))
        records = [dict(r) for r in cursor.fetchall()]
        for r in records:
            r["strengths"] = json.loads(r["strengths_json"]) if r["strengths_json"] else []
            r["improvements"] = json.loads(r["improvements_json"]) if r["improvements_json"] else []
        return records
