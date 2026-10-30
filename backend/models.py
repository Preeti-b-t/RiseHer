import datetime
import json
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="entrepreneur")  # entrepreneur, mentor, admin
    avatar_url = Column(String(500), nullable=True)
    is_verified = Column(Boolean, default=False)
    phone = Column(String(50), nullable=True)
    state = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    entrepreneur_profile = relationship("EntrepreneurProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    mentor_profile = relationship("MentorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    business_analyses = relationship("BusinessAnalysis", back_populates="user", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="user", cascade="all, delete-orphan")
    scheme_matches = relationship("SchemeMatch", back_populates="user", cascade="all, delete-orphan")
    business_plans = relationship("BusinessPlan", back_populates="user", cascade="all, delete-orphan")
    roadmap_tasks = relationship("RoadmapTask", back_populates="user", cascade="all, delete-orphan")
    progress_records = relationship("ProgressRecord", back_populates="user", cascade="all, delete-orphan")
    resource_progress = relationship("UserResourceProgress", back_populates="user", cascade="all, delete-orphan")
    sdg_records = relationship("SDGImpactRecord", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class EntrepreneurProfile(Base):
    __tablename__ = "entrepreneur_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Personal & professional
    age_range = Column(String(50), nullable=True)
    education = Column(String(100), nullable=True)
    skills = Column(Text, default="[]")       # JSON array of strings
    interests = Column(Text, default="[]")    # JSON array of strings
    work_experience = Column(Text, nullable=True)
    
    # Personal Location
    country = Column(String(100), default="India")
    state = Column(String(100), default="Karnataka")
    district = Column(String(100), default="Bangalore Rural")
    city = Column(String(100), default="Bengaluru")
    pincode = Column(String(20), nullable=True)
    location_type = Column(String(50), default="Semi-Urban") # Urban, Rural, Semi-Urban

    # Business Information & Location
    business_idea = Column(Text, nullable=False)
    business_domain = Column(String(100), default="Fashion & Apparel") 
    industry = Column(String(100), default="Retail")
    available_investment = Column(Float, default=50000.0)
    expected_investment = Column(Float, default=150000.0)
    business_model = Column(String(50), default="Online") # Online, Offline, Hybrid
    current_status = Column(String(100), default="Concept development")
    
    # Business-specific Location & Operating Area
    business_location = Column(String(200), default="Bengaluru, Karnataka")
    business_operating_area = Column(String(100), default="District-wide") # Local Neighborhood, District-wide, State-wide, Pan-India, Global/Export
    preferred_mentorship_location = Column(String(100), default="Bengaluru")
    preferred_mentorship_mode = Column(String(50), default="Hybrid") # Online, Offline, Hybrid

    # Entrepreneurial stage (1 to 5)
    # 1: Idea Stage, 2: Validation Stage, 3: Startup Stage, 4: Early Business Stage, 5: Growth & Expansion
    current_stage = Column(String(50), default="Idea Stage") 

    # Challenges (multiple selections)
    challenges = Column(Text, default="[]")  # JSON array

    # Central AI Refresh Version Tracking
    profile_version = Column(Integer, default=1)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="entrepreneur_profile")


class BusinessAnalysis(Base):
    __tablename__ = "business_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    profile_version = Column(Integer, default=1)
    idea_title = Column(String(255), nullable=False)
    idea_description = Column(Text, nullable=False)
    domain = Column(String(100), nullable=False)
    business_stage = Column(String(50), nullable=False)
    
    # 10 core analytical dimensions (JSON structured objects)
    overall_viability_score = Column(Float, default=75.0) # 0 to 100
    market_demand_summary = Column(Text, nullable=True)
    market_demand_score = Column(Float, default=70.0)
    estimated_investment_min = Column(Float, default=50000.0)
    estimated_investment_max = Column(Float, default=200000.0)
    customer_segments = Column(Text, default="[]") # JSON list of objects
    competitor_insights = Column(Text, default="[]") # Legacy JSON list of objects
    competitor_landscape_json = Column(Text, default="{}") # Comprehensive Dynamic Competitor Landscape
    skills_compatibility = Column(Text, default="{}") # JSON object
    strengths = Column(Text, default="[]") # JSON list
    weaknesses = Column(Text, default="[]") # JSON list
    missing_information = Column(Text, default="[]") # JSON list of items user needs to validate
    recommended_improvements = Column(Text, default="[]") # JSON list
    revenue_opportunities = Column(Text, default="[]") # Legacy JSON list
    revenue_channels_json = Column(Text, default="[]") # Dynamic Rich Revenue Channels
    operational_requirements = Column(Text, default="[]") # JSON list

    # Distinctions: Verified info vs Estimates vs AI Hypotheses
    evidence_breakdown = Column(Text, default="{}") # JSON dict
    
    # Explainable AI
    explainability_factors = Column(Text, default="[]") # JSON list of {factor, impact, weight, reason}
    confidence_score = Column(Float, default=85.0)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user = relationship("User", back_populates="business_analyses")


class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    id = Column(Integer, primary_key=True, index=True)
    phone_or_email = Column(String(255), index=True, nullable=False)
    otp_code = Column(String(128), nullable=False)
    purpose = Column(String(50), default="registration") # registration, login, password_reset
    attempts = Column(Integer, default=0)
    max_attempts = Column(Integer, default=5)
    is_verified = Column(Boolean, default=False)
    is_consumed = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # 5 Risk categories (0 - 100, higher is higher risk)
    financial_risk_score = Column(Float, default=45.0)
    financial_risk_level = Column(String(20), default="Moderate") # Low, Moderate, High
    financial_risk_factors = Column(Text, default="[]") # JSON
    financial_mitigations = Column(Text, default="[]") # JSON

    market_demand_risk_score = Column(Float, default=40.0)
    market_demand_risk_level = Column(String(20), default="Moderate")
    market_demand_factors = Column(Text, default="[]")
    market_demand_mitigations = Column(Text, default="[]")

    operational_risk_score = Column(Float, default=35.0)
    operational_risk_level = Column(String(20), default="Low")
    operational_factors = Column(Text, default="[]")
    operational_mitigations = Column(Text, default="[]")

    competition_risk_score = Column(Float, default=50.0)
    competition_risk_level = Column(String(20), default="Moderate")
    competition_factors = Column(Text, default="[]")
    competition_mitigations = Column(Text, default="[]")

    regulatory_risk_score = Column(Float, default=30.0)
    regulatory_risk_level = Column(String(20), default="Low")
    regulatory_factors = Column(Text, default="[]")
    regulatory_mitigations = Column(Text, default="[]")

    overall_risk_score = Column(Float, default=40.0)
    overall_risk_level = Column(String(20), default="Moderate")

    # Simulation inputs modified by user
    simulation_inputs = Column(Text, default="{}") # JSON: {investment, price, expected_sales, operating_costs, model, location}
    
    missing_information = Column(Text, default="[]") # JSON
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="risk_assessments")


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    short_code = Column(String(50), nullable=True) # PMEGP, MUDRA, etc.
    scheme_type = Column(String(100), default="Central Government") # Central, State, Institution
    ministry_or_dept = Column(String(255), nullable=True)
    financial_assistance_type = Column(String(100), default="Subsidy & Term Loan") # Grant, Subsidized Loan, Collateral-Free, Equity
    max_amount_inr = Column(Float, default=2500000.0)
    subsidy_percentage = Column(Float, default=25.0)
    
    # Eligibility criteria
    min_age = Column(Integer, default=18)
    eligible_genders = Column(String(100), default="Women Only,All")
    eligible_stages = Column(Text, default="[]") # JSON list of stages
    eligible_domains = Column(Text, default="[]") # JSON list of domains
    eligible_locations = Column(Text, default="[]") # JSON list of states/locations
    online_offline_suitability = Column(String(50), default="Both") # Online, Offline, Both

    benefits_description = Column(Text, nullable=False)
    required_documents = Column(Text, default="[]") # JSON list of required documents
    official_website_url = Column(String(500), nullable=False)
    application_portal_url = Column(String(500), nullable=False)
    
    application_status = Column(String(50), default="Open") # Open, Rolling, Upcoming, Closed, Unverified
    status_detail = Column(String(255), default="Applications accepted year-round via official portal")
    last_verified_date = Column(String(50), default="2026-10-15")

    matches = relationship("SchemeMatch", back_populates="scheme", cascade="all, delete-orphan")


class SchemeMatch(Base):
    __tablename__ = "scheme_matches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)

    # 100-point formula breakdown
    scheme_fit_score = Column(Float, default=0.0) # Total 0 - 100
    eligibility_score = Column(Float, default=0.0) # 30%
    sector_relevance_score = Column(Float, default=0.0) # 20%
    financial_suitability_score = Column(Float, default=0.0) # 15%
    availability_score = Column(Float, default=0.0) # 15%
    readiness_score = Column(Float, default=0.0) # 10%
    location_stage_score = Column(Float, default=0.0) # 10%

    why_matched = Column(Text, nullable=True)
    is_eligible = Column(Boolean, default=True)
    eligibility_notes = Column(Text, nullable=True)

    # User Application Tracking & Document Checklist
    # Statuses: shortlisted, eligibility_reviewed, requirements_pending, documents_prepared, submitted, under_review, approved, rejected, additional_info_requested
    application_status = Column(String(50), default="shortlisted")
    document_checklist_state = Column(Text, default="{}") # JSON dict: {doc_name: 'available' | 'pending' | 'uploaded'}
    user_notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="scheme_matches")
    scheme = relationship("Scheme", back_populates="matches")


class MentorProfile(Base):
    __tablename__ = "mentor_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    business_name = Column(String(255), nullable=False)
    business_domain = Column(String(100), nullable=False)
    years_experience = Column(Integer, default=5)
    business_description = Column(Text, nullable=False)
    location = Column(String(100), default="Bangalore, Karnataka")
    expertise_areas = Column(Text, default="[]") # JSON array: ['E-Commerce', 'Branding', 'Supply Chain']
    business_model_experience = Column(String(50), default="Both") # Online, Offline, Both
    languages = Column(Text, default="[\"English\", \"Hindi\", \"Kannada\"]") # JSON
    availability_schedule = Column(Text, default="[]") # JSON array of available time windows
    verification_status = Column(String(50), default="verified") # verified, pending, unverified
    rating = Column(Float, default=4.9)
    reviews_count = Column(Integer, default=18)
    bio = Column(Text, nullable=True)
    meeting_link = Column(String(500), default="https://meet.google.com/rsh-mentorship-session")
    success_story = Column(Text, nullable=True)

    user = relationship("User", back_populates="mentor_profile")
    requests_received = relationship("MentorshipRequest", back_populates="mentor", foreign_keys="MentorshipRequest.mentor_id")


class MentorshipRequest(Base):
    __tablename__ = "mentorship_requests"

    id = Column(Integer, primary_key=True, index=True)
    entrepreneur_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    mentor_id = Column(Integer, ForeignKey("mentor_profiles.id", ondelete="CASCADE"), nullable=False)
    
    subject = Column(String(255), nullable=False)
    domain = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    preferred_slot = Column(String(100), nullable=True)
    status = Column(String(50), default="pending") # pending, accepted, declined, completed
    meeting_link = Column(String(500), nullable=True)
    response_note = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    entrepreneur = relationship("User", foreign_keys=[entrepreneur_id])
    mentor = relationship("MentorProfile", back_populates="requests_received", foreign_keys=[mentor_id])


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user2_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    topic = Column(String(255), default="Mentorship Consultation")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])


class BusinessPlan(Base):
    __tablename__ = "business_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    stage = Column(String(50), nullable=False)
    plan_type = Column(String(100), default="Initial Business Plan")

    # 19 Structured Sections stored as JSON map: {section_key: {title, content, is_edited, last_regenerated}}
    sections = Column(Text, nullable=False) 
    financial_estimates = Column(Text, default="{}") # JSON: {investment_needed, monthly_burn, break_even_months, projected_rev_y1}
    explicit_assumptions = Column(Text, default="[]") # JSON list of assumptions
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="business_plans")


class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    timeframe = Column(String(50), default="Week 1") # Day 1, Week 1, Month 1, etc.
    milestone_group = Column(String(100), default="Validation & Setup")
    priority = Column(String(20), default="High") # High, Medium, Low
    estimated_days = Column(Integer, default=3)
    deadline_date = Column(String(50), nullable=True)
    is_completed = Column(Boolean, default=False)
    is_custom = Column(Boolean, default=False)
    dependencies = Column(Text, default="[]") # JSON list of task IDs
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="roadmap_tasks")


class ProgressRecord(Base):
    __tablename__ = "progress_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    period_label = Column(String(100), nullable=False) # e.g. "Month 1", "Week 4"
    planned_budget = Column(Float, default=0.0)
    actual_expenditure = Column(Float, default=0.0)
    sales_revenue = Column(Float, default=0.0)
    customers_acquired = Column(Integer, default=0)
    milestones_achieved = Column(Text, default="[]") # JSON list
    challenges_faced = Column(Text, nullable=True)
    
    # AI generated feedback on actual progress
    ai_variance_feedback = Column(Text, nullable=True)
    ai_corrective_actions = Column(Text, default="[]") # JSON list of recommended next actions

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="progress_records")


class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False) # Financial Literacy, Digital Marketing, Compliance, Operations
    difficulty = Column(String(50), default="Beginner") # Beginner, Intermediate, Advanced
    estimated_duration = Column(String(50), default="2 hours")
    source_name = Column(String(100), default="Government of India / Swayam")
    external_url = Column(String(500), nullable=False)
    relevant_domains = Column(Text, default="[]") # JSON list
    relevant_stages = Column(Text, default="[]") # JSON list


class UserResourceProgress(Base):
    __tablename__ = "user_resource_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resource_id = Column(Integer, ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="in_progress") # not_started, in_progress, completed
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="resource_progress")
    resource = relationship("LearningResource")


class SDGImpactRecord(Base):
    __tablename__ = "sdg_impact_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    sdg_goal = Column(String(50), nullable=False) # SDG 5, SDG 8, SDG 9, SDG 10, SDG 12
    goal_title = Column(String(100), nullable=False)
    indicator_name = Column(String(255), nullable=False)
    actual_value = Column(Float, default=0.0)
    target_value = Column(Float, default=1.0)
    unit = Column(String(50), default="count")
    reporting_period = Column(String(50), default="Q4 2026")
    data_source = Column(String(100), default="Self-reported entrepreneur business records")
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="sdg_records")


class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    domain = Column(String(100), default="General Entrepreneurship")
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    tags = Column(Text, default="[]") # JSON
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    author = relationship("User")
    replies = relationship("CommunityReply", back_populates="post", cascade="all, delete-orphan", order_by="CommunityReply.created_at")


class CommunityReply(Base):
    __tablename__ = "community_replies"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    post = relationship("CommunityPost", back_populates="replies")
    author = relationship("User")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="system") # system, mentorship, scheme, roadmap
    is_read = Column(Boolean, default=False)
    action_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")
