"""
Learning Agent: Recommends structured courses, modules, and topic-wise lessons
aligned directly with the learner's identified skill gaps and active career milestones.
"""
from typing import Dict, Any, List
from app.database import get_db

class LearningAgent:
    name = "LearningAgent"

    def recommend_courses(self, learner_id: str, skill_gaps: List[Dict[str, Any]]) -> Dict[str, Any]:
        gap_skill_ids = [g["skill_id"] for g in skill_gaps if g["status"] in ("missing", "weak")]

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM courses ORDER BY difficulty_level ASC")
            all_courses = [dict(c) for c in cursor.fetchall()]

            recommended = []
            other = []

            for c in all_courses:
                # Count modules & lessons
                cursor.execute("SELECT COUNT(*) as lcount FROM course_lessons WHERE course_id = ?", (c["id"],))
                c["lesson_count"] = cursor.fetchone()["lcount"]

                # Check completion
                cursor.execute("""
                    SELECT COUNT(*) as comp FROM lesson_progress
                    WHERE learner_id = ? AND course_id = ? AND completed = 1
                """, (learner_id, c["id"]))
                c["completed_lessons"] = cursor.fetchone()["comp"]
                c["progress_percentage"] = round((c["completed_lessons"] / max(1, c["lesson_count"])) * 100, 1)

                if c["skill_id"] in gap_skill_ids:
                    c["priority_reason"] = "Directly targets active career competency deficit."
                    recommended.append(c)
                else:
                    c["priority_reason"] = "General mastery & cross-functional depth."
                    other.append(c)

            return {
                "high_priority_courses": recommended,
                "elective_courses": other,
                "total_available": len(all_courses)
            }
