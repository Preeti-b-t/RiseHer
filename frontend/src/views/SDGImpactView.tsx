import React, { useState, useEffect } from 'react';
import {
  Target,
  Globe,
  Award,
  TrendingUp,
  CheckCircle2,
  Plus,
  ShieldCheck,
  FileCheck,
  Leaf
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { SDGImpactRecord } from '../types';

export const SDGImpactView: React.FC = () => {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<SDGImpactRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  // New Impact Log State
  const [sdgGoal, setSdgGoal] = useState('SDG 5');
  const [goalTitle, setGoalTitle] = useState('Gender Equality');
  const [indicatorName, setIndicatorName] = useState('Female Livelihoods Directly Created');
  const [actualValue, setActualValue] = useState(3);
  const [targetValue, setTargetValue] = useState(6);
  const [unit, setUnit] = useState('jobs');
  const [reportingPeriod, setReportingPeriod] = useState('Q4 2026');
  const [dataSource, setDataSource] = useState('Self-reported payroll records');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, [profile]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.getSDGMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load SDG metrics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateImpact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await api.recordSDGImpact({
        sdg_goal: sdgGoal,
        goal_title: goalTitle,
        indicator_name: indicatorName,
        actual_value: Number(actualValue),
        target_value: Number(targetValue),
        unit,
        reporting_period: reportingPeriod,
        data_source: dataSource
      });
      setMetrics([...metrics, created]);
      setShowLogModal(false);
    } catch (err) {
      console.error('Failed to record SDG metric', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-plum border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-plum">Computing SDG Impact Measurements...</p>
        </div>
      </div>
    );
  }

  const sdgBadgeColors: Record<string, string> = {
    'SDG 5': 'bg-red-500 text-white',
    'SDG 8': 'bg-amber-700 text-white',
    'SDG 9': 'bg-orange-600 text-white',
    'SDG 10': 'bg-pink-600 text-white',
    'SDG 12': 'bg-amber-600 text-white'
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-success text-xs font-semibold">
            <Globe size={14} />
            <span>UN Sustainable Development Goals (SDG) Alignment</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-charcoal">
            SDG Impact Measurement
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-light max-w-2xl">
            RiseHer measures tangible economic, social, and environmental outcomes. We do not claim SDG achievement merely because a profile was created.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-5 py-3 rounded-2xl bg-plum hover:bg-plum-dark text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all hover:scale-105 shrink-0"
        >
          <Plus size={16} />
          <span>Record Verified Metric</span>
        </button>
      </div>

      {/* Target SDGs Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((m) => {
          const badgeClass = sdgBadgeColors[m.sdg_goal] || 'bg-plum text-white';
          const pct = Math.round(m.percentage_achieved);
          return (
            <div
              key={m.id}
              className="bg-white rounded-3xl p-6 border border-plum/10 card-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${badgeClass}`}>
                    {m.sdg_goal}
                  </span>
                  <span className="text-[10px] text-charcoal-muted">{m.reporting_period}</span>
                </div>

                <h3 className="text-base font-bold font-heading text-charcoal">
                  {m.goal_title}
                </h3>
                <p className="text-xs font-semibold text-plum mt-1">
                  {m.indicator_name}
                </p>

                {/* Progress bar */}
                <div className="my-4 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-charcoal">
                      Actual: {m.actual_value.toLocaleString()} {m.unit}
                    </span>
                    <span className="font-semibold text-charcoal-muted">
                      Target: {m.target_value.toLocaleString()} {m.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-success h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-success block text-right pt-0.5">
                    {pct}% Achieved
                  </span>
                </div>
              </div>

              {/* Data Source Footer */}
              <div className="pt-3 border-t border-gray-100 text-[10px] text-charcoal-muted flex items-center justify-between">
                <span>Verification Source:</span>
                <span className="font-medium text-charcoal truncate max-w-[160px]">{m.data_source}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Record Impact Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl border border-plum/20 shadow-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold font-heading text-charcoal">Record Verified SDG Metric</h3>

            <form onSubmit={handleCreateImpact} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Select SDG Goal</label>
                <select
                  value={sdgGoal}
                  onChange={(e) => {
                    setSdgGoal(e.target.value);
                    const map: Record<string, string> = {
                      'SDG 5': 'Gender Equality',
                      'SDG 8': 'Decent Work & Economic Growth',
                      'SDG 9': 'Industry, Innovation & Infrastructure',
                      'SDG 10': 'Reduced Inequalities',
                      'SDG 12': 'Responsible Consumption & Production'
                    };
                    setGoalTitle(map[e.target.value] || 'Sustainable Development');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                >
                  <option value="SDG 5">SDG 5: Gender Equality</option>
                  <option value="SDG 8">SDG 8: Decent Work & Economic Growth</option>
                  <option value="SDG 9">SDG 9: Industry & Innovation</option>
                  <option value="SDG 10">SDG 10: Reduced Inequalities</option>
                  <option value="SDG 12">SDG 12: Responsible Consumption</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Indicator Name</label>
                <input
                  type="text"
                  value={indicatorName}
                  onChange={(e) => setIndicatorName(e.target.value)}
                  placeholder="e.g. Women artisans employed"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Actual Value</label>
                  <input
                    type="number"
                    value={actualValue}
                    onChange={(e) => setActualValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Target Value</label>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Unit of Measurement</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. jobs, INR, percent"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Reporting Period</label>
                  <input
                    type="text"
                    value={reportingPeriod}
                    onChange={(e) => setReportingPeriod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Verification Data Source</label>
                <input
                  type="text"
                  value={dataSource}
                  onChange={(e) => setDataSource(e.target.value)}
                  placeholder="e.g. Bank statement, GST invoice, payroll records"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  required
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
                  {saving ? 'Recording...' : 'Record Metric'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
