"""
NEXORA Deterministic Scoring Engine.
Calculates mathematically rigorous, reproducible career readiness,
skill gap analysis, strengths, weaknesses, and missing competencies.
"""
from typing import Dict, List, Any

def calculate_career_match(
    learner_skills: Dict[str, int], # {skill_id: proficiency_0_to_100}
    career_requirements: List[Dict[str, Any]] # [{skill_id, required_level, importance_weight, skill_name, why_it_matters}]
) -> Dict[str, Any]:
    if not career_requirements:
        return {
            "overall_score": 0.0,
            "strengths": [],
            "weaknesses": [],
            "missing_skills": [],
            "detailed_gaps": []
        }

    total_weight = 0.0
    weighted_achievement = 0.0
    strengths = []
    weaknesses = []
    missing_skills = []
    detailed_gaps = []

    for req in career_requirements:
        s_id = req["skill_id"]
        s_name = req.get("skill_name", s_id)
        required_level = float(req["required_level"])
        weight = float(req.get("importance_weight", 1.0))
        why = req.get("why_it_matters", "")

        total_weight += weight
        current_level = float(learner_skills.get(s_id, 0))

        # Skill ratio (capped at 1.0 so surplus in one skill doesn't obscure gap in another)
        ratio = min(1.0, current_level / max(1.0, required_level))
        weighted_achievement += (ratio * weight)

        gap = max(0.0, required_level - current_level)
        gap_percentage = round((gap / required_level) * 100, 1)

        status = "missing" if current_level == 0 else ("strong" if gap <= 5 else "weak")

        gap_info = {
            "skill_id": s_id,
            "skill_name": s_name,
            "current_level": int(current_level),
            "required_level": int(required_level),
            "importance_weight": weight,
            "gap": int(gap),
            "gap_percentage": gap_percentage,
            "why_it_matters": why,
            "status": status
        }
        detailed_gaps.append(gap_info)

        if current_level == 0:
            missing_skills.append(gap_info)
        elif gap <= 5:
            strengths.append(gap_info)
        else:
            weaknesses.append(gap_info)

    overall_score = round((weighted_achievement / max(1.0, total_weight)) * 100, 1)

    # Sort gaps by importance weight descending then gap descending
    detailed_gaps.sort(key=lambda x: (x["importance_weight"], x["gap"]), reverse=True)
    missing_skills.sort(key=lambda x: x["importance_weight"], reverse=True)
    weaknesses.sort(key=lambda x: (x["importance_weight"], x["gap"]), reverse=True)
    strengths.sort(key=lambda x: x["current_level"], reverse=True)

    return {
        "overall_score": overall_score,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "missing_skills": missing_skills,
        "detailed_gaps": detailed_gaps
    }
