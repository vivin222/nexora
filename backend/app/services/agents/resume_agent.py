"""
Resume & Portfolio Analysis Agent: Analyzes engineering resume text,
extracts technical skills, cross-checks against target career criteria,
and produces concrete, verifiable enhancement recommendations.
"""
from typing import Dict, Any, List
from app.database import get_db

KNOWN_TECH_KEYWORDS = {
    "python": "skill-python",
    "javascript": "skill-javascript",
    "typescript": "skill-typescript",
    "react": "skill-react",
    "node": "skill-nodejs",
    "nodejs": "skill-nodejs",
    "html": "skill-html-css",
    "css": "skill-html-css",
    "sql": "skill-sql",
    "docker": "skill-docker",
    "fastapi": "skill-fastapi",
    "git": "skill-git",
    "system design": "skill-system-design",
    "tailwind": "skill-tailwind"
}

class ResumeAgent:
    name = "ResumeAnalysisAgent"

    def analyze_resume_text(self, raw_text: str, career_id: str) -> Dict[str, Any]:
        text_lower = raw_text.lower()
        
        # 1. Detect skills in resume
        detected_skill_ids = set()
        for kw, s_id in KNOWN_TECH_KEYWORDS.items():
            if kw in text_lower:
                detected_skill_ids.add(s_id)

        # 2. Compare against target career requirements
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT csr.skill_id, csr.required_level, csr.importance_weight, s.name as skill_name
                FROM career_skill_requirements csr
                JOIN skills s ON csr.skill_id = s.id
                WHERE csr.career_id = ?
            """, (career_id,))
            requirements = [dict(r) for r in cursor.fetchall()]

            matched_skills = []
            missing_skills = []
            total_req_weight = 0.0
            matched_weight = 0.0

            for req in requirements:
                w = float(req.get("importance_weight", 1.0))
                total_req_weight += w
                if req["skill_id"] in detected_skill_ids:
                    matched_weight += w
                    matched_skills.append(req["skill_name"])
                else:
                    missing_skills.append(req["skill_name"])

            match_pct = round((matched_weight / max(1.0, total_req_weight)) * 100, 1)

            # Generate actionable feedback
            feedback_points = []
            if missing_skills:
                feedback_points.append(f"Add direct project evidence demonstrating **{', '.join(missing_skills[:3])}**.")
            feedback_points.append("Quantify architectural impact (e.g. latency reduction in ms, test coverage %, or queries optimized).")
            feedback_points.append("Include links to public GitHub repositories or deployed demonstration URLs for portfolio artifacts.")
            if "Docker" in missing_skills:
                feedback_points.append("Highlight containerization and deployment pipelines (Docker, CI/CD actions) to demonstrate production readiness.")

            return {
                "match_percentage": match_pct,
                "detected_skills": matched_skills,
                "missing_skills": missing_skills,
                "actionable_feedback": feedback_points,
                "summary": f"Resume matches {match_pct}% of core technical criteria for this role. {len(missing_skills)} key competencies lack explicit project evidence."
            }
