import uuid
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.database import get_db
from app.routers.auth import get_current_user_id

router = APIRouter(prefix="/missions", tags=["AI Weekly Missions"])

class VerifyMissionRequest(BaseModel):
    mission_id: str

@router.get("")
def get_weekly_missions(user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()

        # Get learner profile for weekly hours and target career
        cursor.execute("SELECT weekly_hours, target_career_id FROM profiles WHERE learner_id = ?", (user_id,))
        p_row = cursor.fetchone()
        weekly_hours = p_row["weekly_hours"] if p_row and p_row["weekly_hours"] else 10
        career_id = p_row["target_career_id"] if p_row and p_row["target_career_id"] else "career-full-stack-developer"

        # Check existing active missions
        cursor.execute("""
            SELECT * FROM weekly_missions 
            WHERE learner_id = ? 
            ORDER BY created_at DESC 
            LIMIT 6
        """, (user_id,))
        existing_missions = [dict(m) for m in cursor.fetchall()]

        if not existing_missions:
            # Calibrate mission count based on weekly hours commitment
            if weekly_hours <= 5:
                mission_count = 2
            elif weekly_hours <= 12:
                mission_count = 3
            else:
                mission_count = 4

            # Fetch skill requirements and gaps for active target career
            cursor.execute("""
                SELECT csr.skill_id, s.name as skill_name, csr.required_level,
                       COALESCE(ls.proficiency, 20) as current_level
                FROM career_skill_requirements csr
                JOIN skills s ON csr.skill_id = s.id
                LEFT JOIN learner_skills ls ON ls.learner_id = ? AND ls.skill_id = csr.skill_id
                WHERE csr.career_id = ?
                ORDER BY (csr.required_level - (COALESCE(ls.proficiency, 20) / 20.0)) DESC
                LIMIT ?
            """, (user_id, career_id, mission_count))
            gap_skills = [dict(r) for r in cursor.fetchall()]

            if not gap_skills:
                # Fallback to any core skills if no requirements found
                cursor.execute("SELECT id as skill_id, name as skill_name, 3.0 as required_level, 20 as current_level FROM skills LIMIT ?", (mission_count,))
                gap_skills = [dict(r) for r in cursor.fetchall()]

            # Generate tailored mission for each gap skill
            for idx, skill in enumerate(gap_skills):
                s_id = skill["skill_id"]
                s_name = skill["skill_name"]
                m_id = str(uuid.uuid4())

                # Rotate action types
                if idx % 3 == 0:
                    # Coding challenge
                    cursor.execute("SELECT slug, title FROM coding_problems WHERE skill_id = ? LIMIT 1", (s_id,))
                    problem = cursor.fetchone()
                    if problem:
                        obj = f"Solve & Pass Algorithmic Challenge: '{problem['title']}'"
                        duration = "45 mins"
                        diff = "Intermediate"
                        action_type = "coding_lab"
                        target_slug = problem["slug"]
                        crit = "Pass all automated unit tests in the Practice Lab"
                    else:
                        obj = f"Master Core Concepts & Syntax: {s_name}"
                        duration = "1.0 hour"
                        diff = "Beginner"
                        action_type = "lesson"
                        target_slug = s_id
                        crit = "Complete course module with verified quiz passage"
                elif idx % 3 == 1:
                    # Workplace Simulator
                    cursor.execute("SELECT id, title FROM workplace_scenarios WHERE target_skill_id = ? LIMIT 1", (s_id,))
                    scenario = cursor.fetchone()
                    if scenario:
                        obj = f"Workplace Incident Simulation: '{scenario['title']}'"
                        duration = "1.5 hours"
                        diff = "Advanced"
                        action_type = "simulator"
                        target_slug = scenario["id"]
                        crit = "Analyze production evidence and achieve >= 70% on architectural rubric"
                    else:
                        obj = f"Architect Practical Solution for {s_name}"
                        duration = "1.5 hours"
                        diff = "Intermediate"
                        action_type = "coding_lab"
                        target_slug = "two-sum"
                        crit = "Pass unit tests and optimize runtime complexity"
                else:
                    # Interactive lesson
                    cursor.execute("SELECT id, title FROM courses WHERE skill_id = ? LIMIT 1", (s_id,))
                    course = cursor.fetchone()
                    if course:
                        obj = f"Complete Interactive Course Module: '{course['title']}'"
                        duration = "1.0 hour"
                        diff = "Intermediate"
                        action_type = "lesson"
                        target_slug = course["id"]
                        crit = "Read lesson material and complete interactive exercise"
                    else:
                        obj = f"Deep Dive Technical Foundations in {s_name}"
                        duration = "1.2 hours"
                        diff = "Intermediate"
                        action_type = "lesson"
                        target_slug = s_id
                        crit = "Complete comprehensive module review"

                cursor.execute("""
                    INSERT INTO weekly_missions (
                        id, learner_id, objective, estimated_duration, difficulty,
                        target_skill_id, target_skill_name, completion_criteria,
                        action_type, action_target_slug, status
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
                """, (m_id, user_id, obj, duration, diff, s_id, s_name, crit, action_type, target_slug))

            cursor.execute("""
                SELECT * FROM weekly_missions 
                WHERE learner_id = ? 
                ORDER BY created_at DESC 
                LIMIT ?
            """, (user_id, mission_count))
            existing_missions = [dict(m) for m in cursor.fetchall()]

        total_count = len(existing_missions)
        completed_count = sum(1 for m in existing_missions if m["status"] == "completed")
        completion_pct = round((completed_count / max(1, total_count)) * 100, 1)

        return {
            "missions": existing_missions,
            "weekly_hours_allocated": weekly_hours,
            "total_missions": total_count,
            "completed_missions": completed_count,
            "completion_percentage": completion_pct
        }

@router.post("/{mission_id}/verify")
def verify_mission_completion(mission_id: str, user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM weekly_missions WHERE id = ? AND learner_id = ?", (mission_id, user_id))
        mission = cursor.fetchone()

        if not mission:
            raise HTTPException(status_code=404, detail="Mission not found")

        m_dict = dict(mission)
        if m_dict["status"] == "completed":
            return {
                "verified": True,
                "status": "completed",
                "message": "Mission has already been verified and completed.",
                "mission_id": mission_id
            }

        action_type = m_dict["action_type"]
        target_slug = m_dict["action_target_slug"]
        verified = False
        evidence_summary = ""

        if action_type == "coding_lab":
            # Check if there is a passing submission for this problem
            cursor.execute("""
                SELECT cs.* FROM coding_submissions cs
                JOIN coding_problems cp ON cs.problem_id = cp.id
                WHERE cs.learner_id = ? AND (cp.slug = ? OR cp.id = ?) AND cs.status = 'PASSED'
                ORDER BY cs.created_at DESC LIMIT 1
            """, (user_id, target_slug, target_slug))
            sub = cursor.fetchone()
            if sub:
                verified = True
                evidence_summary = f"Verified: Passed all {sub['passed_tests']}/{sub['total_tests']} unit tests."
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Verification Failed: No passed test submission found in Practice Lab. You must solve the challenge and pass all tests to complete this mission."
                )

        elif action_type == "simulator":
            # Check if there is a passing simulation submission (score >= 70)
            cursor.execute("""
                SELECT * FROM workplace_scenario_submissions
                WHERE learner_id = ? AND scenario_id = ? AND score >= 70
                ORDER BY created_at DESC LIMIT 1
            """, (user_id, target_slug))
            sim_sub = cursor.fetchone()
            if sim_sub:
                verified = True
                evidence_summary = f"Verified: Achieved {sim_sub['score']}/100 on workplace scenario rubric."
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Verification Failed: No passing scenario submission (>=70%) found. Review the workplace telemetry and submit your architectural decision."
                )

        elif action_type == "lesson":
            # Check if lesson or course progress is completed
            cursor.execute("""
                SELECT * FROM lesson_progress
                WHERE learner_id = ? AND (lesson_id = ? OR course_id = ?) AND completed = 1
                LIMIT 1
            """, (user_id, target_slug, target_slug))
            lp = cursor.fetchone()
            if lp:
                verified = True
                evidence_summary = "Verified: Interactive lesson completed with knowledge verification."
            else:
                # Also check if any lesson was completed this week
                cursor.execute("SELECT * FROM lesson_progress WHERE learner_id = ? AND completed = 1 LIMIT 1", (user_id,))
                any_lp = cursor.fetchone()
                if any_lp:
                    verified = True
                    evidence_summary = "Verified: Course lesson completed."
                else:
                    raise HTTPException(
                        status_code=400,
                        detail="Verification Failed: Course lesson has not been completed. Work through the lesson module to earn completion credit."
                    )
        else:
            # Check project submissions
            cursor.execute("SELECT * FROM project_submissions WHERE learner_id = ? LIMIT 1", (user_id,))
            p_sub = cursor.fetchone()
            if p_sub:
                verified = True
                evidence_summary = "Verified: Practical project milestone submitted."
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Verification Failed: No project milestone submission found in Project Studio."
                )

        if verified:
            cursor.execute("""
                UPDATE weekly_missions
                SET status = 'completed', completed_at = CURRENT_TIMESTAMP, evidence_summary = ?
                WHERE id = ?
            """, (evidence_summary, mission_id))

            # Update weekly goals counter
            cursor.execute("""
                UPDATE weekly_goals
                SET completed_lessons = completed_lessons + 1, completed_hours = completed_hours + 1.0, updated_at = CURRENT_TIMESTAMP
                WHERE learner_id = ?
            """, (user_id,))

            # Log to activity timeline
            cursor.execute("""
                INSERT INTO activity_timeline (id, learner_id, event_type, title, description, category)
                VALUES (?, ?, 'MISSION_COMPLETED', ?, ?, 'missions')
            """, (str(uuid.uuid4()), user_id, f"Completed Mission: {m_dict['objective']}", evidence_summary))

            return {
                "verified": True,
                "status": "completed",
                "message": "Mission successfully verified with real academic proof!",
                "evidence_summary": evidence_summary,
                "mission_id": mission_id
            }
