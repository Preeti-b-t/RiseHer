export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'entrepreneur' | 'mentor' | 'admin';
  avatar_url?: string;
  is_verified: boolean;
  phone?: string;
  state?: string;
  created_at: string;
}

export interface EntrepreneurProfile {
  id: number;
  user_id: number;
  age_range?: string;
  education?: string;
  skills: string[];
  interests: string[];
  work_experience?: string;
  country?: string;
  state: string;
  district: string;
  city?: string;
  pincode?: string;
  location_type: string;
  business_location?: string;
  business_operating_area?: string;
  preferred_mentorship_location?: string;
  preferred_mentorship_mode?: 'Online' | 'Offline' | 'Hybrid';
  business_idea: string;
  business_domain: string;
  industry: string;
  available_investment: number;
  expected_investment: number;
  business_model: string;
  current_status?: string;
  current_stage: 'Idea Stage' | 'Validation Stage' | 'Startup Stage' | 'Early Business Stage' | 'Growth & Expansion Stage';
  challenges: string[];
  profile_version?: number;
  updated_at?: string;
}

export interface CustomerSegmentItem {
  segment_name: string;
  description: string;
  willingness_to_pay: string;
  priority: string;
}

export interface CompetitorInsightItem {
  competitor_type: string;
  examples: string;
  advantage_for_user: string;
  risk_factor: string;
}

export interface DynamicRevenueChannel {
  name: string;
  how_it_works: string;
  why_it_fits: string;
  initial_requirements: string;
  estimated_setup_cost: string;
  limitations_and_risks: string;
}

export interface CompetitorGroupItem {
  category: string;
  examples: string[];
  threat_level: 'High' | 'Moderate' | 'Low';
  description: string;
  user_advantage: string;
}

export interface DynamicCompetitorLandscape {
  direct_competitors?: CompetitorGroupItem;
  indirect_competitors?: CompetitorGroupItem;
  local_competitors?: CompetitorGroupItem;
  online_competitors?: CompetitorGroupItem;
  pricing_comparison?: {
    user_positioning: string;
    market_average: string;
    premium_benchmark: string;
    budget_alternatives: string;
    strategic_pricing_advice: string;
  };
  market_positioning?: {
    strategic_niche: string;
    target_demographic: string;
    moat_defense: string;
  };
  differentiation_strategies?: string[];
}

export interface ExplainabilityFactor {
  factor_name: string;
  category: 'Profile' | 'Market' | 'Financial' | 'Operational';
  influence_direction: 'Positive' | 'Negative' | 'Neutral';
  impact_weight: number;
  rationale: string;
  evidence_type: 'Verified Data' | 'User Input' | 'Market Estimate' | 'AI Hypothesis';
}

export interface BusinessAnalysis {
  id: number;
  user_id: number;
  profile_version?: number;
  idea_title: string;
  idea_description: string;
  domain: string;
  business_stage: string;
  overall_viability_score: number;
  market_demand_summary?: string;
  market_demand_score: number;
  estimated_investment_min: number;
  estimated_investment_max: number;
  customer_segments: CustomerSegmentItem[];
  competitor_insights: CompetitorInsightItem[];
  competitor_landscape?: DynamicCompetitorLandscape;
  skills_compatibility: {
    matched_skills: string[];
    missing_critical_skills: string[];
    fit_percentage: number;
  };
  strengths: string[];
  weaknesses: string[];
  missing_information: string[];
  recommended_improvements: string[];
  revenue_opportunities: string[];
  revenue_channels?: DynamicRevenueChannel[];
  operational_requirements: string[];
  evidence_breakdown: {
    verified_information: string[];
    market_estimates: string[];
    ai_hypotheses: string[];
    missing_validation_data: string[];
  };
  explainability_factors: ExplainabilityFactor[];
  confidence_score: number;
  created_at: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  dev_otp?: string;
  expires_in_seconds?: number;
}

export interface ProfileAIRefreshResponse {
  success: boolean;
  message: string;
  profile_version: number;
  updated_at: string;
  updated_modules: string[];
}

export interface InspirationStory {
  id: string;
  name: string;
  company: string;
  domain: string;
  photoUrl: string;
  quoteOrLesson: string;
  quoteAttribution: string;
  summary: string;
  fullJourney: string[];
  keyMilestones: string[];
  takeawayForEntrepreneurs: string;
}

export interface RiskFactorDetail {
  factor: string;
  impact: string;
  severity: 'Low' | 'Moderate' | 'High';
}

export interface RiskCategory {
  score: number;
  level: 'Low' | 'Moderate' | 'High';
  factors: RiskFactorDetail[];
  mitigations: string[];
}

export interface RiskAssessment {
  id: number;
  user_id: number;
  overall_risk_score: number;
  overall_risk_level: 'Low' | 'Moderate' | 'High';
  financial_risk: RiskCategory;
  market_demand_risk: RiskCategory;
  operational_risk: RiskCategory;
  competition_risk: RiskCategory;
  regulatory_risk: RiskCategory;
  simulation_inputs: {
    available_investment: number;
    expected_sales_units_monthly: number;
    average_price_per_unit: number;
    estimated_monthly_operating_cost: number;
    business_model: string;
    location_type: string;
  };
  missing_information: string[];
  created_at: string;
}

export interface Scheme {
  id: number;
  name: string;
  short_code?: string;
  scheme_type: string;
  ministry_or_dept?: string;
  financial_assistance_type: string;
  max_amount_inr: number;
  subsidy_percentage: number;
  min_age: number;
  eligible_genders: string;
  eligible_stages: string[];
  eligible_domains: string[];
  eligible_locations: string[];
  online_offline_suitability: string;
  benefits_description: string;
  required_documents: string[];
  official_website_url: string;
  application_portal_url: string;
  application_status: 'Open' | 'Rolling' | 'Upcoming' | 'Closed' | 'Unverified';
  status_detail: string;
  last_verified_date: string;
}

export interface SchemeMatch {
  id: number;
  scheme: Scheme;
  scheme_fit_score: number;
  eligibility_score: number;
  sector_relevance_score: number;
  financial_suitability_score: number;
  availability_score: number;
  readiness_score: number;
  location_stage_score: number;
  why_matched: string;
  is_eligible: boolean;
  eligibility_notes?: string;
  application_status: 'shortlisted' | 'eligibility_reviewed' | 'requirements_pending' | 'documents_prepared' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  document_checklist_state: Record<string, 'available' | 'pending' | 'uploaded'>;
  user_notes?: string;
  updated_at?: string;
}

export interface MentorProfile {
  id: number;
  user_id: number;
  name: string;
  avatar_url?: string;
  business_name: string;
  business_domain: string;
  years_experience: number;
  business_description: string;
  location: string;
  expertise_areas: string[];
  business_model_experience: string;
  languages: string[];
  availability_schedule: string[];
  verification_status: 'verified' | 'pending' | 'unverified';
  rating: number;
  reviews_count: number;
  bio?: string;
  meeting_link?: string;
  success_story?: string;
  why_suitable_for_user?: string;
  match_score?: number;
}

export interface MentorshipRequest {
  id: number;
  entrepreneur_id: number;
  entrepreneur_name: string;
  entrepreneur_avatar?: string;
  mentor_id: number;
  mentor_name: string;
  subject: string;
  domain: string;
  message: string;
  preferred_slot?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  meeting_link?: string;
  response_note?: string;
  created_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  recipient_id: number;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  other_user_id: number;
  other_user_name: string;
  other_user_avatar?: string;
  other_user_role: string;
  topic: string;
  last_message?: string;
  unread_count: number;
  updated_at: string;
}

export interface BusinessPlanSection {
  key: string;
  title: string;
  content: string;
  is_edited: boolean;
  last_regenerated?: string;
}

export interface BusinessPlan {
  id: number;
  title: string;
  stage: string;
  plan_type: string;
  sections: BusinessPlanSection[];
  financial_estimates: Record<string, any>;
  explicit_assumptions: string[];
  created_at: string;
  updated_at: string;
}

export interface RoadmapTask {
  id: number;
  title: string;
  description?: string;
  timeframe: string;
  milestone_group: string;
  priority: 'High' | 'Medium' | 'Low';
  estimated_days: number;
  deadline_date?: string;
  is_completed: boolean;
  is_custom: boolean;
  dependencies: string[];
  created_at: string;
}

export interface ProgressRecord {
  id: number;
  period_label: string;
  planned_budget: number;
  actual_expenditure: number;
  sales_revenue: number;
  customers_acquired: number;
  milestones_achieved: string[];
  challenges_faced?: string;
  ai_variance_feedback?: string;
  ai_corrective_actions: string[];
  created_at: string;
}

export interface LearningResource {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_duration: string;
  source_name: string;
  external_url: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface SDGImpactRecord {
  id: number;
  sdg_goal: string;
  goal_title: string;
  indicator_name: string;
  actual_value: number;
  target_value: number;
  unit: string;
  reporting_period: string;
  data_source: string;
  notes?: string;
  percentage_achieved: number;
  created_at: string;
}

export interface CommunityReply {
  id: number;
  post_id: number;
  author_id: number;
  author_name: string;
  author_avatar?: string;
  author_role: string;
  content: string;
  created_at: string;
}

export interface CommunityPost {
  id: number;
  author_id: number;
  author_name: string;
  author_avatar?: string;
  author_role: string;
  domain: string;
  title: string;
  content: string;
  tags: string[];
  likes_count: number;
  replies: CommunityReply[];
  created_at: string;
}
