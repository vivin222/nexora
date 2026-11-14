import React from 'react';
import { 
  Target, 
  Compass, 
  Sparkles, 
  ClipboardCheck, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Zap,
  BookOpen,
  Code2,
  Mic2,
  FileSpreadsheet,
  Flame,
  Award,
  Calendar,
  Share2,
  Layers,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ProgressOverview, LearnerProfile } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface OverviewViewProps {
  progress: ProgressOverview | null;
  profile: LearnerProfile | null;
  onNavigateTab: (tab: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  progress,
  profile,
  onNavigateTab,
}) => {
  if (!progress) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 font-mono text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin" />
          <span>Calibrating learner intelligence graph...</span>
        </div>
      </div>
    );
  }

  const { career, chart_data } = progress;
  const streak = progress.learning_streak;
  const nextAction = progress.next_best_action || {
    task_title: `Advance Priority Competency for ${career.title}`,
    focus_skill: career.top_blockers?.[0] || 'Core Architecture',
    direct_rationale: `Bridging your deficit in ${career.top_blockers?.[0] || 'Core Architecture'} yields the fastest leap toward placement readiness (+14%).`,
    estimated_time: '25 minutes',
    action_type: 'roadmap',
    target_tab: 'roadmap',
    target_id: 'top',
    impact_badge: '+14% Readiness'
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Personalized Learner Greeting Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Welcome back, {profile?.full_name || 'Learner'}
            </h2>
            <span className="w-2 h-2 rounded-full bg-[#C5F45B] animate-pulse" />
          </div>
          <p className="text-xs text-[#929CA3] mt-1 font-mono">
            {profile?.department || profile?.education || 'Computer Science'}
            {profile?.institution ? ` @ ${profile.institution}` : ''}
            {profile?.academic_year ? ` • ${profile.academic_year}` : ''}
            {profile?.weekly_hours ? ` • Target: ${profile.weekly_hours}h / week` : ''}
          </p>
        </div>
        {profile?.short_term_goal && (
          <div className="bg-[#11171B] border border-white/10 px-3.5 py-2 rounded-xl text-xs max-w-md">
            <span className="text-[10px] font-mono text-[#35D9F2] uppercase block font-bold">Focus Milestone:</span>
            <span className="text-zinc-300 line-clamp-1">{profile.short_term_goal}</span>
          </div>
        )}
      </div>

      {/* WHAT'S NEXT? HERO ELEMENT & GENUINE STREAK DUAL HERO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High-Visibility "What's Next?" Card */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#0B0F12] via-[#11171B] to-[#0B0F12] border border-[#35D9F2]/40 shadow-[0_0_35px_rgba(53,217,242,0.15)] relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#35D9F2]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#35D9F2]/20 text-[#35D9F2] font-bold border border-[#35D9F2]/40 flex items-center gap-1.5 animate-pulse">
                  <Zap className="w-3 h-3 fill-current" /> NEXT BEST ACTION
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  Focus: <strong className="text-white">{nextAction.focus_skill}</strong>
                </span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#C5F45B]/10 text-[#C5F45B] border border-[#C5F45B]/30 font-semibold">
                {nextAction.impact_badge}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              {nextAction.task_title}
            </h3>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {nextAction.direct_rationale}
            </p>
          </div>

          <div className="pt-5 mt-4 border-t border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#35D9F2]" /> {nextAction.estimated_time} commitment
              </span>
              <span>•</span>
              <span className="text-[#C5F45B]">Autonomous adaptive priority</span>
            </div>

            <button
              onClick={() => onNavigateTab(nextAction.target_tab)}
              className="px-5 py-2.5 rounded-xl bg-[#35D9F2] hover:bg-[#20c5de] text-[#050608] text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(53,217,242,0.35)] cursor-pointer"
            >
              Start Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Col: Meaningful Genuine Learning Streak System */}
        <div className="p-6 rounded-2xl bg-[#0B0F12] border border-white/10 shadow-2xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" /> Genuine Learning Streak
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Best: {streak?.longest_streak_days || 3}d
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                {streak?.active_streak_days || 1}
              </span>
              <span className="text-sm font-mono text-amber-400 font-bold uppercase">Days Active 🔥</span>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Measures genuine cognitive learning: completed lessons, passed challenges, delivered milestones, and assessments.
            </p>

            {/* 7-Day Visual Calendar Dots */}
            <div className="pt-2">
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {(streak?.week_dots || [
                  { day: 'Mon', day_short: 'M', date: 'Mon', active: true, is_today: false },
                  { day: 'Tue', day_short: 'T', date: 'Tue', active: true, is_today: false },
                  { day: 'Wed', day_short: 'W', date: 'Wed', active: true, is_today: false },
                  { day: 'Thu', day_short: 'T', date: 'Thu', active: true, is_today: false },
                  { day: 'Fri', day_short: 'F', date: 'Fri', active: false, is_today: true },
                  { day: 'Sat', day_short: 'S', date: 'Sat', active: false, is_today: false },
                  { day: 'Sun', day_short: 'S', date: 'Sun', active: false, is_today: false }
                ]).map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-mono text-zinc-500">{d.day.slice(0, 1)}</span>
                    <div 
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono transition-all ${
                        d.active 
                          ? 'bg-[#C5F45B]/20 border border-[#C5F45B] text-[#C5F45B] shadow-[0_0_8px_rgba(197,244,91,0.25)]' 
                          : d.is_today
                          ? 'bg-[#35D9F2]/10 border border-[#35D9F2]/50 text-[#35D9F2]'
                          : 'bg-[#11171B] border border-white/5 text-zinc-600'
                      }`}
                      title={d.active ? `Verified learning on ${d.date}` : d.date}
                    >
                      {d.active ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '·'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Streak Status or Recovery Prompt */}
          <div className="pt-4 mt-3 border-t border-white/5">
            {streak?.today_active ? (
              <span className="text-[11px] font-mono text-[#C5F45B] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Today's learning activity verified!
              </span>
            ) : (
              <button
                onClick={() => onNavigateTab('coding-lab')}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#11171B] hover:bg-white/5 border border-amber-500/30 text-[11px] font-mono text-amber-300 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Complete 1 quick lab today</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QUICK-ACCESS NAVIGATION HUB (10 CORE UTILITIES) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#35D9F2]" /> Student Utility Hub
          </span>
          <span className="text-[11px] font-mono text-zinc-500">10 Core Workspaces</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { id: 'learning', label: '1. Continue Learning', desc: 'Interactive lessons & modules', icon: BookOpen, color: 'text-[#35D9F2]' },
            { id: 'roadmap', label: "2. What's Next?", desc: 'Milestone learning roadmap', icon: Zap, color: 'text-amber-400' },
            { id: 'careers', label: '3. Target Career', desc: 'Market demand & compensation', icon: Target, color: 'text-[#C5F45B]' },
            { id: 'roadmap', label: '4. Learning Path', desc: 'Dynamic prerequisite graph', icon: Compass, color: 'text-cyan-400' },
            { id: 'skills', label: '5. Skill Galaxy', desc: 'Competency matrix & verification', icon: Sparkles, color: 'text-indigo-400' },
            { id: 'analytics', label: '6. Weekly Missions', desc: 'Sprint targets & velocity', icon: Clock, color: 'text-emerald-400' },
            { id: 'assessments', label: '7. Assessments', desc: 'Diagnostic tests & rubrics', icon: ClipboardCheck, color: 'text-pink-400' },
            { id: 'mentor', label: '8. AI Mentor', desc: '24/7 Contextual career coach', icon: Mic2, color: 'text-purple-400' },
            { id: 'project-studio', label: '9. Portfolio', desc: 'Project deliverables & code', icon: FileSpreadsheet, color: 'text-teal-400' },
            { id: 'achievements', label: '10. Achievements', desc: 'Medals & graduation unlocks', icon: Award, color: 'text-yellow-400' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => onNavigateTab(item.id)}
                className="p-3.5 rounded-xl bg-[#0B0F12] border border-white/8 hover:border-[#35D9F2]/50 hover:bg-[#11171B] transition-all text-left flex flex-col justify-between group cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(53,217,242,0.12)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#35D9F2] transition-colors line-clamp-1">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Career Strategic Banner */}
      <div className="bg-[#0B0F12] p-6 sm:p-7 rounded-2xl border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="cyan" size="sm">ACTIVE TARGET TRAJECTORY</Badge>
              <span className="text-xs font-mono text-zinc-400">Demand: {career.growth_outlook}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {career.title}
            </h1>
            <p className="text-sm text-[#929CA3] max-w-2xl leading-relaxed">
              {career.strategic_advice}
            </p>
          </div>

          <div className="flex items-center gap-6 bg-[#11171B] p-5 rounded-xl border border-white/8 shrink-0">
            <div className="text-center">
              <div className="text-[11px] font-mono uppercase text-zinc-400">Match Score</div>
              <div className="text-3xl sm:text-4xl font-black text-[#35D9F2] font-mono mt-0.5">
                {progress.overall_readiness_score}%
              </div>
              <div className="text-[10px] font-mono text-[#C5F45B] mt-1 uppercase">
                {career.readiness_band}
              </div>
            </div>

            <div className="h-12 w-px bg-white/10" />

            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-400">Avg Compensation:</span>
                <span className="text-white font-mono font-semibold">{career.average_salary}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-400">Roadmap Progress:</span>
                <span className="text-[#35D9F2] font-mono font-semibold">
                  {progress.roadmap_progress_percentage}% ({progress.roadmap_completed}/{progress.roadmap_total})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigateTab('skills')}
          className="bg-[#0B0F12] p-5 rounded-xl border border-white/8 hover:border-[#C5F45B]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Verified Strengths</span>
            <CheckCircle2 className="w-4 h-4 text-[#C5F45B] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{progress.strengths_count}</div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">Meeting target criteria</div>
        </div>

        <div 
          onClick={() => onNavigateTab('skills')}
          className="bg-[#0B0F12] p-5 rounded-xl border border-white/8 hover:border-amber-400/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Proficiency Deficits</span>
            <AlertCircle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">{progress.weaknesses_count}</div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">Below role threshold</div>
        </div>

        <div 
          onClick={() => onNavigateTab('skills')}
          className="bg-[#0B0F12] p-5 rounded-xl border border-white/8 hover:border-[#35D9F2]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Missing Skills</span>
            <TrendingUp className="w-4 h-4 text-[#35D9F2] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-[#35D9F2] font-mono">{progress.missing_count}</div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">Prioritized in roadmap</div>
        </div>

        <div 
          onClick={() => onNavigateTab('roadmap')}
          className="bg-[#0B0F12] p-5 rounded-xl border border-white/8 hover:border-[#35D9F2]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Milestones Done</span>
            <Compass className="w-4 h-4 text-[#35D9F2] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {progress.roadmap_completed} <span className="text-sm font-normal text-zinc-500">/ {progress.roadmap_total}</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">{progress.roadmap_progress_percentage}% journey completed</div>
        </div>
      </div>

      {/* Main Analytical Chart: Current vs Required Competency Levels */}
      <div className="bg-[#0B0F12] p-6 rounded-2xl border border-white/8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#35D9F2]" />
              Competency Benchmark Matrix
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Comparison of your current verified skill proficiency versus {career.title} benchmarks.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-3 h-3 rounded bg-[#35D9F2] inline-block" />
              Your Level
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-3 h-3 rounded bg-zinc-700 inline-block" />
              Required Level
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="skill" 
                stroke="#71717a" 
                tick={{ fontSize: 11, fill: '#a1a1aa' }} 
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis stroke="#71717a" tick={{ fontSize: 11, fill: '#a1a1aa' }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0B0F12', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '12px', 
                  fontSize: '12px',
                  color: '#fff'
                }} 
              />
              <Bar dataKey="current" name="Current Proficiency" fill="#35D9F2" radius={[4, 4, 0, 0]} />
              <Bar dataKey="required" name="Required Level" fill="#27272A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
