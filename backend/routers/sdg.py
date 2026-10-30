from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import User, SDGImpactRecord
from backend.schemas import SDGImpactRecordOut, SDGImpactRecordCreate
from backend.auth import get_current_user

router = APIRouter(prefix="/api/sdg", tags=["SDG Impact Measurement"])

def format_sdg_out(r: SDGImpactRecord) -> SDGImpactRecordOut:
    pct = round((r.actual_value / max(r.target_value, 0.001)) * 100, 1) if r.target_value else 0.0
    return SDGImpactRecordOut(
        id=r.id,
        sdg_goal=r.sdg_goal,
        goal_title=r.goal_title,
        indicator_name=r.indicator_name,
        actual_value=r.actual_value,
        target_value=r.target_value,
        unit=r.unit,
        reporting_period=r.reporting_period,
        data_source=r.data_source,
        notes=r.notes,
        percentage_achieved=min(100.0, pct),
        created_at=r.created_at
    )

@router.get("/metrics", response_model=List[SDGImpactRecordOut])
def get_sdg_metrics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = db.query(SDGImpactRecord).filter(SDGImpactRecord.user_id == current_user.id).order_by(SDGImpactRecord.sdg_goal.asc()).all()
    if not records:
        # Default baseline indicators for newly registered entrepreneurs
        defaults = [
            {"goal": "SDG 5", "title": "Gender Equality", "indicator": "Women In Executive Leadership / Ownership", "actual": 1.0, "target": 1.0, "unit": "founder"},
            {"goal": "SDG 8", "title": "Decent Work & Economic Growth", "indicator": "Fair Living Wage Livelihoods Supported", "actual": 2.0, "target": 5.0, "unit": "jobs"},
            {"goal": "SDG 9", "title": "Industry & Innovation", "indicator": "Digital Commerce & Formal Financial Adoption", "actual": 75.0, "target": 100.0, "unit": "percent"},
            {"goal": "SDG 10", "title": "Reduced Inequalities", "indicator": "Inclusion of Semi-Urban / Rural Suppliers", "actual": 3.0, "target": 5.0, "unit": "suppliers"},
            {"goal": "SDG 12", "title": "Responsible Consumption", "indicator": "Eco-friendly Packaging / Sourcing Compliance", "actual": 80.0, "target": 100.0, "unit": "percent"}
        ]
        for d in defaults:
            obj = SDGImpactRecord(
                user_id=current_user.id,
                sdg_goal=d["goal"],
                goal_title=d["title"],
                indicator_name=d["indicator"],
                actual_value=d["actual"],
                target_value=d["target"],
                unit=d["unit"],
                reporting_period="Q4 2026",
                data_source="Self-reported business verification",
                notes="Initial entrepreneur baseline target"
            )
            db.add(obj)
        db.commit()
        records = db.query(SDGImpactRecord).filter(SDGImpactRecord.user_id == current_user.id).order_by(SDGImpactRecord.sdg_goal.asc()).all()

    return [format_sdg_out(r) for r in records]

@router.post("/record", response_model=SDGImpactRecordOut)
def record_impact(req: SDGImpactRecordCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_record = SDGImpactRecord(
        user_id=current_user.id,
        sdg_goal=req.sdg_goal,
        goal_title=req.goal_title,
        indicator_name=req.indicator_name,
        actual_value=req.actual_value,
        target_value=req.target_value,
        unit=req.unit,
        reporting_period=req.reporting_period,
        data_source=req.data_source,
        notes=req.notes
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return format_sdg_out(new_record)
