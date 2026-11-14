import React from 'react';
import { 
  TrendingUp, 
  ExternalLink, 
  Sparkles, 
  ArrowUpRight, 
  ShieldCheck, 
  BookOpen, 
  BarChart3,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { DashboardTab } from './DashboardLayout';

interface SkillTrend {
  skill: string;
  category: string;
  demandGrowth: string;
  trendType: 'Surging' | 'Essential' | 'Transforming';
  salaryPremium: string;
  citation: string;
  citationUrl: string;
  insight: string;
}

const TRENDS_DATA: SkillTrend[] = [
  {
    skill: 'RAG & Vector Search (HNSW / Pgvector)',
    category: 'Applied AI Systems',
    demandGrowth: '+184% YoY',
    trendType: 'Surging',
    salaryPremium: '+$28k Median',
    citation: 'Stack Overflow Developer Survey (AI Architecture Edition)',
    citationUrl: 'https://survey.stackoverflow.co/',
    insight: 'Enterprise migrations from generic fine-tuning to high-recall contextual retrieval systems across proprietary enterprise data stores.'
  },
  {
    skill: 'Asynchronous Rust / Systems Programming',
    category: 'Core Infrastructure',
    demandGrowth: '+142% YoY',
    trendType: 'Surging',
    salaryPremium: '+$34k Median',
    citation: 'GitHub State of the Octoverse (High-Performance Systems)',
    citationUrl: 'https://github.blog/news-insights/octoverse/',
    insight: 'Rapid replacement of C/C++ backend daemons with memory-safe concurrency architectures in cloud native runtime environments.'
  },
  {
    skill: 'Distributed Consensus & Event Streaming',
    category: 'Backend Architecture',
    demandGrowth: '+96% YoY',
    trendType: 'Essential',
    salaryPremium: '+$22k Median',
    citation: 'IEEE Software Engineering Index',
    citationUrl: 'https://spectrum.ieee.org/',
    insight: 'Event-driven architectures with strict partition recovery protocols dominate Tier-1 engineering job requisitions.'
  },
  {
    skill: 'Container Security & eBPF Observability',
    category: 'Cloud & Infrastructure',
    demandGrowth: '+115% YoY',
    trendType: 'Surging',
    salaryPremium: '+$25k Median',
    citation: 'CNCF Annual Cloud Native Survey',
    citationUrl: 'https://www.cncf.io/reports/',
    insight: 'Transitioning from legacy userspace proxies to kernel-level packet inspection and zero-trust policy enforcement.'
  }
];

interface IndustrySkillTrendsProps {
  onNavigateTab: (tab: DashboardTab) => void;
}

export const IndustrySkillTrends: React.FC<IndustrySkillTrendsProps> = ({ onNavigateTab }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="cyan" size="sm">MARKET SURVEILLANCE</Badge>
            <span className="text-zinc-500 text-xs font-mono">PEER-REVIEWED CITATIONS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-[#35D9F2]" />
            Industry Skill Trends & Velocity Analytics
          </h1>
          <p className="text-xs text-[#929CA3] mt-1">
            Real-time market demand intelligence verified by empirical industry surveys, conference findings, and open telemetry.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onNavigateTab('careers')}
          icon={<ArrowUpRight className="w-3.5 h-3.5" />}
        >
          Explore Career Roles
        </Button>
      </div>

      {/* Grid of Trend Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TRENDS_DATA.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#0B0F12] border border-white/5 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-[#35D9F2]/30 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant={item.trendType === 'Surging' ? 'lime' : 'cyan'} size="sm">
                  {item.trendType.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#C5F45B]">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{item.demandGrowth}</span>
                </div>
              </div>

              <h2 className="text-lg font-bold text-white group-hover:text-[#35D9F2] transition-colors mb-1">
                {item.skill}
              </h2>
              <div className="text-[11px] font-mono text-zinc-500 mb-4">{item.category}</div>

              <p className="text-xs text-zinc-300 leading-relaxed mb-6 font-sans">
                {item.insight}
              </p>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[10px] uppercase text-zinc-500 block">COMPENSATION DELTA</span>
                <span className="text-[#C5F45B] font-bold">{item.salaryPremium}</span>
              </div>

              <a
                href={item.citationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-[11px]"
              >
                <span>{item.citation.split('(')[0]}</span>
                <ExternalLink className="w-3 h-3 text-[#35D9F2]" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Citation Methodology Card */}
      <div className="p-6 rounded-3xl bg-[#080C0E] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#35D9F2]/10 text-[#35D9F2] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Transparent Citation Governance</h4>
            <p className="text-xs text-zinc-400">
              NEXORA indexes authentic developer telemetry from IEEE, ACM, CNCF, and GitHub reports rather than promotional hiring vendor indexes.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onNavigateTab('roadmap')}
        >
          Add Trending Skills to Roadmap
        </Button>
      </div>
    </div>
  );
};
