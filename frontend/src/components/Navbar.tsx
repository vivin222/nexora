import React from 'react';
import { ArrowRight, LayoutDashboard, Cpu, ShieldCheck } from 'lucide-react';
import { Button } from './common/Button';

interface NavbarProps {
  currentView: 'landing' | 'dashboard';
  onNavigate: (view: 'landing' | 'dashboard') => void;
  onOpenSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
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
    <header className="sticky top-0 z-50 w-full surface-glass border-b border-white/8 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Identity */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#050608] border border-[#35D9F2]/40 group-hover:border-[#35D9F2] transition-all duration-300 shadow-[0_0_15px_rgba(53,217,242,0.25)]">
            <span className="text-[#35D9F2] font-black text-sm tracking-wider">N</span>
            <div className="absolute inset-0 rounded-lg bg-[#35D9F2]/10 blur-sm group-hover:bg-[#35D9F2]/20 transition-all" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-[#F5F7F4] group-hover:text-[#35D9F2] transition-colors">
                NEXORA
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#35D9F2]/10 text-[#35D9F2] border border-[#35D9F2]/30 font-mono">
                v2.0
              </span>
            </div>
            <span className="text-[10px] text-[#929CA3] tracking-wider uppercase font-medium">
              Your Potential. Reimagined.
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        {currentView === 'landing' ? (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#929CA3]">
            <button 
              onClick={() => handleScrollTo('product-showcase')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Product
            </button>
            <button 
              onClick={() => handleScrollTo('intelligence-engine')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Platform
            </button>
            <button 
              onClick={() => handleScrollTo('learning-experience')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Learning
            </button>
            <button 
              onClick={() => handleScrollTo('agent-ecosystem')}
              className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-[#35D9F2]" />
              AI Ecosystem
            </button>
            <button 
              onClick={() => handleScrollTo('career-transformation')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Careers
            </button>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-3 text-xs text-[#929CA3] font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11171B] border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#C5F45B] animate-pulse" />
              <span>Orchestrator: 10 AGENTS ACTIVE</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11171B] border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-[#35D9F2]" />
              <span>Gemini 2.5 Engine Synced</span>
            </div>
          </div>
        )}

        {/* Header Action Button */}
        <div className="flex items-center gap-3">
          {currentView === 'landing' ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('dashboard')}
                className="text-xs text-[#929CA3] hover:text-white font-medium transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <Button
                onClick={() => onNavigate('dashboard')}
                variant="primary"
                size="md"
                icon={<LayoutDashboard className="w-4 h-4" />}
              >
                Launch Workspace
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => onNavigate('landing')}
              variant="secondary"
              size="sm"
            >
              Back to Overview
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
