import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List
from backend.database import get_db
from backend.models import User, Conversation, Message
from backend.schemas import ConversationOut, MessageOut, MessageCreate
from backend.auth import get_current_user

router = APIRouter(prefix="/api/messages", tags=["Direct Messaging"])

@router.get("/conversations", response_model=List[ConversationOut])
def get_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    convs = db.query(Conversation).filter(
        or_(Conversation.user1_id == current_user.id, Conversation.user2_id == current_user.id)
    ).order_by(Conversation.updated_at.desc()).all()

    result = []
    for c in convs:
        other_user_id = c.user2_id if c.user1_id == current_user.id else c.user1_id
        other_user = db.query(User).filter(User.id == other_user_id).first()
        if not other_user:
            continue
        
        last_msg = db.query(Message).filter(Message.conversation_id == c.id).order_by(Message.created_at.desc()).first()
        unread_count = db.query(Message).filter(
            Message.conversation_id == c.id,
            Message.recipient_id == current_user.id,
            Message.is_read == False
        ).count()

        result.append(ConversationOut(
            id=c.id,
            other_user_id=other_user.id,
            other_user_name=other_user.full_name,
            other_user_avatar=other_user.avatar_url,
            other_user_role=other_user.role,
            topic=c.topic,
            last_message=last_msg.content if last_msg else None,
            unread_count=unread_count,
            updated_at=c.updated_at
        ))
    return result

@router.get("/{conversation_id}", response_model=List[MessageOut])
def get_messages(conversation_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv or (conv.user1_id != current_user.id and conv.user2_id != current_user.id):
        raise HTTPException(status_code=404, detail="Conversation not found or access denied.")

    # Mark unread messages addressed to current user as read
    db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.recipient_id == current_user.id,
        Message.is_read == False
    ).update({"is_read": True})
    db.commit()

    messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).all()

    result = []
    for m in messages:
        result.append(MessageOut(
            id=m.id,
            conversation_id=m.conversation_id,
            sender_id=m.sender_id,
            recipient_id=m.recipient_id,
            sender_name=m.sender.full_name if m.sender else "User",
            sender_avatar=m.sender.avatar_url if m.sender else None,
            content=m.content,
            is_read=m.is_read,
            created_at=m.created_at
        ))
    return result

@router.post("/send", response_model=MessageOut)
def send_message(req: MessageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    recipient = db.query(User).filter(User.id == req.recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found.")

    # Find or create conversation
    conv = db.query(Conversation).filter(
        or_(
            and_(Conversation.user1_id == current_user.id, Conversation.user2_id == req.recipient_id),
            and_(Conversation.user1_id == req.recipient_id, Conversation.user2_id == current_user.id)
        )
    ).first()

    if not conv:
        conv = Conversation(
            user1_id=current_user.id,
            user2_id=req.recipient_id,
            topic=f"Discussion between {current_user.full_name} and {recipient.full_name}"
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    conv.updated_at = datetime.datetime.utcnow()

    new_msg = Message(
        conversation_id=conv.id,
        sender_id=current_user.id,
        recipient_id=req.recipient_id,
        content=req.content,
        is_read=False
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)

    return MessageOut(
        id=new_msg.id,
        conversation_id=conv.id,
        sender_id=current_user.id,
        recipient_id=req.recipient_id,
        sender_name=current_user.full_name,
        sender_avatar=current_user.avatar_url,
        content=new_msg.content,
        is_read=new_msg.is_read,
        created_at=new_msg.created_at
    )
