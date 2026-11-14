"""
Profile Agent: Ingests learner profile, skills, education, academic background,
projects, and ambitions into a unified baseline knowledge graph.
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
            preferences = json.loads(profile["learning_preferences"]) if profile and "learning_preferences" in profile.keys() and profile["learning_preferences"] else []

            skill_dict = {s["skill_id"]: s["proficiency"] for s in skills}

            return {
                "learner_id": learner_id,
                "full_name": learner["full_name"],
                "email": learner["email"],
                "headline": learner["headline"],
                "is_demo": bool(learner["is_demo"]) if "is_demo" in learner.keys() else (learner_id == "learner-alex-mercer"),
                "education": profile["education"] if profile else "",
                "institution": profile["institution"] if profile and "institution" in profile.keys() else "",
                "department": profile["department"] if profile and "department" in profile.keys() else "",
                "academic_year": profile["academic_year"] if profile and "academic_year" in profile.keys() else "",
                "bio": profile["bio"] if profile else "",
                "target_career_id": profile["target_career_id"] if profile else "career-full-stack-developer",
                "current_level": profile["current_level"] if profile else "Intermediate",
                "github_url": profile["github_url"] if profile and "github_url" in profile.keys() else "",
                "portfolio_url": profile["portfolio_url"] if profile and "portfolio_url" in profile.keys() else "",
                "weekly_hours": profile["weekly_hours"] if profile and "weekly_hours" in profile.keys() else 10,
                "learning_preferences": preferences,
                "short_term_goal": profile["short_term_goal"] if profile and "short_term_goal" in profile.keys() else "",
                "long_term_goal": profile["long_term_goal"] if profile and "long_term_goal" in profile.keys() else "",
                "onboarding_completed": bool(profile["onboarding_completed"]) if profile and "onboarding_completed" in profile.keys() else (learner_id == "learner-alex-mercer"),
                "interests": interests,
                "certifications": certifications,
                "projects": projects,
                "skills": skills,
                "skill_map": skill_dict
            }