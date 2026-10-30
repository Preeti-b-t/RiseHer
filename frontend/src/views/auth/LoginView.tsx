import React, { useState } from 'react';
import {
  Lock,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Users,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';

interface LoginViewProps {
  onNavigate: (path: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate }) => {
  const { login, switchPersona } = useAuth();
  const [authMode, setAuthMode] = useState<'mobile' | 'email'>('mobile');
  
  // Contact (Email or Mobile) + OTP Form State
  const [otpContact, setOtpContact] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  
  // Email + Password Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  // Status & Feedback
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanTarget = otpContact.trim();
    if (!cleanTarget || cleanTarget.length < 4) {
      setError('Please enter your registered mobile number or email address.');
      return;
    }

    setOtpSending(true);
    try {
      const res = await api.sendOTP(cleanTarget, 'login');
      // Store in sessionStorage so VerifyOtpView picks it up
      sessionStorage.setItem('riseher_otp_target', cleanTarget);
      sessionStorage.setItem('riseher_otp_purpose', 'login');
      if (res.dev_otp) {
        sessionStorage.setItem('riseher_dev_otp', res.dev_otp);
      } else {
        sessionStorage.removeItem('riseher_dev_otp');
      }
      onNavigate('/verify-otp');
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setEmailSubmitting(true);
    try {
      await login(email.trim(), password);
      onNavigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Invalid credentials. Please verify your email & password.');
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handleQuickPersona = async (personaEmail: string) => {
    setError(null);
    try {
      await switchPersona(personaEmail);
      onNavigate('/dashboard');
    } catch (err: any) {
      setError('Could not switch to demo persona.');
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Brand Bar */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-3 group focus:outline-hidden"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-coral to-empowerment-purple flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <span className="text-2xl font-extrabold text-white font-heading">R</span>
          </div>
          <div className="text-left">
            <span className="text-2xl font-black font-heading text-plum block tracking-tight">RiseHer</span>
            <span className="text-xs text-charcoal-muted block font-medium">AI Entrepreneurship Intelligence</span>
          </div>
        </button>

        <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold font-heading text-charcoal">
          Welcome to Your Venture Hub
        </h2>
        <p className="mt-2 text-sm text-charcoal-light">
          Sign in to access personalized business viability, grants, and mentors.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-plum/10 sm:px-10">
          {/* Dual Login Mode Tabs */}
          <div className="flex rounded-xl bg-blush/60 p-1 mb-6 border border-plum/10">
            <button
              type="button"
              onClick={() => {
                setAuthMode('mobile');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                authMode === 'mobile'
                  ? 'bg-plum text-white shadow-sm'
                  : 'text-plum hover:text-empowerment-purple'
              }`}
            >
              <Phone size={14} />
              <span>Mobile / Email + OTP</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('email');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                authMode === 'email'
                  ? 'bg-plum text-white shadow-sm'
                  : 'text-plum hover:text-empowerment-purple'
              }`}
            >
              <Mail size={14} />
              <span>Email & Password</span>
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {authMode === 'mobile' ? (
            /* MOBILE OR EMAIL + OTP FORM */
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                  Registered Mobile Number or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-muted">
                    {otpContact.includes('@') ? <Mail size={16} /> : <Phone size={16} />}
                  </div>
                  <input
                    type="text"
                    value={otpContact}
                    onChange={(e) => setOtpContact(e.target.value)}
                    placeholder="e.g. 9876543210 or priya@riseher.org"
                    required
                    className="block w-full pl-10 pr-3.5 py-3 border border-plum/20 rounded-xl text-charcoal placeholder-charcoal-muted/60 focus:outline-hidden focus:ring-2 focus:ring-plum focus:border-transparent text-sm"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-charcoal-muted">
                  We will send a 6-digit verification code to this registered contact.
                </p>
              </div>

              <button
                type="submit"
                disabled={otpSending || !otpContact.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-plum hover:bg-plum-dark disabled:bg-plum/40 text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 hover:translate-y-[-1px]"
              >
                {otpSending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* EMAIL + PASSWORD FORM */
            <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-charcoal-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya@riseher.org"
                    required
                    className="block w-full pl-10 pr-3.5 py-3 border border-plum/20 rounded-xl text-charcoal placeholder-charcoal-muted/60 focus:outline-hidden focus:ring-2 focus:ring-plum focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-charcoal-muted" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="block w-full pl-10 pr-3.5 py-3 border border-plum/20 rounded-xl text-charcoal placeholder-charcoal-muted/60 focus:outline-hidden focus:ring-2 focus:ring-plum focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded-sm border-plum/30 text-plum focus:ring-plum"
                  />
                  <span className="text-charcoal-light">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate('/forgot-password')}
                  className="font-semibold text-plum hover:text-empowerment-purple transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={emailSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-plum hover:bg-plum-dark disabled:bg-plum/40 text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 hover:translate-y-[-1px]"
              >
                {emailSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Registration Navigation */}
          <div className="mt-6 pt-5 border-t border-plum/10 text-center">
            <p className="text-xs text-charcoal-light">
              Don't have a RiseHer account yet?{' '}
              <button
                type="button"
                onClick={() => onNavigate('/register')}
                className="font-bold text-coral hover:text-coral-dark ml-1 underline decoration-2 underline-offset-2 transition-colors"
              >
                Start Your Business Journey
              </button>
            </p>
          </div>

          {/* Fast Switcher for Hackathon Judges & Evaluators */}
          <div className="mt-6 p-4 rounded-2xl bg-blush/40 border border-plum/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-plum flex items-center gap-1.5">
                <Sparkles size={12} className="text-coral" />
                <span>One-Click Evaluator Personas</span>
              </span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded-full text-plum font-semibold border border-plum/15">
                Instant Access
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <button
                type="button"
                onClick={() => handleQuickPersona('priya@riseher.org')}
                className="py-1.5 px-2 rounded-lg bg-white border border-plum/15 hover:border-plum text-[11px] font-bold text-charcoal hover:text-plum transition-all shadow-xs"
              >
                Priya (Idea)
              </button>
              <button
                type="button"
                onClick={() => handleQuickPersona('ananya@riseher.org')}
                className="py-1.5 px-2 rounded-lg bg-white border border-plum/15 hover:border-plum text-[11px] font-bold text-charcoal hover:text-plum transition-all shadow-xs"
              >
                Ananya (Growth)
              </button>
              <button
                type="button"
                onClick={() => handleQuickPersona('sunita@riseher.org')}
                className="py-1.5 px-2 rounded-lg bg-white border border-plum/15 hover:border-plum text-[11px] font-bold text-charcoal hover:text-plum transition-all shadow-xs"
              >
                Sunita (Rural)
              </button>
            </div>
          </div>
        </div>

        {/* Security & WEP Alignment Note */}
        <div className="mt-6 text-center text-xs text-charcoal-muted flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-success" />
          <span>Encrypted Session • Official WEP & MSME Ecosystem Partner</span>
        </div>
      </div>
    </div>
  );
};
