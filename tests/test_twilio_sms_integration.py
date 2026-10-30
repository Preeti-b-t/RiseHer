import os
import time
from unittest.mock import patch, MagicMock
import pytest
from starlette.testclient import TestClient
from twilio.base.exceptions import TwilioRestException

from backend.main import app
from backend.config import get_twilio_credentials
from backend.delivery_service import (
    dispatch_sms_otp,
    dispatch_otp,
    normalize_phone_number,
    mask_destination
)
from backend.database import SessionLocal
from backend.models import User, OTPVerification

client = TestClient(app)

class TestTwilioSMSIntegration:
    """
    Complete unit and integration test suite for Twilio SMS OTP Delivery in RiseHer.
    """

    def test_01_credentials_detection_and_placeholder_filtering(self):
        """Verifies that empty strings or placeholders are recognized as unconfigured."""
        with patch.dict(os.environ, {
            "TWILIO_ACCOUNT_SID": "",
            "TWILIO_AUTH_TOKEN": "",
            "TWILIO_PHONE_NUMBER": ""
        }, clear=False):
            sid, token, phone = get_twilio_credentials()
            assert sid is None
            assert token is None
            assert phone is None

        with patch.dict(os.environ, {
            "TWILIO_ACCOUNT_SID": "your_actual_account_sid",
            "TWILIO_AUTH_TOKEN": "your_actual_auth_token",
            "TWILIO_PHONE_NUMBER": "your_verified_twilio_phone_number"
        }, clear=False):
            sid, token, phone = get_twilio_credentials()
            assert sid is None
            assert token is None
            assert phone is None

        with patch.dict(os.environ, {
            "TWILIO_ACCOUNT_SID": "MOCK_TWILIO_SID_TEST_12345",
            "TWILIO_AUTH_TOKEN": "auth_token_secret_998877",
            "TWILIO_PHONE_NUMBER": "+12025550143"
        }, clear=False):
            sid, token, phone = get_twilio_credentials()
            assert sid == "MOCK_TWILIO_SID_TEST_12345"
            assert token == "auth_token_secret_998877"
            assert phone == "+12025550143"

    def test_02_e164_normalization_for_mobile_numbers(self):
        """Tests that phone numbers are formatted to standard E.164 (+91 for 10-digit Indian numbers)."""
        assert normalize_phone_number("9876543210") == "+919876543210"
        assert normalize_phone_number("919876543210") == "+919876543210"
        assert normalize_phone_number("+919876543210") == "+919876543210"
        assert normalize_phone_number("+14155552671") == "+14155552671"
        assert normalize_phone_number("98765-43210") == "+919876543210"

    def test_03_unconfigured_twilio_returns_clean_configuration_message(self):
        """When credentials are not configured, dispatch_sms_otp returns user-friendly guidance."""
        with patch("backend.delivery_service.get_twilio_credentials", return_value=(None, None, None)):
            delivered, msg, err = dispatch_sms_otp("9876543210", "123456", "login")
            assert delivered is False
            assert err == "SMS_NOT_CONFIGURED"
            assert "SMS delivery service is not configured" in msg
            assert "TWILIO_ACCOUNT_SID" in msg

    @patch("twilio.rest.Client")
    def test_04_successful_twilio_sms_dispatch(self, mock_twilio_client_class):
        """Verifies successful invocation of client.messages.create with correct arguments."""
        mock_client_instance = MagicMock()
        mock_twilio_client_class.return_value = mock_client_instance

        mock_message = MagicMock()
        mock_message.sid = "SM_test_message_sid_12345"
        mock_message.status = "queued"
        mock_client_instance.messages.create.return_value = mock_message

        creds = ("MOCK_TWILIO_SID_TEST_12345", "mock_token", "+12025550143")
        with patch("backend.delivery_service.get_twilio_credentials", return_value=creds):
            delivered, msg, err = dispatch_sms_otp("9876543210", "482910", "registration")

            assert delivered is True
            assert err is None
            assert "OTP sent successfully to your mobile" in msg
            assert "Valid for 5 minutes" in msg

            # Inspect call arguments
            mock_twilio_client_class.assert_called_once_with("MOCK_TWILIO_SID_TEST_12345", "mock_token")
            mock_client_instance.messages.create.assert_called_once()
            call_kwargs = mock_client_instance.messages.create.call_args[1]
            assert call_kwargs["to"] == "+919876543210"
            assert call_kwargs["from_"] == "+12025550143"
            assert "482910" in call_kwargs["body"]
            assert "Valid for 5 minutes" in call_kwargs["body"]

    @patch("twilio.rest.Client")
    def test_05_twilio_auth_failure_error_20003(self, mock_twilio_client_class):
        """Handles invalid Account SID or Auth Token (error 20003)."""
        mock_client_instance = MagicMock()
        mock_twilio_client_class.return_value = mock_client_instance

        fake_err = TwilioRestException(status=401, uri="/test", msg="Authenticate failed", code=20003)
        mock_client_instance.messages.create.side_effect = fake_err

        creds = ("AC_bad_sid", "bad_token", "+12025550143")
        with patch("backend.delivery_service.get_twilio_credentials", return_value=creds):
            delivered, msg, err = dispatch_sms_otp("9876543210", "123456", "login")
            assert delivered is False
            assert err == "TWILIO_AUTH_FAILED"
            assert "Twilio authentication failed" in msg
            assert "Error 20003" in msg

    @patch("twilio.rest.Client")
    def test_06_twilio_trial_unverified_number_error_21608(self, mock_twilio_client_class):
        """Handles Twilio trial restriction: destination number is unverified (error 21608)."""
        mock_client_instance = MagicMock()
        mock_twilio_client_class.return_value = mock_client_instance

        fake_err = TwilioRestException(status=400, uri="/test", msg="The number is unverified", code=21608)
        mock_client_instance.messages.create.side_effect = fake_err

        creds = ("AC_trial_sid", "trial_token", "+12025550143")
        with patch("backend.delivery_service.get_twilio_credentials", return_value=creds):
            delivered, msg, err = dispatch_sms_otp("9876543210", "123456", "login")
            assert delivered is False
            assert err == "TWILIO_TRIAL_UNVERIFIED_NUMBER"
            assert "Twilio trial limitation" in msg
            assert "Error 21608" in msg
            assert "Verified Caller IDs" in msg

    @patch("twilio.rest.Client")
    def test_07_twilio_invalid_phone_number_error_21211(self, mock_twilio_client_class):
        """Handles invalid phone number formatting (error 21211)."""
        mock_client_instance = MagicMock()
        mock_twilio_client_class.return_value = mock_client_instance

        fake_err = TwilioRestException(status=400, uri="/test", msg="Invalid phone number", code=21211)
        mock_client_instance.messages.create.side_effect = fake_err

        creds = ("AC_sid", "token", "+12025550143")
        with patch("backend.delivery_service.get_twilio_credentials", return_value=creds):
            delivered, msg, err = dispatch_sms_otp("000000", "123456", "login")
            assert delivered is False
            assert err == "TWILIO_INVALID_PHONE"
            assert "Invalid destination phone number format" in msg
            assert "Error 21211" in msg

    @patch("twilio.rest.Client")
    def test_08_twilio_insufficient_balance_error_21614(self, mock_twilio_client_class):
        """Handles balance or carrier restriction errors (21614, 21408, 30005)."""
        mock_client_instance = MagicMock()
        mock_twilio_client_class.return_value = mock_client_instance

        fake_err = TwilioRestException(status=400, uri="/test", msg="Account balance low", code=21614)
        mock_client_instance.messages.create.side_effect = fake_err

        creds = ("AC_sid", "token", "+12025550143")
        with patch("backend.delivery_service.get_twilio_credentials", return_value=creds):
            delivered, msg, err = dispatch_sms_otp("9876543210", "123456", "login")
            assert delivered is False
            assert err == "TWILIO_ROUTING_RESTRICTION"
            assert "carrier routing restriction" in msg
            assert "Error 21614" in msg

    @patch("twilio.rest.Client")
    def test_09_full_api_send_otp_and_login_with_twilio(self, mock_twilio_client_class):
        """
        Tests the full FastAPI endpoint /api/auth/send-otp with Twilio dispatch,
        followed by /api/auth/verify-otp and mobile-based sign in.
        """
        mock_client_instance = MagicMock()
        mock_twilio_client_class.return_value = mock_client_instance

        mock_msg = MagicMock()
        mock_msg.sid = "SM_api_test_9988"
        mock_msg.status = "sent"
        mock_client_instance.messages.create.return_value = mock_msg

        ts = int(time.time())
        mobile = f"97{str(ts)[-8:]}"
        user_email = f"twilio_user_{ts}@riseher.org"

        # Pre-register user in DB so login purpose succeeds
        db = SessionLocal()
        verified_user = User(
            email=user_email,
            phone=mobile,
            password_hash="pwd_hash_twilio",
            full_name="Ananya Sharma",
            role="entrepreneur",
            is_verified=True
        )
        db.add(verified_user)
        db.commit()
        db.close()

        creds = ("MOCK_TWILIO_SID_TEST_12345", "mock_token_123", "+12025550143")

        with patch("backend.delivery_service.get_twilio_credentials", return_value=creds):
            # 1. Request OTP via Twilio SMS
            res = client.post("/api/auth/send-otp", json={
                "phone_or_email": mobile,
                "purpose": "login"
            })
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is True
            assert "OTP sent successfully to your mobile" in data["message"]

            # 2. Extract generated OTP from DB to simulate user receiving SMS
            db = SessionLocal()
            record = db.query(OTPVerification).filter(
                OTPVerification.phone_or_email == mobile,
                OTPVerification.purpose == "login",
                OTPVerification.is_consumed == False
            ).first()
            assert record is not None
            assert record.expires_at is not None

            # 3. Verify OTP via API
            # Get plaintext code passed to Twilio
            body_arg = mock_client_instance.messages.create.call_args[1]["body"]
            import re
            extracted_code = re.search(r"\b(\d{6})\b", body_arg).group(1)

            verify_res = client.post("/api/auth/verify-otp", json={
                "phone_or_email": mobile,
                "otp_code": extracted_code,
                "purpose": "login"
            })
            assert verify_res.status_code == 200
            assert verify_res.json()["success"] is True

            # 4. Confirm OTP record is marked consumed in DB
            db.refresh(record)
            assert record.is_consumed is True
            assert record.is_verified is True
            db.close()
