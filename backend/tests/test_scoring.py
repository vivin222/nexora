import pytest
import sys
from pathlib import Path

# Add backend to sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.scoring import calculate_career_match

def test_career_match_calculation():
    learner_skills = {
        "skill-python": 75,
        "skill-sql": 70,
        "skill-html-css": 40
    }

    requirements = [
        {"skill_id": "skill-javascript", "skill_name": "JavaScript", "required_level": 85, "importance_weight": 5.0, "why_it_matters": "Core"},
        {"skill_id": "skill-react", "skill_name": "React", "required_level": 80, "importance_weight": 4.5, "why_it_matters": "Frontend"},
        {"skill_id": "skill-python", "skill_name": "Python", "required_level": 75, "importance_weight": 4.0, "why_it_matters": "Backend"},
        {"skill_id": "skill-sql", "skill_name": "SQL", "required_level": 80, "importance_weight": 4.5, "why_it_matters": "Database"}
    ]

    result = calculate_career_match(learner_skills, requirements)

    assert "overall_score" in result
    assert result["overall_score"] > 0
    assert len(result["missing_skills"]) == 2  # JS and React missing
    assert any(s["skill_id"] == "skill-python" for s in result["strengths"])
    assert any(w["skill_id"] == "skill-sql" for w in result["weaknesses"])
