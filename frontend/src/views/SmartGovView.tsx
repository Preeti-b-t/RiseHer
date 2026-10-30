import React, { useState, useEffect } from 'react';
import {
  Landmark,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Filter,
  Search,
  Check,
  Sparkles
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { SchemeMatch } from '../types';

export const SmartGovView: React.FC = () => {
  const { profile } = useAuth();
  const [matches, setMatches] = useState<SchemeMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<SchemeMatch | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [updatingDoc, setUpdatingDoc] = useState<string | null>(null);

  const trackerStages = [
    { id: 'shortlisted', label: 'Shortlisted' },
    { id: 'eligibility_reviewed', label: 'Eligibility Reviewed' },
    { id: 'requirements_pending', label: 'Requirements Pending' },
    { id: 'documents_prepared', label: 'Documents Prepared' },
    { id: 'submitted', label: 'Submitted (Self-Reported)' },
    { id: 'under_review', label: 'Under Review' },
    { id: 'approved', label: 'Approved' }
  ];

  useEffect(() => {
    loadSchemes();
  }, [profile]);

  const loadSchemes = async () => {
    setLoading(true);
    try {
      const data = await api.getSchemeMatches();
      setMatches(data);
      if (data.length > 0 && !selectedMatch) {
        setSelectedMatch(data[0]);
      }
    } catch (err) {
      console.error('Failed to load schemes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDoc = async (schemeMatchId: number, docName: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'available' ? 'pending' : 'available';
    setUpdatingDoc(docName);
    try {
      await api.updateChecklist(schemeMatchId, docName, nextStatus);
      // Update local state
      setMatches(matches.map(m => {
        if (m.id === schemeMatchId) {
          const updatedState = { ...m.document_checklist_state, [docName]: nextStatus as any };
          return { ...m, document_checklist_state: updatedState };
        }
        return m;
      }));
      if (selectedMatch?.id === schemeMatchId) {
        setSelectedMatch({
          ...selectedMatch,
          document_checklist_state: {
            ...selectedMatch.document_checklist_state,
            [docName]: nextStatus as any
          }
        });
      }
    } catch (err) {
      console.error('Failed to update doc', err);
    } finally {
      setUpdatingDoc(null);
    }
  };

  const handleUpdateApplicationStatus = async (schemeMatchId: number, newStatus: string) => {
    try {
      await api.updateApplicationStatus(schemeMatchId, newStatus);
      setMatches(matches.map(m => m.id === schemeMatchId ? { ...m, application_status: newStatus as any } : m));
      if (selectedMatch?.id === schemeMatchId) {
        setSelectedMatch({ ...selectedMatch, application_status: newStatus as any });
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const filteredMatches = matches.filter(m => {
    const matchFilter = filterType === 'All' || m.scheme.scheme_type.includes(filterType);
    const matchSearch = m.scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (m.scheme.short_code && m.scheme.short_code.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchFilter && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-plum border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-plum">Matching 7+ Government Schemes with SchemeFit Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-success text-xs font-semibold">
            <Landmark size={14} />
            <span>SmartGov Official Scheme Discovery</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-charcoal">
            Government Support & Subsidy Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-light max-w-2xl">
            Ranked by our 100-Point SchemeFit algorithm: Eligibility (30%), Sector Relevance (20%), Benefit (15%), Availability (15%), Readiness (10%), and Location (10%).
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-cream border border-plum/15 text-center shrink-0">
          <span className="text-xs uppercase font-bold text-charcoal-muted tracking-wider block">
            Official Data Source
          </span>
          <span className="text-xs font-bold text-plum font-heading block mt-0.5">
            Verified Portals Only
          </span>
          <span className="text-[10px] text-charcoal-muted block mt-1">
            No intermediaries • Direct portal links
          </span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-plum/10 card-shadow">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-plum shrink-0" />
          <div className="flex flex-wrap gap-1 text-xs">
            {['All', 'Central Government', 'State Government', 'NITI Aayog'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  filterType === t
                    ? 'bg-plum text-white shadow-sm'
                    : 'bg-gray-100 text-charcoal-muted hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search schemes (PMEGP, MUDRA...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-plum"
          />
        </div>
      </div>

      {/* Main Two-Column Layout: Scheme List vs Selected Scheme Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Filtered Scheme Cards */}
        <div className="lg:col-span-5 space-y-3">
          {filteredMatches.map((m) => {
            const isSelected = selectedMatch?.id === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedMatch(m)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer card-shadow ${
                  isSelected
                    ? 'bg-white border-plum ring-2 ring-plum/20 shadow-lg'
                    : 'bg-white/80 border-gray-200 hover:border-plum/40 hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-charcoal font-heading">
                        {m.scheme.short_code || m.scheme.name}
                      </span>
                      <span className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                        m.scheme.application_status === 'Open' || m.scheme.application_status === 'Rolling'
                          ? 'bg-emerald-50 text-success'
                          : 'bg-gray-100 text-charcoal-muted'
                      }`}>
                        {m.scheme.application_status}
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal-muted line-clamp-1">{m.scheme.name}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-extrabold text-success font-heading">
                      {Math.round(m.scheme_fit_score)}%
                    </span>
                    <span className="text-[9px] text-charcoal-muted block">SchemeFit</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-charcoal-muted">
                    {m.scheme.financial_assistance_type}
                  </span>
                  <span className="font-bold text-plum">
                    {m.scheme.max_amount_inr > 0 ? `Up to ₹${(m.scheme.max_amount_inr / 100000).toFixed(1)}L` : 'Free MSME Status'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column (7 cols): Selected Scheme Details, Checklist & Application Tracker */}
        {selectedMatch && (
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow space-y-6">
            {/* Header info */}
            <div className="space-y-2 border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
                  {selectedMatch.scheme.scheme_type} • {selectedMatch.scheme.ministry_or_dept}
                </span>
                <span className="text-xs font-bold text-success flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>SchemeFit: {Math.round(selectedMatch.scheme_fit_score)}/100</span>
                </span>
              </div>
              <h3 className="text-xl font-bold font-heading text-charcoal">
                {selectedMatch.scheme.name}
              </h3>
              <p className="text-xs text-charcoal-light leading-relaxed">
                {selectedMatch.scheme.benefits_description}
              </p>
            </div>

            {/* SchemeFit Score Breakdown (6 Weights) */}
            <div className="p-4 rounded-2xl bg-cream border border-plum/10 space-y-2">
              <span className="text-xs font-bold text-plum block">Why This Matches Your Profile:</span>
              <p className="text-xs text-charcoal-light">{selectedMatch.why_matched}</p>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 text-center text-[10px]">
                <div className="p-2 rounded-xl bg-white border border-gray-100">
                  <span className="text-charcoal-muted block">Eligibility</span>
                  <span className="font-bold text-success text-xs">{selectedMatch.eligibility_score}/30</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-gray-100">
                  <span className="text-charcoal-muted block">Sector</span>
                  <span className="font-bold text-plum text-xs">{selectedMatch.sector_relevance_score}/20</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-gray-100">
                  <span className="text-charcoal-muted block">Financial</span>
                  <span className="font-bold text-charcoal text-xs">{selectedMatch.financial_suitability_score}/15</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-gray-100">
                  <span className="text-charcoal-muted block">Availability</span>
                  <span className="font-bold text-empowerment-purple text-xs">{selectedMatch.availability_score}/15</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-gray-100">
                  <span className="text-charcoal-muted block">Readiness</span>
                  <span className="font-bold text-charcoal text-xs">{selectedMatch.readiness_score}/10</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-gray-100">
                  <span className="text-charcoal-muted block">Location</span>
                  <span className="font-bold text-charcoal text-xs">{selectedMatch.location_stage_score}/10</span>
                </div>
              </div>
            </div>

            {/* Requirements Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold font-heading text-charcoal flex items-center gap-2">
                  <FileCheck size={16} className="text-plum" />
                  <span>Document Readiness Checklist</span>
                </h4>
                <span className="text-xs text-charcoal-muted">Click to toggle status</span>
              </div>

              <div className="space-y-2">
                {selectedMatch.scheme.required_documents.map((doc, idx) => {
                  const status = selectedMatch.document_checklist_state?.[doc] || 'pending';
                  const isAvailable = status === 'available';
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleDoc(selectedMatch.id, doc, status)}
                      className={`p-3 rounded-2xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        isAvailable
                          ? 'bg-emerald-50/60 border-emerald-200 text-charcoal'
                          : 'bg-white border-gray-200 text-charcoal hover:border-plum/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                          isAvailable ? 'bg-success border-success text-white' : 'border-gray-300'
                        }`}>
                          {isAvailable && <Check size={12} />}
                        </div>
                        <span className="font-medium">{doc}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAvailable ? 'bg-emerald-100 text-success' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {isAvailable ? 'Ready / Available' : 'Pending Preparation'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Application Tracker */}
            <div className="space-y-3 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold font-heading text-charcoal">Application Pipeline Tracker</h4>
                <span className="text-xs font-semibold text-empowerment-purple capitalize">
                  Current: {selectedMatch.application_status.replace('_', ' ')}
                </span>
              </div>

              {/* Status Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {trackerStages.slice(0, 4).map((st) => {
                  const isActive = selectedMatch.application_status === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => handleUpdateApplicationStatus(selectedMatch.id, st.id)}
                      className={`p-2 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                        isActive
                          ? 'bg-plum text-white border-plum shadow-sm'
                          : 'bg-gray-50 hover:bg-gray-100 text-charcoal-muted border-gray-200'
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {trackerStages.slice(4).map((st) => {
                  const isActive = selectedMatch.application_status === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => handleUpdateApplicationStatus(selectedMatch.id, st.id)}
                      className={`p-2 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                        isActive
                          ? 'bg-empowerment-purple text-white border-empowerment-purple shadow-sm'
                          : 'bg-gray-50 hover:bg-gray-100 text-charcoal-muted border-gray-200'
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Official Portal Direct Action Link */}
            <div className="p-4 rounded-2xl bg-blush/40 border border-plum/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-plum">Official Government Portal Application</p>
                <p className="text-[10px] text-charcoal-muted">
                  Direct submission link verified on {selectedMatch.scheme.last_verified_date}.
                </p>
              </div>

              <a
                href={selectedMatch.scheme.application_portal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-plum hover:bg-plum-dark text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all shrink-0"
              >
                <span>Visit Official Portal</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
