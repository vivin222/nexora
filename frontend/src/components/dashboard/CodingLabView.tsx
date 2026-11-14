import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  RotateCcw, 
  Terminal, 
  Cpu, 
  Clock, 
  ChevronRight,
  Sparkles,
  Check
} from 'lucide-react';
import { api } from '../../api/client';
import { CodingProblem, CodingSubmissionResult } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const CodingLabView: React.FC = () => {
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
  const [userCode, setUserCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<CodingSubmissionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'problem' | 'hints' | 'tests'>('problem');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const data = await api.getCodingProblems();
      setProblems(data);
      if (data.length > 0) {
        selectProblem(data[0]);
      }
    } catch (err) {
      console.error('Failed to load coding problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectProblem = (problem: CodingProblem) => {
    setSelectedProblem(problem);
    setUserCode(problem.initial_code || '// Write your solution here\n');
    setResult(null);
    setActiveTab('problem');
  };

  const handleResetCode = () => {
    if (selectedProblem) {
      setUserCode(selectedProblem.initial_code || '');
      setResult(null);
    }
  };

  const handleSubmitCode = async () => {
    if (!selectedProblem || !userCode.trim()) return;
    try {
      setSubmitting(true);
      const res = await api.submitCode(selectedProblem.id, userCode, selectedProblem.language || 'javascript');
      setResult(res);
    } catch (err) {
      console.error('Failed to submit code:', err);
      setResult({
        submission_id: 'err',
        status: 'failed',
        passed_tests: 0,
        total_tests: selectedProblem.test_cases?.length || 2,
        feedback: 'Execution encountered a syntax or runtime error during evaluation.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProblems = filterDifficulty === 'all'
    ? problems
    : problems.filter(p => p.difficulty.toLowerCase() === filterDifficulty.toLowerCase());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 font-mono text-sm">
        <div className="w-5 h-5 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading algorithm and system coding challenges...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="lime" size="sm">PRACTICE LAB</Badge>
            <span className="text-xs font-mono text-zinc-500">• Empirical Unit Testing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Coding Practice Lab
          </h1>
          <p className="text-sm text-[#929CA3] mt-1">
            Solve production algorithmic challenges, write verified code, and execute against deterministic unit tests.
          </p>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1.5 bg-[#0B0F12] p-1 rounded-xl border border-white/8 self-start sm:self-auto">
          {['all', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
            <button
              key={diff}
              onClick={() => setFilterDifficulty(diff)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filterDifficulty.toLowerCase() === diff.toLowerCase()
                  ? 'bg-[#161D22] text-[#C5F45B] shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem List (4 cols) */}
        <div className="lg:col-span-4 bg-[#0B0F12] border border-white/8 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/8">
            <span className="text-xs font-mono uppercase text-zinc-400 font-semibold">Available Challenges</span>
            <span className="text-xs font-mono text-[#35D9F2]">{filteredProblems.length} Problems</span>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredProblems.map(prob => {
              const isSelected = selectedProblem?.id === prob.id;
              return (
                <div
                  key={prob.id}
                  onClick={() => selectProblem(prob)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#161D22] border-[#35D9F2]/50 shadow-[0_0_20px_rgba(53,217,242,0.12)]'
                      : 'bg-[#11171B] border-white/5 hover:border-white/10 hover:bg-[#161D22]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400">
                      {prob.language.toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-mono uppercase font-semibold ${
                      prob.difficulty === 'Advanced' ? 'text-rose-400' :
                      prob.difficulty === 'Intermediate' ? 'text-[#35D9F2]' : 'text-[#C5F45B]'
                    }`}>
                      {prob.difficulty}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1 truncate">{prob.title}</h3>
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span>{prob.skill_name || 'Core Skill'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Editor & Problem Spec (8 cols) */}
        {selectedProblem ? (
          <div className="lg:col-span-8 space-y-6">
            {/* Top Workspace Bar */}
            <div className="bg-[#0B0F12] border border-white/8 rounded-2xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={selectedProblem.difficulty === 'Advanced' ? 'amber' : 'cyan'} size="sm">
                      {selectedProblem.difficulty}
                    </Badge>
                    <span className="text-xs font-mono text-zinc-400">{selectedProblem.language.toUpperCase()}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">{selectedProblem.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleResetCode}
                    variant="outline"
                    size="sm"
                    icon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleSubmitCode}
                    disabled={submitting}
                    variant="lime"
                    size="sm"
                    icon={submitting ? undefined : <Play className="w-3.5 h-3.5" />}
                  >
                    {submitting ? 'Running Tests...' : 'Run & Submit Code'}
                  </Button>
                </div>
              </div>

              {/* Tabs for Problem Spec / Hints / Test Cases */}
              <div className="flex items-center gap-2 border-b border-white/8 pb-2">
                <button
                  onClick={() => setActiveTab('problem')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'problem'
                      ? 'bg-[#161D22] text-white font-semibold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Problem Description
                </button>
                <button
                  onClick={() => setActiveTab('tests')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'tests'
                      ? 'bg-[#161D22] text-[#35D9F2] font-semibold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Test Cases ({selectedProblem.test_cases?.length || 0})
                </button>
                {selectedProblem.hints && selectedProblem.hints.length > 0 && (
                  <button
                    onClick={() => setActiveTab('hints')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'hints'
                        ? 'bg-[#161D22] text-[#C5F45B] font-semibold'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Hints ({selectedProblem.hints.length})
                  </button>
                )}
              </div>

              {/* Tab Content */}
              {activeTab === 'problem' && (
                <div className="text-xs sm:text-sm text-[#F5F7F4] leading-relaxed whitespace-pre-line">
                  {selectedProblem.description}
                </div>
              )}

              {activeTab === 'tests' && (
                <div className="space-y-3">
                  {selectedProblem.test_cases?.map((tc, idx) => (
                    <div key={idx} className="bg-[#11171B] border border-white/5 rounded-xl p-3.5 text-xs font-mono space-y-1">
                      <div className="text-zinc-400 font-semibold">{tc.description || `Test Case #${idx + 1}`}</div>
                      <div className="text-zinc-300">Input: <span className="text-[#35D9F2]">{tc.input}</span></div>
                      <div className="text-zinc-300">Expected: <span className="text-[#C5F45B]">{tc.expected_output}</span></div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'hints' && (
                <div className="space-y-2">
                  {selectedProblem.hints?.map((hint, idx) => (
                    <div key={idx} className="bg-[#11171B] border border-amber-400/20 rounded-xl p-3.5 text-xs text-amber-200 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                      <span>{hint}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Code Editor Area */}
            <div className="bg-[#0B0F12] border border-white/8 rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-5 py-3 bg-[#11171B] border-b border-white/8 text-xs font-mono">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Terminal className="w-4 h-4 text-[#35D9F2]" />
                  <span>solution.{selectedProblem.language === 'python' ? 'py' : 'js'}</span>
                </div>
                <span className="text-[11px] text-zinc-500">Auto-Indentation • Tab Size 2</span>
              </div>

              <textarea
                value={userCode}
                onChange={e => setUserCode(e.target.value)}
                rows={14}
                className="w-full bg-[#050608] text-emerald-400 font-mono text-xs sm:text-sm p-5 focus:outline-none resize-none leading-relaxed selection:bg-[#35D9F2]/30 selection:text-white"
                spellCheck={false}
              />
            </div>

            {/* Test Execution Output Console */}
            {result && (
              <div className={`p-5 rounded-2xl border transition-all ${
                result.status === 'passed'
                  ? 'bg-[#C5F45B]/10 border-[#C5F45B]/40 shadow-[0_0_30px_rgba(197,244,91,0.1)]'
                  : 'bg-rose-500/10 border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.1)]'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {result.status === 'passed' ? (
                      <CheckCircle2 className="w-5 h-5 text-[#C5F45B]" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                    <span className="font-bold text-white text-sm uppercase">
                      {result.status === 'passed' ? 'All Unit Tests Passed' : 'Tests Failed'}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-white bg-black/40 px-2.5 py-1 rounded-md border border-white/10">
                    {result.passed_tests} / {result.total_tests} Tests Passed
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 font-mono leading-relaxed mt-2">
                  {result.feedback}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-8 bg-[#0B0F12] border border-white/8 rounded-2xl p-12 text-center text-zinc-500">
            <Code2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a coding problem to begin writing code.</p>
          </div>
        )}
      </div>
    </div>
  );
};