import {
  User, EntrepreneurProfile, BusinessAnalysis, RiskAssessment,
  Scheme, SchemeMatch, MentorProfile, MentorshipRequest,
  Conversation, Message, BusinessPlan, RoadmapTask,
  ProgressRecord, LearningResource, SDGImpactRecord,
  CommunityPost
} from './types';

const getApiBase = (): string => {
  if (typeof window !== 'undefined') {
    // If running on Vite dev server (port 5173 or other dev port) or not on backend port 8001,
    // connect directly to FastAPI on port 8001 to bypass Node proxy restrictions
    if (window.location.port && window.location.port !== '8001') {
      const hostname = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
      return `http://${hostname || '127.0.0.1'}:8001/api`;
    }
  }
  return '/api';
};

const API_BASE = getApiBase();

export const getAuthToken = (): string | null => {
  return localStorage.getItem('riseher_token');
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('riseher_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('riseher_token');
};

const getHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || 'API request failed');
  }
  return res.json();
}

export const api = {
  // Auth
  register: (data: any) => fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse<{ access_token: string; user: User }>),

  login: (data: any) => fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse<{ access_token: string; user: User }>),

  sendOTP: (phone_or_email: string, purpose: string = 'registration') => fetch(`${API_BASE}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_or_email, purpose })
  }).then(handleResponse<{ success: boolean; message: string; dev_otp?: string; expires_in_seconds?: number }>),

  verifyOTP: (phone_or_email: string, otp_code: string, purpose: string = 'registration') => fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_or_email, otp_code, purpose })
  }).then(handleResponse<{ success: boolean; message: string }>),

  registerWithOTP: (data: any) => fetch(`${API_BASE}/auth/register-with-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse<{ access_token: string; user: User }>),

  loginWithOTP: (phone_or_email: string, otp_code: string) => fetch(`${API_BASE}/auth/login-with-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_or_email, otp_code })
  }).then(handleResponse<{ access_token: string; user: User }>),

  forgotPasswordRequest: (phone_or_email: string) => fetch(`${API_BASE}/auth/forgot-password-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_or_email })
  }).then(handleResponse<{ success: boolean; message: string; dev_otp?: string }>),

  forgotPasswordReset: (phone_or_email: string, otp_code: string, new_password: string) => fetch(`${API_BASE}/auth/forgot-password-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_or_email, otp_code, new_password })
  }).then(handleResponse<{ success: boolean; message: string }>),

  getMe: () => fetch(`${API_BASE}/auth/me`, {
    headers: getHeaders()
  }).then(handleResponse<User>),

  switchDemo: (email: string) => fetch(`${API_BASE}/auth/switch-demo?email=${encodeURIComponent(email)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }).then(handleResponse<{ access_token: string; user: User }>),

  // Profile
  getProfile: () => fetch(`${API_BASE}/profile/me`, {
    headers: getHeaders()
  }).then(handleResponse<EntrepreneurProfile>),

  saveOnboarding: (data: any) => fetch(`${API_BASE}/profile/onboarding`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(handleResponse<EntrepreneurProfile>),

  updateProfile: (data: any) => fetch(`${API_BASE}/profile/update`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(handleResponse<EntrepreneurProfile>),

  refreshAIInsights: () => fetch(`${API_BASE}/profile/refresh-ai`, {
    method: 'POST',
    headers: getHeaders()
  }).then(handleResponse<{
    success: boolean;
    message: string;
    profile_version: number;
    updated_at: string;
    updated_modules: string[];
  }>),

  // Business Analysis
  getLatestAnalysis: () => fetch(`${API_BASE}/analysis/latest`, {
    headers: getHeaders()
  }).then(handleResponse<BusinessAnalysis>),

  evaluateIdea: (data: any) => fetch(`${API_BASE}/analysis/evaluate`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(handleResponse<BusinessAnalysis>),

  compareIdeas: (data: any) => fetch(`${API_BASE}/analysis/compare`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(handleResponse<any>),

  // Risk Assessment
  getLatestRisk: () => fetch(`${API_BASE}/risk/latest`, {
    headers: getHeaders()
  }).then(handleResponse<RiskAssessment>),

  simulateRisk: (data: any) => fetch(`${API_BASE}/risk/simulate`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(handleResponse<RiskAssessment>),

  // Schemes
  getSchemeMatches: () => fetch(`${API_BASE}/schemes/matches`, {
    headers: getHeaders()
  }).then(handleResponse<SchemeMatch[]>),

  getAllSchemes: () => fetch(`${API_BASE}/schemes/all`, {
    headers: getHeaders()
  }).then(handleResponse<Scheme[]>),

  updateChecklist: (schemeMatchId: number, documentName: string, status: string) => fetch(`${API_BASE}/schemes/checklist/update`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ scheme_match_id: schemeMatchId, document_name: documentName, status })
  }).then(handleResponse<any>),

  updateApplicationStatus: (schemeMatchId: number, status: string, userNotes?: string) => fetch(`${API_BASE}/schemes/application/update`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ scheme_match_id: schemeMatchId, status, user_notes: userNotes })
  }).then(handleResponse<any>),

  // Mentors
  getMentors: (domain?: string) => {
    const url = domain && domain !== 'All' ? `${API_BASE}/mentors/list?domain=${encodeURIComponent(domain)}` : `${API_BASE}/mentors/list`;
    return fetch(url, { headers: getHeaders() }).then(handleResponse<MentorProfile[]>);
  },

  requestMentorship: (data: any) => fetch(`${API_BASE}/mentors/request`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(handleResponse<MentorshipRequest>),

  getMyMentorshipRequests: () => fetch(`${API_BASE}/mentors/my-requests`, {
    headers: getHeaders()
  }).then(handleResponse<MentorshipRequest[]>),

  updateMentorshipStatus: (reqId: number, status: string, meetingLink?: string, responseNote?: string) => fetch(`${API_BASE}/mentors/request/${reqId}/status`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ status, meeting_link: meetingLink, response_note: responseNote })
  }).then(handleResponse<any>),

  submitMentorshipFeedback: (reqId: number, rating: number, feedback: string) => fetch(`${API_BASE}/mentors/request/${reqId}/feedback`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ rating, feedback })
  }).then(handleResponse<any>),

  // Messages
  getConversations: () => fetch(`${API_BASE}/messages/conversations`, {
    headers: getHeaders()
  }).then(handleResponse<Conversation[]>),

  getMessages: (conversationId: number) => fetch(`${API_BASE}/messages/${conversationId}`, {
    headers: getHeaders()
  }).then(handleResponse<Message[]>),

  sendMessage: (recipientId: number, content: string) => fetch(`${API_BASE}/messages/send`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ recipient_id: recipientId, content })
  }).then(handleResponse<Message>),

  // Business Plan
  getLatestBusinessPlan: () => fetch(`${API_BASE}/business-plan/latest`, {
    headers: getHeaders()
  }).then(handleResponse<BusinessPlan>),

  updatePlanSection: (sectionKey: string, content: string) => fetch(`${API_BASE}/business-plan/section/update`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ section_key: sectionKey, content })
  }).then(handleResponse<BusinessPlan>),

  regeneratePlanSection: (sectionKey: string) => fetch(`${API_BASE}/business-plan/section/${encodeURIComponent(sectionKey)}/regenerate`, {
    method: 'POST',
    headers: getHeaders()
  }).then(handleResponse<BusinessPlan>),

  // Roadmap
  getRoadmapTasks: () => fetch(`${API_BASE}/roadmap/tasks`, {
    headers: getHeaders()
  }).then(handleResponse<RoadmapTask[]>),

  toggleRoadmapTask: (taskId: number) => fetch(`${API_BASE}/roadmap/task/${taskId}/toggle`, {
    method: 'POST',
    headers: getHeaders()
  }).then(handleResponse<RoadmapTask>),

  createCustomTask: (data: any) => fetch(`${API_BASE}/roadmap/task/create`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(handleResponse<RoadmapTask>),

  deleteTask: (taskId: number) => fetch(`${API_BASE}/roadmap/task/${taskId}`, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(handleResponse<any>),

  // Progress
  getProgressHistory: () => fetch(`${API_BASE}/progress/history`, {
    headers: getHeaders()
  }).then(handleResponse<ProgressRecord[]>),

  logProgress: (data: any) => fetch(`${API_BASE}/progress/log`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(handleResponse<ProgressRecord>),

  // Learning Resources
  getLearningResources: () => fetch(`${API_BASE}/learning/resources`, {
    headers: getHeaders()
  }).then(handleResponse<LearningResource[]>),

  updateResourceStatus: (resourceId: number, status: string) => fetch(`${API_BASE}/learning/resource/${resourceId}/status?status=${encodeURIComponent(status)}`, {
    method: 'POST',
    headers: getHeaders()
  }).then(handleResponse<any>),

  // SDG Impact
  getSDGMetrics: () => fetch(`${API_BASE}/sdg/metrics`, {
    headers: getHeaders()
  }).then(handleResponse<SDGImpactRecord[]>),

  recordSDGImpact: (data: any) => fetch(`${API_BASE}/sdg/record`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(handleResponse<SDGImpactRecord>),

  // Community
  getCommunityPosts: (domain?: string) => {
    const url = domain && domain !== 'All' ? `${API_BASE}/community/posts?domain=${encodeURIComponent(domain)}` : `${API_BASE}/community/posts`;
    return fetch(url).then(handleResponse<CommunityPost[]>);
  },

  createCommunityPost: (data: any) => fetch(`${API_BASE}/community/post/create`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(handleResponse<CommunityPost>),

  replyCommunityPost: (postId: number, content: string) => fetch(`${API_BASE}/community/post/${postId}/reply`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ post_id: postId, content })
  }).then(handleResponse<CommunityPost>),

  likeCommunityPost: (postId: number) => fetch(`${API_BASE}/community/post/${postId}/like`, {
    method: 'POST',
    headers: getHeaders()
  }).then(handleResponse<any>),

  // Admin
  getAdminStats: () => fetch(`${API_BASE}/admin/stats`, {
    headers: getHeaders()
  }).then(handleResponse<any>),

  verifyMentor: (mentorId: number, status: string) => fetch(`${API_BASE}/admin/mentor/${mentorId}/verify?status=${encodeURIComponent(status)}`, {
    method: 'POST',
    headers: getHeaders()
  }).then(handleResponse<any>)
};
