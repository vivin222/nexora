"""
NEXORA AI Engine.
Integrates with Google Gemini via the official google-genai SDK,
providing structured generation, safety controls, and graceful deterministic fallbacks.
"""
import logging
import json
from typing import Optional, Dict, Any, List
from app.config import settings

logger = logging.getLogger("nexora.ai")

class AIService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self.client = None
        self._init_client()

    def _init_client(self):
        if self.api_key and self.api_key.strip():
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key.strip())
                logger.info(f"Gemini Client initialized with model {self.model_name}")
            except Exception as e:
                logger.warning(f"Could not initialize Gemini Client: {e}. Fallback mode active.")
                self.client = None
        else:
            logger.info("No GEMINI_API_KEY detected. Running in high-fidelity deterministic intelligence mode.")
            self.client = None

    def is_ai_live(self) -> bool:
        return self.client is not None

    def generate_mentor_response(
        self,
        user_message: str,
        learner_context: Dict[str, Any],
        conversation_history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Generate contextual AI Mentor advice incorporating learner profile,
        current skill gaps, active roadmap, and career aspirations.
        """
        system_instruction = (
            "You are NEXORA AI Mentor, an elite career intelligence and learning architect. "
            "Your mission is to provide personalized, rigorous, encouraging, and highly actionable guidance. "
            "Always tailor answers strictly to the learner's actual profile, active career goal, and identified skill gaps. "
            "Never offer generic platitudes. Reference their specific skills, progress percentages, and concrete next actions."
        )

        context_summary = (
            f"Learner Name: {learner_context.get('name', 'Learner')}\n"
            f"Target Career: {learner_context.get('target_career_title', 'Not specified')}\n"
            f"Career Match Score: {learner_context.get('match_score', 0)}%\n"
            f"Key Strengths: {', '.join(learner_context.get('strengths', [])) or 'None recorded yet'}\n"
            f"High-Priority Skill Gaps: {', '.join(learner_context.get('skill_gaps', [])) or 'None recorded yet'}\n"
            f"Active Roadmap Progress: {learner_context.get('roadmap_progress', 0)}%\n"
            f"Recent Assessment Status: {learner_context.get('recent_assessment', 'No recent test')}\n"
        )

        full_prompt = (
            f"{system_instruction}\n\n"
            f"LEARNER CONTEXT:\n{context_summary}\n\n"
            f"STUDENT INQUIRY:\n{user_message}\n\n"
            f"Provide a concise, highly structured, expert mentor answer with actionable bullet points where appropriate."
        )

        # Attempt Gemini Live API call
        if self.client:
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=full_prompt
                )
                if response and response.text:
                    return {
                        "content": response.text.strip(),
                        "model": self.model_name,
                        "source": "GEMINI_API",
                        "status": "SUCCESS"
                    }
            except Exception as e:
                logger.error(f"Gemini API generation error: {e}. Falling back gracefully.")

        # High-Fidelity Deterministic Fallback Engine
        return self._generate_fallback_mentor_reply(user_message, learner_context)

    def _generate_fallback_mentor_reply(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        msg_lower = message.lower()
        career = context.get('target_career_title', 'Full Stack Developer')
        score = context.get('match_score', 0)
        gaps = context.get('skill_gaps', [])
        strengths = context.get('strengths', [])

        gaps_str = ", ".join(gaps[:3]) if gaps else "core engineering competencies"
        strengths_str = ", ".join(strengths[:2]) if strengths else "fundamental concepts"

        if "roadmap" in msg_lower or "next" in msg_lower or "start" in msg_lower:
            reply = (
                f"### Strategic Action Plan for {career}\n\n"
                f"With your current readiness score at **{score}%**, your highest leverage move is tackling **{gaps_str}**.\n\n"
                f"**Immediate 3-Step Recommendation:**\n"
                f"1. **Primary Focus:** Work through the high-priority milestone on your roadmap targeting **{gaps[0] if gaps else 'JavaScript'}**.\n"
                f"2. **Leverage Strengths:** Use your solid foundation in **{strengths_str}** to bridge into component architecture and API contracts.\n"
                f"3. **Milestone Verification:** Once you complete the assigned exercises, take the adaptive assessment to recalibrate your readiness score."
            )
        elif "gap" in msg_lower or "weak" in msg_lower or "score" in msg_lower:
            reply = (
                f"### Skill Gap Diagnostic Analysis\n\n"
                f"Your current career match score for **{career}** is **{score}%**.\n\n"
                f"- **Priority Competencies Needed:** {gaps_str}\n"
                f"- **Confirmed Strengths:** {strengths_str}\n\n"
                f"Why this matters: In a {career} role, employers look for end-to-end fluency. Bridging your gap in {gaps[0] if gaps else 'JavaScript'} "
                f"will boost your composite readiness score by approximately 18-24 points."
            )
        elif "javascript" in msg_lower or "js" in msg_lower:
            reply = (
                f"### JavaScript Mastery Path\n\n"
                f"Mastering JavaScript is your critical linchpin for **{career}**.\n\n"
                f"1. **Core Runtime:** Focus on the event loop (microtasks vs macrotasks), closures, and Promise execution order.\n"
                f"2. **Hands-on Exercise:** Build an asynchronous task queue or state-driven component without third-party libraries.\n"
                f"3. **Assessment:** Take our interactive JavaScript assessment once you've reviewed the closures and event loop modules."
            )
        elif "react" in msg_lower:
            reply = (
                f"### React Architecture Deep Dive\n\n"
                f"React requires shifting from imperative DOM manipulation to declarative state modeling.\n\n"
                f"- **Key Concepts to Master:** Unidirectional data flow, pure component rendering, dependency arrays in `useEffect`, and memoization patterns.\n"
                f"- **Recommended Project:** Build a modular dashboard widget that consumes mock APIs and manages loading and error states cleanly."
            )
        else:
            reply = (
                f"### NEXORA Mentor Guidance\n\n"
                f"Welcome, {context.get('name', 'Learner')}. As your career intelligence mentor for **{career}** (Current match: **{score}%**), "
                f"I'm tracking your progression across the learning graph.\n\n"
                f"Your profile shows strong mastery in **{strengths_str}**, while your immediate growth opportunity lies in **{gaps_str}**.\n\n"
                f"How would you like to proceed? We can:\n"
                f"- Review your next roadmap milestone\n"
                f"- Break down a specific skill or technical concept\n"
                f"- Run an adaptive assessment to verify your recent progress"
            )

        return {
            "content": reply,
            "model": "nexora-deterministic-mentor-v1",
            "source": "DETERMINISTIC_ENGINE",
            "status": "SUCCESS"
        }

ai_service = AIService()
