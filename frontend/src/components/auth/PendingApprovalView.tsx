import React, { useState } from 'react';
import { ShieldCheck, Clock, AlertTriangle, ArrowRight, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react';
import { UserResponse } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { api } from '../../api/client';

interface PendingApprovalViewProps {
  user: UserResponse;
  onRefreshUser: () => Promise<void>;
  onSignOut: () => void;
}

export const PendingApprovalView: React.FC<PendingApprovalViewProps> = ({
  user,
  onRefreshUser,
  onSignOut,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const isRejected = user.status === 'rejected';

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshUser();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="flex-1 min-h-[80vh] flex items-center justify-center p-6 bg-[#050608] relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-tr from-[#35D9F2]/10 via-[#C5F45B]/5 to-transparent blur-[120px] pointer-events-none rounded-full" />

      <div className="relative max-w-xl w-full bg-[#0B0F12] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
        {/* Status Header Badge */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#11171B] border border-white/10 flex items-center justify-center font-bold text-[#35D9F2] font-mono text-sm shadow-inner">
              N
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">NEXORA ACADEMIC PORTAL</span>
              <h2 className="text-sm font-semibold text-white">Identity Verification Protocol</h2>
            </div>
          </div>
          <Badge variant={isRejected ? 'crimson' : 'amber'} size="sm">
            {isRejected ? 'REGISTRATION REJECTED' : 'PENDING ADMINISTRATIVE APPROVAL'}
          </Badge>
        </div>

        {/* Central Icon & Headline */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center border shadow-lg transition-transform hover:scale-105 duration-300">
            {isRejected ? (
              <div className="w-full h-full rounded-2xl bg-rose-500/10 border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-rose-400 animate-pulse" />
              </div>
            ) : (
              <div className="w-full h-full rounded-2xl bg-[#35D9F2]/10 border-[#35D9F2]/30 flex items-center justify-center">
                <Clock className="w-8 h-8 text-[#35D9F2] animate-pulse" />
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            {isRejected ? 'Registration Status Update' : 'Your Enrollment Is Under Review'}
          </h1>
          <p className="text-sm text-[#929CA3] max-w-md mx-auto leading-relaxed">
            {isRejected
              ? 'Institutional administration has reviewed your application and requested additional information before granting full platform access.'
              : 'Thank you for registering with NEXORA. To preserve academic integrity and tailored guidance, institutional administration verifies every student account.'}
          </p>
        </div>

        {/* Rejection notice box if rejected */}
        {isRejected && user.rejection_reason && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs">
            <div className="font-semibold text-rose-300 mb-1 flex items-center gap-1.5 font-mono">
              <AlertTriangle className="w-3.5 h-3.5" /> REASON SPECIFIED BY ADMINISTRATOR:
            </div>
            <p className="text-rose-200/90 leading-relaxed pl-5">{user.rejection_reason}</p>
          </div>
        )}

        {/* Academic Profile Details Summary Card */}
        <div className="bg-[#11171B] border border-white/5 rounded-2xl p-5 mb-8 space-y-3 font-mono text-xs">
          <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-2">
            SUBMITTED CREDENTIALS
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-zinc-400">STUDENT NAME</span>
            <span className="text-white font-medium">{user.full_name}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-zinc-400">INSTITUTIONAL EMAIL</span>
            <span className="text-[#35D9F2] font-medium">{user.email}</span>
          </div>
          {user.institution && (
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-zinc-400">INSTITUTION</span>
              <span className="text-white font-medium">{user.institution}</span>
            </div>
          )}
          {user.department && (
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-zinc-400">DEPARTMENT</span>
              <span className="text-white font-medium">{user.department}</span>
            </div>
          )}
          {user.graduation_year && (
            <div className="flex justify-between py-1.5">
              <span className="text-zinc-400">CLASS OF</span>
              <span className="text-white font-medium">{user.graduation_year}</span>
            </div>
          )}
        </div>

        {/* Next Steps Guide */}
        <div className="space-y-3 mb-8">
          <div className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            VERIFICATION PROCESS
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#080C0E] border border-white/5 text-xs text-zinc-300">
              <div className="w-5 h-5 rounded-full bg-[#35D9F2]/20 text-[#35D9F2] flex items-center justify-center text-[10px] font-bold mt-0.5">
                1
              </div>
              <div>
                <span className="text-white font-medium">Academic Roster Cross-Check</span>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  Admin portal reviews institution email and graduation batch.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#080C0E] border border-white/5 text-xs text-zinc-300">
              <div className="w-5 h-5 rounded-full bg-[#C5F45B]/20 text-[#C5F45B] flex items-center justify-center text-[10px] font-bold mt-0.5">
                2
              </div>
              <div>
                <span className="text-white font-medium">AI Career Twin Provisioning</span>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  Once approved, your neural skill graph and personalized roadmaps activate automatically.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            variant="primary"
            size="md"
            className="w-full sm:flex-1"
            onClick={handleRefresh}
            disabled={refreshing}
            icon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            {refreshing ? 'Checking Approval...' : 'Check Approval Status'}
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="w-full sm:w-auto"
            onClick={onSignOut}
            icon={<LogOut className="w-4 h-4" />}
          >
            Sign Out
          </Button>
        </div>

        {/* Footer support notice */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-zinc-500 font-mono">
            Need urgent verification? Contact your campus department administrator at{' '}
            <span className="text-zinc-400">admin@nexora.ai</span>
          </p>
        </div>
      </div>
    </div>
  );
};
