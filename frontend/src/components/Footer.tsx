import React from 'react';
import { ShieldCheck, Cpu, Terminal, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/8 bg-[#07080b] py-14 px-4 sm:px-6 lg:px-8 text-zinc-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-zinc-950 border border-rose-500/40 flex items-center justify-center font-bold text-rose-500 text-sm shadow-[0_0_10px_rgba(225,29,72,0.25)]">
              N
            </div>
            <span className="text-lg font-bold tracking-tight text-white">NEXORA</span>
          </div>
          <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
            NEXORA is an autonomous career intelligence and personalized learning platform powered by collaborating multi-agent architectures.
            Deterministic gap diagnostics fused with adaptive learning synthesis.
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-rose-500" />
              Multi-Agent DAG Architecture
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Deterministic Precision
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 mb-4 font-mono">
            Platform Capabilities
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li className="hover:text-rose-400 transition-colors cursor-pointer">Competency Gap Diagnostic</li>
            <li className="hover:text-rose-400 transition-colors cursor-pointer">Dynamic Career Roadmap</li>
            <li className="hover:text-rose-400 transition-colors cursor-pointer">Empirical Adaptive Quizzes</li>
            <li className="hover:text-rose-400 transition-colors cursor-pointer">Context-Injected AI Mentor</li>
            <li className="hover:text-rose-400 transition-colors cursor-pointer">Telemetry & Agent Traces</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 mb-4 font-mono">
            Architecture & Specs
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <span>Google Gemini SDK</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-500" />
            </li>
            <li className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <span>FastAPI & SQLite Core</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-500" />
            </li>
            <li className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <span>React 19 & Tailwind Engine</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-500" />
            </li>
            <li className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <span>API Health / Docs</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-500" />
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500">
        <div>© 2026 NEXORA Intelligence Inc. All rights reserved. Your Potential. Reimagined.</div>
        <div className="flex items-center gap-4 mt-3 sm:mt-0 font-mono">
          <span>SECURE_SANDBOX: ACTIVE</span>
          <span>LATENCY: &lt;15ms</span>
        </div>
      </div>
    </footer>
  );
};
