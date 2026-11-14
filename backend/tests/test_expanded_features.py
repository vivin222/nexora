import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_learning_endpoints():
    # List courses
    courses_res = client.get("/api/learning/courses")
    assert courses_res.status_code == 200
    courses = courses_res.json()
    assert len(courses) >= 3

    # Get course detail
    c_id = courses[0]["id"]
    detail_res = client.get(f"/api/learning/courses/{c_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert "modules" in detail

def test_coding_lab_endpoints():
    # List problems
    problems_res = client.get("/api/coding/problems")
    assert problems_res.status_code == 200
    problems = problems_res.json()
    assert len(problems) >= 2

    # Problem detail
    prob_id = problems[0]["id"]
    p_detail = client.get(f"/api/coding/problems/{prob_id}")
    assert p_detail.status_code == 200
    assert "initial_code" in p_detail.json()

    # Submit code
    sub_res = client.post(f"/api/coding/problems/{prob_id}/submit", json={
        "code": "class EventEmitter { on() {} emit() {} off() {} }",
        "language": "javascript"
    })
    assert sub_res.status_code == 200
    assert "status" in sub_res.json()

def test_project_studio_endpoints():
    projects_res = client.get("/api/projects")
    assert projects_res.status_code == 200
    projects = projects_res.json()
    assert len(projects) >= 2

def test_interview_endpoints():
    qs_res = client.get("/api/interview/questions")
    assert qs_res.status_code == 200
    qs = qs_res.json()
    assert len(qs) >= 3

    # Evaluate answer
    q_id = qs[0]["id"]
    eval_res = client.post("/api/interview/evaluate", json={
        "question_id": q_id,
        "user_answer": "In JavaScript V8, the microtask queue has higher priority than the macrotask queue. Microtasks drain completely before any macrotask executes."
    })
    assert eval_res.status_code == 200
    res = eval_res.json()
    assert "score" in res
    assert res["score"] > 50

def test_resume_analyzer():
    res = client.post("/api/resume/analyze", json={
        "resume_text": "Experienced software developer skilled in Python, SQL, and FastAPI. Built distributed backends and automated ETL pipelines."
    })
    assert res.status_code == 200
    analysis = res.json()
    assert "match_percentage" in analysis
    assert "Python" in analysis["detected_skills"]

def test_goals_and_achievements():
    goals_res = client.get("/api/goals")
    assert goals_res.status_code == 200
    assert "target_hours" in goals_res.json()

    ach_res = client.get("/api/achievements")
    assert ach_res.status_code == 200
    ach = ach_res.json()
    assert len(ach["achievements"]) >= 5
    assert len(ach["certificates"]) >= 1

def test_opportunities():
    opp_res = client.get("/api/opportunities")
    assert opp_res.status_code == 200
    assert len(opp_res.json()) >= 2
