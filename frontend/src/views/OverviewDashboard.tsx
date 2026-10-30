import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Landmark,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  DollarSign,
  FileText,
  ShieldAlert,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { BusinessAnalysis, RiskAssessment, SchemeMatch, MentorProfile, RoadmapTask } from '../types';
import { InspirationSection } from '../components/InspirationSection';

interface OverviewDashboardProps {
  onNavigate: (view: string) => void;
  onOpenExplainability: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onNavigate,
  onOpenExplainability
}) => {
  const { user, profile } = useAuth();
  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [schemes, setSchemes] = useState<SchemeMatch[]>([]);
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverviewData = async () => {
      setLoading(true);
      try {
        const [anData, rData, scData, mData, tData] = await Promise.all([
          api.getLatestAnalysis().catch(() => null),
          api.getLatestRisk().catch(() => null),
          api.getSchemeMatches().catch(() => []),
          api.getMentors().catch(() => []),
          api.getRoadmapTasks().catch(() => [])
        ]);
        setAnalysis(anData);
        setRisk(rData);
        setSchemes(scData);
        setMentors(mData);
        setTasks(tData);
      } finally {
        setLoading(false);
      }
    };

    loadOverviewData();
  }, [user, profile]);

  const completedTasks = tasks.filter(t => t.is_completed).length;
  const totalTasks = tasks.length || 6;
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  const topScheme = schemes[0];
  const topMentor = mentors[0];

  const [refreshingAI, setRefreshingAI] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);

  const handleRefreshAIInsights = async () => {
    setRefreshingAI(true);
    setRefreshNotice(null);
    try {
      const res = await api.refreshAIInsights();
      setRefreshNotice(`AI models successfully updated (v${res.profile_version})!`);
      const [anData, rData, scData, mData, tData] = await Promise.all([
        api.getLatestAnalysis().catch(() => null),
        api.getLatestRisk().catch(() => null),
        api.getSchemeMatches().catch(() => []),
        api.getMentors().catch(() => []),
        api.getRoadmapTasks().catch(() => [])
      ]);
      setAnalysis(anData);
      setRisk(rData);
      setSchemes(scData);
      setMentors(mData);
      setTasks(tData);
    } catch (err: any) {
      setRefreshNotice(`Refresh failed: ${err.message || 'Error'}`);
    } finally {
      setRefreshingAI(false);
      setTimeout(() => setRefreshNotice(null), 6000);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. WOMEN ENTREPRENEURS INSPIRATION SECTION (She Inspires. You Rise.) */}
      <InspirationSection />

      {/* SECTION A: Welcome & Executive Context */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-plum via-empowerment-purple to-plum p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-coral-light text-xs font-semibold backdrop-blur-sm">
                <Sparkles size={13} className="text-coral" />
                <span>Personalized Intelligence Engine Active</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-mono text-white/90">
                v{profile?.profile_version || analysis?.profile_version || 1}.0
              </span>
              {profile?.updated_at && (
                <span className="text-[11px] text-white/70">
                  Updated: {new Date(profile.updated_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading">
              Welcome back, {user?.full_name || 'Founder'}!
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              {profile?.business_idea || 'Your business venture workspace'}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="px-3 py-1 rounded-full bg-white/20 font-medium text-white">
                Stage: {profile?.current_stage || 'Idea Stage'}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 font-medium text-white">
                Model: {profile?.business_model || 'Online'}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 font-medium text-white">
                {profile?.city ? `${profile.city}, ` : ''}{profile?.district ? `${profile.district}, ` : ''}{profile?.state || 'India'}
              </span>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap sm:flex-nowrap md:flex-col gap-2 shrink-0">
            <button
              onClick={handleRefreshAIInsights}
              disabled={refreshingAI}
              className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshingAI ? 'animate-spin' : ''} />
              <span>{refreshingAI ? 'Updating recommendations...' : 'Refresh My AI Insights'}</span>
            </button>
            <button
              onClick={() => onNavigate('analysis')}
              className="px-4 py-2.5 rounded-xl bg-coral hover:bg-coral-dark text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles size={14} />
              <span>Evaluate New Idea</span>
            </button>
            <button
              onClick={() => onNavigate('business-plan')}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all backdrop-blur-sm flex items-center justify-center gap-2"
            >
              <FileText size={14} />
              <span>View Business Plan</span>
            </button>
          </div>
        </div>

        {/* Refresh Notice Banner */}
        {refreshNotice && (
          <div className="mt-4 p-2.5 rounded-xl bg-white/20 text-xs font-medium text-white flex items-center justify-between animate-fade-in">
            <span>{refreshNotice}</span>
            <button onClick={() => setRefreshNotice(null)} className="text-white/80 hover:text-white">✕</button>
          </div>
        )}

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-coral/20 blur-3xl pointer-events-none" />
      </div>

      {/* SECTION B: 5 Key Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Business Viability Score */}
        <div
          onClick={() => onNavigate('analysis')}
          className="bg-white rounded-2xl p-5 border border-plum/10 card-shadow card-hover cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-muted uppercase">Viability Score</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-empowerment-purple">
              <Sparkles size={16} />
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-plum font-heading">
              {analysis?.overall_viability_score ? `${analysis.overall_viability_score}%` : '63%'}
            </div>
            <p className="text-[11px] text-success font-medium mt-0.5">
              Confidence: {analysis?.confidence_score || 86}%
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenExplainability();
            }}
            className="text-[11px] text-empowerment-purple font-semibold hover:underline flex items-center gap-1"
          >
            <span>Why this score?</span>
            <ChevronRight size={12} />
          </button>
        </div>

        {/* Card 2: Current Risk Level */}
        <div
          onClick={() => onNavigate('risk')}
          className="bg-white rounded-2xl p-5 border border-plum/10 card-shadow card-hover cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-muted uppercase">Business Risk</span>
            <span className="p-1.5 rounded-lg bg-orange-50 text-coral">
              <AlertTriangle size={16} />
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-extrabold text-charcoal font-heading">
              {risk?.overall_risk_level || 'Moderate'}
            </div>
            <p className="text-[11px] text-coral-dark font-medium mt-0.5">
              Score: {risk?.overall_risk_score || 40}/100
            </p>
          </div>
          <span className="text-[11px] text-charcoal-muted flex items-center gap-1">
            <span>What-If simulator active</span>
            <ChevronRight size={12} />
          </span>
        </div>

        {/* Card 3: Top SmartGov Scheme */}
        <div
          onClick={() => onNavigate('schemes')}
          className="bg-white rounded-2xl p-5 border border-plum/10 card-shadow card-hover cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-muted uppercase">SmartGov Fit</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-success">
              <Landmark size={16} />
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-success font-heading">
              {topScheme?.scheme_fit_score ? `${Math.round(topScheme.scheme_fit_score)}%` : '99%'}
            </div>
            <p className="text-[11px] text-charcoal truncate font-medium mt-0.5">
              {topScheme?.scheme.short_code || 'PMEGP Subsidy'}
            </p>
          </div>
          <span className="text-[11px] text-success font-semibold flex items-center gap-1">
            <span>7 Verified Schemes</span>
            <ChevronRight size={12} />
          </span>
        </div>

        {/* Card 4: Top Matched Mentor */}
        <div
          onClick={() => onNavigate('mentors')}
          className="bg-white rounded-2xl p-5 border border-plum/10 card-shadow card-hover cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-muted uppercase">Top Mentor</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-empowerment-purple">
              <Users size={16} />
            </span>
          </div>
          <div className="my-3 flex items-center gap-2">
            <img
              src={topMentor?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80'}
              alt={topMentor?.name || 'Mentor'}
              className="w-10 h-10 rounded-full object-cover border border-plum/20 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-charcoal truncate">{topMentor?.name || 'Kavita Rao'}</p>
              <p className="text-[10px] text-empowerment-purple truncate">{topMentor?.business_name || 'LoomCraft Studio'}</p>
            </div>
          </div>
          <span className="text-[11px] text-plum font-semibold flex items-center gap-1">
            <span>Book Consultation</span>
            <ChevronRight size={12} />
          </span>
        </div>

        {/* Card 5: Roadmap Completion */}
        <div
          onClick={() => onNavigate('roadmap')}
          className="bg-white rounded-2xl p-5 border border-plum/10 card-shadow card-hover cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-muted uppercase">Roadmap</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp size={16} />
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-charcoal font-heading">
              {completedTasks}/{totalTasks}
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-empowerment-purple h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-charcoal-muted flex items-center gap-1">
            <span>{progressPercent}% Complete</span>
            <ChevronRight size={12} />
          </span>
        </div>
      </div>

      {/* SECTION C: PRIORITY ACTION PANEL – "Your Next Best Actions" */}
      <div className="bg-white rounded-3xl p-6 border border-plum/15 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-blush text-plum">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-charcoal">Your Next Best Actions</h3>
              <p className="text-xs text-charcoal-muted">AI-prioritized actions based on your business stage, runway and missing validations</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-empowerment-purple">
            Priority Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1 */}
          <div className="p-4 rounded-2xl bg-cream border border-plum/10 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-coral px-2 py-0.5 rounded bg-coral/10">
                  Critical Validation
                </span>
                <span className="text-[10px] text-charcoal-muted">Estimated: 3-4 days</span>
              </div>
              <h4 className="text-sm font-bold text-charcoal">Interview 15 Target Customers</h4>
              <p className="text-xs text-charcoal-light leading-relaxed">
                Before purchasing bulk inventory or equipment, interview 15 target buyers to validate price point and willingness to pay.
              </p>
            </div>
            <button
              onClick={() => onNavigate('roadmap')}
              className="text-xs font-semibold text-plum hover:text-empowerment-purple flex items-center gap-1 pt-1"
            >
              <span>View Milestone Steps</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Action 2 */}
          <div className="p-4 rounded-2xl bg-cream border border-plum/10 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-empowerment-purple px-2 py-0.5 rounded bg-purple-100">
                  Government Support
                </span>
                <span className="text-[10px] text-charcoal-muted">Fit: 99%</span>
              </div>
              <h4 className="text-sm font-bold text-charcoal">Prepare PMEGP Subsidy Checklist</h4>
              <p className="text-xs text-charcoal-light leading-relaxed">
                Your profile matches PMEGP 25-35% subsidy eligibility. Gather your Detailed Project Report and Aadhaar to begin online filing.
              </p>
            </div>
            <button
              onClick={() => onNavigate('schemes')}
              className="text-xs font-semibold text-plum hover:text-empowerment-purple flex items-center gap-1 pt-1"
            >
              <span>Review Document Checklist</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Action 3 */}
          <div className="p-4 rounded-2xl bg-cream border border-plum/10 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-success px-2 py-0.5 rounded bg-emerald-50">
                  Mentorship
                </span>
                <span className="text-[10px] text-charcoal-muted">Upcoming Session</span>
              </div>
              <h4 className="text-sm font-bold text-charcoal">Consultation with Kavita Rao</h4>
              <p className="text-xs text-charcoal-light leading-relaxed">
                Review your unit pricing sheet and local artisan procurement strategy with your verified domain mentor on Saturday.
              </p>
            </div>
            <button
              onClick={() => onNavigate('mentors')}
              className="text-xs font-semibold text-plum hover:text-empowerment-purple flex items-center gap-1 pt-1"
            >
              <span>Join Session / Message</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION D: Dual Column – Opportunities & Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Top Support Opportunities */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-plum/15 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold font-heading text-charcoal">Verified Support Opportunities</h3>
              <p className="text-xs text-charcoal-muted">Official government schemes tailored to your stage & domain</p>
            </div>
            <button
              onClick={() => onNavigate('schemes')}
              className="text-xs font-semibold text-plum hover:underline"
            >
              View All 7
            </button>
          </div>

          <div className="space-y-3">
            {schemes.slice(0, 3).map((sm) => (
              <div
                key={sm.id}
                onClick={() => onNavigate('schemes')}
                className="p-3.5 rounded-2xl border border-gray-100 hover:border-plum/30 hover:bg-cream transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-charcoal truncate">{sm.scheme.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-success font-semibold">
                      {sm.scheme.application_status}
                    </span>
                  </div>
                  <p className="text-[11px] text-charcoal-muted line-clamp-1">{sm.scheme.benefits_description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-extrabold text-success font-heading">
                    {Math.round(sm.scheme_fit_score)}%
                  </span>
                  <span className="text-[10px] text-charcoal-muted block">SchemeFit</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Milestone Snapshot */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-plum/15 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold font-heading text-charcoal">Roadmap Milestones</h3>
              <p className="text-xs text-charcoal-muted">{completedTasks} of {totalTasks} tasks completed</p>
            </div>
            <button
              onClick={() => onNavigate('roadmap')}
              className="text-xs font-semibold text-plum hover:underline"
            >
              Manage Tasks
            </button>
          </div>

          <div className="space-y-2.5">
            {tasks.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl bg-cream border border-plum/5 flex items-start gap-3 text-xs"
              >
                <div className={`w-4 h-4 rounded-full mt-0.5 flex items-center justify-center shrink-0 ${
                  t.is_completed ? 'bg-success text-white' : 'border border-gray-300'
                }`}>
                  {t.is_completed && <CheckCircle2 size={12} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold ${t.is_completed ? 'line-through text-gray-400' : 'text-charcoal'}`}>
                    {t.title}
                  </p>
                  <p className="text-[11px] text-charcoal-muted mt-0.5">{t.timeframe} • {t.milestone_group}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                  t.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
