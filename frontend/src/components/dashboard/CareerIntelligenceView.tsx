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
  Layers
} from 'lucide-react';
import { CareerRole } from '../../types';
import { api } from '../../api/client';
import { Badge } from '../common/Badge';
import { CrimsonButton } from '../common/CrimsonButton';

interface CareerIntelligenceViewProps {
  currentCareerId?: string;
  onRefreshAll: () => void;
}

export const CareerIntelligenceView: React.FC<CareerIntelligenceViewProps> = ({
  currentCareerId,
  onRefreshAll
}) => {
  const [careers, setCareers] = useState<CareerRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [notification, setNotification] = useState('');

  const fetchCareers = async () => {
    try {
      setLoading(true);
      const data = await api.getCareers();
      setCareers(data);
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
      const res = await api.selectCareer(careerId);
      setNotification(`Switched target career to ${careerTitle}. Skill gaps and adaptive roadmap re-synthesized!`);
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
          <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span>Consulting Career Intelligence Agent...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="crimson" size="sm">CAREER INTELLIGENCE BENCHMARKING</Badge>
          <span className="text-xs font-mono text-zinc-500">Live Role Catalog</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Select Your Target Career Path
        </h1>
        <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
          Changing your target career prompts the Career Intelligence Agent and Central Orchestrator 
          to immediately re-evaluate your skill gaps and generate a newly calibrated learning roadmap.
        </p>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-zinc-900 border border-rose-500/40 text-xs font-mono text-rose-300 flex items-center gap-2 crimson-glow-sm">
          <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
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
              className={`glass-panel p-6 sm:p-7 rounded-2xl border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-rose-500/60 bg-gradient-to-br from-zinc-900/90 to-rose-950/20 crimson-glow-sm'
                  : 'border-white/8 hover:border-white/20'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-rose-400 uppercase tracking-wider">{career.category}</span>
                      {isSelected && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/40">
                          CURRENT TARGET
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mt-1">{career.title}</h3>
                  </div>

                  <span className="text-xs font-mono text-zinc-400 bg-zinc-900/80 px-2.5 py-1 rounded border border-white/5">
                    {career.difficulty_level}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {career.description}
                </p>

                {/* Salary & Growth Badges */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-zinc-950/80 border border-white/5">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase">Average Compensation</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">{career.average_salary}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950/80 border border-white/5">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase">Industry Outlook</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{career.growth_outlook}</div>
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
                          className="text-[11px] px-2 py-1 rounded bg-zinc-900/90 text-zinc-300 border border-white/5 font-mono"
                        >
                          {req.skill_name} <span className="text-rose-400">({req.required_level}%)</span>
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

                <CrimsonButton
                  onClick={() => handleSelectCareer(career.id, career.title)}
                  disabled={isSelected || switching === career.id}
                  variant={isSelected ? 'secondary' : 'primary'}
                  size="sm"
                  icon={isSelected ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <ArrowRight className="w-4 h-4" />}
                >
                  {isSelected ? 'Selected' : (switching === career.id ? 'Recalibrating...' : 'Select Career')}
                </CrimsonButton>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
