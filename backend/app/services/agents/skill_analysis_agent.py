"""
Skill Analysis Agent: Identifies strengths, weaknesses, and missing competencies.
"""
from typing import Dict, Any, List
from app.database import get_db
from app.services.scoring import calculate_career_match

class SkillAnalysisAgent:
    name = "SkillAnalysisAgent"

    def analyze(self, learner_skills: Dict[str, int], career_id: str) -> Dict[str, Any]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT csr.skill_id, csr.required_level, csr.importance_weight, csr.why_it_matters, s.name as skill_name
                FROM career_skill_requirements csr
                JOIN skills s ON csr.skill_id = s.id
                WHERE csr.career_id = ?
            """, (career_id,))
            requirements = [dict(r) for r in cursor.fetchall()]

            analysis = calculate_career_match(learner_skills, requirements)

            summary_text = (
                f"Evaluated {len(requirements)} career competency requirements. "
                f"Identified {len(analysis['strengths'])} strengths, "
                f"{len(analysis['weaknesses'])} weaknesses, and "
                f"{len(analysis['missing_skills'])} missing competencies. "
                f"Overall readiness score: {analysis['overall_score']}%."
            )

            return {
                "career_id": career_id,
                "overall_score": analysis["overall_score"],
                "strengths": analysis["strengths"],
                "weaknesses": analysis["weaknesses"],
                "missing_skills": analysis["missing_skills"],
                "detailed_gaps": analysis["detailed_gaps"],
                "summary": summary_text
            }
