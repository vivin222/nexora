import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { api } from '../../api/client';
import { UserResponse } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'forgot' | 'admin-login';
  onClose: () => void;
  onSuccess: (user: UserResponse, onboardingCompleted: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'admin-login'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [educationLevel, setEducationLevel] = useState('Undergraduate');
  const [institution, setInstitution] = useState('');
  const [department, setDepartment] = useState('');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setError('');
    setSuccessMsg('');
  }, [initialMode, isOpen]);

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
      } else if (mode === 'admin-login') {
        const res = await api.adminLogin(email.trim(), password);
        localStorage.setItem('nexora_token', res.token);
        onSuccess(res.user, true);
        onClose();
      } else if (mode === 'register') {
        // Free open registration -> active immediately
        const res = await api.register({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          headline: headline.trim() || `${educationLevel} in ${department || 'Engineering'}`,
          education_level: educationLevel,
          institution: institution.trim(),
          department: department.trim(),
          graduation_year: graduationYear.trim()
        });
        localStorage.setItem('nexora_token', res.token);
        onSuccess(res.user, false);
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
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs font-mono ${
              mode === 'admin-login' 
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' 
                : 'bg-[#35D9F2]/20 border border-[#35D9F2]/40 text-[#35D9F2]'
            }`}>
              {mode === 'admin-login' ? <ShieldCheck className="w-4 h-4" /> : 'N'}
            </div>
            <Badge variant={mode === 'admin-login' ? 'amber' : 'cyan'} size="sm">
              {mode === 'admin-login' ? 'ADMINISTRATOR AUTHENTICATION' : 'NEXORA CAREER PLATFORM'}
            </Badge>
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">
            {mode === 'login' && 'Sign in to NEXORA'}
            {mode === 'register' && 'Create Free Account'}
            {mode === 'admin-login' && 'Administrator Portal'}
            {mode === 'forgot' && 'Reset your password'}
          </h2>
          <p className="text-xs text-[#929CA3] mt-1">
            {mode === 'login' && 'Access your personalized adaptive learning roadmaps and AI Career Twin.'}
            {mode === 'register' && '100% Free student registration. Instant activation with zero approval required.'}
            {mode === 'admin-login' && 'Institutional platform monitoring, curriculum management, and audit logs.'}
            {mode === 'forgot' && 'Enter your registered email to receive a recovery link.'}
          </p>
        </div>

        {/* Student Mode Switcher Tabs */}
        {mode !== 'forgot' && mode !== 'admin-login' && (
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
              Free Registration
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">DEGREE PROGRAM</label>
                  <select
                    value={educationLevel}
                    onChange={e => setEducationLevel(e.target.value)}
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#35D9F2]"
                  >
                    <option value="Undergraduate">Undergraduate (B.Tech / BS)</option>
                    <option value="Postgraduate">Postgraduate (MS / M.Tech)</option>
                    <option value="Doctorate">Doctorate (PhD)</option>
                    <option value="Associate">Associate Degree</option>
                    <option value="Self-Taught">Self-Taught Professional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">GRADUATION YEAR</label>
                  <input
                    type="text"
                    placeholder="2026"
                    value={graduationYear}
                    onChange={e => setGraduationYear(e.target.value)}
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#35D9F2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">CAMPUS / UNIVERSITY</label>
                  <input
                    type="text"
                    placeholder="e.g. National Institute of Technology"
                    value={institution}
                    onChange={e => setInstitution(e.target.value)}
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#35D9F2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">DEPARTMENT</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#35D9F2]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">
              {mode === 'admin-login' ? 'ADMINISTRATOR EMAIL *' : 'EMAIL ADDRESS *'}
            </label>
            <div className="flex items-center gap-2 bg-[#11171B] border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-[#35D9F2]">
              <Mail className="w-4 h-4 text-zinc-400" />
              <input
                type="email"
                required
                placeholder={mode === 'admin-login' ? 'admin@nexora.ai' : 'learner@university.edu'}
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
            {loading 
              ? 'Authenticating...' 
              : mode === 'login' 
              ? 'Sign In to Workspace' 
              : mode === 'admin-login'
              ? 'Sign In as Administrator'
              : mode === 'register' 
              ? 'Create Free Account & Start' 
              : 'Send Reset Link'}
          </Button>

          {/* Admin Switcher Link in Student Mode */}
          {mode === 'login' && (
            <div className="pt-3 text-center border-t border-white/5 mt-4">
              <button
                type="button"
                onClick={() => { setMode('admin-login'); setError(''); setEmail(''); setPassword(''); }}
                className="text-xs text-zinc-400 hover:text-[#35D9F2] flex items-center justify-center gap-1.5 mx-auto font-mono transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#35D9F2]" />
                <span>Institution Administrator? Admin Portal Login →</span>
              </button>
            </div>
          )}

          {/* Return to Student Mode Link in Admin Mode */}
          {mode === 'admin-login' && (
            <div className="pt-3 text-center border-t border-white/5 mt-4">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setEmail(''); setPassword(''); }}
                className="text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto font-mono transition-colors cursor-pointer"
              >
                <span>← Return to Student Sign In</span>
              </button>
            </div>
          )}

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
