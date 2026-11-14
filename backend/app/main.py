import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.database_expansion import run_database_expansion
from app.data.seed_data import seed_database
from app.data.seed_expansion import seed_expanded_features
from app.routers import (
    auth, admin, profile, careers, skills, assessments, roadmap, progress, mentor, agents,
    learning, coding_lab, project_studio, interview, resume, goals, achievements, opportunities
)

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("nexora")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing NEXORA Database and Seeding Knowledge Graph...")
    init_db()
    run_database_expansion()
    seed_database()
    seed_expanded_features()
    logger.info("NEXORA Full Intelligence Platform Ready.")
    yield
    logger.info("NEXORA Backend shutdown.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=f"{settings.TAGLINE} — {settings.DESCRIPTION}",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers under /api
app.include_router(auth.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(careers.router, prefix="/api")
app.include_router(skills.router, prefix="/api")
app.include_router(assessments.router, prefix="/api")
app.include_router(roadmap.router, prefix="/api")
app.include_router(progress.router, prefix="/api")
app.include_router(mentor.router, prefix="/api")
app.include_router(agents.router, prefix="/api")

# Mount Expanded Feature Routers under /api
app.include_router(learning.router, prefix="/api")
app.include_router(coding_lab.router, prefix="/api")
app.include_router(project_studio.router, prefix="/api")
app.include_router(interview.router, prefix="/api")
app.include_router(resume.router, prefix="/api")
app.include_router(goals.router, prefix="/api")
app.include_router(achievements.router, prefix="/api")
app.include_router(opportunities.router, prefix="/api")

@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "HEALTHY",
        "service": "NEXORA Intelligence Core",
        "version": settings.VERSION,
        "database": "CONNECTED",
        "tagline": settings.TAGLINE
    }

@app.get("/api", tags=["System"])
def root_info():
    return {
        "product": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "status": "ONLINE",
        "docs": "/docs"
    }
