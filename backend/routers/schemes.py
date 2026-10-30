import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import User, Scheme, SchemeMatch, EntrepreneurProfile
from backend.schemas import SchemeMatchOut, SchemeOut, DocumentChecklistUpdate, ApplicationStatusUpdate
from backend.auth import get_current_user
from backend.ai_engine import CentralAIEngine

router = APIRouter(prefix="/api/schemes", tags=["SmartGov Connect"])

def format_scheme_out(s: Scheme) -> SchemeOut:
    return SchemeOut(
        id=s.id,
        name=s.name,
        short_code=s.short_code,
        scheme_type=s.scheme_type,
        ministry_or_dept=s.ministry_or_dept,
        financial_assistance_type=s.financial_assistance_type,
        max_amount_inr=s.max_amount_inr,
        subsidy_percentage=s.subsidy_percentage,
        min_age=s.min_age,
        eligible_genders=s.eligible_genders,
        eligible_stages=json.loads(s.eligible_stages) if s.eligible_stages else [],
        eligible_domains=json.loads(s.eligible_domains) if s.eligible_domains else [],
        eligible_locations=json.loads(s.eligible_locations) if s.eligible_locations else [],
        online_offline_suitability=s.online_offline_suitability,
        benefits_description=s.benefits_description,
        required_documents=json.loads(s.required_documents) if s.required_documents else [],
        official_website_url=s.official_website_url,
        application_portal_url=s.application_portal_url,
        application_status=s.application_status,
        status_detail=s.status_detail,
        last_verified_date=s.last_verified_date
    )

@router.get("/matches", response_model=List[SchemeMatchOut])
def get_user_scheme_matches(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    matches = db.query(SchemeMatch).filter(SchemeMatch.user_id == current_user.id).all()
    
    # If no matches exist yet, run matching against all available schemes
    if not matches:
        profile = db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == current_user.id).first()
        prof_dict = {
            "business_idea": profile.business_idea if profile else "Women venture",
            "business_domain": profile.business_domain if profile else "Fashion & Apparel",
            "current_stage": profile.current_stage if profile else "Idea Stage",
            "available_investment": profile.available_investment if profile else 50000.0,
            "expected_investment": profile.expected_investment if profile else 150000.0,
            "business_model": profile.business_model if profile else "Online",
            "location_type": profile.location_type if profile else "Semi-Urban",
            "state": profile.state if profile else "Karnataka",
            "skills": profile.skills if profile else []
        }
        schemes = db.query(Scheme).all()
        for s in schemes:
            s_dict = {
                "name": s.name,
                "short_code": s.short_code,
                "min_age": s.min_age,
                "eligible_stages": s.eligible_stages,
                "eligible_domains": s.eligible_domains,
                "max_amount_inr": s.max_amount_inr,
                "application_status": s.application_status,
                "eligible_locations": s.eligible_locations,
                "financial_assistance_type": s.financial_assistance_type
            }
            res = CentralAIEngine.calculate_scheme_fit(prof_dict, s_dict)
            docs = json.loads(s.required_documents) if s.required_documents else []
            checklist = {d: ("available" if d in ["Aadhaar Card", "PAN Card"] else "pending") for d in docs}
            sm = SchemeMatch(
                user_id=current_user.id,
                scheme_id=s.id,
                scheme_fit_score=res["scheme_fit_score"],
                eligibility_score=res["eligibility_score"],
                sector_relevance_score=res["sector_relevance_score"],
                financial_suitability_score=res["financial_suitability_score"],
                availability_score=res["availability_score"],
                readiness_score=res["readiness_score"],
                location_stage_score=res["location_stage_score"],
                why_matched=res["why_matched"],
                is_eligible=res["is_eligible"],
                eligibility_notes=res["eligibility_notes"],
                application_status="shortlisted",
                document_checklist_state=json.dumps(checklist)
            )
            db.add(sm)
        db.commit()
        matches = db.query(SchemeMatch).filter(SchemeMatch.user_id == current_user.id).all()

    # Sort by scheme_fit_score descending
    matches.sort(key=lambda x: x.scheme_fit_score, reverse=True)

    result = []
    for m in matches:
        result.append(SchemeMatchOut(
            id=m.id,
            scheme=format_scheme_out(m.scheme),
            scheme_fit_score=m.scheme_fit_score,
            eligibility_score=m.eligibility_score,
            sector_relevance_score=m.sector_relevance_score,
            financial_suitability_score=m.financial_suitability_score,
            availability_score=m.availability_score,
            readiness_score=m.readiness_score,
            location_stage_score=m.location_stage_score,
            why_matched=m.why_matched or "",
            is_eligible=m.is_eligible,
            eligibility_notes=m.eligibility_notes,
            application_status=m.application_status,
            document_checklist_state=json.loads(m.document_checklist_state) if m.document_checklist_state else {},
            user_notes=m.user_notes,
            updated_at=m.updated_at
        ))
    return result

@router.get("/all", response_model=List[SchemeOut])
def get_all_schemes(db: Session = Depends(get_db)):
    schemes = db.query(Scheme).all()
    return [format_scheme_out(s) for s in schemes]

@router.post("/checklist/update")
def update_document_checklist(req: DocumentChecklistUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    match = db.query(SchemeMatch).filter(SchemeMatch.id == req.scheme_match_id, SchemeMatch.user_id == current_user.id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Scheme match record not found.")
    
    current_state = json.loads(match.document_checklist_state) if match.document_checklist_state else {}
    current_state[req.document_name] = req.status
    match.document_checklist_state = json.dumps(current_state)
    db.commit()
    return {"message": "Document checklist updated", "document_checklist_state": current_state}

@router.post("/application/update")
def update_application_status(req: ApplicationStatusUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    match = db.query(SchemeMatch).filter(SchemeMatch.id == req.scheme_match_id, SchemeMatch.user_id == current_user.id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Scheme match record not found.")
    
    match.application_status = req.status
    if req.user_notes:
        match.user_notes = req.user_notes
    db.commit()
    return {"message": f"Application status updated to {req.status}"}
