import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from main import app
from app.core.config import settings

def test_full_flow():
    client = TestClient(app)

    # 1. Test unauthenticated root returns HTML with login portal and hidden app layout
    root_resp = client.get("/")
    assert root_resp.status_code == 200
    html = root_resp.text
    assert 'id="login-portal-screen"' in html
    assert 'id="app-layout" class="h-full flex overflow-hidden w-full hidden"' in html
    assert 'role-card-government_officer' in html
    assert 'role-card-centre1_member' in html
    assert 'role-card-centre2_coordinator' in html
    assert 'role-card-centre3_coordinator' in html
    print(" [PASS] 1. Unauthenticated page structure contains initial login portal and conceals protected layout.")

    # 2. Test unauthenticated /auth/me returns 401
    me_resp = client.get("/api/v1/auth/me")
    assert me_resp.status_code == 401
    print(" [PASS] 2. Unauthenticated /api/v1/auth/me correctly returns 401 Unauthorized.")

    # 3. Test Government Officer Login & Session
    gov_client = TestClient(app)
    gov_res = gov_client.post("/api/v1/auth/login", json={
        "username": "gov_officer",
        "password": settings.GOV_OFFICER_PASSWORD,
        "role": "government_officer"
    })
    assert gov_res.status_code == 200
    assert gov_res.json()["redirect_dashboard"] == "state_dashboard"
    assert settings.SESSION_COOKIE_NAME in gov_res.cookies

    # Gov officer can access state-overview and all centres
    assert gov_client.get("/api/v1/admin/state-overview").status_code == 200
    assert gov_client.get("/api/v1/coordinator/centre?centre_id=tc_gttc_rajajinagar").status_code == 200
    assert gov_client.get("/api/v1/coordinator/video-history/tc_kgtti_hubballi").status_code == 200
    assert gov_client.get("/api/v1/coordinator/video-history/tc_iti_mysuru_nazarbad").status_code == 200
    print(" [PASS] 3. Government Officer login, redirect (state_dashboard), cookie session, and cross-centre access verified.")

    # 4. Test Centre 1 Member Login & Session
    c1_client = TestClient(app)
    c1_res = c1_client.post("/api/v1/auth/login", json={
        "username": "centre1_member",
        "password": settings.CENTRE1_MEMBER_PASSWORD,
        "role": "centre1_member"
    })
    assert c1_res.status_code == 200
    assert c1_res.json()["redirect_dashboard"] == "webcam_studio"
    assert c1_res.json()["user"]["centre_id"] == "tc_gttc_rajajinagar"

    # Centre 1 cannot access admin
    assert c1_client.get("/api/v1/admin/state-overview").status_code == 403
    # Centre 1 cannot access Centre 2 or 3
    assert c1_client.get("/api/v1/coordinator/video-history/tc_kgtti_hubballi").status_code == 403
    assert c1_client.get("/api/v1/coordinator/video-history/tc_iti_mysuru_nazarbad").status_code == 403
    # Centre 1 CAN access Centre 1
    assert c1_client.get("/api/v1/coordinator/centre?centre_id=tc_gttc_rajajinagar").status_code == 200
    print(" [PASS] 4. Centre 1 Member login, redirect (webcam_studio), and centre isolation verified.")

    # 5. Test Centre 2 Coordinator Login & Session
    c2_client = TestClient(app)
    c2_res = c2_client.post("/api/v1/auth/login", json={
        "username": "centre2_coordinator",
        "password": settings.CENTRE2_COORDINATOR_PASSWORD,
        "role": "centre2_coordinator"
    })
    assert c2_res.status_code == 200
    assert c2_res.json()["redirect_dashboard"] == "video_studio_centre2"
    assert c2_res.json()["user"]["centre_id"] == "tc_kgtti_hubballi"

    # Centre 2 cannot access admin
    assert c2_client.get("/api/v1/admin/state-overview").status_code == 403
    # Centre 2 cannot access Centre 1 or 3
    assert c2_client.get("/api/v1/coordinator/centre?centre_id=tc_gttc_rajajinagar").status_code == 403
    assert c2_client.get("/api/v1/coordinator/video-history/tc_iti_mysuru_nazarbad").status_code == 403
    # Centre 2 CAN access Centre 2
    assert c2_client.get("/api/v1/coordinator/video-history/tc_kgtti_hubballi").status_code == 200
    print(" [PASS] 5. Centre 2 Coordinator login, redirect (video_studio_centre2), and centre isolation verified.")

    # 6. Test Centre 3 Coordinator Login & Session
    c3_client = TestClient(app)
    c3_res = c3_client.post("/api/v1/auth/login", json={
        "username": "centre3_coordinator",
        "password": settings.CENTRE3_COORDINATOR_PASSWORD,
        "role": "centre3_coordinator"
    })
    assert c3_res.status_code == 200
    assert c3_res.json()["redirect_dashboard"] == "video_studio_centre3"
    assert c3_res.json()["user"]["centre_id"] == "tc_iti_mysuru_nazarbad"

    # Centre 3 cannot access admin
    assert c3_client.get("/api/v1/admin/state-overview").status_code == 403
    # Centre 3 cannot access Centre 1 or 2
    assert c3_client.get("/api/v1/coordinator/centre?centre_id=tc_gttc_rajajinagar").status_code == 403
    assert c3_client.get("/api/v1/coordinator/video-history/tc_kgtti_hubballi").status_code == 403
    # Centre 3 CAN access Centre 3
    assert c3_client.get("/api/v1/coordinator/video-history/tc_iti_mysuru_nazarbad").status_code == 200
    print(" [PASS] 6. Centre 3 Coordinator login, redirect (video_studio_centre3), and centre isolation verified.")

    # 7. Test Logout and Session Invalidation
    logout_res = c3_client.post("/api/v1/auth/logout")
    assert logout_res.status_code == 200
    assert c3_client.get("/api/v1/auth/me").status_code == 401
    print(" [PASS] 7. Session logout and cookie invalidation verified.")

    # 8. Test Rate Limiting
    rl_client = TestClient(app)
    for i in range(5):
        rl_client.post("/api/v1/auth/login", json={
            "username": "gov_officer",
            "password": "WrongPassword!",
            "role": "government_officer"
        })
    # 6th attempt must be rate-limited (429)
    blocked_res = rl_client.post("/api/v1/auth/login", json={
        "username": "gov_officer",
        "password": "WrongPassword!",
        "role": "government_officer"
    })
    assert blocked_res.status_code == 429
    assert "Too many failed login attempts" in blocked_res.json()["detail"]
    print(" [PASS] 8. Brute force rate limiting (HTTP 429) verified after 5 failed attempts.")

if __name__ == "__main__":
    print("=" * 70)
    print("VERIFYING END-TO-END ROLE-BASED LOGIN & DASHBOARD ACCESS WORKFLOWS")
    print("=" * 70)
    test_full_flow()
    print("=" * 70)
    print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")
    print("=" * 70)
