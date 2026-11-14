import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, 
  ExternalLink, 
  GitBranch, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Send, 
  Check, 
  ChevronRight, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { api } from '../../api/client';
import { Project } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const ProjectStudioView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form states
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [liveDemoUrl, setLiveDemoUrl] = useState<string>('');
  const [reflectionNotes, setReflectionNotes] = useState<string>('');
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getProjects();
      setProjects(data);
      if (data.length > 0) {
        selectProject(data[0]);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectProject = (proj: Project) => {
    setSelectedProject(proj);
    setSubmissionSuccess(null);
    if (proj.submission) {
      setGithubUrl(proj.submission.github_url || '');
      setLiveDemoUrl(proj.submission.live_demo_url || '');
      setReflectionNotes(proj.submission.reflection_notes || '');
    } else {
      setGithubUrl('');
      setLiveDemoUrl('');
      setReflectionNotes('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !githubUrl.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.submitProject(
        selectedProject.id,
        githubUrl.trim(),
        liveDemoUrl.trim(),
        reflectionNotes.trim()
      );
      setSubmissionSuccess(res.feedback || 'Project successfully submitted for architectural review.');
      // Refresh project list to reflect submission
      const updated = await api.getProjects();
      setProjects(updated);
      const found = updated.find(p => p.id === selectedProject.id);
      if (found) setSelectedProject(found);
    } catch (err) {
      console.error('Failed to submit project:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 font-mono text-sm">
        <div className="w-5 h-5 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading production project pathways...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="cyan" size="sm">PROJECT STUDIO</Badge>
            <span className="text-xs font-mono text-zinc-500">• Production Architecture Blueprints</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Portfolio Project Studio
          </h1>
          <p className="text-sm text-[#929CA3] mt-1">
            Build real-world systems, submit code repositories, and receive automated architectural feedback to build hireable portfolio proof.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Project Selector (4 cols) */}
        <div className="lg:col-span-4 bg-[#0B0F12] border border-white/8 rounded-2xl p-5 space-y-3">
          <span className="text-xs font-mono uppercase text-zinc-400 font-semibold block pb-2 border-b border-white/8">
            Project Pathways ({projects.length})
          </span>

          <div className="space-y-2">
            {projects.map(proj => {
              const isSelected = selectedProject?.id === proj.id;
              const hasSubmitted = !!proj.submission;
              return (
                <div
                  key={proj.id}
                  onClick={() => selectProject(proj)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#161D22] border-[#35D9F2]/50 shadow-[0_0_20px_rgba(53,217,242,0.12)]'
                      : 'bg-[#11171B] border-white/5 hover:border-white/10 hover:bg-[#161D22]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400">
                      {proj.career_title || 'Full Stack'}
                    </span>
                    {hasSubmitted ? (
                      <span className="text-[10px] font-mono text-[#C5F45B] flex items-center gap-1 font-semibold">
                        <Check className="w-3 h-3" /> Submitted
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-500">In Progress</span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white mb-2">{proj.title}</h3>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>{proj.difficulty}</span>
                    <ChevronRight className="w-4 h-4 text-[#35D9F2]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Detail & Submission Form (8 cols) */}
        {selectedProject ? (
          <div className="lg:col-span-8 space-y-6">
            {/* Specification Card */}
            <div className="bg-[#0B0F12] border border-white/8 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="lime" size="sm">{selectedProject.difficulty}</Badge>
                    <span className="text-xs font-mono text-zinc-400">{selectedProject.career_title}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{selectedProject.title}</h2>
                </div>

                {selectedProject.submission && (
                  <Badge variant="cyan" size="sm">
                    Grade: {selectedProject.submission.status.toUpperCase()}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-[#F5F7F4] leading-relaxed">
                {selectedProject.description}
              </p>

              {/* Architecture Blueprint */}
              {selectedProject.architecture_markdown && (
                <div className="bg-[#11171B] border border-white/5 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#35D9F2] font-semibold">
                    <Layers className="w-4 h-4" />
                    <span>SYSTEM ARCHITECTURE BLUEPRINT</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre-line">
                    {selectedProject.architecture_markdown}
                  </p>
                </div>
              )}

              {/* Required Tech Stack */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2.5">
                  Required Competencies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.required_skills?.map((sk, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md bg-[#11171B] border border-white/10 text-xs font-mono text-zinc-300">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Deliverables Checklist */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2.5">
                  Deliverables Checklist
                </h4>
                <div className="space-y-2">
                  {selectedProject.deliverables?.map((del, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300 bg-[#11171B] p-3 rounded-lg border border-white/5">
                      <CheckCircle2 className="w-4 h-4 text-[#C5F45B] shrink-0 mt-0.5" />
                      <span>{del}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Milestones */}
              {selectedProject.milestones && selectedProject.milestones.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2.5">
                    Step-by-Step Implementation Milestones
                  </h4>
                  <div className="space-y-3">
                    {selectedProject.milestones.map((ms, idx) => (
                      <div key={ms.id || idx} className="p-3.5 rounded-xl bg-[#050608] border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">Milestone {idx + 1}: {ms.title}</span>
                          <span className="text-[10px] font-mono text-[#35D9F2]">Deliverable</span>
                        </div>
                        <p className="text-xs text-zinc-400">{ms.objective}</p>
                        <p className="text-[11px] font-mono text-[#C5F45B] pt-1">Output: {ms.deliverable}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submission Form */}
            <div className="bg-[#0B0F12] border border-white/8 rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-white/8 text-sm font-bold text-white">
                <FolderGit2 className="w-4 h-4 text-[#35D9F2]" />
                <span>Submit Portfolio Deliverables</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                    GITHUB REPOSITORY URL *
                  </label>
                  <div className="flex items-center gap-2 bg-[#11171B] border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-[#35D9F2]">
                    <GitBranch className="w-4 h-4 text-zinc-400" />
                    <input
                      type="url"
                      required
                      placeholder="https://github.com/username/project-repo"
                      value={githubUrl}
                      onChange={e => setGithubUrl(e.target.value)}
                      className="bg-transparent flex-1 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                    LIVE DEPLOYED DEMO URL (OPTIONAL)
                  </label>
                  <div className="flex items-center gap-2 bg-[#11171B] border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-[#35D9F2]">
                    <ExternalLink className="w-4 h-4 text-zinc-400" />
                    <input
                      type="url"
                      placeholder="https://my-app.vercel.app"
                      value={liveDemoUrl}
                      onChange={e => setLiveDemoUrl(e.target.value)}
                      className="bg-transparent flex-1 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                    ENGINEERING REFLECTION & ARCHITECTURAL CHOICES
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe key architectural tradeoffs, state management patterns, and challenges overcome..."
                    value={reflectionNotes}
                    onChange={e => setReflectionNotes(e.target.value)}
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#35D9F2]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting || !githubUrl.trim()}
                  variant="primary"
                  size="md"
                  icon={submitting ? undefined : <Send className="w-4 h-4" />}
                >
                  {submitting ? 'Submitting & Evaluating...' : 'Submit Project for Review'}
                </Button>
              </form>

              {/* Feedback Alert */}
              {(submissionSuccess || selectedProject.submission?.grade_feedback) && (
                <div className="p-4 rounded-xl bg-[#C5F45B]/10 border border-[#C5F45B]/30 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#C5F45B] font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ARCHITECTURAL EVALUATION FEEDBACK</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                    {submissionSuccess || selectedProject.submission?.grade_feedback}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-[#0B0F12] border border-white/8 rounded-2xl p-12 text-center text-zinc-500">
            <FolderGit2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a project to view specifications and submit deliverables.</p>
          </div>
        )}
      </div>
    </div>
  );
};