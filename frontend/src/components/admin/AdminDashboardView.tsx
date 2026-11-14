import React from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  AlertOctagon, 
  CheckCircle2, 
  TrendingUp, 
  Award, 
  ArrowRight,
  ShieldAlert,
  BarChart2
} from 'lucide-react';
import { AdminStats } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { AdminTab } from './AdminPortalLayout';

interface AdminDashboardViewProps {
  stats: AdminStats | null;
  loading: boolean;
  onNavigateTab: (tab: AdminTab) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  stats,
  loading,
  onNavigateTab
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-zinc-400 font-mono text-xs">
          <div className="w-4 h-4 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing Institutional Metrics...</span>
        </div>
      </div>
    );
  }

  const defaultStats: AdminStats = stats || {
    total_students: 0,
    pending_registrations: 0,
    approved_students: 0,
    rejected_registrations: 0,
    suspended_students: 0,
    assessment_submissions: 0,
    skill_gap_distribution: {},
    registration_trends: []
  };

  const topGaps = Object.entries(defaultStats.skill_gap_distribution || {});
  const maxGapCount = Math.max(...topGaps.map(([_, count]) => count), 1);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="cyan" size="sm">ENTERPRISE ADMINISTRATION</Badge>
            <span className="text-zinc-500 text-xs font-mono">NODE: REGION-1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Institutional Oversight & Career Analytics
          </h1>
          <p className="text-xs text-[#929CA3] mt-1">
            Monitor real-time student registration pipelines, skill gap clustering, and platform engagement.
          </p>
        </div>

        {defaultStats.pending_registrations > 0 && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigateTab('registrations')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Review {defaultStats.pending_registrations} Pending Registrations
          </Button>
        )}
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="bg-[#0B0F12] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Total Students</span>
            <Users className="w-3.5 h-3.5 text-[#35D9F2]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{defaultStats.total_students}</div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Enrolled Roster</div>
        </div>

        {/* Pending Approvals */}
        <div className={`border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
          defaultStats.pending_registrations > 0 
            ? 'bg-[#35D9F2]/5 border-[#35D9F2]/30 hover:border-[#35D9F2]' 
            : 'bg-[#0B0F12] border-white/5'
        }`}
        onClick={() => onNavigateTab('registrations')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300">Pending</span>
            <UserCheck className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">{defaultStats.pending_registrations}</div>
          <div className="text-[10px] text-amber-400/80 mt-1 font-mono">Awaiting Review →</div>
        </div>

        {/* Approved Active */}
        <div className="bg-[#0B0F12] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#C5F45B]">Approved</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#C5F45B]" />
          </div>
          <div className="text-2xl font-bold text-[#C5F45B] font-mono">{defaultStats.approved_students}</div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Active Learners</div>
        </div>

        {/* Rejected Registrations */}
        <div className="bg-[#0B0F12] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400">Rejected</span>
            <UserX className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">{defaultStats.rejected_registrations}</div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Audit Logged</div>
        </div>

        {/* Suspended Accounts */}
        <div className="bg-[#0B0F12] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Suspended</span>
            <AlertOctagon className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-400 font-mono">{defaultStats.suspended_students}</div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Hold Status</div>
        </div>

        {/* Assessment Submissions */}
        <div className="bg-[#0B0F12] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">Assessments</span>
            <Award className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 font-mono">{defaultStats.assessment_submissions}</div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Total Evaluations</div>
        </div>
      </div>

      {/* Analytics Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Velocity Trends */}
        <div className="bg-[#0B0F12] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-white">Student Registration Intake</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Daily registered applicant velocity over the last 7 calendar days.</p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#35D9F2]" />
          </div>

          {defaultStats.registration_trends.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500 font-mono">
              No registration history logged in the current window.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="h-44 flex items-end gap-3 pt-6 pb-2 border-b border-white/5">
                {defaultStats.registration_trends.map((day, idx) => {
                  const maxDayCount = Math.max(...defaultStats.registration_trends.map(d => d.count), 1);
                  const heightPercent = Math.max((day.count / maxDayCount) * 100, 12);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[10px] font-mono text-zinc-400 group-hover:text-white transition-colors">
                        {day.count}
                      </span>
                      <div 
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-[#35D9F2]/30 to-[#35D9F2] rounded-t-md group-hover:brightness-125 transition-all shadow-[0_0_10px_rgba(53,217,242,0.15)]"
                      />
                      <span className="text-[9px] font-mono text-zinc-500 truncate w-full text-center">
                        {day.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 pt-1">
                <span>Start: {defaultStats.registration_trends[0]?.date}</span>
                <span>Latest: {defaultStats.registration_trends[defaultStats.registration_trends.length - 1]?.date}</span>
              </div>
            </div>
          )}
        </div>

        {/* Skill Gap Cluster Distribution */}
        <div className="bg-[#0B0F12] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-white">Institutional Skill Gaps</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Top technical areas where learners exhibit &lt;60% proficiency.</p>
            </div>
            <BarChart2 className="w-4 h-4 text-[#C5F45B]" />
          </div>

          {topGaps.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500 font-mono">
              All enrolled students currently meet or exceed minimum skill benchmarks.
            </div>
          ) : (
            <div className="space-y-4">
              {topGaps.map(([skillName, gapCount], idx) => {
                const percent = Math.round((gapCount / maxGapCount) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-zinc-200">{skillName}</span>
                      <span className="font-mono text-xs text-[#35D9F2]">{gapCount} students affected</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#11171B] overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-[#35D9F2] to-[#C5F45B] rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
