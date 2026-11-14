import React from 'react';
import { ArrowRight, Sparkles, Terminal, Activity, CheckCircle2, ShieldAlert } from 'lucide-react';
import { CrimsonButton } from '../common/CrimsonButton';
import { Badge } from '../common/Badge';

interface HeroSectionProps {
  onStart: () => void;
  onExplore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStart, onExplore }) => {
  return (
    <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-36 bg-[#050507]">
      {/* Subtle Crimson Atmospheric Glows */}
      <div className="ambient-crimson-orb w-[600px] h-[600px] -top-40 left-1/2 -translate-x-1/2 opacity-30 animate-pulse-subtle" />
      <div className="ambient-crimson-orb w-[300px] h-[300px] top-60 -left-20 opacity-20" />
      <div className="ambient-crimson-orb w-[400px] h-[400px] top-40 -right-20 opacity-20" />

      {/* Grid Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-rose-500/30 text-xs font-mono text-rose-300 mb-8 crimson-glow-sm">
          <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
          <span className="font-semibold text-rose-400">NEXORA PLATFORM LIVE</span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-300">Multi-Agent Intelligence Active</span>
        </div>

        {/* Tagline & Main Headline */}
        <h2 className="text-xs sm:text-sm font-mono uppercase tracking-[0.25em] text-rose-400 font-semibold mb-4 crimson-text-glow">
          Your Potential. Reimagined.
        </h2>
        
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.08]">
          Stop Taking Generic Courses.{' '}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-100 to-rose-400">
            Engineer Your Exact Career Trajectory.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-zinc-400 leading-relaxed mb-10">
          NEXORA evaluates your current competencies, calculates mathematically rigorous skill gaps against elite industry roles, 
          and synthesizes an evolving learning roadmap powered by 6 collaborating autonomous AI agents.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <CrimsonButton
            onClick={onStart}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto text-base px-8 py-3.5"
            icon={<ArrowRight className="w-5 h-5 ml-1" />}
          >
            Start Your Journey
          </CrimsonButton>
          
          <CrimsonButton
            onClick={onExplore}
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto text-base px-7 py-3.5"
          >
            Explore Platform Architecture
          </CrimsonButton>
        </div>

        {/* Proof Points & Micro-Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-white/8 text-left">
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5">
            <div className="text-xl sm:text-2xl font-bold text-white font-mono">6 Agents</div>
            <div className="text-xs text-zinc-400 mt-1">Specialized DAG orchestrator</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5">
            <div className="text-xl sm:text-2xl font-bold text-rose-400 font-mono">100% Math</div>
            <div className="text-xs text-zinc-400 mt-1">Deterministic gap metrics</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5">
            <div className="text-xl sm:text-2xl font-bold text-white font-mono">Real-Time</div>
            <div className="text-xs text-zinc-400 mt-1">Adaptive quiz recalibration</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5">
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">Official SDK</div>
            <div className="text-xs text-zinc-400 mt-1">Google Gemini 2.5 Flash</div>
          </div>
        </div>
      </div>
    </section>
  );
};
