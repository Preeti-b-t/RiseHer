import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Mail,
  Phone
} from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';

interface VerifyOtpViewProps {
  onNavigate: (path: string) => void;
}

export const VerifyOtpView: React.FC<VerifyOtpViewProps> = ({ onNavigate }) => {
  const { setSession } = useAuth();
  
  // Read session target & purpose from sessionStorage
  const [target, setTarget] = useState<string>(() => sessionStorage.getItem('riseher_otp_target') || '');
  const [purpose, setPurpose] = useState<string>(() => sessionStorage.getItem('riseher_otp_purpose') || 'login');

  // 6-digit pin array
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer & Attempt state
  const [countdown, setCountdown] = useState<number>(60);
  const [attempts, setAttempts] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('riseher_dev_otp');
    } catch {
      return null;
    }
  });

  // Countdown effect
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const handleDigitChange = (index: number, value: string) => {
    const char = value.slice(-1).replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || !target) return;
    setError(null);
    setResending(true);
    try {
      const res = await api.sendOTP(target, purpose as any);
      setCountdown(60);
      setAttempts(0);
      if (res.dev_otp) {
        setDevOtp(res.dev_otp);
        sessionStorage.setItem('riseher_dev_otp', res.dev_otp);
      }
      setInfoMessage(res.message || 'OTP sent successfully.');
      setTimeout(() => setInfoMessage(null), 6000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = otpDigits.join('');

    if (code.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (attempts >= 5) {
      setError('Too many attempts. Maximum attempts exceeded (5/5). Please request a new verification code.');
      return;
    }

    setLoading(true);
    try {
      if (purpose === 'registration') {
        const rawPending = sessionStorage.getItem('riseher_pending_registration');
        if (!rawPending) {
          throw new Error('Registration session expired. Please fill out the registration form again.');
        }
        const pending = JSON.parse(rawPending);

        const res = await api.registerWithOTP({
          email: pending.email,
          phone: pending.mobile,
          password: pending.password,
          full_name: pending.fullName,
          otp_code: code,
          role: 'entrepreneur'
        });

        // Clear transient registration storage
        sessionStorage.removeItem('riseher_pending_registration');
        sessionStorage.removeItem('riseher_otp_target');
        sessionStorage.removeItem('riseher_otp_purpose');

        await setSession(res.access_token, res.user);
        onNavigate('/dashboard');
      } else if (purpose === 'login') {
        const res = await api.loginWithOTP(target, code);

        sessionStorage.removeItem('riseher_otp_target');
        sessionStorage.removeItem('riseher_otp_purpose');

        await setSession(res.access_token, res.user);
        onNavigate('/dashboard');
      } else if (purpose === 'password_reset') {
        sessionStorage.setItem('riseher_reset_verified_code', code);
        onNavigate('/forgot-password');
      }
    } catch (err: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      const remaining = Math.max(0, 5 - newAttempts);
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        (remaining === 0 ? 'Too many attempts. Please request a new OTP.' : `Incorrect OTP. ${remaining} attempt(s) remaining.`)
      );
    } finally {
      setLoading(false);
    }
  };

  const isEmail = target.includes('@');
  const maskedTarget = target
    ? isEmail
      ? target.split('@')[0].slice(0, 2) + '***@' + target.split('@')[1]
      : (target.length <= 6 ? target : `${target.slice(0, 3)}****${target.slice(-3)}`)
    : 'your registered address';

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
          Enter Verification Code
        </h2>
        <p className="mt-2 text-sm text-charcoal-light flex items-center justify-center gap-1.5">
          {isEmail ? <Mail size={15} className="text-plum shrink-0" /> : <Phone size={15} className="text-plum shrink-0" />}
          <span>
            We sent a 6-digit OTP code to <strong className="text-plum font-bold">{maskedTarget}</strong>
          </span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-plum/10 sm:px-10">
          {/* Back button */}
          <button
            onClick={() => onNavigate(purpose === 'registration' ? '/register' : '/login')}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-muted hover:text-plum transition-colors"
          >
            <ArrowLeft size={14} />
            <span>{purpose === 'registration' ? 'Back to registration' : 'Back to login'}</span>
          </button>

          {infoMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span className="font-medium">{infoMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {devOtp && (
            <div className="mb-5 p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200/80 text-purple-900 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🧪</span>
                <div>
                  <div className="font-bold text-plum">Development Mode Active</div>
                  <div className="text-charcoal-light">Your OTP is: <strong className="font-mono text-plum text-sm tracking-wider">{devOtp}</strong></div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const chars = devOtp.split('').slice(0, 6);
                  setOtpDigits(chars);
                }}
                className="text-xs bg-plum hover:bg-plum-dark text-white font-bold py-1.5 px-3 rounded-xl shadow-xs transition-colors shrink-0"
              >
                Auto-fill
              </button>
            </div>
          )}

          <form onSubmit={handleVerifySubmit} className="space-y-6">
            {/* 6 Digit Input Boxes */}
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-3 text-center">
                6-Digit Security Code
              </label>
              <div className="flex justify-between gap-2" onPaste={handlePaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-14 sm:w-12 sm:h-14 text-center font-bold text-xl text-charcoal border-2 border-plum/20 rounded-xl focus:border-plum focus:ring-2 focus:ring-plum/20 focus:outline-hidden transition-all bg-cream/30"
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-xs mt-3 text-charcoal-muted">
                <span>Attempts: {attempts}/5</span>
                <span>Code validity: 5 minutes</span>
              </div>
            </div>

            {/* Countdown & Resend Button */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-cream/50 border border-plum/10 text-xs">
              <div className="flex items-center gap-1.5 text-charcoal-light">
                <RotateCcw size={13} className={resending ? 'animate-spin' : ''} />
                <span>
                  {countdown > 0 ? (
                    <>Resend in <strong className="text-plum font-bold">{countdown}s</strong></>
                  ) : (
                    'Ready to resend'
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0 || resending}
                className="font-bold text-plum hover:text-empowerment-purple disabled:text-charcoal-muted/50 disabled:cursor-not-allowed transition-colors"
              >
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>

            {/* Submit Verification */}
            <button
              type="submit"
              disabled={loading || otpDigits.join('').length < 6 || attempts >= 5}
              className="w-full py-3.5 px-4 rounded-xl bg-plum hover:bg-plum-dark disabled:bg-plum/40 text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 hover:translate-y-[-1px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify Code & Continue</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center text-xs text-charcoal-muted flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-success" />
          <span>SHA-256 Hashed • Time-based One-Time Token (5 min expiry)</span>
        </div>
      </div>
    </div>
  );
};
