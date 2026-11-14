import React, { useState, useEffect } from 'react';
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
  BarChart2,
  Code2,
  Clock,
  Sparkles,
  Building2,
  Activity,
  Cpu
} from 'lucide-react';
import { AdminStats, AdminPlatformHealth } from '../../types';
import { api } from '../../api/client';
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
  const [platformHealth, setPlatformHealth] = useState<AdminPlatformHealth | null>(null);

  useEffect(() => {
    api.getPlatformHealth()
      .then(setPlatformHealth)
      .catch(err => console.warn('Could not fetch platform health:', err));
  }, []);

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
    new_registrations_today: 0,
    active_students: 0,
    pending_registrations: 0,
    approved_students: 0,
    suspended_students: 0,
    assessment_submissions: 0,
    coding_submissions: 0,
    project_submissions: 0,
    skill_gap_distribution: {},
    registration_trends: [],
    recent_registrations: []
  };

  const topGaps = Object.entries(defaultStats.skill_gap_distribution || {});
  const maxGapCount = Math.max(...topGaps.map(([_, count]) => count), 1);
  const activeCount = defaultStats.active_students || defaultStats.approved_students || 0;
  const practiceCount = (defaultStats.coding_submissions || 0) + (defaultStats.project_submissions || 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="cyan" size="sm">ENTERPRISE ADMINISTRATION</Badge>
            <span className="text-zinc-500 text-xs font-mono">NODE: REALTIME TELEMETRY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Institutional Oversight & Platform Intelligence
          </h1>
          <p className="text-xs text-[#929CA3] mt-1">
            Live telemetry monitoring student signups, skill gap clustering, assessment evaluations, and system activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigateTab('students')}
            icon={<Users className="w-3.5 h-3.5" />}
          >
            Student Directory
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigateTab('registrations')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View Live Intake Feed
          </Button>
        </div>
      </div>

      {/* Live Platform Health Diagnostic Panel */}
      {platformHealth && (
        <div className="bg-[#0B0F12] border border-white/10 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C5F45B] animate-pulse" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">System Status: {platformHealth.status}</span>
              <Badge variant="cyan" size="sm">{platformHealth.database_status}</Badge>
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              AI Engine: <span className="text-[#35D9F2]">{platformHealth.model_version}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
            <div className="bg-[#11171B] p-3 rounded-xl border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase">Enrolled Learners</div>
              <div className="text-lg font-bold text-white mt-0.5">{platformHealth.total_registered_learners}</div>
            </div>
            <div className="bg-[#11171B] p-3 rounded-xl border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase">Active Students</div>
              <div className="text-lg font-bold text-[#C5F45B] mt-0.5">{platformHealth.active_students}</div>
            </div>
            <div className="bg-[#11171B] p-3 rounded-xl border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase">Admin Accounts</div>
              <div className="text-lg font-bold text-amber-400 mt-0.5">{platformHealth.admin_accounts}</div>
            </div>
            <div className="bg-[#11171B] p-3 rounded-xl border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase">Lessons Mastered</div>
              <div className="text-lg font-bold text-[#35D9F2] mt-0.5">{platformHealth.total_assessments_taken}</div>
            </div>
            <div className="bg-[#11171B] p-3 rounded-xl border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase">Coding Solutions</div>
              <div className="text-lg font-bold text-white mt-0.5">{platformHealth.total_coding_solutions}</div>
            </div>
            <div className="bg-[#11171B] p-3 rounded-xl border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase">Project Milestones</div>
              <div className="text-lg font-bold text-[#C5F45B] mt-0.5">{platformHealth.total_project_milestones}</div>
            </div>
          </div>
        </div>
      )}

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

        {/* New Signups Today */}
        <div className="bg-[#0B0F12] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#C5F45B]">Today's Intake</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#C5F45B]" />
          </div>
          <div className="text-2xl font-bold text-[#C5F45B] font-mono">{defaultStats.new_registrations_today || 0}</div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">New Signups</div>
        </div>

        {/* Active Learners */}
        <div className="bg-[#0B0F12] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">Active Learners</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 font-mono">{activeCount}</div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Immediate Access</div>
        </div>

        {/* Suspended Accounts */}
        <div className="bg-[#0B0F12] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Suspended</span>
            <AlertOctagon className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-400 font-mono">{defaultStats.suspended_students || 0}</div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Hold Status</div>
        </div>

        {/* Assessment Submissions */}
        <div className="bg-[#0B0F12] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300">Assessments</span>
            <Award className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">{defaultStats.assessment_submissions}</div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Evaluations Run</div>
        </div>

        {/* Practice Lab Submissions */}
        <div className="bg-[#0B0F12] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#35D9F2]">Labs & Projects</span>
            <Code2 className="w-3.5 h-3.5 text-[#35D9F2]" />
          </div>
          <div className="text-2xl font-bold text-[#35D9F2] font-mono">{practiceCount}</div>
          <div className="text-[10px] text-zinc-500 mt-1 font-mono">Code Submissions</div>
        </div>
      </div>

      {/* Analytics Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Velocity Trends */}
        <div className="bg-[#0B0F12] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-white">Student Registration Velocity</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Daily registered student volume across the 7-day intake window.</p>
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
                <span>Earliest: {defaultStats.registration_trends[0]?.date}</span>
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

      {/* Live Recent Registrations Feed */}
      <div className="bg-[#0B0F12] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Recent Student Registrations</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Live platform signup activity with instant active status.</p>
          </div>
          <button
            onClick={() => onNavigateTab('registrations')}
            className="text-xs font-mono text-[#35D9F2] hover:underline flex items-center gap-1"
          >
            <span>View Full Intake Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {(!defaultStats.recent_registrations || defaultStats.recent_registrations.length === 0) ? (
          <div className="py-8 text-center text-xs text-zinc-500 font-mono">
            No recent registrations recorded.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {defaultStats.recent_registrations.map((st) => (
              <div key={st.id} className="p-3.5 rounded-xl bg-[#080C0E] border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white text-xs truncate max-w-[150px]">{st.full_name}</span>
                  <Badge variant="lime" size="sm">ACTIVE</Badge>
                </div>
                <div className="text-[11px] font-mono text-zinc-500 truncate">{st.email}</div>
                <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-zinc-400 border-t border-white/5">
                  <span className="truncate max-w-[140px] text-[#35D9F2]">{st.target_career_title || 'Software Engineer'}</span>
                  <span>{new Date(st.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
