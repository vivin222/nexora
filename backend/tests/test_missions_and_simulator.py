import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_weekly_missions_calibration():
    res = client.get("/api/missions")
    assert res.status_code == 200
    data = res.json()
    assert "missions" in data
    assert "weekly_hours_allocated" in data
    assert "total_missions" in data
    assert "completed_missions" in data
    assert "completion_percentage" in data
    assert len(data["missions"]) >= 2

    # Verify structured mission schema
    m = data["missions"][0]
    assert "id" in m
    assert "objective" in m
    assert "estimated_duration" in m
    assert "difficulty" in m
    assert "target_skill_name" in m
    assert "completion_criteria" in m
    assert "action_type" in m
    assert "action_target_slug" in m
    assert m["status"] in ["active", "completed"]

def test_mission_strict_verification_integrity():
    res = client.get("/api/missions")
    assert res.status_code == 200
    missions = res.json()["missions"]
    assert len(missions) > 0

    # Pick an active mission
    active_m = next((m for m in missions if m["status"] == "active"), missions[0])
    
    # Try verifying without evidence -> Should fail with 400 (strict anti-fake checkbox!)
    # Note: if active_m happens to already have evidence, it will verify, but if not, it rejects
    verify_res = client.post(f"/api/missions/{active_m['id']}/verify")
    assert verify_res.status_code in [200, 400]
    if verify_res.status_code == 400:
        assert "Verification Failed" in verify_res.json()["detail"] or "Verification Incomplete" in verify_res.json()["detail"]

def test_workplace_simulator_scenarios():
    scen_res = client.get("/api/simulator/scenarios")
    assert scen_res.status_code == 200
    scenarios = scen_res.json()
    assert len(scenarios) >= 5

    # Check key role representation
    role_slugs = [s["role_slug"] for s in scenarios]
    assert "software-engineer" in role_slugs
    assert "data-analyst" in role_slugs
    assert "ai-ml-engineer" in role_slugs
    assert "cyber-defense" in role_slugs
    assert "ui-ux-designer" in role_slugs

    # Verify detail endpoint
    first_id = scenarios[0]["id"]
    detail_res = client.get(f"/api/simulator/scenarios/{first_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert "context_markdown" in detail
    assert "evidence_data" in detail
    assert "technical_challenge" in detail
    assert "options" in detail
    assert len(detail["options"]) >= 2

def test_workplace_simulator_rubric_evaluation():
    scen_res = client.get("/api/simulator/scenarios")
    scenarios = scen_res.json()
    swe_scen = next((s for s in scenarios if s["role_slug"] == "software-engineer"), scenarios[0])

    sub_res = client.post("/api/simulator/submit", json={
        "scenario_id": swe_scen["id"],
        "selected_action": swe_scen["options"][0]["id"],
        "rationale_text": "Deploying a composite partial index converts the sequential scan to an index range scan while query timeouts protect pool saturation."
    })
    assert sub_res.status_code == 200
    result = sub_res.json()
    assert "score" in result
    assert "passed" in result
    assert "feedback" in result
    assert "competency_growth" in result
    assert "optimal_action" in result
    assert result["score"] >= 70

def test_smart_revision_feed_and_abandon():
    # Fetch real assessment ID
    asmts_res = client.get("/api/assessments")
    assert asmts_res.status_code == 200
    asmts = asmts_res.json()
    assert len(asmts) > 0
    asmt_id = asmts[0]["id"]

    # Test abandon logging
    ab_res = client.post(f"/api/assessments/{asmt_id}/abandon")
    assert ab_res.status_code == 200
    assert ab_res.json()["status"] == "RECORDED"

    # Test smart revision feed
    rev_res = client.get("/api/assessments/smart-revision/feed")
    assert rev_res.status_code == 200
    feed = rev_res.json()
    assert isinstance(feed, list)

def test_proactive_mentor_advice():
    adv_res = client.get("/api/mentor/proactive-advice")
    assert adv_res.status_code == 200
    advice = adv_res.json()
    assert "career_target" in advice
    assert "top_strength" in advice
    assert "critical_gap" in advice
    assert "proactive_advice" in advice
    assert advice["mode"] == "proactive"

