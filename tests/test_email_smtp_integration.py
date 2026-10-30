import os
import json
import time
import socket
import smtplib
from unittest.mock import patch, MagicMock
import pytest
from starlette.testclient import TestClient

from backend.main import app
from backend.config import get_email_credentials
from backend.delivery_service import (
    dispatch_email_otp,
    dispatch_otp,
    build_otp_html_email,
    mask_destination
)
from backend.database import SessionLocal
from backend.models import User, OTPVerification

client = TestClient(app)

class TestEmailSMTPIntegration:
    """
    Complete unit and integration test suite for Email SMTP & Provider Delivery in RiseHer.
    """

    def test_01_credentials_detection_and_placeholder_filtering(self):
        """Verifies that empty strings or placeholders are recognized as unconfigured."""
        with patch.dict(os.environ, {
            "EMAIL_HOST": "",
            "EMAIL_USERNAME": "",
            "EMAIL_PASSWORD": "",
            "RESEND_API_KEY": "",
            "SENDGRID_API_KEY": "",
            "EMAIL_DEV_MODE": ""
        }, clear=False):
            creds = get_email_credentials()
            assert creds["configured"] is False
            assert creds["smtp_host"] is None

        with patch.dict(os.environ, {
            "EMAIL_HOST": "your_smtp_host",
            "EMAIL_USERNAME": "your_email@gmail.com",
            "EMAIL_PASSWORD": "your_app_password",
            "EMAIL_DEV_MODE": ""
        }, clear=False):
            creds = get_email_credentials()
            assert creds["configured"] is False
            assert creds["smtp_host"] is None

        with patch.dict(os.environ, {
            "EMAIL_HOST": "smtp.gmail.com",
            "EMAIL_PORT": "587",
            "EMAIL_USERNAME": "founder@gmail.com",
            "EMAIL_PASSWORD": "abcd efgh ijkl mnop",
            "EMAIL_DEV_MODE": ""
        }, clear=False):
            creds = get_email_credentials()
            assert creds["configured"] is True
            assert creds["provider"] == "smtp"
            assert creds["smtp_host"] == "smtp.gmail.com"
            assert creds["smtp_port"] == 587
            assert creds["smtp_user"] == "founder@gmail.com"
            assert creds["use_tls"] is True

    def test_02_unconfigured_email_returns_clean_guidance_message(self):
        """When email provider is not configured, returns clear setup guidance."""
        with patch.dict(os.environ, {
            "EMAIL_HOST": "",
            "RESEND_API_KEY": "",
            "SENDGRID_API_KEY": "",
            "EMAIL_DEV_MODE": ""
        }, clear=False):
            delivered, msg, err = dispatch_email_otp("founder@riseher.org", "654321", "registration")
            assert delivered is False
            assert err == "EMAIL_NOT_CONFIGURED"
            assert "Email delivery service is not configured" in msg
            assert "EMAIL_HOST" in msg

    @patch("smtplib.SMTP")
    def test_03_successful_smtp_dispatch(self, mock_smtp_class):
        """Verifies successful SMTP connection, STARTTLS upgrade, login, and sendmail."""
        mock_server = MagicMock()
        mock_smtp_class.return_value.__enter__.return_value = mock_server
        mock_server.has_extn.return_value = True

        smtp_env = {
            "EMAIL_HOST": "smtp.gmail.com",
            "EMAIL_PORT": "587",
            "EMAIL_USERNAME": "founder@riseher.org",
            "EMAIL_PASSWORD": "secret_app_password",
            "EMAIL_FROM": "RiseHer <noreply@riseher.org>",
            "EMAIL_DEV_MODE": ""
        }
        with patch.dict(os.environ, smtp_env, clear=False):
            delivered, msg, err = dispatch_email_otp("founder@riseher.org", "981245", "registration")
            assert delivered is True
            assert err is None
            assert "OTP sent successfully to your email" in msg
            assert "Valid for 5 minutes" in msg

            # Inspect SMTP operations
            mock_smtp_class.assert_called_once_with("smtp.gmail.com", 587, timeout=12)
            mock_server.starttls.assert_called_once()
            mock_server.login.assert_called_once_with("founder@riseher.org", "secret_app_password")
            mock_server.sendmail.assert_called_once()
            args = mock_server.sendmail.call_args[0]
            assert "RiseHer <noreply@riseher.org>" in args[0]
            assert "founder@riseher.org" in args[1]
            assert "981245" in args[2]

    @patch("smtplib.SMTP")
    def test_04_gmail_535_auth_error_provides_app_password_instruction(self, mock_smtp_class):
        """Handles Gmail error 535 with explicit instructions to generate a 16-character Google App Password."""
        mock_server = MagicMock()
        mock_smtp_class.return_value.__enter__.return_value = mock_server
        mock_server.login.side_effect = smtplib.SMTPAuthenticationError(535, b"5.7.8 Username and Password not accepted")

        smtp_env = {
            "EMAIL_HOST": "smtp.gmail.com",
            "EMAIL_PORT": "587",
            "EMAIL_USERNAME": "user@gmail.com",
            "EMAIL_PASSWORD": "wrong_or_regular_password",
            "EMAIL_DEV_MODE": ""
        }
        with patch.dict(os.environ, smtp_env, clear=False):
            delivered, msg, err = dispatch_email_otp("user@gmail.com", "123456", "login")
            assert delivered is False
            assert err == "SMTP_AUTH_FAILED"
            assert "Gmail SMTP authentication failed (535)" in msg
            assert "16-character App Password" in msg
            assert "myaccount.google.com/apppasswords" in msg

    @patch("smtplib.SMTP")
    def test_05_smtp_connection_refused_error(self, mock_smtp_class):
        """Handles connection refused when host is invalid or port is blocked."""
        mock_smtp_class.side_effect = ConnectionRefusedError("Connection refused")

        smtp_env = {
            "EMAIL_HOST": "127.0.0.1",
            "EMAIL_PORT": "2525",
            "EMAIL_DEV_MODE": ""
        }
        with patch.dict(os.environ, smtp_env, clear=False):
            delivered, msg, err = dispatch_email_otp("test@riseher.org", "123456", "login")
            assert delivered is False
            assert err == "SMTP_CONNECT_FAILED"
            assert "Could not connect to SMTP server" in msg

    @patch("smtplib.SMTP")
    def test_06_smtp_timeout_error(self, mock_smtp_class):
        """Handles socket timeouts cleanly."""
        mock_smtp_class.side_effect = socket.timeout("timed out")

        smtp_env = {
            "EMAIL_HOST": "smtp.slowserver.com",
            "EMAIL_PORT": "587",
            "EMAIL_DEV_MODE": ""
        }
        with patch.dict(os.environ, smtp_env, clear=False):
            delivered, msg, err = dispatch_email_otp("test@riseher.org", "123456", "login")
            assert delivered is False
            assert err == "SMTP_TIMEOUT"
            assert "timed out" in msg

    def test_07_dev_mode_local_mailbox_logging(self):
        """Verifies that EMAIL_DEV_MODE=true logs OTP to dev_mailbox.jsonl without requiring third-party credentials."""
        dev_env = {
            "EMAIL_HOST": "",
            "EMAIL_DEV_MODE": "true"
        }
        mailbox_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend", "dev_mailbox.jsonl")
        if os.path.exists(mailbox_file):
            os.remove(mailbox_file)

        with patch.dict(os.environ, dev_env, clear=False):
            delivered, msg, err = dispatch_email_otp("dev_test@riseher.org", "741852", "registration")
            assert delivered is True
            assert err is None
            assert "[Dev Mode: OTP is 741852]" in msg

            # Verify file was written
            assert os.path.exists(mailbox_file)
            with open(mailbox_file, "r", encoding="utf-8") as f:
                content = f.read()
                assert "741852" in content
                assert "dev_test@riseher.org" in content

    @patch("smtplib.SMTP")
    def test_08_full_api_send_otp_with_smtp(self, mock_smtp_class):
        """Tests the full FastAPI /api/auth/send-otp endpoint with mock SMTP delivery."""
        mock_server = MagicMock()
        mock_smtp_class.return_value.__enter__.return_value = mock_server

        ts = int(time.time())
        target_email = f"live_smtp_{ts}@riseher.org"

        smtp_env = {
            "EMAIL_HOST": "smtp.gmail.com",
            "EMAIL_PORT": "587",
            "EMAIL_USERNAME": "notifications@riseher.org",
            "EMAIL_PASSWORD": "sample_password",
            "EMAIL_DEV_MODE": ""
        }
        with patch.dict(os.environ, smtp_env, clear=False):
            res = client.post("/api/auth/send-otp", json={
                "phone_or_email": target_email,
                "purpose": "registration"
            })
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is True
            assert "OTP sent successfully to your email" in data["message"]

            # Confirm OTP challenge was recorded in DB
            db = SessionLocal()
            record = db.query(OTPVerification).filter(
                OTPVerification.phone_or_email == target_email,
                OTPVerification.purpose == "registration"
            ).first()
            assert record is not None
            assert record.is_consumed is False
            db.close()
