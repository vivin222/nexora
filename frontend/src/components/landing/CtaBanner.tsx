import React from 'react';
import { ArrowRight, Terminal } from 'lucide-react';
import { Button } from '../common/Button';

export const CtaBanner: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <section className="relative py-28 bg-[#050608] overflow-hidden border-t border-white/5">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-[#0B0F12] p-12 sm:p-18 rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(53,217,242,0.06)]">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#11171B] border border-[#35D9F2]/30 text-xs font-mono text-[#35D9F2] mb-8">
          <Terminal className="w-3.5 h-3.5" />
          <span>AUTONOMOUS CALIBRATION ENGINE READY</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-5 leading-tight">
          Your Future Isn't Fixed. It's Engineered.
        </h2>

        <p className="text-base sm:text-lg text-[#929CA3] max-w-2xl mx-auto mb-10 leading-relaxed">
          Ingest your current skills, define your dream engineering career, and let NEXORA synthesize an adaptive, gap-driven roadmap backed by 10 collaborating agents.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={onStart}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto px-8 py-3.5 text-base font-bold"
            icon={<ArrowRight className="w-5 h-5 ml-1" />}
          >
            Launch Platform Now
          </Button>
          <Button
            onClick={onStart}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto px-6 py-3.5 text-base"
          >
            Explore Live Demo
          </Button>
        </div>
      </div>
    </section>
  );
};