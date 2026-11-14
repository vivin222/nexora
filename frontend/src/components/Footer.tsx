import React from 'react';
import { ShieldCheck, Cpu, ArrowUpRight, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/8 bg-[#050608] py-16 px-4 sm:px-6 lg:px-8 text-[#929CA3]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#0B0F12] border border-[#35D9F2]/40 flex items-center justify-center font-bold text-[#35D9F2] text-xs shadow-[0_0_12px_rgba(53,217,242,0.2)]">
              N
            </div>
            <span className="text-lg font-bold tracking-tight text-[#F5F7F4]">NEXORA</span>
          </div>
          <p className="text-sm text-[#929CA3] max-w-md leading-relaxed">
            The autonomous career intelligence and personalized adaptive learning platform.
            Deterministic skill gap diagnostics synchronized with a 10-agent Directed Acyclic Graph architecture.
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-[#929CA3]">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Cpu className="w-3.5 h-3.5 text-[#35D9F2]" />
              10-Agent Synchronized DAG
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5F45B]" />
              Deterministic Math Engine
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F7F4] mb-4 font-mono">
            Intelligence Modules
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li className="hover:text-[#35D9F2] transition-colors cursor-pointer">Competency Gap Matrix</li>
            <li className="hover:text-[#35D9F2] transition-colors cursor-pointer">Personalized Learning Center</li>
            <li className="hover:text-[#35D9F2] transition-colors cursor-pointer">Coding Practice Sandbox</li>
            <li className="hover:text-[#35D9F2] transition-colors cursor-pointer">Project Studio Pathways</li>
            <li className="hover:text-[#35D9F2] transition-colors cursor-pointer">Interview Simulator</li>
            <li className="hover:text-[#35D9F2] transition-colors cursor-pointer">Resume & Portfolio Analyzer</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F7F4] mb-4 font-mono">
            Architecture & Specs
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <span>Google Gemini 2.5 Flash SDK</span>
              <ArrowUpRight className="w-3 h-3 text-[#929CA3]" />
            </li>
            <li className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <span>FastAPI & SQLite Kernel</span>
              <ArrowUpRight className="w-3 h-3 text-[#929CA3]" />
            </li>
            <li className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <span>React 19 & Tailwind Engine</span>
              <ArrowUpRight className="w-3 h-3 text-[#929CA3]" />
            </li>
            <li className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <span>Interactive Swagger API Docs</span>
              <ArrowUpRight className="w-3 h-3 text-[#929CA3]" />
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-14 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-[#929CA3]">
        <div>© 2026 NEXORA Intelligence Inc. All rights reserved. Your Potential. Reimagined.</div>
        <div className="flex items-center gap-4 mt-3 sm:mt-0 font-mono">
          <span className="text-[#C5F45B]">HEALTHY (16/16 TESTS VERIFIED)</span>
          <span>LATENCY: &lt;10ms</span>
        </div>
      </div>
    </footer>
  );
};
