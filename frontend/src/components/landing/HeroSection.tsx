import React from 'react';
import { ArrowRight, Sparkles, Terminal, Activity, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface HeroSectionProps {
  onStart: () => void;
  onExplore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStart, onExplore }) => {
  return (
    <section className="relative overflow-hidden pt-24 pb-28 md:pt-32 md:pb-40 bg-[#050608] vercel-grid">
      {/* Subtle Cyan & Lime Atmospheric Lighting Orbs */}
      <div className="ambient-cyan-orb w-[650px] h-[650px] -top-48 left-1/2 -translate-x-1/2 opacity-25" />
      <div className="ambient-lime-orb w-[450px] h-[450px] top-60 -right-24 opacity-20" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#11171B] border border-[#35D9F2]/30 text-xs font-mono text-[#35D9F2] mb-8 cyan-glow-sm">
          <span className="flex h-2 w-2 rounded-full bg-[#35D9F2] animate-ping" />
          <span className="font-semibold text-[#35D9F2]">NEXORA 2.0 ACTIVE</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-300">10-Agent Autonomous DAG Synchronized</span>
        </div>

        {/* Tagline & Headline */}
        <h2 className="text-xs sm:text-sm font-mono uppercase tracking-[0.28em] text-[#35D9F2] font-semibold mb-5">
          Your Potential. Reimagined.
        </h2>
        
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-[#F5F7F4] mb-8 leading-[1.04]">
          Your future isn't fixed.{' '}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-[#eaf7f9] to-[#35D9F2]">
            It's engineered.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[#929CA3] leading-relaxed mb-12 font-normal">
          Discover your strengths, close skill gaps and build a personalized path toward the career you want. 
          Powered by 10 collaborating autonomous agents and deterministic mathematical evaluation.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Button
            onClick={onStart}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto text-base px-8 py-3.5"
            icon={<ArrowRight className="w-5 h-5 ml-1" />}
          >
            Get Started Free
          </Button>
          
          <Button
            onClick={onExplore}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto text-base px-7 py-3.5"
          >
            Explore Platform Architecture
          </Button>
        </div>

        {/* Architectural KPI Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-white/8 text-left">
          <div className="p-4 rounded-xl surface-card">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F5F7F4] font-mono">10 Agents</div>
            <div className="text-xs text-[#929CA3] mt-1">Synchronized DAG topology</div>
          </div>
          <div className="p-4 rounded-xl surface-card">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#35D9F2] font-mono">100% Math</div>
            <div className="text-xs text-[#929CA3] mt-1">Deterministic skill scoring</div>
          </div>
          <div className="p-4 rounded-xl surface-card">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#C5F45B] font-mono">Real-Time</div>
            <div className="text-xs text-[#929CA3] mt-1">Adaptive quiz & lab recalibration</div>
          </div>
          <div className="p-4 rounded-xl surface-card">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F5F7F4] font-mono">14 Modules</div>
            <div className="text-xs text-[#929CA3] mt-1">Complete engineering workspace</div>
          </div>
        </div>
      </div>
    </section>
  );
};
