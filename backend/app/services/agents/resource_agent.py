"""
Resource Agent: Recommends relevant learning materials, tutorials, and practical exercises.
"""
from typing import Dict, Any, List
from app.database import get_db

class ResourceAgent:
    name = "ResourceAgent"

    def recommend(self, skill_gaps: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Group recommendations by skill, prioritize based on importance and gap magnitude.
        """
        recommendations_by_skill = []
        with get_db() as conn:
            cursor = conn.cursor()

            for gap in skill_gaps:
                s_id = gap["skill_id"]
                s_name = gap["skill_name"]

                cursor.execute("""
                    SELECT * FROM learning_resources
                    WHERE skill_id = ?
                    ORDER BY is_free DESC, id ASC
                """, (s_id,))
                res_rows = [dict(r) for r in cursor.fetchall()]

                recommendations_by_skill.append({
                    "skill_id": s_id,
                    "skill_name": s_name,
                    "gap": gap["gap"],
                    "importance_weight": gap["importance_weight"],
                    "why_it_matters": gap.get("why_it_matters", ""),
                    "resources": res_rows
                })

        return {
            "total_skills_covered": len(recommendations_by_skill),
            "recommendations": recommendations_by_skill
        }
