import React, { useState, useEffect } from 'react';
import {
  FileText,
  Edit3,
  RefreshCw,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  Check,
  Building2,
  Sprout
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { BusinessPlan, BusinessPlanSection } from '../types';

interface BusinessPlanViewProps {
  onNavigate?: (view: string) => void;
}

export const BusinessPlanView: React.FC<BusinessPlanViewProps> = ({ onNavigate }) => {
  const { user, profile, switchPersona } = useAuth();
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null);

  useEffect(() => {
    loadBusinessPlan();
  }, [profile, user]);

  const loadBusinessPlan = async () => {
    setLoading(true);
    try {
      const data = await api.getLatestBusinessPlan();
      setPlan(data);
    } catch (err) {
      console.error('Failed to load plan', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (sec: BusinessPlanSection) => {
    setEditingKey(sec.key);
    setEditContent(sec.content);
  };

  const handleSaveEdit = async (secKey: string) => {
    setSavingKey(secKey);
    try {
      const updated = await api.updatePlanSection(secKey, editContent);
      setPlan(updated);
      setEditingKey(null);
    } catch (err) {
      console.error('Failed to save section', err);
    } finally {
      setSavingKey(null);
    }
  };

  const handleRegenerate = async (secKey: string) => {
    setRegeneratingKey(secKey);
    try {
      const updated = await api.regeneratePlanSection(secKey);
      setPlan(updated);
    } catch (err) {
      console.error('Regeneration error', err);
    } finally {
      setRegeneratingKey(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-plum border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-plum">Synthesizing 19-Section Adaptive Business Plan...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush text-plum text-xs font-semibold">
              <FileText size={14} className="text-coral" />
              <span>Adaptive Business Plan Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-charcoal">
              19-Section Stage-Adaptive Business Plan
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-light max-w-2xl leading-relaxed">
              Generate a bank-ready, DPR-aligned 19-section business plan covering executive summaries, financial projections, operational requirements, unit economics, and regulatory compliance.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-cream/70 border border-plum/15 space-y-4">
            <p className="text-xs font-semibold text-charcoal">
              Generate a comprehensive plan customized to your venture:
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {onNavigate && (
                <button
                  onClick={() => onNavigate('onboarding')}
                  className="px-5 py-2.5 rounded-xl bg-plum hover:bg-plum-light text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
                >
                  <Sparkles size={14} className="text-coral" />
                  <span>Start Onboarding to Generate Plan</span>
                </button>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
              Or Explore Pre-Generated Business Plans
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
                <p className="text-[11px] text-charcoal font-semibold mt-1">Handloom Sarees Boutique Plan</p>
                <p className="text-[10px] text-charcoal-muted">Idea Stage • 19 Sections • D2C Ready</p>
              </button>

              <button
                onClick={() => switchPersona('ananya@riseher.org')}
                className="p-3 rounded-2xl border border-coral/30 bg-orange-50/50 hover:bg-orange-50 text-left transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-coral-dark">
                  <Building2 size={14} />
                  <span>Ananya Patel</span>
                </div>
                <p className="text-[11px] text-charcoal font-semibold mt-1">Artisanal Bakery Studio Plan</p>
                <p className="text-[10px] text-charcoal-muted">Early Stage • Commercial Scale-up</p>
              </button>

              <button
                onClick={() => switchPersona('sunita@riseher.org')}
                className="p-3 rounded-2xl border border-success/30 bg-emerald-50/50 hover:bg-emerald-50 text-left transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-success">
                  <Sprout size={14} />
                  <span>Sunita Devi</span>
                </div>
                <p className="text-[11px] text-charcoal font-semibold mt-1">Solar Agro & Cold Press Oil Plan</p>
                <p className="text-[10px] text-charcoal-muted">Validation Stage • FPO / Collective</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto print:p-0 print:max-w-none">
      {/* Action Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush text-plum text-xs font-semibold">
            <FileText size={14} className="text-coral" />
            <span>Stage-Adaptive Business Plan Generator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-charcoal">
            {plan.title}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-light">
            Stage: <span className="font-semibold text-plum">{plan.stage}</span> • Tailored 19-Section Bank & Incubator Ready Plan
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl border border-plum/20 hover:bg-blush text-plum text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Printer size={15} />
            <span>Export / Print PDF</span>
          </button>
        </div>
      </div>

      {/* Financial Estimates Banner */}
      <div className="bg-cream rounded-3xl p-6 border border-plum/10 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-plum/10 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-plum">
            Financial Projections & Estimates (Labelled Assumptions)
          </span>
          <span className="text-[10px] text-charcoal-muted">Estimated benchmarks</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-white rounded-2xl border border-plum/5">
            <span className="text-charcoal-muted block">Startup Investment</span>
            <span className="text-lg font-bold text-plum font-heading">
              ₹{Number(plan.financial_estimates?.startup_investment_needed || 150000).toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-plum/5">
            <span className="text-charcoal-muted block">Founder Capital</span>
            <span className="text-lg font-bold text-success font-heading">
              ₹{Number(plan.financial_estimates?.founder_equity_contribution || 50000).toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-plum/5">
            <span className="text-charcoal-muted block">Target Year 1 Revenue</span>
            <span className="text-lg font-bold text-charcoal font-heading">
              ₹{Number(plan.financial_estimates?.projected_year1_revenue || 980000).toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-plum/5">
            <span className="text-charcoal-muted block">Break-Even Horizon</span>
            <span className="text-lg font-bold text-empowerment-purple font-heading">
              Month {plan.financial_estimates?.estimated_breakeven_months || 5}
            </span>
          </div>
        </div>

        {/* Assumptions List */}
        <div className="pt-2">
          <span className="text-[11px] font-semibold text-charcoal-muted block mb-1">Explicit Model Assumptions:</span>
          <ul className="space-y-1 text-[11px] text-charcoal-light list-disc list-inside">
            {plan.explicit_assumptions?.map((asm, i) => (
              <li key={i}>{asm}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 19 Sections Accordion / Cards List */}
      <div className="space-y-4">
        {plan.sections.map((sec, idx) => {
          const isEditing = editingKey === sec.key;
          const isRegenerating = regeneratingKey === sec.key;

          return (
            <div
              key={sec.key}
              className="bg-white rounded-3xl p-6 border border-plum/10 card-shadow space-y-3 transition-all"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold font-heading text-charcoal">
                    {sec.title}
                  </h3>
                  {sec.is_edited && (
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-blush text-plum font-semibold">
                      User Edited
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={() => handleStartEdit(sec)}
                        className="p-1.5 rounded-lg text-charcoal-muted hover:text-plum hover:bg-blush transition-colors text-xs flex items-center gap-1"
                        title="Edit this section"
                      >
                        <Edit3 size={14} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleRegenerate(sec.key)}
                        disabled={isRegenerating}
                        className="p-1.5 rounded-lg text-charcoal-muted hover:text-empowerment-purple hover:bg-purple-50 transition-colors text-xs flex items-center gap-1 disabled:opacity-50"
                        title="Regenerate this section with AI"
                      >
                        <RefreshCw size={14} className={isRegenerating ? 'animate-spin' : ''} />
                        <span className="hidden sm:inline">{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingKey(null)}
                        className="px-3 py-1 rounded-lg text-xs text-charcoal-muted hover:text-charcoal"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(sec.key)}
                        disabled={savingKey === sec.key}
                        className="px-3 py-1 rounded-lg bg-plum text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                      >
                        <Save size={13} />
                        <span>Save</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={5}
                  className="w-full p-3 rounded-2xl border border-plum/30 text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-plum/20"
                />
              ) : (
                <div className="text-xs sm:text-sm text-charcoal-light leading-relaxed whitespace-pre-line">
                  {sec.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
