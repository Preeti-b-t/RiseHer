import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Lightbulb,
  ArrowRight,
  Sparkles,
  BarChart2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { ProgressRecord } from '../types';

export const ProgressTrackerView: React.FC = () => {
  const { profile } = useAuth();
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // New Progress Entry Form State
  const [showLogModal, setShowLogModal] = useState(false);
  const [periodLabel, setPeriodLabel] = useState('Month 1');
  const [plannedBudget, setPlannedBudget] = useState(25000);
  const [actualExpenditure, setActualExpenditure] = useState(28000);
  const [salesRevenue, setSalesRevenue] = useState(8500);
  const [customersAcquired, setCustomersAcquired] = useState(7);
  const [milestonesAchieved, setMilestonesAchieved] = useState('Sample production batch completed, 7 orders fulfilled');
  const [challengesFaced, setChallengesFaced] = useState('Packaging supplier delayed shipment by 4 days');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProgress();
  }, [profile]);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const data = await api.getProgressHistory();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load progress', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await api.logProgress({
        period_label: periodLabel,
        planned_budget: Number(plannedBudget),
        actual_expenditure: Number(actualExpenditure),
        sales_revenue: Number(salesRevenue),
        customers_acquired: Number(customersAcquired),
        milestones_achieved: milestonesAchieved.split(',').map(s => s.trim()).filter(Boolean),
        challenges_faced: challengesFaced
      });
      setRecords([...records, created]);
      setShowLogModal(false);
    } catch (err) {
      console.error('Failed to log progress', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-plum border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-plum">Loading Actual Business Financial Records...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = records.map(r => ({
    period: r.period_label,
    planned: r.planned_budget,
    actual: r.actual_expenditure,
    revenue: r.sales_revenue,
    customers: r.customers_acquired
  }));

  const totalSpent = records.reduce((acc, curr) => acc + curr.actual_expenditure, 0);
  const totalRevenue = records.reduce((acc, curr) => acc + curr.sales_revenue, 0);
  const totalCustomers = records.reduce((acc, curr) => acc + curr.customers_acquired, 0);

  const latestRecord = records[records.length - 1];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush text-plum text-xs font-semibold">
            <TrendingUp size={14} className="text-coral" />
            <span>Actual Execution & Variance Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-charcoal">
            Business Progress Tracker
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-light max-w-xl">
            Input genuine expenditure and revenue metrics. RiseHer compares reality against your business plan to generate real corrective feedback.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-5 py-3 rounded-2xl bg-plum hover:bg-plum-dark text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all hover:scale-105 shrink-0"
        >
          <Plus size={16} />
          <span>Log Progress Entry</span>
        </button>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-plum/10 card-shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-charcoal-muted uppercase">Cumulative Expenditure</span>
            <div className="text-2xl font-extrabold text-charcoal font-heading">
              ₹{totalSpent.toLocaleString()}
            </div>
            <span className="text-[10px] text-charcoal-muted">Across logged periods</span>
          </div>
          <div className="p-3 rounded-2xl bg-orange-50 text-coral">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-plum/10 card-shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-charcoal-muted uppercase">Cumulative Revenue</span>
            <div className="text-2xl font-extrabold text-success font-heading">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <span className="text-[10px] text-success font-medium">Recorded sales inflows</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-success">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-plum/10 card-shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-charcoal-muted uppercase">Paying Customers</span>
            <div className="text-2xl font-extrabold text-empowerment-purple font-heading">
              {totalCustomers}
            </div>
            <span className="text-[10px] text-empowerment-purple font-medium">Acquired to date</span>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-empowerment-purple">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* RECHARTS: Planned vs Actual Spending & Revenue Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Planned vs Actual Expenditure Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-plum/15 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold font-heading text-charcoal">Planned Budget vs Actual Spending</h3>
              <p className="text-xs text-charcoal-muted">Compare capital expenditure discipline over tracking periods</p>
            </div>
            <BarChart2 size={18} className="text-plum" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e9f2" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #54245F20', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="planned" name="Planned Budget" fill="#7542A6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="actual" name="Actual Spent" fill="#E88979" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Growth Over Time (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-plum/15 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold font-heading text-charcoal">Revenue & Client Acquisition</h3>
              <p className="text-xs text-charcoal-muted">Sales receipts recorded across periods</p>
            </div>
            <TrendingUp size={18} className="text-success" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e9f2" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #54245F20', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#269B72" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI VARIANCE RECOMMENDATIONS & CORRECTIVE ACTIONS */}
      {latestRecord && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <div className="p-1.5 rounded-xl bg-blush text-plum">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-charcoal">AI Variance Diagnosis on Latest Period</h3>
              <p className="text-xs text-charcoal-muted">Targeted recommendations based on actual numbers vs plan</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-cream border border-plum/10 text-xs text-charcoal-light leading-relaxed">
            <p className="font-semibold text-charcoal mb-1">Performance Evaluation:</p>
            <p>{latestRecord.ai_variance_feedback || 'Performance tracks within normal initial testing tolerances.'}</p>
          </div>

          {latestRecord.ai_corrective_actions?.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-plum block">Recommended Corrective Actions:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {latestRecord.ai_corrective_actions.map((act, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-blush/40 border border-plum/10 text-xs flex items-start gap-2">
                    <Lightbulb size={15} className="text-coral shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Log Progress Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-plum/20 shadow-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold font-heading text-charcoal">Log Actual Progress Entry</h3>
            <p className="text-xs text-charcoal-muted">Record what really happened to unlock AI variance insights</p>

            <form onSubmit={handleLogSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Period Label</label>
                <input
                  type="text"
                  value={periodLabel}
                  onChange={(e) => setPeriodLabel(e.target.value)}
                  placeholder="e.g. Month 1, Week 3"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Planned Budget (₹)</label>
                  <input
                    type="number"
                    value={plannedBudget}
                    onChange={(e) => setPlannedBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Actual Expenditure (₹)</label>
                  <input
                    type="number"
                    value={actualExpenditure}
                    onChange={(e) => setActualExpenditure(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Sales Revenue (₹)</label>
                  <input
                    type="number"
                    value={salesRevenue}
                    onChange={(e) => setSalesRevenue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Paying Customers</label>
                  <input
                    type="number"
                    value={customersAcquired}
                    onChange={(e) => setCustomersAcquired(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Key Milestones Achieved (Comma-separated)</label>
                <input
                  type="text"
                  value={milestonesAchieved}
                  onChange={(e) => setMilestonesAchieved(e.target.value)}
                  placeholder="e.g. Samples ready, 5 orders delivered"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Challenges Faced</label>
                <textarea
                  value={challengesFaced}
                  onChange={(e) => setChallengesFaced(e.target.value)}
                  rows={2}
                  placeholder="e.g. Delayed supplier responses, courier fee issues"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-charcoal-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-plum hover:bg-plum-dark text-white font-bold"
                >
                  {saving ? 'Analyzing...' : 'Log & Run Diagnosis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
