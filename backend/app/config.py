import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env if present
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME: str = "NEXORA"
    VERSION: str = "1.0.0"
    TAGLINE: str = "Your Potential. Reimagined."
    DESCRIPTION: str = "Autonomous AI-powered personalized learning and career intelligence platform."

    # Server settings
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1")

    # Database
    DATABASE_PATH: str = os.getenv("DATABASE_PATH", str(Path(__file__).parent.parent / "nexora.db"))

    # AI Configuration (Official google-genai SDK)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "nexora-hyperion-intelligence-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
