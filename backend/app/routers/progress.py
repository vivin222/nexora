import datetime
from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from app.database import get_db
from app.routers.auth import get_current_user_id
from app.services.orchestrator import orchestrator

router = APIRouter(prefix="/progress", tags=["Progress Tracking"])

def compute_learner_streak(cursor, learner_id: str) -> Dict[str, Any]:
    # Fetch distinct dates of genuine cognitive activity
    cursor.execute("""
        SELECT DISTINCT substr(completed_at, 1, 10) as act_date
        FROM lesson_progress
        WHERE learner_id = ? AND completed = 1 AND completed_at IS NOT NULL
        UNION
        SELECT DISTINCT substr(created_at, 1, 10) as act_date
        FROM coding_submissions
        WHERE learner_id = ? AND status = 'passed' AND created_at IS NOT NULL
        UNION
        SELECT DISTINCT substr(created_at, 1, 10) as act_date
        FROM project_submissions
        WHERE learner_id = ? AND created_at IS NOT NULL
        UNION
        SELECT DISTINCT substr(created_at, 1, 10) as act_date
        FROM assessment_results
        WHERE learner_id = ? AND created_at IS NOT NULL
    """, (learner_id, learner_id, learner_id, learner_id))
    rows = cursor.fetchall()
    active_dates = set(r[0] for r in rows if r[0])

    today = datetime.date.today()
    
    # Check consecutive days backward from today or yesterday
    streak = 0
    check_date = today
    if check_date.isoformat() not in active_dates:
        check_date = today - datetime.timedelta(days=1)
        
    while check_date.isoformat() in active_dates:
        streak += 1
        check_date -= datetime.timedelta(days=1)

    longest = max(streak, 3)

    # Weekly 7-day dots (Monday through Sunday)
    monday = today - datetime.timedelta(days=today.weekday())
    day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    week_dots = []
    for i in range(7):
        d = monday + datetime.timedelta(days=i)
        d_str = d.isoformat()
        is_active = d_str in active_dates
        is_today = d == today
        week_dots.append({
            "day": day_names[i],
            "day_short": day_names[i][0],
            "date": d_str,
            "active": is_active,
            "is_today": is_today
        })

    # Sync back to weekly_goals table if exists
    try:
        cursor.execute("""
            UPDATE weekly_goals
            SET streak_days = ?
            WHERE learner_id = ?
        """, (max(1, streak), learner_id))
    except Exception:
        pass

    return {
        "active_streak_days": max(1, streak),
        "longest_streak_days": longest,
        "week_dots": week_dots,
        "today_active": today.isoformat() in active_dates,
        "streak_freeze_available": True,
        "recovery_mission": {
            "title": "Pass 1 Algorithmic Challenge in Lab to preserve streak",
            "estimated_minutes": 15,
            "target_tab": "coding-lab"
        },
        "qualifying_actions": [
            "Completed module lessons in Learning Center",
            "Passed automated tests in Coding Practice Lab",
            "Delivered milestone in Project Studio",
            "Completed technical assessment quiz"
        ]
    }

def compute_next_best_action(cursor, learner_id: str, career_intel: Dict[str, Any], skill_analysis: Dict[str, Any]) -> Dict[str, Any]:
    critical_gaps = skill_analysis.get("missing_skills", []) + skill_analysis.get("weaknesses", [])
    career_title = career_intel.get("title", "Target Career")
    
    if critical_gaps:
        top_gap = critical_gaps[0]
        skill_name = top_gap.get("skill_name", "Core Technology")
        gap_pct = top_gap.get("gap_percentage", 25)
        
        # Check if there is an uncompleted lesson for this skill
        cursor.execute("""
            SELECT cl.id, cl.title, cl.estimated_minutes
            FROM course_lessons cl
            JOIN course_modules cm ON cl.module_id = cm.id
            JOIN courses c ON cm.course_id = c.id
            LEFT JOIN lesson_progress lp ON cl.id = lp.lesson_id AND lp.learner_id = ?
            WHERE c.skill_id = ? AND (lp.completed IS NULL OR lp.completed = 0)
            ORDER BY cm.order_index ASC, cl.order_index ASC
            LIMIT 1
        """, (learner_id, top_gap["skill_id"]))
        lesson_row = cursor.fetchone()
        
        if lesson_row:
            return {
                "task_title": f"Master {skill_name}: {lesson_row['title']}",
                "focus_skill": skill_name,
                "direct_rationale": f"Bridging this deficit resolves your #1 blocker for {career_title} (+{min(18, int(gap_pct * 0.4))}% Career Readiness).",
                "estimated_time": f"{lesson_row['estimated_minutes']} minutes",
                "action_type": "lesson",
                "target_tab": "learning",
                "target_id": lesson_row["id"],
                "impact_badge": f"+{min(18, int(gap_pct * 0.4))}% Readiness"
            }

        # Otherwise check coding challenge
        cursor.execute("""
            SELECT cp.id, cp.title, cp.difficulty
            FROM coding_problems cp
            LEFT JOIN coding_submissions cs ON cp.id = cs.problem_id AND cs.learner_id = ? AND cs.status = 'passed'
            WHERE cp.skill_id = ? AND cs.id IS NULL
            LIMIT 1
        """, (learner_id, top_gap["skill_id"]))
        problem_row = cursor.fetchone()
        if problem_row:
            return {
                "task_title": f"Verify {skill_name} in Practice Lab: {problem_row['title']}",
                "focus_skill": skill_name,
                "direct_rationale": f"Validating automated tests in {problem_row['difficulty']} challenge proves hands-on mastery for {career_title}.",
                "estimated_time": "20 minutes",
                "action_type": "coding_lab",
                "target_tab": "coding-lab",
                "target_id": problem_row["id"],
                "impact_badge": "+15% Verification"
            }

        # Otherwise fallback to roadmap milestone
        return {
            "task_title": f"Advance Milestone: Deep-Dive {skill_name} Architecture",
            "focus_skill": skill_name,
            "direct_rationale": f"Resolving your competency gap in {skill_name} brings you closer to placement readiness.",
            "estimated_time": "30 minutes",
            "action_type": "roadmap",
            "target_tab": "roadmap",
            "target_id": top_gap["skill_id"],
            "impact_badge": "+12% Readiness"
        }

    return {
        "task_title": "Run Full Technical Mock Interview Simulation",
        "focus_skill": "Interview Mastery",
        "direct_rationale": f"All baseline skill competencies are meeting criteria for {career_title}! Test your technical communication with AI.",
        "estimated_time": "20 minutes",
        "action_type": "interview",
        "target_tab": "interview-sim",
        "target_id": "interview",
        "impact_badge": "Placement Polish"
    }

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

        # Skill chart data
        chart_data = []
        for gap in skill_analysis["detailed_gaps"]:
            chart_data.append({
                "skill": gap["skill_name"],
                "current": gap["current_level"],
                "required": gap["required_level"],
                "gap": gap["gap"]
            })

        # Calculate Genuine Cognitive Streak
        streak_data = compute_learner_streak(cursor, user_id)

        # Calculate Next Best Action Hero
        next_action = compute_next_best_action(cursor, user_id, career_intel, skill_analysis)

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
            "recent_activity": activity_events,
            "learning_streak": streak_data,
            "next_best_action": next_action
        }
