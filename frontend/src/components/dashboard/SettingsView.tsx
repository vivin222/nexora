import React, { useState, useEffect } from 'react';
import { 
  User, 
  Save, 
  Sparkles, 
  BookOpen, 
  Briefcase, 
  GraduationCap, 
  FolderGit2, 
  CheckCircle2 
} from 'lucide-react';
import { LearnerProfile } from '../../types';
import { api } from '../../api/client';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface SettingsViewProps {
  profile: LearnerProfile | null;
  onRefreshAll: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ profile, onRefreshAll }) => {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [headline, setHeadline] = useState(profile?.headline || '');
  const [education, setEducation] = useState(profile?.education || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [interestsText, setInterestsText] = useState((profile?.interests || []).join(', '));
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setHeadline(profile.headline || '');
      setEducation(profile.education || '');
      setBio(profile.bio || '');
      setInterestsText((profile.interests || []).join(', '));
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatusMsg('');
      const interestsArray = interestsText.split(',').map(s => s.trim()).filter(Boolean);

      await api.updateProfile({
        full_name: fullName,
        headline,
        education,
        bio,
        interests: interestsArray,
      });

      setStatusMsg('Profile successfully saved. Knowledge graph synchronized.');
      onRefreshAll();
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <div className="pb-6 border-b border-white/8">
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="cyan" size="sm">LEARNER IDENTITY</Badge>
          <span className="text-xs font-mono text-zinc-500">• Profile Agent Synchronized</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Learner Profile & Academic Background
        </h1>
        <p className="text-sm text-[#929CA3] mt-1">
          Your profile provides the baseline context for all 10 autonomous agents. Keep your education, interests, and projects updated.
        </p>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-[#11171B] border border-[#35D9F2]/30 text-xs font-mono text-[#35D9F2] flex items-center gap-2 shadow-lg">
          <Sparkles className="w-4 h-4 text-[#35D9F2]" />
          <span>{statusMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-[#0B0F12] p-6 sm:p-8 rounded-2xl border border-white/8 space-y-6 shadow-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-zinc-400">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-[#11171B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D9F2]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-zinc-400">Professional Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-[#11171B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D9F2]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono uppercase text-zinc-400">Education & Institution</label>
          <input
            type="text"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="e.g. B.S. in Computer Science (Junior Year)"
            className="w-full bg-[#11171B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D9F2]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono uppercase text-zinc-400">Technical Interests (comma separated)</label>
          <input
            type="text"
            value={interestsText}
            onChange={(e) => setInterestsText(e.target.value)}
            placeholder="e.g. Distributed Systems, Web Engineering, Machine Learning, Cloud Architecture"
            className="w-full bg-[#11171B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D9F2]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono uppercase text-zinc-400">Professional Biography</label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Summarize your engineering background, project motivations, and learning objectives..."
            className="w-full bg-[#11171B] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#35D9F2] leading-relaxed"
          />
        </div>

        {/* Existing Projects Readout */}
        {profile?.projects && profile.projects.length > 0 && (
          <div className="pt-2">
            <div className="text-xs font-mono uppercase text-zinc-400 mb-3">Portfolio Projects Evaluated by Profile Agent:</div>
            <div className="space-y-2">
              {profile.projects.map((proj, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#11171B] border border-white/5 flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{proj.title}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{proj.description}</div>
                  </div>
                  <span className="text-[11px] font-mono text-[#35D9F2] bg-[#35D9F2]/10 px-2 py-0.5 rounded border border-[#35D9F2]/30 shrink-0">
                    {proj.tech}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-white/8 flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            size="md"
            variant="primary"
            icon={<Save className="w-4 h-4" />}
          >
            {saving ? 'Synchronizing Profile...' : 'Save & Recalibrate Knowledge Graph'}
          </Button>
        </div>
      </form>
    </div>
  );
};