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
  ShieldCheck,
  Zap
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { ProgressOverview, LearnerProfile } from '../../types';
import { Badge } from '../common/Badge';
import { CrimsonButton } from '../common/CrimsonButton';

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
          <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span>Calibrating learner intelligence graph...</span>
        </div>
      </div>
    );
  }

  const { career, chart_data } = progress;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner: Career Goal Intelligence */}
      <div className="glass-panel-elevated p-6 sm:p-8 rounded-2xl border border-rose-500/30 crimson-glow-sm relative overflow-hidden">
        <div className="ambient-crimson-orb w-64 h-64 -top-20 -right-20 opacity-20" />

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="crimson" size="sm">ACTIVE CAREER TARGET</Badge>
              <span className="text-xs font-mono text-zinc-400">Demand: {career.growth_outlook}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {career.title}
            </h1>
            <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
              {career.strategic_advice}
            </p>
          </div>

          <div className="flex items-center gap-6 bg-zinc-950/80 p-5 rounded-xl border border-white/8 shrink-0">
            <div className="text-center">
              <div className="text-[11px] font-mono uppercase text-zinc-400">Match Score</div>
              <div className="text-3xl sm:text-4xl font-black text-rose-400 font-mono mt-0.5">
                {progress.overall_readiness_score}%
              </div>
              <div className="text-[10px] font-mono text-zinc-400 mt-1 uppercase">
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
                <span className="text-rose-300 font-mono font-semibold">
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
          className="glass-panel p-5 rounded-xl border border-white/5 hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Verified Strengths</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{progress.strengths_count}</div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">Meeting target criteria</div>
        </div>

        <div 
          onClick={() => onNavigateTab('skills')}
          className="glass-panel p-5 rounded-xl border border-white/5 hover:border-amber-500/40 transition-all cursor-pointer group"
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
          className="glass-panel p-5 rounded-xl border border-white/5 hover:border-rose-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Missing Competencies</span>
            <TrendingUp className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono">{progress.missing_count}</div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">Prioritized in roadmap</div>
        </div>

        <div 
          onClick={() => onNavigateTab('roadmap')}
          className="glass-panel p-5 rounded-xl border border-white/5 hover:border-rose-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Milestones Completed</span>
            <Compass className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {progress.roadmap_completed} <span className="text-sm font-normal text-zinc-500">/ {progress.roadmap_total}</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">{progress.roadmap_progress_percentage}% journey completed</div>
        </div>
      </div>

      {/* Main Analytical Chart: Current vs Required Competency Levels */}
      <div className="glass-panel p-6 rounded-2xl border border-white/8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-rose-400" />
              Competency Benchmark Matrix
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Comparison of your current verified skill proficiency versus {career.title} benchmarks.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
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
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
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
                  backgroundColor: '#090a0f', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '8px', 
                  fontSize: '12px',
                  color: '#fff'
                }} 
              />
              <Bar dataKey="current" name="Current Proficiency" fill="#e11d48" radius={[4, 4, 0, 0]} />
              <Bar dataKey="required" name="Required Level" fill="#3f3f46" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Section: Quick Actions & Recent Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Quick Actions & Recommended Next Move */}
        <div className="glass-panel p-6 rounded-2xl border border-white/8 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-rose-400" />
            Recommended Next Step
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The Roadmap Agent has determined that bridging your deficit in <strong>{progress.career.top_blockers[0] || 'JavaScript'}</strong> will yield the highest immediate leap in career readiness (+22%).
          </p>

          <div className="p-4 rounded-xl bg-zinc-950/80 border border-rose-500/30 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-rose-400 uppercase font-semibold">Priority 1 Milestone</span>
              <div className="text-sm font-semibold text-white">Foundations & Core Syntax: {progress.career.top_blockers[0] || 'JavaScript'}</div>
              <div className="text-xs text-zinc-400 font-mono">12 estimated hours • Interactive Tutorials</div>
            </div>
            <CrimsonButton 
              onClick={() => onNavigateTab('roadmap')}
              variant="primary"
              size="sm"
            >
              Resume
            </CrimsonButton>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('mentor')}
              className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 hover:border-rose-500/30 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Ask AI Mentor
              </div>
              <div className="text-xs text-zinc-400 group-hover:text-zinc-300">
                Discuss career tactics or ask concept questions.
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('assessments')}
              className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 hover:border-emerald-500/30 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                <ClipboardCheck className="w-3.5 h-3.5" />
                Take Assessment
              </div>
              <div className="text-xs text-zinc-400 group-hover:text-zinc-300">
                Verify skills and update readiness score.
              </div>
            </button>
          </div>
        </div>

        {/* Right: Recent Agent & Activity Timeline */}
        <div className="glass-panel p-6 rounded-2xl border border-white/8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-400" />
              Recent System Activity
            </h3>
            <button 
              onClick={() => onNavigateTab('agents')}
              className="text-xs text-rose-400 hover:text-rose-300 font-mono cursor-pointer"
            >
              View Full Telemetry →
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {progress.recent_activity.length > 0 ? (
              progress.recent_activity.slice(0, 4).map((act) => (
                <div key={act.id} className="p-3 rounded-lg bg-zinc-950/60 border border-white/5 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-rose-300 font-semibold">{act.description}</div>
                    <div className="text-[10px] text-zinc-500">{new Date(act.created_at).toLocaleTimeString()}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 shrink-0">
                    {act.event_type}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-white/5 text-zinc-500 text-center">
                Baseline profile initialized. Take an assessment or complete a milestone to see activity.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
