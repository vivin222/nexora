import React from 'react';
import { 
  UserCheck, 
  Cpu, 
  Crosshair, 
  Hammer, 
  ClipboardCheck, 
  RotateCw 
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      phase: 'Understand',
      title: 'Baseline Competency Ingestion',
      agent: 'Profile Agent',
      desc: 'Ingests your existing technical skills, verified proficiencies, repositories, and learning targets into a unified baseline knowledge graph.',
      icon: <UserCheck className="w-5 h-5 text-[#35D9F2]" />,
      accent: 'cyan'
    },
    {
      step: '02',
      phase: 'Analyze',
      title: 'Deterministic Gap Diagnostic',
      agent: 'Skill Analysis Agent',
      desc: 'Executes mathematical matrix calculations between your current abilities and actual industry job requirements. Zero guesswork or hallucinations.',
      icon: <Cpu className="w-5 h-5 text-[#C5F45B]" />,
      accent: 'lime'
    },
    {
      step: '03',
      phase: 'Identify',
      title: 'Targeted Blockers & Benchmarks',
      agent: 'Career Intelligence Agent',
      desc: 'Pinpoints specific competency deficits that block interview qualification, cross-referenced with real-time market compensation and demand trajectories.',
      icon: <Crosshair className="w-5 h-5 text-[#35D9F2]" />,
      accent: 'cyan'
    },
    {
      step: '04',
      phase: 'Build',
      title: 'Topological Roadmap & Labs',
      agent: 'Roadmap & Learning Agents',
      desc: 'Constructs an evolving learning sequence prioritizing high-impact missing skills, paired with interactive coding labs and real-world system projects.',
      icon: <Hammer className="w-5 h-5 text-[#C5F45B]" />,
      accent: 'lime'
    },
    {
      step: '05',
      phase: 'Evaluate',
      title: 'Empirical Verification & Quizzes',
      agent: 'Assessment & Interview Agents',
      desc: 'Adaptive scenario evaluations and technical interview simulations rigorously test depth of understanding beyond surface memorization.',
      icon: <ClipboardCheck className="w-5 h-5 text-[#35D9F2]" />,
      accent: 'cyan'
    },
    {
      step: '06',
      phase: 'Adapt',
      title: 'Continuous Autonomous Recalibration',
      agent: 'Central Orchestrator',
      desc: 'Every completed lab and assessment immediately updates verified mastery, recalibrates career match score, and adapts remaining milestones.',
      icon: <RotateCw className="w-5 h-5 text-[#C5F45B]" />,
      accent: 'lime'
    }
  ];

  return (
    <section id="how-it-works" className="py-28 bg-[#050608] relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-grid opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Badge variant="cyan" className="mb-4">CONTINUOUS INTELLIGENCE LOOP</Badge>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            How NEXORA Engineers Your Growth
          </h2>
          <p className="text-[#929CA3] mt-4 text-base sm:text-lg leading-relaxed">
            Not a static checklist. A continuous feedback control system powered by cooperating AI agents that measure, adapt, and accelerate your path to engineering mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s, idx) => {
            const isCyan = s.accent === 'cyan';
            return (
              <div 
                key={idx}
                className="group relative bg-[#0B0F12] border border-white/8 hover:border-[#35D9F2]/30 p-7 rounded-2xl transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_30px_rgba(53,217,242,0.08)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-11 h-11 rounded-xl bg-[#11171B] border border-white/10 flex items-center justify-center group-hover:border-[#35D9F2]/40 transition-colors">
                      {s.icon}
                    </div>
                    <span className="text-2xl font-black font-mono text-zinc-700 group-hover:text-white/40 transition-colors">
                      {s.step}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#35D9F2] font-semibold">
                      Phase {s.step} • {s.phase}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-[#F5F7F4] transition-colors">
                    {s.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#929CA3] leading-relaxed mb-4">
                    {s.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  <span className="text-zinc-400">Owner: {s.agent}</span>
                  <span className={isCyan ? 'text-[#35D9F2]/80' : 'text-[#C5F45B]/80'}>
                    Autonomous
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};