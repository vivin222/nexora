import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from app.database import get_db
from app.routers.auth import get_current_user_id
from app.services.orchestrator import orchestrator

router = APIRouter(prefix="/learning", tags=["Learning Center & Topic-Wise Content"])

class TutorQueryRequest(BaseModel):
    course_id: str
    lesson_id: str
    message: str

class BookmarkRequest(BaseModel):
    bookmarked: bool

@router.get("/courses")
def list_courses(user_id: str = Depends(get_current_user_id)) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT c.*, s.name as skill_name
            FROM courses c
            JOIN skills s ON c.skill_id = s.id
            ORDER BY c.title ASC
        """)
        courses = [dict(c) for c in cursor.fetchall()]

        for c in courses:
            cursor.execute("SELECT COUNT(*) as lcount FROM course_lessons WHERE course_id = ?", (c["id"],))
            c["lesson_count"] = cursor.fetchone()["lcount"]

            cursor.execute("""
                SELECT COUNT(*) as comp FROM lesson_progress
                WHERE learner_id = ? AND course_id = ? AND completed = 1
            """, (user_id, c["id"]))
            c["completed_lessons"] = cursor.fetchone()["comp"]
            c["progress_percentage"] = round((c["completed_lessons"] / max(1, c["lesson_count"])) * 100, 1)

        return courses

@router.get("/courses/{course_id}")
def get_course_detail(course_id: str, user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM courses WHERE id = ? OR slug = ?", (course_id, course_id))
        course = cursor.fetchone()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        c_dict = dict(course)

        # Fetch modules
        cursor.execute("SELECT * FROM course_modules WHERE course_id = ? ORDER BY order_index ASC", (c_dict["id"],))
        modules = [dict(m) for m in cursor.fetchall()]

        for m in modules:
            cursor.execute("""
                SELECT l.id, l.order_index, l.title, l.estimated_minutes,
                       COALESCE(lp.completed, 0) as completed,
                       COALESCE(lp.bookmarked, 0) as bookmarked
                FROM course_lessons l
                LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.learner_id = ?
                WHERE l.module_id = ?
                ORDER BY l.order_index ASC
            """, (user_id, m["id"]))
            m["lessons"] = [dict(l) for l in cursor.fetchall()]

        c_dict["modules"] = modules
        return c_dict

@router.get("/lessons/{lesson_id}")
def get_lesson_detail(lesson_id: str, user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT l.*, c.title as course_title, c.slug as course_slug
            FROM course_lessons l
            JOIN courses c ON l.course_id = c.id
            WHERE l.id = ?
        """, (lesson_id,))
        lesson = cursor.fetchone()
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")

        l_dict = dict(lesson)
        l_dict["key_takeaways"] = json.loads(l_dict["key_takeaways_json"]) if l_dict["key_takeaways_json"] else []
        l_dict["quiz_question"] = json.loads(l_dict["quiz_question_json"]) if l_dict["quiz_question_json"] else {}

        # Fetch learner progress for this lesson
        cursor.execute("SELECT * FROM lesson_progress WHERE learner_id = ? AND lesson_id = ?", (user_id, lesson_id))
        prog = cursor.fetchone()
        l_dict["completed"] = bool(prog["completed"]) if prog else False
        l_dict["bookmarked"] = bool(prog["bookmarked"]) if prog else False

        return l_dict

@router.post("/lessons/{lesson_id}/complete")
def complete_lesson(lesson_id: str, user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT course_id, title FROM course_lessons WHERE id = ?", (lesson_id,))
        lesson = cursor.fetchone()
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")

        course_id = lesson["course_id"]
        cursor.execute("""
            INSERT INTO lesson_progress (id, learner_id, lesson_id, course_id, completed, completed_at)
            VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
            ON CONFLICT(learner_id, lesson_id) DO UPDATE SET
            completed = 1, completed_at = CURRENT_TIMESTAMP
        """, (str(uuid.uuid4()), user_id, lesson_id, course_id))

        # Record progress event
        cursor.execute("""
            INSERT INTO progress_records (id, learner_id, event_type, description, metric_name, new_value)
            VALUES (?, ?, 'LESSON_COMPLETED', ?, 'LESSONS_COMPLETED', 1)
        """, (str(uuid.uuid4()), user_id, f"Completed lesson: {lesson['title']}"))

        # Update weekly goal counter if exists
        cursor.execute("""
            UPDATE weekly_goals
            SET completed_lessons = completed_lessons + 1, updated_at = CURRENT_TIMESTAMP
            WHERE learner_id = ?
        """, (user_id,))

        return {"status": "SUCCESS", "lesson_id": lesson_id, "completed": True}

@router.post("/lessons/{lesson_id}/bookmark")
def toggle_bookmark(lesson_id: str, req: BookmarkRequest, user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT course_id FROM course_lessons WHERE id = ?", (lesson_id,))
        lesson = cursor.fetchone()
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")

        cursor.execute("""
            INSERT INTO lesson_progress (id, learner_id, lesson_id, course_id, bookmarked)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(learner_id, lesson_id) DO UPDATE SET
            bookmarked = excluded.bookmarked
        """, (str(uuid.uuid4()), user_id, lesson_id, lesson["course_id"], 1 if req.bookmarked else 0))

        return {"status": "SUCCESS", "bookmarked": req.bookmarked}

@router.post("/tutor/chat")
def tutor_chat(req: TutorQueryRequest, user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT l.title as lesson_title, l.content_markdown, c.title as course_title, c.skill_id
            FROM course_lessons l
            JOIN courses c ON l.course_id = c.id
            WHERE l.id = ?
        """, (req.lesson_id,))
        row = cursor.fetchone()
        
        lesson_context = {
            "lesson_title": row["lesson_title"] if row else "Lesson",
            "course_title": row["course_title"] if row else "Course",
            "content": row["content_markdown"] if row else ""
        }

        # Check learner skill level
        cursor.execute("SELECT proficiency FROM learner_skills WHERE learner_id = ? AND skill_id = ?", 
                       (user_id, row["skill_id"] if row else "skill-javascript"))
        sk = cursor.fetchone()
        prof = sk["proficiency"] if sk else 50

        # Save user message
        cursor.execute("""
            INSERT INTO tutor_conversations (id, learner_id, course_id, lesson_id, sender, message)
            VALUES (?, ?, ?, ?, 'user', ?)
        """, (str(uuid.uuid4()), user_id, req.course_id, req.lesson_id, req.message))

    # Invoke TutorAgent
    tutor_reply = orchestrator.tutor_agent.answer_lesson_inquiry(req.message, lesson_context, prof)

    # Save tutor response
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO tutor_conversations (id, learner_id, course_id, lesson_id, sender, message, metadata_json)
            VALUES (?, ?, ?, ?, 'tutor', ?, ?)
        """, (str(uuid.uuid4()), user_id, req.course_id, req.lesson_id, tutor_reply["content"], json.dumps({
            "source": tutor_reply["source"],
            "model": tutor_reply["model"]
        })))

    return {
        "sender": "tutor",
        "message": tutor_reply["content"],
        "metadata": tutor_reply
    }
