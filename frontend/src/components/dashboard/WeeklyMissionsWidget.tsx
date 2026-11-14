import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Code2, 
  BookOpen, 
  Briefcase, 
  FolderGit2,
  RefreshCw,
  Check
} from 'lucide-react';
import { api } from '../../api/client';
import { WeeklyMission, WeeklyMissionsResponse } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface WeeklyMissionsWidgetProps {
  onNavigateTab?: (tab: any) => void;
}

export const WeeklyMissionsWidget: React.FC<WeeklyMissionsWidgetProps> = ({ onNavigateTab }) => {
  const [data, setData] = useState<WeeklyMissionsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyAlert, setVerifyAlert] = useState<{ id: string; success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      setLoading(true);
      const res = await api.getWeeklyMissions();
      setData(res);
    } catch (err) {
      console.error('Failed to load weekly missions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (missionId: string) => {
    try {
      setVerifyingId(missionId);
      setVerifyAlert(null);
      const res = await api.verifyMission(missionId);
      setVerifyAlert({
        id: missionId,
        success: true,
        message: res.message || 'Mission verified through objective academic evidence!'
      });
      // Refresh missions
      const updated = await api.getWeeklyMissions();
      setData(updated);
    } catch (err: any) {
      const msg = err?.message || 'Verification Failed: No passing submission found in system yet. Complete the challenge first.';
      setVerifyAlert({
        id: missionId,
        success: false,
        message: msg
      });
    } finally {
      setVerifyingId(null);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'coding_lab':
        return <Code2 className="w-4 h-4 text-[#35D9F2]" />;
      case 'simulator':
        return <Briefcase className="w-4 h-4 text-[#C5F45B]" />;
      case 'project':
        return <FolderGit2 className="w-4 h-4 text-purple-400" />;
      case 'lesson':
      default:
        return <BookOpen className="w-4 h-4 text-amber-400" />;
    }
  };

  const getActionTab = (actionType: string) => {
    switch (actionType) {
      case 'coding_lab': return 'coding-lab';
      case 'simulator': return 'interview-sim';
      case 'project': return 'project-studio';
      case 'lesson': default: return 'learning';
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0B0F12] border border-white/8 rounded-2xl p-6 sm:p-8 flex items-center justify-center text-zinc-500 font-mono text-xs">
        <div className="w-4 h-4 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin mr-2" />
        <span>Synthesizing AI-Adaptive Weekly Missions...</span>
      </div>
    );
  }

  if (!data || data.missions.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#0B0F12] border border-white/8 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Widget Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="cyan" size="sm">AI ROADMAP AGENT</Badge>
            <span className="text-xs font-mono text-zinc-400">
              • Calibrated for {data.weekly_hours_allocated}h Study Commitment / Week
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Personalized Weekly Learning Missions
          </h2>
          <p className="text-xs sm:text-sm text-[#929CA3] mt-1">
            Strict evidence-verified weekly objectives designed by RoadmapAgent to close your top career blockers.
          </p>
        </div>

        {/* Completion Counter */}
        <div className="text-right">
          <div className="text-[10px] font-mono uppercase text-zinc-400">Sprint Progress</div>
          <div className="flex items-baseline gap-1.5 justify-end">
            <span className="text-2xl font-black font-mono text-[#35D9F2]">
              {data.completed_missions} / {data.total_missions}
            </span>
            <span className="text-xs font-mono text-zinc-500">
              ({data.completion_percentage}%)
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-[#050608] rounded-full overflow-hidden border border-white/5">
        <div 
          className="h-full bg-gradient-to-r from-[#35D9F2] to-[#C5F45B] transition-all duration-500 rounded-full"
          style={{ width: `${data.completion_percentage}%` }}
        />
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.missions.map(m => {
          const isCompleted = m.status === 'completed';
          const isVerifying = verifyingId === m.id;
          const currentAlert = verifyAlert?.id === m.id ? verifyAlert : null;

          return (
            <div
              key={m.id}
              className={`p-5 rounded-xl border transition-all flex flex-col justify-between space-y-4 ${
                isCompleted
                  ? 'bg-[#11171B]/50 border-[#C5F45B]/30'
                  : 'bg-[#11171B] border-white/5 hover:border-white/10'
              }`}
            >
              <div className="space-y-3">
                {/* Top Badges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {getActionIcon(m.action_type)}
                    <span className="text-[11px] font-mono text-zinc-300 font-semibold uppercase">
                      {m.target_skill_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>{m.estimated_duration}</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400">
                      {m.difficulty}
                    </span>
                  </div>
                </div>

                {/* Objective */}
                <h3 className="text-sm font-bold text-white leading-snug">
                  {m.objective}
                </h3>

                {/* Verification Criteria */}
                <div className="p-3 rounded-lg bg-[#050608] border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#35D9F2]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Academic Verification Requirement</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {m.completion_criteria}
                  </p>
                </div>

                {/* Verified Evidence Summary if completed */}
                {isCompleted && m.evidence_summary && (
                  <div className="p-2.5 rounded-lg bg-[#C5F45B]/10 border border-[#C5F45B]/30 text-[11px] font-mono text-[#C5F45B] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{m.evidence_summary}</span>
                  </div>
                )}

                {/* Feedback Alert upon Verification check */}
                {currentAlert && (
                  <div className={`p-3 rounded-lg border text-xs leading-relaxed animate-fadeIn ${
                    currentAlert.success
                      ? 'bg-[#C5F45B]/10 border-[#C5F45B]/30 text-[#C5F45B]'
                      : 'bg-amber-400/10 border-amber-400/30 text-amber-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      {currentAlert.success ? (
                        <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#C5F45B]" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                      )}
                      <span>{currentAlert.message}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab(getActionTab(m.action_type))}
                    className="text-xs font-mono text-[#35D9F2] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Launch Task</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {isCompleted ? (
                  <span className="text-xs font-mono text-[#C5F45B] flex items-center gap-1.5 font-bold ml-auto">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Evidence Verified</span>
                  </span>
                ) : (
                  <Button
                    onClick={() => handleVerify(m.id)}
                    disabled={isVerifying}
                    size="sm"
                    className="ml-auto bg-white/10 text-white font-mono text-xs hover:bg-white/20 transition-all flex items-center gap-1.5"
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Evidence...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-[#35D9F2]" />
                        <span>Verify Academic Proof</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
