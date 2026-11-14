import uuid
import json
from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from app.database import get_db
from app.routers.auth import get_current_user_id
from app.models.schemas import MentorChatRequest
from app.services.orchestrator import orchestrator
from app.services.ai_service import ai_service

router = APIRouter(prefix="/mentor", tags=["AI Career Mentor"])

@router.get("/history")
def get_mentor_history(user_id: str = Depends(get_current_user_id)) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM mentor_conversations
            WHERE learner_id = ?
            ORDER BY created_at ASC LIMIT 50
        """, (user_id,))
        return [dict(r) for r in cursor.fetchall()]

@router.post("/chat")
def chat_with_mentor(
    req: MentorChatRequest,
    user_id: str = Depends(get_current_user_id)
) -> Dict[str, Any]:
    # 1. Ingest full learner context for personalized mentoring
    profile = orchestrator.profile_agent.analyze(user_id)
    target_career_id = profile.get("target_career_id") or "career-full-stack-developer"
    skill_analysis = orchestrator.skill_analysis_agent.analyze(profile.get("skill_map", {}), target_career_id)
    career_intel = orchestrator.career_agent.evaluate(target_career_id, skill_analysis["overall_score"], skill_analysis["detailed_gaps"])

    # Recent assessment
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT a.title, ar.percentage, ar.passed
            FROM assessment_results ar
            JOIN assessments a ON ar.assessment_id = a.id
            WHERE ar.learner_id = ?
            ORDER BY ar.created_at DESC LIMIT 1
        """, (user_id,))
        last_asmt = cursor.fetchone()
        asmt_str = f"{last_asmt['title']} ({last_asmt['percentage']}%)" if last_asmt else "No assessments taken"

        # Check roadmap progress
        cursor.execute("SELECT completed_milestones, total_milestones FROM roadmaps WHERE learner_id = ? AND career_id = ?", (user_id, target_career_id))
        r_row = cursor.fetchone()
        roadmap_pct = round((r_row["completed_milestones"] / max(1, r_row["total_milestones"])) * 100, 1) if r_row else 0.0

        # Save user message
        user_msg_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO mentor_conversations (id, learner_id, sender, message)
            VALUES (?, ?, 'user', ?)
        """, (user_msg_id, user_id, req.message))

        # Recent conversation history
        cursor.execute("""
            SELECT sender, message FROM mentor_conversations
            WHERE learner_id = ?
            ORDER BY created_at DESC LIMIT 6
        """, (user_id,))
        history = [{"sender": r["sender"], "message": r["message"]} for r in cursor.fetchall()]
        history.reverse()

    learner_context = {
        "name": profile.get("full_name", "Learner"),
        "target_career_title": career_intel.get("title", "Full Stack Developer"),
        "match_score": skill_analysis["overall_score"],
        "strengths": [s["skill_name"] for s in skill_analysis["strengths"]],
        "skill_gaps": [g["skill_name"] for g in skill_analysis["detailed_gaps"] if g["status"] in ("missing", "weak")],
        "roadmap_progress": roadmap_pct,
        "recent_assessment": asmt_str
    }

    # Generate response via AI Service (Gemini API or Deterministic Engine fallback)
    mentor_reply = ai_service.generate_mentor_response(req.message, learner_context, history)

    # Save mentor response
    with get_db() as conn:
        cursor = conn.cursor()
        mentor_msg_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO mentor_conversations (id, learner_id, sender, message, metadata_json)
            VALUES (?, ?, 'mentor', ?, ?)
        """, (mentor_msg_id, user_id, mentor_reply["content"], json.dumps({
            "model": mentor_reply["model"],
            "source": mentor_reply["source"],
            "status": mentor_reply["status"]
        })))

    return {
        "id": mentor_msg_id,
        "sender": "mentor",
        "message": mentor_reply["content"],
        "metadata": {
            "model": mentor_reply["model"],
            "source": mentor_reply["source"],
            "status": mentor_reply["status"],
            "is_ai_live": ai_service.is_ai_live()
        }
    }

@router.get("/proactive-advice")
def get_proactive_advice(user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        # Fetch profile
        cursor.execute("SELECT l.full_name, p.target_career_id FROM learners l LEFT JOIN profiles p ON l.id = p.learner_id WHERE l.id = ?", (user_id,))
        p = cursor.fetchone()
        full_name = p["full_name"] if p and p["full_name"] else "Learner"
        career_id = p["target_career_id"] if p and p["target_career_id"] else "career-full-stack-developer"

        # Career title
        cursor.execute("SELECT title FROM career_roles WHERE id = ?", (career_id,))
        c = cursor.fetchone()
        career_title = c["title"] if c else "Software Engineer"

        # Top verified skill
        cursor.execute("""
            SELECT s.name as skill_name, ls.proficiency
            FROM learner_skills ls
            JOIN skills s ON ls.skill_id = s.id
            WHERE ls.learner_id = ? AND ls.verified = 1
            ORDER BY ls.proficiency DESC LIMIT 1
        """, (user_id,))
        top_skill = cursor.fetchone()
        top_skill_name = top_skill["skill_name"] if top_skill else "Foundational Programming"

        # Critical gap
        cursor.execute("""
            SELECT s.name as skill_name, csr.required_level, COALESCE(ls.proficiency, 20) as prof
            FROM career_skill_requirements csr
            JOIN skills s ON csr.skill_id = s.id
            LEFT JOIN learner_skills ls ON ls.learner_id = ? AND ls.skill_id = csr.skill_id
            WHERE csr.career_id = ?
            ORDER BY (csr.required_level - (COALESCE(ls.proficiency, 20) / 20.0)) DESC LIMIT 1
        """, (user_id, career_id))
        gap = cursor.fetchone()
        gap_name = gap["skill_name"] if gap else "System Architecture"

        # Active mission
        cursor.execute("""
            SELECT objective, estimated_duration, action_type
            FROM weekly_missions
            WHERE learner_id = ? AND status = 'active'
            ORDER BY created_at DESC LIMIT 1
        """, (user_id,))
        m = cursor.fetchone()

        advice_text = (
            f"Hi {full_name.split()[0]}! You've verified solid competency in {top_skill_name}. "
            f"To accelerate your progress toward {career_title}, your highest-leverage priority right now is mastering {gap_name}. "
            f"{'Your active sprint mission: ' + m['objective'] + ' (' + m['estimated_duration'] + ').' if m else 'Ready to launch a targeted practice sprint?'}"
        )

        return {
            "mode": "proactive",
            "career_target": career_title,
            "top_strength": top_skill_name,
            "critical_gap": gap_name,
            "active_mission": dict(m) if m else None,
            "proactive_advice": advice_text,
            "suggested_action": "Launch Targeted Gap Sprint",
            "generated_at": "Live Database Intelligence"
        }

