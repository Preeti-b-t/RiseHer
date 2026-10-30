import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../api';

interface RegisterViewProps {
  onNavigate: (path: string) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onNavigate }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [verifyMethod, setVerifyMethod] = useState<'mobile' | 'email'>('mobile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    const cleanMobile = mobile.trim();
    if (!cleanMobile || cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the RiseHer terms of service and privacy policy.');
      return;
    }

    setLoading(true);
    try {
      // 1. Dispatch OTP to the selected verification channel (mobile or email)
      const target = verifyMethod === 'mobile' ? cleanMobile : email.trim().toLowerCase();
      const otpRes = await api.sendOTP(target, 'registration');
      
      // 2. Persist registration payload into sessionStorage so VerifyOtpView can complete registerWithOTP
      const pendingData = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobile: cleanMobile,
        password: password,
        state: 'Karnataka'
      };
      sessionStorage.setItem('riseher_pending_registration', JSON.stringify(pendingData));
      sessionStorage.setItem('riseher_otp_target', target);
      sessionStorage.setItem('riseher_otp_purpose', 'registration');
      sessionStorage.setItem('riseher_verify_channel', verifyMethod);
      if (otpRes.dev_otp) {
        sessionStorage.setItem('riseher_dev_otp', otpRes.dev_otp);
      } else {
        sessionStorage.removeItem('riseher_dev_otp');
      }

      onNavigate('/verify-otp');
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Could not send verification OTP. An account may already exist with this mobile/email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
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
          Start Your Business Journey
        </h2>
        <p className="mt-2 text-sm text-charcoal-light">
          Join thousands of women turning ambitious concepts into viable businesses.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-plum/10 sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3.5 top-3.5 text-charcoal-muted" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Radhika Sharma"
                  required
                  className="block w-full pl-10 pr-3.5 py-3 border border-plum/20 rounded-xl text-charcoal placeholder-charcoal-muted/60 focus:outline-hidden focus:ring-2 focus:ring-plum focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Email Address */}
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
                  placeholder="radhika@example.com"
                  required
                  className="block w-full pl-10 pr-3.5 py-3 border border-plum/20 rounded-xl text-charcoal placeholder-charcoal-muted/60 focus:outline-hidden focus:ring-2 focus:ring-plum focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Mobile Number with +91 prefix */}
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-muted text-sm font-semibold border-r border-plum/10 pr-2.5 my-2">
                  +91
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  required
                  className="block w-full pl-16 pr-3.5 py-3 border border-plum/20 rounded-xl text-charcoal placeholder-charcoal-muted/60 focus:outline-hidden focus:ring-2 focus:ring-plum focus:border-transparent text-sm"
                />
              </div>
              <p className="mt-1 text-[11px] text-charcoal-muted">
                Required for OTP verification and government scheme registration alerts.
              </p>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-charcoal-muted" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="block w-full pl-10 pr-3.5 py-3 border border-plum/20 rounded-xl text-charcoal placeholder-charcoal-muted/60 focus:outline-hidden focus:ring-2 focus:ring-plum focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Verification Channel Selection */}
            <div className="p-3.5 rounded-2xl bg-blush/50 border border-plum/15 space-y-2">
              <label className="block text-[11px] font-bold text-plum uppercase tracking-wider">
                Send 6-Digit OTP Verification Code To:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${verifyMethod === 'mobile' ? 'bg-white border-plum text-plum shadow-xs' : 'border-plum/15 text-charcoal-muted hover:bg-white/50'}`}>
                  <input
                    type="radio"
                    name="verifyMethod"
                    value="mobile"
                    checked={verifyMethod === 'mobile'}
                    onChange={() => setVerifyMethod('mobile')}
                    className="text-plum focus:ring-plum"
                  />
                  <Phone size={14} className="text-coral shrink-0" />
                  <span className="truncate">Mobile (+91)</span>
                </label>
                <label className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${verifyMethod === 'email' ? 'bg-white border-plum text-plum shadow-xs' : 'border-plum/15 text-charcoal-muted hover:bg-white/50'}`}>
                  <input
                    type="radio"
                    name="verifyMethod"
                    value="email"
                    checked={verifyMethod === 'email'}
                    onChange={() => setVerifyMethod('email')}
                    className="text-plum focus:ring-plum"
                  />
                  <Mail size={14} className="text-empowerment-purple shrink-0" />
                  <span className="truncate">Email Address</span>
                </label>
              </div>
            </div>

            {/* Terms & Privacy */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded-sm border-plum/30 text-plum focus:ring-plum"
                />
                <span className="text-xs text-charcoal-light leading-relaxed">
                  I agree to the <span className="font-semibold text-plum underline">Terms of Service</span> and <span className="font-semibold text-plum underline">Privacy Policy</span>. I consent to receive OTP verification codes.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full py-3.5 px-4 rounded-xl bg-plum hover:bg-plum-dark disabled:bg-plum/40 text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 hover:translate-y-[-1px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send OTP & Continue</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Already have an account */}
          <div className="mt-6 pt-5 border-t border-plum/10 text-center">
            <p className="text-xs text-charcoal-light">
              Already have a RiseHer account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="font-bold text-plum hover:text-empowerment-purple ml-1 underline decoration-2 underline-offset-2 transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center text-xs text-charcoal-muted flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-success" />
          <span>Encrypted Account Registration • Privacy Compliant</span>
        </div>
      </div>
    </div>
  );
};
