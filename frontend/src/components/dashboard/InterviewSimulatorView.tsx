import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Mic2, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  TrendingUp, 
  History, 
  Award,
  ChevronRight,
  BrainCircuit,
  MessageSquare,
  HelpCircle,
  Terminal,
  ShieldCheck,
  Flame,
  Check,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { api } from '../../api/client';
import { 
  InterviewQuestion, 
  InterviewEvaluationResult,
  WorkplaceScenario,
  WorkplaceScenarioSubmissionResult
} from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const InterviewSimulatorView: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'workplace' | 'interview'>('workplace');

  // Workplace Simulator states
  const [scenarios, setScenarios] = useState<WorkplaceScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<WorkplaceScenario | null>(null);
  const [selectedActionId, setSelectedActionId] = useState<string>('');
  const [rationale, setRationale] = useState<string>('');
  const [submittingScenario, setSubmittingScenario] = useState<boolean>(false);
  const [scenarioResult, setScenarioResult] = useState<WorkplaceScenarioSubmissionResult | null>(null);
  const [scenarioFilterRole, setScenarioFilterRole] = useState<string>('all');

  // Interview Simulator states
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluationResult | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadAllSimulatorData();
  }, []);

  const loadAllSimulatorData = async () => {
    try {
      setLoading(true);
      const [scens, qs] = await Promise.all([
        api.getWorkplaceScenarios().catch(() => []),
        api.getInterviewQuestions().catch(() => [])
      ]);
      setScenarios(scens);
      if (scens.length > 0) {
        setSelectedScenario(scens[0]);
      }
      setQuestions(qs);
      if (qs.length > 0) {
        setSelectedQuestion(qs[0]);
      }
    } catch (err) {
      console.error('Failed to load simulator data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectScenario = (s: WorkplaceScenario) => {
    setSelectedScenario(s);
    setSelectedActionId('');
    setRationale('');
    setScenarioResult(null);
  };

  const handleSubmitScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScenario || !selectedActionId) return;

    try {
      setSubmittingScenario(true);
      const res = await api.submitWorkplaceScenario(
        selectedScenario.id,
        selectedActionId,
        rationale
      );
      setScenarioResult(res);

      // Refresh scenarios to update previous submission state
      const updated = await api.getWorkplaceScenarios();
      setScenarios(updated);
    } catch (err) {
      console.error('Failed to submit scenario decision:', err);
    } finally {
      setSubmittingScenario(false);
    }
  };

  const handleEvaluateInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion || !userAnswer.trim()) return;

    try {
      setEvaluating(true);
      const res = await api.evaluateInterviewAnswer(selectedQuestion.id, userAnswer.trim(), sessionId);
      setEvaluation(res);
    } catch (err) {
      console.error('Failed to evaluate answer:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const roleFilters = [
    { id: 'all', label: 'All Roles' },
    { id: 'software-engineer', label: 'Software Engineer' },
    { id: 'data-analyst', label: 'Data Analyst' },
    { id: 'ai-ml-engineer', label: 'AI/ML' },
    { id: 'cyber-defense', label: 'Cyber Defense' },
    { id: 'ui-ux-designer', label: 'UI/UX' }
  ];

  const filteredScenarios = scenarioFilterRole === 'all'
    ? scenarios
    : scenarios.filter(s => s.role_slug === scenarioFilterRole);

  const categories = ['all', 'Technical', 'Architecture', 'Behavioral'];
  const filteredQuestions = filterCategory === 'all'
    ? questions
    : questions.filter(q => q.category.toLowerCase() === filterCategory.toLowerCase());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 font-mono text-sm">
        <div className="w-5 h-5 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading career simulations and staff-level engineering rubrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="cyan" size="sm">PRACTICAL CAREER SIMULATOR</Badge>
            <span className="text-xs font-mono text-zinc-500">• Real Workplace Incidents & Technical Rubrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Workplace Career Simulator
          </h1>
          <p className="text-sm text-[#929CA3] mt-1">
            Tackle authentic on-the-job production crises, database bottlenecks, security incidents, and high-stakes interviews.
          </p>
        </div>

        {/* Dual Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-[#0B0F12] p-1.5 rounded-xl border border-white/8 self-start sm:self-auto">
          <button
            onClick={() => setActiveMode('workplace')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'workplace'
                ? 'bg-[#161D22] text-[#35D9F2] shadow-sm border border-[#35D9F2]/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-[#35D9F2]" />
            <span>Workplace Incidents ({scenarios.length})</span>
          </button>
          <button
            onClick={() => setActiveMode('interview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'interview'
                ? 'bg-[#161D22] text-[#C5F45B] shadow-sm border border-[#C5F45B]/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5 text-[#C5F45B]" />
            <span>Interview Practice ({questions.length})</span>
          </button>
        </div>
      </div>

      {/* WORKPLACE INCIDENTS SIMULATOR MODE */}
      {activeMode === 'workplace' && (
        <div className="space-y-6">
          {/* Role Filters */}
          <div className="flex flex-wrap items-center gap-2 pb-2">
            {roleFilters.map(rf => (
              <button
                key={rf.id}
                onClick={() => setScenarioFilterRole(rf.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  scenarioFilterRole === rf.id
                    ? 'bg-[#35D9F2]/10 border border-[#35D9F2]/40 text-[#35D9F2] font-bold'
                    : 'bg-[#0B0F12] border border-white/8 text-zinc-400 hover:text-white'
                }`}
              >
                {rf.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Scenarios List (4 cols) */}
            <div className="lg:col-span-4 bg-[#0B0F12] border border-white/8 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/8">
                <span className="text-xs font-mono uppercase text-zinc-400 font-semibold">Live Scenarios</span>
                <span className="text-xs font-mono text-[#35D9F2]">{filteredScenarios.length} Scenarios</span>
              </div>

              <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredScenarios.map(s => {
                  const isSelected = selectedScenario?.id === s.id;
                  const isCompleted = s.latest_submission && s.latest_submission.score >= 70;
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSelectScenario(s)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#161D22] border-[#35D9F2]/50 shadow-[0_0_20px_rgba(53,217,242,0.12)]'
                          : 'bg-[#11171B] border-white/5 hover:border-white/10 hover:bg-[#161D22]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-300">
                          {s.role_title}
                        </span>
                        {isCompleted ? (
                          <span className="text-[10px] font-mono text-[#C5F45B] flex items-center gap-1 font-bold">
                            <Check className="w-3 h-3" />
                            <span>{s.latest_submission?.score}/100</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono uppercase text-[#35D9F2]">
                            {s.difficulty}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs font-bold text-white mb-2 leading-relaxed">
                        {s.title}
                      </h3>

                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
                        <span>Target: {s.target_skill_id.replace('skill-', '')}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Scenario Interactive Workspace (8 cols) */}
            {selectedScenario ? (
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-[#0B0F12] border border-white/8 rounded-2xl p-6 sm:p-8 space-y-6">
                  {/* Scenario Top Info */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/8">
                    <div className="flex items-center gap-2">
                      <Badge variant="cyan" size="sm">{selectedScenario.role_title}</Badge>
                      <span className="text-xs font-mono text-zinc-400">• Level: {selectedScenario.difficulty}</span>
                    </div>
                    {selectedScenario.latest_submission && (
                      <span className="text-xs font-mono text-[#C5F45B] flex items-center gap-1.5 bg-[#C5F45B]/10 px-2.5 py-1 rounded-lg border border-[#C5F45B]/30">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Best Score: {selectedScenario.latest_submission.score}/100</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                      WORKPLACE INCIDENT & CONTEXT
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                      {selectedScenario.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-300 mt-2.5 leading-relaxed bg-[#11171B] p-4 rounded-xl border border-white/5">
                      {selectedScenario.context_markdown}
                    </p>
                  </div>

                  {/* Production Telemetry / Logs / Evidence */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                      <span className="flex items-center gap-1.5 text-[#35D9F2]">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>PRODUCTION TELEMETRY & SYSTEM EVIDENCE</span>
                      </span>
                      <span className="text-[10px] text-zinc-500">Live Incident Snapshot</span>
                    </div>
                    <pre className="p-4 rounded-xl bg-[#050608] border border-white/10 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed custom-scrollbar max-h-56">
                      {selectedScenario.evidence_data}
                    </pre>
                  </div>

                  {/* Technical Challenge */}
                  <div className="p-4 rounded-xl bg-[#161D22] border border-[#35D9F2]/30 text-xs text-zinc-200">
                    <strong className="text-white block font-mono text-xs uppercase mb-1 text-[#35D9F2]">
                      Your Mission & Architectural Challenge:
                    </strong>
                    <span>{selectedScenario.technical_challenge}</span>
                  </div>

                  {/* Action Choices Form */}
                  <form onSubmit={handleSubmitScenario} className="space-y-5 pt-2">
                    <div className="space-y-3">
                      <label className="text-xs font-mono uppercase text-zinc-300 block">
                        CHOOSE YOUR ARCHITECTURAL INTERVENTION:
                      </label>
                      <div className="space-y-2.5">
                        {selectedScenario.options.map(opt => {
                          const isSelected = selectedActionId === opt.id;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => setSelectedActionId(opt.id)}
                              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-[#161D22] border-[#35D9F2] shadow-[0_0_15px_rgba(53,217,242,0.15)]'
                                  : 'bg-[#11171B] border-white/5 hover:border-white/10 hover:bg-[#161D22]/40'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center ${
                                  isSelected ? 'border-[#35D9F2] bg-[#35D9F2]' : 'border-zinc-500'
                                }`}>
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-xs font-bold text-white">{opt.title}</h4>
                                  <p className="text-[11px] text-zinc-400 leading-relaxed">{opt.description}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Engineering Rationale */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase text-zinc-400 flex items-center justify-between">
                        <span>TECHNICAL RATIONALE & TRADE-OFF ANALYSIS</span>
                        <span className="text-[10px] text-zinc-500">Provide 1-2 sentences on why this is optimal</span>
                      </label>
                      <textarea
                        rows={3}
                        value={rationale}
                        onChange={e => setRationale(e.target.value)}
                        placeholder="State your reasoning regarding runtime complexity, availability, and why other options represent anti-patterns..."
                        className="w-full bg-[#11171B] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#35D9F2]"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={!selectedActionId || submittingScenario}
                      className="w-full sm:w-auto bg-[#35D9F2] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#35D9F2]/90 transition-all flex items-center justify-center gap-2"
                    >
                      {submittingScenario ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Evaluating Decision against Staff Rubric...</span>
                        </>
                      ) : (
                        <>
                          <BrainCircuit className="w-4 h-4" />
                          <span>Submit Engineering Decision & Evaluate</span>
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Immediate Rubric Evaluation Result */}
                  {scenarioResult && (
                    <div className={`p-6 rounded-2xl border space-y-4 animate-fadeIn ${
                      scenarioResult.passed
                        ? 'bg-[#C5F45B]/5 border-[#C5F45B]/30'
                        : 'bg-amber-400/5 border-amber-400/30'
                    }`}>
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/8">
                        <div className="flex items-center gap-2.5">
                          {scenarioResult.passed ? (
                            <div className="w-8 h-8 rounded-lg bg-[#C5F45B]/20 border border-[#C5F45B]/40 flex items-center justify-center text-[#C5F45B]">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                              <AlertTriangle className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <span className="text-xs font-mono font-bold text-white">
                              {scenarioResult.passed ? 'SENIOR STAFF EVALUATION: PASSED' : 'SENIOR STAFF EVALUATION: SUBOPTIMAL'}
                            </span>
                            <div className="text-[11px] text-zinc-400">
                              Target Competency: <span className="font-mono text-zinc-300">{scenarioResult.target_skill_id}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-mono text-zinc-400 block">Rubric Score</span>
                          <span className={`text-2xl font-black font-mono ${
                            scenarioResult.passed ? 'text-[#C5F45B]' : 'text-amber-300'
                          }`}>
                            {scenarioResult.score}/100
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs leading-relaxed text-zinc-300">
                        <strong className="text-white block font-mono text-[11px]">Staff Architect Critique:</strong>
                        <p>{scenarioResult.feedback}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono text-[#35D9F2] flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 shrink-0" />
                        <span>{scenarioResult.competency_growth}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="lg:col-span-8 bg-[#0B0F12] border border-white/8 rounded-2xl p-12 text-center text-zinc-500">
                Select a workplace scenario from the left to begin incident analysis.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TECHNICAL & BEHAVIORAL INTERVIEW PRACTICE MODE */}
      {activeMode === 'interview' && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-[#0B0F12] p-1 rounded-xl border border-white/8 self-start sm:self-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  filterCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-[#161D22] text-[#C5F45B] shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Questions List (4 cols) */}
            <div className="lg:col-span-4 bg-[#0B0F12] border border-white/8 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/8">
                <span className="text-xs font-mono uppercase text-zinc-400 font-semibold">Interview Questions</span>
                <span className="text-xs font-mono text-[#C5F45B]">{filteredQuestions.length} Questions</span>
              </div>

              <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredQuestions.map(q => {
                  const isSelected = selectedQuestion?.id === q.id;
                  return (
                    <div
                      key={q.id}
                      onClick={() => {
                        setSelectedQuestion(q);
                        setUserAnswer('');
                        setEvaluation(null);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#161D22] border-[#C5F45B]/50 shadow-[0_0_20px_rgba(197,244,91,0.12)]'
                          : 'bg-[#11171B] border-white/5 hover:border-white/10 hover:bg-[#161D22]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400">
                          {q.category}
                        </span>
                        <span className="text-[10px] font-mono uppercase text-[#C5F45B]">
                          {q.difficulty}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-white mb-2 line-clamp-2 leading-relaxed">
                        {q.question_text}
                      </h3>

                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <span>Evaluate</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Question & Response Workspace (8 cols) */}
            {selectedQuestion ? (
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-[#0B0F12] border border-white/8 rounded-2xl p-6 sm:p-8 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-white/8">
                    <div className="flex items-center gap-2">
                      <Badge variant="lime" size="sm">{selectedQuestion.category}</Badge>
                      <span className="text-xs font-mono text-zinc-400">• Level: {selectedQuestion.difficulty}</span>
                    </div>
                    <span className="text-xs font-mono text-[#C5F45B] flex items-center gap-1.5">
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span>AI Evaluator Active</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                      INTERVIEW PROMPT
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                      {selectedQuestion.question_text}
                    </h2>
                  </div>

                  {selectedQuestion.criteria_notes && (
                    <div className="p-3.5 rounded-xl bg-[#11171B] border border-white/5 text-xs text-zinc-400 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-[#C5F45B] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-mono text-[11px]">Evaluation Rubric Focus:</strong>
                        <span>{selectedQuestion.criteria_notes}</span>
                      </div>
                    </div>
                  )}

                  {/* Answer Input Area */}
                  <form onSubmit={handleEvaluateInterview} className="space-y-4 pt-2">
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
                        <label>YOUR DETAILED RESPONSE</label>
                        <span>{userAnswer.trim().split(/\s+/).filter(Boolean).length} words</span>
                      </div>
                      <textarea
                        rows={8}
                        required
                        placeholder="Provide a structured answer (e.g. STAR method for behavioral, architectural tradeoffs for system design, edge cases for technical)..."
                        value={userAnswer}
                        onChange={e => setUserAnswer(e.target.value)}
                        className="w-full bg-[#11171B] border border-white/10 rounded-xl p-4 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#C5F45B] leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500 font-mono">
                        Evaluated by InterviewAgent against career benchmarks
                      </span>
                      <Button
                        type="submit"
                        disabled={evaluating || !userAnswer.trim()}
                        className="bg-[#C5F45B] text-black font-bold px-6 py-2.5 rounded-xl hover:bg-[#C5F45B]/90 transition-all flex items-center gap-2"
                      >
                        {evaluating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            <span>Scoring Response...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Evaluate Response</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Evaluation Result */}
                  {evaluation && (
                    <div className="mt-8 p-6 rounded-2xl bg-[#11171B] border border-white/10 space-y-6 animate-fadeIn">
                      <div className="flex items-center justify-between pb-4 border-b border-white/8">
                        <div>
                          <span className="text-xs font-mono text-zinc-400 uppercase">Evaluation Score</span>
                          <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-3xl font-extrabold font-mono text-[#C5F45B]">{evaluation.score}</span>
                            <span className="text-sm font-mono text-zinc-500">/ 100</span>
                          </div>
                        </div>
                        <Badge variant={evaluation.score >= 70 ? 'lime' : 'amber'} size="md">
                          {evaluation.score >= 70 ? 'STRONG CANDIDATE' : 'NEEDS REFINEMENT'}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-mono text-zinc-400 uppercase">AI Feedback Summary</span>
                        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-[#0B0F12] p-4 rounded-xl border border-white/5">
                          {evaluation.ai_feedback}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Strengths */}
                        <div className="bg-[#0B0F12] border border-white/5 rounded-xl p-4 space-y-2">
                          <span className="text-xs font-mono text-[#C5F45B] flex items-center gap-1.5 font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>IDENTIFIED STRENGTHS</span>
                          </span>
                          <ul className="space-y-1.5 text-xs text-zinc-300">
                            {evaluation.strengths.map((str, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-[#C5F45B]">•</span>
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Improvements */}
                        <div className="bg-[#0B0F12] border border-white/5 rounded-xl p-4 space-y-2">
                          <span className="text-xs font-mono text-amber-400 flex items-center gap-1.5 font-semibold">
                            <AlertCircle className="w-4 h-4" />
                            <span>GROWTH OPPORTUNITIES</span>
                          </span>
                          <ul className="space-y-1.5 text-xs text-zinc-300">
                            {evaluation.improvements.map((imp, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span>{imp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
