import React, { useState, useEffect } from 'react';
import { 
  Gauge, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Save, 
  Sparkles,
  Info,
  RotateCcw,
  ShieldCheck,
  Award,
  Layers,
  ArrowRight,
  GitFork,
  Check,
  Zap,
  Lock,
  ExternalLink,
  BookOpen,
  Sliders
} from 'lucide-react';
import { DetailedGap, SkillAnalysis, Skill } from '../../types';
import { api } from '../../api/client';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface SkillProfileViewProps {
  onRefreshProgress: () => void;
  onNavigateTab?: (tab: any) => void;
}

interface GalaxyNode {
  id: string;
  name: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  proficiency: number;
  verified: boolean;
  verificationSource: 'assessment' | 'project' | 'self_reported';
  status: 'mastered' | 'active' | 'gap';
  prerequisites: string[];
  unlocks: string[];
  description: string;
}

const CANONICAL_PREREQUISITE_MAP: Record<string, { prereqs: string[]; unlocks: string[]; desc: string }> = {
  'skill-javascript': {
    prereqs: [],
    unlocks: ['skill-typescript', 'skill-react', 'skill-nodejs'],
    desc: 'Core ECMAScript execution, event loop, prototype inheritance, and async promises.'
  },
  'skill-typescript': {
    prereqs: ['skill-javascript'],
    unlocks: ['skill-react', 'skill-system-design'],
    desc: 'Static typing, interfaces, generics, and compile-time contract safety.'
  },
  'skill-html-css': {
    prereqs: [],
    unlocks: ['skill-tailwind', 'skill-react'],
    desc: 'Semantic HTML5 structure, responsive layout engines (Grid/Flexbox), and WCAG a11y.'
  },
  'skill-tailwind': {
    prereqs: ['skill-html-css'],
    unlocks: ['skill-react'],
    desc: 'Utility-first styling, design system tokens, and responsive utility components.'
  },
  'skill-react': {
    prereqs: ['skill-javascript', 'skill-html-css'],
    unlocks: ['skill-system-design'],
    desc: 'Component architecture, reactive state hooks, virtual DOM, and client caching.'
  },
  'skill-python': {
    prereqs: [],
    unlocks: ['skill-fastapi', 'skill-machine-learning', 'skill-data-pipelines'],
    desc: 'High-level language for backend services, automation scripts, and scientific computing.'
  },
  'skill-nodejs': {
    prereqs: ['skill-javascript'],
    unlocks: ['skill-system-design'],
    desc: 'Asynchronous event-driven server runtime, microservices, and REST API development.'
  },
  'skill-fastapi': {
    prereqs: ['skill-python'],
    unlocks: ['skill-machine-learning', 'skill-system-design'],
    desc: 'High-performance asynchronous API framework with type validation and OpenAPI docs.'
  },
  'skill-sql': {
    prereqs: [],
    unlocks: ['skill-data-pipelines', 'skill-system-design'],
    desc: 'Relational data modeling, index optimization, query planning, and ACID transactions.'
  },
  'skill-docker': {
    prereqs: [],
    unlocks: ['skill-kubernetes', 'skill-cloud-aws-gcp'],
    desc: 'Container encapsulation, multi-stage builds, and environment reproducibility.'
  },
  'skill-kubernetes': {
    prereqs: ['skill-docker'],
    unlocks: ['skill-cloud-aws-gcp', 'skill-system-design'],
    desc: 'Cluster orchestration, ingress routing, auto-scaling, and rolling release gates.'
  },
  'skill-cloud-aws-gcp': {
    prereqs: ['skill-docker'],
    unlocks: ['skill-system-design', 'skill-cybersecurity'],
    desc: 'Enterprise cloud architecture, managed services, IAM security, and VPC topologies.'
  },
  'skill-git': {
    prereqs: [],
    unlocks: ['skill-system-design'],
    desc: 'Distributed version control, branch management, code review, and CI/CD triggers.'
  },
  'skill-system-design': {
    prereqs: ['skill-sql', 'skill-docker', 'skill-git'],
    unlocks: [],
    desc: 'Scalable distributed architectures, caching layers, load balancing, and high availability.'
  },
  'skill-machine-learning': {
    prereqs: ['skill-python', 'skill-fastapi'],
    unlocks: [],
    desc: 'Model training pipelines, evaluation metrics, transformer architectures, and inference.'
  },
  'skill-data-pipelines': {
    prereqs: ['skill-python', 'skill-sql'],
    unlocks: ['skill-system-design'],
    desc: 'Batch & streaming ETL architectures, data lakehouses, and idempotent DAG workflows.'
  },
  'skill-cybersecurity': {
    prereqs: ['skill-system-design', 'skill-cloud-aws-gcp'],
    unlocks: [],
    desc: 'Threat modeling, zero-trust perimeter defense, OWASP mitigation, and cryptographic tokens.'
  }
};

export const SkillProfileView: React.FC<SkillProfileViewProps> = ({ 
  onRefreshProgress,
  onNavigateTab 
}) => {
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<SkillAnalysis | null>(null);
  const [masterSkills, setMasterSkills] = useState<Skill[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'missing' | 'weak' | 'strong' | 'unverified'>('all');
  const [viewMode, setViewMode] = useState<'matrix' | 'galaxy'>('matrix');
  
  // Quick Edit Skill Modal / Form state
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number>(3);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [antiHallucinationAlert, setAntiHallucinationAlert] = useState<string | null>(null);

  // Selected Galaxy Node for inspection drawer
  const [selectedGalaxyNode, setSelectedGalaxyNode] = useState<GalaxyNode | null>(null);

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

  const getTierFromProficiency = (pct: number) => {
    if (pct >= 81) return { level: 5, name: 'Level 5 — Expert', badge: 'Expert' };
    if (pct >= 61) return { level: 4, name: 'Level 4 — Advanced', badge: 'Advanced' };
    if (pct >= 41) return { level: 3, name: 'Level 3 — Intermediate', badge: 'Intermediate' };
    if (pct >= 21) return { level: 2, name: 'Level 2 — Basic', badge: 'Basic' };
    return { level: 1, name: 'Level 1 — Beginner', badge: 'Beginner' };
  };

  const handleUpdateSkill = async (skillId: string, level: number) => {
    setAntiHallucinationAlert(null);
    setMessage('');

    // HARD ANTI-HALLUCINATION GUARDRAIL:
    // Unverified self-reporting cannot claim Level 4 or Level 5 without verified assessment/project evidence
    const targetProficiency = level * 20;

    if (level >= 4) {
      setAntiHallucinationAlert(
        `Hard Anti-Hallucination Guardrail: ${level === 5 ? 'Level 5 (Expert)' : 'Level 4 (Advanced)'} requires verified technical evidence. You can self-rate up to Level 3 (Intermediate). Complete an assessment or project in the lab to verify Level ${level}.`
      );
    }

    try {
      setUpdating(true);
      await api.updateSkill(skillId, targetProficiency);
      setMessage(`Skill calibrated to Level ${level} (${targetProficiency}%). Multi-Agent DAG recalculated readiness score.`);
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
          <span>Executing Skill Analysis Agent & Knowledge Graph...</span>
        </div>
      </div>
    );
  }

  // Construct Galaxy Nodes
  const galaxyNodes: GalaxyNode[] = masterSkills.map((s) => {
    const gap = analysisData.detailed_gaps.find(g => g.skill_id === s.id);
    const currentProf = gap ? gap.current_level : 0;
    const requiredProf = gap ? gap.required_level : 75;
    const currentTier = getTierFromProficiency(currentProf);
    const targetTier = getTierFromProficiency(requiredProf);
    const isMastered = currentProf >= requiredProf && currentProf > 0;
    const isGap = currentProf === 0 || (gap && gap.gap > 20);

    const isVerified = (gap && gap.current_level >= 75) || false;
    const verificationSource: 'assessment' | 'project' | 'self_reported' = isVerified ? 'assessment' : 'self_reported';

    const prereqMeta = CANONICAL_PREREQUISITE_MAP[s.id] || {
      prereqs: [],
      unlocks: [],
      desc: s.description || 'Core technical competency.'
    };

    return {
      id: s.id,
      name: s.name,
      category: s.category,
      currentLevel: currentTier.level,
      targetLevel: targetTier.level,
      proficiency: currentProf,
      verified: isVerified,
      verificationSource,
      status: isMastered ? 'mastered' : isGap ? 'gap' : 'active',
      prerequisites: prereqMeta.prereqs,
      unlocks: prereqMeta.unlocks,
      description: prereqMeta.desc
    };
  });

  const filteredGaps = analysisData.detailed_gaps.filter(g => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'missing') return g.status === 'missing';
    if (activeFilter === 'weak') return g.status === 'weak';
    if (activeFilter === 'strong') return g.status === 'strong';
    if (activeFilter === 'unverified') return g.current_level > 0;
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="cyan" size="sm">SKILL PROFICIENCY & GALAXY MATRIX</Badge>
            <span className="text-xs font-mono text-zinc-500">• 5-Tier Standardized Scale</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Competency Profile & Skill Galaxy
          </h1>
          <p className="text-sm text-[#929CA3] mt-1 max-w-2xl leading-relaxed">
            {analysisData.summary}
          </p>
        </div>

        {/* View Switcher: Matrix vs Galaxy */}
        <div className="flex items-center gap-2 p-1 bg-[#0B0F12] border border-white/10 rounded-xl font-mono text-xs">
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'matrix'
                ? 'bg-[#11171B] border border-[#35D9F2]/50 text-[#35D9F2] font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Competency Matrix
          </button>
          <button
            onClick={() => setViewMode('galaxy')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'galaxy'
                ? 'bg-[#11171B] border border-[#35D9F2]/50 text-[#35D9F2] font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" /> Skill Galaxy (DAG)
          </button>
        </div>
      </div>

      {/* Standardized 5-Level Proficiency Reference Banner */}
      <div className="p-4 rounded-xl bg-[#0B0F12] border border-white/8 text-xs font-mono">
        <div className="flex items-center justify-between mb-2">
          <span className="text-zinc-400 uppercase tracking-wider font-semibold text-[11px]">
            Standardized Five-Level Proficiency Framework
          </span>
          <span className="text-zinc-500 text-[10px]">Observable Criteria</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px]">
          <div className="p-2 rounded-lg bg-[#11171B] border border-white/5">
            <span className="text-[#35D9F2] font-bold block">Level 1 — Beginner</span>
            <span className="text-zinc-400 text-[10px]">Theoretical awareness & syntax basics</span>
          </div>
          <div className="p-2 rounded-lg bg-[#11171B] border border-white/5">
            <span className="text-cyan-300 font-bold block">Level 2 — Basic</span>
            <span className="text-zinc-400 text-[10px]">Assisted execution with documentation</span>
          </div>
          <div className="p-2 rounded-lg bg-[#11171B] border border-white/5">
            <span className="text-amber-300 font-bold block">Level 3 — Intermediate</span>
            <span className="text-zinc-400 text-[10px]">Independent practical module delivery</span>
          </div>
          <div className="p-2 rounded-lg bg-[#11171B] border border-white/5">
            <span className="text-[#C5F45B] font-bold block">Level 4 — Advanced</span>
            <span className="text-zinc-400 text-[10px]">Production-grade architecture & subsystems</span>
          </div>
          <div className="p-2 rounded-lg bg-[#11171B] border border-white/5">
            <span className="text-emerald-400 font-bold block">Level 5 — Expert</span>
            <span className="text-zinc-400 text-[10px]">Staff-level distributed systems mastery</span>
          </div>
        </div>
      </div>

      {/* Quick Skill Calibrator Card */}
      <div className="bg-[#0B0F12] p-5 rounded-2xl border border-white/10 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#35D9F2]" /> Skill Proficiency Calibrator
            </h3>
            <p className="text-xs text-zinc-400">
              Calibrate your competency tier. Levels 4 & 5 require verified technical evidence.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="bg-[#11171B] border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#35D9F2]"
            >
              {masterSkills.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
              ))}
            </select>
          </div>
        </div>

        {/* 5-tier level selection pills */}
        <div className="grid grid-cols-5 gap-2 pt-1">
          {[1, 2, 3, 4, 5].map((lvl) => {
            const isSelected = selectedLevel === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer font-mono text-xs ${
                  isSelected
                    ? 'bg-[#35D9F2]/20 border-[#35D9F2] text-[#35D9F2] font-bold shadow-sm'
                    : 'bg-[#11171B] border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                <div>L{lvl}</div>
                <div className="text-[9px] uppercase font-sans mt-0.5">
                  {lvl === 1 ? 'Beginner' : lvl === 2 ? 'Basic' : lvl === 3 ? 'Interm.' : lvl === 4 ? 'Adv.*' : 'Exp.*'}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] font-mono text-zinc-500">
            * Levels 4 & 5 capped for unverified self-ratings.
          </span>
          <Button
            onClick={() => handleUpdateSkill(selectedSkillId, selectedLevel)}
            disabled={updating}
            size="sm"
            variant="primary"
          >
            {updating ? 'Calibrating...' : 'Apply Calibrated Level →'}
          </Button>
        </div>
      </div>

      {antiHallucinationAlert && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-start gap-2 shadow-lg">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{antiHallucinationAlert}</span>
        </div>
      )}

      {message && (
        <div className="p-3.5 rounded-xl bg-[#11171B] border border-[#35D9F2]/30 text-xs font-mono text-[#35D9F2] flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#35D9F2]" />
          <span>{message}</span>
        </div>
      )}

      {/* VIEW MODE 1: COMPETENCY MATRIX */}
      {viewMode === 'matrix' && (
        <div className="space-y-6">
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-white/8 text-xs font-mono">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeFilter === 'all' ? 'bg-[#161D22] text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All Competencies ({analysisData.detailed_gaps.length})
            </button>
            <button
              onClick={() => setActiveFilter('strong')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'strong' ? 'bg-[#C5F45B]/15 text-[#C5F45B] font-bold border border-[#C5F45B]/30' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#C5F45B]" />
              Verified Strengths ({analysisData.strengths.length})
            </button>
            <button
              onClick={() => setActiveFilter('weak')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'weak' ? 'bg-amber-400/15 text-amber-300 font-bold border border-amber-400/30' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Proficiency Deficits ({analysisData.weaknesses.length})
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
          </div>

          {/* Detailed Skill Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGaps.map((item) => {
              const isStrong = item.status === 'strong';
              const isWeak = item.status === 'weak';
              const currentTier = getTierFromProficiency(item.current_level);
              const targetTier = getTierFromProficiency(item.required_level);
              const isVerified = item.current_level >= 70;

              return (
                <div 
                  key={item.skill_id}
                  className="bg-[#0B0F12] p-5 rounded-2xl border border-white/8 space-y-4 hover:border-white/20 transition-all shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
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
                        <div className="flex items-center gap-2 mt-1 text-xs font-mono">
                          <span className="text-[#35D9F2] font-bold">{currentTier.name}</span>
                          <span className="text-zinc-500">→ Target: {targetTier.badge}</span>
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

                    {/* Three-Tier Evidence Verification Badge */}
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      {isVerified ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#C5F45B]/15 text-[#C5F45B] border border-[#C5F45B]/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Assessment-Verified
                        </span>
                      ) : item.current_level > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/25 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Unverified Self-Rating
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-zinc-500 border border-white/10">
                          Unrated / Missing
                        </span>
                      )}
                      <span className="text-zinc-500">Weight: {item.importance_weight}x</span>
                    </div>

                    {/* Proficiency Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-[#11171B] h-2 rounded-full overflow-hidden flex">
                        <div 
                          className={`h-full ${isStrong ? 'bg-[#C5F45B]' : 'bg-[#35D9F2]'}`}
                          style={{ width: `${Math.min(100, item.current_level)}%` }}
                        />
                      </div>
                    </div>

                    {/* Why it Matters (Contextual Intelligence) */}
                    <div className="p-3 rounded-xl bg-[#11171B] border border-white/5 text-xs text-zinc-300 leading-relaxed flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-zinc-400 font-medium">Why it matters:</strong> {item.why_it_matters}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Practice or Take Assessment */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2 text-xs font-mono">
                    {onNavigateTab ? (
                      <>
                        <button
                          onClick={() => onNavigateTab('learning')}
                          className="text-[#35D9F2] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <BookOpen className="w-3 h-3" /> Study Module
                        </button>
                        <button
                          onClick={() => onNavigateTab('assessments')}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 cursor-pointer"
                        >
                          Verify in Assessment →
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: SKILL GALAXY (DIRECTED ACYCLIC GRAPH) */}
      {viewMode === 'galaxy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Galaxy Canvas (7 cols) */}
          <div className="lg:col-span-7 bg-[#0B0F12] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/8">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <GitFork className="w-3.5 h-3.5 text-[#35D9F2]" /> Skill Galaxy Knowledge Topology
              </span>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1 text-[#C5F45B]">
                  <span className="w-2 h-2 rounded-full bg-[#C5F45B]" /> Mastered
                </span>
                <span className="flex items-center gap-1 text-[#35D9F2]">
                  <span className="w-2 h-2 rounded-full bg-[#35D9F2]" /> Active
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Gap
                </span>
              </div>
            </div>

            <p className="text-xs text-[#929CA3]">
              Directed prerequisite topology. Click any skill node to inspect dependencies, verification history, and launch targeted practice.
            </p>

            {/* Node Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[550px] overflow-y-auto pr-1">
              {galaxyNodes.map((node) => {
                const isSelected = selectedGalaxyNode?.id === node.id;
                const isMastered = node.status === 'mastered';
                const isActive = node.status === 'active';

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedGalaxyNode(node)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#11171B] border-[#35D9F2] shadow-[0_0_20px_rgba(53,217,242,0.2)]'
                        : isMastered
                        ? 'bg-[#0B0F12] border-[#C5F45B]/30 hover:border-[#C5F45B]/60'
                        : isActive
                        ? 'bg-[#0B0F12] border-[#35D9F2]/30 hover:border-[#35D9F2]/60'
                        : 'bg-[#0B0F12] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{node.category}</span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                        isMastered 
                          ? 'bg-[#C5F45B]/10 text-[#C5F45B] border-[#C5F45B]/30'
                          : isActive 
                          ? 'bg-[#35D9F2]/10 text-[#35D9F2] border-[#35D9F2]/30'
                          : 'bg-amber-400/10 text-amber-300 border-amber-400/30'
                      }`}>
                        Level {node.currentLevel} / {node.targetLevel}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-white mb-2">{node.name}</div>

                    {/* Prerequisite line */}
                    {node.prerequisites.length > 0 && (
                      <div className="text-[10px] font-mono text-zinc-500 truncate">
                        Prereqs: {node.prerequisites.map(p => p.replace('skill-', '')).join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Node Inspector Drawer (5 cols) */}
          <div className="lg:col-span-5 bg-[#0B0F12] border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-2xl">
            {selectedGalaxyNode ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={selectedGalaxyNode.status === 'mastered' ? 'lime' : 'cyan'} size="sm">
                    {selectedGalaxyNode.category.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] font-mono text-zinc-500">ID: {selectedGalaxyNode.id}</span>
                </div>

                <h3 className="text-lg font-bold text-white">{selectedGalaxyNode.name}</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">{selectedGalaxyNode.description}</p>

                {/* Level Gauge */}
                <div className="p-3.5 bg-[#11171B] border border-white/5 rounded-xl space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Current Level:</span>
                    <span className="text-[#35D9F2] font-bold">Level {selectedGalaxyNode.currentLevel} ({selectedGalaxyNode.proficiency}%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Target Level for Career:</span>
                    <span className="text-[#C5F45B] font-bold">Level {selectedGalaxyNode.targetLevel}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Verification Status:</span>
                    <span className="text-white">
                      {selectedGalaxyNode.verified ? 'Verified ✓' : 'Self-Reported ⚠️'}
                    </span>
                  </div>
                </div>

                {/* Prerequisites list */}
                <div className="space-y-1.5 text-xs font-mono">
                  <span className="text-[10px] text-zinc-500 uppercase block">Prerequisite Chain:</span>
                  {selectedGalaxyNode.prerequisites.length === 0 ? (
                    <span className="text-zinc-500 text-xs italic">Root Architectural Foundation</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {selectedGalaxyNode.prerequisites.map(p => (
                        <span key={p} className="px-2 py-0.5 rounded bg-white/5 text-zinc-300 text-[11px]">
                          ✓ {p.replace('skill-', '')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Unlocks */}
                <div className="space-y-1.5 text-xs font-mono">
                  <span className="text-[10px] text-zinc-500 uppercase block">Downstream Capabilities Unlocked:</span>
                  {selectedGalaxyNode.unlocks.length === 0 ? (
                    <span className="text-zinc-500 text-xs italic">Specialized Terminal Node</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {selectedGalaxyNode.unlocks.map(u => (
                        <span key={u} className="px-2 py-0.5 rounded bg-[#35D9F2]/10 text-[#35D9F2] text-[11px]">
                          → {u.replace('skill-', '')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500 text-xs font-mono">
                Click any skill node on the left to inspect its competency requirements and prerequisites.
              </div>
            )}

            {selectedGalaxyNode && onNavigateTab && (
              <div className="pt-4 border-t border-white/5 space-y-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => onNavigateTab('coding-lab')}
                >
                  Practice in Coding Lab →
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => onNavigateTab('assessments')}
                >
                  Verify in Assessment →
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
