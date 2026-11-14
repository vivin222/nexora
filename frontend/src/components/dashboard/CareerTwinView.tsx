import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Compass,
  RotateCcw
} from 'lucide-react';
import { LearnerProfile, CareerRole, SkillAnalysis } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { api } from '../../api/client';
import { DashboardTab } from './DashboardLayout';

interface CareerTwinViewProps {
  profile: LearnerProfile | null;
  onNavigateTab: (tab: DashboardTab) => void;
  onRefreshAll: () => Promise<any>;
}

export const CareerTwinView: React.FC<CareerTwinViewProps> = ({
  profile,
  onNavigateTab,
  onRefreshAll
}) => {
  const [careers, setCareers] = useState<CareerRole[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<string>(profile?.target_career_id || 'career-fullstack');
  const [analysis, setAnalysis] = useState<SkillAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    const loadCareerData = async () => {
      try {
        const careerList = await api.getCareers();
        setCareers(careerList);
        const targetId = profile?.target_career_id || (careerList[0]?.id || 'career-fullstack');
        setSelectedCareerId(targetId);
        
        const res = await api.getSkillAnalysis(targetId);
        setAnalysis(res.analysis);
      } catch (err) {
        console.error('Error loading Career Twin data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCareerData();
  }, [profile?.target_career_id]);

  const handleSimulateCareer = async (careerId: string) => {
    setSelectedCareerId(careerId);
    setSimulating(true);
    try {
      const res = await api.getSkillAnalysis(careerId);
      setAnalysis(res.analysis);
    } catch (err) {
      console.error('Failed to simulate career path:', err);
    } finally {
      setSimulating(false);
    }
  };

  const currentRole = careers.find(c => c.id === selectedCareerId) || careers[0];

  // SVG Radar Polygon Calculation
  const radarPoints = (analysis?.detailed_gaps || []).slice(0, 6);
  const numPoints = Math.max(radarPoints.length, 3);
  const centerX = 160;
  const centerY = 160;
  const radius = 110;

  const getCoordinates = (index: number, total: number, valuePercent: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = (valuePercent / 100) * radius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y };
  };

  const studentPolygon = radarPoints.map((pt, i) => {
    const coords = getCoordinates(i, numPoints, Math.min(Math.max(pt.current_level, 10), 100));
    return `${coords.x},${coords.y}`;
  }).join(' ');

  const targetPolygon = radarPoints.map((pt, i) => {
    const coords = getCoordinates(i, numPoints, pt.required_level);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="cyan" size="sm">NEURAL SIGNATURE ENGINE</Badge>
            <span className="text-zinc-500 text-xs font-mono">REAL-TIME TWIN RE-VECTORING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-[#35D9F2]" />
            AI Career Twin & Capability Matrix
          </h1>
          <p className="text-xs text-[#929CA3] mt-1">
            A real-time dual-vector model synthesizing your verified competencies against industry role benchmarks.
          </p>
        </div>

        {/* Career Path Simulator Selector */}
        <div className="flex items-center gap-2 bg-[#0B0F12] border border-white/10 rounded-2xl p-1.5 shadow-inner">
          <Compass className="w-4 h-4 text-[#C5F45B] ml-2" />
          <span className="text-[11px] font-mono text-zinc-400 uppercase">Simulate Role:</span>
          <select
            value={selectedCareerId}
            onChange={e => handleSimulateCareer(e.target.value)}
            disabled={simulating}
            className="bg-[#11171B] border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#35D9F2] font-medium"
          >
            {careers.map(c => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Twin Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Dual-Vector Visualization (5 cols) */}
        <div className="lg:col-span-5 bg-[#0B0F12] border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#35D9F2]/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Vector Geometry (Radar)
              </span>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1.5 text-[#35D9F2]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#35D9F2]" />
                  Verified Self
                </span>
                <span className="flex items-center gap-1.5 text-[#C5F45B]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C5F45B]" />
                  Role Target
                </span>
              </div>
            </div>

            {/* SVG Radar */}
            <div className="relative flex items-center justify-center py-4">
              <svg width="320" height="320" className="overflow-visible">
                {/* Background Concentric Webs */}
                {[0.25, 0.5, 0.75, 1.0].map((level, i) => (
                  <circle
                    key={i}
                    cx={centerX}
                    cy={centerY}
                    r={radius * level}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray={level === 1 ? 'none' : '3 3'}
                  />
                ))}

                {/* Axes */}
                {radarPoints.map((_, i) => {
                  const endCoords = getCoordinates(i, numPoints, 100);
                  return (
                    <line
                      key={i}
                      x1={centerX}
                      y1={centerY}
                      x2={endCoords.x}
                      y2={endCoords.y}
                      stroke="rgba(255,255,255,0.08)"
                    />
                  );
                })}

                {/* Target Career Polygon */}
                {targetPolygon && (
                  <polygon
                    points={targetPolygon}
                    fill="rgba(197, 244, 91, 0.12)"
                    stroke="#C5F45B"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Student Current Polygon */}
                {studentPolygon && (
                  <polygon
                    points={studentPolygon}
                    fill="rgba(53, 217, 242, 0.25)"
                    stroke="#35D9F2"
                    strokeWidth="2"
                    className="transition-all duration-700 ease-out"
                  />
                )}

                {/* Radar Node Labels */}
                {radarPoints.map((pt, i) => {
                  const labelCoords = getCoordinates(i, numPoints, 122);
                  return (
                    <text
                      key={i}
                      x={labelCoords.x}
                      y={labelCoords.y}
                      fill="#929CA3"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {pt.skill_name.slice(0, 10)}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Quick Fit Summary */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Overall Alignment</span>
              <span className="text-xl font-bold font-mono text-[#35D9F2]">
                {analysis?.overall_score || 0}% Fit
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Benchmark Role</span>
              <span className="text-xs font-semibold text-white">{currentRole?.title}</span>
            </div>
          </div>
        </div>

        {/* Competency Gap Differential & Simulation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Role Snapshot & Salary Card */}
          <div className="bg-[#0B0F12] border border-white/5 rounded-3xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">{currentRole?.title}</h2>
                <p className="text-xs text-zinc-400 mt-0.5">{currentRole?.description}</p>
              </div>
              <div className="text-right font-mono shrink-0">
                <span className="text-sm font-bold text-[#C5F45B] block">{currentRole?.average_salary}</span>
                <span className="text-[10px] text-zinc-500">{currentRole?.growth_outlook}</span>
              </div>
            </div>

            {/* AI Diagnosis Summary */}
            <div className="p-3.5 rounded-2xl bg-[#11171B] border border-white/5 text-xs text-zinc-300 leading-relaxed font-sans">
              <span className="font-mono text-[#35D9F2] font-semibold text-[11px] block mb-1">
                AI TWIN DIAGNOSTIC:
              </span>
              {analysis?.summary || 'Synthesizing your verified competency graph against market demand...'}
            </div>
          </div>

          {/* Detailed Competency Differential Bars */}
          <div className="bg-[#0B0F12] border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                Competency Differential Breakdown
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">
                {analysis?.detailed_gaps?.length || 0} Assessed Dimensions
              </span>
            </div>

            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {(analysis?.detailed_gaps || []).map((gap, idx) => {
                const isStrong = gap.status === 'strong';
                const isWeak = gap.status === 'weak';

                return (
                  <div key={idx} className="p-3 rounded-2xl bg-[#080C0E] border border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        {isStrong ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#C5F45B]" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span className="font-semibold text-white">{gap.skill_name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-zinc-400">Current: <b className="text-[#35D9F2]">{gap.current_level}%</b></span>
                        <span className="text-zinc-600">/</span>
                        <span className="text-zinc-400">Target: <b className="text-[#C5F45B]">{gap.required_level}%</b></span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                          gap.gap <= 0 ? 'bg-[#C5F45B]/10 text-[#C5F45B]' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {gap.gap <= 0 ? 'Surplus' : `-${gap.gap}%`}
                        </span>
                      </div>
                    </div>

                    {/* Comparative Dual Bar */}
                    <div className="relative w-full h-2 rounded-full bg-[#11171B] overflow-hidden">
                      {/* Target Marker */}
                      <div 
                        className="absolute top-0 bottom-0 bg-white/20 z-10"
                        style={{ left: `${gap.required_level}%`, width: '2px' }}
                      />
                      {/* Current Fill */}
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          gap.gap <= 0 ? 'bg-[#C5F45B]' : 'bg-[#35D9F2]'
                        }`}
                        style={{ width: `${Math.min(gap.current_level, 100)}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-normal pl-5">
                      {gap.why_it_matters}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Action Trigger Banner */}
      <div className="bg-gradient-to-r from-[#0B0F12] via-[#0E151A] to-[#0B0F12] border border-[#35D9F2]/20 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1.5">
          <Badge variant="cyan" size="sm">CONTINUOUS TWIN CALIBRATION</Badge>
          <h3 className="text-lg font-bold text-white">Bridge Priority Competency Gaps</h3>
          <p className="text-xs text-zinc-400 max-w-xl">
            Validate newly acquired knowledge through hands-on technical assessments, coding labs, and project implementations to automatically recalibrate your Career Twin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => onNavigateTab('assessments')}
            icon={<CheckCircle2 className="w-4 h-4 text-[#C5F45B]" />}
          >
            Take Skill Evaluation
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => onNavigateTab('roadmap')}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            View Adaptive Roadmap
          </Button>
        </div>
      </div>
    </div>
  );
};
