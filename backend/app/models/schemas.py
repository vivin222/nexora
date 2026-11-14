from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# --- Auth & User ---
class RegisterRequest(BaseModel):
    email: str = Field(min_length=3)
    password: str = Field(min_length=6)
    full_name: str
    headline: Optional[str] = ""
    education_level: Optional[str] = "Undergraduate"
    institution: Optional[str] = ""
    department: Optional[str] = ""
    graduation_year: Optional[str] = ""

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    headline: str
    role: str = "student"
    status: str = "approved"
    rejection_reason: Optional[str] = ""
    education_level: Optional[str] = ""
    institution: Optional[str] = ""
    department: Optional[str] = ""
    graduation_year: Optional[str] = ""
    onboarding_completed: bool = False
    is_demo: bool = False

class AuthResponse(BaseModel):
    token: str
    user: UserResponse
    onboarding_completed: bool = False
    status: str = "approved"

class ForgotPasswordRequest(BaseModel):
    email: str

# --- Admin Management Schemas ---
class AdminStudentActionRequest(BaseModel):
    status: Optional[str] = None
    rejection_reason: Optional[str] = ""

class AdminResourceCreateRequest(BaseModel):
    skill_id: str
    title: str
    url: str
    provider: str
    resource_type: str = "docs"
    difficulty: str = "Intermediate"
    estimated_duration: str = "4 hours"
    is_free: int = 1

class AdminResourceUpdateRequest(BaseModel):
    skill_id: Optional[str] = None
    title: Optional[str] = None
    url: Optional[str] = None
    provider: Optional[str] = None
    resource_type: Optional[str] = None
    difficulty: Optional[str] = None
    estimated_duration: Optional[str] = None
    is_free: Optional[int] = None

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
