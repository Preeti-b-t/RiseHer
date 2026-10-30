#!/usr/bin/env python3
"""
Comprehensive 14-Point Authentication, Registration, and RBAC Verification Suite
Ensures 100% compliance with Section 8 requirements.
"""

import sys
import os
import unittest
import uuid
from fastapi.testclient import TestClient

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from app.core.config import settings
from app.core.database import init_db, execute_one, execute_write
from app.services.auth_init import ensure_auth_accounts

client = TestClient(app)

class TestAuthComplete14Points(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        ensure_auth_accounts(force_update_passwords=True)

    def test_01_registration_persists_in_database(self):
        """1. Register a new user with valid details, verify account is created in SQLite DB."""
        unique_id = uuid.uuid4().hex[:6]
        test_email = f"officer_{unique_id}@test.karnataka.gov.in"
        res = client.post("/api/v1/auth/register", json={
            "full_name": f"Test Officer {unique_id}",
            "email": test_email,
            "password": "SecurePassword@2026!",
            "confirm_password": "SecurePassword@2026!",
            "requested_role": "centre1_member",
            "requested_centre_id": "tc_gttc_rajajinagar"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("dev_otp", data)

        # Verify in SQLite DB directly
        db_user = execute_one("SELECT * FROM users WHERE LOWER(email) = ?", (test_email.lower(),))
        self.assertIsNotNone(db_user)
        self.assertEqual(db_user["full_name"], f"Test Officer {unique_id}")
        self.assertEqual(db_user["role"], "centre1_member")
        self.assertEqual(db_user["centre_id"], "tc_gttc_rajajinagar")
        self.assertEqual(db_user["is_verified"], 0)
        self.assertEqual(db_user["approval_status"], "PENDING")

    def test_02_confirm_password_mismatch_rejected(self):
        """2. Confirm password mismatch prevents registration (frontend & backend validation)."""
        unique_id = uuid.uuid4().hex[:6]
        test_email = f"mismatch_{unique_id}@test.gov.in"
        res = client.post("/api/v1/auth/register", json={
            "full_name": "Mismatch Tester",
            "email": test_email,
            "password": "PasswordOne@123",
            "confirm_password": "PasswordTwo@999",
            "requested_role": "centre2_coordinator"
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("Passwords do not match", res.json()["detail"])

    def test_03_invalid_email_format_rejected(self):
        """3. Invalid email format rejected by backend regex validation."""
        res = client.post("/api/v1/auth/register", json={
            "full_name": "Invalid Email",
            "email": "not-a-valid-email-address",
            "password": "ValidPassword@2026!",
            "confirm_password": "ValidPassword@2026!",
            "requested_role": "government_officer"
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("email", res.json()["detail"].lower())

    def test_04_duplicate_email_registration_rejected(self):
        """4. Duplicate accounts for the same email address are blocked."""
        res = client.post("/api/v1/auth/register", json={
            "full_name": "Duplicate Tester",
            "email": "gov_officer@karnataka.gov.in",
            "password": "NewPassword@2026!",
            "confirm_password": "NewPassword@2026!",
            "requested_role": "government_officer"
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("already exists", res.json()["detail"].lower())

    def test_05_passwords_securely_hashed_never_plaintext(self):
        """5. Passwords stored in database are securely hashed (PBKDF2/bcrypt) and never plaintext."""
        user = execute_one("SELECT hashed_password FROM users WHERE email = 'gov_officer@karnataka.gov.in'")
        self.assertIsNotNone(user)
        hashed = user["hashed_password"]
        self.assertNotIn("GovOfficer@2026!", hashed)
        self.assertTrue(hashed.startswith("pbkdf2_sha256$") or hashed.startswith("$2b$") or len(hashed) >= 60)

    def test_06_unverified_account_cannot_login(self):
        """6. Unverified registered user cannot log in (blocked with 403)."""
        unique_id = uuid.uuid4().hex[:6]
        email = f"unverified_{unique_id}@test.gov.in"
        client.post("/api/v1/auth/register", json={
            "full_name": "Unverified User",
            "email": email,
            "password": "UserPass@2026!",
            "confirm_password": "UserPass@2026!",
            "requested_role": "centre1_member"
        })
        login_res = client.post("/api/v1/auth/login", json={
            "username": email,
            "password": "UserPass@2026!"
        })
        self.assertEqual(login_res.status_code, 403)
        self.assertIn("not verified", login_res.json()["detail"].lower())

    def test_07_email_otp_verification_flow(self):
        """7. Email verification with valid 6-digit OTP succeeds."""
        unique_id = uuid.uuid4().hex[:6]
        email = f"verify_{unique_id}@test.gov.in"
        reg_res = client.post("/api/v1/auth/register", json={
            "full_name": "Verify User",
            "email": email,
            "password": "UserPass@2026!",
            "confirm_password": "UserPass@2026!",
            "requested_role": "centre1_member"
        })
        otp = reg_res.json()["dev_otp"]

        ver_res = client.post("/api/v1/auth/verify-email", json={
            "email": email,
            "verification_code": otp
        })
        self.assertEqual(ver_res.status_code, 200)
        self.assertEqual(ver_res.json()["status"], "success")

        # After OTP verification, account is verified but still PENDING admin approval
        db_user = execute_one("SELECT is_verified, approval_status FROM users WHERE email = ?", (email,))
        self.assertEqual(db_user["is_verified"], 1)
        self.assertEqual(db_user["approval_status"], "PENDING")

        # Login is still blocked because approval is PENDING
        login_res = client.post("/api/v1/auth/login", json={
            "username": email,
            "password": "UserPass@2026!"
        })
        self.assertEqual(login_res.status_code, 403)
        self.assertIn("pending administrator approval", login_res.json()["detail"].lower())

    def test_08_administrator_approval_activates_account(self):
        """8. Admin approval transitions account from PENDING to APPROVED, enabling login."""
        unique_id = uuid.uuid4().hex[:6]
        email = f"approved_{unique_id}@test.gov.in"
        reg_res = client.post("/api/v1/auth/register", json={
            "full_name": "Approved Candidate",
            "email": email,
            "password": "UserPass@2026!",
            "confirm_password": "UserPass@2026!",
            "requested_role": "centre2_coordinator",
            "requested_centre_id": "tc_kgtti_hubballi"
        })
        user_id = reg_res.json()["user_id"]
        otp = reg_res.json()["dev_otp"]

        # Verify OTP
        client.post("/api/v1/auth/verify-email", json={"email": email, "verification_code": otp})

        # Admin logs in to obtain admin session
        admin_client = TestClient(app)
        login_admin = admin_client.post("/api/v1/auth/login", json={
            "username": "gov_officer@karnataka.gov.in",
            "password": "GovOfficer@2026!"
        })
        self.assertEqual(login_admin.status_code, 200)

        # Admin approves user
        approve_res = admin_client.post("/api/v1/auth/admin/approve-user", json={
            "user_id": user_id,
            "approval_status": "APPROVED",
            "assigned_role": "centre2_coordinator",
            "assigned_centre_id": "tc_kgtti_hubballi"
        })
        self.assertEqual(approve_res.status_code, 200)

        # Now login succeeds!
        login_res = client.post("/api/v1/auth/login", json={
            "username": email,
            "password": "UserPass@2026!"
        })
        self.assertEqual(login_res.status_code, 200)
        data = login_res.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["user"]["role"], "centre2_coordinator")
        self.assertEqual(data["redirect_dashboard"], "video_studio_centre2")

    def test_09_government_officer_login_and_redirect(self):
        """9. Government Officer logs in with email or username, gets state_dashboard redirect."""
        # Test with username
        res1 = client.post("/api/v1/auth/login", json={
            "username": "gov_officer",
            "password": "GovOfficer@2026!"
        })
        self.assertEqual(res1.status_code, 200)
        self.assertEqual(res1.json()["redirect_dashboard"], "state_dashboard")

        # Test with email
        res2 = client.post("/api/v1/auth/login", json={
            "username": "gov_officer@karnataka.gov.in",
            "password": "GovOfficer@2026!"
        })
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res2.json()["redirect_dashboard"], "state_dashboard")
        self.assertIn(settings.SESSION_COOKIE_NAME, res2.cookies)

    def test_10_centre1_member_login_and_redirect(self):
        """10. Centre 1 Member logs in and routes to webcam_studio dashboard."""
        res = client.post("/api/v1/auth/login", json={
            "username": "centre1_member@gttc.karnataka.gov.in",
            "password": "Centre1Member@2026!"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["user"]["role"], "centre1_member")
        self.assertEqual(data["user"]["centre_id"], "tc_gttc_rajajinagar")
        self.assertEqual(data["redirect_dashboard"], "webcam_studio")

    def test_11_centre2_coordinator_login_and_redirect(self):
        """11. Centre 2 Coordinator logs in and routes to video_studio_centre2."""
        res = client.post("/api/v1/auth/login", json={
            "username": "centre2_coordinator@kgtti.karnataka.gov.in",
            "password": "Centre2Coord@2026!"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["user"]["role"], "centre2_coordinator")
        self.assertEqual(data["user"]["centre_id"], "tc_kgtti_hubballi")
        self.assertEqual(data["redirect_dashboard"], "video_studio_centre2")

    def test_12_centre3_coordinator_login_and_redirect(self):
        """12. Centre 3 Coordinator logs in and routes to video_studio_centre3."""
        res = client.post("/api/v1/auth/login", json={
            "username": "centre3_coordinator@iti.karnataka.gov.in",
            "password": "Centre3Coord@2026!"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["user"]["role"], "centre3_coordinator")
        self.assertEqual(data["user"]["centre_id"], "tc_iti_mysuru_nazarbad")
        self.assertEqual(data["redirect_dashboard"], "video_studio_centre3")

    def test_13_invalid_password_rejected_and_session_logout(self):
        """13. Invalid password fails with 401, and logout clears session."""
        # Invalid password
        fail_res = client.post("/api/v1/auth/login", json={
            "username": "gov_officer@karnataka.gov.in",
            "password": "TotallyWrongPassword!"
        })
        self.assertEqual(fail_res.status_code, 401)

        # Successful login creates session
        session_client = TestClient(app)
        login_res = session_client.post("/api/v1/auth/login", json={
            "username": "gov_officer@karnataka.gov.in",
            "password": "GovOfficer@2026!"
        })
        self.assertEqual(login_res.status_code, 200)

        # Verify session is active
        me_res = session_client.get("/api/v1/auth/me")
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json()["username"], "gov_officer")

        # Logout
        logout_res = session_client.post("/api/v1/auth/logout")
        self.assertEqual(logout_res.status_code, 200)

        # Me request after logout returns 401
        me_after = session_client.get("/api/v1/auth/me")
        self.assertEqual(me_after.status_code, 401)

    def test_14_centre_isolation_and_database_persistence(self):
        """14. Strict centre isolation (403 on cross-centre access) and persistence across queries."""
        session_client = TestClient(app)
        login_res = session_client.post("/api/v1/auth/login", json={
            "username": "centre1_member@gttc.karnataka.gov.in",
            "password": "Centre1Member@2026!"
        })
        self.assertEqual(login_res.status_code, 200)

        # Centre 1 Member accessing Centre 1 succeeds
        res_c1 = session_client.get("/api/v1/coordinator/centre?centre_id=tc_gttc_rajajinagar")
        self.assertEqual(res_c1.status_code, 200)

        # Centre 1 Member attempting to access Centre 2 is blocked (403)
        res_c2 = session_client.get("/api/v1/coordinator/video-history/tc_kgtti_hubballi")
        self.assertEqual(res_c2.status_code, 403)

        # Centre 1 Member attempting to access Centre 3 is blocked (403)
        res_c3 = session_client.get("/api/v1/coordinator/video-history/tc_iti_mysuru_nazarbad")
        self.assertEqual(res_c3.status_code, 403)

        # Verify DB persistence directly: Accounts remain stored and queryable
        all_initial = ["gov_officer", "centre1_member", "centre2_coordinator", "centre3_coordinator"]
        for u in all_initial:
            row = execute_one("SELECT id, is_active FROM users WHERE username = ?", (u,))
            self.assertIsNotNone(row)
            self.assertEqual(row["is_active"], 1)

if __name__ == "__main__":
    unittest.main()
