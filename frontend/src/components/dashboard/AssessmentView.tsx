import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Award, 
  ArrowRight, 
  Sparkles, 
  RotateCw, 
  BookOpen, 
  Check,
  AlertTriangle,
  Code2,
  Clock,
  Flame,
  ArrowLeft
} from 'lucide-react';
import { Assessment, AssessmentResult } from '../../types';
import { api } from '../../api/client';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface AssessmentViewProps {
  onRefreshAll: () => void;
  onNavigateTab: (tab: any) => void;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({ onRefreshAll, onNavigateTab }) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'smart-revision'>('catalog');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [revisionFeed, setRevisionFeed] = useState<any[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Active quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const fetchList = async () => {
    try {
      setLoading(true);
      const [asmtData, revData] = await Promise.all([
        api.getAssessments(),
        api.getSmartRevisionFeed().catch(() => [])
      ]);
      setAssessments(asmtData);
      setRevisionFeed(revData);
    } catch (err) {
      console.error('Failed to fetch assessments or smart revision:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleStartQuiz = async (asmtId: string) => {
    try {
      setLoadingDetails(true);
      setResult(null);
      setSelectedAnswers({});
      const full = await api.getAssessmentDetails(asmtId);
      setActiveAssessment(full);
      setActiveTab('catalog');
    } catch (err) {
      console.error('Failed to load quiz details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAbandonQuiz = async () => {
    if (!activeAssessment) return;
    if (window.confirm("Abandon assessment? Incomplete attempts will be logged permanently in your audit history.")) {
      try {
        await api.abandonAssessment(activeAssessment.id);
      } catch (err) {
        console.error('Failed to log abandoned assessment:', err);
      }
      setActiveAssessment(null);
      setResult(null);
      fetchList();
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    if (!activeAssessment || !activeAssessment.questions) return;
    
    // Check if all questions are answered
    const unanswered = activeAssessment.questions.filter(q => selectedAnswers[q.id] === undefined);
    if (unanswered.length > 0) {
      if (!window.confirm(`You have ${unanswered.length} unanswered questions. Submit anyway?`)) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const res = await api.submitAssessment(activeAssessment.id, selectedAnswers);
      setResult(res.evaluation.assessment_result);
      await fetchList();
      onRefreshAll();
    } catch (err) {
      console.error('Failed to submit assessment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 font-mono text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin" />
          <span>Loading Assessment Engine & Smart Revision Telemetry...</span>
        </div>
      </div>
    );
  }

  // View: Active Quiz Runner or Result View
  if (activeAssessment) {
    const questions = activeAssessment.questions || [];

    return (
      <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/8">
          <div>
            <button
              onClick={result ? () => { setActiveAssessment(null); setResult(null); } : handleAbandonQuiz}
              className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer mb-2 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{result ? 'Back to Assessments Catalog' : 'Exit Assessment (Logs Incomplete)'}</span>
            </button>
            <h1 className="text-2xl font-bold text-white">{activeAssessment.title}</h1>
            <p className="text-xs text-[#929CA3] mt-0.5">{activeAssessment.description}</p>
          </div>

          <Badge variant="cyan" size="sm">
            {result ? 'EVALUATION COMPLETE' : 'IN PROGRESS'}
          </Badge>
        </div>

        {/* Results Banner if submitted */}
        {result && (
          <div className={`p-6 rounded-2xl border ${
            result.passed ? 'bg-[#C5F45B]/15 border-[#C5F45B]/40 shadow-[0_0_30px_rgba(197,244,91,0.1)]' : 'bg-rose-500/15 border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.1)]'
          } space-y-4`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={result.passed ? 'lime' : 'amber'} size="md">
                    {result.passed ? 'ASSESSMENT PASSED' : 'NEEDS PRACTICE (<60%)'}
                  </Badge>
                  <span className="text-xs font-mono text-zinc-400">
                    Verified Proficiency: <strong className="text-white">{result.new_proficiency}%</strong>
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  Score: {result.score} of {result.total_questions} ({result.percentage}%)
                </h3>
                <p className="text-xs text-zinc-300 mt-1">{result.feedback}</p>
              </div>

              <div className="flex items-center gap-3">
                {!result.passed && (
                  <Button
                    onClick={() => { setActiveAssessment(null); setActiveTab('smart-revision'); }}
                    variant="primary"
                    size="sm"
                    className="bg-amber-400 text-black font-bold"
                  >
                    View Smart Revision
                  </Button>
                )}
                <Button
                  onClick={() => onNavigateTab('roadmap')}
                  variant="primary"
                  size="sm"
                  icon={<ArrowRight className="w-4 h-4 ml-1" />}
                >
                  View Adapted Roadmap
                </Button>
                <Button
                  onClick={() => handleStartQuiz(activeAssessment.id)}
                  variant="outline"
                  size="sm"
                  icon={<RotateCw className="w-3.5 h-3.5" />}
                >
                  Retake
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Questions Stream */}
        <div className="space-y-6">
          {questions.map((q, idx) => {
            const resultItem = result?.breakdown?.find(b => b.question_id === q.id);
            const userChoice = selectedAnswers[q.id];

            return (
              <div 
                key={q.id}
                className={`bg-[#0B0F12] p-6 rounded-2xl border transition-all ${
                  resultItem 
                    ? (resultItem.is_correct ? 'border-[#C5F45B]/40' : 'border-rose-500/40')
                    : 'border-white/8'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#11171B] text-[#35D9F2] font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-white/5">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-white leading-relaxed">
                      {q.question_text}
                    </h3>
                  </div>

                  {resultItem && (
                    <span className="shrink-0">
                      {resultItem.is_correct ? (
                        <span className="flex items-center gap-1 text-[#C5F45B] text-xs font-mono font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> Correct (+{q.weight}pt)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 text-xs font-mono font-semibold">
                          <XCircle className="w-4 h-4" /> Incorrect (0pt)
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {/* Options List */}
                <div className="space-y-2.5 mt-4">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userChoice === optIdx;
                    const isCorrectAnswer = resultItem && resultItem.correct_option_index === optIdx;
                    const isWrongSelection = resultItem && !resultItem.is_correct && isSelected;

                    let optionBorder = 'border-white/5 hover:border-white/10 bg-[#11171B]';
                    if (resultItem) {
                      if (isCorrectAnswer) {
                        optionBorder = 'border-[#C5F45B] bg-[#C5F45B]/10 text-white';
                      } else if (isWrongSelection) {
                        optionBorder = 'border-rose-500 bg-rose-500/10 text-white';
                      } else {
                        optionBorder = 'border-white/5 opacity-40 bg-[#11171B]';
                      }
                    } else if (isSelected) {
                      optionBorder = 'border-[#35D9F2] bg-[#35D9F2]/10 text-white shadow-[0_0_15px_rgba(53,217,242,0.15)]';
                    }

                    return (
                      <div
                        key={optIdx}
                        onClick={() => !result && handleSelectOption(q.id, optIdx)}
                        className={`p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${optionBorder} ${
                          !result ? 'cursor-pointer' : 'cursor-default'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected 
                              ? (resultItem ? (resultItem.is_correct ? 'border-[#C5F45B] bg-[#C5F45B]' : 'border-rose-500 bg-rose-500') : 'border-[#35D9F2] bg-[#35D9F2]')
                              : 'border-zinc-600'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                          </div>
                          <span className={isSelected || isCorrectAnswer ? 'font-medium text-white' : 'text-zinc-300'}>
                            {opt}
                          </span>
                        </div>

                        {resultItem && isCorrectAnswer && (
                          <span className="text-[10px] font-mono text-[#C5F45B] font-bold">
                            CORRECT ANSWER
                          </span>
                        )}
                        {resultItem && isWrongSelection && (
                          <span className="text-[10px] font-mono text-rose-400 font-bold">
                            YOUR SELECTION
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation on result view */}
                {resultItem && (
                  <div className="mt-4 p-4 rounded-xl bg-[#11171B] border border-white/5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-[#35D9F2]">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>CONCEPTUAL RATIONALE & EXPLANATION</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {resultItem.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Quiz Action Bar */}
        {!result && (
          <div className="bg-[#0B0F12] p-6 rounded-2xl border border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 shadow-2xl backdrop-blur-md bg-opacity-95">
            <div className="text-xs font-mono text-zinc-400">
              Answered <strong className="text-white">{Object.keys(selectedAnswers).length}</strong> of{' '}
              <strong className="text-white">{questions.length}</strong> questions
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAbandonQuiz}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-[#35D9F2] text-black font-bold"
              >
                {submitting ? 'Evaluating Submission...' : 'Submit Assessment for Verification'}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // View: Main Assessment Catalog & Smart Revision Tabs
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="cyan" size="sm">EVALUATION SYSTEM</Badge>
            <span className="text-xs font-mono text-zinc-500">• Objective Knowledge Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Diagnostic Assessments & Smart Revision
          </h1>
          <p className="text-sm text-[#929CA3] mt-1">
            Validate technical competencies, identify conceptual misconceptions, and access targeted micro-lessons.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#0B0F12] p-1.5 rounded-xl border border-white/8 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'catalog'
                ? 'bg-[#161D22] text-[#35D9F2] border border-[#35D9F2]/30 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Assessments ({assessments.length})
          </button>
          <button
            onClick={() => setActiveTab('smart-revision')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'smart-revision'
                ? 'bg-[#161D22] text-amber-300 border border-amber-400/30 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Smart Revision Focus</span>
            {revisionFeed.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-black text-[10px] font-bold flex items-center justify-center">
                {revisionFeed.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* SMART REVISION FOCUS VIEW */}
      {activeTab === 'smart-revision' && (
        <div className="space-y-6">
          <div className="bg-[#161D22] p-5 rounded-2xl border border-amber-400/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold uppercase">
              <AlertTriangle className="w-4 h-4" />
              <span>Targeted Remediation Queue (&lt;60% Proficiency or Misconceptions)</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              When an assessment score reveals conceptual deficits, NEXORA automatically isolates the misconception and generates targeted micro-lessons and algorithmic practice before re-assessment.
            </p>
          </div>

          {revisionFeed.length === 0 ? (
            <div className="bg-[#0B0F12] border border-white/8 rounded-2xl p-12 text-center text-zinc-400 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#C5F45B] mx-auto" />
              <h3 className="text-base font-bold text-white">No Critical Revision Deficits Detected</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                All completed assessments are above 60% with zero unresolved misconceptions. Continue challenging yourself in the catalog!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {revisionFeed.map((rev, idx) => (
                <div key={idx} className="bg-[#0B0F12] border border-amber-400/20 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="amber" size="sm">REVISION PRIORITY</Badge>
                      <span className="text-xs font-mono text-amber-400 font-bold">
                        Last Score: {rev.last_score}%
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {rev.skill_name} Refresher
                    </h3>
                    <div className="text-xs text-zinc-400">
                      From Assessment: <span className="text-zinc-200">{rev.assessment_title}</span>
                    </div>

                    {/* Identified Misconceptions */}
                    {rev.misconceptions && rev.misconceptions.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-[#050608] border border-white/5 space-y-2">
                        <span className="text-[10px] font-mono text-amber-300 uppercase block font-semibold">
                          Identified Misconception:
                        </span>
                        {rev.misconceptions.map((m: any, mIdx: number) => (
                          <p key={mIdx} className="text-[11px] text-zinc-300 leading-relaxed">
                            {m.misconception}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Targeted Micro-Lesson */}
                    {rev.recommended_micro_lesson && (
                      <div className="p-3.5 rounded-xl bg-[#11171B] border border-white/5 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono text-[#35D9F2] uppercase block">
                            Targeted Micro-Lesson ({rev.recommended_micro_lesson.estimated_minutes}m)
                          </span>
                          <span className="text-xs font-bold text-white">
                            {rev.recommended_micro_lesson.title}
                          </span>
                        </div>
                        <button
                          onClick={() => onNavigateTab('learning')}
                          className="text-xs font-mono text-[#35D9F2] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Targeted Algorithmic Practice */}
                    {rev.recommended_practice_challenge && (
                      <div className="p-3.5 rounded-xl bg-[#11171B] border border-white/5 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono text-[#C5F45B] uppercase block">
                            Refresher Challenge ({rev.recommended_practice_challenge.difficulty})
                          </span>
                          <span className="text-xs font-bold text-white">
                            {rev.recommended_practice_challenge.title}
                          </span>
                        </div>
                        <button
                          onClick={() => onNavigateTab('coding-lab')}
                          className="text-xs font-mono text-[#C5F45B] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>Solve</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Re-Assessment Trigger */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-zinc-500">
                      Est. 15 mins to master
                    </span>
                    <Button
                      onClick={() => handleStartQuiz(rev.assessment_id)}
                      size="sm"
                      className="bg-[#35D9F2] text-black font-bold flex items-center gap-1.5"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Take Re-Assessment</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CATALOG VIEW */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map(asmt => {
            const hasTaken = asmt.last_result !== null && asmt.last_result !== undefined;
            const passed = hasTaken && asmt.last_result?.passed;
            const score = hasTaken ? asmt.last_result?.percentage : null;

            return (
              <div 
                key={asmt.id} 
                className="bg-[#0B0F12] border border-white/8 rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all shadow-lg hover:shadow-2xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-zinc-400">
                      {asmt.skill_category}
                    </span>
                    {hasTaken ? (
                      <span className={`text-xs font-mono font-bold flex items-center gap-1 ${
                        passed ? 'text-[#C5F45B]' : 'text-amber-400'
                      }`}>
                        {passed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '·'}
                        {score}%
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-500">UNTESTED</span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {asmt.title}
                  </h3>

                  <p className="text-xs text-[#929CA3] line-clamp-2 leading-relaxed">
                    {asmt.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 pt-1">
                    <span>{asmt.question_count} Questions</span>
                    <span>•</span>
                    <span>Skill: {asmt.skill_name}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 mt-6 flex items-center justify-between">
                  {hasTaken ? (
                    <Badge variant={passed ? 'lime' : 'amber'} size="sm">
                      {passed ? 'VERIFIED' : 'DEFICIT IDENTIFIED'}
                    </Badge>
                  ) : (
                    <span className="text-xs text-zinc-500 font-mono">15-20 mins</span>
                  )}

                  <Button
                    onClick={() => handleStartQuiz(asmt.id)}
                    variant={hasTaken ? 'outline' : 'primary'}
                    size="sm"
                    className={!hasTaken ? 'bg-[#35D9F2] text-black font-bold' : ''}
                  >
                    {hasTaken ? 'Retake Quiz' : 'Start Assessment'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
