import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, BusinessAnalysis, EntrepreneurProfile
from backend.schemas import BusinessAnalysisOut, BusinessAnalysisRequest, CompareIdeasRequest
from backend.auth import get_current_user
from backend.ai_engine import CentralAIEngine

router = APIRouter(prefix="/api/analysis", tags=["AI Business Intelligence"])

def format_analysis_out(record: BusinessAnalysis) -> BusinessAnalysisOut:
    return BusinessAnalysisOut(
        id=record.id,
        user_id=record.user_id,
        profile_version=record.profile_version or 1,
        idea_title=record.idea_title,
        idea_description=record.idea_description,
        domain=record.domain,
        business_stage=record.business_stage,
        overall_viability_score=record.overall_viability_score,
        market_demand_summary=record.market_demand_summary,
        market_demand_score=record.market_demand_score,
        estimated_investment_min=record.estimated_investment_min,
        estimated_investment_max=record.estimated_investment_max,
        customer_segments=json.loads(record.customer_segments) if record.customer_segments else [],
        competitor_insights=json.loads(record.competitor_insights) if record.competitor_insights else [],
        competitor_landscape=json.loads(record.competitor_landscape_json) if record.competitor_landscape_json else {},
        skills_compatibility=json.loads(record.skills_compatibility) if record.skills_compatibility else {},
        strengths=json.loads(record.strengths) if record.strengths else [],
        weaknesses=json.loads(record.weaknesses) if record.weaknesses else [],
        missing_information=json.loads(record.missing_information) if record.missing_information else [],
        recommended_improvements=json.loads(record.recommended_improvements) if record.recommended_improvements else [],
        revenue_opportunities=json.loads(record.revenue_opportunities) if record.revenue_opportunities else [],
        revenue_channels=json.loads(record.revenue_channels_json) if record.revenue_channels_json else [],
        operational_requirements=json.loads(record.operational_requirements) if record.operational_requirements else [],
        evidence_breakdown=json.loads(record.evidence_breakdown) if record.evidence_breakdown else {},
        explainability_factors=json.loads(record.explainability_factors) if record.explainability_factors else [],
        confidence_score=record.confidence_score,
        created_at=record.created_at
    )

@router.get("/latest", response_model=BusinessAnalysisOut)
def get_latest_analysis(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = db.query(BusinessAnalysis).filter(BusinessAnalysis.user_id == current_user.id).order_by(BusinessAnalysis.created_at.desc()).first()
    if not record:
        profile = db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == current_user.id).first()
        if not profile:
            raise HTTPException(status_code=404, detail="No business profile found. Please complete onboarding first.")
        
        prof_dict = {
            "business_idea": profile.business_idea,
            "business_domain": profile.business_domain,
            "current_stage": profile.current_stage,
            "available_investment": profile.available_investment,
            "expected_investment": profile.expected_investment,
            "business_model": profile.business_model,
            "location_type": profile.location_type,
            "state": profile.state,
            "district": profile.district,
            "city": profile.city,
            "business_location": profile.business_location,
            "business_operating_area": profile.business_operating_area,
            "skills": profile.skills,
            "challenges": profile.challenges
        }
        res = CentralAIEngine.evaluate_business_idea(prof_dict)
        record = BusinessAnalysis(
            user_id=current_user.id,
            profile_version=profile.profile_version or 1,
            idea_title=profile.business_idea[:60],
            idea_description=profile.business_idea,
            domain=profile.business_domain,
            business_stage=profile.current_stage,
            overall_viability_score=res["overall_viability_score"],
            market_demand_summary=res["market_demand_summary"],
            market_demand_score=res["market_demand_score"],
            estimated_investment_min=res["estimated_investment_min"],
            estimated_investment_max=res["estimated_investment_max"],
            customer_segments=json.dumps(res["customer_segments"]),
            competitor_insights=json.dumps(res["competitor_insights"]),
            competitor_landscape_json=json.dumps(res.get("competitor_landscape", {})),
            skills_compatibility=json.dumps(res["skills_compatibility"]),
            strengths=json.dumps(res["strengths"]),
            weaknesses=json.dumps(res["weaknesses"]),
            missing_information=json.dumps(res["missing_information"]),
            recommended_improvements=json.dumps(res["recommended_improvements"]),
            revenue_opportunities=json.dumps(res["revenue_opportunities"]),
            revenue_channels_json=json.dumps(res.get("revenue_channels", [])),
            operational_requirements=json.dumps(res["operational_requirements"]),
            evidence_breakdown=json.dumps(res["evidence_breakdown"]),
            explainability_factors=json.dumps(res["explainability_factors"]),
            confidence_score=res["confidence_score"]
        )
        db.add(record)
        db.commit()
        db.refresh(record)

    return format_analysis_out(record)

@router.post("/evaluate", response_model=BusinessAnalysisOut)
def evaluate_new_idea(req: BusinessAnalysisRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == current_user.id).first()
    
    idea = req.business_idea or (profile.business_idea if profile else "Bespoke venture")
    domain = req.business_domain or (profile.business_domain if profile else "Fashion & Apparel")
    stage = req.business_stage or (profile.current_stage if profile else "Idea Stage")
    avail_inv = req.available_investment or (profile.available_investment if profile else 50000.0)
    exp_inv = req.expected_investment or (profile.expected_investment if profile else 150000.0)
    model = req.business_model or (profile.business_model if profile else "Online")
    loc_type = req.location_type or (profile.location_type if profile else "Semi-Urban")
    state = req.state or (profile.state if profile else "Karnataka")
    district = profile.district if profile else ""
    city = profile.city if profile else ""
    skills = profile.skills if profile else []

    prof_dict = {
        "business_idea": idea,
        "business_domain": domain,
        "current_stage": stage,
        "available_investment": avail_inv,
        "expected_investment": exp_inv,
        "business_model": model,
        "location_type": loc_type,
        "state": state,
        "district": district,
        "city": city,
        "business_location": profile.business_location if profile else "",
        "business_operating_area": profile.business_operating_area if profile else "",
        "skills": skills,
        "challenges": profile.challenges if profile else []
    }

    res = CentralAIEngine.evaluate_business_idea(prof_dict)
    record = BusinessAnalysis(
        user_id=current_user.id,
        profile_version=profile.profile_version if profile else 1,
        idea_title=idea[:60],
        idea_description=idea,
        domain=domain,
        business_stage=stage,
        overall_viability_score=res["overall_viability_score"],
        market_demand_summary=res["market_demand_summary"],
        market_demand_score=res["market_demand_score"],
        estimated_investment_min=res["estimated_investment_min"],
        estimated_investment_max=res["estimated_investment_max"],
        customer_segments=json.dumps(res["customer_segments"]),
        competitor_insights=json.dumps(res["competitor_insights"]),
        competitor_landscape_json=json.dumps(res.get("competitor_landscape", {})),
        skills_compatibility=json.dumps(res["skills_compatibility"]),
        strengths=json.dumps(res["strengths"]),
        weaknesses=json.dumps(res["weaknesses"]),
        missing_information=json.dumps(res["missing_information"]),
        recommended_improvements=json.dumps(res["recommended_improvements"]),
        revenue_opportunities=json.dumps(res["revenue_opportunities"]),
        revenue_channels_json=json.dumps(res.get("revenue_channels", [])),
        operational_requirements=json.dumps(res["operational_requirements"]),
        evidence_breakdown=json.dumps(res["evidence_breakdown"]),
        explainability_factors=json.dumps(res["explainability_factors"]),
        confidence_score=res["confidence_score"]
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return format_analysis_out(record)

@router.post("/compare")
def compare_alternative_ideas(req: CompareIdeasRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == current_user.id).first()
    avail = profile.available_investment if profile else 50000.0
    exp = profile.expected_investment if profile else 150000.0
    skills = profile.skills if profile else []
    stage = profile.current_stage if profile else "Idea Stage"

    dict1 = {
        "business_idea": req.idea_1,
        "business_domain": req.domain_1,
        "current_stage": stage,
        "available_investment": avail,
        "expected_investment": exp,
        "business_model": "Online",
        "location_type": "Semi-Urban",
        "state": "Karnataka",
        "skills": skills
    }
    dict2 = {
        "business_idea": req.idea_2,
        "business_domain": req.domain_2,
        "current_stage": stage,
        "available_investment": avail,
        "expected_investment": exp,
        "business_model": "Online",
        "location_type": "Semi-Urban",
        "state": "Karnataka",
        "skills": skills
    }

    eval1 = CentralAIEngine.evaluate_business_idea(dict1)
    eval2 = CentralAIEngine.evaluate_business_idea(dict2)

    return {
        "idea_1": {
            "title": req.idea_1,
            "domain": req.domain_1,
            "viability_score": eval1["overall_viability_score"],
            "market_demand_score": eval1["market_demand_score"],
            "capital_required_min": eval1["estimated_investment_min"],
            "strengths": eval1["strengths"][:2],
            "weaknesses": eval1["weaknesses"][:2]
        },
        "idea_2": {
            "title": req.idea_2,
            "domain": req.domain_2,
            "viability_score": eval2["overall_viability_score"],
            "market_demand_score": eval2["market_demand_score"],
            "capital_required_min": eval2["estimated_investment_min"],
            "strengths": eval2["strengths"][:2],
            "weaknesses": eval2["weaknesses"][:2]
        },
        "ai_recommendation": f"Idea 1 ({req.domain_1}) has a viability score of {eval1['overall_viability_score']}/100 compared to {eval2['overall_viability_score']}/100 for Idea 2. "
                             f"{'Idea 1 offers greater capital efficiency for your current budget.' if eval1['overall_viability_score'] >= eval2['overall_viability_score'] else 'Idea 2 aligns better with current market expansion trends.'}"
    }
