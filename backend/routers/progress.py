import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import User, ProgressRecord
from backend.schemas import ProgressRecordOut, ProgressRecordCreate
from backend.auth import get_current_user
from backend.ai_engine import CentralAIEngine

router = APIRouter(prefix="/api/progress", tags=["Business Progress Tracking"])

def format_progress_out(r: ProgressRecord) -> ProgressRecordOut:
    return ProgressRecordOut(
        id=r.id,
        period_label=r.period_label,
        planned_budget=r.planned_budget,
        actual_expenditure=r.actual_expenditure,
        sales_revenue=r.sales_revenue,
        customers_acquired=r.customers_acquired,
        milestones_achieved=json.loads(r.milestones_achieved) if r.milestones_achieved else [],
        challenges_faced=r.challenges_faced,
        ai_variance_feedback=r.ai_variance_feedback,
        ai_corrective_actions=json.loads(r.ai_corrective_actions) if r.ai_corrective_actions else [],
        created_at=r.created_at
    )

@router.get("/history", response_model=List[ProgressRecordOut])
def get_progress_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = db.query(ProgressRecord).filter(ProgressRecord.user_id == current_user.id).order_by(ProgressRecord.created_at.asc()).all()
    return [format_progress_out(r) for r in records]

@router.post("/log", response_model=ProgressRecordOut)
def log_progress(req: ProgressRecordCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # AI variance diagnostics
    diag = CentralAIEngine.diagnose_progress_variance(
        req.planned_budget,
        req.actual_expenditure,
        req.sales_revenue,
        req.customers_acquired,
        req.period_label
    )

    new_record = ProgressRecord(
        user_id=current_user.id,
        period_label=req.period_label,
        planned_budget=req.planned_budget,
        actual_expenditure=req.actual_expenditure,
        sales_revenue=req.sales_revenue,
        customers_acquired=req.customers_acquired,
        milestones_achieved=json.dumps(req.milestones_achieved),
        challenges_faced=req.challenges_faced,
        ai_variance_feedback=diag["ai_variance_feedback"],
        ai_corrective_actions=json.dumps(diag["ai_corrective_actions"])
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return format_progress_out(new_record)
