import React from 'react';
import { X, Check } from 'lucide-react';
import { Badge } from '../common/Badge';

export const ComparisonSection: React.FC = () => {
  const comparisons = [
    {
      feature: 'Curriculum Structure',
      legacy: 'Static 40-hour video playlist identical for all students regardless of skill',
      nexora: 'Personalized topological roadmap sequenced to your exact missing competencies'
    },
    {
      feature: 'Prior Knowledge Recognition',
      legacy: 'Forces you to sit through basics even if you have years of experience',
      nexora: 'Ingests verified skills and skips redundant material entirely'
    },
    {
      feature: 'Skill Gap Diagnostics',
      legacy: 'None. You guess what skills you need from conflicting job descriptions',
      nexora: 'Deterministic mathematical weighted scoring against real engineering role requirements'
    },
    {
      feature: 'Response to Assessment Performance',
      legacy: 'Multiple-choice test does not alter subsequent syllabus or pacing',
      nexora: 'Submissions dynamically recalibrate readiness and re-order milestones'
    },
    {
      feature: 'AI Guidance & Mentorship',
      legacy: 'Generic LLM chatbot without your actual code or progress context',
      nexora: 'Context-injected Socratic mentor aware of your active code, gaps, and goals'
    },
    {
      feature: 'Target Role Transition',
      legacy: 'Requires purchasing an entirely new course bundle when changing roles',
      nexora: 'Instantly recalculates readiness and rebuilds roadmap for any new target career'
    }
  ];

  return (
    <section id="comparison" className="py-28 bg-[#050608] border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Badge variant="cyan" className="mb-4">PARADIGM SHIFT</Badge>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Why Generic Course Platforms Fail Serious Engineers
          </h2>
          <p className="text-[#929CA3] mt-4 text-base sm:text-lg leading-relaxed">
            Every learner has distinct foundational skills, blind spots, and aspirations. A standardized one-size-fits-all curriculum is fundamentally obsolete.
          </p>
        </div>

        <div className="bg-[#0B0F12] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="grid grid-cols-12 bg-[#11171B] p-4.5 border-b border-white/8 text-xs font-mono font-semibold uppercase tracking-wider">
            <div className="col-span-4 text-zinc-400">Core Capability</div>
            <div className="col-span-4 text-zinc-500">Legacy Course Catalogs</div>
            <div className="col-span-4 text-[#35D9F2] flex items-center gap-1.5">
              <span>NEXORA Platform</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#35D9F2]" />
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {comparisons.map((row, idx) => (
              <div 
                key={idx} 
                className="grid grid-cols-12 p-5 sm:p-6 text-sm items-center hover:bg-white/[0.02] transition-colors"
              >
                <div className="col-span-12 sm:col-span-4 font-semibold text-white mb-2 sm:mb-0">
                  {row.feature}
                </div>
                <div className="col-span-6 sm:col-span-4 text-zinc-400 text-xs sm:text-sm flex items-start gap-2.5 pr-4">
                  <X className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                  <span>{row.legacy}</span>
                </div>
                <div className="col-span-6 sm:col-span-4 text-[#F5F7F4] text-xs sm:text-sm flex items-start gap-2.5 font-medium">
                  <Check className="w-4 h-4 text-[#35D9F2] shrink-0 mt-0.5" />
                  <span>{row.nexora}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};