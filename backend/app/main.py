from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.logging import logger
from app.api.routers import health, auth, school, user, activity_log, student

# Ensure uploads folder exists
os.makedirs("uploads", exist_ok=True)

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for the Student Dropout Prediction System",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Mount uploads static folder
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Set up CORS middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include routers
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["System Health"])
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(school.router, prefix=f"{settings.API_V1_STR}/schools", tags=["School Management"])
app.include_router(user.router, prefix=f"{settings.API_V1_STR}/users", tags=["User Management"])
app.include_router(activity_log.router, prefix=f"{settings.API_V1_STR}/activity-logs", tags=["Activity Logs"])
app.include_router(student.router, prefix=settings.API_V1_STR)

@app.get("/")
def root_endpoint():
    """Root redirect / landing helper."""
    return {
        "message": f"Welcome to the {settings.PROJECT_NAME} API",
        "docs_url": "/docs",
        "health_url": f"{settings.API_V1_STR}/health"
    }

logger.info(f"{settings.PROJECT_NAME} backend application initialized successfully with Module 2.")

