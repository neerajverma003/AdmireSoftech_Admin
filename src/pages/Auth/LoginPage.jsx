import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  RotateCw,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API_BASE_URL } from '../../api/client';
import Logo from '../../components/common/Logo';

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'forgot-password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password states
  const [forgotStep, setForgotStep] = useState(1); // 1 = Email, 2 = OTP & New Password
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  // Resend timer countdown
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      showToast({ title: 'Validation Error', message: 'Please enter your administrator email.', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP code');

      showToast({
        title: 'Verification Code Sent',
        message: data.message || `A 6-digit verification code was sent to ${email}`,
        type: 'success',
      });
      setForgotStep(2);
      setResendTimer(60);
    } catch (err) {
      showToast({ title: 'Request Failed', message: err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim() || !newPassword || !confirmNewPassword) {
      showToast({ title: 'Validation Error', message: 'Please enter OTP and your new password.', type: 'error' });
      return;
    }

    if (otp.trim().length < 6) {
      showToast({ title: 'Validation Error', message: 'Please enter the 6-digit OTP code.', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      showToast({ title: 'Validation Error', message: 'Password must be at least 6 characters long.', type: 'error' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast({ title: 'Validation Error', message: 'Passwords do not match.', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password');

      showToast({
        title: 'Password Updated',
        message: 'Your administrator password was reset successfully. Please sign in.',
        type: 'success',
      });
      setMode('login');
      setPassword('');
      setForgotStep(1);
    } catch (err) {
      showToast({ title: 'Reset Failed', message: err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === 'forgot-password') {
      if (forgotStep === 1) {
        handleSendOtp(e);
      } else {
        handleResetPassword(e);
      }
      return;
    }

    if (!email.trim() || !password) {
      showToast({ title: 'Validation Error', message: 'Please enter both email and password.', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      showToast({ title: 'Welcome Back', message: 'Authenticated successfully.', type: 'success' });
      navigate('/');
    } catch (err) {
      showToast({ title: 'Authentication Failed', message: err.message || 'Invalid email or password.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060b18] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden selection:bg-cyan-500 selection:text-white">
      {/* Background Cyber Ambient Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-tl from-purple-500/20 via-blue-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-[#091024]/90 border border-cyan-500/20 p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl space-y-6">
        {/* Official Admire Softech Logo Branding */}
        <div className="flex flex-col items-center text-center space-y-2 pb-2">
          <Logo variant="full" size="lg" />
          <p className="text-xs text-slate-400 font-medium pt-1">
            {mode === 'forgot-password'
              ? forgotStep === 1
                ? 'Administrator Password Recovery'
                : 'Enter OTP Verification Code'
              : 'Enterprise Admin & Infrastructure Control Center'}
          </p>
        </div>

        {mode === 'forgot-password' && (
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setForgotStep(1);
              }}
              className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
            <span className="text-slate-500 font-medium">Step {forgotStep} of 2</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'forgot-password' ? (
            forgotStep === 1 ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Registered Administrator Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@admiresoftech.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#060b18] border border-slate-700 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send 6-Digit OTP Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-semibold">6-Digit Verification Code</label>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={resendTimer > 0 || isLoading}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 disabled:text-slate-500 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 482910"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#060b18] border border-slate-700 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all tracking-widest font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#060b18] border border-slate-700 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#060b18] border border-slate-700 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-60 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset & Save Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </>
            )
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Administrator Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@admiresoftech.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#060b18] border border-slate-700 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold">Access Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot-password')}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#060b18] border border-slate-700 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}
        </form>

        {/* Security Footer Note */}
        <div className="flex items-center justify-center gap-1.5 pt-3 text-[11px] text-slate-500 border-t border-slate-800/80">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Restricted to Authorized Admire Softech Administrators</span>
        </div>
      </div>
    </div>
  );
}
