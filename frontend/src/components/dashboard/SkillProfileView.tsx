import React, { useState, useEffect } from 'react';
import { 
  Gauge, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Save, 
  Sparkles,
  Info,
  RotateCcw
} from 'lucide-react';
import { DetailedGap, SkillAnalysis, Skill } from '../../types';
import { api } from '../../api/client';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface SkillProfileViewProps {
  onRefreshProgress: () => void;
}

export const SkillProfileView: React.FC<SkillProfileViewProps> = ({ onRefreshProgress }) => {
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<SkillAnalysis | null>(null);
  const [masterSkills, setMasterSkills] = useState<Skill[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'missing' | 'weak' | 'strong'>('all');
  
  // Quick Edit Skill Modal / Form state
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [newProficiency, setNewProficiency] = useState<number>(50);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [analysisRes, skillsRes] = await Promise.all([
        api.getSkillAnalysis(),
        api.getMasterSkills()
      ]);
      setAnalysisData(analysisRes.analysis);
      setMasterSkills(skillsRes);
      if (skillsRes.length > 0) setSelectedSkillId(skillsRes[0].id);
    } catch (err: any) {
      console.error('Failed to load skill analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateSkill = async (skillId: string, level: number) => {
    try {
      setUpdating(true);
      setMessage('');
      await api.updateSkill(skillId, level);
      setMessage('Proficiency updated. Orchestrator recalibrated intelligence graph.');
      await loadData();
      onRefreshProgress();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !analysisData) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 font-mono text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin" />
          <span>Executing Skill Analysis Agent...</span>
        </div>
      </div>
    );
  }

  const filteredGaps = analysisData.detailed_gaps.filter(g => {
    if (activeFilter === 'all') return true;
    return g.status === activeFilter;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="cyan" size="sm">SKILL GAP INTELLIGENCE</Badge>
            <span className="text-xs font-mono text-zinc-500">• Deterministic Mathematical Diagnostic</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Competency Profile & Gap Diagnostic
          </h1>
          <p className="text-sm text-[#929CA3] mt-1 max-w-2xl">
            {analysisData.summary}
          </p>
        </div>

        {/* Quick Proficiency Updater Card */}
        <div className="bg-[#0B0F12] p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center gap-3 shrink-0 shadow-lg">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase text-zinc-400">Quick Skill Calibrator</span>
            <div className="flex items-center gap-2 mt-1">
              <select
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                className="bg-[#11171B] border border-white/10 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#35D9F2]"
              >
                {masterSkills.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <div className="flex items-center gap-1 font-mono text-xs">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newProficiency}
                  onChange={(e) => setNewProficiency(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-14 bg-[#11171B] border border-white/10 text-white rounded-lg px-2 py-1 text-center"
                />
                <span className="text-zinc-500">%</span>
              </div>
            </div>
          </div>
          <Button
            onClick={() => handleUpdateSkill(selectedSkillId, newProficiency)}
            disabled={updating}
            size="sm"
            variant="primary"
            icon={<Save className="w-3.5 h-3.5" />}
          >
            {updating ? 'Calibrating...' : 'Update & Recalibrate'}
          </Button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-[#11171B] border border-[#35D9F2]/30 text-xs font-mono text-[#35D9F2] flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#35D9F2]" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pb-2 border-b border-white/8 text-xs font-mono">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeFilter === 'all' ? 'bg-[#161D22] text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          All Competencies ({analysisData.detailed_gaps.length})
        </button>
        <button
          onClick={() => setActiveFilter('missing')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'missing' ? 'bg-[#35D9F2]/15 text-[#35D9F2] font-bold border border-[#35D9F2]/30' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <XCircle className="w-3.5 h-3.5 text-[#35D9F2]" />
          Missing Skills ({analysisData.missing_skills.length})
        </button>
        <button
          onClick={() => setActiveFilter('weak')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'weak' ? 'bg-amber-400/15 text-amber-300 font-bold border border-amber-400/30' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          Weak Competencies ({analysisData.weaknesses.length})
        </button>
        <button
          onClick={() => setActiveFilter('strong')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'strong' ? 'bg-[#C5F45B]/15 text-[#C5F45B] font-bold border border-[#C5F45B]/30' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#C5F45B]" />
          Confirmed Strengths ({analysisData.strengths.length})
        </button>
      </div>

      {/* Detailed Skill Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGaps.map((item) => {
          const isStrong = item.status === 'strong';
          const isWeak = item.status === 'weak';
          return (
            <div 
              key={item.skill_id}
              className="bg-[#0B0F12] p-5 rounded-xl border border-white/8 space-y-4 hover:border-white/20 transition-all shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{item.skill_name}</h3>
                    <Badge 
                      variant={isStrong ? 'lime' : isWeak ? 'amber' : 'cyan'}
                      size="sm"
                    >
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-xs text-zinc-400 font-mono mt-0.5">
                    Weight: {item.importance_weight}x Priority
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-sm font-bold text-white">
                    {item.current_level}% <span className="text-zinc-500 font-normal">/ {item.required_level}%</span>
                  </div>
                  <div className={`text-[11px] font-semibold ${item.gap > 0 ? 'text-[#35D9F2]' : 'text-[#C5F45B]'}`}>
                    {item.gap > 0 ? `-${item.gap}% Gap` : 'Criterion Met'}
                  </div>
                </div>
              </div>

              {/* Proficiency Bars */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>Current: {item.current_level}%</span>
                  <span>Target: {item.required_level}%</span>
                </div>
                <div className="w-full bg-[#11171B] h-2 rounded-full overflow-hidden flex">
                  <div 
                    className={`h-full ${isStrong ? 'bg-[#C5F45B]' : 'bg-[#35D9F2]'}`}
                    style={{ width: `${Math.min(100, item.current_level)}%` }}
                  />
                </div>
              </div>

              {/* Why it Matters (Contextual Intelligence) */}
              <div className="p-3 rounded-lg bg-[#11171B] border border-white/5 text-xs text-zinc-300 leading-relaxed flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-zinc-400 font-medium">Why it matters:</strong> {item.why_it_matters}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};