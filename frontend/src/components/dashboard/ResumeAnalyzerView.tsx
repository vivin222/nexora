import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Crosshair, 
  Layers, 
  ArrowRight,
  TrendingUp,
  FileCheck,
  Search
} from 'lucide-react';
import { api } from '../../api/client';
import { ResumeAnalysis, CareerRole } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const ResumeAnalyzerView: React.FC = () => {
  const [resumeText, setResumeText] = useState<string>('');
  const [careers, setCareers] = useState<CareerRole[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<string>('career-fs-dev');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const sampleResume = `ALEX MERCER
Full Stack Software Engineer | San Francisco, CA | alex.mercer@nexora.ai | github.com/alexmercer

PROFESSIONAL SUMMARY:
Full Stack Developer with 3+ years of experience designing scalable web applications. Proficient in React, TypeScript, Python, Node.js, and PostgreSQL. Experienced with CI/CD and containerized cloud services.

EXPERIENCE:
Senior Frontend Engineer | TechCorp Inc. (2022 - Present)
- Engineered responsive user interfaces for SaaS analytics platform using React 18, TypeScript, and TailwindCSS, reducing load times by 35%.
- Implemented state management architecture with Redux Toolkit and React Query for real-time dashboard telemetry.
- Collaborated with backend team to design REST and GraphQL APIs for sub-100ms response latencies.

Software Developer | CloudWave Solutions (2020 - 2022)
- Built microservices using Python FastAPI and Node.js serving 500k monthly active requests.
- Designed relational schemas and indexing strategies in PostgreSQL, optimizing query performance by 40%.
- Integrated Docker container workflows and automated testing suites with 92% code coverage.

TECHNICAL SKILLS:
- Languages: JavaScript, TypeScript, Python, SQL, HTML5, CSS3
- Frameworks & Libraries: React, Node.js, Express, FastAPI, Next.js, Jest
- Databases & Tools: PostgreSQL, SQLite, Git, Docker, Redis, REST APIs, GraphQL
- Concepts: Component Architecture, Responsive Design, State Management, CI/CD`;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [careersData, latest] = await Promise.all([
        api.getCareers().catch(() => []),
        api.getLatestResumeAnalysis().catch(() => null)
      ]);
      setCareers(careersData);
      if (latest && latest.has_analysis) {
        setAnalysis(latest);
      }
    } catch (err) {
      console.error('Failed to load resume analysis data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    setResumeText(sampleResume);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;

    try {
      setAnalyzing(true);
      const res = await api.analyzeResume(resumeText.trim(), 'Alex_Mercer_Resume.pdf', selectedCareerId);
      setAnalysis(res);
    } catch (err) {
      console.error('Failed to analyze resume:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="cyan" size="sm">CAREER INTELLIGENCE</Badge>
            <span className="text-xs font-mono text-zinc-500">• ATS Semantic Matcher</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Resume & Portfolio Analyzer
          </h1>
          <p className="text-sm text-[#929CA3] mt-1">
            Analyze your resume against real-world engineering standards to identify ATS gaps, missing keywords, and quantify role alignment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#0B0F12] border border-white/8 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/8">
            <span className="text-xs font-mono uppercase text-zinc-400 font-semibold">Resume Source Text</span>
            <button
              onClick={handleLoadSample}
              className="text-xs font-mono text-[#35D9F2] hover:underline"
            >
              Load Sample CV
            </button>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                TARGET CAREER BENCHMARK
              </label>
              <select
                value={selectedCareerId}
                onChange={e => setSelectedCareerId(e.target.value)}
                className="w-full bg-[#11171B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#35D9F2]"
              >
                {careers.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#11171B]">
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1.5">
                <label>PASTE RESUME / PORTFOLIO CONTENT</label>
                <span>{resumeText.length} chars</span>
              </div>
              <textarea
                rows={12}
                required
                placeholder="Paste plain text from your resume or CV..."
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                className="w-full bg-[#11171B] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-[#35D9F2] leading-relaxed"
              />
            </div>

            <Button
              type="submit"
              disabled={analyzing || !resumeText.trim()}
              variant="primary"
              size="md"
              className="w-full"
              icon={analyzing ? undefined : <Sparkles className="w-4 h-4" />}
            >
              {analyzing ? 'Extracting & Comparing Skills...' : 'Run ATS Alignment Diagnostic'}
            </Button>
          </form>
        </div>

        {/* Right Column: Analysis Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {analysis ? (
            <div className="bg-[#0B0F12] border border-white/8 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
              {/* Header Metrics */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/8">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#35D9F2] block mb-1">
                    ATS COMPLIANCE DIAGNOSTIC
                  </span>
                  <h3 className="text-2xl font-bold text-white">Career Alignment Report</h3>
                </div>

                <div className="flex items-center gap-3 bg-[#11171B] px-5 py-3 rounded-xl border border-white/8">
                  <div className="text-3xl font-black font-mono text-[#35D9F2]">
                    {analysis.match_percentage}%
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 uppercase">
                    ATS Match<br />
                    <span className={analysis.match_percentage >= 70 ? 'text-[#C5F45B]' : 'text-amber-400'}>
                      {analysis.match_percentage >= 70 ? 'Strong Match' : 'Gap Detected'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {analysis.summary && (
                <div>
                  <h4 className="text-xs font-mono uppercase text-zinc-400 mb-1.5">Executive Summary</h4>
                  <p className="text-xs sm:text-sm text-[#F5F7F4] leading-relaxed">
                    {analysis.summary}
                  </p>
                </div>
              )}

              {/* Detected vs Missing Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#C5F45B]/10 border border-[#C5F45B]/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#C5F45B]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>DETECTED VERIFIED SKILLS ({analysis.detected_skills?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {analysis.detected_skills?.map((sk, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-black/30 text-xs font-mono text-zinc-200 border border-white/5">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-300">
                    <AlertCircle className="w-4 h-4" />
                    <span>HIGH-IMPACT DEFICITS ({analysis.missing_skills?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {analysis.missing_skills?.map((sk, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-black/30 text-xs font-mono text-amber-200 border border-amber-400/20">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actionable Feedback */}
              {analysis.actionable_feedback && analysis.actionable_feedback.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Actionable ATS & Bullet Point Optimizations
                  </h4>
                  <div className="space-y-2">
                    {analysis.actionable_feedback.map((fb, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#11171B] border border-white/5 flex items-start gap-3 text-xs text-zinc-300">
                        <ArrowRight className="w-4 h-4 text-[#35D9F2] shrink-0 mt-0.5" />
                        <span>{fb}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#0B0F12] border border-white/8 rounded-2xl p-12 text-center text-zinc-500">
              <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Paste your resume content or click "Load Sample CV" to run the ATS diagnostic.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};