import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.models import (
    User, EntrepreneurProfile, BusinessAnalysis, RiskAssessment,
    Scheme, SchemeMatch, MentorProfile, MentorshipRequest,
    Conversation, Message, BusinessPlan, RoadmapTask,
    ProgressRecord, LearningResource, UserResourceProgress,
    SDGImpactRecord, CommunityPost, CommunityReply, Notification
)
from backend.auth import hash_password
from backend.ai_engine import CentralAIEngine

def seed_database(db: Session):
    # Check if already seeded
    if db.query(User).filter(User.email == "priya@riseher.org").first():
        return

    print("Seeding RiseHer database with comprehensive hackathon dataset...")

    # --- 1. SCHEMES ---
    schemes_data = [
        {
            "name": "Prime Minister's Employment Generation Programme (PMEGP)",
            "short_code": "PMEGP",
            "scheme_type": "Central Government",
            "ministry_or_dept": "Ministry of Micro, Small and Medium Enterprises (MSME)",
            "financial_assistance_type": "Credit-Linked Subsidy (Up to 35%)",
            "max_amount_inr": 5000000.0,
            "subsidy_percentage": 35.0,
            "min_age": 18,
            "eligible_genders": "Women,General,Special",
            "eligible_stages": json.dumps(["Idea Stage", "Validation Stage", "Startup Stage"]),
            "eligible_domains": json.dumps(["All", "Fashion & Apparel", "Food & Bakery", "Handicrafts & Artisanal", "Agriculture & Agro-Processing"]),
            "eligible_locations": json.dumps(["All India", "Karnataka"]),
            "online_offline_suitability": "Both",
            "benefits_description": "Margin money subsidy of 25% (Urban) to 35% (Rural) for women entrepreneurs. Up to ₹50 Lakhs for manufacturing and ₹20 Lakhs for service units through nationalized banks.",
            "required_documents": json.dumps(["Aadhaar Card", "PAN Card", "Detailed Project Report (DPR)", "Caste/Special Category Certificate", "Highest Educational Qualification Certificate", "Bank Passbook"]),
            "official_website_url": "https://www.kviconline.gov.in/pmegpeportal/",
            "application_portal_url": "https://www.kviconline.gov.in/pmegpeportal/jsp/pmegponline.jsp",
            "application_status": "Open",
            "status_detail": "Online applications accepted year-round via KVIC portal without physical paperwork.",
            "last_verified_date": "2026-10-20"
        },
        {
            "name": "Pradhan Mantri Mudra Yojana (PMMY) - Shishu & Kishore",
            "short_code": "MUDRA",
            "scheme_type": "Central Government",
            "ministry_or_dept": "Department of Financial Services, Ministry of Finance",
            "financial_assistance_type": "Collateral-Free Term Loan & Working Capital",
            "max_amount_inr": 500000.0,
            "subsidy_percentage": 0.0,
            "min_age": 18,
            "eligible_genders": "All,Women Focused",
            "eligible_stages": json.dumps(["Idea Stage", "Validation Stage", "Startup Stage", "Early Business Stage"]),
            "eligible_domains": json.dumps(["All", "Fashion & Apparel", "Food & Bakery", "Retail", "Handicrafts & Artisanal"]),
            "eligible_locations": json.dumps(["All India"]),
            "online_offline_suitability": "Both",
            "benefits_description": "Collateral-free loans for non-corporate small businesses. Shishu (up to ₹50,000 for seed launch) and Kishore (₹50,000 to ₹5,00,000 for equipment and expansion) with Mudra RuPay card.",
            "required_documents": json.dumps(["Aadhaar Card", "PAN Card", "Business Proof / Quotation for Equipment", "Proof of Residence", "6 Months Bank Statement"]),
            "official_website_url": "https://www.mudra.org.in/",
            "application_portal_url": "https://www.udyamimitra.in/",
            "application_status": "Rolling",
            "status_detail": "Continuous processing through all commercial banks, RRBs, and micro-finance institutions.",
            "last_verified_date": "2026-10-18"
        },
        {
            "name": "Stand-Up India Scheme for Women Entrepreneurs",
            "short_code": "Stand-Up India",
            "scheme_type": "Central Government",
            "ministry_or_dept": "SIDBI & Ministry of Finance",
            "financial_assistance_type": "Composite Bank Loan (Term Loan + Working Capital)",
            "max_amount_inr": 10000000.0,
            "subsidy_percentage": 15.0,
            "min_age": 18,
            "eligible_genders": "Women Only,SC/ST",
            "eligible_stages": json.dumps(["Startup Stage", "Early Business Stage", "Growth & Expansion Stage"]),
            "eligible_domains": json.dumps(["All", "Manufacturing", "Services", "Agro-allied", "Trading"]),
            "eligible_locations": json.dumps(["All India"]),
            "online_offline_suitability": "Both",
            "benefits_description": "Bank loans between ₹10 Lakhs and ₹1 Crore to at least one woman borrower per bank branch for setting up a greenfield enterprise.",
            "required_documents": json.dumps(["Identity & Address Proof", "Business Plan Project Report", "Partnership Deed / Incorporation Certificate", "Pollution Clearance (if applicable)", "Audited Financials / Projections"]),
            "official_website_url": "https://www.standupmitra.in/",
            "application_portal_url": "https://www.standupmitra.in/Login/Register",
            "application_status": "Open",
            "status_detail": "Active branch quotas mandated across all Scheduled Commercial Banks.",
            "last_verified_date": "2026-10-22"
        },
        {
            "name": "Startup India Seed Fund Scheme (SISFS)",
            "short_code": "Startup India",
            "scheme_type": "Central Government",
            "ministry_or_dept": "DPIIT, Ministry of Commerce and Industry",
            "financial_assistance_type": "Grant (Up to ₹20L) & Debt/Debentures (Up to ₹50L)",
            "max_amount_inr": 5000000.0,
            "subsidy_percentage": 40.0,
            "min_age": 18,
            "eligible_genders": "All",
            "eligible_stages": json.dumps(["Validation Stage", "Startup Stage", "Early Business Stage"]),
            "eligible_domains": json.dumps(["Technology & Digital Services", "Education & EdTech", "Agriculture & Agro-Processing", "Beauty & Wellness"]),
            "eligible_locations": json.dumps(["All India"]),
            "online_offline_suitability": "Online",
            "benefits_description": "Financial assistance to startups for proof of concept, prototype development, product trials, market entry and commercialization via certified incubators.",
            "required_documents": json.dumps(["DPIIT Startup Recognition Certificate", "Incorporation Certificate", "Pitch Deck", "Prototype / Demo Video", "Incubator Preference List"]),
            "official_website_url": "https://www.startupindia.gov.in/",
            "application_portal_url": "https://seedfund.startupindia.gov.in/",
            "application_status": "Open",
            "status_detail": "Rolling incubator rounds open for recognised startups.",
            "last_verified_date": "2026-10-15"
        },
        {
            "name": "Udyam Registration Portal (Free MSME Certification)",
            "short_code": "Udyam MSME",
            "scheme_type": "Central Government",
            "ministry_or_dept": "Ministry of MSME",
            "financial_assistance_type": "Statutory MSME Status & Subsidy Entitlement",
            "max_amount_inr": 0.0,
            "subsidy_percentage": 100.0,
            "min_age": 18,
            "eligible_genders": "All",
            "eligible_stages": json.dumps(["Idea Stage", "Validation Stage", "Startup Stage", "Early Business Stage", "Growth & Expansion Stage"]),
            "eligible_domains": json.dumps(["All"]),
            "eligible_locations": json.dumps(["All India"]),
            "online_offline_suitability": "Both",
            "benefits_description": "Completely paperless, zero-fee official registration. Unlocks priority sector bank loans, 50% patent/trademark discount, electricity concessions, and protection against delayed buyer payments under MSMED Act.",
            "required_documents": json.dumps(["Aadhaar Card (linked with mobile)", "PAN Card", "Bank Account Details", "Business Activity NIC Code"]),
            "official_website_url": "https://udyamregistration.gov.in/",
            "application_portal_url": "https://udyamregistration.gov.in/Udyam_Registration.aspx",
            "application_status": "Open",
            "status_detail": "Instant digital generation of Udyam Certificate with unique QR code.",
            "last_verified_date": "2026-10-25"
        },
        {
            "name": "Women Entrepreneurship Platform (WEP) by NITI Aayog",
            "short_code": "WEP",
            "scheme_type": "NITI Aayog Initiative",
            "ministry_or_dept": "NITI Aayog & Government of India",
            "financial_assistance_type": "Incubation, Mentorship & Market Access Grants",
            "max_amount_inr": 1500000.0,
            "subsidy_percentage": 0.0,
            "min_age": 18,
            "eligible_genders": "Women Only",
            "eligible_stages": json.dumps(["Idea Stage", "Validation Stage", "Startup Stage", "Early Business Stage"]),
            "eligible_domains": json.dumps(["All"]),
            "eligible_locations": json.dumps(["All India"]),
            "online_offline_suitability": "Both",
            "benefits_description": "NITI Aayog's flagship aggregator connecting women entrepreneurs to corporate CSR grants, incubation hubs, masterclasses, and specialized financial partners.",
            "required_documents": json.dumps(["Profile Overview", "Business Pitch Summary", "Aadhaar Card", "Founder Bio"]),
            "official_website_url": "https://wep.gov.in/",
            "application_portal_url": "https://wep.gov.in/user/register",
            "application_status": "Rolling",
            "status_detail": "Free ongoing registration for Indian women founders.",
            "last_verified_date": "2026-10-22"
        },
        {
            "name": "Karnataka Mahila Udyam Nidhi Scheme",
            "short_code": "Mahila Udyam Nidhi",
            "scheme_type": "State Government",
            "ministry_or_dept": "Karnataka State Industrial & Infrastructure Development Corporation (KSIIDC)",
            "financial_assistance_type": "Soft Seed Capital Loan (1% Service Charge)",
            "max_amount_inr": 1000000.0,
            "subsidy_percentage": 25.0,
            "min_age": 18,
            "eligible_genders": "Women Only",
            "eligible_stages": json.dumps(["Startup Stage", "Early Business Stage"]),
            "eligible_domains": json.dumps(["Fashion & Apparel", "Food & Bakery", "Handicrafts & Artisanal", "Manufacturing"]),
            "eligible_locations": json.dumps(["Karnataka"]),
            "online_offline_suitability": "Both",
            "benefits_description": "Low-interest soft seed capital assistance for women entrepreneurs in Karnataka to meet equity gap in small scale projects, with 5-year repayment holiday.",
            "required_documents": json.dumps(["Domicile Certificate of Karnataka", "Project Feasibility Report", "Aadhaar Card", "MSME Registration", "Bank Approval Letter"]),
            "official_website_url": "https://karnataka.gov.in/",
            "application_portal_url": "https://industries.karnataka.gov.in/",
            "application_status": "Open",
            "status_detail": "State budget window open for FY2026-27.",
            "last_verified_date": "2026-10-10"
        }
    ]

    schemes_objs = []
    for s in schemes_data:
        obj = Scheme(**s)
        db.add(obj)
        schemes_objs.append(obj)
    db.commit()

    # --- 2. LEARNING RESOURCES ---
    resources_data = [
        {
            "title": "MSME Financial Literacy & Cash Flow Mastery",
            "description": "Practical bookkeeping, managing cash runway, and preparing bank-ready financial statements for women founders.",
            "category": "Financial Literacy",
            "difficulty": "Beginner",
            "estimated_duration": "3 hours",
            "source_name": "Swayam / IIM Bangalore",
            "external_url": "https://swayam.gov.in/",
            "relevant_domains": json.dumps(["All"]),
            "relevant_stages": json.dumps(["Idea Stage", "Validation Stage", "Startup Stage", "Early Business Stage"])
        },
        {
            "title": "Digital Marketing & D2C Sales via WhatsApp & Instagram",
            "description": "How to build an engaged social audience, run low-cost WhatsApp catalogs, and convert followers into repeat buyers.",
            "category": "Digital Marketing",
            "difficulty": "Beginner",
            "estimated_duration": "4 hours",
            "source_name": "Women Entrepreneurship Platform (WEP)",
            "external_url": "https://wep.gov.in/",
            "relevant_domains": json.dumps(["Fashion & Apparel", "Food & Bakery", "Handicrafts & Artisanal", "Beauty & Wellness"]),
            "relevant_stages": json.dumps(["Validation Stage", "Startup Stage", "Early Business Stage"])
        },
        {
            "title": "Food Safety & FSSAI FoSCoS Regulatory Compliance",
            "description": "Step-by-step masterclass on food hygiene protocols, mandatory lab testing, shelf-life estimation, and licensing.",
            "category": "Compliance & Legal",
            "difficulty": "Intermediate",
            "estimated_duration": "2.5 hours",
            "source_name": "FSSAI Training Portal",
            "external_url": "https://foscos.fssai.gov.in/",
            "relevant_domains": json.dumps(["Food & Bakery", "Agriculture & Agro-Processing"]),
            "relevant_stages": json.dumps(["Startup Stage", "Early Business Stage", "Growth & Expansion Stage"])
        },
        {
            "title": "Packaging, Shipping & Reverse Logistics for E-commerce",
            "description": "Optimizing volumetric packaging weights, negotiating bulk courier rates with aggregators, and reducing return RTO rates.",
            "category": "Operations & Logistics",
            "difficulty": "Beginner",
            "estimated_duration": "2 hours",
            "source_name": "MSME Technology Centre",
            "external_url": "https://msme.gov.in/",
            "relevant_domains": json.dumps(["Fashion & Apparel", "Handicrafts & Artisanal", "Technology & Digital Services"]),
            "relevant_stages": json.dumps(["Validation Stage", "Startup Stage", "Early Business Stage"])
        },
        {
            "title": "Organic Farm-to-Table & Agro Value-Addition",
            "description": "Post-harvest preservation, cold pressed extraction techniques, FPO formation, and APMC direct marketing channels.",
            "category": "Agriculture Innovation",
            "difficulty": "Intermediate",
            "estimated_duration": "5 hours",
            "source_name": "NABARD Rural Enterprise Institute",
            "external_url": "https://www.nabard.org/",
            "relevant_domains": json.dumps(["Agriculture & Agro-Processing"]),
            "relevant_stages": json.dumps(["Idea Stage", "Validation Stage", "Startup Stage", "Early Business Stage"])
        }
    ]

    res_objs = []
    for r in resources_data:
        obj = LearningResource(**r)
        db.add(obj)
        res_objs.append(obj)
    db.commit()

    # --- 3. MENTOR PROFILES & USERS ---
    # Real authentic mentor photos (Unsplash high quality business portrait photos)
    mentors_seed = [
        {
            "name": "Kavita Rao",
            "email": "kavita.mentor@riseher.org",
            "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
            "business_name": "LoomCraft Studio",
            "business_domain": "Fashion & Apparel",
            "years_experience": 8,
            "business_description": "Founded a D2C sustainable handloom apparel brand scaling from ₹50,000 bootstrap to ₹1.8 Crore annual turnover supporting 45 rural women weavers.",
            "location": "Bangalore, Karnataka",
            "expertise_areas": json.dumps(["E-Commerce", "Supply Chain", "Textile Sourcing", "Instagram D2C Sales", "Funding"]),
            "business_model_experience": "Online",
            "languages": json.dumps(["English", "Kannada", "Hindi"]),
            "availability_schedule": json.dumps(["Tuesdays 4:00 PM - 6:00 PM", "Saturdays 11:00 AM - 1:00 PM"]),
            "verification_status": "verified",
            "rating": 4.95,
            "reviews_count": 28,
            "bio": "Passionate about empowering women artisans through digital commerce and ethical supply networks.",
            "meeting_link": "https://meet.google.com/rsh-kavita-session",
            "success_story": "Helped 12 first-time fashion founders transition from home tailoring into profitable online boutique brands with recurring orders."
        },
        {
            "name": "Ananya Sengupta",
            "email": "ananya.mentor@riseher.org",
            "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
            "business_name": "Artisan Bakes & Co.",
            "business_domain": "Food & Bakery",
            "years_experience": 6,
            "business_description": "Built a multi-outlet cloud bakery and café in Karnataka specializing in gluten-free sourdough and artisanal confectionery.",
            "location": "Mysore, Karnataka",
            "expertise_areas": json.dumps(["Food Safety (FSSAI)", "Kitchen Capex", "Menu Engineering", "Pricing", "Staffing"]),
            "business_model_experience": "Both",
            "languages": json.dumps(["English", "Kannada", "Bengali"]),
            "availability_schedule": json.dumps(["Wednesdays 3:00 PM - 5:00 PM", "Sundays 10:00 AM - 12:00 PM"]),
            "verification_status": "verified",
            "rating": 4.9,
            "reviews_count": 22,
            "bio": "Culinary entrepreneur dedicated to helping women master commercial food production without predatory initial loans.",
            "meeting_link": "https://meet.google.com/rsh-ananya-bakes",
            "success_story": "Guided 8 home bakers through FSSAI licensing and profitable commercial kitchen leasing."
        },
        {
            "name": "Dr. Meera Reddy",
            "email": "meera.mentor@riseher.org",
            "avatar_url": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=600&q=80",
            "business_name": "VedaAgro Bio-Enterprises",
            "business_domain": "Agriculture & Agro-Processing",
            "years_experience": 11,
            "business_description": "Agricultural scientist turned agri-entrepreneur. Formed a women-led Farmer Producer Organization (FPO) generating sustainable rural livelihood.",
            "location": "Belgaum, Karnataka",
            "expertise_areas": json.dumps(["Organic Farming", "Post-Harvest Processing", "FPO Governance", "NABARD Schemes", "Cold Storage"]),
            "business_model_experience": "Offline",
            "languages": json.dumps(["Kannada", "Marathi", "English", "Hindi"]),
            "availability_schedule": json.dumps(["Thursdays 10:00 AM - 1:00 PM"]),
            "verification_status": "verified",
            "rating": 5.0,
            "reviews_count": 34,
            "bio": "Believes true economic independence begins in the soil and food sovereignty of rural women.",
            "meeting_link": "https://meet.google.com/rsh-meera-agro",
            "success_story": "Helped 600 rural women farmers double farm-gate price realizations through localized oil pressing and millet packaging."
        },
        {
            "name": "Shalini Verma",
            "email": "shalini.mentor@riseher.org",
            "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
            "business_name": "KalaKriti Handicrafts",
            "business_domain": "Handicrafts & Artisanal",
            "years_experience": 5,
            "business_description": "Export-oriented artisanal lifestyle brand selling handcrafted brass decor and block-printed textiles to 14 countries.",
            "location": "Bangalore / Jaipur",
            "expertise_areas": json.dumps(["Export Documentation", "Etsy / Global Sales", "Product Photography", "Fair Trade Certification"]),
            "business_model_experience": "Online",
            "languages": json.dumps(["English", "Hindi"]),
            "availability_schedule": json.dumps(["Fridays 2:00 PM - 5:00 PM"]),
            "verification_status": "verified",
            "rating": 4.88,
            "reviews_count": 19,
            "bio": "Connecting Indian heritage craftsmanship to global modern interiors through ethical D2C commerce.",
            "meeting_link": "https://meet.google.com/rsh-shalini-craft",
            "success_story": "Assisted women brass artisans in setting up direct international wire transfers without intermediary cuts."
        }
    ]

    mentor_users = []
    for m in mentors_seed:
        user = User(
            email=m["email"],
            password_hash=hash_password("password123"),
            full_name=m["name"],
            role="mentor",
            avatar_url=m["avatar_url"],
            is_verified=True,
            state="Karnataka"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        m_profile = MentorProfile(
            user_id=user.id,
            business_name=m["business_name"],
            business_domain=m["business_domain"],
            years_experience=m["years_experience"],
            business_description=m["business_description"],
            location=m["location"],
            expertise_areas=m["expertise_areas"],
            business_model_experience=m["business_model_experience"],
            languages=m["languages"],
            availability_schedule=m["availability_schedule"],
            verification_status=m["verification_status"],
            rating=m["rating"],
            reviews_count=m["reviews_count"],
            bio=m["bio"],
            meeting_link=m["meeting_link"],
            success_story=m["success_story"]
        )
        db.add(m_profile)
        db.commit()
        mentor_users.append(user)

    # --- 4. ADMIN USER ---
    admin_user = User(
        email="admin@riseher.org",
        password_hash=hash_password("password123"),
        full_name="Pooja Hegde",
        role="admin",
        avatar_url="https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=600&q=80",
        is_verified=True,
        state="Karnataka"
    )
    db.add(admin_user)
    db.commit()

    # --- 5. THREE CORE TEST SCENARIOS (ENTREPRENEURS) ---
    
    # SCENARIO 1: Priya Sharma (Online Boutique, Idea Stage, Limited Budget)
    priya_user = User(
        email="priya@riseher.org",
        password_hash=hash_password("password123"),
        full_name="Priya Sharma",
        role="entrepreneur",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
        is_verified=True,
        phone="+91 98450 12345",
        state="Karnataka"
    )
    db.add(priya_user)
    db.commit()
    db.refresh(priya_user)

    priya_profile = EntrepreneurProfile(
        user_id=priya_user.id,
        age_range="26-35",
        education="Bachelor's in Fashion Design (NIFT)",
        skills=json.dumps(["Pattern Making", "Garment Construction", "Trend Forecasting", "Fabric Sourcing", "Sketching"]),
        interests=json.dumps(["Sustainable Textiles", "Zero-Waste Fashion", "D2C Brands"]),
        work_experience="3 years as junior designer at an export house; no prior independent business management experience.",
        state="Karnataka",
        district="Bangalore Rural",
        location_type="Semi-Urban",
        business_idea="An online bespoke artisanal boutique crafting comfortable, breathable organic cotton and handloom daily wear for professional women, sold directly via digital channels.",
        business_domain="Fashion & Apparel",
        industry="Retail & E-commerce",
        available_investment=50000.0,
        expected_investment=150000.0,
        business_model="Online",
        current_status="Sketching initial 10-piece collection and researching handloom weavers in Karnataka.",
        current_stage="Idea Stage",
        challenges=json.dumps(["Funding", "Marketing", "Customer acquisition", "Business registration", "Finding suppliers"])
    )
    db.add(priya_profile)
    db.commit()

    # Run AI Analysis for Priya
    profile_dict_priya = {
        "business_idea": priya_profile.business_idea,
        "business_domain": priya_profile.business_domain,
        "current_stage": priya_profile.current_stage,
        "available_investment": priya_profile.available_investment,
        "expected_investment": priya_profile.expected_investment,
        "business_model": priya_profile.business_model,
        "location_type": priya_profile.location_type,
        "state": priya_profile.state,
        "skills": priya_profile.skills,
        "challenges": priya_profile.challenges
    }
    analysis_priya = CentralAIEngine.evaluate_business_idea(profile_dict_priya)

    priya_analysis_record = BusinessAnalysis(
        user_id=priya_user.id,
        idea_title="Artisanal Handloom D2C Boutique",
        idea_description=priya_profile.business_idea,
        domain=priya_profile.business_domain,
        business_stage=priya_profile.current_stage,
        overall_viability_score=analysis_priya["overall_viability_score"],
        market_demand_summary=analysis_priya["market_demand_summary"],
        market_demand_score=analysis_priya["market_demand_score"],
        estimated_investment_min=analysis_priya["estimated_investment_min"],
        estimated_investment_max=analysis_priya["estimated_investment_max"],
        customer_segments=json.dumps(analysis_priya["customer_segments"]),
        competitor_insights=json.dumps(analysis_priya["competitor_insights"]),
        skills_compatibility=json.dumps(analysis_priya["skills_compatibility"]),
        strengths=json.dumps(analysis_priya["strengths"]),
        weaknesses=json.dumps(analysis_priya["weaknesses"]),
        missing_information=json.dumps(analysis_priya["missing_information"]),
        recommended_improvements=json.dumps(analysis_priya["recommended_improvements"]),
        revenue_opportunities=json.dumps(analysis_priya["revenue_opportunities"]),
        operational_requirements=json.dumps(analysis_priya["operational_requirements"]),
        evidence_breakdown=json.dumps(analysis_priya["evidence_breakdown"]),
        explainability_factors=json.dumps(analysis_priya["explainability_factors"]),
        confidence_score=analysis_priya["confidence_score"]
    )
    db.add(priya_analysis_record)

    # Risk Assessment for Priya
    risk_sim_priya = {
        "available_investment": priya_profile.available_investment,
        "expected_sales_units_monthly": 45.0,
        "average_price_per_unit": 1250.0,
        "estimated_monthly_operating_cost": 22000.0,
        "business_model": "Online",
        "location_type": "Semi-Urban"
    }
    risk_priya = CentralAIEngine.calculate_risk_assessment(risk_sim_priya, priya_profile.business_domain)

    priya_risk_record = RiskAssessment(
        user_id=priya_user.id,
        financial_risk_score=risk_priya["financial_risk"]["score"],
        financial_risk_level=risk_priya["financial_risk"]["level"],
        financial_risk_factors=json.dumps(risk_priya["financial_risk"]["factors"]),
        financial_mitigations=json.dumps(risk_priya["financial_risk"]["mitigations"]),
        market_demand_risk_score=risk_priya["market_demand_risk"]["score"],
        market_demand_risk_level=risk_priya["market_demand_risk"]["level"],
        market_demand_factors=json.dumps(risk_priya["market_demand_risk"]["factors"]),
        market_demand_mitigations=json.dumps(risk_priya["market_demand_risk"]["mitigations"]),
        operational_risk_score=risk_priya["operational_risk"]["score"],
        operational_risk_level=risk_priya["operational_risk"]["level"],
        operational_factors=json.dumps(risk_priya["operational_risk"]["factors"]),
        operational_mitigations=json.dumps(risk_priya["operational_risk"]["mitigations"]),
        competition_risk_score=risk_priya["competition_risk"]["score"],
        competition_risk_level=risk_priya["competition_risk"]["level"],
        competition_factors=json.dumps(risk_priya["competition_risk"]["factors"]),
        competition_mitigations=json.dumps(risk_priya["competition_risk"]["mitigations"]),
        regulatory_risk_score=risk_priya["regulatory_risk"]["score"],
        regulatory_risk_level=risk_priya["regulatory_risk"]["level"],
        regulatory_factors=json.dumps(risk_priya["regulatory_risk"]["factors"]),
        regulatory_mitigations=json.dumps(risk_priya["regulatory_risk"]["mitigations"]),
        overall_risk_score=risk_priya["overall_risk_score"],
        overall_risk_level=risk_priya["overall_risk_level"],
        simulation_inputs=json.dumps(risk_sim_priya),
        missing_information=json.dumps(risk_priya["missing_information"])
    )
    db.add(priya_risk_record)

    # Match Schemes for Priya
    for s_obj in schemes_objs:
        s_dict = {
            "name": s_obj.name,
            "short_code": s_obj.short_code,
            "min_age": s_obj.min_age,
            "eligible_stages": s_obj.eligible_stages,
            "eligible_domains": s_obj.eligible_domains,
            "max_amount_inr": s_obj.max_amount_inr,
            "application_status": s_obj.application_status,
            "eligible_locations": s_obj.eligible_locations,
            "financial_assistance_type": s_obj.financial_assistance_type
        }
        match_res = CentralAIEngine.calculate_scheme_fit(profile_dict_priya, s_dict)
        
        # Initial checklist
        docs = json.loads(s_obj.required_documents) if s_obj.required_documents else []
        checklist = {d: ("available" if d in ["Aadhaar Card", "PAN Card"] else "pending") for d in docs}

        sm = SchemeMatch(
            user_id=priya_user.id,
            scheme_id=s_obj.id,
            scheme_fit_score=match_res["scheme_fit_score"],
            eligibility_score=match_res["eligibility_score"],
            sector_relevance_score=match_res["sector_relevance_score"],
            financial_suitability_score=match_res["financial_suitability_score"],
            availability_score=match_res["availability_score"],
            readiness_score=match_res["readiness_score"],
            location_stage_score=match_res["location_stage_score"],
            why_matched=match_res["why_matched"],
            is_eligible=match_res["is_eligible"],
            eligibility_notes=match_res["eligibility_notes"],
            application_status="shortlisted" if match_res["scheme_fit_score"] > 65 else "eligibility_reviewed",
            document_checklist_state=json.dumps(checklist)
        )
        db.add(sm)

    # Business Plan for Priya
    bp_priya = CentralAIEngine.generate_adaptive_business_plan(profile_dict_priya)
    bp_record = BusinessPlan(
        user_id=priya_user.id,
        title=bp_priya["title"],
        stage=bp_priya["stage"],
        plan_type=bp_priya["plan_type"],
        sections=json.dumps(bp_priya["sections"]),
        financial_estimates=json.dumps(bp_priya["financial_estimates"]),
        explicit_assumptions=json.dumps(bp_priya["explicit_assumptions"])
    )
    db.add(bp_record)

    # Roadmap Tasks for Priya
    tasks_priya = CentralAIEngine.generate_personalized_roadmap(profile_dict_priya)
    for t in tasks_priya:
        task_obj = RoadmapTask(
            user_id=priya_user.id,
            title=t["title"],
            description=t["description"],
            timeframe=t["timeframe"],
            milestone_group=t["milestone_group"],
            priority=t["priority"],
            estimated_days=t["estimated_days"],
            deadline_date=t["deadline_date"],
            is_completed=t["is_completed"],
            dependencies=json.dumps(t["dependencies"])
        )
        db.add(task_obj)

    # Progress tracking initial logs for Priya
    diag_p1 = CentralAIEngine.diagnose_progress_variance(15000.0, 18500.0, 4200.0, 3, "Week 1 Pilot")
    prog1 = ProgressRecord(
        user_id=priya_user.id,
        period_label="Week 1 Pilot",
        planned_budget=15000.0,
        actual_expenditure=18500.0,
        sales_revenue=4200.0,
        customers_acquired=3,
        milestones_achieved=json.dumps(["Sample fabrics procured", "3 trial sales delivered"]),
        challenges_faced="Fabric swatches took longer than expected to ship from weaver.",
        ai_variance_feedback=diag_p1["ai_variance_feedback"],
        ai_corrective_actions=json.dumps(diag_p1["ai_corrective_actions"])
    )
    db.add(prog1)

    # SDG impact records for Priya
    sdg_items = [
        {"goal": "SDG 5", "title": "Gender Equality", "indicator": "Women Artisans Directly Employed", "actual": 2.0, "target": 6.0, "unit": "artisans"},
        {"goal": "SDG 8", "title": "Decent Work & Economic Growth", "indicator": "Living Wages Disbursed to Female Weavers", "actual": 28000.0, "target": 80000.0, "unit": "INR"},
        {"goal": "SDG 12", "title": "Responsible Consumption & Production", "indicator": "Zero Single-Use Plastic Biodegradable Packaging", "actual": 100.0, "target": 100.0, "unit": "percent"}
    ]
    for item in sdg_items:
        sdg_rec = SDGImpactRecord(
            user_id=priya_user.id,
            sdg_goal=item["goal"],
            goal_title=item["title"],
            indicator_name=item["indicator"],
            actual_value=item["actual"],
            target_value=item["target"],
            unit=item["unit"],
            reporting_period="Q4 2026",
            data_source="Priya's supplier purchase vouchers"
        )
        db.add(sdg_rec)

    # User resource completion for Priya
    for r in res_objs[:2]:
        urp = UserResourceProgress(
            user_id=priya_user.id,
            resource_id=r.id,
            status="in_progress"
        )
        db.add(urp)

    # Pre-seeded conversation between Priya and Mentor Kavita Rao
    kavita_mentor_user = db.query(User).filter(User.email == "kavita.mentor@riseher.org").first()
    kavita_mentor_profile = db.query(MentorProfile).filter(MentorProfile.user_id == kavita_mentor_user.id).first()

    conv = Conversation(
        user1_id=priya_user.id,
        user2_id=kavita_mentor_user.id,
        topic="Sourcing handloom weavers in Karnataka & D2C packaging advice"
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)

    m1 = Message(
        conversation_id=conv.id,
        sender_id=priya_user.id,
        recipient_id=kavita_mentor_user.id,
        content="Hello Kavita ma'am! I loved learning about LoomCraft Studio. I'm currently designing an artisanal organic cotton collection in Bangalore Rural with ₹50k budget. How did you handle initial minimum order quantities with weavers?",
        is_read=True,
        created_at=datetime.utcnow() - timedelta(hours=5)
    )
    m2 = Message(
        conversation_id=conv.id,
        sender_id=kavita_mentor_user.id,
        recipient_id=priya_user.id,
        content="Hi Priya! Warm welcome to RiseHer. For small batches, never buy raw fabric off bulk mill catalogs. Go directly to handloom cluster societies in Ilkal or Doddaballapura. They often sell end-of-beam yardage (10-15 meters) at wholesale rates without MOQ barriers! Would love to review your unit pricing sheet.",
        is_read=True,
        created_at=datetime.utcnow() - timedelta(hours=3)
    )
    db.add(m1)
    db.add(m2)

    # Mentorship Request for Priya
    req_priya = MentorshipRequest(
        entrepreneur_id=priya_user.id,
        mentor_id=kavita_mentor_profile.id,
        subject="Consultation: Handloom Cluster Procurement & D2C Pricing",
        domain="Fashion & Apparel",
        message="Requesting a 30-min strategy review on validating our initial 5-piece sample collection and pricing margins.",
        preferred_slot="Saturdays 11:00 AM - 1:00 PM",
        status="accepted",
        meeting_link="https://meet.google.com/rsh-kavita-session",
        response_note="Accepted! Looking forward to reviewing your designs on Saturday."
    )
    db.add(req_priya)

    # Notifications for Priya
    notif1 = Notification(
        user_id=priya_user.id,
        title="Mentor Request Accepted",
        message="Kavita Rao has accepted your consultation request for Saturday 11:00 AM.",
        notification_type="mentorship",
        is_read=False,
        action_url="/mentors"
    )
    notif2 = Notification(
        user_id=priya_user.id,
        title="High SchemeFit Match Found",
        message="Your profile has an 88% match with PMEGP credit-linked subsidy. Check your document checklist.",
        notification_type="scheme",
        is_read=False,
        action_url="/schemes"
    )
    db.add(notif1)
    db.add(notif2)


    # SCENARIO 2: Ananya Patel (Small Bakery, Early Business Stage, Expansion)
    ananya_user = User(
        email="ananya@riseher.org",
        password_hash=hash_password("password123"),
        full_name="Ananya Patel",
        role="entrepreneur",
        avatar_url="https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=600&q=80",
        is_verified=True,
        phone="+91 98451 98765",
        state="Karnataka"
    )
    db.add(ananya_user)
    db.commit()
    db.refresh(ananya_user)

    ananya_profile = EntrepreneurProfile(
        user_id=ananya_user.id,
        age_range="36-45",
        education="Diploma in Bakery & Confectionery",
        skills=json.dumps(["Artisanal Sourdough Baking", "Recipe Standardization", "FSSAI Compliance", "Local Catering"]),
        interests=json.dumps(["Healthier Bakes", "Gluten-Free Flour Alternatives", "Café Culture"]),
        work_experience="Operated a home bakery for 2 years generating ₹45,000 monthly sales; now expanding to dedicated commercial cloud kitchen.",
        state="Karnataka",
        district="Mysore",
        location_type="Urban",
        business_idea="Expansion of 'Crumb & Crust Bakery' from a home kitchen into a dedicated commercial baking studio with walk-in pickup counter and weekend workshops.",
        business_domain="Food & Bakery",
        industry="Food & Beverage",
        available_investment=300000.0,
        expected_investment=650000.0,
        business_model="Offline",
        current_status="Operating profitable home kitchen with 180 regular monthly clients; scouting 450 sq ft commercial kitchen space.",
        current_stage="Early Business Stage",
        challenges=json.dumps(["Funding", "Finding suppliers", "Financial management", "Scaling", "Business operations"])
    )
    db.add(ananya_profile)
    db.commit()

    # Pre-generate Business Plan and Tasks for Ananya
    profile_dict_ananya = {
        "business_idea": ananya_profile.business_idea,
        "business_domain": ananya_profile.business_domain,
        "current_stage": ananya_profile.current_stage,
        "available_investment": ananya_profile.available_investment,
        "expected_investment": ananya_profile.expected_investment,
        "business_model": ananya_profile.business_model,
        "location_type": ananya_profile.location_type,
        "state": ananya_profile.state,
        "skills": ananya_profile.skills,
        "challenges": ananya_profile.challenges
    }
    analysis_ananya = CentralAIEngine.evaluate_business_idea(profile_dict_ananya)
    ananya_analysis_record = BusinessAnalysis(
        user_id=ananya_user.id,
        idea_title="Artisanal Bakery Expansion Studio",
        idea_description=ananya_profile.business_idea,
        domain=ananya_profile.business_domain,
        business_stage=ananya_profile.current_stage,
        overall_viability_score=analysis_ananya["overall_viability_score"],
        market_demand_summary=analysis_ananya["market_demand_summary"],
        market_demand_score=analysis_ananya["market_demand_score"],
        estimated_investment_min=analysis_ananya["estimated_investment_min"],
        estimated_investment_max=analysis_ananya["estimated_investment_max"],
        customer_segments=json.dumps(analysis_ananya["customer_segments"]),
        competitor_insights=json.dumps(analysis_ananya["competitor_insights"]),
        skills_compatibility=json.dumps(analysis_ananya["skills_compatibility"]),
        strengths=json.dumps(analysis_ananya["strengths"]),
        weaknesses=json.dumps(analysis_ananya["weaknesses"]),
        missing_information=json.dumps(analysis_ananya["missing_information"]),
        recommended_improvements=json.dumps(analysis_ananya["recommended_improvements"]),
        revenue_opportunities=json.dumps(analysis_ananya["revenue_opportunities"]),
        operational_requirements=json.dumps(analysis_ananya["operational_requirements"]),
        evidence_breakdown=json.dumps(analysis_ananya["evidence_breakdown"]),
        explainability_factors=json.dumps(analysis_ananya["explainability_factors"]),
        confidence_score=91.0
    )
    db.add(ananya_analysis_record)

    bp_ananya = CentralAIEngine.generate_adaptive_business_plan(profile_dict_ananya)
    bp_record_ananya = BusinessPlan(
        user_id=ananya_user.id,
        title=bp_ananya["title"],
        stage=bp_ananya["stage"],
        plan_type=bp_ananya["plan_type"],
        sections=json.dumps(bp_ananya["sections"]),
        financial_estimates=json.dumps(bp_ananya["financial_estimates"]),
        explicit_assumptions=json.dumps(bp_ananya["explicit_assumptions"])
    )
    db.add(bp_record_ananya)

    tasks_ananya = CentralAIEngine.generate_personalized_roadmap(profile_dict_ananya)
    for t in tasks_ananya:
        task_obj = RoadmapTask(
            user_id=ananya_user.id,
            title=t["title"],
            description=t["description"],
            timeframe=t["timeframe"],
            milestone_group=t["milestone_group"],
            priority=t["priority"],
            estimated_days=t["estimated_days"],
            deadline_date=t["deadline_date"],
            is_completed=t["is_completed"],
            dependencies=json.dumps(t["dependencies"])
        )
        db.add(task_obj)


    # SCENARIO 3: Sunita Devi (Rural Agriculture, Organic Agro-processing)
    sunita_user = User(
        email="sunita@riseher.org",
        password_hash=hash_password("password123"),
        full_name="Sunita Devi",
        role="entrepreneur",
        avatar_url="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80",
        is_verified=True,
        phone="+91 98452 54321",
        state="Karnataka"
    )
    db.add(sunita_user)
    db.commit()
    db.refresh(sunita_user)

    sunita_profile = EntrepreneurProfile(
        user_id=sunita_user.id,
        age_range="36-45",
        education="High School (10th Pass)",
        skills=json.dumps(["Organic Crop Cultivation", "Millet Processing", "Traditional Seed Preservation", "Village Self-Help Group Leadership"]),
        interests=json.dumps(["Sustainable Farming", "Cold-Pressed Seed Oils", "Women Farmer Collectives"]),
        work_experience="12 years managing 3 acres of ancestral farm land; president of local village Mahila Sangha with 25 women members.",
        state="Karnataka",
        district="Belgaum",
        location_type="Rural",
        business_idea="Setting up a village-level women-operated solar-powered cold-pressed oil extraction and organic ragi (finger millet) flour packaging micro-enterprise.",
        business_domain="Agriculture & Agro-Processing",
        industry="Agriculture & Rural Enterprise",
        available_investment=40000.0,
        expected_investment=180000.0,
        business_model="Offline",
        current_status="Formed women producer cluster; seeking solar oil expeller machinery financing and packaging machinery.",
        current_stage="Validation Stage",
        challenges=json.dumps(["Funding", "Technical skills", "Finding suppliers", "Marketing", "Business registration"])
    )
    db.add(sunita_profile)
    db.commit()

    # Pre-generate Analysis and Business Plan for Sunita
    profile_dict_sunita = {
        "business_idea": sunita_profile.business_idea,
        "business_domain": sunita_profile.business_domain,
        "current_stage": sunita_profile.current_stage,
        "available_investment": sunita_profile.available_investment,
        "expected_investment": sunita_profile.expected_investment,
        "business_model": sunita_profile.business_model,
        "location_type": sunita_profile.location_type,
        "state": sunita_profile.state,
        "skills": sunita_profile.skills,
        "challenges": sunita_profile.challenges
    }
    analysis_sunita = CentralAIEngine.evaluate_business_idea(profile_dict_sunita)
    sunita_analysis_record = BusinessAnalysis(
        user_id=sunita_user.id,
        idea_title="Solar Cold-Pressed Millet & Oil Collective",
        idea_description=sunita_profile.business_idea,
        domain=sunita_profile.business_domain,
        business_stage=sunita_profile.current_stage,
        overall_viability_score=analysis_sunita["overall_viability_score"],
        market_demand_summary=analysis_sunita["market_demand_summary"],
        market_demand_score=analysis_sunita["market_demand_score"],
        estimated_investment_min=analysis_sunita["estimated_investment_min"],
        estimated_investment_max=analysis_sunita["estimated_investment_max"],
        customer_segments=json.dumps(analysis_sunita["customer_segments"]),
        competitor_insights=json.dumps(analysis_sunita["competitor_insights"]),
        skills_compatibility=json.dumps(analysis_sunita["skills_compatibility"]),
        strengths=json.dumps(analysis_sunita["strengths"]),
        weaknesses=json.dumps(analysis_sunita["weaknesses"]),
        missing_information=json.dumps(analysis_sunita["missing_information"]),
        recommended_improvements=json.dumps(analysis_sunita["recommended_improvements"]),
        revenue_opportunities=json.dumps(analysis_sunita["revenue_opportunities"]),
        operational_requirements=json.dumps(analysis_sunita["operational_requirements"]),
        evidence_breakdown=json.dumps(analysis_sunita["evidence_breakdown"]),
        explainability_factors=json.dumps(analysis_sunita["explainability_factors"]),
        confidence_score=89.0
    )
    db.add(sunita_analysis_record)

    bp_sunita = CentralAIEngine.generate_adaptive_business_plan(profile_dict_sunita)
    bp_record_sunita = BusinessPlan(
        user_id=sunita_user.id,
        title=bp_sunita["title"],
        stage=bp_sunita["stage"],
        plan_type=bp_sunita["plan_type"],
        sections=json.dumps(bp_sunita["sections"]),
        financial_estimates=json.dumps(bp_sunita["financial_estimates"]),
        explicit_assumptions=json.dumps(bp_sunita["explicit_assumptions"])
    )
    db.add(bp_record_sunita)

    tasks_sunita = CentralAIEngine.generate_personalized_roadmap(profile_dict_sunita)
    for t in tasks_sunita:
        task_obj = RoadmapTask(
            user_id=sunita_user.id,
            title=t["title"],
            description=t["description"],
            timeframe=t["timeframe"],
            milestone_group=t["milestone_group"],
            priority=t["priority"],
            estimated_days=t["estimated_days"],
            deadline_date=t["deadline_date"],
            is_completed=t["is_completed"],
            dependencies=json.dumps(t["dependencies"])
        )
        db.add(task_obj)

    # --- 6. COMMUNITY DISCUSSIONS ---
    cp1 = CommunityPost(
        author_id=kavita_mentor_user.id,
        domain="Fashion & Apparel",
        title="Key learnings from scaling our first 100 online boutique orders in Karnataka",
        content="When we launched LoomCraft, our biggest mistake was trying to carry 30 different styles. Keep your first collection to 3-5 core designs! It simplifies your fabric procurement, lets you negotiate better with weavers, and keeps returns manageable.",
        tags=json.dumps(["Fashion", "E-commerce", "Inventory"]),
        likes_count=14
    )
    db.add(cp1)
    db.commit()
    db.refresh(cp1)

    r1 = CommunityReply(
        post_id=cp1.id,
        author_id=priya_user.id,
        content="Thank you Kavita ma'am! This is so relieving to hear. I was stressing over creating 20 sketches, but I will now focus on perfecting 4 flagship styles."
    )
    db.add(r1)

    cp2 = CommunityPost(
        author_id=mentor_users[2].id, # Dr. Meera Reddy
        domain="Agriculture & Agro-Processing",
        title="NABARD subsidies for rural women farmer collectives: Step-by-step checklist",
        content="For any sisters looking to start agro-processing or cold pressed oil units in rural districts, make sure your SHG or FPO has at least 6 months of active bank ledger history. That unlocks up to 33% capital subsidy under Agri-Clinics & Agri-Business Centers (ACABC).",
        tags=json.dumps(["Agro", "NABARD", "Subsidy"]),
        likes_count=21
    )
    db.add(cp2)
    db.commit()

    print("RiseHer database seeded successfully!")
