import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Sliders,
  DollarSign,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Info,
  Sparkles,
  Building2,
  Sprout
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { RiskAssessment } from '../types';

interface RiskAssessmentViewProps {
  onNavigate?: (view: string) => void;
}

export const RiskAssessmentView: React.FC<RiskAssessmentViewProps> = ({ onNavigate }) => {
  const { user, profile, switchPersona } = useAuth();
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  // Simulation Sliders State
  const [investment, setInvestment] = useState<number>(50000);
  const [salesUnits, setSalesUnits] = useState<number>(50);
  const [pricePerUnit, setPricePerUnit] = useState<number>(950);
  const [monthlyCosts, setMonthlyCosts] = useState<number>(22000);
  const [businessModel, setBusinessModel] = useState<string>('Online');
  const [locationType, setLocationType] = useState<string>('Semi-Urban');

  useEffect(() => {
    loadRiskData();
  }, [profile, user]);

  const loadRiskData = async () => {
    setLoading(true);
    try {
      const data = await api.getLatestRisk();
      setRisk(data);
      if (data.simulation_inputs) {
        setInvestment(data.simulation_inputs.available_investment || 50000);
        setSalesUnits(data.simulation_inputs.expected_sales_units_monthly || 50);
        setPricePerUnit(data.simulation_inputs.average_price_per_unit || 950);
        setMonthlyCosts(data.simulation_inputs.estimated_monthly_operating_cost || 22000);
        setBusinessModel(data.simulation_inputs.business_model || 'Online');
        setLocationType(data.simulation_inputs.location_type || 'Semi-Urban');
      }
    } catch (err) {
      console.warn('No risk record found or failed to load:', err);
      setRisk(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setPreviousScore(risk?.overall_risk_score ?? 50);
    setSimulating(true);
    try {
      const updated = await api.simulateRisk({
        available_investment: Number(investment),
        expected_sales_units_monthly: Number(salesUnits),
        average_price_per_unit: Number(pricePerUnit),
        estimated_monthly_operating_cost: Number(monthlyCosts),
        business_model: businessModel,
        location_type: locationType
      });
      setRisk(updated);
    } catch (err) {
      console.error('Simulation error', err);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-plum border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-plum">Evaluating Financial & Market Risk Models...</p>
        </div>
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush text-plum text-xs font-semibold">
              <ShieldAlert size={14} className="text-coral" />
              <span>AI Business Risk Diagnostic Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-charcoal">
              Interactive Risk Assessment & Simulation
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-light max-w-2xl leading-relaxed">
              Assess 5 risk dimensions: Financial, Market Demand, Operational, Competition, and Regulatory Risk. Test capital buffers and pricing with continuous real-time what-if simulation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-cream/70 border border-plum/15 space-y-4">
            <p className="text-xs font-semibold text-charcoal">
              Run initial risk evaluation for your venture:
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleRecalculate}
                disabled={simulating}
                className="px-5 py-2.5 rounded-xl bg-plum hover:bg-plum-light text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {simulating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Evaluating Risk Factors...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-coral" />
                    <span>⚡ Run Initial Risk Diagnostic</span>
                  </>
                )}
              </button>

              {onNavigate && (
                <button
                  onClick={() => onNavigate('onboarding')}
                  className="px-4 py-2.5 rounded-xl bg-white border border-plum/20 hover:border-plum text-plum text-xs font-semibold transition-all"
                >
                  Configure Profile via Onboarding Wizard
                </button>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
              Or Inspect Pre-Seeded Scenarios
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
                <p className="text-[10px] text-charcoal-muted">Idea Stage • Moderate Risk (50.5)</p>
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
                <p className="text-[10px] text-charcoal-muted">Early Stage • Low Risk (33.5)</p>
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
                <p className="text-[10px] text-charcoal-muted">Validation Stage • Moderate Risk (43.0)</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categories = [
    { name: 'Financial Risk', key: 'financial_risk', data: risk.financial_risk, weight: '30%' },
    { name: 'Market Demand Risk', key: 'market_demand_risk', data: risk.market_demand_risk, weight: '25%' },
    { name: 'Operational Risk', key: 'operational_risk', data: risk.operational_risk, weight: '15%' },
    { name: 'Competition Risk', key: 'competition_risk', data: risk.competition_risk, weight: '15%' },
    { name: 'Regulatory & Compliance', key: 'regulatory_risk', data: risk.regulatory_risk, weight: '15%' },
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-success bg-emerald-50 border-emerald-200';
      case 'Moderate': return 'text-coral-dark bg-orange-50 border-orange-200';
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const projectedRevenue = salesUnits * pricePerUnit;
  const netMonthly = projectedRevenue - monthlyCosts;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush text-plum text-xs font-semibold">
            <ShieldAlert size={14} className="text-coral" />
            <span>Interactive Risk Diagnostic Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-charcoal">
            Business Risk Assessment
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-light max-w-2xl">
            Higher scores represent higher vulnerability. Adjust your financial levers below to run real-time stress testing.
          </p>
        </div>

        {/* Overall Score Badge */}
        <div className="p-6 rounded-2xl bg-cream border border-plum/15 text-center min-w-[220px] shrink-0">
          <span className="text-xs uppercase font-bold text-charcoal-muted tracking-wider">
            Overall Risk Level
          </span>
          <div className="text-3xl font-extrabold text-charcoal font-heading my-1 flex items-center justify-center gap-2">
            <span>{risk.overall_risk_score}/100</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getRiskColor(risk.overall_risk_level)}`}>
              {risk.overall_risk_level}
            </span>
          </div>

          {previousScore !== null && (
            <div className="text-xs font-semibold mt-2 flex items-center justify-center gap-1">
              {risk.overall_risk_score < previousScore ? (
                <span className="text-success flex items-center gap-0.5">
                  <TrendingDown size={14} /> Risk dropped by {Math.round(previousScore - risk.overall_risk_score)} pts
                </span>
              ) : risk.overall_risk_score > previousScore ? (
                <span className="text-coral flex items-center gap-0.5">
                  <TrendingUp size={14} /> Risk rose by {Math.round(risk.overall_risk_score - previousScore)} pts
                </span>
              ) : (
                <span className="text-charcoal-muted">No change in score</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* INTERACTIVE WHAT-IF SLIDERS PANEL */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-50 text-coral">
              <Sliders size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-charcoal">What-If Risk Recalculator</h3>
              <p className="text-xs text-charcoal-muted">Adjust capital, pricing, monthly volume, and costs to see before-and-after score changes</p>
            </div>
          </div>
          <button
            onClick={handleRecalculate}
            disabled={simulating}
            className="px-5 py-2.5 rounded-xl bg-plum hover:bg-plum-dark text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
          >
            <RefreshCw size={14} className={simulating ? 'animate-spin' : ''} />
            <span>{simulating ? 'Recalculating...' : 'Recalculate Assessment'}</span>
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Slider 1: Available Capital */}
          <div className="space-y-2 p-4 rounded-2xl bg-cream border border-plum/10">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-charcoal">Liquid Capital</span>
              <span className="font-bold text-plum">₹{investment.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="500000"
              step="5000"
              value={investment}
              onChange={(e) => setInvestment(Number(e.target.value))}
              className="w-full accent-plum cursor-pointer"
            />
            <span className="text-[10px] text-charcoal-muted block">Direct runway impact</span>
          </div>

          {/* Slider 2: Average Ticket Price */}
          <div className="space-y-2 p-4 rounded-2xl bg-cream border border-plum/10">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-charcoal">Average Product Price</span>
              <span className="font-bold text-plum">₹{pricePerUnit.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="200"
              max="6000"
              step="50"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(Number(e.target.value))}
              className="w-full accent-plum cursor-pointer"
            />
            <span className="text-[10px] text-charcoal-muted block">Purchasing barrier vs volume</span>
          </div>

          {/* Slider 3: Expected Monthly Sales */}
          <div className="space-y-2 p-4 rounded-2xl bg-cream border border-plum/10">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-charcoal">Monthly Sales Units</span>
              <span className="font-bold text-plum">{salesUnits} orders</span>
            </div>
            <input
              type="range"
              min="10"
              max="400"
              step="5"
              value={salesUnits}
              onChange={(e) => setSalesUnits(Number(e.target.value))}
              className="w-full accent-plum cursor-pointer"
            />
            <span className="text-[10px] text-charcoal-muted block">Funnel acquisition feasibility</span>
          </div>

          {/* Slider 4: Monthly Operating Costs */}
          <div className="space-y-2 p-4 rounded-2xl bg-cream border border-plum/10">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-charcoal">Monthly Operating Burn</span>
              <span className="font-bold text-plum">₹{monthlyCosts.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="150000"
              step="2000"
              value={monthlyCosts}
              onChange={(e) => setMonthlyCosts(Number(e.target.value))}
              className="w-full accent-plum cursor-pointer"
            />
            <span className="text-[10px] text-charcoal-muted block">Fixed overhead + utilities</span>
          </div>
        </div>

        {/* Real-time Math Summary */}
        <div className="p-4 rounded-2xl bg-blush/40 border border-plum/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-charcoal-muted block">Projected Monthly Revenue:</span>
            <span className="text-base font-bold text-charcoal font-heading">
              ₹{projectedRevenue.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-charcoal-muted block">Projected Net Monthly Margin:</span>
            <span className={`text-base font-bold font-heading ${netMonthly >= 0 ? 'text-success' : 'text-coral'}`}>
              ₹{netMonthly.toLocaleString()} {netMonthly >= 0 ? '(Positive Cash Flow)' : '(Operating Deficit)'}
            </span>
          </div>
          <div>
            <span className="text-charcoal-muted block">Cash Runway:</span>
            <span className="text-base font-bold text-charcoal font-heading">
              {netMonthly >= 0 ? 'Infinite (Profitable)' : `${(investment / Math.max(Math.abs(netMonthly), 1)).toFixed(1)} Months`}
            </span>
          </div>
        </div>
      </div>

      {/* 5 CATEGORY CARDS */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-heading text-charcoal">Category-Wise Risk Breakdown</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const levelClass = getRiskColor(cat.data.level);
            return (
              <div
                key={cat.key}
                className="bg-white rounded-3xl p-6 border border-plum/10 card-shadow flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                    <div>
                      <h4 className="text-sm font-bold font-heading text-charcoal">{cat.name}</h4>
                      <span className="text-[10px] text-charcoal-muted">Weight: {cat.weight}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-charcoal font-heading">{cat.data.score}/100</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ml-2 ${levelClass}`}>
                        {cat.data.level}
                      </span>
                    </div>
                  </div>

                  {/* Factors */}
                  <div className="space-y-2 mb-4">
                    <span className="text-[11px] font-semibold text-charcoal-muted block">Contributing Factors:</span>
                    {cat.data.factors.map((f, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-cream border border-plum/5 text-xs">
                        <p className="font-semibold text-charcoal">{f.factor}</p>
                        <p className="text-[11px] text-charcoal-muted mt-0.5">{f.impact}</p>
                      </div>
                    ))}
                  </div>

                  {/* Mitigations */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-success block">Suggested Actionable Mitigations:</span>
                    <ul className="space-y-1.5 text-xs text-charcoal-light">
                      {cat.data.mitigations.map((m, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 size={13} className="text-success shrink-0 mt-0.5" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
