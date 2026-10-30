import React, { useState, useEffect } from 'react';
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
  Globe2,
  Star,
  Calendar,
  Video,
  Clock,
  MessageSquare,
  ShieldCheck,
  Award,
  ExternalLink,
  Plus,
  X,
  ArrowRight,
  Copy,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { MentorProfile, MentorshipRequest } from '../types';

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

export interface ProfileViewProps {
  onNavigate?: (viewId: string) => void;
}

// ==========================================
// 1. MENTOR PROFILE VIEW COMPONENT
// ==========================================
const MentorProfileView: React.FC<{ onNavigate?: (viewId: string) => void }> = ({ onNavigate }) => {
  const { user, mentorProfile, setMentorProfileState, refreshMentorProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Form Fields
  const [businessName, setBusinessName] = useState(mentorProfile?.business_name || 'LoomCraft Studio');
  const [businessDomain, setBusinessDomain] = useState(mentorProfile?.business_domain || 'Fashion & Apparel');
  const [yearsExperience, setYearsExperience] = useState<number>(mentorProfile?.years_experience || 8);
  const [location, setLocation] = useState(mentorProfile?.location || 'Bangalore, Karnataka');
  const [businessModelExperience, setBusinessModelExperience] = useState(mentorProfile?.business_model_experience || 'Online');
  const [businessDescription, setBusinessDescription] = useState(mentorProfile?.business_description || '');
  const [bio, setBio] = useState(mentorProfile?.bio || '');
  const [successStory, setSuccessStory] = useState(mentorProfile?.success_story || '');
  const [meetingLink, setMeetingLink] = useState(mentorProfile?.meeting_link || 'https://meet.google.com/rsh-kavita-session');
  const [expertiseAreas, setExpertiseAreas] = useState<string[]>(mentorProfile?.expertise_areas || []);
  const [languages, setLanguages] = useState<string[]>(mentorProfile?.languages || ['English', 'Kannada', 'Hindi']);
  const [availabilitySchedule, setAvailabilitySchedule] = useState<string[]>(mentorProfile?.availability_schedule || []);

  const [newTag, setNewTag] = useState('');
  const [newLang, setNewLang] = useState('');
  const [newSlot, setNewSlot] = useState('');

  // Sync state whenever mentorProfile changes or loads
  useEffect(() => {
    if (mentorProfile) {
      setBusinessName(mentorProfile.business_name || '');
      setBusinessDomain(mentorProfile.business_domain || 'Fashion & Apparel');
      setYearsExperience(mentorProfile.years_experience || 5);
      setLocation(mentorProfile.location || 'Bangalore, Karnataka');
      setBusinessModelExperience(mentorProfile.business_model_experience || 'Online');
      setBusinessDescription(mentorProfile.business_description || '');
      setBio(mentorProfile.bio || '');
      setSuccessStory(mentorProfile.success_story || '');
      setMeetingLink(mentorProfile.meeting_link || 'https://meet.google.com/rsh-mentorship-session');
      setExpertiseAreas(mentorProfile.expertise_areas || []);
      setLanguages(mentorProfile.languages || ['English', 'Kannada', 'Hindi']);
      setAvailabilitySchedule(mentorProfile.availability_schedule || []);
    } else {
      refreshMentorProfile();
    }
  }, [mentorProfile]);

  useEffect(() => {
    setLoadingRequests(true);
    api.getMyMentorshipRequests()
      .then(res => setRequests(res))
      .catch(err => console.warn('Failed to load mentorship requests:', err))
      .finally(() => setLoadingRequests(false));
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !expertiseAreas.includes(newTag.trim())) {
      setExpertiseAreas([...expertiseAreas, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setExpertiseAreas(expertiseAreas.filter(t => t !== tag));
  };

  const handleAddLang = () => {
    if (newLang.trim() && !languages.includes(newLang.trim())) {
      setLanguages([...languages, newLang.trim()]);
      setNewLang('');
    }
  };

  const handleRemoveLang = (l: string) => {
    setLanguages(languages.filter(item => item !== l));
  };

  const handleAddSlot = () => {
    if (newSlot.trim() && !availabilitySchedule.includes(newSlot.trim())) {
      setAvailabilitySchedule([...availabilitySchedule, newSlot.trim()]);
      setNewSlot('');
    }
  };

  const handleRemoveSlot = (slot: string) => {
    setAvailabilitySchedule(availabilitySchedule.filter(s => s !== slot));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    try {
      const updated = await api.updateMentorProfile({
        business_name: businessName,
        business_domain: businessDomain,
        years_experience: Number(yearsExperience),
        location,
        business_model_experience: businessModelExperience,
        business_description: businessDescription,
        bio,
        success_story: successStory,
        meeting_link: meetingLink,
        expertise_areas: expertiseAreas,
        languages,
        availability_schedule: availabilitySchedule
      });
      setMentorProfileState(updated);
      setIsEditing(false);
      setSuccessMsg('Mentor profile, expertise & schedule saved successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Error saving mentor profile: ${err.message || 'Please check form fields.'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Toast Feedback */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-success text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Mentor Profile Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'}
            alt={user?.full_name}
            className="w-20 h-20 rounded-3xl object-cover border-4 border-plum/10 shadow-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Mentor')}&background=54245F&color=fff`;
            }}
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold font-heading text-charcoal">{user?.full_name}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-success font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Verified Mentor</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold flex items-center gap-1 border border-amber-200">
                <Star size={12} className="fill-amber-400 text-amber-500" />
                <span>{mentorProfile?.rating || 4.95} Rating</span>
              </span>
            </div>
            <p className="text-xs text-charcoal-muted flex items-center gap-1.5">
              <MapPin size={13} className="text-plum" />
              <span>{location}</span>
            </p>
            <p className="text-xs text-empowerment-purple font-semibold">
              {businessName} • {businessDomain} • {yearsExperience}+ Years Experience
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {isEditing ? (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl border border-gray-300 text-charcoal-muted hover:text-charcoal hover:bg-gray-50 text-xs font-semibold transition"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-plum hover:bg-plum-dark text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition"
            >
              <Edit3 size={14} />
              <span>Edit Mentor Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-plum/10 card-shadow">
          <div className="flex items-center justify-between text-charcoal-muted mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Experience</span>
            <Award size={15} className="text-plum" />
          </div>
          <div className="text-lg font-bold font-heading text-charcoal">{yearsExperience}+ Years</div>
          <p className="text-[10px] text-charcoal-muted mt-0.5">Domain Leadership</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-plum/10 card-shadow">
          <div className="flex items-center justify-between text-charcoal-muted mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Rating</span>
            <Star size={15} className="text-amber-500 fill-amber-400" />
          </div>
          <div className="text-lg font-bold font-heading text-charcoal">{mentorProfile?.rating || 4.95} / 5.0</div>
          <p className="text-[10px] text-charcoal-muted mt-0.5">{mentorProfile?.reviews_count || 28} Verified Reviews</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-plum/10 card-shadow">
          <div className="flex items-center justify-between text-charcoal-muted mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Mode</span>
            <Video size={15} className="text-empowerment-purple" />
          </div>
          <div className="text-lg font-bold font-heading text-charcoal">{businessModelExperience}</div>
          <p className="text-[10px] text-charcoal-muted mt-0.5">Online & 1:1 Sessions</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-plum/10 card-shadow">
          <div className="flex items-center justify-between text-charcoal-muted mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Verification</span>
            <ShieldCheck size={15} className="text-success" />
          </div>
          <div className="text-lg font-bold font-heading text-charcoal">WEP Verified</div>
          <p className="text-[10px] text-charcoal-muted mt-0.5">NITI Aayog Compliant</p>
        </div>
      </div>

      {/* Meeting Room Card */}
      <div className="bg-gradient-to-r from-plum/5 via-empowerment-purple/5 to-coral/5 rounded-3xl p-5 border border-plum/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white text-plum flex items-center justify-center shadow-sm shrink-0">
            <Video size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-charcoal font-heading">Active Mentorship Video Room</div>
            <div className="text-[11px] text-charcoal-muted font-mono truncate max-w-sm sm:max-w-md">{meetingLink}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-white border border-plum/20 hover:border-plum text-xs font-semibold text-plum flex items-center gap-1.5 shadow-sm transition"
          >
            {copySuccess ? <Check size={13} className="text-success" /> : <Copy size={13} />}
            <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
          </button>
          <a
            href={meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-plum text-white hover:bg-plum-dark text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <span>Join Room</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Edit Mode vs View Mode */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow space-y-6">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold font-heading text-charcoal">Edit Mentor Profile & Availability</h3>
            <span className="text-xs text-charcoal-muted">All updates synchronize instantly with the mentorship matching engine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-charcoal block mb-1">Business / Brand Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal block mb-1">Business Domain</label>
              <select
                value={businessDomain}
                onChange={(e) => setBusinessDomain(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum bg-white"
              >
                <option value="Fashion & Apparel">Fashion & Apparel</option>
                <option value="Food & Bakery">Food & Bakery</option>
                <option value="Agriculture & Agro">Agriculture & Agro</option>
                <option value="Handicrafts & Art">Handicrafts & Art</option>
                <option value="Beauty & Wellness">Beauty & Wellness</option>
                <option value="Services & Consulting">Services & Consulting</option>
                <option value="Technology & IT">Technology & IT</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal block mb-1">Years of Entrepreneurial Experience</label>
              <input
                type="number"
                min="1"
                max="50"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal block mb-1">Location (City, State)</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal block mb-1">Mentoring & Business Model</label>
              <select
                value={businessModelExperience}
                onChange={(e) => setBusinessModelExperience(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum bg-white"
              >
                <option value="Online">Online / D2C</option>
                <option value="Offline">Offline / Physical Outlets</option>
                <option value="Both">Both (Omnichannel / Hybrid)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal block mb-1">Google Meet / Video Link</label>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-charcoal block mb-1">Business & Venture Background</label>
            <textarea
              rows={3}
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum"
              placeholder="Tell founders about the business you built and your entrepreneurial journey..."
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-charcoal block mb-1">Personal Mentor Bio</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum"
              placeholder="Your mentoring philosophy and how you support women founders..."
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-charcoal block mb-1">Track Record & Success Stories</label>
            <textarea
              rows={2}
              value={successStory}
              onChange={(e) => setSuccessStory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum"
              placeholder="Concrete milestones you helped previous mentees achieve..."
            />
          </div>

          {/* Expertise Areas Tags */}
          <div>
            <label className="text-xs font-semibold text-charcoal block mb-1">Expertise & Specializations</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {expertiseAreas.map(t => (
                <span key={t} className="px-2.5 py-1 rounded-full bg-plum/10 text-plum font-semibold text-xs flex items-center gap-1">
                  <span>{t}</span>
                  <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-red-500">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                placeholder="Add skill (e.g. D2C Branding, FSSAI Licensing, Capex)..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-xl bg-plum/10 hover:bg-plum/20 text-plum font-semibold text-xs transition"
              >
                Add Skill
              </button>
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="text-xs font-semibold text-charcoal block mb-1">Languages Spoken</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {languages.map(l => (
                <span key={l} className="px-2.5 py-1 rounded-full bg-empowerment-purple/10 text-empowerment-purple font-semibold text-xs flex items-center gap-1">
                  <span>{l}</span>
                  <button type="button" onClick={() => handleRemoveLang(l)} className="hover:text-red-500">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLang}
                onChange={(e) => setNewLang(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLang(); } }}
                placeholder="Add language (e.g. Marathi, Telugu, Tamil)..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum"
              />
              <button
                type="button"
                onClick={handleAddLang}
                className="px-3 py-1.5 rounded-xl bg-empowerment-purple/10 hover:bg-empowerment-purple/20 text-empowerment-purple font-semibold text-xs transition"
              >
                Add Language
              </button>
            </div>
          </div>

          {/* Availability Windows */}
          <div>
            <label className="text-xs font-semibold text-charcoal block mb-1">Weekly Availability Windows</label>
            <div className="space-y-1.5 mb-2">
              {availabilitySchedule.map(s => (
                <div key={s} className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-charcoal flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar size={13} className="text-plum" />
                    <span>{s}</span>
                  </span>
                  <button type="button" onClick={() => handleRemoveSlot(s)} className="text-gray-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSlot(); } }}
                placeholder="Add time window (e.g. Saturdays 10:00 AM - 12:00 PM)..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum"
              />
              <button
                type="button"
                onClick={handleAddSlot}
                className="px-3 py-1.5 rounded-xl bg-plum/10 hover:bg-plum/20 text-plum font-semibold text-xs transition"
              >
                Add Window
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl border border-gray-300 text-charcoal-muted hover:text-charcoal hover:bg-gray-50 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-plum hover:bg-plum-dark text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{saving ? 'Saving...' : 'Save Mentor Profile'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Business & Narrative */}
          <div className="lg:col-span-2 space-y-6">
            {/* Venture Background */}
            <div className="bg-white rounded-3xl p-6 border border-plum/15 card-shadow space-y-3">
              <h3 className="text-sm font-bold font-heading text-charcoal border-b border-gray-100 pb-2 flex items-center gap-2">
                <Building2 size={16} className="text-plum" />
                <span>Founder Background & Brand</span>
              </h3>
              <p className="text-xs text-charcoal leading-relaxed whitespace-pre-wrap">
                {businessDescription || 'Founded and scaled LoomCraft Studio, a sustainable D2C handloom brand supporting rural artisans across Karnataka.'}
              </p>
            </div>

            {/* Mentor Bio */}
            <div className="bg-white rounded-3xl p-6 border border-plum/15 card-shadow space-y-3">
              <h3 className="text-sm font-bold font-heading text-charcoal border-b border-gray-100 pb-2 flex items-center gap-2">
                <User size={16} className="text-empowerment-purple" />
                <span>Mentorship Philosophy & Bio</span>
              </h3>
              <p className="text-xs text-charcoal leading-relaxed whitespace-pre-wrap">
                {bio || 'Passionate about empowering women artisans through digital commerce, transparent pricing, and ethical supply chains.'}
              </p>
            </div>

            {/* Success Story */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-500/20 bg-emerald-50/20 card-shadow space-y-3">
              <h3 className="text-sm font-bold font-heading text-success border-b border-emerald-100 pb-2 flex items-center gap-2">
                <Sparkles size={16} className="text-success" />
                <span>Mentee Success Story & Track Record</span>
              </h3>
              <p className="text-xs text-charcoal leading-relaxed whitespace-pre-wrap">
                {successStory || 'Helped 12 first-time fashion founders transition from home tailoring into profitable online boutique brands with recurring orders.'}
              </p>
            </div>
          </div>

          {/* Right Column: Expertise & Requests */}
          <div className="space-y-6">
            {/* Expertise */}
            <div className="bg-white rounded-3xl p-6 border border-plum/15 card-shadow space-y-3">
              <h3 className="text-sm font-bold font-heading text-charcoal border-b border-gray-100 pb-2 flex items-center gap-2">
                <Compass size={16} className="text-plum" />
                <span>Mentorship Focus Areas</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {expertiseAreas.length > 0 ? (
                  expertiseAreas.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-plum/10 text-plum font-semibold text-[11px]">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-charcoal-muted">E-Commerce, Supply Chain, Branding, Capex</span>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100">
                <span className="text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider block mb-1.5">Languages</span>
                <div className="flex flex-wrap gap-1">
                  {languages.map(l => (
                    <span key={l} className="px-2 py-0.5 rounded-lg bg-gray-100 text-charcoal text-[11px] font-medium">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Availability Windows */}
            <div className="bg-white rounded-3xl p-6 border border-plum/15 card-shadow space-y-3">
              <h3 className="text-sm font-bold font-heading text-charcoal border-b border-gray-100 pb-2 flex items-center gap-2">
                <Calendar size={16} className="text-plum" />
                <span>Weekly Mentorship Windows</span>
              </h3>
              <div className="space-y-1.5">
                {availabilitySchedule.length > 0 ? (
                  availabilitySchedule.map(slot => (
                    <div key={slot} className="p-2 rounded-xl bg-purple-50/50 border border-purple-100 text-[11px] font-medium text-plum flex items-center gap-2">
                      <Clock size={12} className="text-empowerment-purple" />
                      <span>{slot}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-charcoal-muted">Tuesdays 4:00 PM - 6:00 PM • Saturdays 11:00 AM - 1:00 PM</p>
                )}
              </div>
            </div>

            {/* Inbound Mentee Sessions */}
            <div className="bg-white rounded-3xl p-6 border border-plum/15 card-shadow space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-sm font-bold font-heading text-charcoal flex items-center gap-2">
                  <MessageSquare size={16} className="text-plum" />
                  <span>Mentees & Requests</span>
                </h3>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('mentors')}
                    className="text-[11px] font-semibold text-plum hover:underline flex items-center gap-0.5"
                  >
                    <span>View All</span>
                    <ChevronRight size={12} />
                  </button>
                )}
              </div>

              {loadingRequests ? (
                <div className="py-4 text-center text-xs text-charcoal-muted">Loading requests...</div>
              ) : requests.length > 0 ? (
                <div className="space-y-2">
                  {requests.slice(0, 3).map(r => (
                    <div key={r.id} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-charcoal">{r.entrepreneur_name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                          r.status === 'accepted' ? 'bg-emerald-50 text-success' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-charcoal-muted truncate">{r.subject}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-charcoal-muted">No pending mentorship requests currently.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. ADMINISTRATOR PROFILE VIEW COMPONENT
// ==========================================
const AdminProfileView: React.FC<{ onNavigate?: (viewId: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={user?.avatar_url || 'https://ui-avatars.com/api/?name=Admin&background=54245F&color=fff'}
            alt={user?.full_name}
            className="w-20 h-20 rounded-3xl object-cover border-4 border-plum/10 shadow-md"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold font-heading text-charcoal">{user?.full_name}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-plum font-semibold flex items-center gap-1 border border-plum/20">
                <ShieldCheck size={12} />
                <span>Platform Administrator</span>
              </span>
            </div>
            <p className="text-xs text-charcoal-muted">{user?.email}</p>
            <p className="text-xs text-empowerment-purple font-semibold">
              NITI Aayog & WEP System Governance • Scheme Authority • Verification Lead
            </p>
          </div>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate('admin')}
            className="px-4 py-2.5 rounded-xl bg-plum hover:bg-plum-dark text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition"
          >
            <span>Open Administrator Console</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-plum/10 card-shadow space-y-1">
          <div className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider">Access Tier</div>
          <div className="text-lg font-bold font-heading text-charcoal">Super Administrator</div>
          <p className="text-[11px] text-charcoal-muted">Full read/write permissions across all users, schemes, and verification queues.</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-plum/10 card-shadow space-y-1">
          <div className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider">Security Status</div>
          <div className="text-lg font-bold font-heading text-success flex items-center gap-1">
            <CheckCircle2 size={16} />
            <span>MFA & Audit Enabled</span>
          </div>
          <p className="text-[11px] text-charcoal-muted">Every administrative review is cryptographically timestamped and logged.</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-plum/10 card-shadow space-y-1">
          <div className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider">Ecosystem Scope</div>
          <div className="text-lg font-bold font-heading text-plum">National (Pan-India)</div>
          <p className="text-[11px] text-charcoal-muted">Covering 28 States and 8 Union Territories under the WEP NITI Aayog framework.</p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. ENTREPRENEUR PROFILE VIEW COMPONENT
// ==========================================
const EntrepreneurProfileView: React.FC<{ onNavigate?: (viewId: string) => void }> = ({ onNavigate }) => {
  const { user, profile, setProfileState, loading } = useAuth();
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
    if (loading) {
      return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto animate-pulse">
          <div className="bg-white rounded-3xl p-8 border border-plum/10 card-shadow flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gray-200" />
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-28 bg-white rounded-2xl border border-plum/10 p-4" />
            <div className="h-28 bg-white rounded-2xl border border-plum/10 p-4" />
            <div className="h-28 bg-white rounded-2xl border border-plum/10 p-4" />
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 sm:p-10 max-w-2xl mx-auto text-center space-y-5 bg-white rounded-3xl border border-plum/15 card-shadow my-8">
        <div className="w-16 h-16 rounded-2xl bg-plum/10 text-plum flex items-center justify-center mx-auto">
          <Sparkles size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold font-heading text-charcoal">Complete Your Entrepreneur Profile</h2>
          <p className="text-xs text-charcoal-muted mt-1 max-w-md mx-auto leading-relaxed">
            Tell RiseHer about your business idea, skills, location, and investment budget to unlock personalized AI business viability analysis, dynamic revenue models, and government scheme matches.
          </p>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate('onboarding')}
            className="px-6 py-3 rounded-xl bg-plum hover:bg-plum-dark text-white font-semibold text-xs shadow-md transition inline-flex items-center gap-2"
          >
            <span>Start Onboarding Wizard</span>
            <ArrowRight size={14} />
          </button>
        )}
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
            className="px-4 py-2 rounded-xl bg-empowerment-purple/10 hover:bg-empowerment-purple/20 text-empowerment-purple text-xs font-semibold flex items-center gap-2 transition disabled:opacity-50"
            title="Recompute all business viability, risk, schemes, and roadmap models based on current profile"
          >
            <RefreshCw size={14} className={refreshingAI ? 'animate-spin' : ''} />
            <span>{refreshingAI ? 'Recomputing AI...' : 'Refresh AI Intelligence'}</span>
          </button>

          {isEditing ? (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl border border-gray-300 text-charcoal-muted hover:text-charcoal hover:bg-gray-50 text-xs font-semibold transition"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-plum hover:bg-plum-dark text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition"
            >
              <Edit3 size={14} />
              <span>Edit Profile & Locations</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-success text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            <Check size={14} />
          </button>
        </div>
      )}

      {/* 4 Quick Stat Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-plum/10 card-shadow">
          <div className="flex items-center justify-between text-charcoal-muted mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Available Budget</span>
            <DollarSign size={15} className="text-plum" />
          </div>
          <div className="text-lg font-bold font-heading text-charcoal">₹{profile.available_investment?.toLocaleString('en-IN')}</div>
          <p className="text-[10px] text-charcoal-muted mt-0.5">Liquid Working Capital</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-plum/10 card-shadow">
          <div className="flex items-center justify-between text-charcoal-muted mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Expected Scale</span>
            <Building2 size={15} className="text-coral" />
          </div>
          <div className="text-lg font-bold font-heading text-charcoal">₹{profile.expected_investment?.toLocaleString('en-IN')}</div>
          <p className="text-[10px] text-charcoal-muted mt-0.5">Target Capital Horizon</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-plum/10 card-shadow">
          <div className="flex items-center justify-between text-charcoal-muted mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Venture Stage</span>
            <Sparkles size={15} className="text-empowerment-purple" />
          </div>
          <div className="text-lg font-bold font-heading text-charcoal">{profile.current_stage}</div>
          <p className="text-[10px] text-charcoal-muted mt-0.5">Operational Phase</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-plum/10 card-shadow">
          <div className="flex items-center justify-between text-charcoal-muted mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Business Model</span>
            <Compass size={15} className="text-success" />
          </div>
          <div className="text-lg font-bold font-heading text-charcoal">{profile.business_model}</div>
          <p className="text-[10px] text-charcoal-muted mt-0.5">{profile.business_operating_area || 'Local'}</p>
        </div>
      </div>

      {/* Main Content: Edit Form vs View Mode */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow space-y-8">
          <div>
            <h3 className="text-base font-bold font-heading text-charcoal border-b border-gray-100 pb-2">
              Update Personal & Business Profile
            </h3>
            <p className="text-xs text-charcoal-muted mt-1">
              Saving updates will automatically trigger the Central AI Engine to recompute your viability score, dynamic revenue channels, risk factors, scheme matches, and customized roadmap.
            </p>
          </div>

          {/* Section 1: Personal Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold font-heading text-plum uppercase tracking-wider">
              <MapPin size={14} />
              <span>1. Personal Residential Location</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">State / UT</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum bg-white"
                >
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum"
                  placeholder="e.g. Bengaluru Urban, Mysore"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">City / Town / Village</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum"
                  placeholder="e.g. Bengaluru, Hubli"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">Pincode (Optional)</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum"
                  placeholder="e.g. 560001"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">Area Demography</label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum bg-white"
                >
                  <option value="Urban">Urban City</option>
                  <option value="Semi-Urban">Semi-Urban / Tier 2-3</option>
                  <option value="Rural">Rural / Village Cluster</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Business Logistics & Operating Territory */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold font-heading text-coral uppercase tracking-wider">
                <Globe2 size={14} />
                <span>2. Business Location & Operating Area</span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-charcoal">
                <input
                  type="checkbox"
                  checked={sameAsPersonal}
                  onChange={(e) => handleToggleSameAsPersonal(e.target.checked)}
                  className="rounded border-gray-300 text-plum focus:ring-plum"
                />
                <span>Same as personal location</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">
                  Primary Business Operating Location
                </label>
                <input
                  type="text"
                  value={businessLocation}
                  onChange={(e) => setBusinessLocation(e.target.value)}
                  disabled={sameAsPersonal}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum disabled:bg-gray-100 disabled:text-charcoal-muted"
                  placeholder="e.g. Commercial Street, Shivajinagar, Bengaluru"
                />
                <p className="text-[10px] text-charcoal-muted mt-1">Where inventory, manufacturing, or commercial operations take place.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">
                  Target Market & Operating Reach
                </label>
                <select
                  value={businessOperatingArea}
                  onChange={(e) => setBusinessOperatingArea(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum bg-white"
                >
                  {OPERATING_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <p className="text-[10px] text-charcoal-muted mt-1">Influences market size, logistics feasibility, and scheme eligibility.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">
                  Preferred Mentorship Location
                </label>
                <input
                  type="text"
                  value={preferredMentorshipLocation}
                  onChange={(e) => setPreferredMentorshipLocation(e.target.value)}
                  disabled={sameAsPersonal}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum disabled:bg-gray-100 disabled:text-charcoal-muted"
                  placeholder="e.g. Bengaluru or Remote"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">
                  Preferred Mentorship Format
                </label>
                <select
                  value={preferredMentorshipMode}
                  onChange={(e) => setPreferredMentorshipMode(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum bg-white"
                >
                  <option value="Online">Online Video Sessions</option>
                  <option value="Offline">In-Person Meetings</option>
                  <option value="Hybrid">Hybrid (Both)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Venture Details */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs font-bold font-heading text-empowerment-purple uppercase tracking-wider">
              <Sparkles size={14} />
              <span>3. Business Idea & Parameters</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal block mb-1">Business Idea Description</label>
              <textarea
                value={businessIdea}
                onChange={(e) => setBusinessIdea(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum"
                placeholder="Describe what product or service you are building, target buyers, and unique value..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">Domain / Industry</label>
                <select
                  value={businessDomain}
                  onChange={(e) => setBusinessDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum bg-white"
                >
                  <option value="Fashion & Apparel">Fashion & Apparel</option>
                  <option value="Food & Bakery">Food & Bakery</option>
                  <option value="Agriculture & Agro">Agriculture & Agro</option>
                  <option value="Handicrafts & Art">Handicrafts & Art</option>
                  <option value="Beauty & Wellness">Beauty & Wellness</option>
                  <option value="Services & Consulting">Services & Consulting</option>
                  <option value="Technology & IT">Technology & IT</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">Available Investment (₹)</label>
                <input
                  type="number"
                  min="5000"
                  step="5000"
                  value={availableInvestment}
                  onChange={(e) => setAvailableInvestment(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">Target Horizon (₹)</label>
                <input
                  type="number"
                  min="10000"
                  step="10000"
                  value={expectedInvestment}
                  onChange={(e) => setExpectedInvestment(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">Venture Stage</label>
                <select
                  value={currentStage}
                  onChange={(e) => setCurrentStage(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum bg-white"
                >
                  <option value="Idea Stage">Idea Stage</option>
                  <option value="Validation Stage">Validation Stage</option>
                  <option value="Early Business">Early Business Stage</option>
                  <option value="Growth & Expansion">Growth & Expansion</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">Primary Business Model</label>
                <select
                  value={businessModel}
                  onChange={(e) => setBusinessModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum bg-white"
                >
                  <option value="Online">Online / D2C</option>
                  <option value="Offline">Offline / Physical Store</option>
                  <option value="Hybrid">Hybrid / Omnichannel</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">Prior Experience</label>
                <input
                  type="text"
                  value={workExperience}
                  onChange={(e) => setWorkExperience(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-plum"
                  placeholder="e.g. 3 years boutique sales"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl border border-gray-300 text-charcoal-muted hover:text-charcoal hover:bg-gray-50 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-plum hover:bg-plum-dark text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{saving ? 'Updating & Recomputing AI...' : 'Save Profile & Refresh Recommendations'}</span>
            </button>
          </div>
        </form>
      ) : (
        /* View Mode */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Venture Details & Business Location */}
          <div className="lg:col-span-2 space-y-6">
            {/* Idea Overview Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold font-heading text-charcoal flex items-center gap-2">
                  <Sparkles size={18} className="text-plum" />
                  <span>Business Idea & Value Proposition</span>
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-plum/10 text-plum font-semibold">
                  {profile.business_domain}
                </span>
              </div>

              <p className="text-xs text-charcoal leading-relaxed whitespace-pre-wrap">
                {profile.business_idea}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-xs">
                <div>
                  <span className="text-charcoal-muted block text-[11px]">Primary Model:</span>
                  <span className="font-semibold text-charcoal">{profile.business_model}</span>
                </div>
                <div>
                  <span className="text-charcoal-muted block text-[11px]">Industry Category:</span>
                  <span className="font-semibold text-charcoal">{profile.industry || profile.business_domain}</span>
                </div>
                <div>
                  <span className="text-charcoal-muted block text-[11px]">Stage:</span>
                  <span className="font-semibold text-charcoal">{profile.current_stage}</span>
                </div>
              </div>
            </div>

            {/* Business Location & Operating Reach Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-plum/15 card-shadow space-y-4">
              <h3 className="text-base font-bold font-heading text-charcoal flex items-center gap-2 border-b border-gray-100 pb-3">
                <Globe2 size={18} className="text-coral" />
                <span>Geographic & Operating Footprint</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-cream/50 border border-plum/10 space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted">Commercial Operating Base</span>
                  <p className="font-bold text-charcoal text-sm">{profile.business_location || `${profile.city || profile.district}, ${profile.state}`}</p>
                  <p className="text-[11px] text-charcoal-muted">Base location for manufacturing, fulfillment & licensing</p>
                </div>

                <div className="p-4 rounded-2xl bg-cream/50 border border-plum/10 space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted">Target Operating Reach</span>
                  <p className="font-bold text-plum text-sm">{profile.business_operating_area || 'Local & City-wide'}</p>
                  <p className="text-[11px] text-charcoal-muted">Geographic customer market & distribution boundary</p>
                </div>

                <div className="p-4 rounded-2xl bg-cream/50 border border-plum/10 space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted">Mentorship Location</span>
                  <p className="font-bold text-charcoal text-sm">{profile.preferred_mentorship_location || profile.state}</p>
                  <p className="text-[11px] text-charcoal-muted">Local networking and chapter connection</p>
                </div>

                <div className="p-4 rounded-2xl bg-cream/50 border border-plum/10 space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted">Mentorship Format</span>
                  <p className="font-bold text-empowerment-purple text-sm">{profile.preferred_mentorship_mode || 'Hybrid'}</p>
                  <p className="text-[11px] text-charcoal-muted">Preferred delivery channel with matched mentors</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Skills, Education, Background */}
          <div className="space-y-6">
            {/* Founder Demographics Card */}
            <div className="bg-white rounded-3xl p-6 border border-plum/15 card-shadow space-y-4 text-xs">
              <h3 className="text-sm font-bold font-heading text-charcoal border-b border-gray-100 pb-2 flex items-center gap-2">
                <GraduationCap size={16} className="text-plum" />
                <span>Founder Profile</span>
              </h3>

              <div className="space-y-3">
                {profile.education && (
                  <div>
                    <span className="text-charcoal-muted block">Education:</span>
                    <span className="font-semibold text-charcoal">{profile.education}</span>
                  </div>
                )}
                {profile.age_range && (
                  <div>
                    <span className="text-charcoal-muted block">Age Group:</span>
                    <span className="font-semibold text-charcoal">{profile.age_range}</span>
                  </div>
                )}
                <div>
                  <span className="text-charcoal-muted block">Registered Address:</span>
                  <span className="font-semibold text-charcoal">{profile.district}, {profile.state}</span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="pt-3 border-t border-gray-100">
                <span className="text-charcoal-muted block mb-2 font-medium">Founder Skills & Core Strengths:</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills?.length > 0 ? (
                    profile.skills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-full bg-plum/10 text-plum font-semibold text-[11px]">
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
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. MAIN EXPORTED PROFILE VIEW (ROLE-AWARE)
// ==========================================
export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  if (user?.role === 'mentor') {
    return <MentorProfileView onNavigate={onNavigate} />;
  }

  if (user?.role === 'admin') {
    return <AdminProfileView onNavigate={onNavigate} />;
  }

  return <EntrepreneurProfileView onNavigate={onNavigate} />;
};

export default ProfileView;
