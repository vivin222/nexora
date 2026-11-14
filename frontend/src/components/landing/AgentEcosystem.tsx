import React, { useState } from 'react';
import { 
  Network, 
  UserSquare2, 
  Gauge, 
  Briefcase, 
  Milestone as MilestoneIcon, 
  Library, 
  ClipboardCheck, 
  ArrowRight,
  ShieldCheck
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
      icon: <Network className="w-6 h-6 text-rose-400" />,
      tag: 'Core Orchestrator',
      description: 'Coordinates communication across all 6 specialized agents, guarantees schema compliance, tracks execution latency, and records immutable telemetry.',
      io: {
        input: 'Learner actions, target career selection, assessment submissions',
        output: 'Synchronized intelligence graph, persisted state, dashboard telemetry'
      }
    },
    {
      id: 1,
      name: 'Profile Agent',
      role: 'Knowledge Graph Synthesizer',
      status: 'ONLINE',
      icon: <UserSquare2 className="w-6 h-6 text-rose-400" />,
      tag: 'Agent #1',
      description: 'Understands learner education, existing verified skills, project repositories, and career targets to form a high-fidelity baseline profile.',
      io: {
        input: 'Learner profile attributes, GitHub/project data, skill declarations',
        output: 'Normalized competency map {skill_id: proficiency_0_to_100}'
      }
    },
    {
      id: 2,
      name: 'Skill Analysis Agent',
      role: 'Mathematical Gap Diagnostic',
      status: 'ONLINE',
      icon: <Gauge className="w-6 h-6 text-rose-400" />,
      tag: 'Agent #2',
      description: 'Executes deterministic algorithms to calculate strengths, weaknesses, and missing skills. Does not allow LLM hallucination of numerical scores.',
      io: {
        input: 'Normalized learner skills & career skill requirement matrices',
        output: 'Overall match score %, missing skills list, detailed weighted gaps'
      }
    },
    {
      id: 3,
      name: 'Career Intelligence Agent',
      role: 'Market & Role Alignment Engine',
      status: 'ONLINE',
      icon: <Briefcase className="w-6 h-6 text-rose-400" />,
      tag: 'Agent #3',
      description: 'Evaluates real-time compensation benchmarks, demand trajectories, and role difficulties to contextualize readiness into actionable career milestones.',
      io: {
        input: 'Target career slug & composite readiness score',
        output: 'Readiness band (Developing/Near Ready/Ready), top blockers, market outlook'
      }
    },
    {
      id: 4,
      name: 'Roadmap Agent',
      role: 'Topological Milestone Sequencer',
      status: 'ONLINE',
      icon: <MilestoneIcon className="w-6 h-6 text-rose-400" />,
      tag: 'Agent #4',
      description: 'Constructs an evolving, personalized learning sequence. Preserves previously completed milestones while adapting subsequent priorities.',
      io: {
        input: 'Weighted skill gap list & existing milestone completion history',
        output: 'Ordered milestone objects with objectives, hours, and resources'
      }
    },
    {
      id: 5,
      name: 'Resource Agent',
      role: 'Curriculum & Asset Curator',
      status: 'ONLINE',
      icon: <Library className="w-6 h-6 text-rose-400" />,
      tag: 'Agent #5',
      description: 'Pairs each identified competency deficit with high-yield documentation, interactive exercises, and production project repositories.',
      io: {
        input: 'Deficit skill IDs and required proficiency thresholds',
        output: 'Curated resource bundles categorized by course, docs, project, exercise'
      }
    },
    {
      id: 6,
      name: 'Assessment Agent',
      role: 'Empirical Verification Engine',
      status: 'ONLINE',
      icon: <ClipboardCheck className="w-6 h-6 text-rose-400" />,
      tag: 'Agent #6',
      description: 'Evaluates quiz submissions, explains incorrect options, adjusts verified proficiency levels, and triggers the orchestrator to recalibrate the roadmap.',
      io: {
        input: 'Learner answers dictionary {question_id: selected_index}',
        output: 'Verified score %, updated skill level, question-by-question breakdown'
      }
    }
  ];

  const current = agents[selectedAgent];

  return (
    <section id="agent-ecosystem" className="py-24 bg-[#07080b] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="crimson" className="mb-3">MULTI-AGENT DAG TOPOLOGY</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The Autonomous NEXORA Agent Ecosystem
          </h2>
          <p className="text-zinc-400 mt-3 text-base">
            Not six disconnected chatbots. A synchronized multi-agent pipeline where agents exchange structured JSON payloads through a central orchestrator.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Agent Selector List */}
          <div className="lg:col-span-5 space-y-2">
            {agents.map((ag) => (
              <div
                key={ag.id}
                onClick={() => setSelectedAgent(ag.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedAgent === ag.id
                    ? 'bg-zinc-900 border-rose-500/50 shadow-[0_0_20px_rgba(225,29,72,0.2)]'
                    : 'bg-zinc-950/60 border-white/5 hover:border-white/10 hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    selectedAgent === ag.id ? 'bg-rose-950/60 text-rose-400' : 'bg-zinc-900 text-zinc-400'
                  }`}>
                    {ag.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{ag.name}</div>
                    <div className="text-xs text-zinc-400">{ag.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                    {ag.status}
                  </span>
                  <ArrowRight className={`w-4 h-4 transition-transform ${
                    selectedAgent === ag.id ? 'text-rose-400 translate-x-0.5' : 'text-zinc-600'
                  }`} />
                </div>
              </div>
            ))}
          </div>

          {/* Active Agent Detailed Inspector */}
          <div className="lg:col-span-7 glass-panel-elevated p-8 rounded-2xl border border-rose-500/20 crimson-glow-sm">
            <div className="flex items-start justify-between pb-6 border-b border-white/8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-rose-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.3)]">
                  {current.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-rose-400 uppercase tracking-wider">{current.tag}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mt-0.5">{current.name}</h3>
                  <div className="text-xs text-zinc-400 font-mono mt-0.5">{current.role}</div>
                </div>
              </div>
              <Badge variant="crimson" size="sm">Active in DAG</Badge>
            </div>

            <div className="py-6 space-y-4">
              <div>
                <h4 className="text-xs font-mono uppercase text-zinc-400 tracking-wider mb-1.5">
                  Operational Responsibilities
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {current.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-white/5 space-y-1">
                  <div className="text-[11px] font-mono text-zinc-400 uppercase">Input Payload</div>
                  <div className="text-xs text-zinc-300 font-mono leading-relaxed">{current.io.input}</div>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-white/5 space-y-1">
                  <div className="text-[11px] font-mono text-rose-400 uppercase">Output Structured Result</div>
                  <div className="text-xs text-zinc-300 font-mono leading-relaxed">{current.io.output}</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/8 flex items-center justify-between text-xs text-zinc-500 font-mono">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Deterministic Output Validation
              </span>
              <span>Sub-50ms Execution Target</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
