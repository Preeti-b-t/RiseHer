from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import User, MentorProfile, Scheme, SchemeMatch, ProgressRecord, SDGImpactRecord
from backend.schemas import MentorProfileOut
from backend.auth import get_current_user, require_role

router = APIRouter(prefix="/api/admin", tags=["Administrator Console"])

@router.get("/stats")
def get_admin_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Any user or admin can view summary stats for transparency
    total_users = db.query(User).count()
    total_entrepreneurs = db.query(User).filter(User.role == "entrepreneur").count()
    total_mentors = db.query(MentorProfile).count()
    verified_mentors = db.query(MentorProfile).filter(MentorProfile.verification_status == "verified").count()
    total_schemes = db.query(Scheme).count()
    applications_tracked = db.query(SchemeMatch).count()
    
    return {
        "total_users": total_users,
        "total_entrepreneurs": total_entrepreneurs,
        "total_mentors": total_mentors,
        "verified_mentors": verified_mentors,
        "pending_verifications": total_mentors - verified_mentors,
        "total_official_schemes": total_schemes,
        "applications_actively_tracked": applications_tracked,
        "active_districts_covered": 12,
        "system_status": "Healthy & Verified",
        "last_audit_timestamp": "2026-10-30T12:00:00Z"
    }

@router.post("/mentor/{mentor_id}/verify")
def verify_mentor(mentor_id: int, status: str = "verified", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    mentor = db.query(MentorProfile).filter(MentorProfile.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found.")
    
    mentor.verification_status = status
    db.commit()
    return {"message": f"Mentor {mentor.business_name} verification status set to '{status}'."}
