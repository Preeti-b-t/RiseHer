import os
import time
import datetime
from unittest.mock import patch, MagicMock
import pytest
from starlette.testclient import TestClient
from backend.main import app
from backend.database import SessionLocal
from backend.models import User, EntrepreneurProfile, OTPVerification
from backend.delivery_service import (
    dispatch_email_otp,
    dispatch_sms_otp,
    dispatch_otp,
    hash_otp,
    verify_otp_hash,
    generate_secure_otp,
    normalize_phone_number,
    build_otp_html_email
)
from backend.auth import create_access_token

client = TestClient(app)

class TestMandatoryOTPAndRealDelivery:
    """
    Comprehensive verification suite for:
    1. Real OTP delivery integration & unconfigured gateway detection.
    2. Mandatory OTP verification for registration and login.
    3. Cryptographic security, rate-limiting, and single-use invalidation.
    4. Complete dashboard and protected API route guarding.
    """

    def test_01_unconfigured_provider_fails_explicitly_without_fake_otp(self):
        """If email/SMS provider credentials are not configured, send-otp fails with 503 and clear message."""
        # Ensure provider credentials are unset for this isolated check
        env_overrides = {
            "EMAIL_HOST": "",
            "EMAIL_DEV_MODE": "",
            "RESEND_API_KEY": "",
            "SENDGRID_API_KEY": "",
            "TWILIO_ACCOUNT_SID": "",
            "MSG91_AUTH_KEY": "",
            "FAST2SMS_API_KEY": ""
        }
        with patch.dict(os.environ, env_overrides, clear=False):
            # Email delivery check
            unique_email = f"test_unconfigured_{int(time.time()*1000)}@riseher.org"
            res_email = client.post("/api/auth/send-otp", json={
                "phone_or_email": unique_email,
                "purpose": "registration"
            })
            assert res_email.status_code == 503
            detail_email = res_email.json()["detail"]
            assert "Email delivery service is not configured" in detail_email
            assert "EMAIL_HOST" in detail_email

            # Mobile delivery check
            unique_phone = f"96{str(int(time.time()))[-8:]}"
            res_sms = client.post("/api/auth/send-otp", json={
                "phone_or_email": unique_phone,
                "purpose": "registration"
            })
            assert res_sms.status_code == 503
            detail_sms = res_sms.json()["detail"]
            assert "SMS delivery service is not configured" in detail_sms
            assert "TWILIO_ACCOUNT_SID" in detail_sms

    def test_02_real_email_message_structure_and_formatting(self):
        """Verifies the professional HTML verification email with branding, bold code, and expiry notice."""
        otp_code = "849201"
        html = build_otp_html_email(otp_code, purpose="registration")
        assert "RiseHer" in html
        assert "849201" in html
        assert "5 minutes" in html
        assert "#54245F" in html  # Deep Plum brand color
        assert "#E88979" in html  # Warm Coral brand color

    def test_03_phone_normalization_to_e164(self):
        """Ensures Indian and international numbers are normalized to E.164 with +91."""
        assert normalize_phone_number("9876543210") == "+919876543210"
        assert normalize_phone_number("09876543210") == "+09876543210"
        assert normalize_phone_number("+919876543210") == "+919876543210"
        assert normalize_phone_number("+14155552671") == "+14155552671"

    def test_04_direct_registration_without_otp_is_rejected(self):
        """Direct registration via /api/auth/register without OTP verification is strictly blocked (HTTP 400)."""
        res = client.post("/api/auth/register", json={
            "full_name": "Hacker Attempt",
            "email": "hacker@riseher.org",
            "password": "Password123!"
        })
        assert res.status_code == 400
        assert "without OTP is not allowed" in res.json()["detail"]

    def test_05_unauthenticated_requests_to_dashboard_apis_return_401(self):
        """Protected dashboard endpoints reject unauthenticated requests with HTTP 401."""
        protected_endpoints = [
            "/api/auth/me",
            "/api/profile/me",
            "/api/analysis/latest",
            "/api/schemes/matches",
            "/api/risk/latest",
            "/api/mentors/list",
            "/api/business-plan/latest",
            "/api/roadmap/tasks",
            "/api/progress/history",
            "/api/sdg/metrics"
        ]
        for ep in protected_endpoints:
            res = client.get(ep)
            assert res.status_code == 401, f"Endpoint {ep} was accessible without authentication!"

    def test_06_unverified_account_token_rejected_by_api(self):
        """If a user's is_verified is False in DB, their token is immediately rejected with HTTP 401."""
        db = SessionLocal()
        ts = int(time.time())
        unverified_email = f"unverified_{ts}@riseher.org"
        unverified_user = User(
            email=unverified_email,
            password_hash="fakehash",
            full_name="Unverified User",
            role="entrepreneur",
            is_verified=False
        )
        db.add(unverified_user)
        db.commit()
        db.refresh(unverified_user)

        token = create_access_token(data={"sub": unverified_email, "role": "entrepreneur"})
        headers = {"Authorization": f"Bearer {token}"}

        res = client.get("/api/auth/me", headers=headers)
        assert res.status_code == 401
        assert "Account is not verified" in res.json()["detail"]

        res_prof = client.get("/api/profile/me", headers=headers)
        assert res_prof.status_code == 401
        assert "Account is not verified" in res_prof.json()["detail"]

        db.delete(unverified_user)
        db.commit()
        db.close()

    def test_07_complete_mandatory_email_otp_registration_flow(self):
        """
        Tests the complete legitimate registration flow:
        Send OTP -> Real delivery provider confirmation -> Enter OTP -> Verify -> Account Created -> Profile Accessible.
        """
        ts = int(time.time())
        target_email = f"pooja_{ts}@riseher.org"
        target_phone = f"98{str(ts)[-8:]}"
        dispatched_codes = []

        # Mock actual carrier/SMTP delivery confirmation
        def mock_delivery(recipient, code, purpose):
            dispatched_codes.append(code)
            return True, f"OTP sent successfully to your email ({recipient}). Valid for 5 minutes.", None

        with patch("backend.routers.auth.dispatch_otp", side_effect=mock_delivery):
            # 1. Send OTP
            send_res = client.post("/api/auth/send-otp", json={
                "phone_or_email": target_email,
                "purpose": "registration"
            })
            assert send_res.status_code == 200
            assert "OTP sent successfully" in send_res.json()["message"]
            assert len(dispatched_codes) == 1
            real_otp = dispatched_codes[0]

            # 2. Test Incorrect OTP rejection
            wrong_res = client.post("/api/auth/verify-otp", json={
                "phone_or_email": target_email,
                "otp_code": "000000",
                "purpose": "registration"
            })
            assert wrong_res.status_code == 400
            assert "Incorrect OTP" in wrong_res.json()["detail"]
            assert "4 attempt(s) remaining" in wrong_res.json()["detail"]

            # 3. Test Registration with wrong OTP fails
            reg_wrong = client.post("/api/auth/register-with-otp", json={
                "full_name": "Pooja Varma",
                "email": target_email,
                "phone": target_phone,
                "password": "StrongPassword123!",
                "otp_code": "999999",
                "role": "entrepreneur"
            })
            assert reg_wrong.status_code == 400
            assert "Incorrect OTP" in reg_wrong.json()["detail"]

            # 4. Confirm user was NOT created in DB after failed attempts
            db = SessionLocal()
            u_check = db.query(User).filter(User.email == target_email).first()
            assert u_check is None
            db.close()

            # 5. Register with correct OTP
            reg_res = client.post("/api/auth/register-with-otp", json={
                "full_name": "Pooja Varma",
                "email": target_email,
                "phone": target_phone,
                "password": "StrongPassword123!",
                "otp_code": real_otp,
                "role": "entrepreneur"
            })
            assert reg_res.status_code == 200
            auth_data = reg_res.json()
            assert "access_token" in auth_data
            assert auth_data["user"]["is_verified"] is True
            token = auth_data["access_token"]

            # 6. Verify newly registered user can now access protected dashboard APIs
            headers = {"Authorization": f"Bearer {token}"}
            me_res = client.get("/api/auth/me", headers=headers)
            assert me_res.status_code == 200
            assert me_res.json()["email"] == target_email

            prof_res = client.get("/api/profile/me", headers=headers)
            assert prof_res.status_code == 200
            assert prof_res.json()["current_stage"] == "Idea Stage"

            # 7. Replay Attack Prevention: Attempting to reuse the same OTP must fail
            replay_res = client.post("/api/auth/register-with-otp", json={
                "full_name": "Pooja Varma Clone",
                "email": f"clone_{ts}@riseher.org",
                "phone": f"97{str(ts)[-8:]}",
                "password": "StrongPassword123!",
                "otp_code": real_otp,
                "role": "entrepreneur"
            })
            assert replay_res.status_code == 400
            assert "No active verification code found" in replay_res.json()["detail"]

    def test_08_complete_mobile_otp_login_flow(self):
        """Tests sending OTP to registered mobile number, receiving, and verifying to log in."""
        db = SessionLocal()
        ts = int(time.time())
        mobile = f"99{str(ts)[-8:]}"
        user_email = f"mobile_user_{ts}@riseher.org"
        verified_user = User(
            email=user_email,
            phone=mobile,
            password_hash="pwd_hash",
            full_name="Meera Sen",
            role="entrepreneur",
            is_verified=True
        )
        db.add(verified_user)
        db.commit()
        db.close()

        dispatched_codes = []
        def mock_delivery(recipient, code, purpose):
            dispatched_codes.append(code)
            return True, f"OTP sent successfully to your mobile ({recipient}). Valid for 5 minutes.", None

        with patch("backend.routers.auth.dispatch_otp", side_effect=mock_delivery):
            # 1. Request Login OTP
            send_res = client.post("/api/auth/send-otp", json={
                "phone_or_email": mobile,
                "purpose": "login"
            })
            assert send_res.status_code == 200
            assert len(dispatched_codes) == 1
            login_otp = dispatched_codes[0]

            # 2. Login with correct OTP
            login_res = client.post("/api/auth/login-with-otp", json={
                "phone_or_email": mobile,
                "otp_code": login_otp
            })
            assert login_res.status_code == 200
            token = login_res.json()["access_token"]

            # 3. Access dashboard API
            headers = {"Authorization": f"Bearer {token}"}
            me_res = client.get("/api/auth/me", headers=headers)
            assert me_res.status_code == 200
            assert me_res.json()["phone"] == mobile

    def test_09_otp_expiry_enforcement(self):
        """Expired OTP (> 5 minutes) is rejected with HTTP 400."""
        db = SessionLocal()
        ts = int(time.time())
        target = f"expired_test_{ts}@riseher.org"
        code = "123456"

        expired_time = datetime.datetime.utcnow() - datetime.timedelta(minutes=6)
        expired_otp = OTPVerification(
            phone_or_email=target,
            otp_code=hash_otp(code),
            purpose="registration",
            attempts=0,
            max_attempts=5,
            is_verified=False,
            is_consumed=False,
            expires_at=expired_time
        )
        db.add(expired_otp)
        db.commit()
        db.close()

        res = client.post("/api/auth/verify-otp", json={
            "phone_or_email": target,
            "otp_code": code,
            "purpose": "registration"
        })
        assert res.status_code == 400
        assert "OTP has expired" in res.json()["detail"]

    def test_10_cooldown_rate_limiting(self):
        """Requesting OTP again within 60s cooldown triggers HTTP 429."""
        ts = int(time.time())
        target = f"rate_limit_{ts}@riseher.org"

        with patch("backend.routers.auth.dispatch_otp", return_value=(True, "Delivered", None)):
            res1 = client.post("/api/auth/send-otp", json={
                "phone_or_email": target,
                "purpose": "registration"
            })
            assert res1.status_code == 200

            res2 = client.post("/api/auth/send-otp", json={
                "phone_or_email": target,
                "purpose": "registration"
            })
            assert res2.status_code == 429
            assert "Please wait" in res2.json()["detail"]
