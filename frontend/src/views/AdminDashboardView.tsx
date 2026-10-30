import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  Landmark,
  Target,
  FileCheck,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { api } from '../api';
import { MentorProfile } from '../types';

export const AdminDashboardView: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [sData, mData] = await Promise.all([
        api.getAdminStats(),
        api.getMentors('All')
      ]);
      setStats(sData);
      setMentors(mData);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (mentorId: number, newStatus: string) => {
    try {
      await api.verifyMentor(mentorId, newStatus);
      setMentors(mentors.map(m => m.id === mentorId ? { ...m, verification_status: newStatus as any } : m));
      // Refresh stats
      const sData = await api.getAdminStats();
      setStats(sData);
    } catch (err) {
      console.error('Failed to verify mentor', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-plum border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-plum">Loading Administrator Governance Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-empowerment-purple text-xs font-semibold">
            <ShieldCheck size={14} />
            <span>Platform Governance & Integrity</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-charcoal">
            Administrator Console
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-light max-w-2xl">
            Audit platform activity, verify mentor credentials, inspect government scheme databases, and track verified SDG indicators.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-success/20 text-center shrink-0">
          <span className="text-[10px] uppercase font-bold text-success block">System Health</span>
          <span className="text-sm font-bold text-charcoal block mt-0.5">All Portals Operational</span>
          <span className="text-[10px] text-charcoal-muted block">Database WAL mode active</span>
        </div>
      </div>

      {/* Platform Statistics Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-white p-5 rounded-3xl border border-plum/10 card-shadow">
            <span className="text-charcoal-muted block">Registered Users</span>
            <span className="text-2xl font-extrabold text-plum font-heading block my-1">
              {stats.total_users}
            </span>
            <span className="text-[10px] text-charcoal-muted">Entrepreneurs & Mentors</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-plum/10 card-shadow">
            <span className="text-charcoal-muted block">Verified Mentors</span>
            <span className="text-2xl font-extrabold text-success font-heading block my-1">
              {stats.verified_mentors} / {stats.total_mentors}
            </span>
            <span className="text-[10px] text-success font-medium">Domain experts</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-plum/10 card-shadow">
            <span className="text-charcoal-muted block">Official Schemes</span>
            <span className="text-2xl font-extrabold text-empowerment-purple font-heading block my-1">
              {stats.total_official_schemes}
            </span>
            <span className="text-[10px] text-charcoal-muted">Central & State Portals</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-plum/10 card-shadow">
            <span className="text-charcoal-muted block">Applications Tracked</span>
            <span className="text-2xl font-extrabold text-coral font-heading block my-1">
              {stats.applications_actively_tracked}
            </span>
            <span className="text-[10px] text-charcoal-muted">Active Pipeline Matches</span>
          </div>
        </div>
      )}

      {/* Mentor Verification Workflow Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-base font-bold font-heading text-charcoal">Mentor Verification & Quality Control</h3>
            <p className="text-xs text-charcoal-muted">Review credentials and toggle verification status for community mentors</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-empowerment-purple">
            Trust & Safety
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-charcoal-muted font-semibold">
                <th className="pb-3">Mentor</th>
                <th className="pb-3">Enterprise & Domain</th>
                <th className="pb-3">Experience</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mentors.map((m) => {
                const isVerified = m.verification_status === 'verified';
                return (
                  <tr key={m.id} className="hover:bg-cream/40">
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={m.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80'}
                          alt={m.name}
                          className="w-8 h-8 rounded-full object-cover border border-plum/20"
                        />
                        <span className="font-bold text-charcoal">{m.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-3">
                      <p className="font-semibold text-charcoal">{m.business_name}</p>
                      <p className="text-[10px] text-charcoal-muted">{m.business_domain}</p>
                    </td>
                    <td className="py-3.5 pr-3">{m.years_experience} Years</td>
                    <td className="py-3.5 pr-3">{m.location}</td>
                    <td className="py-3.5 pr-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isVerified ? 'bg-emerald-50 text-success' : 'bg-orange-50 text-coral-dark'
                      }`}>
                        {m.verification_status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {isVerified ? (
                        <button
                          onClick={() => handleVerify(m.id, 'unverified')}
                          className="px-3 py-1 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerify(m.id, 'verified')}
                          className="px-3 py-1 rounded-xl bg-success hover:bg-success-dark text-white font-semibold shadow-sm"
                        >
                          Approve Mentor
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
