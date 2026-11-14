from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from app.database import get_db
from app.routers.auth import get_current_user_id
from app.services.orchestrator import orchestrator
from app.services.ai_service import ai_service

router = APIRouter(prefix="/agents", tags=["Agentic Telemetry"])

@router.get("/status")
def get_agents_status() -> Dict[str, Any]:
    return {
        "orchestrator": {
            "name": "Central Orchestrator",
            "status": "ONLINE",
            "coordination_mode": "Deterministic Directed Acyclic Graph (DAG)",
            "telemetry": "Active"
        },
        "agents": [
            {
                "name": "ProfileAgent",
                "role": "Learner Profile & Knowledge Graph Synthesizer",
                "status": "ONLINE",
                "last_active": "Realtime"
            },
            {
                "name": "SkillAnalysisAgent",
                "role": "Competency & Gap Diagnostic Evaluator",
                "status": "ONLINE",
                "engine": "Deterministic Mathematical Scorer"
            },
            {
                "name": "CareerIntelligenceAgent",
                "role": "Industry Benchmark & Role Alignment Engine",
                "status": "ONLINE",
                "coverage": "High-Demand Tech Careers"
            },
            {
                "name": "RoadmapAgent",
                "role": "Adaptive Milestone Sequencer",
                "status": "ONLINE",
                "strategy": "Topological Gap Priority"
            },
            {
                "name": "ResourceAgent",
                "role": "High-Yield Curriculum & Asset Curator",
                "status": "ONLINE",
                "assets": "Curated Labs, Docs & Projects"
            },
            {
                "name": "AssessmentAgent",
                "role": "Proficiency Grader & Empirical Feedback Loop",
                "status": "ONLINE",
                "calibration": "Instant Verification"
            }
        ],
        "ai_engine": {
            "provider": "Google Gemini (Official Python SDK)",
            "model": ai_service.model_name,
            "live_connection": ai_service.is_ai_live(),
            "fallback_engine": "Active (High-Fidelity Deterministic Engine)"
        }
    }

@router.get("/logs")
def get_agent_logs(user_id: str = Depends(get_current_user_id)) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM agent_logs
            WHERE learner_id = ?
            ORDER BY created_at DESC LIMIT 30
        """, (user_id,))
        return [dict(r) for r in cursor.fetchall()]

@router.post("/run-cycle")
def run_agent_cycle(user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    result = orchestrator.run_full_intelligence_cycle(user_id)
    return {
        "status": "SUCCESS",
        "result": result
    }
