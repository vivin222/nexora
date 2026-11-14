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

class AuthResponse(BaseModel):
    token: str
    user: UserResponse

# --- Profile ---
class SkillItem(BaseModel):
    skill_id: str
    proficiency: int = Field(ge=0, le=100)

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
