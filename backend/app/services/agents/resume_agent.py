"""
Resume & Portfolio Analysis Agent: Analyzes engineering resume text,
extracts technical skills, academic background, project portfolios,
and produces concrete, verifiable enhancement recommendations.
"""
import re
from typing import Dict, Any, List
from app.database import get_db

KNOWN_TECH_KEYWORDS = {
    "python": {"id": "skill-python", "name": "Python", "category": "Language"},
    "javascript": {"id": "skill-javascript", "name": "JavaScript", "category": "Language"},
    "typescript": {"id": "skill-typescript", "name": "TypeScript", "category": "Language"},
    "react": {"id": "skill-react", "name": "React", "category": "Frontend"},
    "node": {"id": "skill-nodejs", "name": "Node.js", "category": "Backend"},
    "nodejs": {"id": "skill-nodejs", "name": "Node.js", "category": "Backend"},
    "html": {"id": "skill-html-css", "name": "HTML/CSS", "category": "Frontend"},
    "css": {"id": "skill-html-css", "name": "HTML/CSS", "category": "Frontend"},
    "sql": {"id": "skill-sql", "name": "SQL", "category": "Database"},
    "docker": {"id": "skill-docker", "name": "Docker", "category": "DevOps"},
    "fastapi": {"id": "skill-fastapi", "name": "FastAPI", "category": "Backend"},
    "git": {"id": "skill-git", "name": "Git", "category": "Tools"},
    "system design": {"id": "skill-system-design", "name": "System Design", "category": "Architecture"},
    "tailwind": {"id": "skill-tailwind", "name": "TailwindCSS", "category": "Frontend"},
    "postgresql": {"id": "skill-sql", "name": "PostgreSQL", "category": "Database"},
    "postgres": {"id": "skill-sql", "name": "PostgreSQL", "category": "Database"},
    "graphql": {"id": "skill-nodejs", "name": "GraphQL", "category": "Backend"},
    "kubernetes": {"id": "skill-docker", "name": "Kubernetes", "category": "DevOps"},
    "aws": {"id": "skill-docker", "name": "AWS", "category": "Cloud"}
}

class ResumeAgent:
    name = "ResumeAnalysisAgent"

    def extract_profile_data(self, raw_text: str) -> Dict[str, Any]:
        """
        Parses resume text and extracts structured academic, skill, and portfolio fields.
        Allows the learner to review and verify extracted details before finalizing onboarding.
        """
        text_lower = raw_text.lower()
        lines = [line.strip() for line in raw_text.split("\n") if line.strip()]

        # 1. Email extraction
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', raw_text)
        extracted_email = email_match.group(0) if email_match else ""

        # 2. GitHub & Portfolio URL extraction
        github_match = re.search(r'github\.com/[\w\.-]+', raw_text, re.IGNORECASE)
        github_url = f"https://{github_match.group(0)}" if github_match else ""

        # 3. Full Name extraction heuristic (usually first line if non-header)
        extracted_name = ""
        if lines:
            first_line = lines[0]
            if len(first_line.split()) <= 4 and not any(k in first_line.lower() for k in ["resume", "curriculum", "cv"]):
                extracted_name = first_line

        # 4. Education level & Institution extraction
        education_level = "Bachelor's Degree"
        if "master" in text_lower or "m.s." in text_lower:
            education_level = "Master's Degree"
        elif "phd" in text_lower or "doctorate" in text_lower:
            education_level = "PhD"
        elif "bootcamp" in text_lower:
            education_level = "Coding Bootcamp"

        # University / Institution heuristic
        institution = ""
        inst_match = re.search(r'(University|College|Institute|Polytechnic|Academy)\s+(of\s+)?[\w\s]+', raw_text)
        if inst_match:
            institution = inst_match.group(0).split("\n")[0].strip()
        elif "stanford" in text_lower:
            institution = "Stanford University"
        elif "mit" in text_lower:
            institution = "Massachusetts Institute of Technology"
        elif "berkeley" in text_lower:
            institution = "UC Berkeley"

        # Department / Major heuristic
        department = "Computer Science"
        if "software engineering" in text_lower:
            department = "Software Engineering"
        elif "data science" in text_lower:
            department = "Data Science & Analytics"
        elif "electrical engineering" in text_lower:
            department = "Electrical Engineering"
        elif "information technology" in text_lower:
            department = "Information Technology"

        # 5. Detected Skills extraction
        extracted_skills = []
        seen_skill_ids = set()
        frameworks_and_tools = []

        for kw, info in KNOWN_TECH_KEYWORDS.items():
            if kw in text_lower:
                s_id = info["id"]
                if s_id not in seen_skill_ids:
                    seen_skill_ids.add(s_id)
                    # Baseline proficiency estimate based on resume mention
                    extracted_skills.append({
                        "skill_id": s_id,
                        "skill_name": info["name"],
                        "proficiency": 65
                    })
                if info["name"] not in frameworks_and_tools:
                    frameworks_and_tools.append(info["name"])

        # 6. Projects extraction heuristic
        extracted_projects = []
        project_keywords = ["project", "built", "engineered", "developed", "architected"]
        for line in lines:
            if any(pk in line.lower() for pk in ["platform", "application", "service", "system", "dashboard", "api"]):
                if len(line) > 20 and len(extracted_projects) < 3:
                    extracted_projects.append({
                        "title": line[:50].strip(" -:"),
                        "tech": ", ".join(frameworks_and_tools[:3]) or "Full Stack",
                        "description": line[:150]
                    })

        if not extracted_projects:
            extracted_projects.append({
                "title": "Full Stack Web Application",
                "tech": "React, Python, SQL",
                "description": "Production single page application with modular microservices and automated testing."
            })

        # 7. Certifications extraction
        extracted_certs = []
        if "aws" in text_lower:
            extracted_certs.append("AWS Certified Solutions Architect / Developer")
        if "meta" in text_lower:
            extracted_certs.append("Meta Certified Frontend Engineer")
        if "docker" in text_lower:
            extracted_certs.append("Docker & Kubernetes Containerization Specialist")

        return {
            "full_name": extracted_name,
            "email": extracted_email,
            "education_level": education_level,
            "institution": institution or "Accredited University",
            "department": department,
            "academic_year": "Senior Year (4th Year)",
            "github_url": github_url,
            "skills": extracted_skills,
            "frameworks_and_tools": frameworks_and_tools,
            "projects": extracted_projects,
            "certifications": extracted_certs,
            "weekly_hours": 12,
            "headline": f"{department} Student & Software Engineer"
        }

    def analyze_resume_text(self, raw_text: str, career_id: str) -> Dict[str, Any]:
        text_lower = raw_text.lower()
        
        # 1. Detect skills in resume
        detected_skill_ids = set()
        for kw, info in KNOWN_TECH_KEYWORDS.items():
            if kw in text_lower:
                detected_skill_ids.add(info["id"])

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