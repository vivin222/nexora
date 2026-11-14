import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Target, 
  Cpu, 
  FolderGit2, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Sliders, 
  FileText, 
  Plus, 
  Trash2, 
  GitBranch, 
  Globe, 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  AlertCircle,
  Code2,
  Upload
} from 'lucide-react';
import { api } from '../../api/client';
import { CareerRole, Skill, OnboardingSubmitPayload, UserResponse } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface OnboardingWizardProps {
  currentUser: UserResponse | null;
  onComplete: () => void;
  onCancel?: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  currentUser,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  // Master options from backend
  const [availableCareers, setAvailableCareers] = useState<CareerRole[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  // Form State - Step 1: Personal & Academic Background
  const [fullName, setFullName] = useState<string>(currentUser?.full_name || '');
  const [headline, setHeadline] = useState<string>(currentUser?.headline || '');
  const [educationLevel, setEducationLevel] = useState<string>('Undergraduate');
  const [institution, setInstitution] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>('3rd Year / Junior');

  // Form State - Step 2: Target Career & Strategic Goals
  const [targetCareerId, setTargetCareerId] = useState<string>('');
  const [careerInterests, setCareerInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState<string>('');
  const [shortTermGoal, setShortTermGoal] = useState<string>('');
  const [longTermGoal, setLongTermGoal] = useState<string>('');
  const [weeklyHours, setWeeklyHours] = useState<number>(10);
  const [learningPreferences, setLearningPreferences] = useState<string[]>([]);

  // Form State - Step 3: Technical Skills & Calibrated Proficiencies
  const [selectedSkills, setSelectedSkills] = useState<Array<{ skill_id: string; proficiency: number }>>([]);
  const [frameworksAndTools, setFrameworksAndTools] = useState<string[]>([]);
  const [frameworkInput, setFrameworkInput] = useState<string>('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [certInput, setCertInput] = useState<string>('');
  const [skillSearchQuery, setSkillSearchQuery] = useState<string>('');

  // Form State - Step 4: Projects & AI Resume Intelligence
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [portfolioUrl, setPortfolioUrl] = useState<string>('');
  const [projects, setProjects] = useState<Array<{ title: string; tech: string; description: string }>>([]);
  const [resumeText, setResumeText] = useState<string>('');
  const [extractingResume, setExtractingResume] = useState<boolean>(false);
  const [resumeExtractionFeedback, setResumeExtractionFeedback] = useState<string | null>(null);

  // Submission & Multi-Agent DAG Simulation State
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [dagStep, setDagStep] = useState<number>(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load Careers and Master Skills on Mount
  useEffect(() => {
    async function loadData() {
      try {
        const [careers, skills] = await Promise.all([
          api.getCareers(),
          api.getMasterSkills()
        ]);
        setAvailableCareers(careers);
        setAvailableSkills(skills);

        if (careers.length > 0) {
          setTargetCareerId(careers[0].id);
        }

        // Initialize skills as empty array so learner selects their actual competencies
        setSelectedSkills([]);
      } catch (err) {
        console.error('Failed to load onboarding reference data:', err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, []);

  // Apply Extracted Resume Data to Form
  const applyExtractedData = (extracted: any) => {
    if (!extracted) return;
    if (extracted.full_name && !fullName) setFullName(extracted.full_name);
    if (extracted.headline && !headline) setHeadline(extracted.headline);
    if (extracted.institution && !institution) setInstitution(extracted.institution);
    if (extracted.department && !department) setDepartment(extracted.department);
    if (extracted.education_level) setEducationLevel(extracted.education_level);
    if (extracted.academic_year) setAcademicYear(extracted.academic_year);
    if (extracted.github_url && !githubUrl) setGithubUrl(extracted.github_url);
    if (extracted.portfolio_url && !portfolioUrl) setPortfolioUrl(extracted.portfolio_url);
    if (extracted.short_term_goal) setShortTermGoal(extracted.short_term_goal);
    if (extracted.long_term_goal) setLongTermGoal(extracted.long_term_goal);

    // Map extracted skills to available skills
    if (extracted.skills && Array.isArray(extracted.skills)) {
      const newSkillsMap = new Map<string, number>();
      selectedSkills.forEach(s => newSkillsMap.set(s.skill_id, s.proficiency));

      extracted.skills.forEach((rawSkill: any) => {
        const skillName = typeof rawSkill === 'string' ? rawSkill : rawSkill.name || rawSkill.skill_name;
        const prof = typeof rawSkill === 'object' && rawSkill.proficiency ? rawSkill.proficiency : 70;
        
        const match = availableSkills.find(
          s => s.name.toLowerCase() === skillName.toLowerCase() ||
               skillName.toLowerCase().includes(s.name.toLowerCase())
        );
        if (match) {
          newSkillsMap.set(match.id, prof);
        }
      });

      setSelectedSkills(Array.from(newSkillsMap.entries()).map(([skill_id, proficiency]) => ({ skill_id, proficiency })));
    }

    if (extracted.frameworks_and_tools && Array.isArray(extracted.frameworks_and_tools)) {
      setFrameworksAndTools(Array.from(new Set([...frameworksAndTools, ...extracted.frameworks_and_tools])));
    }

    if (extracted.projects && Array.isArray(extracted.projects) && extracted.projects.length > 0) {
      setProjects(extracted.projects);
    }

    setResumeExtractionFeedback(`AI Intelligence extracted ${extracted.skills?.length || 0} skills, academic records, and career alignments. Review the auto-populated fields below.`);
  };

  // AI Resume Extraction Handler from text
  const handleExtractResume = async () => {
    if (!resumeText.trim()) {
      setResumeExtractionFeedback('Please paste your resume or bio text first, or upload a resume file.');
      return;
    }
    setExtractingResume(true);
    setResumeExtractionFeedback(null);

    try {
      const res = await api.extractResume(resumeText);
      applyExtractedData(res.data);
    } catch (err: any) {
      setResumeExtractionFeedback(err.message || 'Failed to extract resume details.');
    } finally {
      setExtractingResume(false);
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        setResumeText(content);
        setExtractingResume(true);
        setResumeExtractionFeedback(null);
        try {
          const res = await api.extractResume(content);
          applyExtractedData(res.data);
        } catch (err: any) {
          setResumeExtractionFeedback(err.message || 'Failed to extract resume details.');
        } finally {
          setExtractingResume(false);
        }
      }
    };
    reader.readAsText(file);
  };

  // Skill Management
  const handleToggleSkill = (skillId: string) => {
    const exists = selectedSkills.some(s => s.skill_id === skillId);
    if (exists) {
      setSelectedSkills(selectedSkills.filter(s => s.skill_id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, { skill_id: skillId, proficiency: 60 }]);
    }
  };

  const handleUpdateProficiency = (skillId: string, proficiency: number) => {
    setSelectedSkills(
      selectedSkills.map(s => (s.skill_id === skillId ? { ...s, proficiency } : s))
    );
  };

  // Final Synthesis & Submission
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setDagStep(1);

    const payload: OnboardingSubmitPayload = {
      full_name: fullName.trim() || 'Learner',
      headline: headline.trim() || 'Software Engineer',
      education_level: educationLevel,
      institution: institution.trim() || 'University',
      department: department.trim() || 'Computer Science',
      academic_year: academicYear,
      target_career_id: targetCareerId,
      career_interests: careerInterests,
      short_term_goal: shortTermGoal.trim(),
      long_term_goal: longTermGoal.trim(),
      weekly_hours: weeklyHours,
      learning_preferences: learningPreferences,
      skills: selectedSkills,
      frameworks_and_tools: frameworksAndTools,
      certifications: certifications,
      projects: projects,
      github_url: githubUrl.trim(),
      portfolio_url: portfolioUrl.trim(),
      resume_text: resumeText.trim()
    };

    try {
      // Simulate visual multi-agent orchestration stages
      setTimeout(() => setDagStep(2), 700);
      setTimeout(() => setDagStep(3), 1500);
      setTimeout(() => setDagStep(4), 2200);

      const response = await api.submitOnboarding(payload);
      
      // Wait a moment for UX completion and redirect
      setTimeout(() => {
        onComplete();
      }, 3000);
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed. Please check your data.');
      setSubmitting(false);
      setDagStep(0);
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-[#050608] flex items-center justify-center p-6 text-zinc-400 font-mono text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin" />
          <span>Configuring onboarding environment...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] text-[#F5F7F4] flex flex-col selection:bg-[#35D9F2] selection:text-[#050608] py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full mb-8">
        <div className="flex items-center justify-between pb-6 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#050608] border border-[#35D9F2]/50 flex items-center justify-center shadow-[0_0_15px_rgba(53,217,242,0.25)]">
              <span className="text-[#35D9F2] font-black text-sm font-mono">N</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Learner Calibration Engine
                <Badge variant="cyan" size="sm">Step {step} of {totalSteps}</Badge>
              </h1>
              <p className="text-xs text-[#929CA3]">
                Configure your personalized profile to activate your multi-agent career intelligence platform.
              </p>
            </div>
          </div>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Exit
            </Button>
          )}
        </div>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-5 gap-2 mt-6">
          {[
            { id: 1, label: 'Background', icon: GraduationCap },
            { id: 2, label: 'Target Career', icon: Target },
            { id: 3, label: 'Skill Calibration', icon: Sliders },
            { id: 4, label: 'Projects & Resume', icon: FolderGit2 },
            { id: 5, label: 'Intelligence Synthesis', icon: Cpu },
          ].map((s) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            return (
              <div 
                key={s.id}
                onClick={() => { if (s.id < step) setStep(s.id); }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-xs font-mono select-none ${
                  isActive
                    ? 'bg-[#11171B] border-[#35D9F2]/60 text-[#35D9F2] shadow-[0_0_15px_rgba(53,217,242,0.15)]'
                    : isCompleted
                    ? 'bg-[#0B0F12] border-[#C5F45B]/40 text-[#C5F45B] cursor-pointer hover:border-[#C5F45B]'
                    : 'bg-[#0B0F12]/50 border-white/5 text-zinc-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-[#35D9F2]/20 text-[#35D9F2]' : isCompleted ? 'bg-[#C5F45B]/20 text-[#C5F45B]' : 'bg-white/5 text-zinc-600'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span className="truncate hidden sm:inline">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Body */}
      <div className="max-w-4xl mx-auto w-full flex-1">
        <div className="bg-[#0B0F12] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          
          {/* STEP 1: Academic & Personal Background */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/8 pb-4">
                <Badge variant="cyan" size="sm">STEP 1: LEARNER FOUNDATION</Badge>
                <h2 className="text-xl font-bold text-white mt-1">Academic & Personal Profile</h2>
                <p className="text-xs text-[#929CA3] mt-0.5">
                  Establish your academic foundation so the AI agents can tailor pacing, conceptual depth, and baseline knowledge.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                    Full Name <span className="text-[#35D9F2]">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    required
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#35D9F2] focus:ring-1 focus:ring-[#35D9F2] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                    Professional Headline / Focus
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. CS Junior | Aspiring AI Infrastructure Engineer"
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#35D9F2] focus:ring-1 focus:ring-[#35D9F2] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                    Education Level
                  </label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D9F2] focus:ring-1 focus:ring-[#35D9F2] transition-colors cursor-pointer"
                  >
                    <option value="Undergraduate">Undergraduate (B.Tech / B.S. / B.E.)</option>
                    <option value="Postgraduate">Postgraduate (M.S. / M.Tech / MBA)</option>
                    <option value="Bootcamp / Self-Taught">Bootcamp / Self-Taught</option>
                    <option value="High School">High School</option>
                    <option value="Working Professional">Working Professional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                    Academic Year / Graduation Horizon
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#35D9F2] focus:ring-1 focus:ring-[#35D9F2] transition-colors cursor-pointer"
                  >
                    <option value="1st Year">1st Year / Freshman</option>
                    <option value="2nd Year">2nd Year / Sophomore</option>
                    <option value="3rd Year / Junior">3rd Year / Junior</option>
                    <option value="4th Year / Senior">4th Year / Senior</option>
                    <option value="Graduated">Graduated / Working</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                    University / College / Institution
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Stanford University or Self-Directed"
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#35D9F2] focus:ring-1 focus:ring-[#35D9F2] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                    Department / Major / Field
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & Artificial Intelligence"
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#35D9F2] focus:ring-1 focus:ring-[#35D9F2] transition-colors"
                  />
                </div>
              </div>

              <div className="bg-[#11171B] border border-white/8 rounded-xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#35D9F2] shrink-0 mt-0.5" />
                <div className="text-xs text-[#929CA3]">
                  <span className="text-white font-medium">Adaptive Profile Isolation:</span> NEXORA allocates a private memory graph and persistence namespace for your account. You can calibrate skills at any time.
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Target Career & Strategic Goals */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/8 pb-4">
                <Badge variant="cyan" size="sm">STEP 2: TARGET TRAJECTORY</Badge>
                <h2 className="text-xl font-bold text-white mt-1">Select Target Career & Vision</h2>
                <p className="text-xs text-[#929CA3] mt-0.5">
                  Choose the high-demand industry role you wish to optimize toward. The intelligence agent will calculate exact gap vectors.
                </p>
              </div>

              {/* Career Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableCareers.map((c) => {
                  const isSelected = targetCareerId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setTargetCareerId(c.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-[#11171B] border-[#35D9F2] shadow-[0_0_20px_rgba(53,217,242,0.18)]'
                          : 'bg-[#11171B]/50 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-[#35D9F2] uppercase">{c.category}</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#C5F45B]/10 text-[#C5F45B] border border-[#C5F45B]/30">
                          {c.growth_outlook}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-1">{c.title}</h3>
                      <p className="text-xs text-[#929CA3] line-clamp-2 mb-3">{c.description}</p>
                      <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-white/5">
                        <span className="text-zinc-400">Avg Compensation:</span>
                        <span className="text-white font-semibold">{c.average_salary}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Strategic Goals & Commitment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                    Short-Term Goal (Next 3–6 Months)
                  </label>
                  <textarea
                    rows={2}
                    value={shortTermGoal}
                    onChange={(e) => setShortTermGoal(e.target.value)}
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#35D9F2] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                    Long-Term Career Vision (2–3 Years)
                  </label>
                  <textarea
                    rows={2}
                    value={longTermGoal}
                    onChange={(e) => setLongTermGoal(e.target.value)}
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#35D9F2] transition-colors"
                  />
                </div>
              </div>

              {/* Weekly Time Commitment */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2 font-mono">
                  Weekly Learning Time Commitment: <span className="text-[#35D9F2] font-bold">{weeklyHours} Hours/Week</span>
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[5, 10, 15, 20].map((hours) => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setWeeklyHours(hours)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        weeklyHours === hours
                          ? 'bg-[#11171B] border-[#35D9F2] text-[#35D9F2] shadow-sm font-bold'
                          : 'bg-[#11171B]/50 border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="text-base font-mono">{hours}h</div>
                      <div className="text-[10px] uppercase font-sans mt-0.5">
                        {hours === 5 ? 'Casual' : hours === 10 ? 'Balanced' : hours === 15 ? 'Intensive' : 'Accelerated'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Technical Skills & Proficiency Calibrator */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/8 pb-4">
                <Badge variant="cyan" size="sm">STEP 3: SKILL GRAPH CALIBRATION</Badge>
                <h2 className="text-xl font-bold text-white mt-1">Calibrate Your Existing Skill Vector</h2>
                <p className="text-xs text-[#929CA3] mt-0.5">
                  Select the technologies you have experience with and calibrate your proficiency (0–100%). The Skill Analysis Agent will use these as baselines.
                </p>
              </div>

              {/* Master Skills Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-zinc-400 uppercase">Select Core Competencies</span>
                  <input
                    type="text"
                    value={skillSearchQuery}
                    onChange={(e) => setSkillSearchQuery(e.target.value)}
                    placeholder="Search skills (e.g. Python, Docker)..."
                    className="bg-[#11171B] border border-white/10 rounded-lg px-3 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#35D9F2]"
                  />
                </div>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-[#11171B]/40 rounded-xl border border-white/5">
                  {availableSkills
                    .filter(s => s.name.toLowerCase().includes(skillSearchQuery.toLowerCase()))
                    .map((s) => {
                      const isSelected = selectedSkills.some(item => item.skill_id === s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleToggleSkill(s.id)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#35D9F2]/20 border-[#35D9F2] text-[#35D9F2] font-semibold'
                              : 'bg-[#11171B] border-white/10 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '} {s.name}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Interactive Proficiency Sliders */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400 uppercase">
                    Calibrate Selected Skills ({selectedSkills.length})
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">0% (Novice) → 100% (Expert)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-72 overflow-y-auto pr-1">
                  {selectedSkills.map((item) => {
                    const skillMeta = availableSkills.find(s => s.id === item.skill_id);
                    const name = skillMeta ? skillMeta.name : item.skill_id;
                    return (
                      <div key={item.skill_id} className="bg-[#11171B] p-4 rounded-xl border border-white/8 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">{name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[#35D9F2] font-bold">{item.proficiency}%</span>
                            <button
                              type="button"
                              onClick={() => handleToggleSkill(item.skill_id)}
                              className="text-zinc-500 hover:text-rose-400 p-0.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={item.proficiency}
                          onChange={(e) => handleUpdateProficiency(item.skill_id, parseInt(e.target.value, 10))}
                          className="w-full accent-[#35D9F2] bg-zinc-800 rounded-lg cursor-pointer h-1.5"
                        />

                        <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                          <span>Beginner</span>
                          <span>Proficient</span>
                          <span>Advanced</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Frameworks & Tools */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                  Frameworks, Libraries & Developer Tools
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={frameworkInput}
                    onChange={(e) => setFrameworkInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && frameworkInput.trim()) {
                        e.preventDefault();
                        if (!frameworksAndTools.includes(frameworkInput.trim())) {
                          setFrameworksAndTools([...frameworksAndTools, frameworkInput.trim()]);
                        }
                        setFrameworkInput('');
                      }
                    }}
                    placeholder="Type framework (e.g. Next.js, Redis, PyTorch) and press Enter"
                    className="flex-1 bg-[#11171B] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#35D9F2]"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (frameworkInput.trim() && !frameworksAndTools.includes(frameworkInput.trim())) {
                        setFrameworksAndTools([...frameworksAndTools, frameworkInput.trim()]);
                        setFrameworkInput('');
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {frameworksAndTools.map((tool) => (
                    <span
                      key={tool}
                      className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md bg-[#11171B] border border-white/10 text-zinc-300"
                    >
                      {tool}
                      <button
                        type="button"
                        onClick={() => setFrameworksAndTools(frameworksAndTools.filter(t => t !== tool))}
                        className="text-zinc-500 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Projects & AI Resume Intelligence */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/8 pb-4">
                <Badge variant="cyan" size="sm">STEP 4: EVIDENCE & RESUME INTELLIGENCE</Badge>
                <h2 className="text-xl font-bold text-white mt-1">Portfolio & AI Resume Extractor</h2>
                <p className="text-xs text-[#929CA3] mt-0.5">
                  Paste your resume text or LinkedIn summary to have our Resume Agent extract your background, or manually link your GitHub and key projects.
                </p>
              </div>

              {/* AI Resume Ingestion Tool */}
              <div className="bg-[#11171B] border border-[#35D9F2]/30 rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#35D9F2]" />
                    <span className="text-sm font-bold text-white">AI Resume Extraction Agent</span>
                  </div>
                  <Badge variant="lime" size="sm">Gemini Powered</Badge>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Paste your resume markdown, plain text, or LinkedIn summary. The agent parses institutions, skills, projects, and target alignments into this wizard.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 pb-1">
                  <label 
                    htmlFor="resume-file-upload" 
                    className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#050608] hover:bg-white/5 border border-white/10 hover:border-[#35D9F2]/50 text-xs font-mono text-zinc-300 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#35D9F2]" />
                    <span>Upload Resume File (.txt, .md, .json)</span>
                    <input
                      id="resume-file-upload"
                      type="file"
                      accept=".txt,.md,.json,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] font-mono text-zinc-500">or paste text directly below</span>
                </div>

                <textarea
                  rows={4}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste resume text or bio here (e.g. Full Name, University, Skills, Featured Projects, Key Certifications)..."
                  className="w-full bg-[#050608] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#35D9F2] font-mono leading-relaxed"
                />

                <div className="flex items-center justify-between pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={extractingResume}
                    onClick={handleExtractResume}
                    icon={<Sparkles className="w-3.5 h-3.5" />}
                  >
                    {extractingResume ? 'Analyzing with AI Agent...' : 'Extract & Auto-Fill Profile'}
                  </Button>
                  <span className="text-[11px] font-mono text-zinc-500">FastAPI Agent Engine</span>
                </div>

                {resumeExtractionFeedback && (
                  <div className="p-3 bg-[#050608] rounded-xl border border-[#35D9F2]/40 text-xs text-[#35D9F2] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{resumeExtractionFeedback}</span>
                  </div>
                )}
              </div>

              {/* Profiles & Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-zinc-400" /> GitHub Profile URL
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/your-username"
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#35D9F2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-zinc-400" /> Portfolio / Website URL
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourportfolio.dev"
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#35D9F2]"
                  />
                </div>
              </div>

              {/* Key Projects */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-zinc-400 uppercase">Featured Projects ({projects.length})</span>
                  <button
                    type="button"
                    onClick={() => setProjects([...projects, { title: '', tech: '', description: '' }])}
                    className="text-xs text-[#35D9F2] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Project
                  </button>
                </div>

                <div className="space-y-3">
                  {projects.map((proj, idx) => (
                    <div key={idx} className="bg-[#11171B] p-4 rounded-xl border border-white/8 space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-zinc-400">Project #{idx + 1}</span>
                        {projects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                            className="text-zinc-500 hover:text-rose-400 p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].title = e.target.value;
                            setProjects(updated);
                          }}
                          placeholder="Project Title (e.g. Autonomous Vector Pipeline)"
                          className="bg-[#050608] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#35D9F2]"
                        />
                        <input
                          type="text"
                          value={proj.tech}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].tech = e.target.value;
                            setProjects(updated);
                          }}
                          placeholder="Tech Stack (e.g. Python, Docker, Qdrant)"
                          className="bg-[#050608] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#35D9F2]"
                        />
                      </div>
                      <input
                        type="text"
                        value={proj.description}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].description = e.target.value;
                          setProjects(updated);
                        }}
                        placeholder="Brief summary of architecture, impact, and deliverables"
                        className="w-full bg-[#050608] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#35D9F2]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Final Review & Intelligence Synthesis */}
          {step === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/8 pb-4">
                <Badge variant="lime" size="sm">STEP 5: READY FOR SYNTHESIS</Badge>
                <h2 className="text-xl font-bold text-white mt-1">Review & Initialize Intelligence Platform</h2>
                <p className="text-xs text-[#929CA3] mt-0.5">
                  Confirm your profile details. Clicking "Synthesize My AI Platform" will trigger our multi-agent DAG to generate your personalized roadmap, assessment plan, and skill gap report.
                </p>
              </div>

              {/* Profile Summary Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#11171B] p-4 rounded-xl border border-white/8">
                  <div className="text-[11px] font-mono text-zinc-400 uppercase">Learner Identity</div>
                  <div className="text-base font-bold text-white mt-1">{fullName || 'Jane Doe'}</div>
                  <div className="text-xs text-[#35D9F2] mt-0.5">{headline || 'Aspiring Software Engineer'}</div>
                  <div className="text-xs text-zinc-400 mt-2">
                    {educationLevel} • {department || 'Computer Science'}
                  </div>
                  <div className="text-xs text-zinc-500 font-mono mt-0.5">
                    {institution || 'University'} ({academicYear})
                  </div>
                </div>

                <div className="bg-[#11171B] p-4 rounded-xl border border-white/8">
                  <div className="text-[11px] font-mono text-zinc-400 uppercase">Target Trajectory</div>
                  {(() => {
                    const c = availableCareers.find(item => item.id === targetCareerId);
                    return (
                      <>
                        <div className="text-base font-bold text-white mt-1">{c ? c.title : 'AI Engineer'}</div>
                        <div className="text-xs text-[#C5F45B] font-mono mt-0.5">Market: {c?.growth_outlook || 'High Growth'}</div>
                        <div className="text-xs text-zinc-400 mt-2 font-mono">
                          Comp: {c?.average_salary || '$145,000'}
                        </div>
                        <div className="text-xs text-zinc-400 font-mono mt-0.5">
                          Commitment: {weeklyHours}h / week
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="bg-[#11171B] p-4 rounded-xl border border-white/8">
                  <div className="text-[11px] font-mono text-zinc-400 uppercase">Calibrated Skills</div>
                  <div className="text-2xl font-black text-[#35D9F2] font-mono mt-1">
                    {selectedSkills.length} Verified
                  </div>
                  <div className="text-xs text-zinc-400 mt-2">
                    Avg Proficiency: {Math.round(selectedSkills.reduce((a, b) => a + b.proficiency, 0) / (selectedSkills.length || 1))}%
                  </div>
                  <div className="text-xs text-zinc-500 font-mono mt-0.5">
                    Projects: {projects.length} | Tools: {frameworksAndTools.length}
                  </div>
                </div>
              </div>

              {/* Skills preview tags */}
              <div className="bg-[#11171B]/50 p-4 rounded-xl border border-white/5 space-y-2">
                <span className="text-xs font-mono text-zinc-400 uppercase">Skills Included in Profile:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map(s => {
                    const skill = availableSkills.find(m => m.id === s.skill_id);
                    return (
                      <span key={s.skill_id} className="text-xs font-mono px-2.5 py-1 rounded bg-[#11171B] border border-white/10 text-white flex items-center gap-1.5">
                        <span>{skill ? skill.name : s.skill_id}</span>
                        <span className="text-[#35D9F2] font-bold">({s.proficiency}%)</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {submitError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls Bar */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/8">
            {step > 1 ? (
              <Button
                variant="secondary"
                size="md"
                onClick={() => setStep(step - 1)}
                icon={<ArrowLeft className="w-4 h-4" />}
                disabled={submitting}
              >
                Previous Step
              </Button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  if (step === 1 && !fullName.trim()) {
                    alert('Please enter your full name to proceed.');
                    return;
                  }
                  setStep(step + 1);
                }}
              >
                Continue <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="lime"
                size="lg"
                onClick={handleFinalSubmit}
                disabled={submitting}
                icon={<Cpu className="w-4 h-4" />}
              >
                {submitting ? 'Synthesizing Platform...' : 'Synthesize My AI Learning Platform'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Agent DAG Simulation Overlay */}
      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
          <div className="max-w-md w-full bg-[#0B0F12] border border-[#35D9F2]/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_80px_rgba(53,217,242,0.25)] space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-[#35D9F2]/20 border border-[#35D9F2]/50 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(53,217,242,0.3)]">
                <Cpu className="w-6 h-6 text-[#35D9F2] animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Synthesizing Custom Workspace
              </h3>
              <p className="text-xs text-[#929CA3]">
                NEXORA Autonomous Multi-Agent DAG Orchestration
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                dagStep >= 1 ? 'bg-[#11171B] border-[#35D9F2] text-white' : 'bg-[#0B0F12] border-white/5 text-zinc-600'
              }`}>
                {dagStep > 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-[#C5F45B] shrink-0" />
                ) : (
                  <div className="w-4 h-4 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin shrink-0" />
                )}
                <span>1. Profile Agent Ingesting Learner Persona...</span>
              </div>

              <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                dagStep >= 2 ? 'bg-[#11171B] border-[#35D9F2] text-white' : 'bg-[#0B0F12] border-white/5 text-zinc-600'
              }`}>
                {dagStep > 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-[#C5F45B] shrink-0" />
                ) : dagStep === 2 ? (
                  <div className="w-4 h-4 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-zinc-800 shrink-0" />
                )}
                <span>2. Skill Agent Computing Deficits & Benchmarks...</span>
              </div>

              <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                dagStep >= 3 ? 'bg-[#11171B] border-[#35D9F2] text-white' : 'bg-[#0B0F12] border-white/5 text-zinc-600'
              }`}>
                {dagStep > 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-[#C5F45B] shrink-0" />
                ) : dagStep === 3 ? (
                  <div className="w-4 h-4 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-zinc-800 shrink-0" />
                )}
                <span>3. Career Intelligence Mapping Trajectory...</span>
              </div>

              <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                dagStep >= 4 ? 'bg-[#11171B] border-[#35D9F2] text-white' : 'bg-[#0B0F12] border-white/5 text-zinc-600'
              }`}>
                {dagStep >= 4 ? (
                  <CheckCircle2 className="w-4 h-4 text-[#C5F45B] shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-zinc-800 shrink-0" />
                )}
                <span>4. Roadmap Agent Generating Topological Plan...</span>
              </div>
            </div>

            <div className="pt-2 text-center text-[11px] text-zinc-500 font-mono">
              Redirecting to your personalized workspace...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
