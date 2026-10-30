import json
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, BusinessPlan, EntrepreneurProfile
from backend.schemas import BusinessPlanOut, BusinessPlanSection, BusinessPlanSectionUpdate
from backend.auth import get_current_user
from backend.ai_engine import CentralAIEngine

router = APIRouter(prefix="/api/business-plan", tags=["Business Plan Generator"])

def format_plan_out(p: BusinessPlan) -> BusinessPlanOut:
    raw_sections = json.loads(p.sections) if p.sections else []
    sec_objs = []
    for s in raw_sections:
        sec_objs.append(BusinessPlanSection(
            key=s.get("key", ""),
            title=s.get("title", ""),
            content=s.get("content", ""),
            is_edited=s.get("is_edited", False),
            last_regenerated=s.get("last_regenerated", None)
        ))
    return BusinessPlanOut(
        id=p.id,
        title=p.title,
        stage=p.stage,
        plan_type=p.plan_type,
        sections=sec_objs,
        financial_estimates=json.loads(p.financial_estimates) if p.financial_estimates else {},
        explicit_assumptions=json.loads(p.explicit_assumptions) if p.explicit_assumptions else [],
        created_at=p.created_at,
        updated_at=p.updated_at
    )

@router.get("/latest", response_model=BusinessPlanOut)
def get_latest_business_plan(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = db.query(BusinessPlan).filter(BusinessPlan.user_id == current_user.id).order_by(BusinessPlan.updated_at.desc()).first()
    if not plan:
        profile = db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == current_user.id).first()
        prof_dict = {
            "business_idea": profile.business_idea if profile else "Women enterprise",
            "business_domain": profile.business_domain if profile else "Fashion & Apparel",
            "current_stage": profile.current_stage if profile else "Idea Stage",
            "available_investment": profile.available_investment if profile else 50000.0,
            "expected_investment": profile.expected_investment if profile else 150000.0,
            "business_model": profile.business_model if profile else "Online",
            "location_type": profile.location_type if profile else "Semi-Urban",
            "state": profile.state if profile else "Karnataka"
        }
        generated = CentralAIEngine.generate_adaptive_business_plan(prof_dict)
        plan = BusinessPlan(
            user_id=current_user.id,
            title=generated["title"],
            stage=generated["stage"],
            plan_type=generated["plan_type"],
            sections=json.dumps(generated["sections"]),
            financial_estimates=json.dumps(generated["financial_estimates"]),
            explicit_assumptions=json.dumps(generated["explicit_assumptions"])
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)

    return format_plan_out(plan)

@router.post("/section/update", response_model=BusinessPlanOut)
def update_plan_section(req: BusinessPlanSectionUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = db.query(BusinessPlan).filter(BusinessPlan.user_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Business plan not found.")

    sections = json.loads(plan.sections) if plan.sections else []
    updated = False
    for s in sections:
        if s.get("key") == req.section_key:
            s["content"] = req.content
            s["is_edited"] = True
            updated = True
            break
    
    if not updated:
        raise HTTPException(status_code=404, detail=f"Section {req.section_key} not found.")

    plan.sections = json.dumps(sections)
    plan.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(plan)

    return format_plan_out(plan)

@router.post("/section/{section_key}/regenerate", response_model=BusinessPlanOut)
def regenerate_plan_section(section_key: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = db.query(BusinessPlan).filter(BusinessPlan.user_id == current_user.id).first()
    profile = db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == current_user.id).first()
    if not plan or not profile:
        raise HTTPException(status_code=404, detail="Business plan or profile not found.")

    prof_dict = {
        "business_idea": profile.business_idea,
        "business_domain": profile.business_domain,
        "current_stage": profile.current_stage,
        "available_investment": profile.available_investment,
        "expected_investment": profile.expected_investment,
        "business_model": profile.business_model,
        "location_type": profile.location_type,
        "state": profile.state
    }
    fresh_plan = CentralAIEngine.generate_adaptive_business_plan(prof_dict)
    
    sections = json.loads(plan.sections) if plan.sections else []
    for fresh_s in fresh_plan["sections"]:
        if fresh_s.get("key") == section_key:
            for existing_s in sections:
                if existing_s.get("key") == section_key:
                    existing_s["content"] = fresh_s["content"] + f" [AI re-calibrated on {datetime.datetime.utcnow().strftime('%b %d')}]"
                    existing_s["is_edited"] = False
                    existing_s["last_regenerated"] = datetime.datetime.utcnow().isoformat()
                    break
            break

    plan.sections = json.dumps(sections)
    plan.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(plan)

    return format_plan_out(plan)
