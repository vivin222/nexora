import React, { useState } from 'react';
import { X, Lock, Mail, User, ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../../api/client';
import { UserResponse } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'forgot';
  onClose: () => void;
  onSuccess: (user: UserResponse, onboardingCompleted: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email.trim(), password);
        localStorage.setItem('nexora_token', res.token);
        onSuccess(res.user, res.onboarding_completed);
        onClose();
      } else if (mode === 'register') {
        const res = await api.register(email.trim(), password, fullName.trim(), headline.trim());
        localStorage.setItem('nexora_token', res.token);
        onSuccess(res.user, false); // New users go to onboarding
        onClose();
      } else if (mode === 'forgot') {
        const res = await api.forgotPassword(email.trim());
        setSuccessMsg(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0B0F12] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(53,217,242,0.12)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#35D9F2]/20 border border-[#35D9F2]/40 flex items-center justify-center font-bold text-[#35D9F2] text-xs font-mono">
              N
            </div>
            <Badge variant="cyan" size="sm">NEXORA IDENTITY</Badge>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {mode === 'login' && 'Sign in to NEXORA'}
            {mode === 'register' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
          </h2>
          <p className="text-xs text-[#929CA3] mt-1">
            {mode === 'login' && 'Access your personalized learning roadmap and verified skill graph.'}
            {mode === 'register' && 'Begin your customized AI career intelligence journey.'}
            {mode === 'forgot' && 'Enter your registered email to receive a recovery link.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 bg-[#11171B] p-1 rounded-xl mb-6 border border-white/5 text-xs font-medium">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'login' ? 'bg-[#161D22] text-[#35D9F2] shadow-sm font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'register' ? 'bg-[#161D22] text-[#35D9F2] shadow-sm font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#C5F45B]/10 border border-[#C5F45B]/30 text-xs text-[#C5F45B]">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">FULL NAME *</label>
                <div className="flex items-center gap-2 bg-[#11171B] border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-[#35D9F2]">
                  <User className="w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="bg-transparent flex-1 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">HEADLINE / SPECIALIZATION</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science Student | Aspiring Backend Engineer"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  className="w-full bg-[#11171B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#35D9F2]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">EMAIL ADDRESS *</label>
            <div className="flex items-center gap-2 bg-[#11171B] border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-[#35D9F2]">
              <Mail className="w-4 h-4 text-zinc-400" />
              <input
                type="email"
                required
                placeholder="learner@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-transparent flex-1 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono text-zinc-400">PASSWORD *</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); }}
                    className="text-[11px] text-[#35D9F2] hover:underline font-mono"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 bg-[#11171B] border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-[#35D9F2]">
                <Lock className="w-4 h-4 text-zinc-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-transparent flex-1 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            size="md"
            className="w-full mt-2"
            icon={loading ? undefined : <ArrowRight className="w-4 h-4" />}
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account & Start' : 'Send Reset Link'}
          </Button>

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className="w-full text-center text-xs text-zinc-400 hover:text-white pt-2 font-mono"
            >
              ← Back to Sign In
            </button>
          )}
        </form>
      </div>
    </div>
  );
};