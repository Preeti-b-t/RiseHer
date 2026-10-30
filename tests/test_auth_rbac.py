import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from main import app
from app.core.config import settings
from app.core.database import execute_one, execute_write

client = TestClient(app)

def test_1_valid_login_all_four_roles():
    """1. POST /api/v1/auth/login validates credentials for all 4 roles."""
    roles_credentials = [
        ("gov_officer", settings.GOV_OFFICER_PASSWORD, "government_officer", "state_dashboard"),
        ("centre1_member", settings.CENTRE1_MEMBER_PASSWORD, "centre1_member", "webcam_studio"),
        ("centre2_coordinator", settings.CENTRE2_COORDINATOR_PASSWORD, "centre2_coordinator", "video_studio_centre2"),
        ("centre3_coordinator", settings.CENTRE3_COORDINATOR_PASSWORD, "centre3_coordinator", "video_studio_centre3"),
    ]

    for username, password, role, expected_dash in roles_credentials:
        resp = client.post("/api/v1/auth/login", json={
            "username": username,
            "password": password,
            "role": role
        })
        assert resp.status_code == 200, f"Login failed for {username}: {resp.text}"
        data = resp.json()
        assert data["status"] == "success"
        assert "access_token" in data
        assert data["user"]["username"] == username
        assert data["user"]["role"] == role
        assert data["redirect_dashboard"] == expected_dash
        assert settings.SESSION_COOKIE_NAME in resp.cookies


def test_2_invalid_credentials_returns_401():
    """3. Incorrect password returns 401 Unauthorized with generic error message."""
    resp = client.post("/api/v1/auth/login", json={
        "username": "gov_officer",
        "password": "WrongPassword123!",
        "role": "government_officer"
    })
    assert resp.status_code == 401
    assert "Invalid credentials" in resp.json()["detail"]


def test_3_role_mismatch_returns_403():
    """4. Valid password but unauthorized role selection returns 403 Forbidden."""
    # Centre 1 member attempting to claim government_officer role
    resp = client.post("/api/v1/auth/login", json={
        "username": "centre1_member",
        "password": settings.CENTRE1_MEMBER_PASSWORD,
        "role": "government_officer"
    })
    assert resp.status_code == 403
    assert "Selected role does not match account privileges" in resp.json()["detail"]

    # Gov officer trying to select centre2_coordinator
    resp2 = client.post("/api/v1/auth/login", json={
        "username": "gov_officer",
        "password": settings.GOV_OFFICER_PASSWORD,
        "role": "centre2_coordinator"
    })
    assert resp2.status_code == 403


def test_4_unauthenticated_request_returns_401():
    """5. Accessing protected endpoints without token or cookie returns 401."""
    # Create client with no cookies
    anon_client = TestClient(app)
    resp = anon_client.get("/api/v1/admin/state-overview")
    assert resp.status_code == 401

    resp_coord = anon_client.get("/api/v1/coordinator/centre")
    assert resp_coord.status_code == 401


def test_5_centre_isolation_enforced():
    """6, 7, 8. Coordinators cannot access other centres' data (403 Forbidden)."""
    # Login as Centre 1 Member
    c1_login = client.post("/api/v1/auth/login", json={
        "username": "centre1_member",
        "password": settings.CENTRE1_MEMBER_PASSWORD,
        "role": "centre1_member"
    })
    c1_token = c1_login.json()["access_token"]
    c1_headers = {"Authorization": f"Bearer {c1_token}"}

    # Centre 1 accessing Centre 1: OK
    resp_c1_self = client.get("/api/v1/coordinator/centre?centre_id=tc_gttc_rajajinagar", headers=c1_headers)
    assert resp_c1_self.status_code == 200

    # Centre 1 attempting to access Centre 2: 403 Forbidden
    resp_c1_c2 = client.get("/api/v1/coordinator/video-history/tc_kgtti_hubballi", headers=c1_headers)
    assert resp_c1_c2.status_code == 403
    assert "Access denied: Your account is authorized only for centre 'tc_gttc_rajajinagar'" in resp_c1_c2.json()["detail"]

    # Centre 1 attempting to access Centre 3: 403 Forbidden
    resp_c1_c3 = client.get("/api/v1/coordinator/attendance-history?centre_id=tc_iti_mysuru_nazarbad", headers=c1_headers)
    assert resp_c1_c3.status_code == 403

    # Login as Centre 2 Coordinator
    c2_login = client.post("/api/v1/auth/login", json={
        "username": "centre2_coordinator",
        "password": settings.CENTRE2_COORDINATOR_PASSWORD,
        "role": "centre2_coordinator"
    })
    c2_token = c2_login.json()["access_token"]
    c2_headers = {"Authorization": f"Bearer {c2_token}"}

    # Centre 2 attempting to access Centre 1: 403 Forbidden
    resp_c2_c1 = client.get("/api/v1/coordinator/video-history/tc_gttc_rajajinagar", headers=c2_headers)
    assert resp_c2_c1.status_code == 403

    # Centre 2 attempting to access Centre 3: 403 Forbidden
    resp_c2_c3 = client.get("/api/v1/coordinator/video-history/tc_iti_mysuru_nazarbad", headers=c2_headers)
    assert resp_c2_c3.status_code == 403

    # Login as Centre 3 Coordinator
    c3_login = client.post("/api/v1/auth/login", json={
        "username": "centre3_coordinator",
        "password": settings.CENTRE3_COORDINATOR_PASSWORD,
        "role": "centre3_coordinator"
    })
    c3_token = c3_login.json()["access_token"]
    c3_headers = {"Authorization": f"Bearer {c3_token}"}

    # Centre 3 attempting to access Centre 1: 403 Forbidden
    resp_c3_c1 = client.get("/api/v1/coordinator/centre?centre_id=tc_gttc_rajajinagar", headers=c3_headers)
    assert resp_c3_c1.status_code == 403

    # Centre 3 attempting to access Centre 2: 403 Forbidden
    resp_c3_c2 = client.get("/api/v1/coordinator/equipment?centre_id=tc_kgtti_hubballi", headers=c3_headers)
    assert resp_c3_c2.status_code == 403


def test_6_government_officer_cross_centre_access():
    """9. Government officer has cross-centre supervisory access to all 3 centres."""
    gov_login = client.post("/api/v1/auth/login", json={
        "username": "gov_officer",
        "password": settings.GOV_OFFICER_PASSWORD,
        "role": "government_officer"
    })
    gov_token = gov_login.json()["access_token"]
    gov_headers = {"Authorization": f"Bearer {gov_token}"}

    # Gov officer can access state overview
    resp_state = client.get("/api/v1/admin/state-overview", headers=gov_headers)
    assert resp_state.status_code == 200

    # Gov officer can inspect Centre 1
    resp_c1 = client.get("/api/v1/coordinator/centre?centre_id=tc_gttc_rajajinagar", headers=gov_headers)
    assert resp_c1.status_code == 200
    assert resp_c1.json()["id"] == "tc_gttc_rajajinagar"

    # Gov officer can inspect Centre 2
    resp_c2 = client.get("/api/v1/coordinator/video-history/tc_kgtti_hubballi", headers=gov_headers)
    assert resp_c2.status_code == 200

    # Gov officer can inspect Centre 3
    resp_c3 = client.get("/api/v1/coordinator/video-history/tc_iti_mysuru_nazarbad", headers=gov_headers)
    assert resp_c3.status_code == 200


def test_7_coordinator_blocked_from_admin_endpoints():
    """10. Coordinators are blocked from all /api/v1/admin/* endpoints (403 Forbidden)."""
    for username, pwd, role in [
        ("centre1_member", settings.CENTRE1_MEMBER_PASSWORD, "centre1_member"),
        ("centre2_coordinator", settings.CENTRE2_COORDINATOR_PASSWORD, "centre2_coordinator"),
        ("centre3_coordinator", settings.CENTRE3_COORDINATOR_PASSWORD, "centre3_coordinator"),
    ]:
        login_res = client.post("/api/v1/auth/login", json={"username": username, "password": pwd, "role": role})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        admin_resp = client.get("/api/v1/admin/state-overview", headers=headers)
        assert admin_resp.status_code == 403, f"{username} was not blocked from admin endpoint!"


def test_8_session_preservation_via_me_and_logout():
    """11, 12, 13. GET /me preserves session; POST /logout invalidates session."""
    session_client = TestClient(app)
    # Login via cookie
    login_res = session_client.post("/api/v1/auth/login", json={
        "username": "centre1_member",
        "password": settings.CENTRE1_MEMBER_PASSWORD,
        "role": "centre1_member"
    })
    assert login_res.status_code == 200
    assert settings.SESSION_COOKIE_NAME in session_client.cookies

    # Verify session works via cookie alone on /me
    me_resp = session_client.get("/api/v1/auth/me")
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["username"] == "centre1_member"
    assert me_data["role"] == "centre1_member"
    assert me_data["centre_id"] == "tc_gttc_rajajinagar"

    # Logout
    logout_res = session_client.post("/api/v1/auth/logout")
    assert logout_res.status_code == 200

    # Cookie is invalidated/deleted; subsequent request is 401
    me_after_logout = session_client.get("/api/v1/auth/me")
    assert me_after_logout.status_code == 401


def test_9_passwords_are_securely_hashed_in_db():
    """Verify that plaintext passwords are never stored in the database."""
    users = [
        ("gov_officer", settings.GOV_OFFICER_PASSWORD),
        ("centre1_member", settings.CENTRE1_MEMBER_PASSWORD),
        ("centre2_coordinator", settings.CENTRE2_COORDINATOR_PASSWORD),
        ("centre3_coordinator", settings.CENTRE3_COORDINATOR_PASSWORD),
    ]

    for uname, raw_pwd in users:
        row = execute_one("SELECT hashed_password FROM users WHERE username = ?", (uname,))
        assert row is not None
        hashed = row["hashed_password"]
        # Hashed string must NOT be raw password
        assert hashed != raw_pwd
        # Must be salted PBKDF2 hash (32-char hex salt + $ + 64-char hex key)
        assert "$" in hashed
        salt, key_hex = hashed.split("$", 1)
        assert len(salt) == 32
        assert len(key_hex) == 64

if __name__ == "__main__":
    tests = [
        test_1_valid_login_all_four_roles,
        test_2_invalid_credentials_returns_401,
        test_3_role_mismatch_returns_403,
        test_4_unauthenticated_request_returns_401,
        test_5_centre_isolation_enforced,
        test_6_government_officer_cross_centre_access,
        test_7_coordinator_blocked_from_admin_endpoints,
        test_8_session_preservation_via_me_and_logout,
        test_9_passwords_are_securely_hashed_in_db,
    ]
    print("=" * 70)
    print("RUNNING AUTHENTICATION & ROLE-BASED ACCESS CONTROL TEST SUITE")
    print("=" * 70)
    passed = 0
    failed = 0
    for t in tests:
        name = t.__name__
        doc = (t.__doc__ or "").strip().split("\n")[0]
        try:
            t()
            print(f" [PASS] {name}: {doc}")
            passed += 1
        except Exception as e:
            print(f" [FAIL] {name}: {doc}\n        Error: {e}")
            failed += 1
    print("=" * 70)
    print(f"SUMMARY: {passed} PASSED, {failed} FAILED (Total: {len(tests)})")
    print("=" * 70)
    if failed > 0:
        exit(1)
