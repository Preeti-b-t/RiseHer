import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { api, setAuthToken } from '../api';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess
}) => {
  const { switchPersona } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>(initialMode);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('otp');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot Password new password
  const [newPassword, setNewPassword] = useState('');

  // Countdown timer for resend
  useEffect(() => {
    let timer: any;
    if (otpSent && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [otpSent, countdown]);

  if (!isOpen) return null;

  const resetOtpState = () => {
    setOtpSent(false);
    setOtpCode(['', '', '', '', '', '']);
    setCountdown(60);
    setCanResend(false);
    setDevOtpHint(null);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleOtpBoxChange = (val: string, index: number) => {
    if (val.length > 1) {
      // Handle paste of full 6 digit string
      const pastedDigits = val.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otpCode];
      pastedDigits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtpCode(newOtp);
      const nextInput = document.getElementById(`otp-input-5`);
      nextInput?.focus();
      return;
    }

    const digit = val.replace(/\D/g, '');
    const newOtp = [...otpCode];
    newOtp[index] = digit;
    setOtpCode(newOtp);

    // Auto-advance
    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSendOtp = async (purpose: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const target = mode === 'register' ? (phone.trim() || email.trim()) : (phone.trim() || email.trim());

    if (!target) {
      setErrorMsg('Please enter your mobile number or email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendOTP(target, purpose);
      setOtpSent(true);
      setCountdown(60);
      setCanResend(false);
      setSuccessMsg(res.message);
      if (res.dev_otp) {
        setDevOtpHint(res.dev_otp);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillDevOtp = () => {
    if (devOtpHint && devOtpHint.length === 6) {
      setOtpCode(devOtpHint.split(''));
    }
  };

  // Submit Registration with OTP
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const fullCode = otpCode.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    if (!termsAccepted) {
      setErrorMsg('Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.registerWithOTP({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        otp_code: fullCode,
        role: 'entrepreneur',
        terms_accepted: true
      });
      setAuthToken(res.access_token);
      window.location.reload();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
      setAttemptsRemaining((prev) => Math.max(0, prev - 1));
    } finally {
      setLoading(false);
    }
  };

  // Submit Login with Password
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await api.login({ email: email.trim(), password });
      setAuthToken(res.access_token);
      window.location.reload();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Login with OTP
  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const fullCode = otpCode.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.loginWithOTP(phone.trim() || email.trim(), fullCode);
      setAuthToken(res.access_token);
      window.location.reload();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid OTP code.');
      setAttemptsRemaining((prev) => Math.max(0, prev - 1));
    } finally {
      setLoading(false);
    }
  };

  // Submit Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const fullCode = otpCode.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter the 6-digit reset code.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPasswordReset(phone.trim() || email.trim(), fullCode, newPassword);
      setSuccessMsg(res.message);
      setTimeout(() => {
        setMode('login');
        resetOtpState();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-dark/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-subtle/20 overflow-hidden my-6">
        {/* Modal Top Header */}
        <div className="relative p-6 bg-gradient-to-br from-primary via-primary-dark to-[#381640] text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold text-white">
                {mode === 'register' && 'Create Your RiseHer Account'}
                {mode === 'login' && 'Welcome Back to RiseHer'}
                {mode === 'forgot_password' && 'Reset Your Password'}
              </h3>
              <p className="text-xs text-white/80">
                {mode === 'register' && 'Empower your venture with AI decision intelligence'}
                {mode === 'login' && 'Access your business plan, grants & mentors'}
                {mode === 'forgot_password' && 'Enter your contact info to receive a verification OTP'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Global Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Global Success Banner */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Hackathon Dev OTP Helper Banner */}
          {devOtpHint && otpSent && (
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
              <div className="text-xs">
                <span className="font-semibold text-primary block">Test Mode Auto-Generated OTP:</span>
                <span className="font-mono text-base font-bold text-neutral-dark tracking-wider">{devOtpHint}</span>
              </div>
              <button
                type="button"
                onClick={handleAutofillDevOtp}
                className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-xs"
              >
                Autofill
              </button>
            </div>
          )}

          {/* ================= REGISTER VIEW ================= */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-dark mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-neutral-subtle" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-subtle/30 text-xs focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-dark mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-subtle" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="founder@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-subtle/30 text-xs focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-dark mb-1">Mobile Number</label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-neutral-subtle" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-subtle/30 text-xs focus:border-primary"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendOtp('registration')}
                    disabled={loading || (otpSent && !canResend)}
                    className="px-3 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shrink-0 disabled:opacity-50"
                  >
                    {otpSent ? (canResend ? 'Resend' : `${countdown}s`) : 'Send OTP'}
                  </button>
                </div>
              </div>

              {/* 6-Digit OTP Box Grid */}
              {otpSent && (
                <div className="p-3.5 rounded-2xl bg-neutral-bg/60 border border-neutral-subtle/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-dark">Enter 6-Digit OTP</span>
                    <span className="text-[11px] text-neutral-subtle">{attemptsRemaining} attempts left</span>
                  </div>
                  <div className="flex justify-between gap-1.5">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpBoxChange(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        className="w-10 h-11 text-center font-mono text-base font-bold rounded-xl border border-neutral-subtle/30 bg-white focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-dark mb-1">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-subtle" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-subtle/30 text-xs focus:border-primary"
                    required
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 text-xs text-neutral-subtle pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="rounded text-primary focus:ring-primary mt-0.5"
                />
                <span>I agree to the RiseHer Terms of Service and Privacy Policy</span>
              </label>

              <button
                type="submit"
                disabled={loading || !otpSent}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Verify OTP & Create Account</span>
              </button>

              <div className="text-center pt-2 border-t border-neutral-subtle/10 text-xs text-neutral-subtle">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    resetOtpState();
                  }}
                  className="text-primary font-bold hover:underline"
                >
                  Log In
                </button>
              </div>
            </form>
          )}

          {/* ================= LOGIN VIEW ================= */}
          {mode === 'login' && (
            <div className="space-y-4">
              {/* Login Method Toggle */}
              <div className="grid grid-cols-2 p-1 bg-neutral-bg rounded-xl border border-neutral-subtle/20 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('otp');
                    resetOtpState();
                  }}
                  className={`py-1.5 rounded-lg transition-all ${
                    loginMethod === 'otp' ? 'bg-white text-primary shadow-xs font-bold' : 'text-neutral-subtle'
                  }`}
                >
                  Mobile / OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('password');
                    resetOtpState();
                  }}
                  className={`py-1.5 rounded-lg transition-all ${
                    loginMethod === 'password' ? 'bg-white text-primary shadow-xs font-bold' : 'text-neutral-subtle'
                  }`}
                >
                  Password Login
                </button>
              </div>

              {/* Login Option 1: Mobile & OTP */}
              {loginMethod === 'otp' ? (
                <form onSubmit={handleOtpLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-dark mb-1">
                      Registered Mobile Number or Email
                    </label>
                    <div className="relative flex gap-2">
                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 absolute left-3 top-3 text-neutral-subtle" />
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 9876543210 or email"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-subtle/30 text-xs focus:border-primary"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSendOtp('login')}
                        disabled={loading || (otpSent && !canResend)}
                        className="px-3 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shrink-0 disabled:opacity-50"
                      >
                        {otpSent ? (canResend ? 'Resend' : `${countdown}s`) : 'Send OTP'}
                      </button>
                    </div>
                  </div>

                  {otpSent && (
                    <div className="p-3.5 rounded-2xl bg-neutral-bg/60 border border-neutral-subtle/20 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-dark">Enter 6-Digit Login OTP</span>
                        <span className="text-[11px] text-neutral-subtle">{attemptsRemaining} attempts left</span>
                      </div>
                      <div className="flex justify-between gap-1.5">
                        {otpCode.map((digit, idx) => (
                          <input
                            key={idx}
                            id={`otp-input-${idx}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpBoxChange(e.target.value, idx)}
                            onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                            className="w-10 h-11 text-center font-mono text-base font-bold rounded-xl border border-neutral-subtle/30 bg-white focus:border-primary shadow-xs"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !otpSent}
                    className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>Verify OTP & Log In</span>
                  </button>
                </form>
              ) : (
                /* Login Option 2: Email & Password */
                <form onSubmit={handlePasswordLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-dark mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-subtle" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="founder@example.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-subtle/30 text-xs focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-neutral-dark">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot_password');
                          resetOtpState();
                        }}
                        className="text-[11px] text-primary hover:underline font-semibold"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-subtle" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-subtle/30 text-xs focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    <span>Sign In With Password</span>
                  </button>
                </form>
              )}

              <div className="text-center pt-2 border-t border-neutral-subtle/10 text-xs text-neutral-subtle">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    resetOtpState();
                  }}
                  className="text-primary font-bold hover:underline"
                >
                  Register with Mobile OTP
                </button>
              </div>
            </div>
          )}

          {/* ================= FORGOT PASSWORD VIEW ================= */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  resetOtpState();
                }}
                className="inline-flex items-center gap-1 text-xs text-neutral-subtle hover:text-primary mb-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>

              <div>
                <label className="block text-xs font-semibold text-neutral-dark mb-1">
                  Registered Email or Mobile Number
                </label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-subtle" />
                    <input
                      type="text"
                      value={email || phone}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setPhone(e.target.value);
                      }}
                      placeholder="founder@example.com or phone"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-subtle/30 text-xs focus:border-primary"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendOtp('password_reset')}
                    disabled={loading || (otpSent && !canResend)}
                    className="px-3 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shrink-0 disabled:opacity-50"
                  >
                    {otpSent ? (canResend ? 'Resend' : `${countdown}s`) : 'Send Code'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <>
                  <div className="p-3.5 rounded-2xl bg-neutral-bg/60 border border-neutral-subtle/20 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-dark">Enter 6-Digit Reset Code</span>
                    </div>
                    <div className="flex justify-between gap-1.5">
                      {otpCode.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-input-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpBoxChange(e.target.value, idx)}
                          onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                          className="w-10 h-11 text-center font-mono text-base font-bold rounded-xl border border-neutral-subtle/30 bg-white focus:border-primary shadow-xs"
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-dark mb-1">New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-subtle" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-subtle/30 text-xs focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                    <span>Reset Password & Proceed</span>
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
