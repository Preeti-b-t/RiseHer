from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

# --- Auth Schemas ---
class UserBase(BaseModel):
    email: str
    full_name: str
    role: Optional[str] = "entrepreneur"
    phone: Optional[str] = None
    state: Optional[str] = "Karnataka"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(UserBase):
    id: int
    avatar_url: Optional[str] = None
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# --- Entrepreneur Profile Schemas ---
class EntrepreneurProfileBase(BaseModel):
    age_range: Optional[str] = "26-35"
    education: Optional[str] = "Bachelor's Degree"
    skills: List[str] = []
    interests: List[str] = []
    work_experience: Optional[str] = None
    
    # Personal Location
    country: Optional[str] = "India"
    state: Optional[str] = "Karnataka"
    district: Optional[str] = "Bangalore Rural"
    city: Optional[str] = "Bengaluru"
    pincode: Optional[str] = None
    location_type: Optional[str] = "Semi-Urban" # Urban, Rural, Semi-Urban
    
    # Business Information & Location
    business_idea: str
    business_domain: str = "Fashion & Apparel"
    industry: str = "Retail"
    available_investment: float = 50000.0
    expected_investment: float = 150000.0
    business_model: str = "Online" # Online, Offline, Hybrid
    current_status: Optional[str] = "Concept development"
    current_stage: str = "Idea Stage" # Idea Stage, Validation Stage, Startup Stage, Early Business Stage, Growth & Expansion Stage
    challenges: List[str] = []

    # Business Location & Mentorship Preferences
    business_location: Optional[str] = "Bengaluru, Karnataka"
    business_operating_area: Optional[str] = "District-wide"
    preferred_mentorship_location: Optional[str] = "Bengaluru"
    preferred_mentorship_mode: Optional[str] = "Hybrid" # Online, Offline, Hybrid
    profile_version: Optional[int] = 1

class EntrepreneurProfileCreate(EntrepreneurProfileBase):
    pass

class EntrepreneurProfileUpdate(BaseModel):
    age_range: Optional[str] = None
    education: Optional[str] = None
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    work_experience: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    location_type: Optional[str] = None
    business_idea: Optional[str] = None
    business_domain: Optional[str] = None
    industry: Optional[str] = None
    available_investment: Optional[float] = None
    expected_investment: Optional[float] = None
    business_model: Optional[str] = None
    current_status: Optional[str] = None
    current_stage: Optional[str] = None
    challenges: Optional[List[str]] = None
    business_location: Optional[str] = None
    business_operating_area: Optional[str] = None
    preferred_mentorship_location: Optional[str] = None
    preferred_mentorship_mode: Optional[str] = None

class EntrepreneurProfileOut(EntrepreneurProfileBase):
    id: int
    user_id: int
    profile_version: int = 1
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- AI Business Intelligence Schemas ---
class BusinessAnalysisRequest(BaseModel):
    business_idea: Optional[str] = None
    business_domain: Optional[str] = None
    business_stage: Optional[str] = None
    available_investment: Optional[float] = None
    expected_investment: Optional[float] = None
    business_model: Optional[str] = None
    location_type: Optional[str] = None
    state: Optional[str] = None

class CustomerSegmentItem(BaseModel):
    segment_name: str
    description: str
    willingness_to_pay: str
    priority: str

class CompetitorInsightItem(BaseModel):
    competitor_type: str
    examples: str
    advantage_for_user: str
    risk_factor: str

class ExplainabilityFactor(BaseModel):
    factor_name: str
    category: str # Profile, Market, Financial, Operational
    influence_direction: str # Positive, Negative, Neutral
    impact_weight: float # -1.0 to 1.0
    rationale: str
    evidence_type: str # Verified Data, User Input, Market Estimate, AI Hypothesis

class BusinessAnalysisOut(BaseModel):
    id: int
    user_id: int
    profile_version: int = 1
    idea_title: str
    idea_description: str
    domain: str
    business_stage: str
    overall_viability_score: float
    market_demand_summary: Optional[str] = None
    market_demand_score: float
    estimated_investment_min: float
    estimated_investment_max: float
    customer_segments: List[CustomerSegmentItem]
    competitor_insights: List[CompetitorInsightItem]
    competitor_landscape: Optional[Dict[str, Any]] = None
    skills_compatibility: Dict[str, Any]
    strengths: List[str]
    weaknesses: List[str]
    missing_information: List[str]
    recommended_improvements: List[str]
    revenue_opportunities: List[str]
    revenue_channels: Optional[List[Dict[str, Any]]] = None
    operational_requirements: List[str]
    evidence_breakdown: Dict[str, Any]
    explainability_factors: List[ExplainabilityFactor]
    confidence_score: float
    created_at: datetime

    class Config:
        from_attributes = True

class CompareIdeasRequest(BaseModel):
    idea_1: str
    domain_1: str
    idea_2: str
    domain_2: str


# --- Risk Assessment Schemas ---
class RiskFactorDetail(BaseModel):
    factor: str
    impact: str
    severity: str # Low, Moderate, High

class RiskCategoryOut(BaseModel):
    score: float
    level: str
    factors: List[RiskFactorDetail]
    mitigations: List[str]

class RiskSimulationRequest(BaseModel):
    available_investment: float
    expected_sales_units_monthly: float
    average_price_per_unit: float
    estimated_monthly_operating_cost: float
    business_model: str # Online, Offline, Hybrid
    location_type: str

class RiskAssessmentOut(BaseModel):
    id: int
    user_id: int
    overall_risk_score: float
    overall_risk_level: str
    financial_risk: RiskCategoryOut
    market_demand_risk: RiskCategoryOut
    operational_risk: RiskCategoryOut
    competition_risk: RiskCategoryOut
    regulatory_risk: RiskCategoryOut
    simulation_inputs: Dict[str, Any]
    missing_information: List[str]
    created_at: datetime


# --- SmartGov Scheme Schemas ---
class SchemeOut(BaseModel):
    id: int
    name: str
    short_code: Optional[str]
    scheme_type: str
    ministry_or_dept: Optional[str]
    financial_assistance_type: str
    max_amount_inr: float
    subsidy_percentage: float
    min_age: int
    eligible_genders: str
    eligible_stages: List[str]
    eligible_domains: List[str]
    eligible_locations: List[str]
    online_offline_suitability: str
    benefits_description: str
    required_documents: List[str]
    official_website_url: str
    application_portal_url: str
    application_status: str
    status_detail: str
    last_verified_date: str

class SchemeMatchOut(BaseModel):
    id: int
    scheme: SchemeOut
    scheme_fit_score: float
    eligibility_score: float
    sector_relevance_score: float
    financial_suitability_score: float
    availability_score: float
    readiness_score: float
    location_stage_score: float
    why_matched: str
    is_eligible: bool
    eligibility_notes: Optional[str]
    application_status: str
    document_checklist_state: Dict[str, str] # {doc_name: 'available' | 'pending'}
    user_notes: Optional[str]
    updated_at: Optional[datetime]

class DocumentChecklistUpdate(BaseModel):
    scheme_match_id: int
    document_name: str
    status: str # available, pending, uploaded

class ApplicationStatusUpdate(BaseModel):
    scheme_match_id: int
    status: str # shortlisted, eligibility_reviewed, requirements_pending, documents_prepared, submitted, under_review, approved, rejected
    user_notes: Optional[str] = None


# --- Entrepreneur Connect & Mentors ---
class MentorProfileOut(BaseModel):
    id: int
    user_id: int
    name: str
    avatar_url: Optional[str]
    business_name: str
    business_domain: str
    years_experience: int
    business_description: str
    location: str
    expertise_areas: List[str]
    business_model_experience: str
    languages: List[str]
    availability_schedule: List[str]
    verification_status: str
    rating: float
    reviews_count: int
    bio: Optional[str]
    meeting_link: Optional[str]
    success_story: Optional[str]
    why_suitable_for_user: Optional[str] = None
    match_score: Optional[float] = None

class MentorshipRequestCreate(BaseModel):
    mentor_id: int
    subject: str
    domain: str
    message: str
    preferred_slot: Optional[str] = None

class MentorshipRequestOut(BaseModel):
    id: int
    entrepreneur_id: int
    entrepreneur_name: str
    entrepreneur_avatar: Optional[str]
    mentor_id: int
    mentor_name: str
    subject: str
    domain: str
    message: str
    preferred_slot: Optional[str]
    status: str
    meeting_link: Optional[str]
    response_note: Optional[str]
    created_at: datetime

class MentorshipStatusUpdate(BaseModel):
    status: str # accepted, declined, completed
    meeting_link: Optional[str] = None
    response_note: Optional[str] = None

class MentorshipFeedback(BaseModel):
    rating: int # 1 to 5
    feedback: str


# --- Messaging Schemas ---
class MessageCreate(BaseModel):
    recipient_id: int
    content: str

class MessageOut(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    recipient_id: int
    sender_name: str
    sender_avatar: Optional[str]
    content: str
    is_read: bool
    created_at: datetime

class ConversationOut(BaseModel):
    id: int
    other_user_id: int
    other_user_name: str
    other_user_avatar: Optional[str]
    other_user_role: str
    topic: str
    last_message: Optional[str]
    unread_count: int
    updated_at: datetime


# --- Business Plan Schemas ---
class BusinessPlanSection(BaseModel):
    key: str
    title: str
    content: str
    is_edited: bool = False
    last_regenerated: Optional[str] = None

class BusinessPlanOut(BaseModel):
    id: int
    title: str
    stage: str
    plan_type: str
    sections: List[BusinessPlanSection]
    financial_estimates: Dict[str, Any]
    explicit_assumptions: List[str]
    created_at: datetime
    updated_at: datetime

class BusinessPlanSectionUpdate(BaseModel):
    section_key: str
    content: str


# --- Roadmap Tasks Schemas ---
class RoadmapTaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    timeframe: str = "Week 1"
    milestone_group: str = "Execution"
    priority: str = "High"
    estimated_days: int = 3
    deadline_date: Optional[str] = None
    dependencies: List[str] = []

class RoadmapTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    deadline_date: Optional[str] = None
    priority: Optional[str] = None

class RoadmapTaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    timeframe: str
    milestone_group: str
    priority: str
    estimated_days: int
    deadline_date: Optional[str]
    is_completed: bool
    is_custom: bool
    dependencies: List[str]
    created_at: datetime


# --- Progress Tracking Schemas ---
class ProgressRecordCreate(BaseModel):
    period_label: str
    planned_budget: float
    actual_expenditure: float
    sales_revenue: float
    customers_acquired: int
    milestones_achieved: List[str] = []
    challenges_faced: Optional[str] = None

class ProgressRecordOut(BaseModel):
    id: int
    period_label: str
    planned_budget: float
    actual_expenditure: float
    sales_revenue: float
    customers_acquired: int
    milestones_achieved: List[str]
    challenges_faced: Optional[str]
    ai_variance_feedback: Optional[str]
    ai_corrective_actions: List[str]
    created_at: datetime


# --- Learning Resources Schemas ---
class ResourceStatusUpdate(BaseModel):
    resource_id: int
    status: str # not_started, in_progress, completed

class LearningResourceOut(BaseModel):
    id: int
    title: str
    description: str
    category: str
    difficulty: str
    estimated_duration: str
    source_name: str
    external_url: str
    status: str = "not_started" # not_started, in_progress, completed


# --- SDG Impact Schemas ---
class SDGImpactRecordCreate(BaseModel):
    sdg_goal: str
    goal_title: str
    indicator_name: str
    actual_value: float
    target_value: float
    unit: str
    reporting_period: str
    data_source: str
    notes: Optional[str] = None

class SDGImpactRecordOut(BaseModel):
    id: int
    sdg_goal: str
    goal_title: str
    indicator_name: str
    actual_value: float
    target_value: float
    unit: str
    reporting_period: str
    data_source: str
    notes: Optional[str]
    percentage_achieved: float
    created_at: datetime


# --- Community Schemas ---
class CommunityReplyOut(BaseModel):
    id: int
    post_id: int
    author_id: int
    author_name: str
    author_avatar: Optional[str]
    author_role: str
    content: str
    created_at: datetime

class CommunityPostOut(BaseModel):
    id: int
    author_id: int
    author_name: str
    author_avatar: Optional[str]
    author_role: str
    domain: str
    title: str
    content: str
    tags: List[str]
    likes_count: int
    replies: List[CommunityReplyOut]
    created_at: datetime

class CommunityPostCreate(BaseModel):
    domain: str
    title: str
    content: str
    tags: List[str] = []

class CommunityReplyCreate(BaseModel):
    post_id: int
    content: str


# --- OTP Authentication & Profile Refresh Schemas ---
class SendOTPRequest(BaseModel):
    phone_or_email: str
    purpose: Optional[str] = "registration" # registration, login, password_reset

class VerifyOTPRequest(BaseModel):
    phone_or_email: str
    otp_code: str
    purpose: Optional[str] = "registration"

class RegisterWithOTPRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    password: str
    otp_code: str
    role: Optional[str] = "entrepreneur"
    terms_accepted: bool = True

class LoginWithOTPRequest(BaseModel):
    phone_or_email: str
    otp_code: str

class ForgotPasswordRequest(BaseModel):
    phone_or_email: str

class ForgotPasswordReset(BaseModel):
    phone_or_email: str
    otp_code: str
    new_password: str

class OTPResponse(BaseModel):
    success: bool
    message: str
    dev_otp: Optional[str] = None
    expires_in_seconds: int = 300

class ProfileAIRefreshResponse(BaseModel):
    success: bool
    message: str
    profile_version: int
    updated_at: datetime
    updated_modules: List[str]

