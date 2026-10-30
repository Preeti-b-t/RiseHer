import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Landmark,
  Users,
  Target,
  FileText,
  TrendingUp,
  CheckCircle,
  ExternalLink,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';
import { InspirationSection } from '../components/InspirationSection';

interface LandingPageProps {
  onNavigate?: (path: string) => void;
  onStartOnboarding?: () => void;
  onExploreDashboard?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onStartOnboarding,
  onExploreDashboard
}) => {
  const { switchPersona } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleGoToLogin = () => {
    if (onNavigate) {
      onNavigate('/login');
    } else {
      setAuthMode('login');
      setShowAuthModal(true);
    }
  };

  const handleGoToRegister = () => {
    if (onNavigate) {
      onNavigate('/register');
    } else if (onStartOnboarding) {
      onStartOnboarding();
    } else {
      setAuthMode('register');
      setShowAuthModal(true);
    }
  };

  const handleGoToDemo = async (email: string) => {
    await switchPersona(email);
    if (onNavigate) {
      onNavigate('/dashboard');
    } else if (onExploreDashboard) {
      onExploreDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-cream text-charcoal flex flex-col font-sans">
      {/* Top Banner Navigation */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-plum/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-coral to-empowerment-purple flex items-center justify-center shadow-md">
            <span className="text-xl font-extrabold text-white font-heading">R</span>
          </div>
          <div>
            <span className="text-xl font-bold font-heading text-plum">RiseHer</span>
            <span className="text-xs text-charcoal-muted block">AI Entrepreneurship Intelligence</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleGoToLogin}
            className="text-xs sm:text-sm font-semibold text-plum hover:text-empowerment-purple px-2 sm:px-3 py-2 transition-colors flex items-center gap-1"
          >
            <Lock size={13} />
            <span>Login</span>
          </button>
          <button
            onClick={() => handleGoToDemo('priya@riseher.org')}
            className="hidden sm:inline-block text-xs sm:text-sm font-semibold text-plum hover:text-empowerment-purple px-3 py-2 transition-colors"
          >
            Explore Live Demo
          </button>
          <button
            onClick={handleGoToRegister}
            className="px-4 py-2 rounded-xl bg-plum hover:bg-plum-dark text-white text-xs sm:text-sm font-semibold shadow-md transition-all hover:scale-105"
          >
            Start Your Business Journey
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-16 lg:py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blush text-plum text-xs font-semibold tracking-wide">
              <Sparkles size={14} className="text-coral" />
              <span>AI-Powered Decision Support For Women Founders</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal font-heading leading-tight">
              Your Idea. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-plum via-empowerment-purple to-coral">
                Your Ambition.
              </span> <br />
              Your Business Journey.
            </h1>

            <p className="text-base sm:text-lg text-charcoal-light leading-relaxed max-w-xl">
              An AI-powered platform that helps women transform business ideas into opportunities through personalized business intelligence, mentorship, government support and actionable guidance.
            </p>

            {/* Two Prominent Action Buttons Above The Fold */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={handleGoToLogin}
                className="px-6 py-3.5 rounded-xl bg-white border-2 border-plum text-plum hover:bg-blush font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:translate-y-[-1px]"
              >
                <Lock size={15} />
                <span>Login</span>
              </button>

              <button
                onClick={handleGoToRegister}
                className="px-6 py-3.5 rounded-xl bg-plum hover:bg-plum-dark text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:translate-y-[-2px]"
              >
                <span>Start Your Business Journey</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="pt-2 text-xs font-medium text-charcoal-muted flex items-center gap-2">
              <CheckCircle size={14} className="text-success" />
              <span>AI-powered guidance. Real entrepreneurial experience. Opportunities that matter.</span>
            </div>
          </div>

          {/* Right Hero Column: Real Women Entrepreneur Hero Photographic Showcase + Floating Cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md">
              {/* Main Authentic Photograph of Real Women Entrepreneurs */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-blush">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
                  alt="Real Indian Women Entrepreneurs collaborating and building a business"
                  className="w-full h-full object-cover object-top"
                  loading="eager"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs uppercase tracking-wider font-semibold text-coral-light">Women Founders in India</p>
                  <p className="text-sm font-bold font-heading">Empowering local enterprise to global scale</p>
                </div>
              </div>

              {/* Floating Card 1: Business Opportunity Score */}
              <div className="absolute -top-4 -left-6 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-plum/10 flex items-center gap-3 animate-in fade-in duration-500 card-shadow">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-empowerment-purple flex items-center justify-center font-bold text-sm">
                  88%
                </div>
                <div>
                  <p className="text-[11px] font-bold text-charcoal">Business Opportunity Score</p>
                  <p className="text-[10px] text-success font-medium">High Viability • Sustainable D2C</p>
                </div>
              </div>

              {/* Floating Card 2: 3 Recommended Mentors */}
              <div className="absolute top-1/2 -right-6 transform -translate-y-1/2 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-plum/10 flex items-center gap-3 card-shadow">
                <div className="flex -space-x-2">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80"
                    alt="Mentor"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80"
                    alt="Mentor"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=100&q=80"
                    alt="Mentor"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-charcoal">3 Recommended Mentors</p>
                  <p className="text-[10px] text-empowerment-purple font-medium">Domain-matched founders</p>
                </div>
              </div>

              {/* Floating Card 3: 5 Relevant Support Opportunities */}
              <div className="absolute -bottom-6 left-8 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-plum/10 flex items-center gap-3 card-shadow">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-coral flex items-center justify-center">
                  <Landmark size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-charcoal">5 Support Opportunities</p>
                  <p className="text-[10px] text-charcoal-muted">PMEGP, MUDRA, Udyam & WEP</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REAL WOMEN ENTREPRENEURS INSPIRATION SECTION (WEP-INSPIRED) */}
      <section className="py-10 px-6 max-w-7xl mx-auto w-full">
        <InspirationSection
          title="She Believed. She Built. She Inspires."
          subtitle="Behind every successful business is a woman who dared to take the first step. Let their journeys inspire yours."
          badgeText="Pioneering Women Founders • WEP Ecosystem"
          className="mb-4"
        />
      </section>

      {/* CORE DIFFERENTIATOR STATEMENT */}
      <section className="bg-plum text-white py-12 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="text-xs uppercase tracking-widest text-coral font-bold font-heading">
            The RiseHer Intelligence Principle
          </p>
          <blockquote className="text-xl sm:text-2xl font-medium italic font-heading leading-relaxed">
            "Take her idea, skills, interests, and location. Give structured viability feedback, match mentors, resources, and grants, and guide a practical business-plan workflow. AI should personalize and prioritize, not just motivate."
          </blockquote>
          <p className="text-sm text-white/70">
            No generic platitudes like "follow your dreams". Real evidence, explicit assumptions, and what-to-do-next steps.
          </p>
        </div>
      </section>

      {/* THREE DEMO SCENARIOS SHOWCASE */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-charcoal">
            Explorable Real-World Scenarios
          </h2>
          <p className="text-sm text-charcoal-muted max-w-2xl mx-auto">
            Experience how RiseHer dynamically adapts its AI recommendations across stages, domains, budgets, and geographies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Scenario 1 */}
          <div className="bg-white rounded-3xl p-6 border border-plum/10 card-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blush text-plum">
                  Scenario 1 • Idea Stage
                </span>
                <span className="text-xs font-medium text-charcoal-muted">Bangalore Rural</span>
              </div>
              <h3 className="text-lg font-bold font-heading text-charcoal">Online Artisanal Boutique</h3>
              <p className="text-xs text-charcoal-light leading-relaxed">
                Priya has fashion-design talent and ₹50k savings. RiseHer validates customer demand, flags working capital runway, recommends MUDRA Shishu credit, and matches her with Kavita Rao (e-commerce founder).
              </p>
            </div>
            <button
              onClick={() => handleGoToDemo('priya@riseher.org')}
              className="mt-6 w-full py-2.5 rounded-xl bg-plum text-white text-xs font-semibold hover:bg-plum-dark transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore Priya's Workspace</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Scenario 2 */}
          <div className="bg-white rounded-3xl p-6 border border-plum/10 card-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-orange-50 text-coral-dark">
                  Scenario 2 • Early Business
                </span>
                <span className="text-xs font-medium text-charcoal-muted">Mysore Urban</span>
              </div>
              <h3 className="text-lg font-bold font-heading text-charcoal">Bakery & Café Studio Expansion</h3>
              <p className="text-xs text-charcoal-light leading-relaxed">
                Ananya runs a home bakery generating ₹45k/mo and wants to lease a commercial kitchen. RiseHer audits capex risk, structures FSSAI compliance, and guides a 7-week expansion roadmap.
              </p>
            </div>
            <button
              onClick={() => handleGoToDemo('ananya@riseher.org')}
              className="mt-6 w-full py-2.5 rounded-xl bg-empowerment-purple text-white text-xs font-semibold hover:bg-empowerment-purple-dark transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore Ananya's Workspace</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Scenario 3 */}
          <div className="bg-white rounded-3xl p-6 border border-plum/10 card-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-success">
                  Scenario 3 • Validation Stage
                </span>
                <span className="text-xs font-medium text-charcoal-muted">Belgaum Rural</span>
              </div>
              <h3 className="text-lg font-bold font-heading text-charcoal">Solar Millet & Oil Collective</h3>
              <p className="text-xs text-charcoal-light leading-relaxed">
                Sunita leads a village self-help group. RiseHer identifies NABARD and PMEGP 35% rural subsidies, connects her with agri-scientist Dr. Meera Reddy, and structures village-level packaging.
              </p>
            </div>
            <button
              onClick={() => handleGoToDemo('sunita@riseher.org')}
              className="mt-6 w-full py-2.5 rounded-xl bg-success text-white text-xs font-semibold hover:bg-success-dark transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore Sunita's Workspace</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-charcoal text-white/80 py-10 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-heading text-sm">RiseHer</span>
            <span>• Empowering Indian Women Entrepreneurs with AI Intelligence</span>
          </div>
          <p className="text-white/60">
            Official Data Reference: PMEGP, MUDRA, Stand-Up India, Startup India, Udyam MSME & WEP NITI Aayog.
          </p>
        </div>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onSuccess={onExploreDashboard}
      />
    </div>
  );
};
