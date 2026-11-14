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
  FileSpreadsheet
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

      {/* Top Banner: Career Goal Intelligence */}
      <div className="bg-[#0B0F12] p-6 sm:p-8 rounded-2xl border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="cyan" size="sm">ACTIVE CAREER TARGET</Badge>
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

      {/* Two Column Section: Quick Actions & Recent Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Quick Actions & Recommended Next Move */}
        <div className="bg-[#0B0F12] p-6 rounded-2xl border border-white/8 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#35D9F2]" />
            Recommended Next Step
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The Roadmap Agent has determined that bridging your deficit in <strong>{progress.career.top_blockers[0] || 'JavaScript'}</strong> will yield the highest immediate leap in career readiness (+22%).
          </p>

          <div className="p-4 rounded-xl bg-[#11171B] border border-[#35D9F2]/30 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#35D9F2] uppercase font-semibold">Priority 1 Milestone</span>
              <div className="text-sm font-semibold text-white">Foundations & Core Syntax: {progress.career.top_blockers[0] || 'JavaScript'}</div>
              <div className="text-xs text-zinc-400 font-mono">12 estimated hours • Interactive Curriculum</div>
            </div>
            <Button 
              onClick={() => onNavigateTab('roadmap')}
              variant="primary"
              size="sm"
            >
              Resume
            </Button>
          </div>

          {/* Quick Hub Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('learning')}
              className="p-3.5 rounded-xl bg-[#11171B] border border-white/5 hover:border-[#35D9F2]/40 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-[#35D9F2] text-xs font-semibold mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                Learning Center
              </div>
              <div className="text-xs text-zinc-400 group-hover:text-zinc-300">
                Study deep-dive modules with code snippets.
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('coding-lab')}
              className="p-3.5 rounded-xl bg-[#11171B] border border-white/5 hover:border-[#C5F45B]/40 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-[#C5F45B] text-xs font-semibold mb-1">
                <Code2 className="w-3.5 h-3.5" />
                Practice Lab
              </div>
              <div className="text-xs text-zinc-400 group-hover:text-zinc-300">
                Execute algorithms with automated test runner.
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('interview-sim')}
              className="p-3.5 rounded-xl bg-[#11171B] border border-white/5 hover:border-[#35D9F2]/40 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-[#35D9F2] text-xs font-semibold mb-1">
                <Mic2 className="w-3.5 h-3.5" />
                Interview Simulator
              </div>
              <div className="text-xs text-zinc-400 group-hover:text-zinc-300">
                Score responses with AI staff engineering rubrics.
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('resume-analyzer')}
              className="p-3.5 rounded-xl bg-[#11171B] border border-white/5 hover:border-[#C5F45B]/40 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-[#C5F45B] text-xs font-semibold mb-1">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Resume Analyzer
              </div>
              <div className="text-xs text-zinc-400 group-hover:text-zinc-300">
                Run ATS semantic match against dream roles.
              </div>
            </button>
          </div>
        </div>

        {/* Right: Recent Agent & Activity Timeline */}
        <div className="bg-[#0B0F12] p-6 rounded-2xl border border-white/8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#35D9F2]" />
              Recent System Activity
            </h3>
            <button 
              onClick={() => onNavigateTab('agents')}
              className="text-xs text-[#35D9F2] hover:underline font-mono cursor-pointer"
            >
              View Full Telemetry →
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {progress.recent_activity.length > 0 ? (
              progress.recent_activity.slice(0, 4).map((act) => (
                <div key={act.id} className="p-3 rounded-lg bg-[#11171B] border border-white/5 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-[#35D9F2] font-semibold">{act.description}</div>
                    <div className="text-[10px] text-zinc-500">{new Date(act.created_at).toLocaleTimeString()}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#161D22] text-zinc-300 border border-white/5 shrink-0">
                    {act.event_type}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-lg bg-[#11171B] border border-white/5 text-zinc-500 text-center">
                Baseline profile initialized. Take an assessment or complete a milestone to see activity.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};