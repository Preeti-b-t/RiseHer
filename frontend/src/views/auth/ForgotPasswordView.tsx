import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { api } from '../../api';

interface ForgotPasswordViewProps {
  onNavigate: (path: string) => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [target, setTarget] = useState('');
  const [otpCode, setOtpCode] = useState(() => sessionStorage.getItem('riseher_reset_verified_code') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!target.trim() || target.trim().length < 4) {
      setError('Please enter a valid registered mobile number or email.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPasswordRequest(target.trim());
      if (res.dev_otp) {
        setDevOtp(res.dev_otp);
      }
      setStep('reset');
      setSuccessMsg(res.message || 'Password reset OTP has been sent.');
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Could not find an account with this mobile or email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otpCode.length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.forgotPasswordReset(target.trim(), otpCode.trim(), newPassword);

      sessionStorage.removeItem('riseher_reset_verified_code');
      setSuccessMsg('Your password has been successfully updated! Redirecting to login...');
      setTimeout(() => {
        onNavigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to reset password. Please check your verification code.');
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
          Reset Your Password
        </h2>
        <p className="mt-2 text-sm text-charcoal-light">
          {step === 'request'
            ? 'Enter your registered mobile or email to receive a secure recovery code.'
            : 'Enter the verification code and set a strong new password.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-plum/10 sm:px-10">
          <button
            onClick={() => onNavigate('/login')}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-muted hover:text-plum transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to sign in</span>
          </button>

          {devOtp && (
            <div className="mb-4 p-3 rounded-xl bg-blush/60 border border-plum/20 flex items-center justify-between text-xs">
              <span className="text-plum font-semibold">
                Dev OTP: <strong className="font-mono text-charcoal font-bold tracking-widest">{devOtp}</strong>
              </span>
              <button
                type="button"
                onClick={() => setOtpCode(devOtp)}
                className="px-2 py-0.5 rounded-md bg-plum text-white text-[10px] font-bold"
              >
                Auto-fill
              </button>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-success text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {step === 'request' ? (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                  Mobile Number or Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-charcoal-muted" />
                  <input
                    type="text"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="Mobile (+91...) or email address"
                    required
                    className="block w-full pl-10 pr-3.5 py-3 border border-plum/20 rounded-xl text-charcoal placeholder-charcoal-muted/60 focus:outline-hidden focus:ring-2 focus:ring-plum focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !target.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-plum hover:bg-plum-dark disabled:bg-plum/40 text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 hover:translate-y-[-1px]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Code</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  className="block w-full text-center font-mono font-bold tracking-widest text-lg px-3.5 py-2.5 border border-plum/20 rounded-xl text-charcoal focus:outline-hidden focus:ring-2 focus:ring-plum text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-charcoal-muted" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="block w-full pl-10 pr-3.5 py-3 border border-plum/20 rounded-xl text-charcoal placeholder-charcoal-muted/60 focus:outline-hidden focus:ring-2 focus:ring-plum text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-charcoal-muted" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    required
                    className="block w-full pl-10 pr-3.5 py-3 border border-plum/20 rounded-xl text-charcoal placeholder-charcoal-muted/60 focus:outline-hidden focus:ring-2 focus:ring-plum text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-plum hover:bg-plum-dark disabled:bg-plum/40 text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 hover:translate-y-[-1px]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Update Password & Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-charcoal-muted flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-success" />
          <span>Secure Identity Recovery Protocol</span>
        </div>
      </div>
    </div>
  );
};
