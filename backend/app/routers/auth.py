import uuid
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from app.database import get_db
from app.models.schemas import RegisterRequest, LoginRequest, AuthResponse, UserResponse
from app.services.security import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    Extracts learner ID from token header, or falls back to standard demo learner.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        # In this implementation, token is either the learner_id or a valid token
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM learners WHERE id = ?", (token,))
            row = cursor.fetchone()
            if row:
                return row["id"]
    # Fallback to seeded demo user
    return "learner-alex-mercer"

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
            INSERT INTO learners (id, email, password_hash, full_name, headline)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, req.email, hashed, req.full_name, req.headline or "NEXORA Learner"))

        # Create empty profile
        cursor.execute("""
            INSERT INTO profiles (id, learner_id, target_career_id)
            VALUES (?, ?, 'career-full-stack-developer')
        """, (str(uuid.uuid4()), user_id))

        user_data = UserResponse(
            id=user_id,
            email=req.email,
            full_name=req.full_name,
            headline=req.headline or "NEXORA Learner"
        )
        return AuthResponse(token=user_id, user=user_data)

@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM learners WHERE email = ?", (req.email,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        # Check if demo account or verify hash
        if user["id"] == "learner-alex-mercer" and req.password in ("Password123!", "demo", "password"):
            valid = True
        else:
            valid = verify_password(req.password, user["password_hash"])

        if not valid:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        user_data = UserResponse(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            headline=user["headline"]
        )
        return AuthResponse(token=user["id"], user=user_data)

@router.get("/me", response_model=UserResponse)
def get_current_user(user_id: str = Depends(get_current_user_id)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM learners WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
        return UserResponse(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            headline=user["headline"]
        )
