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

class GoogleAuthRequest(BaseModel):
    id_token: str
    credential: Optional[str] = None

class GitHubAuthRequest(BaseModel):
    code: str
    redirect_uri: Optional[str] = None

class JuryLoginRequest(BaseModel):
    passkey: Optional[str] = None

class ActivityTimelineEvent(BaseModel):
    id: str
    event_type: str
    title: str
    description: str
    category: str
    timestamp: str
    metadata: Optional[Dict[str, Any]] = {}

class CareerReadinessReport(BaseModel):
    learner_id: str
    career_id: str
    career_title: str
    readiness_score: int
    readiness_level: str
    score_breakdown: Dict[str, Any]
    formula_explanation: str
    verified_skills_count: int
    skill_gap_count: int
    top_strengths: List[Dict[str, Any]]
    critical_gaps: List[Dict[str, Any]]
    recommended_sprints: List[Dict[str, Any]]
    estimated_weeks_to_market_ready: int

class WeeklyGrowthReview(BaseModel):
    learner_id: str
    week_start: str
    hours_invested: float
    target_hours: float
    modules_completed: int
    assessments_completed: int
    average_assessment_score: float
    streak_days: int
    velocity_indicator: str
    neglected_skills: List[str]
    ai_sprint_actions: List[Dict[str, Any]]

class AdminPlatformHealth(BaseModel):
    status: str
    database_status: str
    total_registered_learners: int
    active_students: int
    admin_accounts: int
    total_assessments_taken: int
    total_coding_solutions: int
    total_project_milestones: int
    ai_agent_status: str
    model_version: str

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
