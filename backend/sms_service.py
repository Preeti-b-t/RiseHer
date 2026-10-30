# Compatibility layer: delegate to delivery_service
from backend.delivery_service import (
    hash_otp,
    verify_otp_hash,
    generate_secure_otp,
    dispatch_otp,
    dispatch_email_otp,
    dispatch_sms_otp,
    mask_destination
)

def dispatch_otp_sms(phone_or_email: str, otp_code: str, purpose: str = "registration"):
    """Compatibility wrapper calling unified dispatch_otp."""
    success, msg, err = dispatch_otp(phone_or_email, otp_code, purpose)
    return success, msg, None
