import time
from unittest.mock import patch
import pytest
from starlette.testclient import TestClient
from backend.main import app
from backend.database import SessionLocal
from backend.models import User, EntrepreneurProfile, BusinessAnalysis, OTPVerification

client = TestClient(app)

def test_otp_flow_complete():
    ms = int(time.time() * 1000)
    test_phone = f"95{ms % 100000000:08d}"
    test_email = f"test_{ms}@riseher.org"
    dispatched_codes = []

    def mock_delivery(recipient, code, purpose):
        dispatched_codes.append(code)
        return True, f"OTP sent successfully to {recipient}.", None

    with patch("backend.routers.auth.dispatch_otp", side_effect=mock_delivery):
        # 1. Send OTP
        send_res = client.post("/api/auth/send-otp", json={
            "phone_or_email": test_phone,
            "purpose": "registration"
        })
        assert send_res.status_code == 200
        send_data = send_res.json()
        assert send_data["success"] is True
        assert len(dispatched_codes) == 1
        otp_code = dispatched_codes[-1]
        assert len(otp_code) == 6

        # 2. Verify OTP
        verify_res = client.post("/api/auth/verify-otp", json={
            "phone_or_email": test_phone,
            "otp_code": otp_code,
            "purpose": "registration"
        })
        assert verify_res.status_code == 200
        assert verify_res.json()["success"] is True

        # 3. Register with OTP
        # Invalidate the pre-verified so registerWithOTP validates code
        # Actually register_with_otp verifies fresh code:
        reg_otp_res = client.post("/api/auth/send-otp", json={
            "phone_or_email": test_phone,
            "purpose": "registration"
        })
        assert reg_otp_res.status_code == 200
        new_reg_code = dispatched_codes[-1]

        reg_res = client.post("/api/auth/register-with-otp", json={
            "full_name": "Kavya Murthy",
            "email": test_email,
            "phone": test_phone,
            "password": "StrongPassword123!",
            "otp_code": new_reg_code,
            "role": "entrepreneur"
        })
        assert reg_res.status_code == 200
        reg_data = reg_res.json()
        assert "access_token" in reg_data
        token = reg_data["access_token"]
        assert reg_data["user"]["is_verified"] is True

        # 4. Passwordless Login with OTP
        login_otp_res = client.post("/api/auth/send-otp", json={
            "phone_or_email": test_phone,
            "purpose": "login"
        })
        assert login_otp_res.status_code == 200
        login_otp = dispatched_codes[-1]

        # Login with OTP
        login_res = client.post("/api/auth/login-with-otp", json={
            "phone_or_email": test_phone,
            "otp_code": login_otp
        })
        assert login_res.status_code == 200
        assert "access_token" in login_res.json()

        # 5. Forgot Password Reset Flow
        forgot_res = client.post("/api/auth/forgot-password-request", json={
            "phone_or_email": test_email
        })
        assert forgot_res.status_code == 200
        reset_otp = dispatched_codes[-1]

        reset_res = client.post("/api/auth/forgot-password-reset", json={
            "phone_or_email": test_email,
            "otp_code": reset_otp,
            "new_password": "NewUpdatedPassword123!"
        })
        assert reset_res.status_code == 200

def test_profile_location_and_dynamic_ai_refresh():
    # Login as Priya Sharma
    login_res = client.post("/api/auth/switch-demo?email=priya@riseher.org")
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Update Profile with full personal and business location
    update_res = client.put("/api/profile/update", json={
        "country": "India",
        "state": "Karnataka",
        "district": "Mysuru District",
        "city": "Mysuru",
        "pincode": "570001",
        "location_type": "Semi-Urban",
        "business_location": "Devaraja Market, Mysuru",
        "business_operating_area": "Mysuru & Southern Karnataka",
        "preferred_mentorship_location": "Mysuru",
        "preferred_mentorship_mode": "Hybrid",
        "business_domain": "Fashion & Apparel",
        "business_model": "Hybrid"
    }, headers=headers)
    assert update_res.status_code == 200
    p_data = update_res.json()
    assert p_data["city"] == "Mysuru"
    assert p_data["business_location"] == "Devaraja Market, Mysuru"
    assert p_data["preferred_mentorship_mode"] == "Hybrid"
    assert p_data["profile_version"] >= 2

    # 2. Check Central AI Refresh Endpoint
    ref_res = client.post("/api/profile/refresh-ai", headers=headers)
    assert ref_res.status_code == 200
    ref_data = ref_res.json()
    assert ref_data["success"] is True
    assert "profile_version" in ref_data
    assert "updated_modules" in ref_data

    # 3. Verify Dynamic Revenue Channels Structure
    ana_res = client.get("/api/analysis/latest", headers=headers)
    assert ana_res.status_code == 200
    ana_data = ana_res.json()
    revenue_channels = ana_data.get("revenue_channels", [])
    assert len(revenue_channels) >= 3

    chan = revenue_channels[0]
    assert "name" in chan
    assert "how_it_works" in chan
    assert "why_it_fits" in chan
    assert "initial_requirements" in chan
    assert "estimated_setup_cost" in chan
    assert "limitations_and_risks" in chan

    # 4. Verify Dynamic Competitor Landscape
    comp_landscape = ana_data.get("competitor_landscape", {})
    assert "direct_competitors" in comp_landscape
    assert "indirect_competitors" in comp_landscape
    assert "local_competitors" in comp_landscape
    assert "online_competitors" in comp_landscape
    assert "pricing_comparison" in comp_landscape
    assert "differentiation_strategies" in comp_landscape

    direct = comp_landscape["direct_competitors"]
    assert len(direct) >= 1
    assert "name" in direct[0]
    assert "type" in direct[0]
    assert "pricing_tier" in direct[0]

    # Restore Priya's baseline profile parameters
    client.put("/api/profile/update", json={
        "country": "India",
        "state": "Karnataka",
        "district": "Bengaluru Urban",
        "city": "Bengaluru",
        "pincode": "560001",
        "location_type": "Semi-Urban",
        "business_model": "Online"
    }, headers=headers)

def test_otp_cooldown_rate_limiting():
    ms = int(time.time() * 1000)
    unique_phone = f"94{ms % 100000000:08d}"
    with patch("backend.routers.auth.dispatch_otp", return_value=(True, "Delivered", None)):
        res1 = client.post("/api/auth/send-otp", json={"phone_or_email": unique_phone, "purpose": "registration"})
        assert res1.status_code == 200
        
        # Immediate second request within 60s cooldown triggers HTTP 429
        res2 = client.post("/api/auth/send-otp", json={"phone_or_email": unique_phone, "purpose": "registration"})
        assert res2.status_code == 429
        assert "Please wait" in res2.json()["detail"]

def test_email_otp_registration_and_initial_profile_creation():
    ms = int(time.time() * 1000)
    new_email = f"ananya_{ms}@riseher.org"
    dispatched_codes = []

    def mock_delivery(recipient, code, purpose):
        dispatched_codes.append(code)
        return True, f"OTP sent to {recipient}.", None

    with patch("backend.routers.auth.dispatch_otp", side_effect=mock_delivery):
        # 1. Send OTP to email
        send_res = client.post("/api/auth/send-otp", json={
            "phone_or_email": new_email,
            "purpose": "registration"
        })
        assert send_res.status_code == 200
        otp = dispatched_codes[-1]
        
        # 2. Test wrong OTP rejection and attempt decrement
        wrong_res = client.post("/api/auth/verify-otp", json={
            "phone_or_email": new_email,
            "otp_code": "000000",
            "purpose": "registration"
        })
        assert wrong_res.status_code == 400
        assert "Incorrect" in wrong_res.json()["detail"]
        assert "attempt(s) remaining" in wrong_res.json()["detail"]
        
        # 3. Verify with correct OTP
        # Fresh code for registration
        send_res2 = client.post("/api/auth/send-otp", json={
            "phone_or_email": new_email,
            "purpose": "registration"
        })
        otp2 = dispatched_codes[-1]
        
        # 4. Register new user
        reg_res = client.post("/api/auth/register-with-otp", json={
            "full_name": "Ananya Roy",
            "email": new_email,
            "phone": f"91{ms % 100000000:08d}",
            "password": "Password123!",
            "otp_code": otp2,
            "role": "entrepreneur"
        })
        assert reg_res.status_code == 200
        auth_data = reg_res.json()
        assert "access_token" in auth_data
        token = auth_data["access_token"]
        
        # 5. Verify initial profile was automatically created and accessible
        headers = {"Authorization": f"Bearer {token}"}
        profile_res = client.get("/api/profile/me", headers=headers)
        assert profile_res.status_code == 200
        profile_data = profile_res.json()
        assert profile_data["user_id"] == auth_data["user"]["id"]
        assert profile_data["current_stage"] == "Idea Stage"
        assert profile_data["business_domain"] == "Retail & D2C"
