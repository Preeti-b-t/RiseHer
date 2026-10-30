import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import load_environment_files
load_environment_files()
from backend.database import engine, Base, SessionLocal
from backend.seed_data import seed_database
from backend.routers import (
    auth, profile, analysis, risk, schemes,
    mentors, messages, business_plan, roadmap,
    progress, learning, sdg, community, admin
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

# Seed database with realistic scenario data
with SessionLocal() as db:
    seed_database(db)

app = FastAPI(
    title="RiseHer API",
    description="AI-Powered Women Entrepreneurship Intelligence, Guidance & Empowerment Platform",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(analysis.router)
app.include_router(risk.router)
app.include_router(schemes.router)
app.include_router(mentors.router)
app.include_router(messages.router)
app.include_router(business_plan.router)
app.include_router(roadmap.router)
app.include_router(progress.router)
app.include_router(learning.router)
app.include_router(sdg.router)
app.include_router(community.router)
app.include_router(admin.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "database": "connected"}

from fastapi.responses import FileResponse
from pathlib import Path

@app.get("/api/download-zip")
def download_project_zip():
    zip_path = Path(__file__).resolve().parent.parent / "RiseHer_Complete_Project.zip"
    if zip_path.exists():
        return FileResponse(
            path=str(zip_path),
            filename="RiseHer_Complete_Project.zip",
            media_type="application/zip"
        )
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="ZIP archive not found")

@app.get("/api/download-frontend-zip")
def download_frontend_zip():
    zip_path = Path(__file__).resolve().parent.parent / "RiseHer_Frontend.zip"
    if zip_path.exists():
        return FileResponse(
            path=str(zip_path),
            filename="RiseHer_Frontend.zip",
            media_type="application/zip"
        )
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Frontend ZIP archive not found")

# Serve frontend production build if available
from fastapi.staticfiles import StaticFiles

frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="static_assets")

    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="API endpoint not found")
        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "platform": "RiseHer",
            "tagline": "AI-Powered Women Entrepreneurship Intelligence, Guidance & Empowerment Platform",
            "status": "operational",
            "version": "1.0.0",
            "docs_url": "/docs"
        }
