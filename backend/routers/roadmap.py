import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import User, RoadmapTask, EntrepreneurProfile
from backend.schemas import RoadmapTaskOut, RoadmapTaskCreate, RoadmapTaskUpdate
from backend.auth import get_current_user
from backend.ai_engine import CentralAIEngine

router = APIRouter(prefix="/api/roadmap", tags=["Business Roadmap"])

def format_task_out(t: RoadmapTask) -> RoadmapTaskOut:
    return RoadmapTaskOut(
        id=t.id,
        title=t.title,
        description=t.description,
        timeframe=t.timeframe,
        milestone_group=t.milestone_group,
        priority=t.priority,
        estimated_days=t.estimated_days,
        deadline_date=t.deadline_date,
        is_completed=t.is_completed,
        is_custom=t.is_custom,
        dependencies=json.loads(t.dependencies) if t.dependencies else [],
        created_at=t.created_at
    )

@router.get("/tasks", response_model=List[RoadmapTaskOut])
def get_roadmap_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tasks = db.query(RoadmapTask).filter(RoadmapTask.user_id == current_user.id).order_by(RoadmapTask.id.asc()).all()
    if not tasks:
        profile = db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == current_user.id).first()
        prof_dict = {
            "current_stage": profile.current_stage if profile else "Idea Stage",
            "business_model": profile.business_model if profile else "Online",
            "business_domain": profile.business_domain if profile else "Fashion & Apparel"
        }
        gen_tasks = CentralAIEngine.generate_personalized_roadmap(prof_dict)
        for gt in gen_tasks:
            t_obj = RoadmapTask(
                user_id=current_user.id,
                title=gt["title"],
                description=gt["description"],
                timeframe=gt["timeframe"],
                milestone_group=gt["milestone_group"],
                priority=gt["priority"],
                estimated_days=gt["estimated_days"],
                deadline_date=gt["deadline_date"],
                is_completed=gt["is_completed"],
                dependencies=json.dumps(gt["dependencies"])
            )
            db.add(t_obj)
        db.commit()
        tasks = db.query(RoadmapTask).filter(RoadmapTask.user_id == current_user.id).order_by(RoadmapTask.id.asc()).all()

    return [format_task_out(t) for t in tasks]

@router.post("/task/{task_id}/toggle", response_model=RoadmapTaskOut)
def toggle_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(RoadmapTask).filter(RoadmapTask.id == task_id, RoadmapTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    
    task.is_completed = not task.is_completed
    db.commit()
    db.refresh(task)
    return format_task_out(task)

@router.post("/task/create", response_model=RoadmapTaskOut)
def create_custom_task(req: RoadmapTaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_task = RoadmapTask(
        user_id=current_user.id,
        title=req.title,
        description=req.description,
        timeframe=req.timeframe,
        milestone_group=req.milestone_group,
        priority=req.priority,
        estimated_days=req.estimated_days,
        deadline_date=req.deadline_date,
        is_completed=False,
        is_custom=True,
        dependencies=json.dumps(req.dependencies)
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return format_task_out(new_task)

@router.put("/task/{task_id}", response_model=RoadmapTaskOut)
def update_task(task_id: int, req: RoadmapTaskUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(RoadmapTask).filter(RoadmapTask.id == task_id, RoadmapTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    
    if req.title is not None:
        task.title = req.title
    if req.description is not None:
        task.description = req.description
    if req.is_completed is not None:
        task.is_completed = req.is_completed
    if req.deadline_date is not None:
        task.deadline_date = req.deadline_date
    if req.priority is not None:
        task.priority = req.priority
    
    db.commit()
    db.refresh(task)
    return format_task_out(task)

@router.delete("/task/{task_id}")
def delete_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(RoadmapTask).filter(RoadmapTask.id == task_id, RoadmapTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully."}
