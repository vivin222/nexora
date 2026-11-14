import React from 'react';
import { UserCheck, SlidersHorizontal, GitFork, RefreshCw } from 'lucide-react';
import { Badge } from '../common/Badge';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Profile & Competency Ingestion',
      agent: 'Profile Agent',
      desc: 'Ingests your existing technical skills, proficiency levels, code repositories, and educational background to form a unified baseline knowledge graph.',
      icon: <UserCheck className="w-5 h-5 text-rose-400" />
    },
    {
      step: '02',
      title: 'Deterministic Gap Diagnostic',
      agent: 'Skill Analysis & Career Intelligence Agents',
      desc: 'Calculates the mathematical delta between your current abilities and actual requirements for your target career role using weighted scoring.',
      icon: <SlidersHorizontal className="w-5 h-5 text-rose-400" />
    },
    {
      step: '03',
      title: 'Dynamic Roadmap Synthesis',
      agent: 'Roadmap & Resource Agents',
      desc: 'Generates a topologically ordered learning path targeting high-impact missing skills first, paired with curated labs, docs, and project builds.',
      icon: <GitFork className="w-5 h-5 text-rose-400" />
    },
    {
      step: '04',
      title: 'Empirical Verification & Adaptation',
      agent: 'Assessment Agent & Orchestrator',
      desc: 'Interactive quizzes verify real concept mastery. Submissions automatically recalculate readiness scores and adapt subsequent milestones.',
      icon: <RefreshCw className="w-5 h-5 text-rose-400" />
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#050507]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="crimson" className="mb-3">CONTINUOUS INTELLIGENCE LOOP</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How NEXORA Evolves With You
          </h2>
          <p className="text-zinc-400 mt-3 text-base">
            Not a static checklist. NEXORA operates as an adaptive feedback control system constantly calibrating to your verified progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <div 
              key={idx}
              className="glass-panel p-6 rounded-2xl relative flex flex-col justify-between hover:border-rose-500/30 transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:border-rose-500/40 transition-colors">
                    {s.icon}
                  </div>
                  <span className="text-2xl font-black font-mono text-zinc-700 group-hover:text-rose-500/50 transition-colors">
                    {s.step}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-rose-400 uppercase tracking-wider mb-1">
                  {s.agent}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-rose-100 transition-colors">
                  {s.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>Phase {s.step}</span>
                <span className="text-rose-500/80">Continuous</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
