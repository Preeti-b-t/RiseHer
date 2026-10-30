import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building,
  Target,
  DollarSign,
  MapPin,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

interface OnboardingWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onCancel }) => {
  const { user, profile, setProfileState } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [ageRange, setAgeRange] = useState(profile?.age_range || '26-35');
  const [education, setEducation] = useState(profile?.education || "Bachelor's Degree");
  const [skills, setSkills] = useState<string[]>(profile?.skills || ['Design', 'Customer Relations']);
  const [skillInput, setSkillInput] = useState('');
  const [interests, setInterests] = useState<string[]>(profile?.interests || ['Sustainable Products', 'Digital Sales']);
  const [interestInput, setInterestInput] = useState('');
  const [workExperience, setWorkExperience] = useState(profile?.work_experience || '');
  const [state, setState] = useState(profile?.state || 'Karnataka');
  const [district, setDistrict] = useState(profile?.district || 'Bangalore Rural');
  const [locationType, setLocationType] = useState(profile?.location_type || 'Semi-Urban');

  const [businessIdea, setBusinessIdea] = useState(profile?.business_idea || '');
  const [businessDomain, setBusinessDomain] = useState(profile?.business_domain || 'Fashion & Apparel');
  const [industry, setIndustry] = useState(profile?.industry || 'Retail & D2C');
  const [availableInvestment, setAvailableInvestment] = useState(profile?.available_investment || 50000);
  const [expectedInvestment, setExpectedInvestment] = useState(profile?.expected_investment || 150000);
  const [businessModel, setBusinessModel] = useState(profile?.business_model || 'Online');
  const [currentStatus, setCurrentStatus] = useState(profile?.current_status || 'Concept & research');
  const [currentStage, setCurrentStage] = useState<any>(profile?.current_stage || 'Idea Stage');
  const [challenges, setChallenges] = useState<string[]>(profile?.challenges || ['Funding', 'Marketing', 'Customer acquisition']);

  const allStages = [
    { id: 'Idea Stage', title: '1. Idea Stage', desc: 'Exploring and shaping potential business concepts.' },
    { id: 'Validation Stage', title: '2. Validation Stage', desc: 'Testing feasibility, prototype, and customer willingness to pay.' },
    { id: 'Startup Stage', title: '3. Startup Stage', desc: 'Ready to officially register, launch, and execute.' },
    { id: 'Early Business Stage', title: '4. Early Business Stage', desc: 'Already operating with early paying customers.' },
    { id: 'Growth & Expansion Stage', title: '5. Growth & Expansion Stage', desc: 'Established enterprise preparing to scale operations.' }
  ];

  const allChallenges = [
    'Funding',
    'Marketing',
    'Customer acquisition',
    'Business registration',
    'Finding suppliers',
    'Financial management',
    'Market research',
    'Technical skills',
    'Business operations',
    'Scaling'
  ];

  const domains = [
    'Fashion & Apparel',
    'Food & Bakery',
    'Agriculture & Agro-Processing',
    'Handicrafts & Artisanal',
    'Beauty & Wellness',
    'Technology & Digital Services',
    'Education & EdTech'
  ];

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (s: string) => {
    setSkills(skills.filter(item => item !== s));
  };

  const toggleChallenge = (c: string) => {
    if (challenges.includes(c)) {
      setChallenges(challenges.filter(item => item !== c));
    } else {
      setChallenges([...challenges, c]);
    }
  };

  const handleSubmit = async () => {
    if (!businessIdea.trim()) {
      setError('Please describe your business idea.');
      setStep(2);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        age_range: ageRange,
        education,
        skills,
        interests,
        work_experience: workExperience,
        state,
        district,
        location_type: locationType,
        business_idea: businessIdea,
        business_domain: businessDomain,
        industry,
        available_investment: Number(availableInvestment),
        expected_investment: Number(expectedInvestment),
        business_model: businessModel,
        current_status: currentStatus,
        current_stage: currentStage,
        challenges
      };

      const saved = await api.saveOnboarding(payload);
      setProfileState(saved);
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to save onboarding details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-plum/15 shadow-xl p-6 sm:p-10 card-shadow">
        {/* Wizard Header & Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-coral font-heading">
                Step-by-Step Profiling
              </span>
              <h2 className="text-2xl font-bold font-heading text-charcoal">
                Entrepreneur Profile & Stage Identification
              </h2>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blush text-plum">
              Step {step} of 4
            </span>
          </div>

          {/* Stepper bar */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s <= step ? 'bg-gradient-to-r from-plum to-empowerment-purple' : 'bg-gray-100'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* STEP 1: Personal & Professional Profile */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold font-heading text-plum">Personal & Professional Background</h3>
              <p className="text-xs text-charcoal-muted">Your skills and location guide mentor matching and government scheme eligibility.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Age Range (Optional)</label>
                <select
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-plum text-sm"
                >
                  <option value="18-25">18–25 years</option>
                  <option value="26-35">26–35 years</option>
                  <option value="36-45">36–45 years</option>
                  <option value="46-60">46–60 years</option>
                  <option value="60+">Above 60 years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Education Level</label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. Bachelor's in Design, High School, etc."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-plum text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-plum text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">District / City</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-plum text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-charcoal mb-1">Geographic Area Classification</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Urban', 'Semi-Urban', 'Rural'].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocationType(loc)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        locationType === loc
                          ? 'border-plum bg-blush text-plum shadow-sm'
                          : 'border-gray-200 hover:bg-gray-50 text-charcoal-muted'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-charcoal mb-1">Your Core Skills</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    placeholder="Type skill and press Enter (e.g. Tailoring, Cooking, Sourcing)"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 rounded-xl bg-plum text-white text-xs font-semibold"
                  >
                    Add Skill
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blush text-plum text-xs font-medium"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="hover:text-coral font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-charcoal mb-1">Prior Work / Independent Experience</label>
                <textarea
                  value={workExperience}
                  onChange={(e) => setWorkExperience(e.target.value)}
                  rows={2}
                  placeholder="Tell us about any past jobs, home experiments, or projects you have undertaken..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Business Concept & Financial Budget */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold font-heading text-plum">Business Concept & Budget</h3>
              <p className="text-xs text-charcoal-muted">Detail what you want to build and your available financial runway.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Business Domain / Sector <span className="text-coral">*</span>
                </label>
                <select
                  value={businessDomain}
                  onChange={(e) => setBusinessDomain(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-plum text-sm"
                >
                  {domains.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Describe Your Business Idea in Detail <span className="text-coral">*</span>
                </label>
                <textarea
                  value={businessIdea}
                  onChange={(e) => setBusinessIdea(e.target.value)}
                  rows={4}
                  placeholder="What product or service will you offer? Who will buy it, and what makes your approach special?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-plum"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Available Liquid Investment (₹)</label>
                  <input
                    type="number"
                    value={availableInvestment}
                    onChange={(e) => setAvailableInvestment(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-plum font-semibold"
                  />
                  <span className="text-[10px] text-charcoal-muted">Current cash you can deploy immediately</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Expected Total Startup Cost (₹)</label>
                  <input
                    type="number"
                    value={expectedInvestment}
                    onChange={(e) => setExpectedInvestment(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-plum font-semibold"
                  />
                  <span className="text-[10px] text-charcoal-muted">Estimated budget needed for launch</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Primary Business Model</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'Online', desc: 'D2C, WhatsApp, E-commerce' },
                    { id: 'Offline', desc: 'Physical store, kitchen, farm' },
                    { id: 'Hybrid', desc: 'Physical space + online orders' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setBusinessModel(m.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        businessModel === m.id
                          ? 'border-plum bg-blush shadow-sm'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <p className="text-xs font-bold text-plum">{m.id}</p>
                      <p className="text-[10px] text-charcoal-muted mt-0.5">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Entrepreneurial Stage */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold font-heading text-plum">Select Your Entrepreneurial Stage</h3>
              <p className="text-xs text-charcoal-muted">Recommendations adapt dynamically based on your actual business maturity.</p>
            </div>

            <div className="space-y-3">
              {allStages.map((st) => {
                const isSelected = currentStage === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setCurrentStage(st.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                      isSelected
                        ? 'border-plum bg-blush shadow-md'
                        : 'border-gray-200 hover:border-plum/40 hover:bg-cream'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-plum bg-plum' : 'border-gray-300'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-charcoal">{st.title}</p>
                      <p className="text-xs text-charcoal-muted mt-0.5">{st.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Current Challenges & Goals */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold font-heading text-plum">What Are Your Top Challenges Right Now?</h3>
              <p className="text-xs text-charcoal-muted">Select all areas where you need direct guidance, mentoring, or financial support.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {allChallenges.map((c) => {
                const isSelected = challenges.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleChallenge(c)}
                    className={`p-3 rounded-xl border text-xs font-semibold transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? 'border-empowerment-purple bg-purple-50 text-empowerment-purple shadow-sm'
                        : 'border-gray-200 text-charcoal hover:bg-gray-50'
                    }`}
                  >
                    <span>{c}</span>
                    {isSelected && <CheckCircle2 size={14} className="text-empowerment-purple shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-cream border border-plum/10 text-xs text-charcoal-light flex items-start gap-3">
              <Lightbulb size={18} className="text-coral shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-charcoal">How RiseHer Uses Your Input</p>
                <p className="mt-0.5">
                  Your inputs are processed through the Central AI Recommendation Engine to generate structured viability scores, filter 7+ official schemes by mandatory eligibility, prioritize 6-week milestones, and connect you with experienced domain founders.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-charcoal flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Previous</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-charcoal-muted hover:text-charcoal"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 2 && !businessIdea.trim()) {
                  setError('Please describe your business idea.');
                  return;
                }
                setError(null);
                setStep(step + 1);
              }}
              className="px-5 py-2.5 rounded-xl bg-plum hover:bg-plum-dark text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
            >
              <span>Continue</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-plum to-empowerment-purple hover:opacity-95 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-105 disabled:opacity-50"
            >
              {loading ? (
                <span>Generating Intelligence...</span>
              ) : (
                <>
                  <Sparkles size={15} className="text-coral" />
                  <span>Generate AI Intelligence & Roadmap</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
