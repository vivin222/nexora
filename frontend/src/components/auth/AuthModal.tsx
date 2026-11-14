import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, ShieldAlert, Eye, EyeOff, KeyRound } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setError('');
    setSuccessMsg('');
    setShowPassword(false);
  }, [initialMode, isOpen]);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const idToken = `mock_google_token_${Date.now()}`;
      const res = await api.googleLogin(idToken);
      localStorage.setItem('nexora_token', res.token);
      onSuccess(res.user, res.onboarding_completed);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const code = `mock_github_code_${Date.now()}`;
      const res = await api.githubLogin(code);
      localStorage.setItem('nexora_token', res.token);
      onSuccess(res.user, res.onboarding_completed);
      onClose();
    } catch (err: any) {
      setError(err.message || 'GitHub authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleJuryQuickLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.juryLogin();
      localStorage.setItem('nexora_token', res.token);
      onSuccess(res.user, true);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Jury evaluation authentication failed.');
    } finally {
      setLoading(false);
    }
  };

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
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-transparent flex-1 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-500 hover:text-white p-0.5 rounded transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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

          {/* Social Sign-In Options */}
          {(mode === 'login' || mode === 'register') && (
            <div className="pt-2">
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-mono">
                  <span className="bg-[#0B0F12] px-2 text-zinc-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleSignIn}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#161D22] hover:bg-[#1E262C] border border-white/10 text-white text-xs font-medium transition-all hover:border-white/20 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z" />
                    <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.9C3.7 20.6 7.5 23.5 12 23.5z" />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGitHubSignIn}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#161D22] hover:bg-[#1E262C] border border-white/10 text-white text-xs font-medium transition-all hover:border-white/20 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>
            </div>
          )}

          {/* Jury Evaluation 1-Click Access in Admin Mode */}
          {mode === 'admin-login' && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs mt-3">
              <div className="flex items-center gap-2 mb-1.5 font-semibold text-amber-300">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Jury & Hackathon Evaluation Access</span>
              </div>
              <p className="text-[11px] text-zinc-300 mb-2.5 leading-relaxed">
                Evaluating NEXORA? One-click sign-in instantly provisions administrator evaluation privileges.
              </p>
              <button
                type="button"
                disabled={loading}
                onClick={handleJuryQuickLogin}
                className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>⚡ 1-Click Jury Admin Sign-In</span>
              </button>
            </div>
          )}

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
