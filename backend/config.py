import os
from pathlib import Path
from typing import Tuple, Optional

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent

def load_environment_files():
    """
    Loads environment variables from both root .env and backend/.env.
    Follows 12-factor principles: existing non-empty environment variables
    take precedence over file-based values.
    """
    env_paths = [
        BASE_DIR / ".env",
        ROOT_DIR / ".env"
    ]
    for env_file in env_paths:
        if env_file.exists():
            try:
                with open(env_file, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip("'").strip('"')
                            # Respect existing environment variables (including mocks in unit tests)
                            if k not in os.environ:
                                os.environ[k] = v
            except Exception as e:
                print(f"[RiseHer Config Warning] Could not read {env_file}: {e}")

# Initial load on import
load_environment_files()

def get_twilio_credentials() -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Retrieves and sanitizes Twilio credentials.
    Supports dynamic loading from environment and .env files.
    Returns (account_sid, auth_token, phone_number).
    Returns (None, None, None) if not configured or set to placeholder.
    """
    # Ensure any newly created or edited .env variables are loaded
    load_environment_files()

    sid = (os.getenv("TWILIO_ACCOUNT_SID") or "").strip().strip("'").strip('"')
    token = (os.getenv("TWILIO_AUTH_TOKEN") or "").strip().strip("'").strip('"')
    phone = (os.getenv("TWILIO_PHONE_NUMBER") or os.getenv("TWILIO_FROM_NUMBER") or "").strip().strip("'").strip('"')

    placeholders = ["your_actual_account_sid", "your_actual_auth_token", "your_verified_twilio_phone_number", "your_account_sid", "your_auth_token"]
    
    is_valid_sid = bool(sid and sid not in placeholders and not sid.lower().startswith("your_"))
    is_valid_token = bool(token and token not in placeholders and not token.lower().startswith("your_"))
    is_valid_phone = bool(phone and phone not in placeholders and not phone.lower().startswith("your_"))

    return (
        sid if is_valid_sid else None,
        token if is_valid_token else None,
        phone if is_valid_phone else None
    )

def get_email_credentials() -> dict:
    """
    Retrieves and sanitizes Email / SMTP / Resend / SendGrid credentials.
    Supports dynamic loading from environment and .env files.
    """
    load_environment_files()

    dev_mode = (os.getenv("EMAIL_DEV_MODE") or "").strip().lower() in ["true", "1", "yes"]

    # 1. Resend API
    resend_key = (os.getenv("RESEND_API_KEY") or "").strip().strip("'").strip('"')
    resend_from = (os.getenv("RESEND_FROM") or os.getenv("EMAIL_FROM") or "RiseHer <onboarding@resend.dev>").strip()

    # 2. SendGrid API
    sendgrid_key = (os.getenv("SENDGRID_API_KEY") or "").strip().strip("'").strip('"')

    # 3. SMTP configuration
    smtp_host = (os.getenv("EMAIL_HOST") or os.getenv("SMTP_HOST") or "").strip().strip("'").strip('"')
    smtp_port_raw = (os.getenv("EMAIL_PORT") or os.getenv("SMTP_PORT") or "587").strip().strip("'").strip('"')
    smtp_user = (os.getenv("EMAIL_USERNAME") or os.getenv("SMTP_USER") or os.getenv("EMAIL_USER") or "").strip().strip("'").strip('"')
    smtp_pass = (os.getenv("EMAIL_PASSWORD") or os.getenv("SMTP_PASSWORD") or os.getenv("EMAIL_PASS") or "").strip().strip("'").strip('"')
    smtp_from = (os.getenv("EMAIL_FROM") or os.getenv("SMTP_FROM") or (smtp_user if smtp_user and "@" in smtp_user else "noreply@riseher.org")).strip()

    use_ssl_str = (os.getenv("EMAIL_USE_SSL") or "").lower()
    use_tls_str = (os.getenv("EMAIL_USE_TLS") or "true").lower()

    placeholders = [
        "your_email@gmail.com", "your_smtp_host", "your_app_password",
        "your_actual_password", "re_xxxxxxxxx", "your_api_key", "your_password"
    ]

    has_resend = bool(resend_key and resend_key not in placeholders and not resend_key.startswith("your_"))
    has_sendgrid = bool(sendgrid_key and sendgrid_key not in placeholders and not sendgrid_key.startswith("your_"))
    has_smtp = bool(smtp_host and smtp_host not in placeholders and not smtp_host.startswith("your_"))

    port = int(smtp_port_raw) if smtp_port_raw.isdigit() else 587

    return {
        "configured": has_resend or has_sendgrid or has_smtp or dev_mode,
        "dev_mode": dev_mode,
        "provider": "dev" if dev_mode else ("resend" if has_resend else ("sendgrid" if has_sendgrid else ("smtp" if has_smtp else None))),
        "resend_key": resend_key if has_resend else None,
        "resend_from": resend_from,
        "sendgrid_key": sendgrid_key if has_sendgrid else None,
        "smtp_host": smtp_host if has_smtp else None,
        "smtp_port": port,
        "smtp_user": smtp_user,
        "smtp_pass": smtp_pass,
        "smtp_from": smtp_from,
        "use_ssl": (port == 465) or (use_ssl_str in ["true", "1", "yes"]),
        "use_tls": use_tls_str not in ["false", "0", "no"]
    }

default_db = "/tmp/riseher.db" if os.getenv("VERCEL") == "1" else f"{BASE_DIR}/riseher.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{default_db}")
SECRET_KEY = os.getenv("SECRET_KEY", "riseher-super-secret-key-empowering-women-entrepreneurs-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days for hackathon ease

# AI Engine configuration
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "local_deterministic") # local_deterministic, gemini, openai
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
