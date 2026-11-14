import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Layers,
  MapPin,
  Building2,
  ExternalLink
} from 'lucide-react';
import { CareerRole, CareerOpportunity } from '../../types';
import { api } from '../../api/client';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface CareerIntelligenceViewProps {
  currentCareerId?: string;
  onRefreshAll: () => void;
}

export const CareerIntelligenceView: React.FC<CareerIntelligenceViewProps> = ({
  currentCareerId,
  onRefreshAll
}) => {
  const [careers, setCareers] = useState<CareerRole[]>([]);
  const [opportunities, setOpportunities] = useState<CareerOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [notification, setNotification] = useState('');

  const fetchCareers = async () => {
    try {
      setLoading(true);
      const [careersData, oppsData] = await Promise.all([
        api.getCareers(),
        api.getOpportunities().catch(() => [])
      ]);
      setCareers(careersData);
      setOpportunities(oppsData);
    } catch (err) {
      console.error('Failed to fetch careers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  const handleSelectCareer = async (careerId: string, careerTitle: string) => {
    try {
      setSwitching(careerId);
      setNotification('');
      await api.selectCareer(careerId);
      setNotification(`Switched target career to ${careerTitle}. Skill gaps, adaptive roadmap, and market opportunities re-synthesized!`);
      const opps = await api.getOpportunities(careerId).catch(() => []);
      setOpportunities(opps);
      onRefreshAll();
    } catch (err: any) {
      setNotification(`Failed to switch: ${err.message}`);
    } finally {
      setSwitching(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 font-mono text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin" />
          <span>Consulting Career Intelligence Agent...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="pb-6 border-b border-white/8">
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="cyan" size="sm">CAREER INTELLIGENCE BENCHMARKING</Badge>
          <span className="text-xs font-mono text-zinc-500">• Real-Time Market Trajectories</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Target Career Pathways & Opportunities
        </h1>
        <p className="text-sm text-[#929CA3] mt-1 max-w-2xl leading-relaxed">
          Changing your target career prompts the Career Intelligence Agent and Central Orchestrator 
          to immediately re-evaluate your competency matrix and re-synthesize your roadmap.
        </p>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-[#11171B] border border-[#35D9F2]/40 text-xs font-mono text-[#35D9F2] flex items-center gap-2 shadow-lg">
          <Sparkles className="w-4 h-4 text-[#35D9F2] shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Career Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {careers.map((career) => {
          const isSelected = (career.id === currentCareerId || career.slug === currentCareerId);

          return (
            <div
              key={career.id}
              className={`p-6 sm:p-7 rounded-2xl border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-[#35D9F2]/60 bg-[#0B0F12] shadow-[0_0_30px_rgba(53,217,242,0.12)]'
                  : 'bg-[#0B0F12] border-white/8 hover:border-white/20'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#35D9F2] uppercase tracking-wider">{career.category}</span>
                      {isSelected && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#35D9F2]/20 text-[#35D9F2] font-mono font-bold border border-[#35D9F2]/40">
                          ACTIVE TARGET
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mt-1">{career.title}</h3>
                  </div>

                  <span className="text-xs font-mono text-zinc-400 bg-[#11171B] px-2.5 py-1 rounded-lg border border-white/5">
                    {career.difficulty_level}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {career.description}
                </p>

                {/* Salary & Growth Badges */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-[#11171B] border border-white/5">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase">Average Compensation</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">{career.average_salary}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#11171B] border border-white/5">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase">Industry Outlook</div>
                    <div className="text-sm font-bold text-[#C5F45B] font-mono mt-0.5">{career.growth_outlook}</div>
                  </div>
                </div>

                {/* Required Skills Pill List */}
                {career.requirements && career.requirements.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[11px] font-mono text-zinc-400 uppercase mb-2">Required Competencies:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {career.requirements.map(req => (
                        <span
                          key={req.id}
                          className="text-[11px] px-2 py-1 rounded bg-[#11171B] text-zinc-300 border border-white/5 font-mono"
                        >
                          {req.skill_name} <span className="text-[#35D9F2]">({req.required_level}%)</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-mono">
                  {isSelected ? 'Active Calibration Goal' : 'Click to Recalibrate'}
                </span>

                <Button
                  onClick={() => handleSelectCareer(career.id, career.title)}
                  disabled={isSelected || switching === career.id}
                  variant={isSelected ? 'outline' : 'primary'}
                  size="sm"
                  icon={isSelected ? <CheckCircle2 className="w-4 h-4 text-[#C5F45B]" /> : <ArrowRight className="w-4 h-4" />}
                >
                  {isSelected ? 'Selected' : (switching === career.id ? 'Recalibrating...' : 'Select Career')}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Matched Industry Opportunities */}
      {opportunities.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-white/8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="lime" size="sm">LIVE MARKET OPPORTUNITIES</Badge>
              </div>
              <h2 className="text-xl font-bold text-white">Matched Hiring Roles & Benchmark Openings</h2>
            </div>
            <span className="text-xs font-mono text-zinc-500">{opportunities.length} Verified Openings</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunities.map(opp => (
              <div
                key={opp.id}
                className="p-5 rounded-2xl bg-[#0B0F12] border border-white/8 hover:border-[#35D9F2]/30 transition-all flex flex-col justify-between space-y-4 shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#35D9F2]" />
                      {opp.company_name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C5F45B]/15 text-[#C5F45B] border border-[#C5F45B]/30 font-semibold">
                      {opp.match_score || 85}% Match
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{opp.role_title}</h3>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      {opp.location}
                    </span>
                    <span>•</span>
                    <span className="text-zinc-300 font-mono font-semibold">{opp.salary_range}</span>
                  </div>

                  <p className="text-xs text-[#929CA3] leading-relaxed line-clamp-2">
                    {opp.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex flex-wrap gap-1.5">
                  {opp.required_skills?.map((sk, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#11171B] text-zinc-300 border border-white/5">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};