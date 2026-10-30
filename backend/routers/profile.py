import json
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import (
    User, EntrepreneurProfile, BusinessAnalysis, RiskAssessment,
    Scheme, SchemeMatch, BusinessPlan, RoadmapTask
)
from backend.schemas import (
    EntrepreneurProfileCreate, EntrepreneurProfileUpdate, EntrepreneurProfileOut,
    ProfileAIRefreshResponse
)
from backend.auth import get_current_user
from backend.ai_engine import CentralAIEngine

router = APIRouter(prefix="/api/profile", tags=["Entrepreneur Profile"])

def format_profile_out(profile: EntrepreneurProfile) -> EntrepreneurProfileOut:
    return EntrepreneurProfileOut(
        id=profile.id,
        user_id=profile.user_id,
        age_range=profile.age_range,
        education=profile.education,
        skills=json.loads(profile.skills) if profile.skills else [],
        interests=json.loads(profile.interests) if profile.interests else [],
        work_experience=profile.work_experience,
        country=profile.country or "India",
        state=profile.state or "Karnataka",
        district=profile.district or "",
        city=profile.city or "",
        pincode=profile.pincode or "",
        location_type=profile.location_type or "Semi-Urban",
        business_location=profile.business_location or (f"{profile.city}, {profile.state}" if profile.city else profile.state),
        business_operating_area=profile.business_operating_area or "Local & City-wide",
        preferred_mentorship_location=profile.preferred_mentorship_location or (profile.city or profile.state),
        preferred_mentorship_mode=profile.preferred_mentorship_mode or "Hybrid",
        business_idea=profile.business_idea or "",
        business_domain=profile.business_domain or "Fashion & Apparel",
        industry=profile.industry,
        available_investment=profile.available_investment or 50000.0,
        expected_investment=profile.expected_investment or 150000.0,
        business_model=profile.business_model or "Online",
        current_status=profile.current_status,
        current_stage=profile.current_stage or "Idea Stage",
        challenges=json.loads(profile.challenges) if profile.challenges else [],
        profile_version=profile.profile_version or 1,
        updated_at=profile.updated_at
    )

def refresh_all_ai_recommendations(profile: EntrepreneurProfile, db: Session) -> dict:
    """
    Central Profile-Driven AI Refresh System:
    Recomputes BusinessAnalysis (with Dynamic Revenue Channels & Dynamic Competitor Landscape),
    RiskAssessment, SchemeMatch (100-point formula), Adaptive BusinessPlan, and Personalized Roadmap.
    """
    profile.profile_version = (profile.profile_version or 1) + 1
    profile.updated_at = datetime.datetime.utcnow()
    
    skills = json.loads(profile.skills) if profile.skills else []
    challenges = json.loads(profile.challenges) if profile.challenges else []
    interests = json.loads(profile.interests) if profile.interests else []

    prof_dict = {
        "business_idea": profile.business_idea or "Bespoke venture",
        "business_domain": profile.business_domain or "Fashion & Apparel",
        "current_stage": profile.current_stage or "Idea Stage",
        "available_investment": profile.available_investment or 50000.0,
        "expected_investment": profile.expected_investment or 150000.0,
        "business_model": profile.business_model or "Online",
        "location_type": profile.location_type or "Semi-Urban",
        "country": profile.country or "India",
        "state": profile.state or "Karnataka",
        "district": profile.district or "",
        "city": profile.city or "",
        "pincode": profile.pincode or "",
        "business_location": profile.business_location or (f"{profile.city}, {profile.state}" if profile.city else profile.state),
        "business_operating_area": profile.business_operating_area or "Local & City-wide",
        "preferred_mentorship_location": profile.preferred_mentorship_location or (profile.city or profile.state),
        "preferred_mentorship_mode": profile.preferred_mentorship_mode or "Hybrid",
        "skills": skills,
        "interests": interests,
        "challenges": challenges
    }

    # 1. AI Business Analysis & Dynamic Revenue Channels & Competitor Landscape
    analysis_data = CentralAIEngine.evaluate_business_idea(prof_dict)
    ba = db.query(BusinessAnalysis).filter(BusinessAnalysis.user_id == profile.user_id).order_by(BusinessAnalysis.created_at.desc()).first()
    if not ba:
        ba = BusinessAnalysis(user_id=profile.user_id)
        db.add(ba)
    
    ba.profile_version = profile.profile_version
    ba.idea_title = profile.business_idea[:60] if profile.business_idea else "New Venture"
    ba.idea_description = profile.business_idea or "New Venture"
    ba.domain = profile.business_domain or "Fashion & Apparel"
    ba.business_stage = profile.current_stage or "Idea Stage"
    ba.overall_viability_score = analysis_data["overall_viability_score"]
    ba.market_demand_summary = analysis_data["market_demand_summary"]
    ba.market_demand_score = analysis_data["market_demand_score"]
    ba.estimated_investment_min = analysis_data["estimated_investment_min"]
    ba.estimated_investment_max = analysis_data["estimated_investment_max"]
    ba.customer_segments = json.dumps(analysis_data["customer_segments"])
    ba.competitor_insights = json.dumps(analysis_data["competitor_insights"])
    ba.competitor_landscape_json = json.dumps(analysis_data.get("competitor_landscape", {}))
    ba.skills_compatibility = json.dumps(analysis_data["skills_compatibility"])
    ba.strengths = json.dumps(analysis_data["strengths"])
    ba.weaknesses = json.dumps(analysis_data["weaknesses"])
    ba.missing_information = json.dumps(analysis_data["missing_information"])
    ba.recommended_improvements = json.dumps(analysis_data["recommended_improvements"])
    ba.revenue_opportunities = json.dumps(analysis_data["revenue_opportunities"])
    ba.revenue_channels_json = json.dumps(analysis_data.get("revenue_channels", []))
    ba.operational_requirements = json.dumps(analysis_data["operational_requirements"])
    ba.evidence_breakdown = json.dumps(analysis_data["evidence_breakdown"])
    ba.explainability_factors = json.dumps(analysis_data["explainability_factors"])
    ba.confidence_score = analysis_data["confidence_score"]
    ba.created_at = datetime.datetime.utcnow()

    # 2. Risk Assessment
    risk_sim = {
        "available_investment": profile.available_investment or 50000.0,
        "expected_sales_units_monthly": 60.0,
        "average_price_per_unit": 950.0,
        "estimated_monthly_operating_cost": 25000.0,
        "business_model": profile.business_model or "Online",
        "location_type": profile.location_type or "Semi-Urban",
        "city": profile.city or "",
        "state": profile.state or "Karnataka"
    }
    risk_data = CentralAIEngine.calculate_risk_assessment(risk_sim, profile.business_domain or "Fashion & Apparel")
    ra = db.query(RiskAssessment).filter(RiskAssessment.user_id == profile.user_id).first()
    if not ra:
        ra = RiskAssessment(user_id=profile.user_id)
        db.add(ra)
    
    ra.financial_risk_score = risk_data["financial_risk"]["score"]
    ra.financial_risk_level = risk_data["financial_risk"]["level"]
    ra.financial_risk_factors = json.dumps(risk_data["financial_risk"]["factors"])
    ra.financial_mitigations = json.dumps(risk_data["financial_risk"]["mitigations"])
    ra.market_demand_risk_score = risk_data["market_demand_risk"]["score"]
    ra.market_demand_risk_level = risk_data["market_demand_risk"]["level"]
    ra.market_demand_factors = json.dumps(risk_data["market_demand_risk"]["factors"])
    ra.market_demand_mitigations = json.dumps(risk_data["market_demand_risk"]["mitigations"])
    ra.operational_risk_score = risk_data["operational_risk"]["score"]
    ra.operational_risk_level = risk_data["operational_risk"]["level"]
    ra.operational_factors = json.dumps(risk_data["operational_risk"]["factors"])
    ra.operational_mitigations = json.dumps(risk_data["operational_risk"]["mitigations"])
    ra.competition_risk_score = risk_data["competition_risk"]["score"]
    ra.competition_risk_level = risk_data["competition_risk"]["level"]
    ra.competition_factors = json.dumps(risk_data["competition_risk"]["factors"])
    ra.competition_mitigations = json.dumps(risk_data["competition_risk"]["mitigations"])
    ra.regulatory_risk_score = risk_data["regulatory_risk"]["score"]
    ra.regulatory_risk_level = risk_data["regulatory_risk"]["level"]
    ra.regulatory_factors = json.dumps(risk_data["regulatory_risk"]["factors"])
    ra.regulatory_mitigations = json.dumps(risk_data["regulatory_risk"]["mitigations"])
    ra.overall_risk_score = risk_data["overall_risk_score"]
    ra.overall_risk_level = risk_data["overall_risk_level"]
    ra.simulation_inputs = json.dumps(risk_sim)
    ra.missing_information = json.dumps(risk_data["missing_information"])
    ra.updated_at = datetime.datetime.utcnow()

    # 3. Scheme Matching
    schemes = db.query(Scheme).all()
    # Remove older matches to recalculate with new domain/location/budget
    db.query(SchemeMatch).filter(SchemeMatch.user_id == profile.user_id).delete()
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
            user_id=profile.user_id,
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

    # 4. Adaptive Business Plan
    plan_data = CentralAIEngine.generate_adaptive_business_plan(prof_dict)
    bp = db.query(BusinessPlan).filter(BusinessPlan.user_id == profile.user_id).first()
    if not bp:
        bp = BusinessPlan(user_id=profile.user_id)
        db.add(bp)
    bp.title = plan_data["title"]
    bp.stage = plan_data["stage"]
    bp.plan_type = plan_data["plan_type"]
    bp.sections = json.dumps(plan_data["sections"])
    bp.financial_estimates = json.dumps(plan_data["financial_estimates"])
    bp.explicit_assumptions = json.dumps(plan_data["explicit_assumptions"])
    bp.updated_at = datetime.datetime.utcnow()

    # 5. Personalized Roadmap Tasks
    tasks = CentralAIEngine.generate_personalized_roadmap(prof_dict)
    db.query(RoadmapTask).filter(RoadmapTask.user_id == profile.user_id, RoadmapTask.is_completed == False).delete()
    for t in tasks:
        task_obj = RoadmapTask(
            user_id=profile.user_id,
            title=t["title"],
            description=t["description"],
            timeframe=t["timeframe"],
            milestone_group=t["milestone_group"],
            priority=t["priority"],
            estimated_days=t["estimated_days"],
            deadline_date=t["deadline_date"],
            is_completed=t["is_completed"],
            dependencies=json.dumps(t["dependencies"])
        )
        db.add(task_obj)

    db.commit()
    db.refresh(profile)

    return {
        "profile_version": profile.profile_version,
        "updated_at": profile.updated_at,
        "updated_modules": [
            "viability_analysis",
            "revenue_channels",
            "competitor_landscape",
            "risk_assessment",
            "scheme_matches",
            "business_plan",
            "growth_roadmap"
        ]
    }

@router.get("/me", response_model=EntrepreneurProfileOut)
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Entrepreneur profile not found. Please complete onboarding.")
    return format_profile_out(profile)

@router.post("/onboarding", response_model=EntrepreneurProfileOut)
def save_onboarding(data: EntrepreneurProfileCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == current_user.id).first()
    
    skills_json = json.dumps(data.skills)
    interests_json = json.dumps(data.interests)
    challenges_json = json.dumps(data.challenges)

    if profile:
        profile.age_range = data.age_range
        profile.education = data.education
        profile.skills = skills_json
        profile.interests = interests_json
        profile.work_experience = data.work_experience
        profile.country = data.country or "India"
        profile.state = data.state
        profile.district = data.district
        profile.city = data.city
        profile.pincode = data.pincode
        profile.location_type = data.location_type
        profile.business_location = data.business_location or (f"{data.city}, {data.state}" if data.city else data.state)
        profile.business_operating_area = data.business_operating_area or "Local & City-wide"
        profile.preferred_mentorship_location = data.preferred_mentorship_location or (data.city or data.state)
        profile.preferred_mentorship_mode = data.preferred_mentorship_mode or "Hybrid"
        profile.business_idea = data.business_idea
        profile.business_domain = data.business_domain
        profile.industry = data.industry
        profile.available_investment = data.available_investment
        profile.expected_investment = data.expected_investment
        profile.business_model = data.business_model
        profile.current_status = data.current_status
        profile.current_stage = data.current_stage
        profile.challenges = challenges_json
    else:
        profile = EntrepreneurProfile(
            user_id=current_user.id,
            age_range=data.age_range,
            education=data.education,
            skills=skills_json,
            interests=interests_json,
            work_experience=data.work_experience,
            country=data.country or "India",
            state=data.state,
            district=data.district,
            city=data.city,
            pincode=data.pincode,
            location_type=data.location_type,
            business_location=data.business_location or (f"{data.city}, {data.state}" if data.city else data.state),
            business_operating_area=data.business_operating_area or "Local & City-wide",
            preferred_mentorship_location=data.preferred_mentorship_location or (data.city or data.state),
            preferred_mentorship_mode=data.preferred_mentorship_mode or "Hybrid",
            business_idea=data.business_idea,
            business_domain=data.business_domain,
            industry=data.industry,
            available_investment=data.available_investment,
            expected_investment=data.expected_investment,
            business_model=data.business_model,
            current_status=data.current_status,
            current_stage=data.current_stage,
            challenges=challenges_json,
            profile_version=1
        )
        db.add(profile)
    
    db.commit()
    db.refresh(profile)

    # Refresh AI recommendations on onboarding
    refresh_all_ai_recommendations(profile, db)

    return format_profile_out(profile)

@router.put("/update", response_model=EntrepreneurProfileOut)
def update_profile(data: EntrepreneurProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Update profile fields (including personal and business locations)
    and automatically trigger recomputation of all dependent AI recommendations.
    """
    profile = db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please complete initial onboarding first.")
    
    # Update provided scalar fields
    update_data = data.model_dump(exclude_unset=True)
    
    if "skills" in update_data and update_data["skills"] is not None:
        profile.skills = json.dumps(update_data["skills"])
    if "interests" in update_data and update_data["interests"] is not None:
        profile.interests = json.dumps(update_data["interests"])
    if "challenges" in update_data and update_data["challenges"] is not None:
        profile.challenges = json.dumps(update_data["challenges"])

    for field in [
        "age_range", "education", "work_experience", "country", "state", "district",
        "city", "pincode", "location_type", "business_location", "business_operating_area",
        "preferred_mentorship_location", "preferred_mentorship_mode", "business_idea",
        "business_domain", "industry", "available_investment", "expected_investment",
        "business_model", "current_status", "current_stage"
    ]:
        if field in update_data and update_data[field] is not None:
            setattr(profile, field, update_data[field])

    # Run AI Refresh
    refresh_all_ai_recommendations(profile, db)
    return format_profile_out(profile)

@router.post("/refresh-ai", response_model=ProfileAIRefreshResponse)
def refresh_ai_insights(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    User-triggered explicit re-evaluation of all AI models (Revenue Channels,
    Competitor Landscape, Viability Score, Risk, Schemes, Business Plan, Roadmap).
    """
    profile = db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Entrepreneur profile not found. Please complete onboarding first.")
    
    res = refresh_all_ai_recommendations(profile, db)
    return ProfileAIRefreshResponse(
        success=True,
        message=f"All AI insights, dynamic revenue channels, and schemes have been recomputed (v{res['profile_version']}).",
        profile_version=res["profile_version"],
        updated_at=res["updated_at"],
        updated_modules=res["updated_modules"]
    )
