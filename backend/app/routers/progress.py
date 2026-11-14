from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.database import get_db
from app.routers.auth import get_current_user_id
from app.services.orchestrator import orchestrator

router = APIRouter(prefix="/progress", tags=["Progress Tracking"])

@router.get("")
def get_progress_overview(user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()

        # Ingest profile & skills
        profile_data = orchestrator.profile_agent.analyze(user_id)
        target_career_id = profile_data.get("target_career_id") or "career-full-stack-developer"

        # Gap analysis
        skill_analysis = orchestrator.skill_analysis_agent.analyze(profile_data.get("skill_map", {}), target_career_id)
        career_intel = orchestrator.career_agent.evaluate(target_career_id, skill_analysis["overall_score"], skill_analysis["detailed_gaps"])

        # Fetch roadmap progress
        cursor.execute("SELECT * FROM roadmaps WHERE learner_id = ? AND career_id = ?", (user_id, target_career_id))
        roadmap = cursor.fetchone()
        if roadmap:
            roadmap_total = roadmap["total_milestones"]
            roadmap_completed = roadmap["completed_milestones"]
            roadmap_pct = round((roadmap_completed / max(1, roadmap_total)) * 100, 1)
        else:
            roadmap_total = 0
            roadmap_completed = 0
            roadmap_pct = 0.0

        # Assessment performance
        cursor.execute("""
            SELECT ar.*, a.title as assessment_title
            FROM assessment_results ar
            JOIN assessments a ON ar.assessment_id = a.id
            WHERE ar.learner_id = ?
            ORDER BY ar.created_at DESC LIMIT 5
        """, (user_id,))
        recent_assessments = [dict(r) for r in cursor.fetchall()]

        # Activity timeline
        cursor.execute("""
            SELECT * FROM progress_records
            WHERE learner_id = ?
            ORDER BY created_at DESC LIMIT 10
        """, (user_id,))
        activity_events = [dict(e) for e in cursor.fetchall()]

        # Skill chart data (combines current vs required)
        chart_data = []
        for gap in skill_analysis["detailed_gaps"]:
            chart_data.append({
                "skill": gap["skill_name"],
                "current": gap["current_level"],
                "required": gap["required_level"],
                "gap": gap["gap"]
            })

        return {
            "career": career_intel,
            "overall_readiness_score": skill_analysis["overall_score"],
            "strengths_count": len(skill_analysis["strengths"]),
            "weaknesses_count": len(skill_analysis["weaknesses"]),
            "missing_count": len(skill_analysis["missing_skills"]),
            "roadmap_total": roadmap_total,
            "roadmap_completed": roadmap_completed,
            "roadmap_progress_percentage": roadmap_pct,
            "chart_data": chart_data,
            "recent_assessments": recent_assessments,
            "recent_activity": activity_events
        }
