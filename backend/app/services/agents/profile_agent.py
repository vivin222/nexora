"""
Profile Agent: Understands learner profile, skills, education, projects, and goals.
"""
import json
from typing import Dict, Any
from app.database import get_db

class ProfileAgent:
    name = "ProfileAgent"

    def analyze(self, learner_id: str) -> Dict[str, Any]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM learners WHERE id = ?", (learner_id,))
            learner = cursor.fetchone()
            if not learner:
                return {"error": "Learner not found"}

            cursor.execute("SELECT * FROM profiles WHERE learner_id = ?", (learner_id,))
            profile = cursor.fetchone()

            cursor.execute("""
                SELECT ls.skill_id, ls.proficiency, ls.verified, s.name, s.category
                FROM learner_skills ls
                JOIN skills s ON ls.skill_id = s.id
                WHERE ls.learner_id = ?
            """, (learner_id,))
            skills = [dict(row) for row in cursor.fetchall()]

            interests = json.loads(profile["interests"]) if profile and profile["interests"] else []
            certifications = json.loads(profile["certifications"]) if profile and profile["certifications"] else []
            projects = json.loads(profile["projects"]) if profile and profile["projects"] else []

            skill_dict = {s["skill_id"]: s["proficiency"] for s in skills}

            return {
                "learner_id": learner_id,
                "full_name": learner["full_name"],
                "email": learner["email"],
                "headline": learner["headline"],
                "education": profile["education"] if profile else "",
                "bio": profile["bio"] if profile else "",
                "target_career_id": profile["target_career_id"] if profile else "",
                "current_level": profile["current_level"] if profile else "Intermediate",
                "interests": interests,
                "certifications": certifications,
                "projects": projects,
                "skills": skills,
                "skill_map": skill_dict
            }
