import React, { useState } from 'react';
import { 
  FolderGit2, 
  Sparkles, 
  Target, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  Code2,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { DashboardTab } from './DashboardLayout';

interface RecommendedProject {
  id: string;
  title: string;
  tagline: string;
  targetSkillGap: string;
  difficulty: 'Intermediate' | 'Advanced' | 'Production-Ready';
  estimatedHours: number;
  techStack: string[];
  architectureSpec: string;
  keyDeliverables: string[];
  evaluationCriteria: string;
}

const SAMPLE_PROJECTS: RecommendedProject[] = [
  {
    id: 'proj-distributed-cache',
    title: 'Distributed In-Memory Key-Value Cache with Raft',
    tagline: 'High-throughput cluster with partition tolerance and snapshotting',
    targetSkillGap: 'Distributed Systems & Concurrency',
    difficulty: 'Production-Ready',
    estimatedHours: 24,
    techStack: ['Python / Go', 'gRPC', 'Raft Consensus', 'Docker'],
    architectureSpec: 'Build a leader-follower consensus cluster handling concurrent write leases, heartbeat timeouts, and log compaction.',
    keyDeliverables: [
      'gRPC server handling Get, Put, and Delete RPCs',
      'Leader election protocol adhering to Raft specifications',
      'Snapshotting mechanism for log compaction under memory pressure'
    ],
    evaluationCriteria: 'Passes split-brain network partition simulations and achieves <5ms P99 write latency under 10k QPS.'
  },
  {
    id: 'proj-observability-engine',
    title: 'Real-Time Telemetry & Log Ingestion Pipeline',
    tagline: 'Asynchronous event collector with dynamic alerting thresholds',
    targetSkillGap: 'Streaming Architecture & System Reliability',
    difficulty: 'Advanced',
    estimatedHours: 18,
    techStack: ['FastAPI', 'Redis Streams', 'ClickHouse / SQLite', 'React'],
    architectureSpec: 'Decoupled consumer-producer event bus aggregating metrics across distributed microservices with sliding-window anomaly detection.',
    keyDeliverables: [
      'Non-blocking async ingestion endpoint with backpressure handling',
      'Rolling window percentile calculation (P50, P90, P99)',
      'Sub-second query interface for distributed trace logs'
    ],
    evaluationCriteria: 'Processes 25,000 log lines per second with zero message loss during simulated consumer restarts.'
  },
  {
    id: 'proj-neural-vector-search',
    title: 'Zero-Dependency Approximate Nearest Neighbor Search',
    tagline: 'Hierarchical Navigable Small World (HNSW) index from scratch',
    targetSkillGap: 'Vector Databases & High-Dimensional Geometry',
    difficulty: 'Production-Ready',
    estimatedHours: 28,
    techStack: ['Python / C++', 'NumPy', 'FastAPI', 'Cosine Similarity'],
    architectureSpec: 'Implement a multi-layer graph index for high-dimensional vector embeddings with cosine similarity distance metrics.',
    keyDeliverables: [
      'HNSW graph insertion and heuristic neighbor selection algorithm',
      'Top-K beam search retrieval with recall metrics verification',
      'HTTP API for dynamic vector upsert and query endpoints'
    ],
    evaluationCriteria: 'Achieves >92% recall compared to exhaustive brute-force search with 10x query speedup.'
  }
];

interface ProjectRecommendationEngineProps {
  onNavigateTab: (tab: DashboardTab) => void;
}

export const ProjectRecommendationEngine: React.FC<ProjectRecommendationEngineProps> = ({ onNavigateTab }) => {
  const [selectedProject, setSelectedProject] = useState<RecommendedProject>(SAMPLE_PROJECTS[0]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime" size="sm">PORTFOLIO SYNTHESIZER</Badge>
            <span className="text-zinc-500 text-xs font-mono">GAP-TARGETED CAPSTONE BRIEFS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FolderGit2 className="w-6 h-6 text-[#C5F45B]" />
            AI Project Recommendation Engine
          </h1>
          <p className="text-xs text-[#929CA3] mt-1">
            Engineered architectural briefs designed to replace generic demo repos with proof-of-competency portfolio systems.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onNavigateTab('project-studio')}
          icon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Open Project Studio
        </Button>
      </div>

      {/* Project Selector & Deep Dive Spec Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Project Selector List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2">
            SYNTHESIZED CAPSTONE BRIEFS
          </div>

          {SAMPLE_PROJECTS.map((proj) => {
            const isSelected = selectedProject.id === proj.id;
            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProject(proj)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0E151A] border-[#C5F45B] shadow-[0_0_20px_rgba(197,244,91,0.12)]'
                    : 'bg-[#080C0E] border-white/5 hover:border-white/10 hover:bg-[#0B0F12]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={proj.difficulty === 'Production-Ready' ? 'lime' : 'cyan'} size="sm">
                    {proj.difficulty}
                  </Badge>
                  <span className="text-[10px] font-mono text-zinc-500">~{proj.estimatedHours} hrs</span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">{proj.title}</h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mb-3">{proj.tagline}</p>

                <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[11px] font-mono">
                  <span className="text-[#35D9F2]">Bridges: {proj.targetSkillGap}</span>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#C5F45B]' : 'text-zinc-600'}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Project Full Architecture Specification (7 cols) */}
        <div className="lg:col-span-7 bg-[#0B0F12] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="lime" size="sm">TARGET DEFICIT: {selectedProject.targetSkillGap.toUpperCase()}</Badge>
                <span className="text-xs font-mono text-zinc-500">EST: {selectedProject.estimatedHours} HOURS</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{selectedProject.title}</h2>
              <p className="text-xs text-zinc-400 mt-1">{selectedProject.tagline}</p>
            </div>

            {/* Architecture Specification */}
            <div className="p-4 rounded-2xl bg-[#080C0E] border border-white/5 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#35D9F2] font-semibold block">
                SYSTEM ARCHITECTURE DESIGN
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {selectedProject.architectureSpec}
              </p>
            </div>

            {/* Recommended Tech Stack */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2">
                RECOMMENDED IMPLEMENTATION STACK
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedProject.techStack.map((tech, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-xl bg-[#11171B] border border-white/10 text-xs font-mono text-zinc-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Deliverables Rubric */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2">
                VERIFICATION DELIVERABLES
              </span>
              <div className="space-y-2">
                {selectedProject.keyDeliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C5F45B] mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Acceptance Criteria */}
            <div className="p-3.5 rounded-2xl bg-[#11171B] border border-white/5 text-xs">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                EVALUATION & ACCEPTANCE BENCHMARK
              </span>
              <p className="text-zinc-300">{selectedProject.evaluationCriteria}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-6">
            <span className="text-xs font-mono text-zinc-500">Ready to start building?</span>
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigateTab('project-studio')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Initialize in Project Studio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
