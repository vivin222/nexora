import React, { useState } from 'react';
import { 
  Terminal, 
  Brain, 
  Target, 
  Compass, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const PlatformShowcase: React.FC<{ onLaunch: () => void }> = ({ onLaunch }) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'agents' | 'mentor'>('roadmap');

  return (
    <section id="platform-showcase" className="relative py-20 bg-[#07080b] border-y border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="crimson" className="mb-3">LIVE ARCHITECTURE DEMO</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            See Autonomous Multi-Agent Intelligence in Action
          </h2>
          <p className="text-zinc-400 mt-3 text-base">
            Inspect the live telemetry, dynamic roadmaps, and contextual intelligence graph generated for an actual learner profile.
          </p>
        </div>

        {/* Central Futuristic Interactive Console Showcase */}
        <div className="glass-panel-elevated rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] crimson-glow-sm">
          {/* Top Window Bar */}
          <div className="px-5 py-3.5 bg-zinc-950/90 border-b border-white/8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-xs font-mono text-zinc-400 ml-3">nexora-intelligence-node://learner/alex-mercer</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>DAG ORCHESTRATION: 6 AGENTS SYNCHRONIZED</span>
            </div>
          </div>

          {/* Top Profile Summary Ribbon */}
          <div className="p-6 bg-zinc-900/60 border-b border-white/8 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div>
              <div className="text-xs uppercase font-mono text-zinc-400">Learner Target</div>
              <div className="text-lg font-bold text-white mt-0.5">Full Stack Developer</div>
              <div className="text-xs text-rose-400 font-mono mt-0.5">+22% Demand • $145K avg</div>
            </div>

            <div>
              <div className="text-xs uppercase font-mono text-zinc-400">Readiness Score</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-rose-400 font-mono">51.9%</span>
                <span className="text-xs text-zinc-400 font-mono">Developing</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '51.9%' }} />
              </div>
            </div>

            <div>
              <div className="text-xs uppercase font-mono text-zinc-400">Identified Gaps</div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <span className="text-[11px] px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 font-mono">
                  JavaScript (Missing)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 font-mono">
                  React (Missing)
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase font-mono text-zinc-400">Verified Strengths</div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono">
                  Python (75%)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono">
                  SQL (70%)
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Showcase Tabs */}
          <div className="border-b border-white/8 px-6 bg-zinc-950/50 flex gap-4 text-xs font-mono">
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`py-3.5 border-b-2 font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'roadmap' ? 'border-rose-500 text-rose-400' : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Compass className="w-4 h-4" />
              1. Adaptive Roadmap Sequence
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`py-3.5 border-b-2 font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'agents' ? 'border-rose-500 text-rose-400' : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              2. Agent Communication Trace
            </button>
            <button
              onClick={() => setActiveTab('mentor')}
              className={`py-3.5 border-b-2 font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'mentor' ? 'border-rose-500 text-rose-400' : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              3. Context-Injected AI Mentor
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 bg-zinc-950/70 min-h-[300px]">
            {activeTab === 'roadmap' && (
              <div className="space-y-3.5">
                <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-mono flex items-center justify-center font-bold">1</span>
                      <h4 className="text-sm font-semibold text-white">Foundations & Core Syntax: JavaScript</h4>
                      <Badge variant="crimson" size="sm">Topological Priority #1</Badge>
                    </div>
                    <p className="text-xs text-zinc-400 pl-7">
                      Objective: Master fundamental event loop, closures, and async Promise chaining to bridge critical 85% requirement.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-zinc-400 shrink-0">12 hrs • Pending</span>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-mono flex items-center justify-center font-bold">2</span>
                      <h4 className="text-sm font-semibold text-white">Foundations & Core Syntax: React</h4>
                      <Badge variant="crimson" size="sm">Topological Priority #2</Badge>
                    </div>
                    <p className="text-xs text-zinc-400 pl-7">
                      Objective: Declarative component trees, useState lifecycle, and unidirectional data flow.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-zinc-400 shrink-0">12 hrs • Pending</span>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center justify-center font-bold">3</span>
                      <h4 className="text-sm font-semibold text-zinc-300">Advanced Architecture & Optimization: HTML5 & Modern CSS</h4>
                      <Badge variant="neutral" size="sm">Proficiency Deficit</Badge>
                    </div>
                    <p className="text-xs text-zinc-400 pl-7">
                      Objective: Elevate baseline markup to responsive semantic standards and CSS Grid architecture.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-zinc-400 shrink-0">8 hrs • Pending</span>
                </div>
              </div>
            )}

            {activeTab === 'agents' && (
              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-3 rounded-lg bg-zinc-900/70 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">[ProfileAgent]</span>
                    <span className="text-zinc-300">Ingested skills: Python: 75%, SQL: 70%, HTML: 40%</span>
                  </div>
                  <span className="text-zinc-500">48ms • SUCCESS</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900/70 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-rose-400 font-bold">[SkillAnalysisAgent]</span>
                    <span className="text-zinc-300">Deterministic gap analysis against Full Stack Developer requirements. Match: 51.9%</span>
                  </div>
                  <span className="text-zinc-500">22ms • SUCCESS</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900/70 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-bold">[RoadmapAgent]</span>
                    <span className="text-zinc-300">Sorted topological gap priorities. Flagged JavaScript and React as blocking milestones.</span>
                  </div>
                  <span className="text-zinc-500">35ms • SUCCESS</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900/70 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400 font-bold">[ResourceAgent]</span>
                    <span className="text-zinc-300">Paired JavaScript.info & MDN Interactive Labs with Milestone #1.</span>
                  </div>
                  <span className="text-zinc-500">18ms • SUCCESS</span>
                </div>
              </div>
            )}

            {activeTab === 'mentor' && (
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-rose-500/20 text-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-rose-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>NEXORA AI MENTOR (INJECTED CONTEXT: Full Stack Developer • 51.9% Match)</span>
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  "Hello Alex. Your solid foundations in <strong>Python (75%)</strong> and <strong>SQL (70%)</strong> give you a strong backend advantage. 
                  However, for the Full Stack Developer track, <strong>JavaScript</strong> and <strong>React</strong> are currently blocking 48 points of your composite score. 
                  I have prioritized Milestone #1 to focus strictly on event loop internals and closures before jumping into component state."
                </p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 font-mono">
                  <span>Engine: Google Gemini 2.5 Flash / Deterministic Fallback</span>
                  <span>Confidence: 0.98</span>
                </div>
              </div>
            )}
          </div>

          {/* Console Action Bar */}
          <div className="px-6 py-4 bg-zinc-900/80 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-zinc-400 font-mono">
              Ready to explore with your custom skills and career target?
            </span>
            <button
              onClick={onLaunch}
              className="text-xs px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(225,29,72,0.4)]"
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
