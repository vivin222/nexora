from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# --- Auth & User ---
class RegisterRequest(BaseModel):
    email: str = Field(min_length=3)
    password: str = Field(min_length=6)
    full_name: str
    headline: Optional[str] = ""

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    headline: str
    onboarding_completed: bool = False
    is_demo: bool = False

class AuthResponse(BaseModel):
    token: str
    user: UserResponse
    onboarding_completed: bool = False

class ForgotPasswordRequest(BaseModel):
    email: str

class SkillItem(BaseModel):
    skill_id: str
    proficiency: int = Field(ge=0, le=100)

class OnboardingSubmitRequest(BaseModel):
    full_name: str
    headline: Optional[str] = ""
    education_level: Optional[str] = ""
    institution: Optional[str] = ""
    department: Optional[str] = ""
    academic_year: Optional[str] = ""
    target_career_id: str
    career_interests: Optional[List[str]] = []
    short_term_goal: Optional[str] = ""
    long_term_goal: Optional[str] = ""
    weekly_hours: Optional[int] = 10
    learning_preferences: Optional[List[str]] = []
    skills: List[SkillItem] = []
    frameworks_and_tools: Optional[List[str]] = []
    certifications: Optional[List[str]] = []
    projects: Optional[List[Dict[str, Any]]] = []
    github_url: Optional[str] = ""
    portfolio_url: Optional[str] = ""
    resume_text: Optional[str] = ""
    resume_extracted_data: Optional[Dict[str, Any]] = {}

class ResumeExtractRequest(BaseModel):
    resume_text: str

# --- Profile ---

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    headline: Optional[str] = None
    education: Optional[str] = None
    bio: Optional[str] = None
    target_career_id: Optional[str] = None
    interests: Optional[List[str]] = None
    skills: Optional[List[SkillItem]] = None

# --- Career & Matching ---
class CareerSelectRequest(BaseModel):
    career_id: str

# --- Assessment ---
class AssessmentSubmitRequest(BaseModel):
    assessment_id: str
    answers: Dict[str, int] # {question_id: selected_option_index}

# --- Roadmap ---
class MilestoneToggleRequest(BaseModel):
    completed: bool

# --- AI Mentor ---
class MentorChatRequest(BaseModel):
    message: str
