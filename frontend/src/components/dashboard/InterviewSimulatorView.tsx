import React, { useState, useEffect } from 'react';
import { 
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
  HelpCircle
} from 'lucide-react';
import { api } from '../../api/client';
import { InterviewQuestion, InterviewEvaluationResult } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const InterviewSimulatorView: React.FC = () => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluationResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadInterviewData();
  }, []);

  const loadInterviewData = async () => {
    try {
      setLoading(true);
      const [qs, hist] = await Promise.all([
        api.getInterviewQuestions(),
        api.getInterviewHistory().catch(() => [])
      ]);
      setQuestions(qs);
      setHistory(hist);
      if (qs.length > 0) {
        selectQuestion(qs[0]);
      }
    } catch (err) {
      console.error('Failed to load interview simulator data:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectQuestion = (q: InterviewQuestion) => {
    setSelectedQuestion(q);
    setUserAnswer('');
    setEvaluation(null);
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion || !userAnswer.trim()) return;

    try {
      setEvaluating(true);
      const res = await api.evaluateInterviewAnswer(selectedQuestion.id, userAnswer.trim(), sessionId);
      setEvaluation(res);
      // Refresh history
      const updatedHist = await api.getInterviewHistory().catch(() => []);
      setHistory(updatedHist);
    } catch (err) {
      console.error('Failed to evaluate answer:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const categories = ['all', 'Technical', 'Architecture', 'Behavioral'];
  const filteredQuestions = filterCategory === 'all'
    ? questions
    : questions.filter(q => q.category.toLowerCase() === filterCategory.toLowerCase());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 font-mono text-sm">
        <div className="w-5 h-5 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading interview scenarios and evaluation rubrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="cyan" size="sm">AI INTERVIEW SIMULATOR</Badge>
            <span className="text-xs font-mono text-zinc-500">• Senior Staff Engineering Rubrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Career Interview Simulator
          </h1>
          <p className="text-sm text-[#929CA3] mt-1">
            Rehearse high-stakes technical, system design, and behavioral questions with instant AI scoring and actionable improvements.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 bg-[#0B0F12] p-1 rounded-xl border border-white/8 self-start sm:self-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filterCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-[#161D22] text-[#35D9F2] shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
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
                  onClick={() => selectQuestion(q)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#161D22] border-[#35D9F2]/50 shadow-[0_0_20px_rgba(53,217,242,0.12)]'
                      : 'bg-[#11171B] border-white/5 hover:border-white/10 hover:bg-[#161D22]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400">
                      {q.category}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-[#35D9F2]">
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
                  <Badge variant="cyan" size="sm">{selectedQuestion.category}</Badge>
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
                  <HelpCircle className="w-4 h-4 text-[#35D9F2] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-mono text-[11px]">Evaluation Rubric Focus:</strong>
                    <span>{selectedQuestion.criteria_notes}</span>
                  </div>
                </div>
              )}

              {/* Answer Input Area */}
              <form onSubmit={handleEvaluate} className="space-y-4 pt-2">
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
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl p-4 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#35D9F2] leading-relaxed"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={evaluating || !userAnswer.trim()}
                  variant="primary"
                  size="md"
                  icon={evaluating ? undefined : <Send className="w-4 h-4" />}
                >
                  {evaluating ? 'Simulating Evaluation...' : 'Submit & Score Answer'}
                </Button>
              </form>
            </div>

            {/* Evaluation Results Card */}
            {evaluation && (
              <div className="bg-[#0B0F12] border border-[#35D9F2]/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/8">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#35D9F2] block mb-1">
                      EMPIRICAL PERFORMANCE SCORE
                    </span>
                    <h3 className="text-2xl font-black text-white">Interview Assessment</h3>
                  </div>

                  <div className="flex items-center gap-3 bg-[#11171B] px-5 py-3 rounded-xl border border-white/8">
                    <div className="text-3xl font-black font-mono text-[#35D9F2]">
                      {evaluation.score}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400 uppercase">
                      / 100 PTS<br />
                      <span className={evaluation.score >= 80 ? 'text-[#C5F45B]' : 'text-amber-400'}>
                        {evaluation.score >= 80 ? 'Strong Hire' : 'Developing'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Detailed Feedback */}
                <div>
                  <h4 className="text-xs font-mono uppercase text-zinc-400 mb-2">Evaluator Rationale</h4>
                  <p className="text-sm text-[#F5F7F4] leading-relaxed">
                    {evaluation.ai_feedback}
                  </p>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#C5F45B]/10 border border-[#C5F45B]/30 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#C5F45B]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>IDENTIFIED STRENGTHS</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {evaluation.strengths?.map((st, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#C5F45B]">•</span>
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/30 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-300">
                      <AlertCircle className="w-4 h-4" />
                      <span>AREAS FOR REFINEMENT</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {evaluation.improvements?.map((imp, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-300">•</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-8 bg-[#0B0F12] border border-white/8 rounded-2xl p-12 text-center text-zinc-500">
            <Mic2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select an interview question to start rehearsing.</p>
          </div>
        )}
      </div>
    </div>
  );
};