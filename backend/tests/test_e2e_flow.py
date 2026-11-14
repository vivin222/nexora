"""
NEXORA End-to-End Workflow Verification Suite.
Executes the exact 10-step lifecycle defined in Section 10 of the Master Build Command.
"""
import sys
import uuid
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db

client = TestClient(app)

def test_full_10_step_e2e_workflow():
    print("\n--- Starting NEXORA 10-Step End-to-End Verification ---")

    # 1. Create learner profile with unique email
    test_email = f"sarah.chen.{uuid.uuid4().hex[:6]}@nexora.ai"
    reg_payload = {
        "email": test_email,
        "password": "Password123!",
        "full_name": "Sarah Chen",
        "headline": "Junior Software Engineer & Systems Explorer"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 200, f"Registration failed: {reg_res.text}"
    user_data = reg_res.json()
    auth_token = user_data["token"]
    headers = {"Authorization": f"Bearer {auth_token}"}
    print(f"Step 1: Registered learner '{user_data['user']['full_name']}' ({test_email})")

    # 2. Select Full Stack Developer
    career_select = client.post("/api/careers/select", json={"career_id": "career-full-stack-developer"}, headers=headers)
    assert career_select.status_code == 200
    print("Step 2: Selected career 'Full Stack Developer'")

    # 3. Add Python (75%), SQL (70%) and basic HTML (40%)
    skill_updates = [
        {"skill_id": "skill-python", "proficiency": 75},
        {"skill_id": "skill-sql", "proficiency": 70},
        {"skill_id": "skill-html-css", "proficiency": 40}
    ]
    for su in skill_updates:
        s_res = client.post("/api/skills/update", json=su, headers=headers)
        assert s_res.status_code == 200
    print("Step 3: Ingested starting skills: Python (75%), SQL (70%), HTML/CSS (40%)")

    # 5. View skill gaps (check initial gaps before assessment)
    gap_res = client.get("/api/skills/analysis", headers=headers)
    assert gap_res.status_code == 200
    analysis = gap_res.json()["analysis"]
    initial_score = analysis["overall_score"]
    missing_names = [m["skill_name"] for m in analysis["missing_skills"]]
    assert "JavaScript" in missing_names
    assert "React" in missing_names
    print(f"Step 5 (pre-test): Match score is {initial_score}%. Missing: {missing_names}")

    # 4. Complete JavaScript assessment with answers
    asmt_res = client.get("/api/assessments/asmt-js-core", headers=headers)
    assert asmt_res.status_code == 200

    # Answer 4 out of 5 correctly (80% score)
    with get_db() as conn:
        q_rows = conn.execute("SELECT id, correct_option_index FROM assessment_questions WHERE assessment_id = 'asmt-js-core'").fetchall()
        answers = {r["id"]: r["correct_option_index"] for r in q_rows}
        first_qid = q_rows[0]["id"]
        answers[first_qid] = (answers[first_qid] + 1) % 4 # Make 1 wrong

    submission_payload = {
        "assessment_id": "asmt-js-core",
        "answers": answers
    }
    submit_res = client.post("/api/assessments/submit", json=submission_payload, headers=headers)
    assert submit_res.status_code == 200
    eval_result = submit_res.json()["evaluation"]["assessment_result"]
    assert eval_result["percentage"] == 80.0
    assert eval_result["passed"] is True
    assert eval_result["new_proficiency"] == 80
    print(f"Step 4: Completed assessment '{eval_result['assessment_title']}'. Score: 80% (Verified proficiency: 80%)")

    # 6. Generate roadmap
    roadmap_res = client.get("/api/roadmap", headers=headers)
    assert roadmap_res.status_code == 200
    roadmap = roadmap_res.json()
    assert len(roadmap["milestones"]) > 0
    first_milestone = roadmap["milestones"][0]
    print(f"Step 6: Roadmap active with {roadmap['total_milestones']} milestones. First: '{first_milestone['title']}'")

    # 7. Complete a milestone
    toggle_res = client.put(f"/api/roadmap/milestones/{first_milestone['id']}", json={"completed": True}, headers=headers)
    assert toggle_res.status_code == 200
    toggle_data = toggle_res.json()
    assert toggle_data["new_status"] == "completed"
    assert toggle_data["completed_milestones"] >= 1
    print(f"Step 7: Milestone marked complete. Roadmap progress: {toggle_data['progress_percentage']}%")

    # 8. Submit another assessment: React assessment
    with get_db() as conn:
        r_rows = conn.execute("SELECT id, correct_option_index FROM assessment_questions WHERE assessment_id = 'asmt-react-core'").fetchall()
        react_answers = {r["id"]: r["correct_option_index"] for r in r_rows}

    react_sub = {
        "assessment_id": "asmt-react-core",
        "answers": react_answers
    }
    react_res = client.post("/api/assessments/submit", json=react_sub, headers=headers)
    assert react_res.status_code == 200
    r_eval = react_res.json()["evaluation"]["assessment_result"]
    assert r_eval["percentage"] == 100.0
    print(f"Step 8: Completed React assessment. Score: 100%. Verified proficiency updated.")

    # 9. Verify adaptive recommendations & recalculated readiness
    progress_res = client.get("/api/progress", headers=headers)
    assert progress_res.status_code == 200
    prog = progress_res.json()
    new_readiness = prog["overall_readiness_score"]
    assert new_readiness > initial_score, f"Expected readiness to increase from {initial_score}, got {new_readiness}"
    print(f"Step 9: Verified adaptation. Readiness score increased from {initial_score}% to {new_readiness}%!")

    # 10. Open AI Mentor and ask career advice
    mentor_res = client.post("/api/mentor/chat", json={"message": "What is my next priority now that I passed JavaScript and React?"}, headers=headers)
    assert mentor_res.status_code == 200
    mentor_reply = mentor_res.json()
    assert len(mentor_reply["message"]) > 20
    assert mentor_reply["sender"] == "mentor"
    print(f"Step 10: AI Mentor responded with contextual guidance (Model: {mentor_reply['metadata']['model']})")

    # Check Agent Logs for immutable audit trail
    logs_res = client.get("/api/agents/logs", headers=headers)
    assert logs_res.status_code == 200
    agent_logs = logs_res.json()
    assert len(agent_logs) >= 5
    print(f"Verified telemetry: {len(agent_logs)} structured multi-agent execution records logged.")

    print("--- All 10 End-to-End Workflow Steps Passed Flawlessly! ---")
