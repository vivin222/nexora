import React, { useState } from 'react';
import { 
  Network, 
  UserSquare2, 
  Gauge, 
  Briefcase, 
  Milestone as MilestoneIcon, 
  Library, 
  ClipboardCheck, 
  BookOpen,
  MessageSquareCode,
  Mic2,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const AgentEcosystem: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<number>(0);

  const agents = [
    {
      id: 0,
      name: 'Central Orchestrator',
      role: 'System Conductor & DAG Validator',
      status: 'ONLINE',
      category: 'Core',
      icon: <Network className="w-5 h-5 text-[#35D9F2]" />,
      tag: 'Orchestration Engine',
      description: 'Coordinates communications across all 10 specialized agents, guarantees strictly typed JSON schema compliance, validates dependency execution graphs, and records immutable telemetry.',
      io: {
        input: 'Learner events, assessments, code submissions, career goal mutations',
        output: 'Topologically verified state, persisted SQLite records, real-time telemetry stream'
      },
      metrics: { latency: '18ms', reliability: '99.98%', protocol: 'JSON-RPC DAG' }
    },
    {
      id: 1,
      name: 'Profile Agent',
      role: 'Competency & Graph Synthesizer',
      status: 'ONLINE',
      category: 'Foundation',
      icon: <UserSquare2 className="w-5 h-5 text-[#C5F45B]" />,
      tag: 'Agent #01',
      description: 'Ingests verified skills, educational background, years of experience, and project repositories into a unified, high-fidelity learner knowledge graph.',
      io: {
        input: 'Learner profile declarations, GitHub repos, certification records',
        output: 'Normalized competency map {skill_id: proficiency_0_to_100}'
      },
      metrics: { latency: '24ms', reliability: '100%', protocol: 'Graph Normalizer' }
    },
    {
      id: 2,
      name: 'Skill Analysis Agent',
      role: 'Deterministic Matrix Diagnostic',
      status: 'ONLINE',
      category: 'Analysis',
      icon: <Gauge className="w-5 h-5 text-[#35D9F2]" />,
      tag: 'Agent #02',
      description: 'Executes mathematical matrix algorithms to calculate strengths, weaknesses, and missing competencies. Never relies on hallucinated probabilistic scoring.',
      io: {
        input: 'Learner skill matrix + Target career required skill competencies',
        output: 'Overall match score %, missing skills list, weighted priority gaps'
      },
      metrics: { latency: '12ms', reliability: '100%', protocol: 'Deterministic Math' }
    },
    {
      id: 3,
      name: 'Career Intelligence Agent',
      role: 'Market Trajectory & Benchmark Engine',
      status: 'ONLINE',
      category: 'Intelligence',
      icon: <Briefcase className="w-5 h-5 text-[#C5F45B]" />,
      tag: 'Agent #03',
      description: 'Evaluates real-time compensation benchmarks, role difficulty curves, and hiring demand trajectories to contextualize readiness into actionable career milestones.',
      io: {
        input: 'Target career slug & composite readiness score',
        output: 'Readiness band (Developing/Near Ready/Ready), blockers, market outlook'
      },
      metrics: { latency: '31ms', reliability: '99.95%', protocol: 'Market Graph' }
    },
    {
      id: 4,
      name: 'Roadmap Agent',
      role: 'Topological Milestone Sequencer',
      status: 'ONLINE',
      category: 'Planning',
      icon: <MilestoneIcon className="w-5 h-5 text-[#35D9F2]" />,
      tag: 'Agent #04',
      description: 'Constructs an evolving, topologically ordered learning sequence. Preserves completed achievements while dynamically adapting subsequent milestones.',
      io: {
        input: 'Weighted skill gap list & existing milestone completion state',
        output: 'Ordered milestone objects with objectives, estimated hours, and prerequisites'
      },
      metrics: { latency: '42ms', reliability: '100%', protocol: 'DAG Scheduler' }
    },
    {
      id: 5,
      name: 'Resource Agent',
      role: 'Curriculum & Asset Curator',
      status: 'ONLINE',
      category: 'Curriculum',
      icon: <Library className="w-5 h-5 text-[#C5F45B]" />,
      tag: 'Agent #05',
      description: 'Pairs identified competency deficits with high-yield documentation, interactive exercises, production repository references, and video walkthroughs.',
      io: {
        input: 'Deficit skill IDs and target proficiency thresholds',
        output: 'Curated resource bundles categorized by course, docs, project, exercise'
      },
      metrics: { latency: '28ms', reliability: '100%', protocol: 'Asset Ranker' }
    },
    {
      id: 6,
      name: 'Assessment Agent',
      role: 'Empirical Verification Engine',
      status: 'ONLINE',
      category: 'Verification',
      icon: <ClipboardCheck className="w-5 h-5 text-[#35D9F2]" />,
      tag: 'Agent #06',
      description: 'Evaluates scenario-based quizzes, analyzes rationale behind incorrect answers, updates verified proficiency levels, and triggers DAG recalibration.',
      io: {
        input: 'Learner answers dictionary {question_id: selected_index}',
        output: 'Verified score %, updated skill level, question-by-question explanations'
      },
      metrics: { latency: '35ms', reliability: '100%', protocol: 'Psychometric Evaluator' }
    },
    {
      id: 7,
      name: 'Learning Content Agent',
      role: 'Structured Modular Curriculum Engine',
      status: 'ONLINE',
      category: 'Learning',
      icon: <BookOpen className="w-5 h-5 text-[#C5F45B]" />,
      tag: 'Agent #07',
      description: 'Structures multi-module learning courses, generates topic-wise deep dives with production code snippets, key takeaways, and interactive knowledge checks.',
      io: {
        input: 'Course curriculum request, learner current milestone, target skill depth',
        output: 'Structured course tree, formatted markdown modules, executable syntax'
      },
      metrics: { latency: '40ms', reliability: '100%', protocol: 'Course Synthesizer' }
    },
    {
      id: 8,
      name: 'Contextual AI Tutor',
      role: 'Real-Time Code & Concept Assistant',
      status: 'ONLINE',
      category: 'Tutoring',
      icon: <MessageSquareCode className="w-5 h-5 text-[#35D9F2]" />,
      tag: 'Agent #08',
      description: 'Injected with full learner context: active lesson code, target career, and current skill weaknesses to deliver Socratic guidance without generic answers.',
      io: {
        input: 'Learner question, highlighted code snippet, active lesson state',
        output: 'Architectural explanation, step-by-step breakdown, targeted code fix'
      },
      metrics: { latency: '65ms', reliability: '99.9%', protocol: 'Context Injection' }
    },
    {
      id: 9,
      name: 'Interview Simulator Agent',
      role: 'Technical & Behavioral Evaluator',
      status: 'ONLINE',
      category: 'Evaluation',
      icon: <Mic2 className="w-5 h-5 text-[#C5F45B]" />,
      tag: 'Agent #09',
      description: 'Conducts simulated interview rounds across Technical, Architectural, and Behavioral tracks, scoring responses against senior staff engineering rubrics.',
      io: {
        input: 'Candidate response text, question rubrics, target career tier',
        output: 'Score out of 100, identified strengths, critical improvements, ideal response'
      },
      metrics: { latency: '75ms', reliability: '99.8%', protocol: 'Rubric Evaluator' }
    },
    {
      id: 10,
      name: 'Resume & Portfolio Agent',
      role: 'Applicant Tracking & Match Analyzer',
      status: 'ONLINE',
      category: 'Career',
      icon: <FileSpreadsheet className="w-5 h-5 text-[#35D9F2]" />,
      tag: 'Agent #10',
      description: 'Parses resume text, extracts technical skills and impact metrics, cross-references against target role standards, and generates ATS-optimized bullet points.',
      io: {
        input: 'Raw resume text, target career profile, project portfolio links',
        output: 'Extracted skills, role match score %, missing keywords, ATS suggestions'
      },
      metrics: { latency: '48ms', reliability: '100%', protocol: 'ATS Parser' }
    }
  ];

  const current = agents[selectedAgent];

  return (
    <section id="agent-ecosystem" className="py-28 bg-[#07080B] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Badge variant="lime" className="mb-4">MULTI-AGENT DAG TOPOLOGY</Badge>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            10 Autonomous Specialized Agents
          </h2>
          <p className="text-[#929CA3] mt-4 text-base sm:text-lg leading-relaxed">
            Not disconnected chatbots. A coordinated multi-agent collective where each agent operates with dedicated responsibilities, structured JSON schemas, and deterministic evaluation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Agent Selector List */}
          <div className="lg:col-span-5 space-y-2 max-h-[640px] overflow-y-auto pr-2 custom-scrollbar">
            {agents.map((ag) => {
              const isSelected = selectedAgent === ag.id;
              return (
                <div
                  key={ag.id}
                  onClick={() => setSelectedAgent(ag.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#11171B] border-[#35D9F2]/50 shadow-[0_0_24px_rgba(53,217,242,0.15)]'
                      : 'bg-[#0B0F12] border-white/5 hover:border-white/10 hover:bg-[#11171B]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-[#35D9F2]/20 border border-[#35D9F2]/40' : 'bg-[#161D22] border border-white/5'
                    }`}>
                      {ag.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white flex items-center gap-2">
                        {ag.name}
                        {ag.id === 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#35D9F2]/20 text-[#35D9F2]">
                            CORE
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#929CA3] truncate max-w-[220px]">{ag.role}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-mono text-zinc-500 block">{ag.tag}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Agent Detail Panel */}
          <div className="lg:col-span-7 bg-[#0B0F12] border border-white/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-white/8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#11171B] border border-[#35D9F2]/30 flex items-center justify-center">
                  {current.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="cyan" size="sm">{current.tag}</Badge>
                    <span className="text-xs font-mono text-[#C5F45B] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5F45B] animate-pulse" />
                      {current.status}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{current.name}</h3>
                  <p className="text-xs font-mono text-[#929CA3]">{current.role}</p>
                </div>
              </div>

              {/* Mini telemetry specs */}
              <div className="flex items-center gap-4 text-xs font-mono bg-[#11171B] px-3.5 py-2 rounded-lg border border-white/5">
                <div>
                  <span className="text-zinc-500 block text-[10px]">AVG LATENCY</span>
                  <span className="text-[#35D9F2] font-semibold">{current.metrics.latency}</span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div>
                  <span className="text-zinc-500 block text-[10px]">UPTIME</span>
                  <span className="text-[#C5F45B] font-semibold">{current.metrics.reliability}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">Agent Mission</h4>
                <p className="text-sm text-[#F5F7F4] leading-relaxed">
                  {current.description}
                </p>
              </div>

              {/* Input / Output Contracts */}
              <div className="space-y-3">
                <div className="bg-[#11171B] p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#35D9F2] mb-1 font-semibold">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>CONTRACT INGESTION PAYLOAD (INPUT)</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-mono">
                    {current.io.input}
                  </p>
                </div>

                <div className="bg-[#11171B] p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#C5F45B] mb-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>SYNTHESIZED INTELLIGENCE (OUTPUT)</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-mono">
                    {current.io.output}
                  </p>
                </div>
              </div>

              {/* Orchestrator Protocol Info */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#11171B] to-[#0E1317] border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Activity className="w-4 h-4 text-[#35D9F2]" />
                  <span>Execution Framework: <strong className="text-white font-mono">{current.metrics.protocol}</strong></span>
                </div>
                <span className="text-[11px] font-mono text-[#35D9F2]">Immutable DAG Node</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};