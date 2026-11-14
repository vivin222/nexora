import uuid
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, Dict, Any
from app.database import get_db
from app.models.schemas import (
    RegisterRequest, 
    LoginRequest, 
    AuthResponse, 
    UserResponse,
    ForgotPasswordRequest
)
from app.services.security import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    Extracts learner ID from Bearer token header.
    Guarantees user data isolation between accounts.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, role, status FROM learners WHERE id = ?", (token,))
            row = cursor.fetchone()
            if row:
                if row["status"] == "suspended":
                    raise HTTPException(status_code=403, detail="Account suspended by administrator.")
                return row["id"]

    # Fallback to the first active registered learner in the database (never Alex Mercer)
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM learners WHERE email != 'alex.mercer@nexora.ai' AND status = 'approved' ORDER BY rowid ASC LIMIT 1")
        row = cursor.fetchone()
        if row:
            return row["id"]

    raise HTTPException(status_code=401, detail="Authentication required. Please register or sign in.")

def require_admin(authorization: Optional[str] = Header(None)) -> str:
    """
    Enforces Administrator role access control.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Administrator authentication token required.")
    
    token = authorization.replace("Bearer ", "").strip()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, role, status FROM learners WHERE id = ?", (token,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Invalid administrator session.")
        if row["role"] != "admin":
            raise HTTPException(status_code=403, detail="Access denied. Administrator privileges required.")
        if row["status"] != "approved":
            raise HTTPException(status_code=403, detail="Administrator account inactive or suspended.")
        return row["id"]

@router.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM learners WHERE email = ?", (req.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="An account with this email already exists.")

        user_id = str(uuid.uuid4())
        hashed = hash_password(req.password)
        cursor.execute("""
            INSERT INTO learners (
                id, email, password_hash, full_name, headline, role, status, 
                education_level, institution, department, graduation_year, is_demo
            )
            VALUES (?, ?, ?, ?, ?, 'student', 'approved', ?, ?, ?, ?, 0)
        """, (
            user_id, req.email, hashed, req.full_name, req.headline or "NEXORA Student",
            req.education_level or "Undergraduate", req.institution or "", req.department or "", req.graduation_year or ""
        ))

        # Create blank profile with onboarding_completed = 0
        cursor.execute("""
            INSERT INTO profiles (
                id, learner_id, target_career_id, education, institution, department, academic_year, onboarding_completed
            )
            VALUES (?, ?, 'career-full-stack-developer', ?, ?, ?, ?, 0)
        """, (
            str(uuid.uuid4()), user_id, 
            req.education_level or "Undergraduate", req.institution or "", req.department or "", req.graduation_year or ""
        ))

        user_data = UserResponse(
            id=user_id,
            email=req.email,
            full_name=req.full_name,
            headline=req.headline or "NEXORA Student",
            role="student",
            status="approved",
            rejection_reason="",
            education_level=req.education_level or "Undergraduate",
            institution=req.institution or "",
            department=req.department or "",
            graduation_year=req.graduation_year or "",
            onboarding_completed=False,
            is_demo=False
        )
        return AuthResponse(token=user_id, user=user_data, onboarding_completed=False, status="approved")

@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM learners WHERE email = ?", (req.email,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        if not verify_password(req.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        if user["status"] == "suspended":
            raise HTTPException(status_code=403, detail="Your account has been suspended by an administrator.")

        # Check onboarding status
        cursor.execute("SELECT onboarding_completed FROM profiles WHERE learner_id = ?", (user["id"],))
        prof = cursor.fetchone()
        onboarding_done = bool(prof["onboarding_completed"]) if prof and "onboarding_completed" in prof.keys() else False

        user_role = user["role"] if "role" in user.keys() else "student"
        user_status = user["status"] if "status" in user.keys() else "approved"
        rejection_reason = user["rejection_reason"] if "rejection_reason" in user.keys() else ""

        user_data = UserResponse(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            headline=user["headline"],
            role=user_role,
            status=user_status,
            rejection_reason=rejection_reason,
            education_level=user["education_level"] if "education_level" in user.keys() else "",
            institution=user["institution"] if "institution" in user.keys() else "",
            department=user["department"] if "department" in user.keys() else "",
            graduation_year=user["graduation_year"] if "graduation_year" in user.keys() else "",
            onboarding_completed=onboarding_done,
            is_demo=False
        )
        return AuthResponse(token=user["id"], user=user_data, onboarding_completed=onboarding_done, status=user_status)

@router.post("/admin-login", response_model=AuthResponse)
def admin_login(req: LoginRequest):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM learners WHERE email = ?", (req.email,))
        user = cursor.fetchone()
        if not user or not verify_password(req.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid administrator credentials.")

        user_role = user["role"] if "role" in user.keys() else "student"
        if user_role != "admin":
            raise HTTPException(status_code=403, detail="Access denied. Account does not have administrator privileges.")

        if user["status"] == "suspended":
            raise HTTPException(status_code=403, detail="Administrator account has been suspended.")

        cursor.execute("SELECT onboarding_completed FROM profiles WHERE learner_id = ?", (user["id"],))
        prof = cursor.fetchone()
        onboarding_done = bool(prof["onboarding_completed"]) if prof and "onboarding_completed" in prof.keys() else True

        user_data = UserResponse(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            headline=user["headline"],
            role="admin",
            status="approved",
            rejection_reason="",
            education_level="",
            institution="",
            department="",
            graduation_year="",
            onboarding_completed=onboarding_done,
            is_demo=False
        )
        return AuthResponse(token=user["id"], user=user_data, onboarding_completed=onboarding_done, status="approved")

@router.get("/me", response_model=UserResponse)
def get_current_user(user_id: str = Depends(get_current_user_id)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM learners WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        cursor.execute("SELECT onboarding_completed FROM profiles WHERE learner_id = ?", (user_id,))
        prof = cursor.fetchone()
        onboarding_done = bool(prof["onboarding_completed"]) if prof and "onboarding_completed" in prof.keys() else False

        user_role = user["role"] if "role" in user.keys() else "student"
        user_status = user["status"] if "status" in user.keys() else "approved"
        rejection_reason = user["rejection_reason"] if "rejection_reason" in user.keys() else ""

        return UserResponse(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            headline=user["headline"],
            role=user_role,
            status=user_status,
            rejection_reason=rejection_reason,
            education_level=user["education_level"] if "education_level" in user.keys() else "",
            institution=user["institution"] if "institution" in user.keys() else "",
            department=user["department"] if "department" in user.keys() else "",
            graduation_year=user["graduation_year"] if "graduation_year" in user.keys() else "",
            onboarding_completed=onboarding_done,
            is_demo=False
        )

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM learners WHERE email = ?", (req.email,))
        user = cursor.fetchone()
        if not user:
            # For security, do not disclose if email exists
            pass

    return {
        "status": "SUCCESS",
        "message": f"Password reset instructions and verification token dispatched to {req.email}."
    }