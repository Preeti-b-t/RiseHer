import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.models import User, MentorProfile, MentorshipRequest, EntrepreneurProfile
from backend.schemas import (
    MentorProfileOut, MentorProfileUpdate, MentorshipRequestCreate, MentorshipRequestOut,
    MentorshipStatusUpdate, MentorshipFeedback
)
from backend.auth import get_current_user
from backend.ai_engine import CentralAIEngine

router = APIRouter(prefix="/api/mentors", tags=["Entrepreneur Connect"])

def format_mentor_out(m: MentorProfile) -> MentorProfileOut:
    return MentorProfileOut(
        id=m.id,
        user_id=m.user_id,
        name=m.user.full_name if m.user else "Mentor",
        avatar_url=m.user.avatar_url if m.user else None,
        business_name=m.business_name,
        business_domain=m.business_domain,
        years_experience=m.years_experience,
        business_description=m.business_description,
        location=m.location,
        expertise_areas=json.loads(m.expertise_areas) if m.expertise_areas else [],
        business_model_experience=m.business_model_experience,
        languages=json.loads(m.languages) if m.languages else [],
        availability_schedule=json.loads(m.availability_schedule) if m.availability_schedule else [],
        verification_status=m.verification_status,
        rating=m.rating,
        reviews_count=m.reviews_count,
        bio=m.bio,
        meeting_link=m.meeting_link,
        success_story=m.success_story,
        match_score=98.0,
        why_suitable_for_user="Verified Mentor Profile"
    )

@router.get("/me", response_model=MentorProfileOut)
def get_my_mentor_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    mentor = db.query(MentorProfile).filter(MentorProfile.user_id == current_user.id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor profile not found for this user account.")
    return format_mentor_out(mentor)

@router.put("/me", response_model=MentorProfileOut)
def update_my_mentor_profile(update: MentorProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    mentor = db.query(MentorProfile).filter(MentorProfile.user_id == current_user.id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor profile not found for this user account.")

    update_dict = update.model_dump(exclude_unset=True)
    if "expertise_areas" in update_dict and update_dict["expertise_areas"] is not None:
        mentor.expertise_areas = json.dumps(update_dict["expertise_areas"])
    if "languages" in update_dict and update_dict["languages"] is not None:
        mentor.languages = json.dumps(update_dict["languages"])
    if "availability_schedule" in update_dict and update_dict["availability_schedule"] is not None:
        mentor.availability_schedule = json.dumps(update_dict["availability_schedule"])

    for field in [
        "business_name", "business_domain", "years_experience", "business_description",
        "location", "business_model_experience", "bio", "meeting_link", "success_story"
    ]:
        if field in update_dict and update_dict[field] is not None:
            setattr(mentor, field, update_dict[field])

    db.commit()
    db.refresh(mentor)
    return format_mentor_out(mentor)

@router.get("/list", response_model=List[MentorProfileOut])
def get_mentors(domain: Optional[str] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == current_user.id).first()
    prof_dict = {
        "business_idea": profile.business_idea if profile else "",
        "business_domain": profile.business_domain if profile else "Fashion & Apparel",
        "current_stage": profile.current_stage if profile else "Idea Stage",
        "business_model": profile.business_model if profile else "Online",
        "state": profile.state if profile else "Karnataka",
        "challenges": profile.challenges if profile else []
    }

    query = db.query(MentorProfile).join(User, MentorProfile.user_id == User.id)
    if domain and domain != "All":
        query = query.filter(MentorProfile.business_domain == domain)
    
    mentors = query.all()

    mentors_raw = []
    for m in mentors:
        mentors_raw.append({
            "id": m.id,
            "user_id": m.user_id,
            "name": m.user.full_name,
            "avatar_url": m.user.avatar_url,
            "business_name": m.business_name,
            "business_domain": m.business_domain,
            "years_experience": m.years_experience,
            "business_description": m.business_description,
            "location": m.location,
            "expertise_areas": json.loads(m.expertise_areas) if m.expertise_areas else [],
            "business_model_experience": m.business_model_experience,
            "languages": json.loads(m.languages) if m.languages else [],
            "availability_schedule": json.loads(m.availability_schedule) if m.availability_schedule else [],
            "verification_status": m.verification_status,
            "rating": m.rating,
            "reviews_count": m.reviews_count,
            "bio": m.bio,
            "meeting_link": m.meeting_link,
            "success_story": m.success_story
        })

    # AI Mentor Matching ranking
    matched = CentralAIEngine.match_mentors(prof_dict, mentors_raw)
    return [MentorProfileOut(**m) for m in matched]

@router.post("/request", response_model=MentorshipRequestOut)
def request_mentorship(req: MentorshipRequestCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    mentor = db.query(MentorProfile).filter(MentorProfile.id == req.mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found.")
    
    new_req = MentorshipRequest(
        entrepreneur_id=current_user.id,
        mentor_id=mentor.id,
        subject=req.subject,
        domain=req.domain,
        message=req.message,
        preferred_slot=req.preferred_slot,
        status="pending",
        meeting_link=mentor.meeting_link
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)

    return MentorshipRequestOut(
        id=new_req.id,
        entrepreneur_id=new_req.entrepreneur_id,
        entrepreneur_name=current_user.full_name,
        entrepreneur_avatar=current_user.avatar_url,
        mentor_id=new_req.mentor_id,
        mentor_name=mentor.user.full_name,
        subject=new_req.subject,
        domain=new_req.domain,
        message=new_req.message,
        preferred_slot=new_req.preferred_slot,
        status=new_req.status,
        meeting_link=new_req.meeting_link,
        response_note=new_req.response_note,
        created_at=new_req.created_at
    )

@router.get("/my-requests", response_model=List[MentorshipRequestOut])
def get_my_mentorship_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "mentor":
        m_profile = db.query(MentorProfile).filter(MentorProfile.user_id == current_user.id).first()
        if not m_profile:
            return []
        requests = db.query(MentorshipRequest).filter(MentorshipRequest.mentor_id == m_profile.id).order_by(MentorshipRequest.created_at.desc()).all()
    else:
        requests = db.query(MentorshipRequest).filter(MentorshipRequest.entrepreneur_id == current_user.id).order_by(MentorshipRequest.created_at.desc()).all()

    result = []
    for r in requests:
        result.append(MentorshipRequestOut(
            id=r.id,
            entrepreneur_id=r.entrepreneur_id,
            entrepreneur_name=r.entrepreneur.full_name if r.entrepreneur else "Entrepreneur",
            entrepreneur_avatar=r.entrepreneur.avatar_url if r.entrepreneur else None,
            mentor_id=r.mentor_id,
            mentor_name=r.mentor.user.full_name if r.mentor and r.mentor.user else "Mentor",
            subject=r.subject,
            domain=r.domain,
            message=r.message,
            preferred_slot=r.preferred_slot,
            status=r.status,
            meeting_link=r.meeting_link,
            response_note=r.response_note,
            created_at=r.created_at
        ))
    return result

@router.post("/request/{req_id}/status")
def update_mentorship_status(req_id: int, update: MentorshipStatusUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    req = db.query(MentorshipRequest).filter(MentorshipRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Mentorship request not found.")
    
    req.status = update.status
    if update.meeting_link:
        req.meeting_link = update.meeting_link
    if update.response_note:
        req.response_note = update.response_note
    db.commit()
    return {"message": f"Mentorship request marked as {update.status}."}

@router.post("/request/{req_id}/feedback")
def submit_mentorship_feedback(req_id: int, feedback: MentorshipFeedback, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    req = db.query(MentorshipRequest).filter(MentorshipRequest.id == req_id, MentorshipRequest.entrepreneur_id == current_user.id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Mentorship request not found.")
    
    req.rating = feedback.rating
    req.feedback = feedback.feedback
    db.commit()
    return {"message": "Thank you! Feedback recorded successfully."}
