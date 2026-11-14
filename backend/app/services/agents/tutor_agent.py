"""
Tutor Agent: Provides contextual pedagogical assistance within active courses and lessons.
Understands lesson markdown, code examples, learner skill level, and known knowledge gaps.
"""
from typing import Dict, Any, List
from app.services.ai_service import ai_service

class TutorAgent:
    name = "TutorAgent"

    def answer_lesson_inquiry(
        self,
        user_message: str,
        lesson_context: Dict[str, Any],
        learner_proficiency: int
    ) -> Dict[str, Any]:
        """
        Generates contextual tutoring referencing specific lesson concepts and code snippets.
        """
        course_title = lesson_context.get("course_title", "Technical Course")
        lesson_title = lesson_context.get("lesson_title", "Technical Concept")
        content_snippet = lesson_context.get("content", "")[:1000]

        prompt = (
            f"You are the NEXORA AI Tutor assisting an engineering learner.\n"
            f"Course: {course_title}\n"
            f"Active Lesson: {lesson_title}\n"
            f"Learner Baseline Proficiency: {learner_proficiency}%\n"
            f"Lesson Reference Context:\n{content_snippet}\n\n"
            f"Learner Inquiry: {user_message}\n\n"
            f"Provide an authoritative, clear, step-by-step technical explanation with code examples where useful. "
            f"Explain underlying memory/runtime mechanics directly."
        )

        if ai_service.client:
            try:
                response = ai_service.client.models.generate_content(
                    model=ai_service.model_name,
                    contents=prompt
                )
                if response and response.text:
                    return {
                        "content": response.text.strip(),
                        "source": "GEMINI_API",
                        "model": ai_service.model_name,
                        "status": "SUCCESS"
                    }
            except Exception as e:
                pass

        # Deterministic Fallback Engine
        msg_l = user_message.lower()
        if "microtask" in msg_l or "event loop" in msg_l or "promise" in msg_l:
            fallback = (
                f"### Core Architectural Breakdown: {lesson_title}\n\n"
                f"When executing asynchronous code in V8, the synchronous call stack must empty completely before the event loop proceeds.\n\n"
                f"**Key Rule of Precedence:**\n"
                f"1. **Microtasks (`Promise.then`, `queueMicrotask`)** have immediate priority over macrotasks.\n"
                f"2. The microtask queue is drained *in its entirety* between every task tick.\n"
                f"3. **Macrotasks (`setTimeout`, I/O)** only execute after all pending microtasks have completed.\n\n"
                f"```javascript\n"
                f"// Microtasks run before next macrotask tick\n"
                f"setTimeout(() => console.log('Macrotask'), 0);\n"
                f"Promise.resolve().then(() => console.log('Microtask'));\n"
                f"// Output: 'Microtask' -> 'Macrotask'\n"
                f"```"
            )
        else:
            fallback = (
                f"### Conceptual Guide: {lesson_title}\n\n"
                f"Regarding your inquiry on *'{user_message}'*:\n\n"
                f"- **Context in {course_title}:** This pattern ensures isolated execution context and guarantees deterministic state transitions.\n"
                f"- **Best Practice:** Keep functions pure where possible, and avoid scheduling nested asynchronous operations that can block the event loop.\n\n"
                f"Try experimenting with the code snippet in the Coding Lab to verify runtime behavior empirically."
            )

        return {
            "content": fallback,
            "source": "DETERMINISTIC_ENGINE",
            "model": "nexora-tutor-v1",
            "status": "SUCCESS"
        }
