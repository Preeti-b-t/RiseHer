import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, RiskAssessment, EntrepreneurProfile
from backend.schemas import RiskAssessmentOut, RiskSimulationRequest, RiskCategoryOut
from backend.auth import get_current_user
from backend.ai_engine import CentralAIEngine

router = APIRouter(prefix="/api/risk", tags=["AI Risk Assessment"])

def format_risk_out(record: RiskAssessment) -> RiskAssessmentOut:
    return RiskAssessmentOut(
        id=record.id,
        user_id=record.user_id,
        overall_risk_score=record.overall_risk_score,
        overall_risk_level=record.overall_risk_level,
        financial_risk=RiskCategoryOut(
            score=record.financial_risk_score,
            level=record.financial_risk_level,
            factors=json.loads(record.financial_risk_factors) if record.financial_risk_factors else [],
            mitigations=json.loads(record.financial_mitigations) if record.financial_mitigations else []
        ),
        market_demand_risk=RiskCategoryOut(
            score=record.market_demand_risk_score,
            level=record.market_demand_risk_level,
            factors=json.loads(record.market_demand_factors) if record.market_demand_factors else [],
            mitigations=json.loads(record.market_demand_mitigations) if record.market_demand_mitigations else []
        ),
        operational_risk=RiskCategoryOut(
            score=record.operational_risk_score,
            level=record.operational_risk_level,
            factors=json.loads(record.operational_factors) if record.operational_factors else [],
            mitigations=json.loads(record.operational_mitigations) if record.operational_mitigations else []
        ),
        competition_risk=RiskCategoryOut(
            score=record.competition_risk_score,
            level=record.competition_risk_level,
            factors=json.loads(record.competition_factors) if record.competition_factors else [],
            mitigations=json.loads(record.competition_mitigations) if record.competition_mitigations else []
        ),
        regulatory_risk=RiskCategoryOut(
            score=record.regulatory_risk_score,
            level=record.regulatory_risk_level,
            factors=json.loads(record.regulatory_factors) if record.regulatory_factors else [],
            mitigations=json.loads(record.regulatory_mitigations) if record.regulatory_mitigations else []
        ),
        simulation_inputs=json.loads(record.simulation_inputs) if record.simulation_inputs else {},
        missing_information=json.loads(record.missing_information) if record.missing_information else [],
        created_at=record.created_at
    )

@router.get("/latest", response_model=RiskAssessmentOut)
def get_latest_risk(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = db.query(RiskAssessment).filter(RiskAssessment.user_id == current_user.id).order_by(RiskAssessment.created_at.desc()).first()
    if not record:
        profile = db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == current_user.id).first()
        domain = profile.business_domain if profile else "Fashion & Apparel"
        inv = profile.available_investment if profile else 50000.0
        model = profile.business_model if profile else "Online"
        loc = profile.location_type if profile else "Semi-Urban"
        
        sim_inputs = {
            "available_investment": inv,
            "expected_sales_units_monthly": 50.0,
            "average_price_per_unit": 950.0,
            "estimated_monthly_operating_cost": 22000.0,
            "business_model": model,
            "location_type": loc
        }
        res = CentralAIEngine.calculate_risk_assessment(sim_inputs, domain)
        record = RiskAssessment(
            user_id=current_user.id,
            financial_risk_score=res["financial_risk"]["score"],
            financial_risk_level=res["financial_risk"]["level"],
            financial_risk_factors=json.dumps(res["financial_risk"]["factors"]),
            financial_mitigations=json.dumps(res["financial_risk"]["mitigations"]),
            market_demand_risk_score=res["market_demand_risk"]["score"],
            market_demand_risk_level=res["market_demand_risk"]["level"],
            market_demand_factors=json.dumps(res["market_demand_risk"]["factors"]),
            market_demand_mitigations=json.dumps(res["market_demand_risk"]["mitigations"]),
            operational_risk_score=res["operational_risk"]["score"],
            operational_risk_level=res["operational_risk"]["level"],
            operational_factors=json.dumps(res["operational_risk"]["factors"]),
            operational_mitigations=json.dumps(res["operational_risk"]["mitigations"]),
            competition_risk_score=res["competition_risk"]["score"],
            competition_risk_level=res["competition_risk"]["level"],
            competition_factors=json.dumps(res["competition_risk"]["factors"]),
            competition_mitigations=json.dumps(res["competition_risk"]["mitigations"]),
            regulatory_risk_score=res["regulatory_risk"]["score"],
            regulatory_risk_level=res["regulatory_risk"]["level"],
            regulatory_factors=json.dumps(res["regulatory_risk"]["factors"]),
            regulatory_mitigations=json.dumps(res["regulatory_risk"]["mitigations"]),
            overall_risk_score=res["overall_risk_score"],
            overall_risk_level=res["overall_risk_level"],
            simulation_inputs=json.dumps(sim_inputs),
            missing_information=json.dumps(res["missing_information"])
        )
        db.add(record)
        db.commit()
        db.refresh(record)

    return format_risk_out(record)

@router.post("/simulate", response_model=RiskAssessmentOut)
def simulate_what_if_risk(req: RiskSimulationRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == current_user.id).first()
    domain = profile.business_domain if profile else "Fashion & Apparel"

    sim_inputs = {
        "available_investment": req.available_investment,
        "expected_sales_units_monthly": req.expected_sales_units_monthly,
        "average_price_per_unit": req.average_price_per_unit,
        "estimated_monthly_operating_cost": req.estimated_monthly_operating_cost,
        "business_model": req.business_model,
        "location_type": req.location_type
    }

    res = CentralAIEngine.calculate_risk_assessment(sim_inputs, domain)
    record = RiskAssessment(
        user_id=current_user.id,
        financial_risk_score=res["financial_risk"]["score"],
        financial_risk_level=res["financial_risk"]["level"],
        financial_risk_factors=json.dumps(res["financial_risk"]["factors"]),
        financial_mitigations=json.dumps(res["financial_risk"]["mitigations"]),
        market_demand_risk_score=res["market_demand_risk"]["score"],
        market_demand_risk_level=res["market_demand_risk"]["level"],
        market_demand_factors=json.dumps(res["market_demand_risk"]["factors"]),
        market_demand_mitigations=json.dumps(res["market_demand_risk"]["mitigations"]),
        operational_risk_score=res["operational_risk"]["score"],
        operational_risk_level=res["operational_risk"]["level"],
        operational_factors=json.dumps(res["operational_risk"]["factors"]),
        operational_mitigations=json.dumps(res["operational_risk"]["mitigations"]),
        competition_risk_score=res["competition_risk"]["score"],
        competition_risk_level=res["competition_risk"]["level"],
        competition_factors=json.dumps(res["competition_risk"]["factors"]),
        competition_mitigations=json.dumps(res["competition_risk"]["mitigations"]),
        regulatory_risk_score=res["regulatory_risk"]["score"],
        regulatory_risk_level=res["regulatory_risk"]["level"],
        regulatory_factors=json.dumps(res["regulatory_risk"]["factors"]),
        regulatory_mitigations=json.dumps(res["regulatory_risk"]["mitigations"]),
        overall_risk_score=res["overall_risk_score"],
        overall_risk_level=res["overall_risk_level"],
        simulation_inputs=json.dumps(sim_inputs),
        missing_information=json.dumps(res["missing_information"])
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return format_risk_out(record)
