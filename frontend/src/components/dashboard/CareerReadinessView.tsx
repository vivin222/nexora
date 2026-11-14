import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  Calendar,
  Layers,
  Code2,
  FolderGit2,
  Award,
  Zap,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { api } from '../../api/client';
import { CareerReadinessReport, WeeklyGrowthReview, ActivityTimelineEvent } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { GraduationCapSymbol } from '../common/GraduationCapSymbol';

interface CareerReadinessViewProps {
  onNavigateTab: (tab: any) => void;
}

export const CareerReadinessView: React.FC<CareerReadinessViewProps> = ({ onNavigateTab }) => {
  const [report, setReport] = useState<CareerReadinessReport | null>(null);
  const [growth, setGrowth] = useState<WeeklyGrowthReview | null>(null);
  const [timeline, setTimeline] = useState<ActivityTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rep, gro, tim] = await Promise.all([
        api.getReadinessReport().catch(() => null),
        api.getWeeklyGrowth().catch(() => null),
        api.getTimeline().catch(() => [])
      ]);
      setReport(rep);
      setGrowth(gro);
      setTimeline(tim);
    } catch (err) {
      console.error('Failed to load career readiness intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[360px] text-zinc-500 font-mono text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin" />
          <span>Synthesizing Multi-Agent Career Readiness & Activity Vectors...</span>
        </div>
      </div>
    );
  }

  const filteredTimeline = filterCategory === 'all' 
    ? timeline 
    : timeline.filter(t => t.category.toLowerCase() === filterCategory.toLowerCase());

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="cyan" size="sm">CAREER INTELLIGENCE DIAGNOSTICS</Badge>
            <span className="text-xs font-mono text-zinc-500">• Multi-Agent Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Career Readiness & Activity Timeline
          </h1>
          <p className="text-sm text-[#929CA3] mt-1 max-w-2xl leading-relaxed">
            Mathematical competency validation, sprint trajectory velocity, and immutable chronological learner milestones.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
        >
          {refreshing ? 'Refreshing...' : 'Recalibrate Intelligence'}
        </Button>
      </div>

      {/* 1. AI Career Readiness Core Diagnostic Card */}
      {report && (
        <div className="bg-[#0B0F12] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/8">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="lime" size="sm">ACTIVE TARGET: {report.career_title}</Badge>
                <span className="text-xs font-mono text-zinc-400">
                  Est. {report.estimated_weeks_to_market_ready} weeks to market-ready
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Overall Career Placement Readiness: {report.readiness_score}%
              </h2>
              <div className="text-xs text-[#35D9F2] font-mono">
                {report.readiness_level}
              </div>
            </div>

            <div className="bg-[#11171B] border border-white/8 px-6 py-4 rounded-xl text-center shrink-0 flex items-center gap-4">
              <GraduationCapSymbol size={36} interactive={true} />
              <div>
                <div className="text-[10px] font-mono uppercase text-zinc-400">Readiness Index</div>
                <div className="text-4xl font-black text-[#C5F45B] font-mono mt-0.5">
                  {report.readiness_score}%
                </div>
                <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                  {report.readiness_score >= 80 ? 'Graduation Eligible' : 'Market Benchmark: 80%'}
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical Formula Explanation Banner */}
          <div className="p-4 rounded-xl bg-[#11171B] border border-white/5 space-y-1">
            <div className="text-[11px] font-mono text-[#35D9F2] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MATHEMATICAL SCORING RATIONALE</span>
            </div>
            <div className="text-xs font-mono text-zinc-300 leading-relaxed">
              {report.formula_explanation}
            </div>
          </div>

          {/* 4 Score Component Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#080C0E] border border-white/5 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-mono">Core Skills (40%)</span>
                <span className="text-white font-mono font-bold">{report.score_breakdown.skill_matrix_score}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#35D9F2] rounded-full"
                  style={{ width: `${report.score_breakdown.skill_matrix_score}%` }}
                />
              </div>
              <div className="text-[11px] text-zinc-500 font-mono">{report.verified_skills_count} verified competencies</div>
            </div>

            <div className="bg-[#080C0E] border border-white/5 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-mono">Project Evidence (25%)</span>
                <span className="text-white font-mono font-bold">{report.score_breakdown.project_portfolio_score}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#C5F45B] rounded-full"
                  style={{ width: `${report.score_breakdown.project_portfolio_score}%` }}
                />
              </div>
              <div className="text-[11px] text-zinc-500 font-mono">{report.score_breakdown.completed_projects_count} completed capstones</div>
            </div>

            <div className="bg-[#080C0E] border border-white/5 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-mono">Coding Lab (20%)</span>
                <span className="text-white font-mono font-bold">{report.score_breakdown.coding_competency_score}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#35D9F2] rounded-full"
                  style={{ width: `${report.score_breakdown.coding_competency_score}%` }}
                />
              </div>
              <div className="text-[11px] text-zinc-500 font-mono">{report.score_breakdown.coding_problems_passed} challenges solved</div>
            </div>

            <div className="bg-[#080C0E] border border-white/5 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-mono">Assessment Accuracy (15%)</span>
                <span className="text-white font-mono font-bold">{report.score_breakdown.assessment_accuracy_score}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#C5F45B] rounded-full"
                  style={{ width: `${report.score_breakdown.assessment_accuracy_score}%` }}
                />
              </div>
              <div className="text-[11px] text-zinc-500 font-mono">Rubric-verified answers</div>
            </div>
          </div>

          {/* Critical Gaps & Recommended Next Sprints */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Critical Competency Gaps</span>
                </h3>
                <span className="text-xs font-mono text-zinc-500">{report.skill_gap_count} gaps identified</span>
              </div>

              <div className="space-y-2.5">
                {report.critical_gaps.slice(0, 3).map((gap, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#11171B] border border-white/5 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-zinc-200">{gap.skill_name}</div>
                      <div className="text-[11px] text-zinc-500 line-clamp-1">{gap.why_it_matters}</div>
                    </div>
                    <Badge variant="amber" size="sm">
                      GAP: {gap.gap_percentage}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#C5F45B]" />
                  <span>AI Recommended Sprints</span>
                </h3>
                <span className="text-xs font-mono text-zinc-500">Accelerate Readiness</span>
              </div>

              <div className="space-y-2.5">
                {report.recommended_sprints.map((sp, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#11171B] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">Sprint {sp.sprint_number}: {sp.focus_skill}</span>
                      <span className="text-[10px] font-mono text-[#35D9F2]">{sp.objective}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {sp.recommended_action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. AI Weekly Growth Review Card */}
      {growth && (
        <div className="bg-[#0B0F12] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="lime" size="sm">WEEKLY VELOCITY SPRINT</Badge>
                <span className="text-xs font-mono text-zinc-500">Cycle: {growth.week_start}</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Learning Velocity: {growth.velocity_indicator}
              </h2>
            </div>

            <div className="flex items-center gap-4 bg-[#11171B] px-4 py-2.5 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-xs font-mono">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-zinc-400">Streak:</span>
                <span className="text-white font-bold">{growth.streak_days} days</span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2 text-xs font-mono">
                <Clock className="w-4 h-4 text-[#35D9F2]" />
                <span className="text-zinc-400">Time:</span>
                <span className="text-white font-bold">{growth.hours_invested}h / {growth.target_hours}h</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {growth.ai_sprint_actions.map((act, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#11171B] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={act.priority === 'HIGH' ? 'amber' : 'cyan'} size="sm">
                    {act.priority} PRIORITY
                  </Badge>
                  <span className="text-[10px] font-mono text-zinc-500">{act.estimated_time}</span>
                </div>
                <div className="text-xs font-semibold text-white">{act.title}</div>
                <div className="text-[11px] text-[#C5F45B] font-mono">{act.impact}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Student Activity Timeline */}
      <div className="bg-[#0B0F12] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="cyan" size="sm">AUDIT LOGGED</Badge>
              <span className="text-xs font-mono text-zinc-500">Immutable Student Milestones</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Chronological Activity Stream
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Real records from SQLite capturing registration, onboarding, challenges, milestones, and assessments.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#11171B] p-1 rounded-xl border border-white/5 text-xs font-mono">
            {['all', 'milestone', 'code', 'learning', 'account'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg uppercase transition-all cursor-pointer ${
                  filterCategory === cat 
                    ? 'bg-[#161D22] text-[#35D9F2] font-semibold border border-white/10' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Events List */}
        {filteredTimeline.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 font-mono text-xs">
            No activity records matching filter. Complete learning lessons or practice labs to record milestones.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
            {filteredTimeline.map((ev) => {
              const dateStr = new Date(ev.timestamp).toLocaleString();
              let icon = <Clock className="w-3.5 h-3.5 text-[#35D9F2]" />;
              if (ev.category === 'code') icon = <Code2 className="w-3.5 h-3.5 text-[#C5F45B]" />;
              if (ev.category === 'project') icon = <FolderGit2 className="w-3.5 h-3.5 text-[#35D9F2]" />;
              if (ev.category === 'milestone') icon = <Award className="w-3.5 h-3.5 text-amber-400" />;
              if (ev.category === 'account') icon = <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />;

              return (
                <div key={ev.id} className="relative group">
                  <div className="absolute -left-[29px] top-1 w-5 h-5 rounded-full bg-[#11171B] border border-white/20 flex items-center justify-center">
                    {icon}
                  </div>

                  <div className="bg-[#11171B] p-4 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{ev.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400 uppercase">
                          {ev.category}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">{dateStr}</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {ev.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
