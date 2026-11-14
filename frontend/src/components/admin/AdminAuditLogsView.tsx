import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Search, 
  Clock, 
  UserCheck, 
  UserX, 
  AlertTriangle,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { AdminAuditLogItem } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface AdminAuditLogsViewProps {
  logs: AdminAuditLogItem[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export const AdminAuditLogsView: React.FC<AdminAuditLogsViewProps> = ({
  logs,
  loading,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const actions = Array.from(new Set(logs.map(l => l.action).filter(Boolean)));

  const filtered = logs.filter(l => {
    const detailsStr = typeof l.details === 'string' ? l.details : JSON.stringify(l.details);
    const matchesSearch = 
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.admin_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detailsStr.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'all' || l.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'APPROVE_STUDENT':
        return <Badge variant="lime" size="sm">APPROVE STUDENT</Badge>;
      case 'REJECT_STUDENT':
        return <Badge variant="crimson" size="sm">REJECT STUDENT</Badge>;
      case 'UPDATE_STATUS':
        return <Badge variant="amber" size="sm">STATUS UPDATE</Badge>;
      case 'CREATE_RESOURCE':
        return <Badge variant="cyan" size="sm">CURRICULUM ADD</Badge>;
      case 'DELETE_RESOURCE':
        return <Badge variant="crimson" size="sm">CURRICULUM DELETE</Badge>;
      default:
        return <Badge variant="cyan" size="sm">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="cyan" size="sm">GOVERNANCE & SECURITY</Badge>
            <span className="text-zinc-500 text-xs font-mono">{filtered.length} Immutable Event{filtered.length === 1 ? '' : 's'}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Administrative Audit Trail
          </h1>
          <p className="text-xs text-[#929CA3] mt-1">
            Cryptographically chronological records of student approvals, status modifications, and curriculum updates.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          {loading ? 'Refreshing...' : 'Refresh Logs'}
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search audit trail by administrator, student, or action..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0F12] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#35D9F2]"
          />
        </div>

        {actions.length > 0 && (
          <div className="flex items-center gap-2 bg-[#0B0F12] border border-white/10 rounded-xl px-3 py-1.5">
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="bg-transparent text-xs text-zinc-300 focus:outline-none font-mono"
            >
              <option value="all">All Actions</option>
              {actions.map((act, idx) => (
                <option key={idx} value={act}>{act}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div className="py-16 text-center text-xs text-zinc-400 font-mono">
          Querying secure audit ledger...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0B0F12] border border-white/5 rounded-2xl p-12 text-center">
          <Terminal className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-white">No Audit Events Logged</h3>
          <p className="text-xs text-zinc-400 mt-1">Actions performed by administrators will appear here chronologically.</p>
        </div>
      ) : (
        <div className="bg-[#0B0F12] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080C0E] border-b border-white/5 text-zinc-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Admin Operator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Payload / Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filtered.map(log => {
                  let parsedDetails = log.details;
                  if (typeof parsedDetails === 'string') {
                    try {
                      parsedDetails = JSON.parse(parsedDetails);
                    } catch {}
                  }

                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-zinc-400 text-[11px] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-zinc-300">
                        {log.admin_email}
                      </td>
                      <td className="py-3 px-4">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="py-3 px-4 text-zinc-400 text-[11px]">
                        <span className="text-zinc-500">{log.target_type}:</span> {log.target_id.slice(0, 12)}...
                      </td>
                      <td className="py-3 px-4 text-[11px] text-zinc-300 max-w-xs truncate">
                        {typeof parsedDetails === 'object' ? (
                          <span>
                            {Object.entries(parsedDetails).map(([k, v]) => `${k}=${v}`).join(' | ')}
                          </span>
                        ) : (
                          String(parsedDetails)
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
