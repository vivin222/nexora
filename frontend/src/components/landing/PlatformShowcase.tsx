import React, { useState } from 'react';
import { 
  Compass, 
  Activity, 
  Sparkles, 
  Code, 
  Target, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const PlatformShowcase: React.FC<{ onLaunch: () => void }> = ({ onLaunch }) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'agents' | 'mentor' | 'coding'>('roadmap');

  return (
    <section id="product-showcase" className="relative py-24 bg-[#0B0F12] border-y border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="cyan" className="mb-3">ENTERPRISE SAAS CONSOLE</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F7F4] tracking-tight">
            See Autonomous Multi-Agent Intelligence in Action
          </h2>
          <p className="text-[#929CA3] mt-3 text-base">
            Inspect the live telemetry, dynamic roadmaps, coding evaluations, and contextual intelligence generated for an actual learner profile.
          </p>
        </div>

        {/* Central Console Showcase */}
        <div className="surface-card-elevated rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.85)] cyan-glow-sm">
          {/* Top Window Bar */}
          <div className="px-5 py-3.5 bg-[#050608] border-b border-white/8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-zinc-700 inline-block" />
              <span className="w-3 h-3 rounded-full bg-zinc-700 inline-block" />
              <span className="w-3 h-3 rounded-full bg-zinc-700 inline-block" />
              <span className="text-xs font-mono text-[#929CA3] ml-3">nexora://learner/alex-mercer/workspace</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#35D9F2]">
              <span className="w-2 h-2 rounded-full bg-[#35D9F2] animate-pulse" />
              <span>DAG ORCHESTRATOR: 10 AGENTS SYNCHRONIZED</span>
            </div>
          </div>

          {/* Top Profile Summary Ribbon */}
          <div className="p-6 bg-[#0B0F12] border-b border-white/8 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div>
              <div className="text-xs uppercase font-mono text-[#929CA3]">Target Career</div>
              <div className="text-lg font-bold text-[#F5F7F4] mt-0.5">Full Stack Developer</div>
              <div className="text-xs text-[#35D9F2] font-mono mt-0.5">+22% Demand • $145K avg</div>
            </div>

            <div>
              <div className="text-xs uppercase font-mono text-[#929CA3]">Readiness Score</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-[#35D9F2] font-mono">51.9%</span>
                <span className="text-xs text-[#C5F45B] font-mono">Developing</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-[#35D9F2] h-full rounded-full" style={{ width: '51.9%' }} />
              </div>
            </div>

            <div>
              <div className="text-xs uppercase font-mono text-[#929CA3]">Prioritized Gaps</div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#11171B] text-[#35D9F2] border border-[#35D9F2]/30 font-mono">
                  JavaScript (Missing)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#11171B] text-[#35D9F2] border border-[#35D9F2]/30 font-mono">
                  React (Missing)
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase font-mono text-[#929CA3]">Verified Strengths</div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#C5F45B]/10 text-[#C5F45B] border border-[#C5F45B]/30 font-mono">
                  Python (75%)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#C5F45B]/10 text-[#C5F45B] border border-[#C5F45B]/30 font-mono">
                  SQL (70%)
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Showcase Tabs */}
          <div className="border-b border-white/8 px-6 bg-[#050608] flex gap-4 text-xs font-mono overflow-x-auto">
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`py-3.5 border-b-2 font-medium transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'roadmap' ? 'border-[#35D9F2] text-[#35D9F2]' : 'border-transparent text-[#929CA3] hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              1. Adaptive Roadmap
            </button>
            <button
              onClick={() => setActiveTab('coding')}
              className={`py-3.5 border-b-2 font-medium transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'coding' ? 'border-[#35D9F2] text-[#35D9F2]' : 'border-transparent text-[#929CA3] hover:text-white'
              }`}
            >
              <Code className="w-4 h-4" />
              2. Coding Practice Lab
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`py-3.5 border-b-2 font-medium transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'agents' ? 'border-[#35D9F2] text-[#35D9F2]' : 'border-transparent text-[#929CA3] hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              3. Agent DAG Trace
            </button>
            <button
              onClick={() => setActiveTab('mentor')}
              className={`py-3.5 border-b-2 font-medium transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'mentor' ? 'border-[#35D9F2] text-[#35D9F2]' : 'border-transparent text-[#929CA3] hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              4. Contextual AI Mentor
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 bg-[#0B0F12] min-h-[300px]">
            {activeTab === 'roadmap' && (
              <div className="space-y-3.5">
                <div className="p-4 rounded-xl surface-card flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#35D9F2]/20 text-[#35D9F2] text-xs font-mono flex items-center justify-center font-bold">1</span>
                      <h4 className="text-sm font-semibold text-white">Foundations & Core Syntax: JavaScript</h4>
                      <Badge variant="cyan" size="sm">Priority Milestone #1</Badge>
                    </div>
                    <p className="text-xs text-[#929CA3] pl-7">
                      Objective: Master fundamental event loop, closures, and async Promise chaining to bridge critical 85% requirement.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#929CA3] shrink-0">12 hrs • Pending</span>
                </div>

                <div className="p-4 rounded-xl surface-card flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#35D9F2]/20 text-[#35D9F2] text-xs font-mono flex items-center justify-center font-bold">2</span>
                      <h4 className="text-sm font-semibold text-white">Foundations & Core Syntax: React</h4>
                      <Badge variant="cyan" size="sm">Priority Milestone #2</Badge>
                    </div>
                    <p className="text-xs text-[#929CA3] pl-7">
                      Objective: Declarative component trees, useState lifecycle, and unidirectional data flow.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#929CA3] shrink-0">12 hrs • Pending</span>
                </div>
              </div>
            )}

            {activeTab === 'coding' && (
              <div className="surface-card p-4 rounded-xl font-mono text-xs space-y-3">
                <div className="flex items-center justify-between text-zinc-400 pb-2 border-b border-white/5">
                  <span>problem-01.js (EventEmitter Implementation)</span>
                  <span className="text-[#C5F45B]">3 / 3 TEST CASES PASSED (0.4ms)</span>
                </div>
                <pre className="text-zinc-300 overflow-x-auto leading-relaxed">
{`class EventEmitter {
  constructor() { this.events = {}; }
  on(event, cb) {
    (this.events[event] = this.events[event] || []).push(cb);
    return () => this.off(event, cb);
  }
  emit(event, ...args) {
    return (this.events[event] || []).forEach(cb => cb(...args));
  }
}`}
                </pre>
              </div>
            )}

            {activeTab === 'agents' && (
              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-3 rounded-lg surface-card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[#35D9F2] font-bold">[ProfileAgent]</span>
                    <span className="text-zinc-300">Ingested skills: Python: 75%, SQL: 70%, HTML: 40%</span>
                  </div>
                  <span className="text-[#929CA3]">48ms • SUCCESS</span>
                </div>
                <div className="p-3 rounded-lg surface-card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[#35D9F2] font-bold">[SkillAnalysisAgent]</span>
                    <span className="text-zinc-300">Deterministic gap analysis against Full Stack Developer requirements. Match: 51.9%</span>
                  </div>
                  <span className="text-[#929CA3]">22ms • SUCCESS</span>
                </div>
                <div className="p-3 rounded-lg surface-card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[#C5F45B] font-bold">[RoadmapAgent]</span>
                    <span className="text-zinc-300">Sorted topological gap priorities. Flagged JavaScript and React as blocking milestones.</span>
                  </div>
                  <span className="text-[#929CA3]">35ms • SUCCESS</span>
                </div>
              </div>
            )}

            {activeTab === 'mentor' && (
              <div className="p-4 rounded-xl surface-card text-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#35D9F2]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>NEXORA AI MENTOR (INJECTED CONTEXT: Full Stack Developer • 51.9% Match)</span>
                </div>
                <p className="text-[#F5F7F4] leading-relaxed">
                  "Hello Alex. Your solid foundations in <strong>Python (75%)</strong> and <strong>SQL (70%)</strong> give you a strong backend advantage. 
                  However, for the Full Stack Developer track, <strong>JavaScript</strong> and <strong>React</strong> are currently blocking 48 points of your composite score. 
                  I have prioritized Milestone #1 to focus strictly on event loop internals and closures before jumping into component state."
                </p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-[#929CA3] font-mono">
                  <span>Engine: Google Gemini 2.5 Flash / Local Hybrid</span>
                  <span className="text-[#C5F45B]">Confidence: 0.98</span>
                </div>
              </div>
            )}
          </div>

          {/* Console Action Bar */}
          <div className="px-6 py-4 bg-[#050608] border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-[#929CA3] font-mono">
              Ready to explore with your custom skills and career target?
            </span>
            <button
              onClick={onLaunch}
              className="text-xs px-4 py-2 rounded-lg bg-[#35D9F2] hover:bg-[#2bc4dc] text-[#050608] font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(53,217,242,0.3)]"
            >
              Open Live Learner Workspace
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
