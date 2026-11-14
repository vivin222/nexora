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
  ExternalLink,
  Compass,
  Sliders,
  Check,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { 
  CareerRole, 
  CareerOpportunity, 
  CareerMatchItem, 
  CareerDiscoveryResponse, 
  LearnerProfile 
} from '../../types';
import { api } from '../../api/client';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface CareerIntelligenceViewProps {
  currentCareerId?: string;
  onRefreshAll: () => void;
}

const DOMAIN_INTEREST_OPTIONS = [
  'Cloud Architecture & DevOps',
  'Machine Learning & AI',
  'Full-Stack Web Development',
  'Distributed Systems',
  'Cyber Defense & Security',
  'Data Platform & Pipelines',
  'Frontend Engineering & UI Systems',
  'Backend Microservices & APIs',
  'System Design & Architecture'
];

export const CareerIntelligenceView: React.FC<CareerIntelligenceViewProps> = ({
  currentCareerId,
  onRefreshAll
}) => {
  const [recommendations, setRecommendations] = useState<CareerDiscoveryResponse | null>(null);
  const [careers, setCareers] = useState<CareerRole[]>([]);
  const [opportunities, setOpportunities] = useState<CareerOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [notification, setNotification] = useState('');

  // Recalibration Modal State
  const [showRecalibrateModal, setShowRecalibrateModal] = useState(false);
  const [recalInterests, setRecalInterests] = useState<string[]>([]);
  const [recalWeeklyHours, setRecalWeeklyHours] = useState<number>(10);
  const [recalWorkPref, setRecalWorkPref] = useState<string>('Hybrid');
  const [recalibrating, setRecalibrating] = useState(false);
  const [recalResults, setRecalResults] = useState<CareerDiscoveryResponse | null>(null);

  const fetchAllCareerData = async () => {
    try {
      setLoading(true);
      const [recsData, careersData, oppsData] = await Promise.all([
        api.getCareerRecommendations().catch(() => null),
        api.getCareers().catch(() => []),
        api.getOpportunities().catch(() => [])
      ]);
      setRecommendations(recsData);
      setCareers(careersData);
      setOpportunities(oppsData);
    } catch (err) {
      console.error('Failed to fetch career intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCareerData();
  }, [currentCareerId]);

  const handleSelectCareer = async (careerId: string, careerTitle: string) => {
    try {
      setSwitching(careerId);
      setNotification('');
      await api.selectCareer(careerId);
      setNotification(`Target career successfully shifted to ${careerTitle}. Multi-Agent DAG recalibrated skill gaps, adaptive roadmap, and AI Career Twin.`);
      
      const [opps, updatedRecs] = await Promise.all([
        api.getOpportunities(careerId).catch(() => []),
        api.getCareerRecommendations().catch(() => null)
      ]);
      setOpportunities(opps);
      if (updatedRecs) setRecommendations(updatedRecs);
      onRefreshAll();
    } catch (err: any) {
      setNotification(`Failed to switch target career: ${err.message}`);
    } finally {
      setSwitching(null);
    }
  };

  // Run live recalibration simulation
  const handleRunRecalibration = async () => {
    setRecalibrating(true);
    try {
      const res = await api.discoverCareers({
        interests: recalInterests,
        weekly_hours: recalWeeklyHours,
        work_preference: recalWorkPref,
      });
      setRecalResults(res);
    } catch (err: any) {
      console.error('Recalibration failed:', err);
    } finally {
      setRecalibrating(false);
    }
  };

  const openRecalibrateModal = () => {
    setRecalInterests(['Cloud Architecture & DevOps', 'Machine Learning & AI']);
    setRecalResults(null);
    setShowRecalibrateModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 font-mono text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin" />
          <span>Consulting Career Intelligence Agent & Multi-Agent Matrix...</span>
        </div>
      </div>
    );
  }

  // Find active career match item if present
  const activeMatch = recommendations?.all_matches.find(
    m => m.career_id === currentCareerId || m.slug === currentCareerId || m.is_active_target
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="pb-6 border-b border-white/8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="cyan" size="sm">CAREER INTELLIGENCE BENCHMARKING</Badge>
            <span className="text-xs font-mono text-zinc-500">• Grounded Profile Evidence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Target Career Pathways & AI Matching Engine
          </h1>
          <p className="text-sm text-[#929CA3] mt-1 max-w-2xl leading-relaxed">
            Recommendations generated deterministically from your genuine academic degree, declared skills, and verified projects. No hardcoded or generic assignments.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={openRecalibrateModal}>
          <Compass className="w-4 h-4 mr-1.5 text-[#35D9F2]" /> Recalibrate Career Trajectory
        </Button>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-[#11171B] border border-[#35D9F2]/40 text-xs font-mono text-[#35D9F2] flex items-center gap-2 shadow-lg animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#35D9F2] shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ACTIVE TARGET CAREER HERO BANNER */}
      {activeMatch && (
        <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#0B0F12] to-[#11171B] border border-[#35D9F2]/40 shadow-[0_0_35px_rgba(53,217,242,0.12)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#35D9F2]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#35D9F2]/15 text-[#35D9F2] font-bold border border-[#35D9F2]/30 flex items-center gap-1">
                  <Target className="w-3 h-3" /> ACTIVE TARGET CAREER
                </span>
                <span className="text-xs font-mono text-zinc-400">• {activeMatch.category}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {activeMatch.title}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {activeMatch.match_rationale}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <DollarSign className="w-3.5 h-3.5 text-[#C5F45B]" />
                  <span>{activeMatch.average_salary}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#C5F45B]">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{activeMatch.growth_outlook}</span>
                </div>
                <div className="text-zinc-400">
                  Estimated Runway: <span className="text-white font-bold">{activeMatch.estimated_weeks} Weeks</span>
                </div>
              </div>
            </div>

            <div className="flex flex-row lg:flex-col items-center justify-center p-5 bg-[#050608]/70 border border-white/10 rounded-xl min-w-[170px] text-center gap-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#35D9F2] font-mono">
                {activeMatch.match_score}%
              </div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Readiness Match
              </div>
              <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C5F45B]/10 text-[#C5F45B] border border-[#C5F45B]/30 mt-1">
                {activeMatch.fit_level}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOP 3 PERSONALIZED CANDIDATE COMPARISON */}
      {recommendations && recommendations.top_matches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#35D9F2]" />
                Top 3 Candidate Trajectories (Side-by-Side Comparison)
              </h2>
              <p className="text-xs text-[#929CA3]">
                Calculated from your academic focus, verified skill levels, and stated goals.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {recommendations.top_matches.map((item, idx) => {
              const isSelected = item.career_id === currentCareerId || item.slug === currentCareerId || item.is_active_target;

              return (
                <div
                  key={item.career_id}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all flex flex-col justify-between relative ${
                    isSelected
                      ? 'bg-[#0B0F12] border-[#35D9F2] shadow-[0_0_30px_rgba(53,217,242,0.18)] ring-1 ring-[#35D9F2]'
                      : 'bg-[#0B0F12] border-white/8 hover:border-white/20'
                  }`}
                >
                  <div>
                    {/* Header: Rank + Match Score */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                        #{idx + 1} Best Fit
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-extrabold font-mono text-[#35D9F2]">
                          {item.match_score}%
                        </span>
                        <span className="text-[10px] uppercase font-mono text-zinc-400">Match</span>
                      </div>
                    </div>

                    {/* Role Title & Category */}
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5 leading-snug">
                      {item.title}
                    </h3>

                    <div className="inline-block px-2 py-0.5 rounded bg-[#C5F45B]/10 text-[#C5F45B] border border-[#C5F45B]/30 text-[10px] font-mono my-2">
                      {item.fit_level}
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                      {item.match_rationale}
                    </p>

                    {/* Metrics Comparison */}
                    <div className="p-3 bg-[#11171B] border border-white/5 rounded-xl space-y-2 text-xs font-mono mb-4">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-zinc-400">Overlapping Strengths:</span>
                        <span className="text-[#C5F45B] font-bold">{item.overlapping_skills_count} skills</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-zinc-400">Critical Gaps to Bridge:</span>
                        <span className="text-amber-400 font-bold">{item.critical_gaps_count} deficits</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-zinc-400">Est. Runway to Market:</span>
                        <span className="text-white font-bold">{item.estimated_weeks} Weeks</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-zinc-400">Compensation:</span>
                        <span className="text-zinc-200">{item.average_salary}</span>
                      </div>
                    </div>

                    {/* Skills previews */}
                    {item.overlapping_skills.length > 0 && (
                      <div className="mb-4">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                          Key Overlapping Skills:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.overlapping_skills.slice(0, 3).map((s) => (
                            <span key={s.skill_id} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C5F45B]/10 text-[#C5F45B] border border-[#C5F45B]/20">
                              ✓ {s.skill_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 border-t border-white/5">
                    {isSelected ? (
                      <div className="w-full py-2 px-3 rounded-xl bg-[#35D9F2]/20 border border-[#35D9F2] text-[#35D9F2] text-xs font-mono font-bold flex items-center justify-center gap-1.5 shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Active Target Role
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full text-xs"
                        disabled={switching === item.career_id}
                        onClick={() => handleSelectCareer(item.career_id, item.title)}
                      >
                        {switching === item.career_id ? 'Re-calibrating...' : 'Select as Target Career →'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ALL AVAILABLE INDUSTRY BENCHMARK ROLES */}
      <div className="space-y-4 pt-4">
        <div className="border-b border-white/8 pb-3">
          <h2 className="text-lg font-bold text-white">All Evaluated Industry Pathways</h2>
          <p className="text-xs text-[#929CA3]">
            Review all canonical career tracks. You can switch your active target career anytime without losing progress.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {careers.map((career) => {
            const isSelected = (career.id === currentCareerId || career.slug === currentCareerId);
            const matchItem = recommendations?.all_matches.find(m => m.career_id === career.id);

            return (
              <div
                key={career.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#35D9F2]/60 bg-[#0B0F12] shadow-md'
                    : 'bg-[#0B0F12] border-white/8 hover:border-white/20'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#35D9F2] uppercase tracking-wider">{career.category}</span>
                        {isSelected && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#35D9F2]/20 text-[#35D9F2] font-mono font-bold border border-[#35D9F2]/40">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white mt-0.5">{career.title}</h3>
                    </div>

                    {matchItem && (
                      <span className="text-xs font-mono font-bold text-[#35D9F2] bg-[#11171B] px-2 py-1 rounded-lg border border-white/5">
                        {matchItem.match_score}% Fit
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
                    {career.description}
                  </p>

                  <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-white/5 text-zinc-400">
                    <span>Avg Salary: <strong className="text-white">{career.average_salary}</strong></span>
                    <span className="text-[#C5F45B]">{career.growth_outlook}</span>
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  {isSelected ? (
                    <span className="text-xs font-mono text-[#35D9F2] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active Target Profile
                    </span>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={switching === career.id}
                      onClick={() => handleSelectCareer(career.id, career.title)}
                    >
                      {switching === career.id ? 'Re-calibrating...' : 'Switch to this Career'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LIVE MARKET OPPORTUNITIES (DEMO CATALOG) */}
      <div className="space-y-4 pt-6 border-t border-white/8">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#35D9F2]" />
            Live Market Placements & Internships
          </h2>
          <p className="text-xs text-[#929CA3]">
            Curated opportunities matched against your active target career and verified readiness threshold.
          </p>
        </div>

        {opportunities.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl bg-[#0B0F12] text-zinc-500 text-xs font-mono">
            No active hiring pipelines currently open for this specific role. Check back as partner companies publish requisitions.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((opp) => (
              <div key={opp.id} className="p-4 bg-[#0B0F12] border border-white/8 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-white">{opp.role_title}</h4>
                    <span className="text-xs text-zinc-400 font-mono">{opp.company_name}</span>
                  </div>
                  <Badge variant="cyan" size="sm">{opp.role_type}</Badge>
                </div>
                <p className="text-xs text-zinc-300 line-clamp-2">{opp.description}</p>
                <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-white/5 text-zinc-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {opp.location}</span>
                  <span className="text-[#C5F45B]">{opp.salary_range}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RECALIBRATION MODAL */}
      {showRecalibrateModal && (
        <div className="fixed inset-0 bg-[#050608]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-[#0B0F12] border border-[#35D9F2]/40 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/8">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#35D9F2]" />
                  Recalibrate Career Discovery Trajectory
                </h3>
                <p className="text-xs text-[#929CA3]">
                  Adjust your domain interests and time commitment to preview real-time AI match updates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRecalibrateModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Interest pills */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2 font-mono">
                Explore Alternative Domain Interests
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DOMAIN_INTEREST_OPTIONS.map((domain) => {
                  const isSelected = recalInterests.includes(domain);
                  return (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => {
                        if (isSelected) setRecalInterests(recalInterests.filter(i => i !== domain));
                        else setRecalInterests([...recalInterests, domain]);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#35D9F2]/20 border-[#35D9F2] text-[#35D9F2] font-semibold'
                          : 'bg-[#11171B] border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '} {domain}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hours and format */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                  Weekly Learning Time Commitment
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setRecalWeeklyHours(h)}
                      className={`p-2 rounded-lg border text-center text-xs font-mono cursor-pointer ${
                        recalWeeklyHours === h
                          ? 'bg-[#35D9F2]/20 border-[#35D9F2] text-[#35D9F2] font-bold'
                          : 'bg-[#11171B] border-white/10 text-zinc-400'
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                  Preferred Work Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Remote', 'Hybrid', 'On-Site'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setRecalWorkPref(f)}
                      className={`p-2 rounded-lg border text-center text-xs font-mono cursor-pointer ${
                        recalWorkPref === f
                          ? 'bg-[#35D9F2]/20 border-[#35D9F2] text-[#35D9F2] font-bold'
                          : 'bg-[#11171B] border-white/10 text-zinc-400'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full"
              disabled={recalibrating}
              onClick={handleRunRecalibration}
            >
              {recalibrating ? 'Re-running AI Intelligence Cycle...' : 'Calculate Recalibrated Recommendations →'}
            </Button>

            {/* Recalibration Preview Results */}
            {recalResults && (
              <div className="space-y-3 pt-3 border-t border-white/8">
                <span className="text-xs font-mono text-zinc-300 uppercase block font-semibold">
                  Recalibrated Top 3 Matches:
                </span>
                <div className="space-y-2">
                  {recalResults.top_matches.map((item) => (
                    <div key={item.career_id} className="p-3 bg-[#11171B] border border-white/5 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{item.title}</div>
                        <div className="text-[11px] text-zinc-400 line-clamp-1">{item.match_rationale}</div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className="text-xs font-bold font-mono text-[#35D9F2]">{item.match_score}%</span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            handleSelectCareer(item.career_id, item.title);
                            setShowRecalibrateModal(false);
                          }}
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
