import React from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, HelpCircle, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { BusinessAnalysis, ExplainabilityFactor } from '../types';

interface ExplainableAIModalProps {
  analysis: BusinessAnalysis | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExplainableAIModal: React.FC<ExplainableAIModalProps> = ({
  analysis,
  isOpen,
  onClose
}) => {
  if (!isOpen || !analysis) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl border border-plum/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-plum to-empowerment-purple p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20">
              <Sparkles size={20} className="text-coral" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading">Explainable AI: Viability & Methodology</h2>
              <p className="text-xs text-white/80">Transparent breakdown of rules, evidence, weights, and confidence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-charcoal">
          {/* Section 1: Methodology & Confidence */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-cream border border-plum/10 text-center">
              <span className="text-xs text-charcoal-muted uppercase font-bold">Overall Viability</span>
              <div className="text-3xl font-extrabold text-plum font-heading mt-1">
                {analysis.overall_viability_score}/100
              </div>
              <p className="text-[10px] text-charcoal-muted mt-1">Weighted composite model</p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-empowerment-purple/20 text-center">
              <span className="text-xs text-empowerment-purple uppercase font-bold">Model Confidence</span>
              <div className="text-3xl font-extrabold text-empowerment-purple font-heading mt-1">
                {analysis.confidence_score}%
              </div>
              <p className="text-[10px] text-charcoal-muted mt-1">Based on provided profile data</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-success/20 text-center">
              <span className="text-xs text-success uppercase font-bold">Scoring Rule Engine</span>
              <div className="text-sm font-bold text-success font-heading mt-2">
                MSME Heuristic v2.4
              </div>
              <p className="text-[10px] text-charcoal-muted mt-1">Deterministic & Reproducible</p>
            </div>
          </div>

          {/* Section 2: Factor-wise Contribution Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-heading text-plum flex items-center gap-2">
              <span>Factor-wise Contribution Weights</span>
              <span className="text-xs font-normal text-charcoal-muted">(Influences Viability Score)</span>
            </h3>

            <div className="space-y-2.5">
              {analysis.explainability_factors.map((f, idx) => {
                const isPos = f.influence_direction === 'Positive';
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs flex items-start justify-between gap-4 ${
                      isPos ? 'bg-emerald-50/50 border-emerald-200' : 'bg-orange-50/50 border-orange-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-charcoal">{f.factor_name}</span>
                        <span className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                          isPos ? 'bg-success text-white' : 'bg-coral text-white'
                        }`}>
                          {f.influence_direction}
                        </span>
                        <span className="text-[10px] text-charcoal-muted bg-white px-2 py-0.5 rounded border border-gray-200">
                          {f.evidence_type}
                        </span>
                      </div>
                      <p className="text-charcoal-light leading-relaxed">{f.rationale}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-sm font-bold font-heading flex items-center gap-0.5 ${
                        isPos ? 'text-success' : 'text-coral'
                      }`}>
                        {isPos ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {f.impact_weight > 0 ? `+${f.impact_weight}` : f.impact_weight}
                      </span>
                      <span className="text-[10px] text-charcoal-muted">{f.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Evidence Categorization */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-heading text-plum">Data Rigor & Evidence Classification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Verified Information */}
              <div className="p-3.5 rounded-2xl bg-cream border border-plum/10 space-y-2">
                <span className="font-bold text-success flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>Verified Information</span>
                </span>
                <ul className="space-y-1 text-charcoal-muted text-[11px] list-disc list-inside">
                  {analysis.evidence_breakdown?.verified_information?.map((item, i) => (
                    <li key={i}>{item}</li>
                  )) || <li>User capital and verified MSME criteria</li>}
                </ul>
              </div>

              {/* Market Estimates */}
              <div className="p-3.5 rounded-2xl bg-cream border border-plum/10 space-y-2">
                <span className="font-bold text-empowerment-purple flex items-center gap-1.5">
                  <Info size={14} />
                  <span>Market Estimates & Benchmarks</span>
                </span>
                <ul className="space-y-1 text-charcoal-muted text-[11px] list-disc list-inside">
                  {analysis.evidence_breakdown?.market_estimates?.map((item, i) => (
                    <li key={i}>{item}</li>
                  )) || <li>Industry average gross margins for sector</li>}
                </ul>
              </div>

              {/* AI Hypotheses */}
              <div className="p-3.5 rounded-2xl bg-cream border border-plum/10 space-y-2">
                <span className="font-bold text-coral flex items-center gap-1.5">
                  <Sparkles size={14} />
                  <span>AI Hypotheses (To Validate)</span>
                </span>
                <ul className="space-y-1 text-charcoal-muted text-[11px] list-disc list-inside">
                  {analysis.evidence_breakdown?.ai_hypotheses?.map((item, i) => (
                    <li key={i}>{item}</li>
                  )) || <li>Assumed repeat order rates and conversion timelines</li>}
                </ul>
              </div>

              {/* Missing Validation Data */}
              <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-200 space-y-2">
                <span className="font-bold text-red-600 flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>Missing Information Gaps</span>
                </span>
                <ul className="space-y-1 text-charcoal-muted text-[11px] list-disc list-inside">
                  {analysis.missing_information?.map((item, i) => (
                    <li key={i}>{item}</li>
                  )) || <li>Willingness-to-pay validation from customer interviews</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-plum hover:bg-plum-dark text-white text-xs font-semibold transition-colors"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
