import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  RotateCw, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Terminal,
  Zap
} from 'lucide-react';
import { AgentLog } from '../../types';
import { api } from '../../api/client';
import { Badge } from '../common/Badge';
import { CrimsonButton } from '../common/CrimsonButton';

export const AgentTelemetryView: React.FC<{ onRefreshAll: () => void }> = ({ onRefreshAll }) => {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [agentsStatus, setAgentsStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cycling, setCycling] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lData, sData] = await Promise.all([
        api.getAgentLogs(),
        api.getAgentsStatus()
      ]);
      setLogs(lData);
      setAgentsStatus(sData);
    } catch (err) {
      console.error('Failed to load agent telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunCycle = async () => {
    try {
      setCycling(true);
      await api.runAgentCycle();
      await fetchData();
      onRefreshAll();
    } catch (err) {
      console.error('Failed to trigger agent cycle:', err);
    } finally {
      setCycling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 font-mono text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span>Polling Agent Telemetry Bus...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="crimson" size="sm">TELEMETRY & DAG TRACING</Badge>
            <span className="text-xs font-mono text-zinc-500">Real-Time Execution Bus</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Agent Orchestration Stream
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Live execution log of all autonomous agents exchanging structured inputs and outputs via the Central Orchestrator.
          </p>
        </div>

        <CrimsonButton
          onClick={handleRunCycle}
          disabled={cycling}
          variant="primary"
          size="sm"
          icon={<RotateCw className={`w-3.5 h-3.5 ${cycling ? 'animate-spin' : ''}`} />}
        >
          {cycling ? 'Orchestrating Cycle...' : 'Run Full Intelligence Cycle'}
        </CrimsonButton>
      </div>

      {/* Agents Roster Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {agentsStatus?.agents?.map((agent: any, idx: number) => (
          <div key={idx} className="glass-panel p-3.5 rounded-xl border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">#{idx + 1}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-xs font-bold text-white truncate">{agent.name}</div>
            <div className="text-[10px] text-zinc-500 truncate">{agent.role}</div>
            <div className="pt-1 text-[9px] font-mono text-emerald-400/90 uppercase font-semibold">
              ● {agent.status}
            </div>
          </div>
        ))}
      </div>

      {/* Telemetry Trace Log Table */}
      <div className="glass-panel rounded-2xl border border-white/8 overflow-hidden">
        <div className="p-4 bg-zinc-950 border-b border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 font-semibold">
            <Terminal className="w-4 h-4 text-rose-400" />
            <span>IMMUTABLE AGENT AUDIT LOGS</span>
          </div>
          <span className="text-xs font-mono text-zinc-500">{logs.length} Trace Records Available</span>
        </div>

        <div className="divide-y divide-white/5">
          {logs.map((log) => (
            <div key={log.id} className="p-4 sm:p-5 hover:bg-zinc-900/40 transition-colors space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/50">
                    {log.agent_name}
                  </span>
                  <span className="text-zinc-300 font-semibold">{log.action}</span>
                </div>

                <div className="flex items-center gap-3 text-zinc-500 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Zap className="w-3 h-3" />
                    {log.execution_time_ms}ms
                  </span>
                  <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                  <span className="text-zinc-400 uppercase font-bold">{log.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs font-mono">
                <div className="p-2.5 rounded bg-zinc-950/80 border border-white/5 text-zinc-400">
                  <span className="text-zinc-600 block text-[10px] uppercase">Input Payload:</span>
                  <span className="text-zinc-300">{log.input_summary}</span>
                </div>
                <div className="p-2.5 rounded bg-zinc-950/80 border border-white/5 text-zinc-400">
                  <span className="text-rose-500/80 block text-[10px] uppercase">Agent Response:</span>
                  <span className="text-zinc-200">{log.output_summary}</span>
                </div>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="p-12 text-center text-zinc-500 font-mono text-xs">
              No agent telemetry logs found. Click "Run Full Intelligence Cycle" to trigger the multi-agent DAG.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
