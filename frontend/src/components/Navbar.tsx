import React from 'react';
import { Sparkles, ArrowRight, LayoutDashboard, Cpu, ShieldCheck } from 'lucide-react';
import { CrimsonButton } from './common/CrimsonButton';

interface NavbarProps {
  currentView: 'landing' | 'dashboard';
  onNavigate: (view: 'landing' | 'dashboard') => void;
  onOpenSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenSection }) => {
  const handleScrollTo = (id: string) => {
    if (currentView !== 'landing') {
      onNavigate('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/8 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Identity */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-950 border border-rose-500/40 group-hover:border-rose-400 transition-all duration-300 shadow-[0_0_15px_rgba(225,29,72,0.3)]">
            <span className="text-rose-500 font-extrabold text-lg tracking-wider">N</span>
            <div className="absolute inset-0 rounded-lg bg-rose-600/10 blur-sm group-hover:bg-rose-600/20 transition-all" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-rose-100 transition-colors">
                NEXORA
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950/70 text-rose-400 border border-rose-800/60 font-mono">
                v1.0
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 tracking-wider uppercase font-medium">
              Your Potential. Reimagined.
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        {currentView === 'landing' ? (
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-300">
            <button 
              onClick={() => handleScrollTo('platform-showcase')}
              className="hover:text-rose-400 transition-colors cursor-pointer"
            >
              Platform
            </button>
            <button 
              onClick={() => handleScrollTo('agent-ecosystem')}
              className="hover:text-rose-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-rose-500" />
              Agent Ecosystem
            </button>
            <button 
              onClick={() => handleScrollTo('how-it-works')}
              className="hover:text-rose-400 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button 
              onClick={() => handleScrollTo('comparison')}
              className="hover:text-rose-400 transition-colors cursor-pointer"
            >
              Intelligence Architecture
            </button>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-3 text-xs text-zinc-400 font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Orchestrator: ACTIVE</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>Gemini & Engine: SYNCED</span>
            </div>
          </div>
        )}

        {/* Header Action Button */}
        <div className="flex items-center gap-3">
          {currentView === 'landing' ? (
            <CrimsonButton
              onClick={() => onNavigate('dashboard')}
              variant="primary"
              size="md"
              icon={<LayoutDashboard className="w-4 h-4" />}
            >
              Launch Platform
              <ArrowRight className="w-4 h-4 ml-1" />
            </CrimsonButton>
          ) : (
            <CrimsonButton
              onClick={() => onNavigate('landing')}
              variant="secondary"
              size="sm"
            >
              Back to Overview
            </CrimsonButton>
          )}
        </div>
      </div>
    </header>
  );
};
