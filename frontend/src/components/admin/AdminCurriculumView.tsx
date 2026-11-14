import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Search, 
  Filter, 
  Tag, 
  Clock, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { AdminResourceItem } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface AdminCurriculumViewProps {
  resources: AdminResourceItem[];
  loading: boolean;
  onCreateResource: (data: Partial<AdminResourceItem>) => Promise<void>;
  onDeleteResource: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const AdminCurriculumView: React.FC<AdminCurriculumViewProps> = ({
  resources,
  loading,
  onCreateResource,
  onDeleteResource,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');

  // Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [skillId, setSkillId] = useState('skill-python');
  const [url, setUrl] = useState('');
  const [provider, setProvider] = useState('Official Documentation');
  const [resourceType, setResourceType] = useState('Documentation');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [estimatedDuration, setEstimatedDuration] = useState('3 hours');
  const [submitting, setSubmitting] = useState(false);

  const skills = Array.from(new Set(resources.map(r => r.skill_name || r.skill_id).filter(Boolean)));

  const filtered = resources.filter(r => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.skill_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSkill = skillFilter === 'all' || (r.skill_name || r.skill_id) === skillFilter;
    return matchesSearch && matchesSkill;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCreateResource({
        title,
        skill_id: skillId,
        url,
        provider,
        resource_type: resourceType,
        difficulty,
        estimated_duration: estimatedDuration,
        is_free: 1
      });
      setCreateModalOpen(false);
      setTitle('');
      setUrl('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="cyan" size="sm">CURRICULUM ARCHITECTURE</Badge>
            <span className="text-zinc-500 text-xs font-mono">{filtered.length} Learning Assets</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Skill Milestone Learning Catalog
          </h1>
          <p className="text-xs text-[#929CA3] mt-1">
            Curate open-source learning materials, whitepapers, and guides mapped directly into learner adaptive roadmaps.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setCreateModalOpen(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Educational Resource
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search resource title, provider, or topic..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0F12] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#35D9F2]"
          />
        </div>

        {skills.length > 0 && (
          <div className="flex items-center gap-2 bg-[#0B0F12] border border-white/10 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={skillFilter}
              onChange={e => setSkillFilter(e.target.value)}
              className="bg-transparent text-xs text-zinc-300 focus:outline-none"
            >
              <option value="all">All Skills</option>
              {skills.map((s, idx) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Resources Table */}
      {loading ? (
        <div className="py-16 text-center text-xs text-zinc-400 font-mono">
          Loading learning repository...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0B0F12] border border-white/5 rounded-2xl p-12 text-center">
          <BookOpen className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-white">No Resources Found</h3>
          <p className="text-xs text-zinc-400 mt-1">Add a new educational resource to link into student roadmaps.</p>
        </div>
      ) : (
        <div className="bg-[#0B0F12] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080C0E] border-b border-white/5 text-zinc-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Curriculum Asset</th>
                  <th className="py-3 px-4">Mapped Skill</th>
                  <th className="py-3 px-4">Type & Difficulty</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(res => (
                  <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white flex items-center gap-1.5">
                        <span>{res.title}</span>
                        {res.url && (
                          <a 
                            href={res.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-zinc-500 hover:text-[#35D9F2]"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="text-zinc-500 text-[11px] font-mono mt-0.5">
                        {res.provider}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="cyan" size="sm">
                        {res.skill_name || res.skill_id}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-zinc-300 font-medium">{res.resource_type}</div>
                      <div className="text-zinc-500 text-[10px] font-mono">{res.difficulty}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">
                      {res.estimated_duration}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onDeleteResource(res.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove Curriculum Resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Resource Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0B0F12] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Add Curriculum Resource</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Link an authoritative open-access technical resource into the adaptive learning engine.
            </p>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">RESOURCE TITLE *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems Architecture & Raft Consensus"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#11171B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#35D9F2]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">TARGET SKILL ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. skill-python or skill-docker"
                  value={skillId}
                  onChange={e => setSkillId(e.target.value)}
                  className="w-full bg-[#11171B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#35D9F2]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">RESOURCE URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="w-full bg-[#11171B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#35D9F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">PROVIDER</label>
                  <input
                    type="text"
                    value={provider}
                    onChange={e => setProvider(e.target.value)}
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#35D9F2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">RESOURCE TYPE</label>
                  <select
                    value={resourceType}
                    onChange={e => setResourceType(e.target.value)}
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#35D9F2]"
                  >
                    <option value="Documentation">Documentation</option>
                    <option value="Whitepaper">Whitepaper</option>
                    <option value="Interactive Lab">Interactive Lab</option>
                    <option value="Case Study">Case Study</option>
                    <option value="Deep Dive Article">Deep Dive Article</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">DIFFICULTY</label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#35D9F2]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">ESTIMATED TIME</label>
                  <input
                    type="text"
                    value={estimatedDuration}
                    onChange={e => setEstimatedDuration(e.target.value)}
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#35D9F2]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Linking...' : 'Add Resource'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
