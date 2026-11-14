"""
Career Intelligence Agent: Evaluates career requirements and learner compatibility.
"""
from typing import Dict, Any, List
from app.database import get_db

class CareerIntelligenceAgent:
    name = "CareerIntelligenceAgent"

    def evaluate(self, career_id: str, match_score: float, detailed_gaps: List[Dict[str, Any]]) -> Dict[str, Any]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM career_roles WHERE id = ?", (career_id,))
            career = cursor.fetchone()
            if not career:
                return {"error": "Career role not found"}

            # Compute category readiness
            readiness_band = "Ready" if match_score >= 80 else ("Near Ready" if match_score >= 60 else "Developing")
            
            top_blockers = [g["skill_name"] for g in detailed_gaps if g["status"] in ("missing", "weak")][:3]

            strategic_advice = (
                f"For {career['title']}, market demand is {career['growth_outlook']}. "
                f"Your readiness score stands at {match_score}%. "
                f"Critical blockers to focus on: {', '.join(top_blockers) if top_blockers else 'None, ready for placement'}."
            )

            return {
                "career_id": career["id"],
                "title": career["title"],
                "category": career["category"],
                "average_salary": career["average_salary"],
                "growth_outlook": career["growth_outlook"],
                "difficulty_level": career["difficulty_level"],
                "match_score": match_score,
                "readiness_band": readiness_band,
                "strategic_advice": strategic_advice,
                "top_blockers": top_blockers
            }
