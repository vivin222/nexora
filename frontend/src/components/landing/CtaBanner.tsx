import React from 'react';
import { ArrowRight, Sparkles, Terminal } from 'lucide-react';
import { CrimsonButton } from '../common/CrimsonButton';

export const CtaBanner: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <section className="relative py-24 bg-[#07080b] overflow-hidden border-t border-white/5">
      <div className="ambient-crimson-orb w-[500px] h-[500px] bottom-0 left-1/2 -translate-x-1/2 opacity-25" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center glass-panel-elevated p-12 sm:p-16 rounded-3xl border border-rose-500/30 crimson-glow">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/60 text-xs font-mono text-rose-300 mb-6">
          <Terminal className="w-3.5 h-3.5" />
          <span>INITIALIZE AUTONOMOUS CALIBRATION</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
          Ready to See Your True Potential?
        </h2>

        <p className="text-base sm:text-lg text-zinc-300 max-w-xl mx-auto mb-8 leading-relaxed">
          Launch NEXORA right now. Ingest your existing skills, pick your desired career track, and let our multi-agent architecture build your custom roadmap.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <CrimsonButton
            onClick={onStart}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto px-9 py-4 text-base font-bold"
            icon={<ArrowRight className="w-5 h-5 ml-1" />}
          >
            Launch Platform Now
          </CrimsonButton>
        </div>
      </div>
    </section>
  );
};
