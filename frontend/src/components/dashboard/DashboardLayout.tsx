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
  BookOpen,
  Code2,
  FolderGit2,
  Mic2,
  FileSpreadsheet,
  Award,
  TrendingUp,
  User,
  LogOut,
  ChevronRight,
  Shield,
  GitFork,
  Cpu,
  Flame
} from 'lucide-react';
import { LearnerProfile, ProgressOverview } from '../../types';

export type DashboardTab = 
  | 'overview' 
  | 'career-twin'
  | 'skill-graph'
  | 'project-recommendations'
  | 'industry-trends'
  | 'skills' 
  | 'careers' 
  | 'learning' 
  | 'roadmap' 
  | 'assessments' 
  | 'coding-lab'
  | 'project-studio'
  | 'interview-sim'
  | 'resume-analyzer'
  | 'mentor' 
  | 'achievements'
  | 'analytics'
  | 'settings'
  | 'agents';

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

  const sections = [
    {
      category: 'Signature Intelligence',
      items: [
        { id: 'overview' as DashboardTab, label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'career-twin' as DashboardTab, label: 'AI Career Twin', icon: <Sparkles className="w-4 h-4 text-[#35D9F2]" />, highlight: 'cyan' },
        { id: 'skill-graph' as DashboardTab, label: 'Skill Prerequisite DAG', icon: <GitFork className="w-4 h-4" /> },
        { id: 'project-recommendations' as DashboardTab, label: 'AI Project Engine', icon: <FolderGit2 className="w-4 h-4 text-[#C5F45B]" />, highlight: 'lime' },
        { id: 'industry-trends' as DashboardTab, label: 'Industry Trends & Data', icon: <TrendingUp className="w-4 h-4" /> },
      ]
    },
    {
      category: 'Core Curriculum',
      items: [
        { id: 'skills' as DashboardTab, label: 'Skill Profile & Gaps', icon: <Gauge className="w-4 h-4" /> },
        { id: 'careers' as DashboardTab, label: 'Career Explorer', icon: <Target className="w-4 h-4" /> },
        { id: 'learning' as DashboardTab, label: 'Learning Center', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'roadmap' as DashboardTab, label: 'My Roadmap', icon: <Compass className="w-4 h-4" /> },
        { id: 'assessments' as DashboardTab, label: 'Adaptive Assessments', icon: <ClipboardCheck className="w-4 h-4" /> },
      ]
    },
    {
      category: 'Practice & Career Labs',
      items: [
        { id: 'coding-lab' as DashboardTab, label: 'Coding Practice Lab', icon: <Code2 className="w-4 h-4" /> },
        { id: 'project-studio' as DashboardTab, label: 'Project Studio', icon: <FolderGit2 className="w-4 h-4" /> },
        { id: 'interview-sim' as DashboardTab, label: 'Interview Simulator', icon: <Mic2 className="w-4 h-4" /> },
        { id: 'resume-analyzer' as DashboardTab, label: 'Resume & ATS Analyzer', icon: <FileSpreadsheet className="w-4 h-4" /> },
        { id: 'mentor' as DashboardTab, label: 'Contextual AI Mentor', icon: <Sparkles className="w-4 h-4 text-[#35D9F2]" /> },
      ]
    },
    {
      category: 'Performance & Systems',
      items: [
        { id: 'achievements' as DashboardTab, label: 'Achievements & Proof', icon: <Award className="w-4 h-4" /> },
        { id: 'analytics' as DashboardTab, label: 'Progress & Goals', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'agents' as DashboardTab, label: 'Agent DAG Telemetry', icon: <Activity className="w-4 h-4" /> },
        { id: 'settings' as DashboardTab, label: 'Settings & Profile', icon: <Settings className="w-4 h-4" /> },
      ]
    }
  ];

  const allItems = sections.flatMap(s => s.items);

  const handleSelectTab = (tab: DashboardTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-[#050608]">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0B0F12] border-b border-white/8">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#35D9F2]/20 border border-[#35D9F2]/40 flex items-center justify-center font-bold text-[#35D9F2] text-xs">
            N
          </div>
          <span className="font-semibold text-white text-sm">
            {allItems.find(i => i.id === currentTab)?.label}
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-[#11171B] text-zinc-300 border border-white/10"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0F12] border-b border-white/10 p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {sections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-3">
                {sec.category}
              </span>
              {sec.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    currentTab === item.id 
                      ? 'bg-[#161D22] text-[#35D9F2] font-semibold border border-[#35D9F2]/30' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Desktop Sidebar (w-64) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/8 bg-[#07090C] p-4 justify-between shrink-0 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto custom-scrollbar">
        <div className="space-y-5">
          {/* Active Learner Micro-Card */}
          <div className="p-3.5 rounded-xl bg-[#0B0F12] border border-white/8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#161D22] to-[#0B0F12] border border-[#35D9F2]/30 flex items-center justify-center font-bold text-[#35D9F2] text-xs font-mono">
                {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'AM'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">
                  {profile?.full_name || 'Alex Mercer'}
                </div>
                <div className="text-[11px] text-[#929CA3] truncate">
                  {progress?.career.title || 'Full Stack Developer'}
                </div>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>Readiness:</span>
              <span className="text-[#35D9F2] font-semibold">{progress?.overall_readiness_score || 78}%</span>
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="space-y-5">
            {sections.map((sec, secIdx) => (
              <div key={secIdx} className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-3 mb-1">
                  {sec.category}
                </div>
                {sec.items.map(item => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#11171B] text-[#35D9F2] font-semibold border border-[#35D9F2]/30 shadow-[0_0_15px_rgba(53,217,242,0.1)]'
                          : 'text-[#929CA3] hover:text-white hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={isActive ? 'text-[#35D9F2]' : 'text-zinc-500'}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#35D9F2] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-white/8 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 px-2">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5F45B] animate-pulse" />
              <span>10 AGENTS SYNCED</span>
            </span>
            <span className="text-zinc-400">v2.5</span>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
};