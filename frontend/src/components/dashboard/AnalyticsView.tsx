import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Flame, 
  Clock, 
  BookOpen, 
  ClipboardCheck, 
  Target, 
  Activity, 
  Calendar,
  Save,
  Check
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { api } from '../../api/client';
import { WeeklyGoals, ProgressOverview } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface AnalyticsViewProps {
  progress: ProgressOverview | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ progress }) => {
  const [goals, setGoals] = useState<WeeklyGoals | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Form states for goal customization
  const [targetHours, setTargetHours] = useState<number>(10);
  const [targetLessons, setTargetLessons] = useState<number>(5);
  const [targetAssessments, setTargetAssessments] = useState<number>(2);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await api.getWeeklyGoals();
      setGoals(data);
      setTargetHours(data.target_hours);
      setTargetLessons(data.target_lessons);
      setTargetAssessments(data.target_assessments);
    } catch (err) {
      console.error('Failed to load weekly goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateWeeklyGoals(targetHours, targetLessons, targetAssessments);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      const updated = await api.getWeeklyGoals();
      setGoals(updated);
    } catch (err) {
      console.error('Failed to update goals:', err);
    } finally {
      setSaving(false);
    }
  };

  // Mock historical readiness progression trend
  const progressionTrend = [
    { week: 'W1', readiness: 42, hours: 6 },
    { week: 'W2', readiness: 49, hours: 8 },
    { week: 'W3', readiness: 58, hours: 11 },
    { week: 'W4', readiness: 65, hours: 10 },
    { week: 'W5', readiness: 71, hours: 14 },
    { week: 'Current', readiness: progress?.overall_readiness_score || 78, hours: goals?.completed_hours || 12 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 font-mono text-sm">
        <div className="w-5 h-5 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin mr-3" />
        <span>Synthesizing learning analytics and telemetry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="cyan" size="sm">ANALYTICS & GOALS</Badge>
            <span className="text-xs font-mono text-zinc-500">• Empirical Velocity Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Progress Analytics & Weekly Goals
          </h1>
          <p className="text-sm text-[#929CA3] mt-1">
            Empirical velocity metrics, weekly study habits, streak momentum, and historical career readiness trajectory.
          </p>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-3 bg-[#0B0F12] border border-white/8 px-4 py-3 rounded-xl self-start sm:self-auto">
          <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-zinc-400">Learning Streak</div>
            <div className="text-lg font-bold font-mono text-white">
              {goals?.streak_days || 4} Days Consecutive
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Goals Progress Row */}
      {goals && (
        <div className="bg-[#0B0F12] border border-white/8 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/8">
            <div>
              <span className="text-xs font-mono uppercase text-[#35D9F2] block mb-1">
                CURRENT SPRINT TARGETS
              </span>
              <h2 className="text-xl font-bold text-white">Weekly Commitment Tracker</h2>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <span>Week starting: {goals.week_start_date}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Hours Goal */}
            <div className="bg-[#11171B] border border-white/5 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#35D9F2]" />
                  <span>STUDY HOURS</span>
                </span>
                <span className="text-xs font-mono font-bold text-[#35D9F2]">
                  {goals.completed_hours} / {goals.target_hours}h
                </span>
              </div>
              <div className="w-full h-2 bg-[#050608] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#35D9F2] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (goals.completed_hours / goals.target_hours) * 100)}%` }}
                />
              </div>
            </div>

            {/* Lessons Goal */}
            <div className="bg-[#11171B] border border-white/5 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#C5F45B]" />
                  <span>LESSONS COMPLETED</span>
                </span>
                <span className="text-xs font-mono font-bold text-[#C5F45B]">
                  {goals.completed_lessons} / {goals.target_lessons}
                </span>
              </div>
              <div className="w-full h-2 bg-[#050608] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#C5F45B] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (goals.completed_lessons / goals.target_lessons) * 100)}%` }}
                />
              </div>
            </div>

            {/* Assessments Goal */}
            <div className="bg-[#11171B] border border-white/5 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-amber-300" />
                  <span>ASSESSMENTS PASSED</span>
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {goals.completed_assessments} / {goals.target_assessments}
                </span>
              </div>
              <div className="w-full h-2 bg-[#050608] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (goals.completed_assessments / goals.target_assessments) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Form to adjust weekly targets */}
          <form onSubmit={handleSaveGoals} className="pt-4 border-t border-white/5 flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">TARGET HOURS/WEEK</label>
              <input
                type="number"
                min={1}
                max={60}
                value={targetHours}
                onChange={e => setTargetHours(Number(e.target.value))}
                className="w-28 bg-[#11171B] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#35D9F2]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">TARGET LESSONS</label>
              <input
                type="number"
                min={1}
                max={40}
                value={targetLessons}
                onChange={e => setTargetLessons(Number(e.target.value))}
                className="w-28 bg-[#11171B] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#35D9F2]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">TARGET ASSESSMENTS</label>
              <input
                type="number"
                min={1}
                max={15}
                value={targetAssessments}
                onChange={e => setTargetAssessments(Number(e.target.value))}
                className="w-28 bg-[#11171B] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#35D9F2]"
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              variant="outline"
              size="sm"
              icon={saveSuccess ? <Check className="w-3.5 h-3.5 text-[#C5F45B]" /> : <Save className="w-3.5 h-3.5" />}
            >
              {saving ? 'Updating...' : saveSuccess ? 'Targets Saved' : 'Update Commitments'}
            </Button>
          </form>
        </div>
      )}

      {/* Trajectory Time-Series Chart */}
      <div className="bg-[#0B0F12] border border-white/8 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/8">
          <div>
            <span className="text-xs font-mono uppercase text-[#35D9F2] block mb-1">HISTORICAL CURVE</span>
            <h2 className="text-xl font-bold text-white">Career Readiness Growth (%)</h2>
          </div>
          <span className="text-xs font-mono text-[#C5F45B]">+36% Growth over 6 Weeks</span>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={progressionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="readinessGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#35D9F2" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#35D9F2" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" stroke="#71717a" tick={{ fontSize: 11 }} />
              <YAxis stroke="#71717a" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0B0F12', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="readiness" 
                stroke="#35D9F2" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#readinessGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Telemetry Feed */}
      {progress?.recent_activity && progress.recent_activity.length > 0 && (
        <div className="bg-[#0B0F12] border border-white/8 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/8">
            <span className="text-xs font-mono uppercase text-zinc-400 font-semibold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#35D9F2]" />
              <span>Immutable Activity Audit Trail</span>
            </span>
            <span className="text-xs font-mono text-zinc-500">{progress.recent_activity.length} Events</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
            {progress.recent_activity.map(act => (
              <div 
                key={act.id} 
                className="p-3 rounded-xl bg-[#11171B] border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <span className="text-white font-medium">{act.description}</span>
                  <div className="text-[10px] font-mono text-zinc-500">{act.event_type}</div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[#35D9F2] block font-semibold">+{act.new_value}</span>
                  <span className="text-[10px] text-zinc-500">{act.created_at?.split('T')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};