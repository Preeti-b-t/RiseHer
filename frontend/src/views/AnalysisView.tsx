import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  DollarSign,
  Users,
  Target,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  GitCompare,
  Lightbulb,
  Building2,
  Tag,
  Compass,
  Layers,
  ShieldAlert,
  Scale,
  Sprout
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { BusinessAnalysis } from '../types';
import { ExplainableAIModal } from './ExplainableAIModal';

interface AnalysisViewProps {
  onNavigate?: (view: string) => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ onNavigate }) => {
  const { user, profile, switchPersona } = useAuth();
  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Custom Quick Idea Form State
  const [customIdea, setCustomIdea] = useState(profile?.business_idea || '');
  const [customDomain, setCustomDomain] = useState(profile?.business_domain || 'Fashion & Apparel');
  const [customStage, setCustomStage] = useState(profile?.current_stage || 'Idea Stage');
  const [customInvestment, setCustomInvestment] = useState(profile?.expected_investment || 150000);
  const [customModel, setCustomModel] = useState(profile?.business_model || 'Online');

  // Comparison State
  const [showCompare, setShowCompare] = useState(false);
  const [idea1, setIdea1] = useState(profile?.business_idea || 'Online Organic Apparel Boutique');
  const [domain1, setDomain1] = useState(profile?.business_domain || 'Fashion & Apparel');
  const [idea2, setIdea2] = useState('Handcrafted Brass Home Decor & Gifting');
  const [domain2, setDomain2] = useState('Handicrafts & Artisanal');
  const [compareResult, setCompareResult] = useState<any | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  useEffect(() => {
    loadAnalysis();
  }, [profile, user]);

  const loadAnalysis = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await api.getLatestAnalysis();
      setAnalysis(data);
    } catch (err: any) {
      console.warn('No existing analysis found or failed to load:', err);
      // If error or 404, we don't crash, we present the interactive evaluator
      setAnalysis(null);
      if (err?.message && !err.message.includes('404')) {
        setFetchError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateCustomIdea = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customIdea.trim()) return;
    setEvaluating(true);
    try {
      const res = await api.evaluateIdea({
        business_idea: customIdea,
        business_domain: customDomain,
        current_stage: customStage,
        available_investment: Math.round(Number(customInvestment) * 0.35),
        expected_investment: Number(customInvestment),
        business_model: customModel,
        location_type: profile?.location_type || 'Semi-Urban',
        state: profile?.state || 'Karnataka',
        skills: profile?.skills || '["Product Development", "Customer Service", "Basic Digital Marketing"]',
        challenges: profile?.challenges || '["Funding", "Customer acquisition", "Marketing"]'
      });
      setAnalysis(res);
    } catch (err: any) {
      console.error('Failed to evaluate custom idea:', err);
      alert('Could not run evaluation: ' + (err.message || 'Please check backend connection'));
    } finally {
      setEvaluating(false);
    }
  };

  const handleRunComparison = async () => {
    setCompareLoading(true);
    try {
      const res = await api.compareIdeas({
        idea_1: idea1,
        domain_1: domain1,
        idea_2: idea2,
        domain_2: domain2
      });
      setCompareResult(res);
    } catch (err) {
      console.error('Comparison error', err);
    } finally {
      setCompareLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-plum border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-plum">Computing Business Intelligence & Explainability...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
        {/* Empty State Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush text-plum text-xs font-semibold">
              <Sparkles size={14} className="text-coral" />
              <span>AI Business Intelligence Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-charcoal">
              Evaluate Your Business Opportunity
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-light max-w-2xl leading-relaxed">
              RiseHer’s AI Decision-Support Engine evaluates business viability across 10 structured dimensions including market demand, unit economics, regulatory requirements, competitor saturation, and skills compatibility.
            </p>
          </div>

          {/* Role Advisory for Mentors/Admins */}
          {(user?.role === 'mentor' || user?.role === 'admin') && (
            <div className="p-4 rounded-2xl bg-purple-50 border border-empowerment-purple/20 text-xs text-charcoal space-y-2">
              <p className="font-semibold text-empowerment-purple flex items-center gap-1.5">
                <AlertCircle size={15} />
                You are currently signed in as a {user.role === 'mentor' ? 'Verified Mentor' : 'Platform Administrator'}.
              </p>
              <p className="text-charcoal-muted">
                To evaluate an entrepreneur workflow with live pre-computed data, switch to one of the test scenarios below:
              </p>
            </div>
          )}

          {/* If user profile has an existing idea, offer 1-click evaluation */}
          {profile?.business_idea ? (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-cream to-blush/30 border border-plum/20 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted">Your Registered Profile Idea</span>
                  <h3 className="text-base sm:text-lg font-bold text-charcoal">{profile.business_idea}</h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white border border-plum/15 text-plum font-medium">
                      Sector: {profile.business_domain}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white border border-plum/15 text-plum font-medium">
                      Stage: {profile.current_stage}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white border border-plum/15 text-plum font-medium">
                      Model: {profile.business_model}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setCustomIdea(profile.business_idea);
                    setCustomDomain(profile.business_domain);
                    setCustomStage(profile.current_stage);
                    setCustomInvestment(profile.expected_investment);
                    setCustomModel(profile.business_model);
                    handleEvaluateCustomIdea();
                  }}
                  disabled={evaluating}
                  className="px-5 py-2.5 rounded-xl bg-plum hover:bg-plum-light text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {evaluating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Computing 10-Dimension Analysis...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="text-coral" />
                      <span>⚡ Run AI Viability Analysis Now</span>
                    </>
                  )}
                </button>

                {onNavigate && (
                  <button
                    onClick={() => onNavigate('onboarding')}
                    className="px-4 py-2.5 rounded-xl bg-white border border-plum/20 hover:border-plum text-plum text-xs font-semibold transition-all"
                  >
                    Edit Onboarding Profile
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Instant Custom Idea Analyzer Form */
            <form onSubmit={handleEvaluateCustomIdea} className="p-5 rounded-2xl bg-cream/70 border border-plum/15 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-plum font-heading">
                <Lightbulb size={16} className="text-coral" />
                <span>Instant Idea Evaluator (Test Any Business Concept)</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    What is the business idea?
                  </label>
                  <textarea
                    rows={2}
                    value={customIdea}
                    onChange={(e) => setCustomIdea(e.target.value)}
                    placeholder="e.g., Online direct-to-consumer artisanal handloom boutique crafting breathable cotton sarees"
                    className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:border-plum focus:ring-1 focus:ring-plum bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-charcoal-muted mb-1">Domain</label>
                    <select
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:border-plum"
                    >
                      <option value="Fashion & Apparel">Fashion & Apparel</option>
                      <option value="Food & Bakery">Food & Bakery</option>
                      <option value="Agriculture & Agro-Processing">Agriculture & Agro</option>
                      <option value="Handicrafts & Artisanal">Handicrafts & Artisanal</option>
                      <option value="Beauty & Wellness">Beauty & Wellness</option>
                      <option value="Technology & Digital Services">Tech & Digital</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-charcoal-muted mb-1">Current Stage</label>
                    <select
                      value={customStage}
                      onChange={(e) => setCustomStage(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:border-plum"
                    >
                      <option value="Idea Stage">Idea Stage</option>
                      <option value="Validation Stage">Validation Stage</option>
                      <option value="Startup Stage">Startup Stage</option>
                      <option value="Early Business Stage">Early Business Stage</option>
                      <option value="Growth & Expansion Stage">Growth Stage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-charcoal-muted mb-1">Target Budget (₹)</label>
                    <input
                      type="number"
                      value={customInvestment}
                      onChange={(e) => setCustomInvestment(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:border-plum"
                      step={10000}
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={evaluating || !customIdea.trim()}
                    className="px-5 py-2.5 rounded-xl bg-plum hover:bg-plum-light text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    {evaluating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Evaluating Viability & Risks...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-coral" />
                        <span>Run AI Viability Analysis</span>
                      </>
                    )}
                  </button>

                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate('onboarding')}
                      className="px-4 py-2.5 rounded-xl bg-white border border-plum/20 hover:border-plum text-plum text-xs font-semibold transition-all"
                    >
                      Complete Full 4-Step Onboarding Wizard
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* Quick-Switch Demo Scenarios for Evaluators */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
              Or Load One of the 3 Pre-Seeded Hackathon Scenarios
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => switchPersona('priya@riseher.org')}
                className="p-3 rounded-2xl border border-empowerment-purple/30 bg-purple-50/50 hover:bg-purple-50 text-left transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-empowerment-purple">
                  <Sparkles size={14} />
                  <span>Priya Sharma</span>
                </div>
                <p className="text-[11px] text-charcoal font-semibold mt-1">Handloom Sarees Boutique</p>
                <p className="text-[10px] text-charcoal-muted">Idea Stage • ₹1.5L Budget • D2C</p>
              </button>

              <button
                onClick={() => switchPersona('ananya@riseher.org')}
                className="p-3 rounded-2xl border border-coral/30 bg-orange-50/50 hover:bg-orange-50 text-left transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-coral-dark">
                  <Building2 size={14} />
                  <span>Ananya Patel</span>
                </div>
                <p className="text-[11px] text-charcoal font-semibold mt-1">Artisanal Bakery Studio</p>
                <p className="text-[10px] text-charcoal-muted">Early Stage • ₹12L Budget • Studio</p>
              </button>

              <button
                onClick={() => switchPersona('sunita@riseher.org')}
                className="p-3 rounded-2xl border border-success/30 bg-emerald-50/50 hover:bg-emerald-50 text-left transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-success">
                  <Sprout size={14} />
                  <span>Sunita Devi</span>
                </div>
                <p className="text-[11px] text-charcoal font-semibold mt-1">Solar Agro & Cold Press Oil</p>
                <p className="text-[10px] text-charcoal-muted">Validation Stage • ₹5L Budget • Rural</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header with Viability Hero Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush text-plum text-xs font-semibold">
            <Sparkles size={14} className="text-coral" />
            <span>AI Business Intelligence Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-charcoal">
            {analysis.idea_title}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-light max-w-2xl">
            {analysis.idea_description}
          </p>
          <div className="flex flex-wrap gap-2 pt-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-cream border border-plum/10 font-medium text-charcoal">
              Sector: {analysis.domain}
            </span>
            <span className="px-3 py-1 rounded-full bg-cream border border-plum/10 font-medium text-charcoal">
              Stage: {analysis.business_stage}
            </span>
          </div>
        </div>

        {/* Viability Gauge Card */}
        <div className="bg-gradient-to-br from-cream to-blush/40 p-6 rounded-2xl border border-plum/15 text-center min-w-[220px] shrink-0">
          <span className="text-xs uppercase font-bold text-charcoal-muted tracking-wider">
            Viability Score
          </span>
          <div className="text-4xl font-extrabold text-plum font-heading my-1">
            {analysis.overall_viability_score}/100
          </div>
          <p className="text-xs text-success font-medium">Confidence: {analysis.confidence_score}%</p>
          <button
            onClick={() => setShowExplainModal(true)}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-plum hover:bg-plum-dark text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <HelpCircle size={14} />
            <span>Explainable AI Breakdown</span>
          </button>
        </div>
      </div>

      {/* 10 Analytical Dimensions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dimension 1 & 2: Market Demand & Investment Range */}
        <div className="bg-white rounded-3xl p-6 border border-plum/10 card-shadow space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs font-bold text-plum uppercase">1. Market Opportunity</span>
            <span className="text-xs font-bold text-success">{analysis.market_demand_score}/100</span>
          </div>
          <p className="text-xs text-charcoal-light leading-relaxed">
            {analysis.market_demand_summary}
          </p>
          <div className="pt-2 border-t border-gray-100">
            <span className="text-[11px] font-semibold text-charcoal-muted block">Estimated Investment Range:</span>
            <span className="text-base font-bold text-charcoal font-heading">
              ₹{analysis.estimated_investment_min.toLocaleString()} – ₹{analysis.estimated_investment_max.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Dimension 3: Skills Compatibility */}
        <div className="bg-white rounded-3xl p-6 border border-plum/10 card-shadow space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs font-bold text-plum uppercase">2. Skills Compatibility</span>
            <span className="text-xs font-bold text-empowerment-purple">
              {analysis.skills_compatibility.fit_percentage}% Fit
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-success block mb-1">Matched Strengths:</span>
            <div className="flex flex-wrap gap-1">
              {analysis.skills_compatibility.matched_skills.map((s, idx) => (
                <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-success font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
          {analysis.skills_compatibility.missing_critical_skills.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-coral block mb-1">Skills to Acquire:</span>
              <div className="flex flex-wrap gap-1">
                {analysis.skills_compatibility.missing_critical_skills.map((s, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-coral-dark font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dimension 4: Operational & Revenue Feasibility */}
        <div className="bg-white rounded-3xl p-6 border border-plum/10 card-shadow space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs font-bold text-plum uppercase">3. Operational Foundation</span>
            <span className="text-xs font-semibold text-charcoal-muted">Prerequisites</span>
          </div>
          <ul className="space-y-1.5 text-xs text-charcoal-light">
            {analysis.operational_requirements.slice(0, 4).map((req, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-success shrink-0 mt-0.5" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* DYNAMIC MULTI-CHANNEL REVENUE ENGINE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-success text-xs font-semibold uppercase tracking-wider mb-1">
              <DollarSign size={13} />
              <span>Dynamic AI Revenue Architecture</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-charcoal">
              Profile-Driven Revenue Channels
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Calibrated for {analysis.domain} • {profile?.business_model || 'Online'} Model • Stage: {analysis.business_stage}
            </p>
          </div>
          <button
            onClick={loadAnalysis}
            className="px-3.5 py-2 rounded-xl border border-plum/20 hover:bg-blush text-plum text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-all"
          >
            <RefreshCw size={13} />
            <span>Sync Channels</span>
          </button>
        </div>

        {analysis.revenue_channels && analysis.revenue_channels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {analysis.revenue_channels.map((chan, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-plum/15 bg-neutral-bg/40 hover:bg-white hover:border-plum/40 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-plum/10 text-plum">
                      Channel #{idx + 1}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      Active Stream
                    </span>
                  </div>
                  <h4 className="text-base font-bold font-heading text-charcoal mb-2 leading-snug">
                    {chan.name}
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-charcoal block mb-0.5">How it Works:</span>
                      <p className="text-charcoal-muted leading-relaxed">{chan.how_it_works}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-charcoal block mb-0.5">Why it Fits Your Profile:</span>
                      <p className="text-charcoal-light leading-relaxed">{chan.why_it_fits}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-charcoal block mb-0.5">Initial Requirements:</span>
                      <p className="text-charcoal-muted leading-relaxed bg-white/70 p-2 rounded-xl border border-gray-100">
                        {chan.initial_requirements}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-charcoal-muted font-medium">Estimated Setup:</span>
                    <span className="font-bold text-plum">{chan.estimated_setup_cost}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-orange-50/80 border border-orange-100 text-[11px] text-coral-dark flex items-start gap-1.5">
                    <ShieldAlert size={13} className="shrink-0 mt-0.5 text-coral" />
                    <span><strong className="font-semibold">Risk / Limitation:</strong> {chan.limitations_and_risks}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {analysis.revenue_opportunities.map((rev, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-cream border border-plum/10 flex items-start gap-3">
                <CheckCircle2 size={16} className="text-success shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-charcoal text-xs block">{rev}</span>
                  <span className="text-[11px] text-charcoal-muted">Recommended primary monetization stream</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DYNAMIC COMPETITOR LANDSCAPE & DIFFERENTIATION MATRIX */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral/10 text-coral-dark text-xs font-semibold uppercase tracking-wider mb-1">
              <Target size={13} />
              <span>Competitor Intelligence & Positioning</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-charcoal">
              Dynamic Competitor Landscape
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Direct, indirect, local, and online competitor landscape calibrated for your business profile and location.
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-plum/10 text-plum font-semibold self-start sm:self-auto">
            {profile?.city ? `${profile.city} & Regional` : 'Pan-India'} Intelligence
          </span>
        </div>

        {/* 4-Category Competitor Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Direct Competitors',
              data: analysis.competitor_landscape?.direct_competitors,
              badgeBg: 'bg-red-50 text-red-700 border-red-100',
              fallbackExamples: 'Established brand aggregators and specialty boutiques'
            },
            {
              title: 'Indirect Competitors',
              data: analysis.competitor_landscape?.indirect_competitors,
              badgeBg: 'bg-orange-50 text-orange-700 border-orange-100',
              fallbackExamples: 'Multi-category department stores and supermarkets'
            },
            {
              title: 'Local Competitors',
              data: analysis.competitor_landscape?.local_competitors,
              badgeBg: 'bg-amber-50 text-amber-700 border-amber-100',
              fallbackExamples: 'Neighborhood mom-and-pop stores and weekly bazaars'
            },
            {
              title: 'Online Competitors',
              data: analysis.competitor_landscape?.online_competitors,
              badgeBg: 'bg-purple-50 text-purple-700 border-purple-100',
              fallbackExamples: 'D2C social sellers, Amazon, and Meesho merchants'
            }
          ].map((cat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-neutral-bg/50 border border-plum/10 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal font-heading">
                    {cat.title}
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${cat.badgeBg}`}>
                    Threat: {cat.data?.threat_level || 'Moderate'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-[10px] text-charcoal-muted uppercase font-semibold block">Market Players:</span>
                    <p className="font-semibold text-charcoal">
                      {cat.data?.examples?.join(', ') || cat.fallbackExamples}
                    </p>
                  </div>
                  <p className="text-[11px] text-charcoal-muted leading-relaxed">
                    {cat.data?.description || 'Competing for user attention and discretionary spend.'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200/60">
                <span className="text-[10px] uppercase font-bold text-success block mb-0.5">Your Distinct Edge:</span>
                <p className="text-[11px] font-medium text-charcoal leading-snug">
                  {cat.data?.user_advantage || 'Personalized customer care and authentic founder storytelling.'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Comparison & Market Positioning Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
          {/* Strategic Pricing Comparison */}
          <div className="p-5 rounded-2xl bg-cream/70 border border-plum/15 space-y-3">
            <div className="flex items-center gap-2 text-plum font-bold font-heading text-sm border-b border-plum/10 pb-2">
              <Scale size={16} />
              <span>Strategic Pricing Intelligence</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-plum/10">
                <span className="text-[10px] text-charcoal-muted block font-medium">Your Positioning:</span>
                <span className="font-bold text-plum">{analysis.competitor_landscape?.pricing_comparison?.user_positioning || 'Value-Premium Craft'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-plum/10">
                <span className="text-[10px] text-charcoal-muted block font-medium">Market Average:</span>
                <span className="font-bold text-charcoal">{analysis.competitor_landscape?.pricing_comparison?.market_average || '₹750 - ₹1,800'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-plum/10">
                <span className="text-[10px] text-charcoal-muted block font-medium">Premium Benchmark:</span>
                <span className="font-bold text-charcoal">{analysis.competitor_landscape?.pricing_comparison?.premium_benchmark || '₹2,500 - ₹5,000+'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-plum/10">
                <span className="text-[10px] text-charcoal-muted block font-medium">Budget Alternatives:</span>
                <span className="font-bold text-charcoal">{analysis.competitor_landscape?.pricing_comparison?.budget_alternatives || '₹299 - ₹499'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/90 border border-plum/10 text-xs">
              <span className="font-bold text-charcoal block mb-0.5">Strategic Pricing Advice:</span>
              <p className="text-charcoal-muted text-[11px] leading-relaxed">
                {analysis.competitor_landscape?.pricing_comparison?.strategic_pricing_advice ||
                  'Anchor your offering on transparent ethical quality and artisanal value rather than racing to the bottom on price.'}
              </p>
            </div>
          </div>

          {/* Strategic Differentiation Tactics */}
          <div className="p-5 rounded-2xl bg-cream/70 border border-plum/15 space-y-3">
            <div className="flex items-center gap-2 text-plum font-bold font-heading text-sm border-b border-plum/10 pb-2">
              <Compass size={16} />
              <span>Recommended Differentiation Strategies</span>
            </div>

            <ul className="space-y-2 text-xs text-charcoal">
              {(analysis.competitor_landscape?.differentiation_strategies || [
                'Hyper-personalization: Offer bespoke sizing or ingredient customization unavailable from mass retailers.',
                'Local & Community Trust: Build deep neighborhood relationships and transparent sourcing stories.',
                'Direct Founder Interaction: High-touch customer communication on WhatsApp Business.',
                'Sustainable Packaging & Clean Label: Emphasize plastic-free, toxin-free, or eco-conscious materials.'
              ]).map((strat, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-plum/10">
                  <CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-snug">{strat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Target Customer Segments & Overview Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Segments */}
        <div className="bg-white rounded-3xl p-6 border border-plum/15 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold font-heading text-charcoal">Identified Customer Segments</h3>
              <p className="text-xs text-charcoal-muted">Demographic segments with proven willingness to pay</p>
            </div>
            <Users size={18} className="text-plum" />
          </div>

          <div className="space-y-3">
            {analysis.customer_segments.map((seg, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-cream border border-plum/10 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-charcoal">{seg.segment_name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blush text-plum">
                    {seg.priority}
                  </span>
                </div>
                <p className="text-charcoal-muted text-[11px]">{seg.description}</p>
                <p className="text-[11px] font-medium text-empowerment-purple pt-1">
                  Ticket Size: {seg.willingness_to_pay}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor Overview Insights */}
        <div className="bg-white rounded-3xl p-6 border border-plum/15 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold font-heading text-charcoal">Competitive Moat & Defense</h3>
              <p className="text-xs text-charcoal-muted">How to protect your business against incumbents</p>
            </div>
            <Target size={18} className="text-coral" />
          </div>

          <div className="space-y-3">
            {analysis.competitor_insights.map((comp, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-cream border border-plum/10 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-charcoal">{comp.competitor_type}</span>
                  <span className="text-[10px] text-charcoal-muted">{comp.examples}</span>
                </div>
                <div className="pt-1 space-y-1 text-[11px]">
                  <p className="text-success font-medium">
                    <span className="font-bold">Your Advantage:</span> {comp.advantage_for_user}
                  </p>
                  <p className="text-coral-dark font-medium">
                    <span className="font-bold">Risk Factor:</span> {comp.risk_factor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths, Weaknesses & Missing Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 card-shadow space-y-3">
          <span className="text-xs font-bold text-success uppercase flex items-center gap-1.5">
            <CheckCircle2 size={16} />
            <span>Validated Strengths</span>
          </span>
          <ul className="space-y-2 text-xs text-charcoal-light">
            {analysis.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-white rounded-3xl p-6 border border-orange-100 card-shadow space-y-3">
          <span className="text-xs font-bold text-coral uppercase flex items-center gap-1.5">
            <AlertCircle size={16} />
            <span>Identified Weaknesses</span>
          </span>
          <ul className="space-y-2 text-xs text-charcoal-light">
            {analysis.weaknesses.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-coral mt-1.5 shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Missing Information To Validate */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 card-shadow space-y-3">
          <span className="text-xs font-bold text-empowerment-purple uppercase flex items-center gap-1.5">
            <HelpCircle size={16} />
            <span>Missing Validation Data</span>
          </span>
          <p className="text-[11px] text-charcoal-muted">Items you must personally test before launching:</p>
          <ul className="space-y-2 text-xs text-charcoal-light">
            {analysis.missing_information.map((m, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-empowerment-purple mt-1.5 shrink-0" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* INTERACTIVE IDEA COMPARISON TOOL */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blush text-plum">
              <GitCompare size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-charcoal">Compare Alternative Business Ideas</h3>
              <p className="text-xs text-charcoal-muted">Test 2 different business concepts side-by-side using the same capital & location constraints</p>
            </div>
          </div>
          <button
            onClick={() => setShowCompare(!showCompare)}
            className="px-3.5 py-1.5 rounded-xl border border-plum/20 text-xs font-semibold text-plum hover:bg-blush"
          >
            {showCompare ? 'Collapse' : 'Open Comparator'}
          </button>
        </div>

        {showCompare && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Idea 1 Input */}
              <div className="p-4 rounded-2xl bg-cream border border-plum/10 space-y-2">
                <span className="text-xs font-bold text-plum">Idea A (Current)</span>
                <input
                  type="text"
                  value={idea1}
                  onChange={(e) => setIdea1(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                />
                <select
                  value={domain1}
                  onChange={(e) => setDomain1(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="Fashion & Apparel">Fashion & Apparel</option>
                  <option value="Food & Bakery">Food & Bakery</option>
                  <option value="Agriculture & Agro-Processing">Agriculture & Agro-Processing</option>
                  <option value="Handicrafts & Artisanal">Handicrafts & Artisanal</option>
                  <option value="Beauty & Wellness">Beauty & Wellness</option>
                </select>
              </div>

              {/* Idea 2 Input */}
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-empowerment-purple/20 space-y-2">
                <span className="text-xs font-bold text-empowerment-purple">Idea B (Alternative)</span>
                <input
                  type="text"
                  value={idea2}
                  onChange={(e) => setIdea2(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                />
                <select
                  value={domain2}
                  onChange={(e) => setDomain2(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="Handicrafts & Artisanal">Handicrafts & Artisanal</option>
                  <option value="Fashion & Apparel">Fashion & Apparel</option>
                  <option value="Food & Bakery">Food & Bakery</option>
                  <option value="Agriculture & Agro-Processing">Agriculture & Agro-Processing</option>
                  <option value="Beauty & Wellness">Beauty & Wellness</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleRunComparison}
              disabled={compareLoading}
              className="px-6 py-2.5 rounded-xl bg-plum hover:bg-plum-dark text-white text-xs font-bold flex items-center gap-2 shadow-md"
            >
              <GitCompare size={14} />
              <span>{compareLoading ? 'Comparing...' : 'Run Side-by-Side Comparison'}</span>
            </button>

            {compareResult && (
              <div className="p-4 rounded-2xl bg-cream border border-plum/15 space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-white border border-gray-100 space-y-2">
                    <p className="font-bold text-plum">{compareResult.idea_1.title}</p>
                    <div className="text-2xl font-extrabold text-plum font-heading">
                      {compareResult.idea_1.viability_score}/100
                    </div>
                    <p className="text-[11px] text-charcoal-muted">Min Startup: ₹{compareResult.idea_1.capital_required_min.toLocaleString()}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-gray-100 space-y-2">
                    <p className="font-bold text-empowerment-purple">{compareResult.idea_2.title}</p>
                    <div className="text-2xl font-extrabold text-empowerment-purple font-heading">
                      {compareResult.idea_2.viability_score}/100
                    </div>
                    <p className="text-[11px] text-charcoal-muted">Min Startup: ₹{compareResult.idea_2.capital_required_min.toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-plum/10 text-xs text-charcoal-light flex items-start gap-2">
                  <Lightbulb size={16} className="text-coral shrink-0 mt-0.5" />
                  <p>{compareResult.ai_recommendation}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Explainable AI Modal */}
      <ExplainableAIModal
        analysis={analysis}
        isOpen={showExplainModal}
        onClose={() => setShowExplainModal(false)}
      />
    </div>
  );
};
