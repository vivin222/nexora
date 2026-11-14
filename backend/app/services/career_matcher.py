"""
NEXORA Career Matching Engine.
Provides deterministic, multi-agent grounded career discovery,
scoring learner profile evidence (skills, proficiencies, interests,
projects, and weekly capacity) against all canonical career trajectories.
"""
from typing import Dict, Any, List, Optional
import math
from app.database import get_db
from app.services.scoring import calculate_career_match

DOMAIN_KEYWORD_MAP = {
    "career-full-stack-developer": [
        "full stack", "fullstack", "web", "software", "javascript", "react", "node", 
        "full-stack", "backend", "frontend", "api", "database", "engineering"
    ],
    "career-ai-ml-engineer": [
        "ai", "ml", "machine learning", "artificial intelligence", "neural", "deep learning",
        "data science", "nlp", "computer vision", "llm", "agents", "python", "pytorch", "fastapi"
    ],
    "career-cloud-devops-architect": [
        "cloud", "devops", "infrastructure", "platform", "docker", "kubernetes", "aws", 
        "gcp", "azure", "ci/cd", "site reliability", "sre", "automation", "containers"
    ],
    "career-frontend-engineer": [
        "frontend", "front-end", "front end", "ui", "ux", "design", "react", "typescript",
        "css", "tailwind", "client", "web applications", "responsive", "design systems"
    ],
    "career-data-engineer": [
        "data", "data engineering", "pipeline", "etl", "sql", "bigquery", "analytics",
        "streaming", "kafka", "warehouse", "lakehouse", "spark", "storage"
    ],
    "career-cybersecurity-engineer": [
        "security", "cyber", "cybersecurity", "infosec", "network security", "application security",
        "penetration testing", "threat", "vulnerability", "encryption", "auth"
    ]
}

def evaluate_career_matches(
    learner_skills: Dict[str, int],
    interests: Optional[List[str]] = None,
    department: Optional[str] = "",
    academic_year: Optional[str] = "",
    education_level: Optional[str] = "",
    projects: Optional[List[Dict[str, Any]]] = None,
    certifications: Optional[List[str]] = None,
    weekly_hours: int = 10,
    current_target_career_id: Optional[str] = ""
) -> Dict[str, Any]:
    """
    Evaluates every canonical career role against learner evidence.
    Returns:
    - top_matches: Top 3 Candidate Careers for side-by-side comparison
    - all_matches: Complete ranked roster of career roles
    - missing_profile_data: Honest feedback on missing learner attributes
    """
    interests = interests or []
    projects = projects or []
    certifications = certifications or []
    weekly_hours = max(5, weekly_hours or 10)

    # Missing profile diagnostics (anti-hallucination guardrail)
    missing_data = []
    if not learner_skills:
        missing_data.append("No technical skills declared yet. Self-rate your skills to calibrate gap vectors.")
    if not projects:
        missing_data.append("No project evidence or repository links provided. Add projects to strengthen verification.")
    if not interests:
        missing_data.append("No domain interests specified. Select interests to enhance trajectory alignment.")

    evaluated_careers: List[Dict[str, Any]] = []

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM career_roles ORDER BY title ASC")
        career_rows = [dict(r) for r in cursor.fetchall()]

        for career in career_rows:
            c_id = career["id"]

            # Load career requirements
            cursor.execute("""
                SELECT csr.*, s.name as skill_name, s.category as skill_category
                FROM career_skill_requirements csr
                JOIN skills s ON csr.skill_id = s.id
                WHERE csr.career_id = ?
                ORDER BY csr.importance_weight DESC
            """, (c_id,))
            requirements = [dict(r) for r in cursor.fetchall()]

            # 1. Deterministic Skill Gap Analysis
            skill_match = calculate_career_match(learner_skills, requirements)
            skill_score = skill_match["overall_score"]
            strengths = skill_match["strengths"]
            weaknesses = skill_match["weaknesses"]
            missing_skills = skill_match["missing_skills"]
            detailed_gaps = skill_match["detailed_gaps"]

            overlapping_skills = [g for g in detailed_gaps if g["current_level"] > 0]
            critical_gaps = [g for g in detailed_gaps if g["status"] in ("missing", "weak") and g["importance_weight"] >= 3.5]

            # 2. Domain & Interest Alignment
            normalized_interests = " ".join(interests + [department or ""]).lower()
            keywords = DOMAIN_KEYWORD_MAP.get(c_id, [career["title"].lower(), career["category"].lower()])
            
            matched_keywords = [kw for kw in keywords if kw in normalized_interests]
            if matched_keywords:
                interest_score = min(100.0, 40.0 + len(matched_keywords) * 20.0)
            elif interests:
                interest_score = 25.0
            else:
                interest_score = 50.0 # Neutral baseline if unstated

            # 3. Practical Project Evidence Alignment
            project_tech_text = " ".join([
                f"{p.get('title', '')} {p.get('tech', '')} {p.get('description', '')}" 
                for p in projects
            ]).lower()

            req_skill_names = [r["skill_name"].lower() for r in requirements]
            project_skill_hits = [sn for sn in req_skill_names if sn in project_tech_text]
            if project_skill_hits:
                project_score = min(100.0, 50.0 + len(project_skill_hits) * 25.0)
            elif projects:
                project_score = 30.0
            else:
                project_score = 15.0

            # 4. Composite Match Score
            if not learner_skills:
                # If skills unrated, match is preliminary based on interests & background
                composite_score = round(min(45.0, (interest_score * 0.70) + (project_score * 0.30)), 1)
                fit_level = "Exploratory Fit (Skills Uncalibrated)"
            else:
                # 70% Core Skills + 20% Interest Alignment + 10% Project Evidence
                raw_composite = (0.70 * skill_score) + (0.20 * interest_score) + (0.10 * project_score)
                composite_score = round(max(5.0, min(98.0, raw_composite)), 1)

                if composite_score >= 75.0:
                    fit_level = "Strong Match — High Alignment"
                elif composite_score >= 55.0:
                    fit_level = "Target Growth Role — Achievable Runway"
                elif composite_score >= 35.0:
                    fit_level = "Stretch Trajectory — Core Upskilling Needed"
                else:
                    fit_level = "Pivot Trajectory — Exploratory"

            # 5. Estimated Weeks to Readiness
            # Based on critical gap magnitude and weekly learning capacity
            total_gap_hours = (
                sum(g["gap_percentage"] * g["importance_weight"] * 0.15 for g in detailed_gaps) +
                (len(missing_skills) * 8.0)
            )
            estimated_weeks = max(2, int(math.ceil(total_gap_hours / float(weekly_hours))))

            # 6. Honest, Grounded Match Rationale
            rationale_parts = []
            if overlapping_skills:
                top_skills = [s["skill_name"] for s in overlapping_skills[:2]]
                rationale_parts.append(f"Your experience with {', '.join(top_skills)} provides direct leverage for this role.")
            else:
                rationale_parts.append(f"Foundational role with strong alignment to your {department or 'engineering'} trajectory.")

            if critical_gaps:
                top_gap_names = [g["skill_name"] for g in critical_gaps[:2]]
                rationale_parts.append(f"Priority focus: Bridging {', '.join(top_gap_names)} will accelerate your placement readiness.")
            else:
                rationale_parts.append("Your technical competencies meet primary industry baseline criteria.")

            rationale_parts.append(f"Market demand is {career['growth_outlook']} with {career['average_salary']} avg compensation.")
            match_rationale = " ".join(rationale_parts)

            is_active = (c_id == current_target_career_id or career["slug"] == current_target_career_id)

            evaluated_careers.append({
                "career_id": c_id,
                "slug": career["slug"],
                "title": career["title"],
                "category": career["category"],
                "description": career["description"],
                "average_salary": career["average_salary"],
                "growth_outlook": career["growth_outlook"],
                "difficulty_level": career["difficulty_level"],
                "match_score": composite_score,
                "fit_level": fit_level,
                "skill_matrix_score": skill_score,
                "interest_alignment_score": round(interest_score, 1),
                "overlapping_skills": [
                    {
                        "skill_id": s["skill_id"],
                        "skill_name": s["skill_name"],
                        "current_level": s["current_level"],
                        "required_level": s["required_level"]
                    } for s in overlapping_skills
                ],
                "critical_gaps": [
                    {
                        "skill_id": g["skill_id"],
                        "skill_name": g["skill_name"],
                        "current_level": g["current_level"],
                        "required_level": g["required_level"],
                        "gap_percentage": g["gap_percentage"],
                        "importance_weight": g["importance_weight"],
                        "why_it_matters": g.get("why_it_matters", "")
                    } for g in critical_gaps
                ],
                "overlapping_skills_count": len(overlapping_skills),
                "critical_gaps_count": len(critical_gaps),
                "estimated_weeks": estimated_weeks,
                "match_rationale": match_rationale,
                "is_active_target": is_active
            })

    # Sort all careers descending by match_score
    evaluated_careers.sort(key=lambda x: (x["match_score"], -x["critical_gaps_count"]), reverse=True)

    top_3 = evaluated_careers[:3]

    return {
        "status": "SUCCESS",
        "top_matches": top_3,
        "all_matches": evaluated_careers,
        "missing_profile_data": missing_data,
        "total_evaluated": len(evaluated_careers)
    }
