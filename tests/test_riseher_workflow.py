import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_auth_and_demo_switch():
    # Login as Priya (Scenario 1)
    res = client.post("/api/auth/login", json={"email": "priya@riseher.org", "password": "password123"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["full_name"] == "Priya Sharma"

    # Switch to Ananya (Scenario 2)
    res2 = client.post("/api/auth/switch-demo?email=ananya@riseher.org")
    assert res2.status_code == 200
    assert res2.json()["user"]["full_name"] == "Ananya Patel"

    # Switch to Sunita (Scenario 3)
    res3 = client.post("/api/auth/switch-demo?email=sunita@riseher.org")
    assert res3.status_code == 200
    assert res3.json()["user"]["full_name"] == "Sunita Devi"

def test_priya_full_workflow():
    # 1. Login
    login_res = client.post("/api/auth/login", json={"email": "priya@riseher.org", "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Profile
    prof_res = client.get("/api/profile/me", headers=headers)
    assert prof_res.status_code == 200
    prof = prof_res.json()
    assert prof["business_domain"] == "Fashion & Apparel"
    assert prof["current_stage"] == "Idea Stage"

    # 3. AI Analysis & Explainability
    an_res = client.get("/api/analysis/latest", headers=headers)
    assert an_res.status_code == 200
    an = an_res.json()
    assert an["overall_viability_score"] > 0
    assert len(an["explainability_factors"]) > 0
    assert len(an["customer_segments"]) > 0
    assert len(an["competitor_insights"]) > 0

    # 4. Idea Comparison
    cmp_res = client.post("/api/analysis/compare", headers=headers, json={
        "idea_1": "Organic Handloom Boutique",
        "domain_1": "Fashion & Apparel",
        "idea_2": "Handcrafted Brass Decor",
        "domain_2": "Handicrafts & Artisanal"
    })
    assert cmp_res.status_code == 200
    assert "idea_1" in cmp_res.json()
    assert "idea_2" in cmp_res.json()

    # 5. Risk Assessment & What-If Simulation
    risk_res = client.get("/api/risk/latest", headers=headers)
    assert risk_res.status_code == 200
    r_initial = risk_res.json()
    assert r_initial["overall_risk_score"] > 0

    # Simulate low capital condition vs high capital condition to verify sensitivity
    sim_low = client.post("/api/risk/simulate", headers=headers, json={
        "available_investment": 30000.0,
        "expected_sales_units_monthly": 30.0,
        "average_price_per_unit": 800.0,
        "estimated_monthly_operating_cost": 25000.0,
        "business_model": "Online",
        "location_type": "Semi-Urban"
    })
    assert sim_low.status_code == 200
    r_low = sim_low.json()

    sim_high = client.post("/api/risk/simulate", headers=headers, json={
        "available_investment": 180000.0,
        "expected_sales_units_monthly": 100.0,
        "average_price_per_unit": 1200.0,
        "estimated_monthly_operating_cost": 25000.0,
        "business_model": "Online",
        "location_type": "Semi-Urban"
    })
    assert sim_high.status_code == 200
    r_high = sim_high.json()

    # Financial risk should strictly decrease with higher capital & healthier margins
    assert r_high["financial_risk"]["score"] < r_low["financial_risk"]["score"]

    # 6. SmartGov Connect & Checklist
    schemes_res = client.get("/api/schemes/matches", headers=headers)
    assert schemes_res.status_code == 200
    matches = schemes_res.json()
    assert len(matches) >= 5
    top_match = matches[0]
    assert top_match["scheme_fit_score"] >= 80

    # Toggle a checklist document
    doc_key = list(top_match["document_checklist_state"].keys())[0]
    chk_res = client.post("/api/schemes/checklist/update", headers=headers, json={
        "scheme_match_id": top_match["id"],
        "document_name": doc_key,
        "status": "available"
    })
    assert chk_res.status_code == 200

    # Update application pipeline status
    app_res = client.post("/api/schemes/application/update", headers=headers, json={
        "scheme_match_id": top_match["id"],
        "status": "documents_prepared"
    })
    assert app_res.status_code == 200

    # 7. Mentors & Direct Messaging
    mentors_res = client.get("/api/mentors/list", headers=headers)
    assert mentors_res.status_code == 200
    mentors = mentors_res.json()
    assert len(mentors) > 0
    assert mentors[0]["match_score"] > 80

    # Conversations
    convs_res = client.get("/api/messages/conversations", headers=headers)
    assert convs_res.status_code == 200
    convs = convs_res.json()
    if len(convs) > 0:
        msgs_res = client.get(f"/api/messages/{convs[0]['id']}", headers=headers)
        assert msgs_res.status_code == 200

    # 8. Adaptive Business Plan
    bp_res = client.get("/api/business-plan/latest", headers=headers)
    assert bp_res.status_code == 200
    bp = bp_res.json()
    assert len(bp["sections"]) == 19

    # Edit a section
    edit_res = client.post("/api/business-plan/section/update", headers=headers, json={
        "section_key": "executive_summary",
        "content": "Updated Executive Summary verified by Priya Sharma."
    })
    assert edit_res.status_code == 200

    # 9. Roadmap
    tasks_res = client.get("/api/roadmap/tasks", headers=headers)
    assert tasks_res.status_code == 200
    tasks = tasks_res.json()
    assert len(tasks) >= 6

    # Toggle task
    t_toggle = client.post(f"/api/roadmap/task/{tasks[0]['id']}/toggle", headers=headers)
    assert t_toggle.status_code == 200

    # 10. Progress Tracking
    prog_res = client.get("/api/progress/history", headers=headers)
    assert prog_res.status_code == 200

    # Log new progress record
    new_prog = client.post("/api/progress/log", headers=headers, json={
        "period_label": "Month 2",
        "planned_budget": 20000.0,
        "actual_expenditure": 24000.0,
        "sales_revenue": 12000.0,
        "customers_acquired": 9,
        "milestones_achieved": ["First 9 repeat orders delivered"],
        "challenges_faced": "Packaging costs exceeded initial estimates"
    })
    assert new_prog.status_code == 200
    assert len(new_prog.json()["ai_corrective_actions"]) > 0

    # 11. Learning Resources
    learn_res = client.get("/api/learning/resources", headers=headers)
    assert learn_res.status_code == 200
    assert len(learn_res.json()) >= 4

    # 12. SDG Impact
    sdg_res = client.get("/api/sdg/metrics", headers=headers)
    assert sdg_res.status_code == 200
    assert len(sdg_res.json()) >= 3

    # 13. Community Forum
    posts_res = client.get("/api/community/posts")
    assert posts_res.status_code == 200
    assert len(posts_res.json()) >= 2

    # 14. Admin stats
    stats_res = client.get("/api/admin/stats", headers=headers)
    assert stats_res.status_code == 200
    assert stats_res.json()["total_official_schemes"] >= 7

def test_scenario_differentiation():
    # Scenario 1: Priya (Idea, Online Boutique, 50k budget)
    t1 = client.post("/api/auth/login", json={"email": "priya@riseher.org", "password": "password123"}).json()["access_token"]
    h1 = {"Authorization": f"Bearer {t1}"}
    p1 = client.get("/api/profile/me", headers=h1).json()
    a1 = client.get("/api/analysis/latest", headers=h1).json()

    # Scenario 2: Ananya (Early Business, Bakery Expansion, 300k budget)
    t2 = client.post("/api/auth/login", json={"email": "ananya@riseher.org", "password": "password123"}).json()["access_token"]
    h2 = {"Authorization": f"Bearer {t2}"}
    p2 = client.get("/api/profile/me", headers=h2).json()
    a2 = client.get("/api/analysis/latest", headers=h2).json()

    # Scenario 3: Sunita (Validation, Rural Agro Producer, 40k budget)
    t3 = client.post("/api/auth/login", json={"email": "sunita@riseher.org", "password": "password123"}).json()["access_token"]
    h3 = {"Authorization": f"Bearer {t3}"}
    p3 = client.get("/api/profile/me", headers=h3).json()
    a3 = client.get("/api/analysis/latest", headers=h3).json()

    # Assert distinct domains and stages
    assert p1["business_domain"] == "Fashion & Apparel" and p1["current_stage"] == "Idea Stage"
    assert p2["business_domain"] == "Food & Bakery" and p2["current_stage"] == "Early Business Stage"
    assert p3["business_domain"] == "Agriculture & Agro-Processing" and p3["current_stage"] == "Validation Stage"

    # Assert distinct business models and locations
    assert p1["business_model"] == "Online" and p1["location_type"] == "Semi-Urban"
    assert p2["business_model"] == "Offline" and p2["location_type"] == "Urban"
    assert p3["business_model"] == "Offline" and p3["location_type"] == "Rural"

    # Assert distinct viability scores and recommendations
    assert a1["overall_viability_score"] != a2["overall_viability_score"]
    assert a2["overall_viability_score"] != a3["overall_viability_score"]
