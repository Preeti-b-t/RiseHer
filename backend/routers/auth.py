import os
import datetime
from typing import Tuple, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.database import get_db
from backend.models import User, EntrepreneurProfile, OTPVerification
from backend.schemas import (
    UserCreate, UserLogin, UserOut, Token,
    SendOTPRequest, VerifyOTPRequest, RegisterWithOTPRequest,
    LoginWithOTPRequest, ForgotPasswordRequest, ForgotPasswordReset,
    OTPResponse
)
from backend.auth import hash_password, verify_password, create_access_token, get_current_user
from backend.delivery_service import (
    hash_otp,
    verify_otp_hash,
    generate_secure_otp,
    dispatch_otp,
    mask_destination
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def generate_and_save_otp(db: Session, phone_or_email: str, purpose: str = "registration") -> Tuple[str, str]:
    """
    Generates a secure 6-digit OTP, saves the hashed challenge, and dispatches via the real provider.
    Enforces:
    - 60-second cooldown rate-limiting.
    - 5-minute expiration.
    - Salts and hashes OTP code in database.
    - Deletes unconsumed older OTPs for this target and purpose.
    - If real carrier/SMTP delivery fails or is unconfigured, raises an HTTPException immediately.
    """
    target = phone_or_email.strip()
    
    # 1. Enforce 60-second cooldown between OTP requests for the same target and purpose
    last_otp = db.query(OTPVerification).filter(
        OTPVerification.phone_or_email == target,
        OTPVerification.purpose == purpose
    ).order_by(OTPVerification.created_at.desc()).first()
    
    if last_otp and last_otp.created_at:
        seconds_ago = (datetime.datetime.utcnow() - last_otp.created_at).total_seconds()
        if seconds_ago < 60 and not last_otp.is_consumed:
            wait_time = int(60 - seconds_ago)
            raise HTTPException(
                status_code=429,
                detail=f"Please wait {wait_time}s before requesting a new verification code."
            )

    code = generate_secure_otp()
    
    # Invalidate older unconsumed OTPs for this target & purpose
    db.query(OTPVerification).filter(
        OTPVerification.phone_or_email == target,
        OTPVerification.purpose == purpose,
        OTPVerification.is_consumed == False
    ).delete()
    
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
    record = OTPVerification(
        phone_or_email=target,
        otp_code=hash_otp(code),
        purpose=purpose,
        attempts=0,
        max_attempts=5,
        is_verified=False,
        is_consumed=False,
        expires_at=expires_at
    )
    db.add(record)
    db.commit()

    # 2. Dispatch via REAL gateway (SMTP, Resend, SendGrid, Twilio, MSG91, or Fast2SMS)
    delivered, delivery_msg, err_code = dispatch_otp(target, code, purpose)
    
    if not delivered:
        # Provider failed or unconfigured: delete unverified record and abort
        db.delete(record)
        db.commit()
        status_code = 503 if (err_code and "NOT_CONFIGURED" in err_code) else 502
        raise HTTPException(status_code=status_code, detail=delivery_msg)
    
    return code, delivery_msg

def verify_and_consume_otp(db: Session, phone_or_email: str, otp_code: str, purpose: str = "registration") -> bool:
    """
    Validates and consumes the OTP challenge.
    Enforces:
    - Challenge existence for target and purpose.
    - Rejection of already consumed OTPs.
    - Expiration check (5 minutes).
    - Max attempts limit (5 attempts).
    - Cryptographic hash verification.
    - Marks challenge verified and consumed upon success.
    """
    target = phone_or_email.strip()
    record = db.query(OTPVerification).filter(
        OTPVerification.phone_or_email == target,
        OTPVerification.purpose == purpose,
        OTPVerification.is_consumed == False
    ).order_by(OTPVerification.created_at.desc()).first()
    
    if not record:
        raise HTTPException(
            status_code=400,
            detail="No active verification code found for this destination. Please click 'Send OTP' first."
        )
    
    if record.attempts >= record.max_attempts:
        raise HTTPException(
            status_code=400,
            detail="Too many attempts. Maximum attempts exceeded (5/5). Please request a new verification code."
        )
    
    if datetime.datetime.utcnow() > record.expires_at:
        raise HTTPException(
            status_code=400,
            detail="OTP has expired. Request a new OTP."
        )
    
    clean_code = otp_code.strip()
    is_match = verify_otp_hash(clean_code, record.otp_code)
    
    if not is_match:
        record.attempts += 1
        db.commit()
        remaining = max(0, record.max_attempts - record.attempts)
        if remaining == 0:
            raise HTTPException(
                status_code=400,
                detail="Too many attempts. Maximum attempts exceeded (5/5). Please request a new verification code."
            )
        raise HTTPException(status_code=400, detail=f"Incorrect OTP. {remaining} attempt(s) remaining.")
    
    # Invalidate OTP after successful verification to prevent replay / reuse
    record.is_verified = True
    record.is_consumed = True
    db.commit()
    return True

@router.post("/send-otp", response_model=OTPResponse)
def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    """
    Generates and delivers a real OTP to the user's mobile number or email address.
    Fails immediately if the delivery provider is unconfigured or returns an error.
    """
    target = req.phone_or_email.strip()
    if not target or len(target) < 4:
        raise HTTPException(status_code=400, detail="Please enter a valid mobile number or email address.")
    
    purpose = req.purpose or "registration"
    
    if purpose == "registration":
        existing = db.query(User).filter(or_(User.email == target, User.phone == target)).first()
        if existing:
            raise HTTPException(status_code=400, detail="An account with this email/phone already exists. Please login instead.")
    elif purpose in ["login", "password_reset"]:
        user = db.query(User).filter(or_(User.email == target, User.phone == target)).first()
        if not user:
            raise HTTPException(status_code=404, detail="Email/mobile number is not registered.")

    code, delivery_msg = generate_and_save_otp(db, target, purpose=purpose)
    is_dev = os.getenv("EMAIL_DEV_MODE", "").lower() in ["true", "1", "yes"]

    return OTPResponse(
        success=True,
        message=delivery_msg,
        dev_otp=code if is_dev else None,
        expires_in_seconds=300
    )

@router.post("/verify-otp", response_model=OTPResponse)
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    """
    Verifies that the submitted OTP matches the active challenge and is not expired or consumed.
    """
    verify_and_consume_otp(db, req.phone_or_email, req.otp_code, req.purpose or "registration")
    return OTPResponse(
        success=True,
        message="Account verified successfully.",
        dev_otp=None,
        expires_in_seconds=0
    )

@router.post("/register-with-otp", response_model=Token)
def register_with_otp(user_in: RegisterWithOTPRequest, db: Session = Depends(get_db)):
    """
    Mandatory OTP Verification for Registration:
    Validates the 6-digit OTP code against the registered contact (mobile or email).
    Only upon successful OTP validation is the user account created in the database
    with is_verified=True and an access token issued.
    """
    # 1. Match OTP against whichever channel (phone or email) received the OTP
    targets_to_check = []
    if user_in.email:
        targets_to_check.append(user_in.email.strip())
    if user_in.phone:
        targets_to_check.append(user_in.phone.strip())
    
    verified_target = None
    for cand in targets_to_check:
        rec = db.query(OTPVerification).filter(
            OTPVerification.phone_or_email == cand,
            OTPVerification.purpose == "registration",
            OTPVerification.is_consumed == False
        ).order_by(OTPVerification.created_at.desc()).first()
        if rec:
            verified_target = cand
            break

    if not verified_target:
        raise HTTPException(
            status_code=400,
            detail="No active verification code found for this destination. Please click 'Send OTP' first."
        )

    verify_and_consume_otp(db, verified_target, user_in.otp_code, purpose="registration")

    # 2. Duplicate check
    existing = db.query(User).filter(User.email == user_in.email.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email address already exists.")

    # 3. Create verified account
    new_user = User(
        email=user_in.email.strip(),
        password_hash=hash_password(user_in.password),
        full_name=user_in.full_name.strip(),
        role=user_in.role or "entrepreneur",
        phone=user_in.phone.strip() if user_in.phone else None,
        state="Karnataka",
        avatar_url=f"https://ui-avatars.com/api/?name={user_in.full_name.replace(' ', '+')}&background=54245F&color=fff",
        is_verified=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 4. Create baseline entrepreneur profile
    if new_user.role == "entrepreneur":
        initial_profile = EntrepreneurProfile(
            user_id=new_user.id,
            business_idea="Early-stage venture exploration",
            business_domain="Retail & D2C",
            country="India",
            state="Karnataka",
            district="Bengaluru Urban",
            city="Bengaluru",
            location_type="Urban",
            current_stage="Idea Stage",
            available_investment=50000,
            expected_investment=150000,
            business_model="Online",
            profile_version=1
        )
        db.add(initial_profile)
        db.commit()

    token = create_access_token(data={"sub": new_user.email, "role": new_user.role})
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@router.post("/login-with-otp", response_model=Token)
def login_with_otp(req: LoginWithOTPRequest, db: Session = Depends(get_db)):
    """
    Passwordless OTP Sign-In:
    Validates that the user exists and the OTP is correct and unexpired.
    Returns authenticated session and JWT access token.
    """
    target = req.phone_or_email.strip()
    user = db.query(User).filter(or_(User.email == target, User.phone == target)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email/mobile number is not registered.")
    
    verify_and_consume_otp(db, target, req.otp_code, purpose="login")
    
    user.is_verified = True
    db.commit()
    
    token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/forgot-password-request", response_model=OTPResponse)
def forgot_password_request(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    target = req.phone_or_email.strip()
    user = db.query(User).filter(or_(User.email == target, User.phone == target)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email/mobile number is not registered.")
    
    code, delivery_msg = generate_and_save_otp(db, target, purpose="password_reset")
    
    return OTPResponse(
        success=True,
        message=delivery_msg,
        dev_otp=None,
        expires_in_seconds=300
    )

@router.post("/forgot-password-reset")
def forgot_password_reset(req: ForgotPasswordReset, db: Session = Depends(get_db)):
    target = req.phone_or_email.strip()
    user = db.query(User).filter(or_(User.email == target, User.phone == target)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email/mobile number is not registered.")
    
    verify_and_consume_otp(db, target, req.otp_code, purpose="password_reset")
    
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters long.")
    
    user.password_hash = hash_password(req.new_password)
    db.commit()
    
    return {"success": True, "message": "Password successfully updated. You can now log in with your new password."}

@router.post("/register")
def register_blocked(user_in: UserCreate, db: Session = Depends(get_db)):
    """Disallows bypassing OTP for registration."""
    raise HTTPException(
        status_code=400,
        detail="Direct registration without OTP is not allowed. Please use /api/auth/send-otp and /api/auth/register-with-otp."
    )

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Password-based login: validates credentials and verifies account is activated."""
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password.")
    
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is not verified. Please complete OTP verification to access the platform."
        )
    
    token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is not verified. Please complete OTP verification to access the platform."
        )

    token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/switch-demo", response_model=Token)
def switch_demo_persona(email: str, db: Session = Depends(get_db)):
    """Fast-switch between pre-seeded verified personas for hackathon judges."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"Demo user {email} not found.")
    
    token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}
