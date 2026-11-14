"""
NEXORA Central Agent Orchestrator.
Coordinates specialized agents, enforces structured data pipelines,
records telemetry, and guarantees deterministic consistency across learning cycles.
"""
import time
import uuid
from typing import Dict, Any, List, Optional
from app.database import get_db
from app.services.agents.profile_agent import ProfileAgent
from app.services.agents.skill_analysis_agent import SkillAnalysisAgent
from app.services.agents.career_agent import CareerIntelligenceAgent
from app.services.agents.roadmap_agent import RoadmapAgent
from app.services.agents.resource_agent import ResourceAgent
from app.services.agents.assessment_agent import AssessmentAgent

class AgentOrchestrator:
    def __init__(self):
        self.profile_agent = ProfileAgent()
        self.skill_analysis_agent = SkillAnalysisAgent()
        self.career_agent = CareerIntelligenceAgent()
        self.roadmap_agent = RoadmapAgent()
        self.resource_agent = ResourceAgent()
        self.assessment_agent = AssessmentAgent()

    def _log_agent_action(
        self,
        learner_id: str,
        agent_name: str,
        action: str,
        input_summary: str,
        output_summary: str,
        execution_time_ms: int,
        status: str = "SUCCESS"
    ):
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO agent_logs (id, learner_id, agent_name, action, input_summary, output_summary, execution_time_ms, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                str(uuid.uuid4()),
                learner_id,
                agent_name,
                action,
                input_summary,
                output_summary,
                execution_time_ms,
                status
            ))

    def run_full_intelligence_cycle(self, learner_id: str, career_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes end-to-end multi-agent evaluation cycle:
        1. ProfileAgent extracts profile & skill map
        2. SkillAnalysisAgent calculates gaps & scores
        3. CareerIntelligenceAgent assesses market alignment
        4. ResourceAgent curates prioritized learning resources
        5. RoadmapAgent updates/preserves roadmap milestones
        6. Logs execution telemetry
        """
        cycle_start = time.time()

        # Step 1: Profile Agent
        t0 = time.time()
        profile_data = self.profile_agent.analyze(learner_id)
        t_profile = int((time.time() - t0) * 1000)
        
        target_career_id = career_id or profile_data.get("target_career_id") or "career-full-stack-developer"

        self._log_agent_action(
            learner_id,
            "ProfileAgent",
            "ANALYZE_PROFILE",
            f"Ingested {len(profile_data.get('skills', []))} skills. Target career: {target_career_id}",
            f"Profile synchronized. Level: {profile_data.get('current_level')}",
            t_profile
        )

        # Step 2: Skill Analysis Agent
        t0 = time.time()
        skill_analysis = self.skill_analysis_agent.analyze(profile_data.get("skill_map", {}), target_career_id)
        t_skills = int((time.time() - t0) * 1000)

        self._log_agent_action(
            learner_id,
            "SkillAnalysisAgent",
            "EVALUATE_COMPETENCY_GAPS",
            f"Computed gaps for {target_career_id} across {len(skill_analysis.get('detailed_gaps', []))} criteria.",
            f"Readiness score: {skill_analysis['overall_score']}%. Missing: {len(skill_analysis['missing_skills'])}, Weak: {len(skill_analysis['weaknesses'])}",
            t_skills
        )

        # Step 3: Career Intelligence Agent
        t0 = time.time()
        career_intel = self.career_agent.evaluate(
            target_career_id,
            skill_analysis["overall_score"],
            skill_analysis["detailed_gaps"]
        )
        t_career = int((time.time() - t0) * 1000)

        self._log_agent_action(
            learner_id,
            "CareerIntelligenceAgent",
            "ASSESS_MARKET_READINESS",
            f"Evaluated readiness {skill_analysis['overall_score']}% against {career_intel.get('title')}",
            f"Readiness band: {career_intel.get('readiness_band')}. Demand: {career_intel.get('growth_outlook')}",
            t_career
        )

        # Step 4: Resource Agent
        t0 = time.time()
        resources = self.resource_agent.recommend(skill_analysis["detailed_gaps"])
        t_res = int((time.time() - t0) * 1000)

        self._log_agent_action(
            learner_id,
            "ResourceAgent",
            "CURATE_LEARNING_ASSETS",
            f"Curated learning materials for {resources['total_skills_covered']} identified skill gaps",
            f"Grouped resources by skill deficit; prioritized free high-impact modules.",
            t_res
        )

        # Step 5: Roadmap Agent
        t0 = time.time()
        roadmap = self.roadmap_agent.generate_or_update(
            learner_id,
            target_career_id,
            career_intel.get("title", "Target Career"),
            skill_analysis["detailed_gaps"]
        )
        t_roadmap = int((time.time() - t0) * 1000)

        self._log_agent_action(
            learner_id,
            "RoadmapAgent",
            "SYNTHESIZE_ADAPTIVE_ROADMAP",
            f"Generated personalized sequence with {roadmap['total_milestones']} milestones",
            f"Roadmap calibrated. Active progress: {roadmap['progress_percentage']}% ({roadmap['completed_milestones']}/{roadmap['total_milestones']})",
            t_roadmap
        )

        # If career_id changed, update profile target_career_id
        if career_id and career_id != profile_data.get("target_career_id"):
            with get_db() as conn:
                conn.execute("""
                    UPDATE profiles SET target_career_id = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE learner_id = ?
                """, (career_id, learner_id))

        total_duration = int((time.time() - cycle_start) * 1000)

        return {
            "orchestration_status": "COMPLETED",
            "cycle_time_ms": total_duration,
            "profile": profile_data,
            "career_intelligence": career_intel,
            "skill_analysis": skill_analysis,
            "roadmap": roadmap,
            "resource_recommendations": resources
        }

    def process_assessment_submission(
        self,
        learner_id: str,
        assessment_id: str,
        answers: Dict[str, int]
    ) -> Dict[str, Any]:
        """
        Adaptive cycle triggered upon completing an assessment:
        1. AssessmentAgent scores test and updates verified skill level
        2. SkillAnalysisAgent updates gap analysis with new evidence
        3. CareerIntelligenceAgent recalculates readiness score
        4. RoadmapAgent adapts roadmap priorities
        5. ResourceAgent targets remaining weaknesses
        """
        # Step 1: Evaluate assessment
        t0 = time.time()
        assessment_result = self.assessment_agent.evaluate_submission(learner_id, assessment_id, answers)
        t_asmt = int((time.time() - t0) * 1000)

        self._log_agent_action(
            learner_id,
            "AssessmentAgent",
            "GRADE_ASSESSMENT_SUBMISSION",
            f"Graded submission for assessment {assessment_id}. Total questions: {assessment_result.get('total_questions')}",
            f"Score: {assessment_result.get('percentage')}%. Verified proficiency updated to {assessment_result.get('new_proficiency')}%.",
            t_asmt
        )

        # Record Progress Event
        with get_db() as conn:
            conn.execute("""
                INSERT INTO progress_records (id, learner_id, event_type, description, metric_name, new_value)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                str(uuid.uuid4()),
                learner_id,
                "ASSESSMENT_COMPLETED",
                f"Completed {assessment_result.get('assessment_title')} ({assessment_result.get('percentage')}%)",
                "ASSESSMENT_SCORE",
                assessment_result.get("percentage")
            ))

        # Re-run intelligence cycle with updated proficiency
        full_cycle = self.run_full_intelligence_cycle(learner_id)

        return {
            "assessment_result": assessment_result,
            "updated_intelligence": full_cycle
        }

orchestrator = AgentOrchestrator()
