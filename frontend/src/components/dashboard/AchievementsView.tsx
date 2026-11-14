import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Lock, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Medal, 
  Calendar,
  Flame,
  Check
} from 'lucide-react';
import { api } from '../../api/client';
import { Achievement, Certificate } from '../../types';
import { Badge } from '../common/Badge';

export const AchievementsView: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [unlockedCount, setUnlockedCount] = useState<number>(0);
  const [totalAvailable, setTotalAvailable] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const data = await api.getAchievements();
      setAchievements(data.achievements || []);
      setCertificates(data.certificates || []);
      setUnlockedCount(data.total_unlocked || 0);
      setTotalAvailable(data.total_available || 0);
    } catch (err) {
      console.error('Failed to load achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 font-mono text-sm">
        <div className="w-5 h-5 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading verified credentials and achievements...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="lime" size="sm">CREDENTIAL VAULT</Badge>
            <span className="text-xs font-mono text-zinc-500">• Verified Mastery Proof</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Achievements & Credentials
          </h1>
          <p className="text-sm text-[#929CA3] mt-1">
            Empirically earned badges and cryptographic proof certificates for milestone mastery, assessment rigor, and consistency.
          </p>
        </div>

        {/* Counter KPI */}
        <div className="flex items-center gap-4 bg-[#0B0F12] border border-white/8 p-4 rounded-xl self-start sm:self-auto">
          <div className="w-10 h-10 rounded-xl bg-[#C5F45B]/10 border border-[#C5F45B]/30 flex items-center justify-center text-[#C5F45B]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-zinc-400">Unlocked Badges</div>
            <div className="text-xl font-bold font-mono text-white">
              {unlockedCount} <span className="text-zinc-500 text-sm">/ {totalAvailable}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Medal className="w-5 h-5 text-[#35D9F2]" />
          <span>Platform Badges</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {achievements.map(ach => {
            const isUnlocked = ach.unlocked === 1;
            return (
              <div
                key={ach.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-[#0B0F12] border-[#35D9F2]/30 shadow-[0_0_25px_rgba(53,217,242,0.08)]'
                    : 'bg-[#0B0F12]/40 border-white/5 opacity-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl">{ach.badge_icon || '🏆'}</div>
                    {isUnlocked ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#C5F45B]/15 text-[#C5F45B] border border-[#C5F45B]/30 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-500 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1">{ach.title}</h3>
                  <p className="text-xs text-[#929CA3] leading-relaxed">{ach.description}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  <span>Category</span>
                  <span className="text-zinc-400 capitalize">{ach.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verified Certificates Section */}
      <div className="space-y-4 pt-4 border-t border-white/8">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#C5F45B]" />
          <span>Cryptographic Completion Certificates</span>
        </h2>

        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map(cert => (
              <div
                key={cert.id}
                className="bg-[#0B0F12] border border-[#C5F45B]/30 rounded-2xl p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#C5F45B] block mb-1">
                        OFFICIAL NEXORA CREDENTIAL
                      </span>
                      <h3 className="text-xl font-bold text-white">{cert.title}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#C5F45B]/10 border border-[#C5F45B]/30 flex items-center justify-center text-[#C5F45B] shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {cert.criteria_description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/8 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="space-y-0.5">
                    <span className="text-zinc-500 block text-[10px]">ISSUED ON</span>
                    <span className="text-white">{cert.issue_date}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-zinc-500 block text-[10px]">VERIFICATION CODE</span>
                    <span className="text-[#35D9F2] font-semibold">{cert.certificate_code}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#0B0F12] border border-white/8 rounded-2xl p-10 text-center text-zinc-500">
            <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Complete your roadmap milestones and assessments to earn verified completion certificates.</p>
          </div>
        )}
      </div>
    </div>
  );
};