import React from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  BookOpen, 
  FileText, 
  ShieldCheck, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { UserResponse } from '../../types';
import { Badge } from '../common/Badge';

export type AdminTab = 'dashboard' | 'registrations' | 'students' | 'curriculum' | 'audit-logs';

interface AdminPortalLayoutProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  user: UserResponse;
  pendingCount?: number;
  onSignOut: () => void;
  onSwitchToStudentView?: () => void;
  children: React.ReactNode;
}

export const AdminPortalLayout: React.FC<AdminPortalLayoutProps> = ({
  currentTab,
  onTabChange,
  user,
  pendingCount = 0,
  onSignOut,
  onSwitchToStudentView,
  children
}) => {
  const navItems = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard & Metrics', icon: LayoutDashboard },
    { 
      id: 'registrations' as AdminTab, 
      label: 'Registration Queue', 
      icon: UserCheck, 
      badge: pendingCount > 0 ? pendingCount : undefined 
    },
    { id: 'students' as AdminTab, label: 'Student Directory', icon: Users },
    { id: 'curriculum' as AdminTab, label: 'Curriculum Resources', icon: BookOpen },
    { id: 'audit-logs' as AdminTab, label: 'Audit Trail & Security', icon: FileText },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-[#050608]">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-white/5 bg-[#080C0E] flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          {/* Admin Identity Card */}
          <div className="p-3.5 rounded-2xl bg-[#0E1317] border border-white/5">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#35D9F2]/10 border border-[#35D9F2]/30 flex items-center justify-center text-[#35D9F2] font-mono font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white tracking-tight truncate max-w-[140px]">
                  {user.full_name || 'System Administrator'}
                </div>
                <div className="text-[10px] text-[#35D9F2] font-mono flex items-center gap-1">
                  <span>ROOT ADMIN</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5F45B] animate-pulse" />
                </div>
              </div>
            </div>
            <div className="text-[10px] text-zinc-500 font-mono truncate">
              {user.email}
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-3 mb-2 font-semibold">
              ADMINISTRATION CONTROLS
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#121A1F] text-[#35D9F2] border border-[#35D9F2]/30 shadow-[0_0_15px_rgba(53,217,242,0.08)]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#35D9F2]' : 'text-zinc-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-md bg-[#35D9F2] text-black text-[10px] font-mono font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-white/5 space-y-2">
          {onSwitchToStudentView && (
            <button
              onClick={onSwitchToStudentView}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors font-mono"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C5F45B]" />
                <span>Student Sandbox View</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </button>
          )}

          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors font-mono"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content View Container */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
};
