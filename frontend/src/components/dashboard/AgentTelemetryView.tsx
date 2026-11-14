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
import { Button } from '../common/Button';

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
          <div className="w-4 h-4 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin" />
          <span>Polling Agent Telemetry Bus...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="cyan" size="sm">TELEMETRY & DAG TRACING</Badge>
            <span className="text-xs font-mono text-zinc-500">• Real-Time Execution Bus</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Agent Orchestration Stream
          </h1>
          <p className="text-sm text-[#929CA3] mt-1 max-w-2xl leading-relaxed">
            Live execution log of all autonomous agents exchanging structured inputs and outputs via the Central Orchestrator.
          </p>
        </div>

        <Button
          onClick={handleRunCycle}
          disabled={cycling}
          variant="primary"
          size="sm"
          icon={<RotateCw className={`w-3.5 h-3.5 ${cycling ? 'animate-spin' : ''}`} />}
        >
          {cycling ? 'Orchestrating Cycle...' : 'Run Full Intelligence Cycle'}
        </Button>
      </div>

      {/* Agents Roster Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {agentsStatus?.agents?.map((agent: any, idx: number) => (
          <div key={idx} className="bg-[#0B0F12] p-3.5 rounded-xl border border-white/8 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#35D9F2] font-bold uppercase">#{idx + 1}</span>
              <span className="w-2 h-2 rounded-full bg-[#C5F45B] animate-pulse" />
            </div>
            <div className="text-xs font-bold text-white truncate">{agent.name}</div>
            <div className="text-[10px] text-[#929CA3] truncate">{agent.role}</div>
            <div className="pt-1 text-[9px] font-mono text-[#C5F45B] uppercase font-semibold">
              ● {agent.status}
            </div>
          </div>
        ))}
      </div>

      {/* Telemetry Trace Log Table */}
      <div className="bg-[#0B0F12] rounded-2xl border border-white/8 overflow-hidden shadow-2xl">
        <div className="p-4 bg-[#11171B] border-b border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 font-semibold">
            <Terminal className="w-4 h-4 text-[#35D9F2]" />
            <span>IMMUTABLE AGENT AUDIT LOGS</span>
          </div>
          <span className="text-xs font-mono text-zinc-500">{logs.length} Trace Records Available</span>
        </div>

        <div className="divide-y divide-white/5">
          {logs.map((log) => (
            <div key={log.id} className="p-4 sm:p-5 hover:bg-white/[0.02] transition-colors space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#35D9F2] bg-[#35D9F2]/10 px-2 py-0.5 rounded border border-[#35D9F2]/30">
                    {log.agent_name}
                  </span>
                  <span className="text-zinc-200 font-semibold">{log.action}</span>
                </div>

                <div className="flex items-center gap-3 text-zinc-500 text-[11px]">
                  <span className="flex items-center gap-1 text-[#C5F45B]">
                    <Zap className="w-3 h-3" />
                    {log.execution_time_ms}ms
                  </span>
                  <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                  <span className="text-zinc-400 uppercase font-bold">{log.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs font-mono">
                <div className="p-2.5 rounded bg-[#050608] border border-white/5 text-zinc-400">
                  <span className="text-zinc-500 block text-[10px] uppercase">Input Payload:</span>
                  <span className="text-zinc-300">{log.input_summary}</span>
                </div>
                <div className="p-2.5 rounded bg-[#050608] border border-white/5 text-zinc-400">
                  <span className="text-[#35D9F2]/90 block text-[10px] uppercase">Agent Response:</span>
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