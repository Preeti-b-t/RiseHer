import os
import ssl
import json
import secrets
import hashlib
import smtplib
import urllib.request
import urllib.parse
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Tuple, Optional
from backend.config import get_twilio_credentials, get_email_credentials

def hash_otp(code: str) -> str:
    """Secure salted SHA-256 hash of OTP code for backend storage."""
    salt = "riseher_otp_salt_2026"
    return hashlib.sha256((code.strip() + salt).encode('utf-8')).hexdigest()

def verify_otp_hash(code: str, stored_hash: str) -> bool:
    """Verifies plaintext OTP against stored SHA-256 hash."""
    clean = code.strip()
    salted_match = hashlib.sha256((clean + "riseher_otp_salt_2026").encode('utf-8')).hexdigest() == stored_hash
    unsalted_match = hashlib.sha256(clean.encode('utf-8')).hexdigest() == stored_hash
    plain_match = (clean == stored_hash)
    return salted_match or unsalted_match or plain_match

def generate_secure_otp() -> str:
    """Generates a cryptographically secure 6-digit numeric OTP."""
    # Using secrets.randbelow ensures cryptographic unpredictability
    return f"{secrets.randbelow(900000) + 100000}"

def mask_destination(target: str) -> str:
    """Masks phone number or email for safe display in logs and messages."""
    target = target.strip()
    if "@" in target:
        parts = target.split("@")
        user_part = parts[0]
        domain_part = parts[1]
        if len(user_part) <= 2:
            masked_user = user_part[0] + "*"
        else:
            masked_user = user_part[:2] + "***" + user_part[-1]
        return f"{masked_user}@{domain_part}"
    else:
        if len(target) <= 6:
            return target
        return f"{target[:3]}****{target[-3:]}"

def build_otp_html_email(otp_code: str, purpose: str = "verification") -> str:
    """Generates a professional, responsive HTML verification email with RiseHer branding."""
    purpose_labels = {
        "registration": "Account Registration & Activation",
        "login": "Secure Account Sign-In",
        "password_reset": "Password Reset Request"
    }
    purpose_label = purpose_labels.get(purpose, "Verification")

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RiseHer Verification Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FFF9F4; margin: 0; padding: 24px;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid rgba(84, 36, 95, 0.15); box-shadow: 0 4px 24px rgba(84, 36, 95, 0.08); overflow: hidden;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #54245F 0%, #7542A6 100%); padding: 32px 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">RiseHer</h1>
      <p style="color: #F9E8ED; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">
        AI-Powered Women Entrepreneurship Intelligence & Empowerment
      </p>
    </div>
    
    <!-- Body Content -->
    <div style="padding: 32px 28px; color: #28242C;">
      <h2 style="font-size: 18px; font-weight: 700; color: #54245F; margin: 0 0 12px 0;">
        {purpose_label}
      </h2>
      <p style="font-size: 14px; line-height: 1.6; color: #555555; margin: 0 0 24px 0;">
        Hello! You requested a one-time verification code to access your RiseHer account. Use the 6-digit code below to complete your verification:
      </p>
      
      <!-- Code Box -->
      <div style="background-color: #F9E8ED; border: 2px dashed #E88979; border-radius: 14px; padding: 22px; text-align: center; margin: 0 0 24px 0;">
        <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #54245F; font-family: 'Courier New', monospace; display: inline-block;">
          {otp_code}
        </span>
      </div>
      
      <!-- Expiry Notice -->
      <div style="background-color: #FFF9F4; border-left: 4px solid #E88979; padding: 12px 16px; border-radius: 4px; margin: 0 0 24px 0;">
        <p style="margin: 0; font-size: 12px; color: #666666; line-height: 1.5;">
          ⏱ <strong>Code expires in 5 minutes.</strong> For your security, never share this verification code with anyone. RiseHer administrators will never ask for your code.
        </p>
      </div>
      
      <p style="font-size: 12px; color: #888888; margin: 0; line-height: 1.5;">
        If you did not request this verification code, please ignore this email or review your account security settings.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #FDF9F6; border-top: 1px solid #f0e6e9; padding: 16px 24px; text-align: center; font-size: 11px; color: #999999;">
      &copy; 2026 RiseHer Platform &bull; Inspired by the Women Entrepreneurship Platform (WEP)
    </div>
  </div>
</body>
</html>"""

def dispatch_email_otp(email: str, otp_code: str, purpose: str = "registration") -> Tuple[bool, str, Optional[str]]:
    """
    Sends real OTP to the exact email address specified.
    Supports:
    1. Standard SMTP (Gmail, Outlook, Amazon SES, Brevo, SendGrid SMTP, local SMTP)
    2. Resend REST API (via RESEND_API_KEY)
    3. SendGrid REST API (via SENDGRID_API_KEY)
    4. Development mailbox mode (via EMAIL_DEV_MODE=true)
    Returns: (is_delivered, user_facing_message, error_code)
    """
    target_email = email.strip()
    masked = mask_destination(target_email)

    creds = get_email_credentials()

    if not creds["configured"]:
        return (
            False,
            "Email delivery service is not configured. Please set EMAIL_HOST, EMAIL_PORT, EMAIL_USERNAME, EMAIL_PASSWORD in .env to deliver real OTP emails.",
            "EMAIL_NOT_CONFIGURED"
        )

    # 0. Development mailbox mode (if explicitly enabled for offline testing)
    if creds.get("dev_mode"):
        try:
            import datetime
            mailbox_path = os.path.join(os.path.dirname(__file__), "dev_mailbox.jsonl")
            log_entry = {
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "recipient": target_email,
                "otp_code": otp_code,
                "purpose": purpose,
                "subject": f"Your RiseHer Verification Code: {otp_code}"
            }
            with open(mailbox_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(log_entry) + "\n")
            print(f"[RiseHer Dev Mailbox] OTP for {target_email} logged: {otp_code}")
            return True, f"OTP sent to your email ({masked}). [Dev Mode: OTP is {otp_code}]", None
        except Exception as dev_err:
            print(f"[RiseHer Dev Mode Error]: {dev_err}")

    # 1. Resend API
    if creds.get("resend_key"):
        resend_key = creds["resend_key"]
        try:
            resend_from = creds.get("resend_from") or "RiseHer <onboarding@resend.dev>"
            url = "https://api.resend.com/emails"
            payload = {
                "from": resend_from,
                "to": [target_email],
                "subject": f"Your RiseHer Verification Code: {otp_code}",
                "html": build_otp_html_email(otp_code, purpose),
                "text": f"Your RiseHer verification code for {purpose} is: {otp_code}. Valid for 5 minutes. Do not share this OTP."
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={
                    "Authorization": f"Bearer {resend_key}",
                    "Content-Type": "application/json"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status in [200, 201]:
                    return True, f"OTP sent successfully to your email ({masked}). Valid for 5 minutes.", None
        except Exception as resend_err:
            print(f"[RiseHer Resend Error]: {resend_err}")
            return False, f"Failed to send OTP via Resend email service: {str(resend_err)}", "RESEND_FAILED"

    # 2. SendGrid REST API
    if creds.get("sendgrid_key"):
        sendgrid_key = creds["sendgrid_key"]
        try:
            sg_from = creds.get("smtp_from") or "noreply@riseher.org"
            url = "https://api.sendgrid.com/v3/mail/send"
            payload = {
                "personalizations": [{"to": [{"email": target_email}]}],
                "from": {"email": sg_from, "name": "RiseHer"},
                "subject": f"Your RiseHer Verification Code: {otp_code}",
                "content": [
                    {"type": "text/plain", "value": f"Your RiseHer verification code is: {otp_code}. Valid for 5 minutes."},
                    {"type": "text/html", "value": build_otp_html_email(otp_code, purpose)}
                ]
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={
                    "Authorization": f"Bearer {sendgrid_key}",
                    "Content-Type": "application/json"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status in [200, 202]:
                    return True, f"OTP sent successfully to your email ({masked}). Valid for 5 minutes.", None
        except Exception as sg_err:
            print(f"[RiseHer SendGrid Error]: {sg_err}")
            return False, f"Failed to send OTP via SendGrid service: {str(sg_err)}", "SENDGRID_FAILED"

    # 3. Standard SMTP Service (Gmail, Outlook, Brevo, AWS SES, or any SMTP server)
    if creds.get("smtp_host"):
        smtp_host = creds["smtp_host"]
        port = creds["smtp_port"]
        smtp_user = creds["smtp_user"]
        smtp_pass = creds["smtp_pass"]
        smtp_from = creds["smtp_from"]
        use_ssl = creds["use_ssl"]
        use_tls = creds["use_tls"]

        try:
            import socket
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"Your RiseHer Verification Code: {otp_code}"
            msg["From"] = f"RiseHer <{smtp_from}>" if "<" not in smtp_from else smtp_from
            msg["To"] = target_email

            plain_text = f"Your RiseHer verification code for {purpose} is: {otp_code}.\nThis code is valid for 5 minutes.\nDo not share this OTP with anyone."
            html_text = build_otp_html_email(otp_code, purpose)

            msg.attach(MIMEText(plain_text, "plain", "utf-8"))
            msg.attach(MIMEText(html_text, "html", "utf-8"))

            if use_ssl:
                context = ssl.create_default_context()
                with smtplib.SMTP_SSL(smtp_host, port, timeout=12, context=context) as server:
                    if smtp_user and smtp_pass:
                        server.login(smtp_user, smtp_pass)
                    server.sendmail(smtp_from, [target_email], msg.as_string())
            else:
                with smtplib.SMTP(smtp_host, port, timeout=12) as server:
                    if use_tls:
                        try:
                            server.ehlo()
                            if server.has_extn("STARTTLS") or port == 587:
                                context = ssl.create_default_context()
                                server.starttls(context=context)
                                server.ehlo()
                        except Exception as tls_err:
                            print(f"[RiseHer SMTP TLS Warning]: {tls_err}")

                    if smtp_user and smtp_pass:
                        server.login(smtp_user, smtp_pass)
                    server.sendmail(smtp_from, [target_email], msg.as_string())

            return True, f"OTP sent successfully to your email ({masked}). Valid for 5 minutes.", None

        except smtplib.SMTPAuthenticationError as auth_err:
            print(f"[RiseHer SMTP Auth Error]: {auth_err}")
            if "gmail" in smtp_host.lower():
                return (
                    False,
                    "Gmail SMTP authentication failed (535). Google accounts require a 16-character App Password (not your personal password). Visit https://myaccount.google.com/apppasswords to create an App Password and set it as EMAIL_PASSWORD in .env.",
                    "SMTP_AUTH_FAILED"
                )
            return (
                False,
                f"SMTP authentication failed (535): Invalid username or password for {smtp_host}. Please check EMAIL_USERNAME and EMAIL_PASSWORD in .env.",
                "SMTP_AUTH_FAILED"
            )
        except (socket.gaierror, ConnectionRefusedError) as conn_err:
            print(f"[RiseHer SMTP Connection Error]: {conn_err}")
            return (
                False,
                f"Could not connect to SMTP server '{smtp_host}:{port}'. Please check EMAIL_HOST and EMAIL_PORT in .env.",
                "SMTP_CONNECT_FAILED"
            )
        except (socket.timeout, TimeoutError) as timeout_err:
            print(f"[RiseHer SMTP Timeout]: {timeout_err}")
            return (
                False,
                f"Connection to SMTP server '{smtp_host}:{port}' timed out. Please check network connectivity and port settings.",
                "SMTP_TIMEOUT"
            )
        except smtplib.SMTPRecipientsRefused as recip_err:
            print(f"[RiseHer SMTP Recipients Refused]: {recip_err}")
            return (
                False,
                f"The SMTP server refused delivery to '{target_email}'. Please verify the email address.",
                "SMTP_RECIPIENT_REFUSED"
            )
        except Exception as smtp_err:
            print(f"[RiseHer SMTP Error]: {smtp_err}")
            return False, f"Failed to send OTP email: {str(smtp_err)}", "SMTP_FAILED"

    return (
        False,
        "Email delivery service is not configured. Please set EMAIL_HOST, EMAIL_PORT, EMAIL_USERNAME, EMAIL_PASSWORD in .env to deliver real OTP emails.",
        "EMAIL_NOT_CONFIGURED"
    )

def normalize_phone_number(phone: str) -> str:
    """Normalizes phone number to international E.164 format (+91 for India)."""
    clean = "".join(ch for ch in phone if ch.isdigit() or ch == "+")
    if clean.startswith("+"):
        return clean
    if len(clean) == 10:
        return f"+91{clean}"
    if clean.startswith("91") and len(clean) == 12:
        return f"+{clean}"
    return f"+{clean}"

def dispatch_sms_otp(phone: str, otp_code: str, purpose: str = "registration") -> Tuple[bool, str, Optional[str]]:
    """
    Sends real OTP to the registered mobile number via Twilio, MSG91, or Fast2SMS.
    Uses official Twilio SDK (`twilio.rest.Client`) with comprehensive error code handling.
    Returns: (is_delivered, user_facing_message, error_code)
    """
    to_number = normalize_phone_number(phone)
    masked = mask_destination(phone)

    # 1. Twilio SMS
    twilio_sid, twilio_token, twilio_from = get_twilio_credentials()

    if twilio_sid and twilio_token and twilio_from:
        twilio_from_clean = normalize_phone_number(twilio_from) if (twilio_from.startswith("+") or twilio_from.isdigit()) else twilio_from
        purpose_label = {
            "registration": "account registration",
            "login": "sign in",
            "password_reset": "password reset"
        }.get(purpose, "verification")
        sms_body = f"Your RiseHer verification code for {purpose_label} is: {otp_code}. Valid for 5 minutes. Do not share this OTP."

        try:
            try:
                from twilio.rest import Client
                from twilio.base.exceptions import TwilioRestException
                has_sdk = True
            except ImportError:
                has_sdk = False

            if has_sdk:
                client = Client(twilio_sid, twilio_token)
                message = client.messages.create(
                    body=sms_body,
                    from_=twilio_from_clean,
                    to=to_number
                )
                print(f"[RiseHer Twilio SDK] OTP sent successfully. SID: {getattr(message, 'sid', 'delivered')}, Status: {getattr(message, 'status', 'queued')}")
                return True, f"OTP sent successfully to your mobile ({masked}). Valid for 5 minutes.", None
            else:
                # Direct HTTP REST fallback if Twilio SDK is missing
                url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json"
                post_data = urllib.parse.urlencode({
                    "To": to_number,
                    "From": twilio_from_clean,
                    "Body": sms_body
                }).encode('utf-8')

                req = urllib.request.Request(url, data=post_data, method="POST")
                auth_header = base64.b64encode(f"{twilio_sid}:{twilio_token}".encode()).decode()
                req.add_header("Authorization", f"Basic {auth_header}")

                with urllib.request.urlopen(req, timeout=12) as response:
                    if response.status in [200, 201]:
                        return True, f"OTP sent successfully to your mobile ({masked}). Valid for 5 minutes.", None
                    else:
                        return False, f"Twilio SMS gateway responded with status {response.status}.", "TWILIO_ERROR"

        except Exception as twilio_err:
            print(f"[RiseHer Twilio Error]: {type(twilio_err).__name__}: {twilio_err}")

            err_code = getattr(twilio_err, "code", None)
            err_msg = getattr(twilio_err, "msg", str(twilio_err))
            err_status = getattr(twilio_err, "status", None)

            if err_code == 20003 or err_status == 401:
                return (
                    False,
                    "Twilio authentication failed (Error 20003): Invalid Account SID or Auth Token. Please check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.",
                    "TWILIO_AUTH_FAILED"
                )
            elif err_code == 21608:
                return (
                    False,
                    f"Twilio trial limitation (Error 21608): Mobile number {to_number} is unverified. Trial accounts can only send SMS to numbers verified in your Twilio Console (Phone Numbers > Verified Caller IDs).",
                    "TWILIO_TRIAL_UNVERIFIED_NUMBER"
                )
            elif err_code == 21211:
                return (
                    False,
                    f"Invalid destination phone number format (Error 21211): {to_number}. Please verify the mobile number.",
                    "TWILIO_INVALID_PHONE"
                )
            elif err_code in [21614, 21408, 30005]:
                return (
                    False,
                    f"Twilio carrier routing restriction (Error {err_code}): Account balance insufficient or SMS routing restricted for destination.",
                    "TWILIO_ROUTING_RESTRICTION"
                )
            elif "timed out" in str(twilio_err).lower():
                return (
                    False,
                    "Twilio gateway timed out. Please check network connectivity and try again.",
                    "TWILIO_TIMEOUT"
                )
            else:
                return (
                    False,
                    f"Failed to send SMS OTP via Twilio ({err_code or 'ERROR'}): {err_msg}",
                    "TWILIO_FAILED"
                )

    # 2. MSG91 SMS (DLT India)
    msg91_key = os.getenv("MSG91_AUTH_KEY") or os.getenv("SMS_API_KEY")
    msg91_template = os.getenv("MSG91_TEMPLATE_ID")
    msg91_sender = os.getenv("MSG91_SENDER_ID", "RISEHR")

    if msg91_key and msg91_template:
        try:
            url = "https://api.msg91.com/api/v5/otp"
            headers = {
                "authkey": msg91_key,
                "content-type": "application/json"
            }
            body = {
                "template_id": msg91_template,
                "mobile": to_number.replace("+", ""),
                "otp": otp_code,
                "sender": msg91_sender
            }
            req = urllib.request.Request(url, data=json.dumps(body).encode('utf-8'), headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status in [200, 201]:
                    return True, f"OTP sent successfully to your mobile ({masked}). Valid for 5 minutes.", None
                else:
                    return False, f"MSG91 SMS gateway responded with status {response.status}.", "MSG91_ERROR"
        except Exception as msg91_err:
            print(f"[RiseHer MSG91 Error]: {msg91_err}")
            return False, f"Failed to send SMS OTP via MSG91: {str(msg91_err)}", "MSG91_FAILED"

    # 3. Fast2SMS (Indian SMS Gateway)
    fast2sms_key = os.getenv("FAST2SMS_API_KEY")
    if fast2sms_key:
        try:
            url = "https://www.fast2sms.com/dev/bulkV2"
            raw_mobile = "".join(filter(str.isdigit, phone))[-10:]
            payload = {
                "variables_values": otp_code,
                "route": "otp",
                "numbers": raw_mobile
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={
                    "authorization": fast2sms_key,
                    "Content-Type": "application/json"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200:
                    return True, f"OTP sent successfully to your mobile ({masked}). Valid for 5 minutes.", None
        except Exception as f2s_err:
            print(f"[RiseHer Fast2SMS Error]: {f2s_err}")
            return False, f"Failed to send SMS OTP via Fast2SMS: {str(f2s_err)}", "FAST2SMS_FAILED"

    # 4. No SMS provider configured
    return (
        False,
        "SMS delivery service is not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env to deliver real SMS OTPs.",
        "SMS_NOT_CONFIGURED"
    )

def dispatch_otp(
    phone_or_email: str,
    otp_code: str,
    purpose: str = "registration"
) -> Tuple[bool, str, Optional[str]]:
    """
    Unified OTP dispatcher:
    - Automatically detects whether the destination is an Email address or Mobile number.
    - Routes to the appropriate live carrier gateway.
    - Returns (success, message, error_code).
    """
    clean_target = phone_or_email.strip()
    if "@" in clean_target:
        return dispatch_email_otp(clean_target, otp_code, purpose)
    else:
        return dispatch_sms_otp(clean_target, otp_code, purpose)
