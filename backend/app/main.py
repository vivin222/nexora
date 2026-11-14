import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.database_expansion import run_database_expansion
from app.data.seed_data import seed_database
from app.data.seed_expansion import seed_expanded_features
from app.routers import (
    auth, admin, profile, careers, skills, assessments, roadmap, progress, mentor, agents,
    learning, coding_lab, project_studio, interview, resume, goals, achievements, opportunities,
    missions, simulator
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
    seed_database()
    run_database_expansion()
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
    allow_origin_regex=r"https://.*\.onrender\.com",
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
app.include_router(missions.router, prefix="/api")
app.include_router(simulator.router, prefix="/api")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Internal server error processing {request.method} {request.url.path}: {exc}", exc_info=True)
    origin = request.headers.get("origin", "")
    allowed_origin = origin if ("onrender.com" in origin or "localhost" in origin or origin in settings.CORS_ORIGINS) else (settings.CORS_ORIGINS[0] if settings.CORS_ORIGINS else "*")
    headers = {
        "Access-Control-Allow-Origin": allowed_origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
    }
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Telemetry has been recorded."},
        headers=headers
    )

@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "HEALTHY",
        "service": "NEXORA Intelligence Core",
        "version": settings.VERSION,
        "database": "CONNECTED",
        "tagline": settings.TAGLINE
    }

@app.get("/", tags=["System"])
@app.get("/api", tags=["System"])
def root_info():
    return {
        "product": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "status": "ONLINE",
        "docs": "/docs",
        "health": "/api/health",
        "frontend": "http://localhost:5173"
    }
