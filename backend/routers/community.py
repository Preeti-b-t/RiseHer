import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.models import User, CommunityPost, CommunityReply
from backend.schemas import CommunityPostOut, CommunityPostCreate, CommunityReplyCreate, CommunityReplyOut
from backend.auth import get_current_user

router = APIRouter(prefix="/api/community", tags=["Community Discussions"])

def format_post_out(p: CommunityPost) -> CommunityPostOut:
    replies = []
    for r in p.replies:
        replies.append(CommunityReplyOut(
            id=r.id,
            post_id=r.post_id,
            author_id=r.author_id,
            author_name=r.author.full_name if r.author else "Member",
            author_avatar=r.author.avatar_url if r.author else None,
            author_role=r.author.role if r.author else "entrepreneur",
            content=r.content,
            created_at=r.created_at
        ))
    return CommunityPostOut(
        id=p.id,
        author_id=p.author_id,
        author_name=p.author.full_name if p.author else "Member",
        author_avatar=p.author.avatar_url if p.author else None,
        author_role=p.author.role if p.author else "entrepreneur",
        domain=p.domain,
        title=p.title,
        content=p.content,
        tags=json.loads(p.tags) if p.tags else [],
        likes_count=p.likes_count,
        replies=replies,
        created_at=p.created_at
    )

@router.get("/posts", response_model=List[CommunityPostOut])
def get_posts(domain: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(CommunityPost).order_by(CommunityPost.created_at.desc())
    if domain and domain != "All":
        query = query.filter(CommunityPost.domain == domain)
    posts = query.all()
    return [format_post_out(p) for p in posts]

@router.post("/post/create", response_model=CommunityPostOut)
def create_post(req: CommunityPostCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = CommunityPost(
        author_id=current_user.id,
        domain=req.domain,
        title=req.title,
        content=req.content,
        tags=json.dumps(req.tags),
        likes_count=0
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return format_post_out(post)

@router.post("/post/{post_id}/reply", response_model=CommunityPostOut)
def reply_to_post(post_id: int, req: CommunityReplyCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    
    reply = CommunityReply(
        post_id=post_id,
        author_id=current_user.id,
        content=req.content
    )
    db.add(reply)
    db.commit()
    db.refresh(post)
    return format_post_out(post)

@router.post("/post/{post_id}/like")
def like_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    post.likes_count += 1
    db.commit()
    return {"likes_count": post.likes_count}
