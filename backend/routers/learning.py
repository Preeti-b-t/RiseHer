import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import User, LearningResource, UserResourceProgress, EntrepreneurProfile
from backend.schemas import LearningResourceOut, ResourceStatusUpdate
from backend.auth import get_current_user

router = APIRouter(prefix="/api/learning", tags=["Learning & Resources"])

@router.get("/resources", response_model=List[LearningResourceOut])
def get_learning_resources(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == current_user.id).first()
    user_domain = profile.business_domain if profile else "Fashion & Apparel"
    user_stage = profile.current_stage if profile else "Idea Stage"

    all_res = db.query(LearningResource).all()
    user_progress = {
        p.resource_id: p.status
        for p in db.query(UserResourceProgress).filter(UserResourceProgress.user_id == current_user.id).all()
    }

    results = []
    for r in all_res:
        rel_domains = json.loads(r.relevant_domains) if r.relevant_domains else ["All"]
        rel_stages = json.loads(r.relevant_stages) if r.relevant_stages else ["All"]

        is_domain_match = "All" in rel_domains or user_domain in rel_domains
        is_stage_match = "All" in rel_stages or user_stage in rel_stages

        # Filter or prioritize
        status = user_progress.get(r.id, "not_started")
        results.append(LearningResourceOut(
            id=r.id,
            title=r.title,
            description=r.description,
            category=r.category,
            difficulty=r.difficulty,
            estimated_duration=r.estimated_duration,
            source_name=r.source_name,
            external_url=r.external_url,
            status=status
        ))
    return results

@router.post("/resource/{res_id}/status")
def update_resource_status(res_id: int, status: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prog = db.query(UserResourceProgress).filter(
        UserResourceProgress.user_id == current_user.id,
        UserResourceProgress.resource_id == res_id
    ).first()

    if prog:
        prog.status = status
        if status == "completed":
            prog.completed_at = datetime.utcnow()
    else:
        prog = UserResourceProgress(
            user_id=current_user.id,
            resource_id=res_id,
            status=status,
            completed_at=datetime.utcnow() if status == "completed" else None
        )
        db.add(prog)

    db.commit()
    return {"message": f"Resource marked as {status}."}
