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
  Check
} from 'lucide-react';
import { Assessment, AssessmentResult } from '../../types';
import { api } from '../../api/client';
import { Badge } from '../common/Badge';
import { CrimsonButton } from '../common/CrimsonButton';

interface AssessmentViewProps {
  onRefreshAll: () => void;
  onNavigateTab: (tab: any) => void;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({ onRefreshAll, onNavigateTab }) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
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
      const data = await api.getAssessments();
      setAssessments(data);
    } catch (err) {
      console.error('Failed to fetch assessments:', err);
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
    } catch (err) {
      console.error('Failed to load quiz details:', err);
    } finally {
      setLoadingDetails(false);
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
          <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Assessment Catalog...</span>
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
              onClick={() => { setActiveAssessment(null); setResult(null); }}
              className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer mb-2 flex items-center gap-1"
            >
              ← Back to Assessments Catalog
            </button>
            <h1 className="text-2xl font-bold text-white">{activeAssessment.title}</h1>
            <p className="text-xs text-zinc-400 mt-0.5">{activeAssessment.description}</p>
          </div>

          <Badge variant="crimson" size="sm">
            {result ? 'EVALUATION COMPLETE' : 'IN PROGRESS'}
          </Badge>
        </div>

        {/* Results Banner if submitted */}
        {result && (
          <div className={`p-6 rounded-2xl border ${
            result.passed ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-rose-950/20 border-rose-500/40'
          } space-y-4 crimson-glow-sm`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={result.passed ? 'emerald' : 'crimson'} size="md">
                    {result.passed ? 'ASSESSMENT PASSED' : 'NEEDS PRACTICE'}
                  </Badge>
                  <span className="text-xs font-mono text-zinc-400">
                    Verified Proficiency Updated: <strong className="text-white">{result.new_proficiency}%</strong>
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  Score: {result.score} of {result.total_questions} ({result.percentage}%)
                </h3>
                <p className="text-xs text-zinc-300 mt-1">{result.feedback}</p>
              </div>

              <div className="flex items-center gap-3">
                <CrimsonButton
                  onClick={() => onNavigateTab('roadmap')}
                  variant="primary"
                  size="sm"
                  icon={<ArrowRight className="w-4 h-4 ml-1" />}
                >
                  View Adapted Roadmap
                </CrimsonButton>
                <CrimsonButton
                  onClick={() => handleStartQuiz(activeAssessment.id)}
                  variant="secondary"
                  size="sm"
                  icon={<RotateCw className="w-3.5 h-3.5" />}
                >
                  Retake
                </CrimsonButton>
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
                className={`glass-panel p-6 rounded-2xl border transition-all ${
                  resultItem 
                    ? (resultItem.is_correct ? 'border-emerald-500/40' : 'border-rose-500/40')
                    : 'border-white/8'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 text-rose-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-white leading-relaxed">
                      {q.question_text}
                    </h3>
                  </div>

                  {resultItem && (
                    <span className="shrink-0">
                      {resultItem.is_correct ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}
                    </span>
                  )}
                </div>

                {/* Options List */}
                <div className="space-y-2 pl-8">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = (userChoice === optIdx);
                    let optionStyle = 'border-white/5 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-300';

                    if (resultItem) {
                      if (optIdx === resultItem.correct_option_index) {
                        optionStyle = 'border-emerald-500/60 bg-emerald-950/30 text-emerald-200 font-semibold';
                      } else if (isSelected && !resultItem.is_correct) {
                        optionStyle = 'border-rose-500/60 bg-rose-950/30 text-rose-200';
                      }
                    } else if (isSelected) {
                      optionStyle = 'border-rose-500 bg-rose-950/40 text-rose-200 font-medium';
                    }

                    return (
                      <div
                        key={optIdx}
                        onClick={() => !result && handleSelectOption(q.id, optIdx)}
                        className={`p-3.5 rounded-xl border text-xs flex items-center gap-3 transition-colors ${optionStyle} ${
                          result ? 'cursor-default' : 'cursor-pointer'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-rose-500 bg-rose-600' : 'border-zinc-700'
                        }`}>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="leading-relaxed">{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Question Explanation if graded */}
                {resultItem && (
                  <div className="mt-4 ml-8 p-3.5 rounded-xl bg-zinc-950 border border-white/5 text-xs text-zinc-300 font-mono space-y-1">
                    <div className="text-zinc-500 font-bold uppercase text-[10px]">Technical Rationale:</div>
                    <div>{resultItem.explanation}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        {!result && (
          <div className="flex justify-end pt-4">
            <CrimsonButton
              onClick={handleSubmit}
              disabled={submitting}
              size="lg"
              variant="primary"
              icon={<Award className="w-5 h-5 ml-1" />}
            >
              {submitting ? 'Assessment Agent Grading...' : 'Submit & Recalibrate Skills'}
            </CrimsonButton>
          </div>
        )}
      </div>
    );
  }

  // View: Catalog List
  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="crimson" size="sm">EMPIRICAL VERIFICATION</Badge>
          <span className="text-xs font-mono text-zinc-500">Assessment Agent v1.0</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Adaptive Skill Assessments
        </h1>
        <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
          Taking an assessment verifies your conceptual mastery against real engineering standards. 
          Your results directly update your verified skill proficiency, triggering automatic recalibration across the roadmap.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assessments.map((asmt) => {
          const hasAttempted = asmt.last_result !== null && asmt.last_result !== undefined;

          return (
            <div
              key={asmt.id}
              className="glass-panel p-6 rounded-2xl border border-white/8 hover:border-rose-500/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-rose-400 uppercase tracking-wider">
                      {asmt.skill_name || 'Core Engineering'}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{asmt.title}</h3>
                  </div>
                  <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-white/5">
                    {asmt.difficulty}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {asmt.description}
                </p>

                <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 pt-1">
                  <span>{asmt.question_count || 5} Questions</span>
                  <span>•</span>
                  <span>~10 mins</span>
                </div>

                {hasAttempted && (
                  <div className="p-3 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Last Attempt:</span>
                    <span className={asmt.last_result?.passed ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {asmt.last_result?.percentage}% ({asmt.last_result?.passed ? 'Verified' : 'Retake Advised'})
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-mono">
                  Feedback Loop: Active
                </span>
                <CrimsonButton
                  onClick={() => handleStartQuiz(asmt.id)}
                  variant="primary"
                  size="sm"
                  icon={<ClipboardCheck className="w-4 h-4" />}
                >
                  {hasAttempted ? 'Retake Assessment' : 'Start Assessment'}
                </CrimsonButton>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
