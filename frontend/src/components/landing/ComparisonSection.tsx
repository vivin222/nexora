import React from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';

export const ComparisonSection: React.FC = () => {
  const comparisons = [
    {
      feature: 'Curriculum Structure',
      legacy: 'Static 40-hour video playlist identical for all students',
      nexora: 'Personalized roadmap sequenced to your exact missing competencies'
    },
    {
      feature: 'Prior Knowledge Recognition',
      legacy: 'Forces you to re-watch basics even if you already know them',
      nexora: 'Ingests verified skills and skips redundant material entirely'
    },
    {
      feature: 'Skill Gap Diagnostics',
      legacy: 'None. You guess what skills you need from job descriptions',
      nexora: 'Deterministic mathematical weighted scoring against real job requirements'
    },
    {
      feature: 'Response to Assessment Performance',
      legacy: 'Multiple choice test does not alter subsequent lectures',
      nexora: 'Submissions dynamically recalibrate readiness and re-order milestones'
    },
    {
      feature: 'AI Guidance & Mentorship',
      legacy: 'Generic LLM chatbot without your actual code or progress context',
      nexora: 'Context-injected mentor aware of exact gaps, test scores, and goals'
    },
    {
      feature: 'Role Flexibility',
      legacy: 'Buying a new course when switching interests or roles',
      nexora: 'Instantly recalculates readiness and rebuilds roadmap for any new target career'
    }
  ];

  return (
    <section id="comparison" className="py-24 bg-[#050507]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="crimson" className="mb-3">PARADIGM SHIFT</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why Legacy Learning Platforms Fail Serious Engineers
          </h2>
          <p className="text-zinc-400 mt-3 text-base">
            Every learner possesses distinct foundational skills and goals. A standardized course curriculum is fundamentally obsolete.
          </p>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden border border-white/8">
          <div className="grid grid-cols-12 bg-zinc-950 p-4 border-b border-white/8 text-xs font-mono font-semibold uppercase tracking-wider">
            <div className="col-span-4 text-zinc-400">Core Capability</div>
            <div className="col-span-4 text-zinc-500">Legacy Course Catalogs</div>
            <div className="col-span-4 text-rose-400">NEXORA Platform</div>
          </div>

          <div className="divide-y divide-white/5">
            {comparisons.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 p-4 sm:p-5 text-sm items-center hover:bg-zinc-900/30 transition-colors">
                <div className="col-span-12 sm:col-span-4 font-semibold text-white mb-2 sm:mb-0">
                  {row.feature}
                </div>
                <div className="col-span-6 sm:col-span-4 text-zinc-400 text-xs sm:text-sm flex items-start gap-2 pr-3">
                  <X className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                  <span>{row.legacy}</span>
                </div>
                <div className="col-span-6 sm:col-span-4 text-rose-100 text-xs sm:text-sm flex items-start gap-2 font-medium">
                  <Check className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
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
