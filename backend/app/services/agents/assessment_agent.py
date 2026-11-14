"""
Assessment Agent: Evaluates assessment performance, analyzes strengths/weaknesses,
and updates verified skill proficiency levels.
"""
import uuid
import json
from typing import Dict, Any, List
from app.database import get_db

class AssessmentAgent:
    name = "AssessmentAgent"

    def evaluate_submission(
        self,
        learner_id: str,
        assessment_id: str,
        answers: Dict[str, int] # {question_id: selected_option_index}
    ) -> Dict[str, Any]:
        with get_db() as conn:
            cursor = conn.cursor()

            # Fetch assessment metadata
            cursor.execute("SELECT * FROM assessments WHERE id = ?", (assessment_id,))
            asmt = cursor.fetchone()
            if not asmt:
                return {"error": "Assessment not found"}

            skill_id = asmt["skill_id"]

            # Fetch questions
            cursor.execute("SELECT * FROM assessment_questions WHERE assessment_id = ?", (assessment_id,))
            questions = [dict(q) for q in cursor.fetchall()]

            if not questions:
                return {"error": "No questions configured for this assessment"}

            total_questions = len(questions)
            correct_count = 0
            question_breakdown = []

            for q in questions:
                q_id = q["id"]
                correct_idx = q["correct_option_index"]
                user_selected = answers.get(q_id, -1)
                is_correct = (user_selected == correct_idx)

                if is_correct:
                    correct_count += 1

                options = json.loads(q["options_json"])
                question_breakdown.append({
                    "question_id": q_id,
                    "question_text": q["question_text"],
                    "options": options,
                    "user_selected": user_selected,
                    "correct_option_index": correct_idx,
                    "is_correct": is_correct,
                    "explanation": q["explanation"]
                })

            percentage = round((correct_count / total_questions) * 100, 1)
            passed = 1 if percentage >= 60.0 else 0

            # Calculate updated proficiency level
            # If passed, proficiency reflects at least the percentage scored
            # If failed, proficiency is anchored to the performance level (e.g., 35%-50%)
            new_proficiency = int(percentage)

            feedback_summary = (
                f"Scored {correct_count}/{total_questions} ({percentage}%). "
                f"{'Passed with proficiency verification.' if passed else 'Proficiency deficit identified; recommended remediation.'}"
            )

            result_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO assessment_results (id, learner_id, assessment_id, score, total_questions, percentage, passed, answers_json, feedback)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                result_id,
                learner_id,
                assessment_id,
                correct_count,
                total_questions,
                percentage,
                passed,
                json.dumps(answers),
                feedback_summary
            ))

            # Update or insert into learner_skills
            cursor.execute("""
                SELECT * FROM learner_skills WHERE learner_id = ? AND skill_id = ?
            """, (learner_id, skill_id))
            existing_skill = cursor.fetchone()

            if existing_skill:
                cursor.execute("""
                    UPDATE learner_skills
                    SET proficiency = ?, verified = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE learner_id = ? AND skill_id = ?
                """, (new_proficiency, passed, learner_id, skill_id))
            else:
                cursor.execute("""
                    INSERT INTO learner_skills (id, learner_id, skill_id, proficiency, verified)
                    VALUES (?, ?, ?, ?, ?)
                """, (str(uuid.uuid4()), learner_id, skill_id, new_proficiency, passed))

            return {
                "result_id": result_id,
                "assessment_id": assessment_id,
                "assessment_title": asmt["title"],
                "skill_id": skill_id,
                "score": correct_count,
                "total_questions": total_questions,
                "percentage": percentage,
                "passed": bool(passed),
                "new_proficiency": new_proficiency,
                "feedback": feedback_summary,
                "breakdown": question_breakdown
            }
