"""
Roadmap Agent: Creates and updates personalized, ordered learning paths.
Preserves learner completion history when adapting to new career goals or assessments.
"""
import uuid
from typing import Dict, Any, List
from app.database import get_db

class RoadmapAgent:
    name = "RoadmapAgent"

    def generate_or_update(
        self,
        learner_id: str,
        career_id: str,
        career_title: str,
        skill_gaps: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        with get_db() as conn:
            cursor = conn.cursor()

            # Check if roadmap exists for this learner & career
            cursor.execute("""
                SELECT * FROM roadmaps WHERE learner_id = ? AND career_id = ?
            """, (learner_id, career_id))
            existing_roadmap = cursor.fetchone()

            existing_completed_skills = set()
            if existing_roadmap:
                roadmap_id = existing_roadmap["id"]
                # Fetch existing completed milestones to preserve completed state
                cursor.execute("""
                    SELECT skill_id, status FROM milestones WHERE roadmap_id = ?
                """, (roadmap_id,))
                for m in cursor.fetchall():
                    if m["status"] == "completed":
                        existing_completed_skills.add(m["skill_id"])
            else:
                roadmap_id = str(uuid.uuid4())
                cursor.execute("""
                    INSERT INTO roadmaps (id, learner_id, career_id, title, description, total_milestones, completed_milestones)
                    VALUES (?, ?, ?, ?, ?, 0, 0)
                """, (
                    roadmap_id,
                    learner_id,
                    career_id,
                    f"Personalized Learning Roadmap: {career_title}",
                    f"Adaptive multi-stage progression specifically configured to bridge competency gaps for {career_title}."
                ))

            # Delete old milestones for this roadmap
            cursor.execute("DELETE FROM milestones WHERE roadmap_id = ?", (roadmap_id,))

            # Sort gaps: missing first by importance descending, then weak by gap descending
            missing = [g for g in skill_gaps if g["status"] == "missing"]
            weak = [g for g in skill_gaps if g["status"] == "weak"]
            missing.sort(key=lambda x: x["importance_weight"], reverse=True)
            weak.sort(key=lambda x: (x["importance_weight"], x["gap"]), reverse=True)

            # Deduplicate by skill_id
            seen_skills = set()
            ordered_targets = []
            for target in missing + weak:
                if target["skill_id"] not in seen_skills:
                    seen_skills.add(target["skill_id"])
                    ordered_targets.append(target)

            # Build milestone items
            new_milestones = []
            order_idx = 1
            completed_count = 0

            for target in ordered_targets:
                s_id = target["skill_id"]
                s_name = target["skill_name"]
                gap = target["gap"]
                
                is_completed = s_id in existing_completed_skills
                status = "completed" if is_completed else "pending"
                completed_at = "CURRENT_TIMESTAMP" if is_completed else None
                m_id = str(uuid.uuid4())

                if is_completed:
                    completed_count += 1

                # Formulate objective
                if target["status"] == "missing":
                    title = f"Foundations & Core Syntax: {s_name}"
                    obj = f"Master fundamental principles, syntax, and foundational patterns of {s_name}. Target proficiency: 70%+."
                    res_type = "Interactive Tutorials & Core Docs"
                    hours = 12
                else:
                    title = f"Advanced Architecture & Optimization: {s_name}"
                    obj = f"Bridge remaining {gap}% proficiency deficit through real-world implementation and edge-case handling."
                    res_type = "Applied Projects & Deep Dive"
                    hours = 8

                new_milestones.append({
                    "id": m_id,
                    "roadmap_id": roadmap_id,
                    "order_index": order_idx,
                    "skill_id": s_id,
                    "skill_name": s_name,
                    "title": title,
                    "objective": obj,
                    "resource_type": res_type,
                    "estimated_hours": hours,
                    "status": status,
                    "completed_at": completed_at
                })
                order_idx += 1

            # Capstone Milestone
            capstone_skill_id = ordered_targets[0]["skill_id"] if ordered_targets else "skill-python"
            capstone_completed = "skill-capstone-completed" in existing_completed_skills
            capstone_status = "completed" if capstone_completed else "pending"
            capstone_completed_at = "CURRENT_TIMESTAMP" if capstone_completed else None
            capstone_id = str(uuid.uuid4())

            if capstone_completed:
                completed_count += 1

            new_milestones.append({
                "id": capstone_id,
                "roadmap_id": roadmap_id,
                "order_index": order_idx,
                "skill_id": capstone_skill_id,
                "skill_name": "Full Application Integration",
                "title": f"Capstone Project: End-to-End {career_title} Production System",
                "objective": "Integrate all mastered competencies into a verified portfolio artifact deployed with automated testing.",
                "resource_type": "Capstone Portfolio Build",
                "estimated_hours": 24,
                "status": capstone_status,
                "completed_at": capstone_completed_at
            })

            # Save in database
            for m in new_milestones:
                cursor.execute("""
                    INSERT INTO milestones (id, roadmap_id, order_index, skill_id, title, objective, resource_type, estimated_hours, status, completed_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    m["id"], m["roadmap_id"], m["order_index"], m["skill_id"],
                    m["title"], m["objective"], m["resource_type"], m["estimated_hours"],
                    m["status"], m["completed_at"]
                ))

            total_milestones = len(new_milestones)
            cursor.execute("""
                UPDATE roadmaps
                SET total_milestones = ?, completed_milestones = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (total_milestones, completed_count, roadmap_id))

            progress_pct = round((completed_count / max(1, total_milestones)) * 100, 1)

            return {
                "roadmap_id": roadmap_id,
                "career_id": career_id,
                "career_title": career_title,
                "total_milestones": total_milestones,
                "completed_milestones": completed_count,
                "progress_percentage": progress_pct,
                "milestones": new_milestones
            }
