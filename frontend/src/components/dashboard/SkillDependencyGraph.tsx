import React, { useState } from 'react';
import { 
  GitFork, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Layers, 
  ArrowRight,
  Info,
  Zap,
  Cpu
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { DashboardTab } from './DashboardLayout';

interface DependencyNode {
  id: string;
  name: string;
  category: 'Foundation' | 'Core Systems' | 'Modern Frameworks' | 'Cloud & Distributed';
  proficiency: number;
  status: 'mastered' | 'active' | 'locked';
  prerequisites: string[];
  unlocks: string[];
  description: string;
}

const DEFAULT_GRAPH: DependencyNode[] = [
  {
    id: 'prog-basics',
    name: 'Data Structures & Algorithms',
    category: 'Foundation',
    proficiency: 88,
    status: 'mastered',
    prerequisites: [],
    unlocks: ['backend-core', 'db-design'],
    description: 'Algorithmic time complexity, graph traversal, and dynamic programming foundations.'
  },
  {
    id: 'db-design',
    name: 'Relational Database Architecture',
    category: 'Core Systems',
    proficiency: 78,
    status: 'mastered',
    prerequisites: ['prog-basics'],
    unlocks: ['distributed-storage', 'backend-core'],
    description: 'ACID transactions, B-Tree index optimization, and relational schema normalization.'
  },
  {
    id: 'backend-core',
    name: 'Asynchronous API Engineering',
    category: 'Core Systems',
    proficiency: 65,
    status: 'active',
    prerequisites: ['prog-basics', 'db-design'],
    unlocks: ['microservices', 'cloud-infra'],
    description: 'Event loops, non-blocking I/O, RESTful constraints, and JWT security tokens.'
  },
  {
    id: 'cloud-infra',
    name: 'Containerization & Docker Orchestration',
    category: 'Modern Frameworks',
    proficiency: 45,
    status: 'active',
    prerequisites: ['backend-core'],
    unlocks: ['k8s-infra', 'ci-cd'],
    description: 'Multi-stage Docker builds, volume lifecycle, and overlay networking.'
  },
  {
    id: 'distributed-storage',
    name: 'Distributed Systems & Consensus',
    category: 'Cloud & Distributed',
    proficiency: 20,
    status: 'locked',
    prerequisites: ['db-design', 'backend-core'],
    unlocks: ['streaming-kafka'],
    description: 'CAP theorem, Raft consensus algorithm, and read-replica replication lag.'
  },
  {
    id: 'k8s-infra',
    name: 'Kubernetes Cluster Orchestration',
    category: 'Cloud & Distributed',
    proficiency: 10,
    status: 'locked',
    prerequisites: ['cloud-infra'],
    unlocks: [],
    description: 'Custom Resource Definitions (CRDs), ingress controllers, and zero-downtime rolling updates.'
  }
];

interface SkillDependencyGraphProps {
  onNavigateTab: (tab: DashboardTab) => void;
}

export const SkillDependencyGraph: React.FC<SkillDependencyGraphProps> = ({ onNavigateTab }) => {
  const [selectedNode, setSelectedNode] = useState<DependencyNode>(DEFAULT_GRAPH[2]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="cyan" size="sm">NEURAL TOPOLOGY</Badge>
            <span className="text-zinc-500 text-xs font-mono">DIRECTED ACYCLIC GRAPH (DAG)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <GitFork className="w-6 h-6 text-[#35D9F2]" />
            Skill Dependency & Prerequisite Graph
          </h1>
          <p className="text-xs text-[#929CA3] mt-1">
            Navigate the structural learning tree where foundational competencies systematically unlock advanced engineering capabilities.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onNavigateTab('roadmap')}
          icon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Adaptive Roadmap View
        </Button>
      </div>

      {/* Main Grid: Visual Graph + Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graph Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-[#0B0F12] border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Interactive Prerequisite Tree
            </span>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-[#C5F45B]">
                <span className="w-2 h-2 rounded-full bg-[#C5F45B]" /> Mastered
              </span>
              <span className="flex items-center gap-1 text-[#35D9F2]">
                <span className="w-2 h-2 rounded-full bg-[#35D9F2]" /> Active
              </span>
              <span className="flex items-center gap-1 text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-zinc-600" /> Locked
              </span>
            </div>
          </div>

          {/* Connected Tree Nodes */}
          <div className="space-y-4">
            {DEFAULT_GRAPH.map((node) => {
              const isSelected = selectedNode.id === node.id;
              const isMastered = node.status === 'mastered';
              const isActive = node.status === 'active';
              const isLocked = node.status === 'locked';

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#121A1F] border-[#35D9F2] shadow-[0_0_20px_rgba(53,217,242,0.15)]'
                      : 'bg-[#080C0E] border-white/5 hover:border-white/10 hover:bg-[#0B0F12]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs font-mono ${
                        isMastered
                          ? 'bg-[#C5F45B]/10 text-[#C5F45B] border border-[#C5F45B]/30'
                          : isActive
                          ? 'bg-[#35D9F2]/10 text-[#35D9F2] border border-[#35D9F2]/30'
                          : 'bg-white/5 text-zinc-500 border border-white/5'
                      }`}>
                        {isMastered ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : isActive ? (
                          <Zap className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{node.name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{node.category}</div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className={`text-xs font-bold ${
                        isMastered ? 'text-[#C5F45B]' : isActive ? 'text-[#35D9F2]' : 'text-zinc-600'
                      }`}>
                        {node.proficiency}%
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-zinc-500">
                        {node.status}
                      </div>
                    </div>
                  </div>

                  {/* Unlock Path Pill Line */}
                  {node.unlocks.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
                      <span>Unlocks:</span>
                      {node.unlocks.map((u, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300">
                          {u}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Node Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-[#0B0F12] border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={selectedNode.status === 'mastered' ? 'lime' : selectedNode.status === 'active' ? 'cyan' : 'neutral'} size="sm">
                {selectedNode.category.toUpperCase()}
              </Badge>
              <span className="text-[10px] font-mono text-zinc-500">NODE ID: {selectedNode.id}</span>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">{selectedNode.name}</h2>
            <p className="text-xs text-[#929CA3] leading-relaxed mb-6">{selectedNode.description}</p>

            {/* Proficiency Gauge */}
            <div className="p-4 rounded-2xl bg-[#080C0E] border border-white/5 mb-6 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">CURRENT PROFICIENCY</span>
                <span className="text-[#35D9F2] font-bold">{selectedNode.proficiency}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#11171B] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#35D9F2] to-[#C5F45B] rounded-full transition-all duration-500"
                  style={{ width: `${selectedNode.proficiency}%` }}
                />
              </div>
            </div>

            {/* Prerequisites & Dependents */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1.5">
                  PREREQUISITE DEPENDENCIES
                </span>
                {selectedNode.prerequisites.length === 0 ? (
                  <span className="text-xs text-zinc-500 italic">None — Root Architectural Foundation</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.prerequisites.map((p, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg bg-[#11171B] border border-white/5 text-xs text-zinc-300 font-mono">
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1.5">
                  DOWNSTREAM COMPETENCIES UNLOCKED
                </span>
                {selectedNode.unlocks.length === 0 ? (
                  <span className="text-xs text-zinc-500 italic">Specialized Terminal Node</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.unlocks.map((u, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg bg-[#11171B] border border-white/5 text-xs text-[#35D9F2] font-mono">
                        → {u}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => onNavigateTab('coding-lab')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Practice in Coding Lab
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
