import uuid
import json
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.database import get_db
from app.routers.auth import get_current_user_id

router = APIRouter(prefix="/simulator", tags=["Workplace Career Simulator"])

class ScenarioSubmitRequest(BaseModel):
    scenario_id: str
    selected_action: str
    rationale_text: str

@router.get("/scenarios")
def get_scenarios(role: Optional[str] = None, user_id: str = Depends(get_current_user_id)) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        if role:
            cursor.execute("SELECT * FROM workplace_scenarios WHERE role_slug = ?", (role,))
        else:
            cursor.execute("SELECT * FROM workplace_scenarios ORDER BY id ASC")
        rows = [dict(r) for r in cursor.fetchall()]

        # Attach learner's latest submission for each scenario if present
        for row in rows:
            cursor.execute("""
                SELECT score, selected_action, created_at 
                FROM workplace_scenario_submissions 
                WHERE learner_id = ? AND scenario_id = ? 
                ORDER BY created_at DESC LIMIT 1
            """, (user_id, row["id"]))
            sub = cursor.fetchone()
            row["latest_submission"] = dict(sub) if sub else None
            try:
                row["options"] = json.loads(row["options_json"])
            except Exception:
                row["options"] = []
            # Do NOT expose rubric_json in list to prevent answer leaking
            row.pop("rubric_json", None)
            row.pop("options_json", None)

        return rows

@router.get("/scenarios/{scenario_id}")
def get_scenario_detail(scenario_id: str, user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM workplace_scenarios WHERE id = ?", (scenario_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Workplace scenario not found")

        r_dict = dict(row)
        cursor.execute("""
            SELECT * FROM workplace_scenario_submissions 
            WHERE learner_id = ? AND scenario_id = ? 
            ORDER BY created_at DESC LIMIT 1
        """, (user_id, scenario_id))
        sub = cursor.fetchone()
        r_dict["latest_submission"] = dict(sub) if sub else None
        try:
            r_dict["options"] = json.loads(r_dict["options_json"])
        except Exception:
            r_dict["options"] = []
        r_dict.pop("rubric_json", None)
        r_dict.pop("options_json", None)

        return r_dict

@router.post("/submit")
def submit_scenario_decision(
    req: ScenarioSubmitRequest,
    user_id: str = Depends(get_current_user_id)
) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM workplace_scenarios WHERE id = ?", (req.scenario_id,))
        scen = cursor.fetchone()
        if not scen:
            raise HTTPException(status_code=404, detail="Workplace scenario not found")

        scen_dict = dict(scen)
        try:
            rubric_meta = json.loads(scen_dict["rubric_json"])
        except Exception:
            rubric_meta = {"optimal_action": "", "rubric": {}}

        rubric_map = rubric_meta.get("rubric", {})
        action_eval = rubric_map.get(req.selected_action, {"score": 50, "feedback": "Acceptable consideration, but with significant architectural trade-offs."})

        base_score = int(action_eval.get("score", 50))
        # Rationale depth bonus
        rationale_clean = req.rationale_text.strip()
        bonus = 0
        if len(rationale_clean) >= 40:
            bonus = 5
        final_score = min(100, base_score + bonus)

        feedback_text = action_eval.get("feedback", "Decision evaluated against staff-level technical rubric.")
        target_skill_id = scen_dict["target_skill_id"]

        growth_feedback = (
            f"Evaluated against senior engineering standards. Final Rubric Score: {final_score}/100. "
            f"Competency verified on target skill '{target_skill_id}'. "
            f"{'Demonstrated strong architectural mastery.' if final_score >= 70 else 'Review the trade-offs before reapplying.'}"
        )

        sub_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO workplace_scenario_submissions (
                id, learner_id, scenario_id, selected_action, rationale_text,
                score, evaluation_rubric_json, competency_growth_feedback
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            sub_id, user_id, req.scenario_id, req.selected_action, rationale_clean,
            final_score, json.dumps(action_eval), growth_feedback
        ))

        # If passed with score >= 70, grant verified skill progression
        if final_score >= 70:
            cursor.execute("""
                SELECT proficiency FROM learner_skills 
                WHERE learner_id = ? AND skill_id = ?
            """, (user_id, target_skill_id))
            cur_s = cursor.fetchone()
            if cur_s:
                new_prof = min(100, cur_s["proficiency"] + 15)
                cursor.execute("""
                    UPDATE learner_skills
                    SET proficiency = ?, verified = 1, verification_source = 'project', updated_at = CURRENT_TIMESTAMP
                    WHERE learner_id = ? AND skill_id = ?
                """, (new_prof, user_id, target_skill_id))
            else:
                cursor.execute("""
                    INSERT INTO learner_skills (
                        id, learner_id, skill_id, proficiency, verified, verification_source
                    )
                    VALUES (?, ?, ?, 65, 1, 'project')
                """, (str(uuid.uuid4()), user_id, target_skill_id))

            # Record in activity timeline
            cursor.execute("""
                INSERT INTO activity_timeline (id, learner_id, event_type, title, description, category)
                VALUES (?, ?, 'SIMULATOR_SCENARIO_PASSED', ?, ?, 'simulator')
            """, (str(uuid.uuid4()), user_id, f"Passed Workplace Simulation: {scen_dict['title']}", f"Score: {final_score}/100 on staff-level rubric."))

        return {
            "submission_id": sub_id,
            "scenario_id": req.scenario_id,
            "score": final_score,
            "passed": final_score >= 70,
            "feedback": feedback_text,
            "competency_growth": growth_feedback,
            "optimal_action": rubric_meta.get("optimal_action", ""),
            "target_skill_id": target_skill_id
        }

@router.get("/history")
def get_submission_history(user_id: str = Depends(get_current_user_id)) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT sub.*, ws.title as scenario_title, ws.role_title, ws.difficulty, ws.target_skill_id
            FROM workplace_scenario_submissions sub
            JOIN workplace_scenarios ws ON sub.scenario_id = ws.id
            WHERE sub.learner_id = ?
            ORDER BY sub.created_at DESC
        """, (user_id,))
        return [dict(r) for r in cursor.fetchall()]
