import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  Shield,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Logo from '../../components/common/Logo';

export default function LoginPage() {
  const { login, switchAccount } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@admiresoftech.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast({ title: 'Validation Error', message: 'Please enter both email and password.', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      showToast({ title: 'Welcome Back', message: 'Authenticated successfully.', type: 'success' });
      navigate('/');
    } catch (err) {
      showToast({ title: 'Authentication Failed', message: err.message || 'Invalid email or password.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (account) => {
    switchAccount(account);
    showToast({
      title: 'Demo Session Active',
      message: `Signed in as ${account.name} (${account.role})`,
      type: 'success',
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#060b18] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden selection:bg-cyan-500 selection:text-white">
      {/* Background Cyber Ambient Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-tl from-purple-500/20 via-blue-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-[#091024]/90 border border-cyan-500/20 p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl space-y-6">
        {/* Official Admire Softech Logo Branding */}
        <div className="flex flex-col items-center text-center space-y-2 pb-1">
          <Logo variant="full" size="lg" />
          <p className="text-xs text-slate-400 font-medium pt-1">
            Enterprise Admin & Infrastructure Control Center
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#060b18] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Access Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#060b18] border border-slate-700 text-slate-200 focus:border-cyan-500 focus:outline-none transition-all"
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
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Accounts */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <span>Quick Demo Logins (1-Click):</span>
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
          </div>

          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleDemoLogin(acc)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/30 text-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-7 h-7 rounded-full object-cover border border-cyan-500/40"
                  />
                  <div className="text-left">
                    <p className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">{acc.name}</p>
                    <p className="text-[10px] text-slate-400">{acc.role}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-cyan-400 group-hover:underline">
                  Login →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
