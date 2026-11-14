import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  RotateCw, 
  Sparkles, 
  ArrowRight, 
  Check
} from 'lucide-react';
import { Roadmap, Milestone } from '../../types';
import { api } from '../../api/client';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface RoadmapViewProps {
  onRefreshAll: () => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ onRefreshAll }) => {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const data = await api.getRoadmap();
      setRoadmap(data);
    } catch (err) {
      console.error('Failed to fetch roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleToggle = async (milestone: Milestone) => {
    const newStatus = milestone.status !== 'completed';
    try {
      setToggling(milestone.id);
      await api.toggleMilestone(milestone.id, newStatus);
      await fetchRoadmap();
      onRefreshAll();
    } catch (err) {
      console.error('Failed to toggle milestone:', err);
    } finally {
      setToggling(null);
    }
  };

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const updated = await api.generateRoadmap();
      setRoadmap(updated);
      onRefreshAll();
    } catch (err) {
      console.error('Failed to regenerate roadmap:', err);
    } finally {
      setRegenerating(false);
    }
  };

  if (loading || !roadmap) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 font-mono text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin" />
          <span>Synthesizing topological learning path...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="cyan" size="sm">TOPOLOGICAL SEQUENCE</Badge>
            <span className="text-xs font-mono text-zinc-500">• Roadmap Agent DAG</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {roadmap.title}
          </h1>
          <p className="text-sm text-[#929CA3] mt-1 max-w-2xl leading-relaxed">
            {roadmap.description}
          </p>
        </div>

        <Button
          onClick={handleRegenerate}
          disabled={regenerating}
          variant="outline"
          size="sm"
          icon={<RotateCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />}
        >
          {regenerating ? 'Calibrating...' : 'Re-sequence Path'}
        </Button>
      </div>

      {/* Progress Bar Ribbon */}
      <div className="bg-[#0B0F12] p-6 rounded-2xl border border-white/8 space-y-3 shadow-lg">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400">
            Roadmap Completion: <strong className="text-white">{roadmap.completed_milestones}</strong> of{' '}
            <strong className="text-white">{roadmap.total_milestones}</strong> Milestones
          </span>
          <span className="text-[#35D9F2] font-bold">{roadmap.progress_percentage}% Verified</span>
        </div>

        <div className="w-full bg-[#11171B] h-2.5 rounded-full overflow-hidden flex border border-white/5">
          <div 
            className="bg-[#35D9F2] h-full transition-all duration-500 shadow-[0_0_12px_rgba(53,217,242,0.4)]"
            style={{ width: `${roadmap.progress_percentage}%` }}
          />
        </div>
      </div>

      {/* Milestones Timeline */}
      <div className="space-y-4">
        {roadmap.milestones.map((milestone, idx) => {
          const isCompleted = milestone.status === 'completed';
          const isTogglingThis = toggling === milestone.id;

          return (
            <div
              key={milestone.id}
              className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isCompleted 
                  ? 'border-[#C5F45B]/30 bg-[#0B0F12]/80' 
                  : 'bg-[#0B0F12] border-white/8 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Milestone Toggle Checkbox */}
                <button
                  onClick={() => handleToggle(milestone)}
                  disabled={isTogglingThis}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-[#C5F45B]/20 text-[#C5F45B] border border-[#C5F45B]/40 shadow-[0_0_10px_rgba(197,244,91,0.3)]'
                      : 'bg-[#11171B] text-zinc-500 border border-white/10 hover:border-[#35D9F2] hover:text-[#35D9F2]'
                  }`}
                  title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-[#C5F45B]" />
                  ) : (
                    <span className="font-mono text-xs font-bold">{idx + 1}</span>
                  )}
                </button>

                {/* Milestone Objective & Title */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`text-base font-bold transition-colors ${
                      isCompleted ? 'text-zinc-400 line-through' : 'text-white'
                    }`}>
                      {milestone.title}
                    </h3>
                    <Badge variant={isCompleted ? 'lime' : 'cyan'} size="sm">
                      {isCompleted ? 'COMPLETED' : `STEP ${idx + 1}`}
                    </Badge>
                  </div>

                  <p className="text-xs text-[#929CA3] leading-relaxed max-w-2xl">
                    {milestone.objective}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-500 pt-1">
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <BookOpen className="w-3.5 h-3.5 text-[#35D9F2]" />
                      {milestone.resource_type}
                    </span>
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      ~{milestone.estimated_hours} hrs
                    </span>
                    {milestone.completed_at && (
                      <span className="text-[#C5F45B] text-[11px]">
                        ✓ Completed {new Date(milestone.completed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Toggle Button */}
              <button
                onClick={() => handleToggle(milestone)}
                disabled={isTogglingThis}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                  isCompleted
                    ? 'bg-[#11171B] hover:bg-white/5 text-zinc-400 border border-white/10'
                    : 'bg-[#35D9F2]/10 hover:bg-[#35D9F2]/20 text-[#35D9F2] border border-[#35D9F2]/30 shadow-[0_0_12px_rgba(53,217,242,0.15)]'
                }`}
              >
                {isTogglingThis ? 'Syncing...' : (isCompleted ? 'Reopen' : 'Mark Complete')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};