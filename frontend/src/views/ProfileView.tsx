import React, { useState } from 'react';
import {
  User,
  Edit3,
  MapPin,
  Sparkles,
  DollarSign,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  Save,
  Check,
  Building2,
  Compass,
  RefreshCw,
  Layers,
  Globe2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi NCR', 'Jammu & Kashmir', 'Ladakh', 'Puducherry'
];

const OPERATING_AREAS = [
  'Neighborhood / Hyperlocal',
  'Local & City-wide',
  'Regional / Multi-District',
  'State-wide',
  'Pan-India',
  'Global / Export'
];

export const ProfileView: React.FC = () => {
  const { user, profile, setProfileState } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshingAI, setRefreshingAI] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields - Personal Location
  const [country, setCountry] = useState(profile?.country || 'India');
  const [state, setState] = useState(profile?.state || 'Karnataka');
  const [district, setDistrict] = useState(profile?.district || 'Bengaluru Urban');
  const [city, setCity] = useState(profile?.city || 'Bengaluru');
  const [pincode, setPincode] = useState(profile?.pincode || '');
  const [locationType, setLocationType] = useState(profile?.location_type || 'Urban');

  // Form Fields - Business Location & Logistics
  const [sameAsPersonal, setSameAsPersonal] = useState(false);
  const [businessLocation, setBusinessLocation] = useState(profile?.business_location || '');
  const [businessOperatingArea, setBusinessOperatingArea] = useState(profile?.business_operating_area || 'Local & City-wide');
  const [preferredMentorshipLocation, setPreferredMentorshipLocation] = useState(profile?.preferred_mentorship_location || '');
  const [preferredMentorshipMode, setPreferredMentorshipMode] = useState(profile?.preferred_mentorship_mode || 'Hybrid');

  // Venture Parameters
  const [businessIdea, setBusinessIdea] = useState(profile?.business_idea || '');
  const [businessDomain, setBusinessDomain] = useState(profile?.business_domain || 'Fashion & Apparel');
  const [availableInvestment, setAvailableInvestment] = useState(profile?.available_investment || 50000);
  const [expectedInvestment, setExpectedInvestment] = useState(profile?.expected_investment || 150000);
  const [currentStage, setCurrentStage] = useState(profile?.current_stage || 'Idea Stage');
  const [businessModel, setBusinessModel] = useState(profile?.business_model || 'Online');
  const [workExperience, setWorkExperience] = useState(profile?.work_experience || '');

  // Handle "Same as personal location" toggle
  const handleToggleSameAsPersonal = (checked: boolean) => {
    setSameAsPersonal(checked);
    if (checked) {
      const locStr = [city, district, state].filter(Boolean).join(', ');
      setBusinessLocation(locStr || `${state}, India`);
      setPreferredMentorshipLocation(city || state);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setSuccessMsg(null);

    const bLoc = sameAsPersonal ? [city, district, state].filter(Boolean).join(', ') : businessLocation;
    const mLoc = sameAsPersonal ? (city || state) : (preferredMentorshipLocation || city || state);

    try {
      const updated = await api.updateProfile({
        country,
        state,
        district,
        city,
        pincode,
        location_type: locationType,
        business_location: bLoc,
        business_operating_area: businessOperatingArea,
        preferred_mentorship_location: mLoc,
        preferred_mentorship_mode: preferredMentorshipMode as any,
        business_idea: businessIdea,
        business_domain: businessDomain,
        available_investment: Number(availableInvestment),
        expected_investment: Number(expectedInvestment),
        current_stage: currentStage as any,
        business_model: businessModel,
        work_experience: workExperience
      });

      setProfileState(updated);
      setIsEditing(false);
      setSuccessMsg(`Profile & locations saved! All AI intelligence modules updated to v${updated.profile_version || 1}.`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error('Failed to update profile', err);
      alert(`Error updating profile: ${err.message || 'Please check form inputs.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleManualAIRefresh = async () => {
    setRefreshingAI(true);
    try {
      const res = await api.refreshAIInsights();
      setSuccessMsg(`Central AI Engine successfully synchronized all recommendations (v${res.profile_version})!`);
      const refreshedProfile = await api.getProfile();
      setProfileState(refreshedProfile);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(`AI Refresh Error: ${err.message}`);
    } finally {
      setRefreshingAI(false);
    }
  };

  if (!profile) {
    return (
      <div className="p-8 text-center text-charcoal">
        <p className="text-sm">Profile loading or user is not in entrepreneur role.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
            alt={user?.full_name}
            className="w-20 h-20 rounded-3xl object-cover border-4 border-plum/10 shadow-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=54245F&color=fff`;
            }}
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold font-heading text-charcoal">{user?.full_name}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-success font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Verified Entrepreneur</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-plum/10 text-plum font-mono font-semibold">
                Profile v{profile.profile_version || 1}.0
              </span>
            </div>
            <p className="text-xs text-charcoal-muted flex items-center gap-1.5">
              <MapPin size={13} className="text-plum" />
              <span>{profile.city ? `${profile.city}, ` : ''}{profile.district}, {profile.state} ({profile.location_type})</span>
            </p>
            <p className="text-xs text-empowerment-purple font-semibold">
              {profile.business_domain} • {profile.current_stage} • {profile.business_model}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={handleManualAIRefresh}
            disabled={refreshingAI}
            className="px-3.5 py-2.5 rounded-xl bg-plum/10 hover:bg-plum/20 text-plum text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
            title="Recompute all AI recommendations"
          >
            <RefreshCw size={13} className={refreshingAI ? 'animate-spin' : ''} />
            <span>{refreshingAI ? 'Syncing...' : 'Sync AI'}</span>
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2.5 rounded-xl border border-plum/20 hover:bg-blush text-plum text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Edit3 size={14} />
            <span>{isEditing ? 'Cancel Editing' : 'Edit Profile & Location'}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-success text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-success/70 hover:text-success">✕</button>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow space-y-6 text-xs">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold font-heading text-charcoal">Edit Profile, Location & Venture Parameters</h3>
            <p className="text-charcoal-muted">
              Any changes to location, stage, or domain automatically recalculate your Dynamic Revenue Channels, Competitor Landscape, Risk Assessment, and Scheme Fit.
            </p>
          </div>

          {/* Section 1: Personal Geographic Location */}
          <div className="p-4 rounded-2xl bg-neutral-bg/60 border border-gray-200/80 space-y-4">
            <div className="flex items-center gap-2 text-plum font-bold font-heading text-sm">
              <MapPin size={16} />
              <span>1. Personal Location & Jurisdiction</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">State / UT</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                  required
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                  placeholder="e.g. Mysuru District"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-charcoal mb-1">City / Town</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                  placeholder="e.g. Mysuru"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">PIN Code (Optional)</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  maxLength={6}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                  placeholder="e.g. 570001"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Location Zone Type</label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                >
                  <option value="Urban">Urban</option>
                  <option value="Semi-Urban">Semi-Urban</option>
                  <option value="Rural">Rural</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Business Location & Operating Logistics */}
          <div className="p-4 rounded-2xl bg-neutral-bg/60 border border-gray-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-plum font-bold font-heading text-sm">
                <Building2 size={16} />
                <span>2. Business Location & Target Operating Area</span>
              </div>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-plum cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsPersonal}
                  onChange={(e) => handleToggleSameAsPersonal(e.target.checked)}
                  className="rounded text-plum focus:ring-plum"
                />
                <span>Same as my personal location</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  Business Location / Facility Address
                </label>
                <input
                  type="text"
                  value={businessLocation}
                  onChange={(e) => setBusinessLocation(e.target.value)}
                  disabled={sameAsPersonal}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white disabled:bg-gray-100 disabled:text-charcoal-muted"
                  placeholder="e.g. Devaraja Market, Mysuru"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  Business Operating Area (Sales Footprint)
                </label>
                <select
                  value={businessOperatingArea}
                  onChange={(e) => setBusinessOperatingArea(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                >
                  {OPERATING_AREAS.map((oa) => (
                    <option key={oa} value={oa}>{oa}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mentorship Location & Mode Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-200/60">
              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  Preferred Mentorship Mode
                </label>
                <select
                  value={preferredMentorshipMode}
                  onChange={(e) => setPreferredMentorshipMode(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                >
                  <option value="Online">Online (Video & Chat)</option>
                  <option value="Offline">Offline (In-Person)</option>
                  <option value="Hybrid">Hybrid (Online + Local Meetups)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  Preferred Mentorship Location
                </label>
                <input
                  type="text"
                  value={preferredMentorshipLocation}
                  onChange={(e) => setPreferredMentorshipLocation(e.target.value)}
                  disabled={sameAsPersonal}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white disabled:bg-gray-100"
                  placeholder="e.g. Mysuru / Bengaluru"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Venture Details & Economics */}
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-charcoal mb-1">Business Idea Summary</label>
              <textarea
                value={businessIdea}
                onChange={(e) => setBusinessIdea(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:border-plum"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Business Domain</label>
                <select
                  value={businessDomain}
                  onChange={(e) => setBusinessDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                >
                  <option value="Fashion & Apparel">Fashion & Apparel</option>
                  <option value="Food & Beverages">Food & Beverages</option>
                  <option value="Beauty & Wellness">Beauty & Wellness</option>
                  <option value="Agriculture & Allied">Agriculture & Allied</option>
                  <option value="Handicrafts & Artisanal">Handicrafts & Artisanal</option>
                  <option value="EdTech & Skill Development">EdTech & Skill Development</option>
                  <option value="Healthcare & Sanitation">Healthcare & Sanitation</option>
                  <option value="Tech & Digital Services">Tech & Digital Services</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Entrepreneurial Stage</label>
                <select
                  value={currentStage}
                  onChange={(e) => setCurrentStage(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                >
                  <option value="Idea Stage">Idea Stage</option>
                  <option value="Validation Stage">Validation Stage</option>
                  <option value="Startup Stage">Startup Stage</option>
                  <option value="Early Business Stage">Early Business Stage</option>
                  <option value="Growth & Expansion Stage">Growth & Expansion Stage</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Delivery Model</label>
                <select
                  value={businessModel}
                  onChange={(e) => setBusinessModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Available Investment (₹)</label>
                <input
                  type="number"
                  value={availableInvestment}
                  onChange={(e) => setAvailableInvestment(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Expected Investment (₹)</label>
                <input
                  type="number"
                  value={expectedInvestment}
                  onChange={(e) => setExpectedInvestment(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">Prior Experience</label>
              <textarea
                value={workExperience}
                onChange={(e) => setWorkExperience(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl border border-gray-200 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-charcoal-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-plum hover:bg-plum-dark text-white font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Save size={14} />
              <span>{saving ? 'Updating Engine & AI Models...' : 'Save & Refresh All AI Insights'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Geographic & Operational Jurisdiction Card */}
          <div className="bg-white rounded-3xl p-6 border border-plum/10 card-shadow space-y-4">
            <h3 className="text-sm font-bold font-heading text-charcoal border-b border-gray-100 pb-2 flex items-center gap-2">
              <MapPin size={15} className="text-plum" />
              <span>Geographic & Operational Footprint</span>
            </h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-charcoal-muted block">Personal Location:</span>
                <p className="font-semibold text-charcoal">
                  {profile.city ? `${profile.city}, ` : ''}{profile.district}, {profile.state}, {profile.country || 'India'}
                  {profile.pincode ? ` - ${profile.pincode}` : ''} ({profile.location_type})
                </p>
              </div>

              <div>
                <span className="text-charcoal-muted block">Registered Business Location:</span>
                <p className="font-semibold text-charcoal">
                  {profile.business_location || (profile.city ? `${profile.city}, ${profile.state}` : profile.state)}
                </p>
              </div>

              <div>
                <span className="text-charcoal-muted block">Target Operating Area:</span>
                <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-plum/10 text-plum font-semibold">
                  {profile.business_operating_area || 'Local & City-wide'}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <span className="text-charcoal-muted block">Mentorship Preferences:</span>
                <p className="font-semibold text-charcoal mt-0.5">
                  Mode: <span className="text-empowerment-purple">{profile.preferred_mentorship_mode || 'Hybrid'}</span> • Location: {profile.preferred_mentorship_location || (profile.city || profile.state)}
                </p>
              </div>
            </div>
          </div>

          {/* Venture Specification Card */}
          <div className="bg-white rounded-3xl p-6 border border-plum/10 card-shadow space-y-4">
            <h3 className="text-sm font-bold font-heading text-charcoal border-b border-gray-100 pb-2 flex items-center gap-2">
              <Building2 size={15} className="text-plum" />
              <span>Venture Specification</span>
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-charcoal-muted block">Core Business Idea:</span>
                <p className="font-semibold text-charcoal leading-relaxed">{profile.business_idea}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-charcoal-muted block">Domain / Sector:</span>
                  <p className="font-semibold text-charcoal">{profile.business_domain}</p>
                </div>
                <div>
                  <span className="text-charcoal-muted block">Current Stage:</span>
                  <p className="font-semibold text-charcoal">{profile.current_stage}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-charcoal-muted block">Available Investment:</span>
                  <p className="font-semibold text-success">₹{profile.available_investment?.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-charcoal-muted block">Expected Investment:</span>
                  <p className="font-semibold text-charcoal">₹{profile.expected_investment?.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div>
                <span className="text-charcoal-muted block">Delivery Model:</span>
                <p className="font-semibold text-charcoal">{profile.business_model}</p>
              </div>
            </div>
          </div>

          {/* Skills & Background */}
          <div className="bg-white rounded-3xl p-6 border border-plum/10 card-shadow space-y-4">
            <h3 className="text-sm font-bold font-heading text-charcoal border-b border-gray-100 pb-2 flex items-center gap-2">
              <Briefcase size={15} className="text-plum" />
              <span>Skills & Experience</span>
            </h3>
            <div>
              <span className="text-charcoal-muted block mb-1.5">Documented Capabilities:</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills?.length > 0 ? (
                  profile.skills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-full bg-blush text-plum font-semibold text-[11px]">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-charcoal-muted">No specific skills listed.</span>
                )}
              </div>
            </div>

            {profile.work_experience && (
              <div>
                <span className="text-charcoal-muted block">Prior Work Experience:</span>
                <p className="font-medium text-charcoal mt-1 leading-relaxed">{profile.work_experience}</p>
              </div>
            )}
          </div>

          {/* Stated Challenges */}
          <div className="bg-white rounded-3xl p-6 border border-plum/10 card-shadow space-y-4">
            <h3 className="text-sm font-bold font-heading text-charcoal border-b border-gray-100 pb-2 flex items-center gap-2">
              <Layers size={15} className="text-plum" />
              <span>Active Entrepreneurial Challenges</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.challenges?.length > 0 ? (
                profile.challenges.map((c, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-coral/10 text-coral-dark font-medium text-[11px]">
                    {c}
                  </span>
                ))
              ) : (
                <span className="text-charcoal-muted">No challenges reported.</span>
              )}
            </div>
            <div className="p-3 rounded-2xl bg-plum/5 border border-plum/10 mt-2">
              <p className="text-[11px] text-plum font-medium leading-relaxed">
                💡 RiseHer AI actively matches schemes, mentors, and operational roadmap milestones specifically tailored to mitigate these challenges.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
