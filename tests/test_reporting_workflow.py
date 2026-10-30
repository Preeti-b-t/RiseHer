import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from main import app
from app.core.config import settings
from app.core.database import execute_one, execute_query, execute_write

client = TestClient(app)

class TestComplianceReportingWorkflow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Clean up any leftover test artifacts if any
        execute_write("DELETE FROM users WHERE email LIKE '%@testflow.gov.in'")
        execute_write("DELETE FROM centre_reports WHERE title LIKE '%[TEST]%'")

    def test_01_email_based_login_all_four_roles(self):
        """1. Verify that all 4 roles can authenticate using email addresses."""
        accounts = [
            ("gov_officer@karnataka.gov.in", settings.GOV_OFFICER_PASSWORD, "government_officer", "state_dashboard"),
            ("centre1_member@gttc.karnataka.gov.in", settings.CENTRE1_MEMBER_PASSWORD, "centre1_member", "webcam_studio"),
            ("centre2_coordinator@kgtti.karnataka.gov.in", settings.CENTRE2_COORDINATOR_PASSWORD, "centre2_coordinator", "video_studio_centre2"),
            ("centre3_coordinator@iti.karnataka.gov.in", settings.CENTRE3_COORDINATOR_PASSWORD, "centre3_coordinator", "video_studio_centre3"),
        ]
        for email, password, role, expected_dash in accounts:
            resp = client.post("/api/v1/auth/login", json={
                "email": email,
                "password": password,
                "role": role
            })
            self.assertEqual(resp.status_code, 200, f"Login failed for {email}: {resp.text}")
            data = resp.json()
            self.assertEqual(data["status"], "success")
            self.assertEqual(data["user"]["email"], email)
            self.assertEqual(data["redirect_dashboard"], expected_dash)

    def test_02_registration_verification_and_admin_approval(self):
        """2. Verify registration flow: OTP email verification, pending approval, and admin activation."""
        test_email = "applicant_rajesh@testflow.gov.in"
        password = "SecurePassword@2026!"

        # Register
        reg_resp = client.post("/api/v1/auth/register", json={
            "email": test_email,
            "password": password,
            "full_name": "Rajesh Kumar",
            "requested_role": "centre1_member",
            "requested_centre_id": "tc_gttc_rajajinagar"
        })
        self.assertEqual(reg_resp.status_code, 200, reg_resp.text)
        reg_data = reg_resp.json()
        user_id = reg_data["user_id"]
        dev_otp = reg_data["dev_otp"]
        self.assertTrue(len(dev_otp) == 6)

        # Login before email verification must be blocked (403)
        pre_verif_login = client.post("/api/v1/auth/login", json={"email": test_email, "password": password})
        self.assertEqual(pre_verif_login.status_code, 403)
        self.assertIn("not verified", pre_verif_login.json()["detail"].lower())

        # Wrong OTP must fail
        bad_otp_resp = client.post("/api/v1/auth/verify-email", json={"email": test_email, "verification_code": "000000"})
        self.assertEqual(bad_otp_resp.status_code, 400)

        # Correct OTP verifies email
        good_otp_resp = client.post("/api/v1/auth/verify-email", json={"email": test_email, "verification_code": dev_otp})
        self.assertEqual(good_otp_resp.status_code, 200)

        # Login before admin approval must be blocked (403)
        pre_appr_login = client.post("/api/v1/auth/login", json={"email": test_email, "password": password})
        self.assertEqual(pre_appr_login.status_code, 403)
        self.assertIn("pending", pre_appr_login.json()["detail"].lower())

        # Admin approves the applicant
        gov_client = TestClient(app)
        gov_client.post("/api/v1/auth/login", json={"email": "gov_officer@karnataka.gov.in", "password": settings.GOV_OFFICER_PASSWORD})
        appr_resp = gov_client.post("/api/v1/auth/admin/approve-user", json={
            "user_id": user_id,
            "approval_status": "APPROVED",
            "assigned_role": "centre1_member",
            "assigned_centre_id": "tc_gttc_rajajinagar"
        })
        self.assertEqual(appr_resp.status_code, 200)

        # Now applicant logs in successfully
        login_resp = client.post("/api/v1/auth/login", json={"email": test_email, "password": password})
        self.assertEqual(login_resp.status_code, 200)
        self.assertEqual(login_resp.json()["user"]["role"], "centre1_member")

    def test_03_password_reset_flow(self):
        """3. Verify password reset request, OTP token, and password update."""
        email = "applicant_rajesh@testflow.gov.in"
        req_resp = client.post("/api/v1/auth/request-password-reset", json={"email": email})
        self.assertEqual(req_resp.status_code, 200)
        reset_token = req_resp.json()["dev_reset_token"]

        new_password = "BrandNewPassword@2026!"
        confirm_resp = client.post("/api/v1/auth/reset-password", json={
            "email": email,
            "reset_token": reset_token,
            "new_password": new_password
        })
        self.assertEqual(confirm_resp.status_code, 200)

        # Login with old password fails
        old_login = client.post("/api/v1/auth/login", json={"email": email, "password": "SecurePassword@2026!"})
        self.assertEqual(old_login.status_code, 401)

        # Login with new password succeeds
        new_login = client.post("/api/v1/auth/login", json={"email": email, "password": new_password})
        self.assertEqual(new_login.status_code, 200)

    def test_04_centre1_attendance_reporting_and_validation(self):
        """4. Verify Attendance report submission and present + absent <= total validation."""
        c1_client = TestClient(app)
        c1_client.post("/api/v1/auth/login", json={"email": "centre1_member@gttc.karnataka.gov.in", "password": settings.CENTRE1_MEMBER_PASSWORD})

        # Test invalid attendance where present + absent > total
        bad_att_resp = c1_client.post("/api/v1/coordinator/reports/attendance", json={
            "centre_id": "tc_gttc_rajajinagar",
            "reporting_date": "2026-10-14",
            "session_name": "[TEST] Morning Shift CNC Batch A",
            "total_registered": 30,
            "present_count": 25,
            "absent_count": 10, # 25 + 10 = 35 > 30
            "attendance_method": "Biometric Fingerprint Scanner"
        })
        self.assertEqual(bad_att_resp.status_code, 400)
        self.assertIn("exceeds total registered", bad_att_resp.json()["detail"].lower())

        # Test valid attendance report
        good_att_resp = c1_client.post("/api/v1/coordinator/reports/attendance", json={
            "centre_id": "tc_gttc_rajajinagar",
            "reporting_date": "2026-10-14",
            "session_name": "[TEST] Morning Shift CNC Batch A",
            "total_registered": 30,
            "present_count": 27,
            "absent_count": 3,
            "attendance_method": "Biometric Fingerprint Scanner",
            "remarks": "All 27 trainees on time. 3 on verified sick leave.",
            "ai_detection_count": 26, # YOLO live estimate attached
            "evidence_files": ["/static/evidence/sample_classroom_blurred.jpg"]
        })
        self.assertEqual(good_att_resp.status_code, 200, good_att_resp.text)
        report_id = good_att_resp.json()["report_id"]
        self.assertTrue(report_id.startswith("rep_att_"))

        # Verify coordinator can view this submission in my-submissions
        my_subs = c1_client.get("/api/v1/coordinator/reports/my-submissions")
        self.assertEqual(my_subs.status_code, 200)
        matching = [r for r in my_subs.json() if r["id"] == report_id]
        self.assertEqual(len(matching), 1)
        self.assertEqual(matching[0]["status"], "PENDING_VERIFICATION")
        self.assertEqual(matching[0]["data"]["present_count"], 27)

    def test_05_centre2_inventory_reporting(self):
        """5. Verify Multi-item Equipment & Infrastructure Inventory submission."""
        c2_client = TestClient(app)
        c2_client.post("/api/v1/coordinator/centre2", json={}) # test login
        c2_client.post("/api/v1/auth/login", json={"email": "centre2_coordinator@kgtti.karnataka.gov.in", "password": settings.CENTRE2_COORDINATOR_PASSWORD})

        # Empty items must fail
        empty_resp = c2_client.post("/api/v1/coordinator/reports/inventory", json={
            "centre_id": "tc_kgtti_hubballi",
            "reporting_date": "2026-10-14",
            "items": []
        })
        self.assertEqual(empty_resp.status_code, 400)

        # Valid multi-item inventory
        inv_resp = c2_client.post("/api/v1/coordinator/reports/inventory", json={
            "centre_id": "tc_kgtti_hubballi",
            "reporting_date": "2026-10-14",
            "title": "[TEST] Hubballi Robotics Lab Quarterly Inventory",
            "items": [
                {
                    "item_name": "6-Axis Industrial Robotic Arm",
                    "category": "Machinery",
                    "quantity": 2,
                    "condition": "Working",
                    "location": "Robotics Bay 1",
                    "inspection_date": "2026-10-14",
                    "evidence_image": "/static/images/robotics_automation_training.jpg"
                },
                {
                    "item_name": "PLC Automation Training Consoles",
                    "category": "IT Equipment",
                    "quantity": 10,
                    "condition": "Working",
                    "location": "Automation Room 204",
                    "inspection_date": "2026-10-14"
                }
            ],
            "ai_object_summary": {"detected_robots": 2, "detected_workstations": 10},
            "remarks": "All safety guards operational."
        })
        self.assertEqual(inv_resp.status_code, 200, inv_resp.text)
        report_id = inv_resp.json()["report_id"]
        self.assertTrue(report_id.startswith("rep_inv_"))

    def test_06_centre3_damaged_object_reporting(self):
        """6. Verify dedicated Damaged Object / Safety defect report submission."""
        c3_client = TestClient(app)
        c3_client.post("/api/v1/auth/login", json={"email": "centre3_coordinator@iti.karnataka.gov.in", "password": settings.CENTRE3_COORDINATOR_PASSWORD})

        # Missing required fields must fail
        bad_dmg = c3_client.post("/api/v1/coordinator/reports/damaged-object", json={
            "centre_id": "tc_iti_mysuru_nazarbad",
            "reporting_date": "2026-10-14",
            "item_name": "",
            "damage_category": "Electrical",
            "severity": "Critical/Hazardous",
            "description": "",
            "location": "Electrical Workshop",
            "immediate_safety_action": "",
            "recommended_action": "Replace breaker"
        })
        self.assertEqual(bad_dmg.status_code, 400)

        # Valid damaged object report
        good_dmg = c3_client.post("/api/v1/coordinator/reports/damaged-object", json={
            "centre_id": "tc_iti_mysuru_nazarbad",
            "reporting_date": "2026-10-14",
            "item_name": "[TEST] 415V Three-Phase Power Distribution Panel",
            "damage_category": "Electrical",
            "severity": "Critical/Hazardous",
            "description": "Loose neutral busbar causing arcing and thermal discoloration.",
            "location": "Heavy Electrical Workshop Bay B",
            "immediate_safety_action": "Power isolated at main substation; lockout/tagout applied.",
            "recommended_action": "Complete replacement of busbar assembly by certified electrician.",
            "repair_status": "Reported",
            "evidence_files": ["/static/evidence/sample_workshop_blurred.jpg"]
        })
        self.assertEqual(good_dmg.status_code, 200, good_dmg.text)
        report_id = good_dmg.json()["report_id"]
        self.assertTrue(report_id.startswith("rep_dmg_"))

    def test_07_centre_isolation_security(self):
        """7. Verify strict centre isolation: Centre 1 cannot submit or view Centre 2 or Centre 3 records."""
        c1_client = TestClient(app)
        c1_client.post("/api/v1/auth/login", json={"email": "centre1_member@gttc.karnataka.gov.in", "password": settings.CENTRE1_MEMBER_PASSWORD})

        # Centre 1 coordinator tries to submit report specifying Centre 2
        spoof_resp = c1_client.post("/api/v1/coordinator/reports/attendance", json={
            "centre_id": "tc_kgtti_hubballi",
            "reporting_date": "2026-10-14",
            "session_name": "Spoofed Attendance",
            "total_registered": 20,
            "present_count": 18,
            "absent_count": 2,
            "attendance_method": "Biometric"
        })
        self.assertEqual(spoof_resp.status_code, 403)
        self.assertIn("authorized only for centre", spoof_resp.json()["detail"].lower())

        # Centre 1 coordinator tries to query submissions of Centre 2
        query_resp = c1_client.get("/api/v1/coordinator/reports/my-submissions?centre_id=tc_kgtti_hubballi")
        self.assertEqual(query_resp.status_code, 403)

    def test_08_government_verification_workflow_correction_resubmission_approval(self):
        """8. Verify Government Verification: Queue list, Request Corrections, Resubmission, and Approval."""
        # 1. Centre 1 coordinator creates report
        c1_client = TestClient(app)
        c1_client.post("/api/v1/auth/login", json={"email": "centre1_member@gttc.karnataka.gov.in", "password": settings.CENTRE1_MEMBER_PASSWORD})
        sub_resp = c1_client.post("/api/v1/coordinator/reports/attendance", json={
            "centre_id": "tc_gttc_rajajinagar",
            "reporting_date": "2026-10-14",
            "session_name": "[TEST] Review Lifecycle Batch",
            "total_registered": 25,
            "present_count": 20,
            "absent_count": 5,
            "attendance_method": "Biometric",
            "remarks": "Draft initial attendance"
        })
        report_id = sub_resp.json()["report_id"]

        # 2. Government Officer checks queue
        gov_client = TestClient(app)
        gov_client.post("/api/v1/auth/login", json={"email": "gov_officer@karnataka.gov.in", "password": settings.GOV_OFFICER_PASSWORD})
        q_resp = gov_client.get("/api/v1/admin/verification-queue")
        self.assertEqual(q_resp.status_code, 200)
        q_data = q_resp.json()
        self.assertIn("summary", q_data)
        self.assertGreaterEqual(q_data["summary"]["pending"], 1)

        # 3. Government Officer requests corrections without message (must fail with 400)
        bad_req = gov_client.post(f"/api/v1/admin/reports/{report_id}/action", json={
            "action": "REQUEST_CORRECTIONS",
            "correction_message": ""
        })
        self.assertEqual(bad_req.status_code, 400)
        self.assertIn("mandatory", bad_req.json()["detail"].lower())

        # 4. Government Officer requests corrections with valid instruction
        good_req = gov_client.post(f"/api/v1/admin/reports/{report_id}/action", json={
            "action": "REQUEST_CORRECTIONS",
            "correction_message": "Please attach student attendance sheet scan and clarify absent trainee reasons."
        })
        self.assertEqual(good_req.status_code, 200)
        self.assertEqual(good_req.json()["workflow_status"], "CORRECTION_REQUESTED")

        # 5. Coordinator checks my-submissions and sees CORRECTION_REQUESTED
        coord_check = c1_client.get(f"/api/v1/coordinator/reports/{report_id}")
        self.assertEqual(coord_check.status_code, 200)
        report_detail = coord_check.json()
        self.assertEqual(report_detail["status"], "CORRECTION_REQUESTED")
        self.assertIn("attendance sheet scan", report_detail["correction_message"])
        self.assertEqual(len(report_detail["revisions"]), 2) # Rev 1: Submitted, Rev 2: Correction requested

        # 6. Coordinator resubmits with updated data and remarks
        resub_resp = c1_client.post(f"/api/v1/coordinator/reports/{report_id}/resubmit", json={
            "data": {
                "session_name": "[TEST] Review Lifecycle Batch (Corrected)",
                "total_registered": 25,
                "present_count": 21,
                "absent_count": 4,
                "attendance_percentage": 84.0,
                "attendance_method": "Biometric + Physical Register Cross-Verification",
                "remarks": "Updated: 1 student arrived with authorized gate pass. Sheet scan attached."
            },
            "resubmission_remarks": "Attached physical sign-in sheet scan and corrected present count to 21.",
            "evidence_files": ["/static/evidence/sample_classroom_blurred.jpg"]
        })
        self.assertEqual(resub_resp.status_code, 200, resub_resp.text)
        self.assertEqual(resub_resp.json()["workflow_status"], "RESUBMITTED")
        self.assertEqual(resub_resp.json()["revision_number"], 3)

        # 7. Government officer approves resubmitted report
        appr_resp = gov_client.post(f"/api/v1/admin/reports/{report_id}/action", json={
            "action": "APPROVE",
            "comments": "Verified against physical register scan. Approved."
        })
        self.assertEqual(appr_resp.status_code, 200)
        self.assertEqual(appr_resp.json()["workflow_status"], "APPROVED")

        # 8. Check final report revisions
        final_check = gov_client.get(f"/api/v1/admin/reports/{report_id}")
        self.assertEqual(final_check.status_code, 200)
        final_data = final_check.json()
        self.assertEqual(final_data["status"], "APPROVED")
        self.assertEqual(len(final_data["revisions"]), 4) # 1: Submit, 2: Correction Req, 3: Resubmit, 4: Approved

    def test_09_government_verification_rejection_workflow(self):
        """9. Verify Government Rejection: Mandatory reason requirement and status transition."""
        c1_client = TestClient(app)
        c1_client.post("/api/v1/auth/login", json={"email": "centre1_member@gttc.karnataka.gov.in", "password": settings.CENTRE1_MEMBER_PASSWORD})
        sub_resp = c1_client.post("/api/v1/coordinator/reports/attendance", json={
            "centre_id": "tc_gttc_rajajinagar",
            "reporting_date": "2026-10-14",
            "session_name": "[TEST] Fraudulent Batch To Be Rejected",
            "total_registered": 20,
            "present_count": 20,
            "absent_count": 0,
            "attendance_method": "Manual Sign"
        })
        report_id = sub_resp.json()["report_id"]

        gov_client = TestClient(app)
        gov_client.post("/api/v1/auth/login", json={"email": "gov_officer@karnataka.gov.in", "password": settings.GOV_OFFICER_PASSWORD})

        # Reject without mandatory reason -> 400
        bad_rej = gov_client.post(f"/api/v1/admin/reports/{report_id}/action", json={
            "action": "REJECT",
            "rejection_reason": ""
        })
        self.assertEqual(bad_rej.status_code, 400)
        self.assertIn("mandatory", bad_rej.json()["detail"].lower())

        # Reject with mandatory reason -> 200
        good_rej = gov_client.post(f"/api/v1/admin/reports/{report_id}/action", json={
            "action": "REJECT",
            "rejection_reason": "Automated CCTV observation confirmed 0 people present during recorded session time."
        })
        self.assertEqual(good_rej.status_code, 200)
        self.assertEqual(good_rej.json()["workflow_status"], "REJECTED")

        # Confirm status in DB
        rep = execute_one("SELECT status, rejection_reason FROM centre_reports WHERE id = ?", (report_id,))
        self.assertEqual(rep["status"], "REJECTED")
        self.assertIn("0 people present", rep["rejection_reason"])

    def test_10_evidence_file_upload_security(self):
        """10. Verify evidence file upload validates file extensions and returns static URL."""
        gov_client = TestClient(app)
        gov_client.post("/api/v1/auth/login", json={"email": "gov_officer@karnataka.gov.in", "password": settings.GOV_OFFICER_PASSWORD})

        # Test valid image upload
        dummy_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
        up_resp = gov_client.post(
            "/api/v1/coordinator/upload-evidence",
            files={"file": ("attendance_evidence.png", dummy_png, "image/png")}
        )
        self.assertEqual(up_resp.status_code, 200)
        file_url = up_resp.json()["file_url"]
        self.assertTrue(file_url.startswith("/static/evidence/"))

        # Test disallowed file type (e.g. .exe / .sh)
        bad_up = gov_client.post(
            "/api/v1/coordinator/upload-evidence",
            files={"file": ("malicious_script.sh", b"echo 'hack'", "text/x-shellscript")}
        )
        self.assertEqual(bad_up.status_code, 400)
        self.assertIn("unsupported file type", bad_up.json()["detail"].lower())

if __name__ == "__main__":
    unittest.main()
