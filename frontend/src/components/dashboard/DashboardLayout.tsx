import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Compass, 
  Target, 
  Gauge, 
  ClipboardCheck, 
  Activity, 
  Settings, 
  Menu, 
  X,
  Cpu,
  User,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { LearnerProfile, ProgressOverview } from '../../types';

export type DashboardTab = 
  | 'overview' 
  | 'skills' 
  | 'careers' 
  | 'roadmap' 
  | 'assessments' 
  | 'mentor' 
  | 'agents' 
  | 'settings';

interface DashboardLayoutProps {
  currentTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  profile: LearnerProfile | null;
  progress: ProgressOverview | null;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentTab,
  onTabChange,
  profile,
  progress,
  children
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'overview' as DashboardTab, label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'skills' as DashboardTab, label: 'Skill Profile & Gaps', icon: <Gauge className="w-4 h-4" /> },
    { id: 'careers' as DashboardTab, label: 'Career Matching', icon: <Target className="w-4 h-4" /> },
    { id: 'roadmap' as DashboardTab, label: 'Learning Roadmap', icon: <Compass className="w-4 h-4" /> },
    { id: 'assessments' as DashboardTab, label: 'Assessments', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'mentor' as DashboardTab, label: 'AI Mentor', icon: <Sparkles className="w-4 h-4 text-rose-400" /> },
    { id: 'agents' as DashboardTab, label: 'Agent Telemetry', icon: <Activity className="w-4 h-4" /> },
    { id: 'settings' as DashboardTab, label: 'Settings & Profile', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleSelectTab = (tab: DashboardTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-[#050507]">
      {/* Mobile Top Header for switching tabs */}
      <div className="md:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-white/8">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-rose-600/20 border border-rose-500/40 flex items-center justify-center font-bold text-rose-400 text-xs">
            N
          </div>
          <span className="font-semibold text-white text-sm">
            {navigationItems.find(i => i.id === currentTab)?.label}
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-zinc-900 text-zinc-300 border border-white/10"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-white/10 p-3 space-y-1">
          {navigationItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentTab === item.id 
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/8 bg-[#090a0f] p-4 justify-between shrink-0">
        <div className="space-y-6">
          {/* Active Learner Micro-Card */}
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-900/60 to-zinc-900 border border-rose-500/30 flex items-center justify-center font-bold text-rose-300 text-sm">
                {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'AM'}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-bold text-white truncate">
                  {profile?.full_name || 'Alex Mercer'}
                </div>
                <div className="text-[11px] text-zinc-400 truncate">
                  {progress?.career.title || 'Full Stack Developer'}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-500">Readiness:</span>
              <span className="text-rose-400 font-bold">{progress?.overall_readiness_score || 52}%</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-3 py-1 font-semibold">
              Workspace Modules
            </div>
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  currentTab === item.id
                    ? 'bg-rose-950/60 text-white border border-rose-500/40 shadow-[0_0_15px_rgba(225,29,72,0.25)]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {currentTab === item.id && (
                  <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer info & telemetry indicator */}
        <div className="pt-4 border-t border-white/5 space-y-2">
          <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-white/5 text-[11px] font-mono text-zinc-400 space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Multi-Agent
              </span>
              <span className="text-zinc-300">Synchronized</span>
            </div>
            <div className="flex items-center justify-between text-zinc-500">
              <span>DB: SQLite Local</span>
              <span>FastAPI 0.115</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
