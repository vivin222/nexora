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
  Upload,
  Compass,
  TrendingUp,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { api } from '../../api/client';
import { 
  CareerRole, 
  Skill, 
  OnboardingSubmitPayload, 
  UserResponse,
  CareerMatchItem,
  CareerDiscoveryResponse
} from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface OnboardingWizardProps {
  currentUser: UserResponse | null;
  onComplete: () => void;
  onCancel?: () => void;
}

const DOMAIN_INTEREST_PRESETS = [
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

  // Form State - Step 2: Technical & Domain Interests & Aspirations
  const [careerInterests, setCareerInterests] = useState<string[]>([
    'Full-Stack Web Development',
    'Cloud Architecture & DevOps'
  ]);
  const [interestInput, setInterestInput] = useState<string>('');
  const [workPreference, setWorkPreference] = useState<string>('Hybrid');
  const [shortTermGoal, setShortTermGoal] = useState<string>('');
  const [longTermGoal, setLongTermGoal] = useState<string>('');
  const [weeklyHours, setWeeklyHours] = useState<number>(10);
  const [learningPreferences, setLearningPreferences] = useState<string[]>([
    'Hands-on Practical Labs',
    'Interactive Coding Challenges',
    'Curated Docs & Code Walkthroughs'
  ]);

  // Form State - Step 3: Technical Skills & 5-Level Proficiency Calibrator
  const [selectedSkills, setSelectedSkills] = useState<Array<{ skill_id: string; proficiency: number }>>([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState<string>('');

  // Form State - Step 4: Practical Experience, Projects & Resume
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [portfolioUrl, setPortfolioUrl] = useState<string>('');
  const [projects, setProjects] = useState<Array<{ title: string; tech: string; description: string }>>([]);
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [projectTech, setProjectTech] = useState<string>('');
  const [projectDesc, setProjectDesc] = useState<string>('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [certInput, setCertInput] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>('');
  const [extractingResume, setExtractingResume] = useState<boolean>(false);
  const [resumeExtractionFeedback, setResumeExtractionFeedback] = useState<string | null>(null);

  // Form State - Step 5: AI Career Discovery & Top 3 Comparison
  // STRICT RULE: No default preset career! Starts as empty string.
  const [targetCareerId, setTargetCareerId] = useState<string>('');
  const [discoveryResults, setDiscoveryResults] = useState<CareerDiscoveryResponse | null>(null);
  const [discovering, setDiscovering] = useState<boolean>(false);
  const [showAllCareers, setShowAllCareers] = useState<boolean>(false);

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
        // Do NOT preset target career. Let learner complete discovery questionnaire.
        setTargetCareerId('');
        setSelectedSkills([]);
      } catch (err) {
        console.error('Failed to load onboarding reference data:', err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, []);

  // When navigating to Step 5, trigger the AI Career Discovery engine
  const handleTriggerDiscovery = async () => {
    setDiscovering(true);
    try {
      const res = await api.discoverCareers({
        education_level: educationLevel,
        department: department,
        academic_year: academicYear,
        institution: institution,
        interests: careerInterests,
        skills: selectedSkills,
        projects: projects,
        certifications: certifications,
        weekly_hours: weeklyHours,
        work_preference: workPreference,
      });
      setDiscoveryResults(res);
    } catch (err) {
      console.error('Career discovery evaluation failed:', err);
    } finally {
      setDiscovering(false);
    }
  };

  const handleNextStep = () => {
    if (step === 4) {
      // Transitioning to Step 5: trigger discovery
      handleTriggerDiscovery();
    }
    setStep(Math.min(totalSteps, step + 1));
  };

  // Toggle Interest Tag
  const handleToggleInterest = (interest: string) => {
    if (careerInterests.includes(interest)) {
      setCareerInterests(careerInterests.filter(i => i !== interest));
    } else {
      setCareerInterests([...careerInterests, interest]);
    }
  };

  const handleAddCustomInterest = () => {
    if (interestInput.trim() && !careerInterests.includes(interestInput.trim())) {
      setCareerInterests([...careerInterests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  // Skill Management
  const handleToggleSkill = (skillId: string) => {
    const exists = selectedSkills.some(s => s.skill_id === skillId);
    if (exists) {
      setSelectedSkills(selectedSkills.filter(s => s.skill_id !== skillId));
    } else {
      // Default to Level 3: Intermediate (60%)
      setSelectedSkills([...selectedSkills, { skill_id: skillId, proficiency: 60 }]);
    }
  };

  const handleSetProficiencyLevel = (skillId: string, level: number) => {
    // 5-level scale: 1=20%, 2=40%, 3=60%, 4=80%, 5=100%
    const proficiency = level * 20;
    setSelectedSkills(
      selectedSkills.map(s => (s.skill_id === skillId ? { ...s, proficiency } : s))
    );
  };

  const getProficiencyLabel = (pct: number) => {
    if (pct >= 81) return { level: 5, label: 'Expert (Mastery)', color: 'text-[#C5F45B] border-[#C5F45B]/40' };
    if (pct >= 61) return { level: 4, label: 'Advanced (Multi-tier)', color: 'text-[#35D9F2] border-[#35D9F2]/40' };
    if (pct >= 41) return { level: 3, label: 'Intermediate (Independent)', color: 'text-cyan-300 border-cyan-500/30' };
    if (pct >= 21) return { level: 2, label: 'Basic (Assisted)', color: 'text-amber-300 border-amber-500/30' };
    return { level: 1, label: 'Beginner (Awareness)', color: 'text-zinc-400 border-white/10' };
  };

  // Project Management
  const handleAddProject = () => {
    if (!projectTitle.trim()) return;
    setProjects([
      ...projects,
      {
        title: projectTitle.trim(),
        tech: projectTech.trim() || 'Software Stack',
        description: projectDesc.trim() || 'Built and delivered project artifact.'
      }
    ]);
    setProjectTitle('');
    setProjectTech('');
    setProjectDesc('');
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

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

    if (extracted.skills && Array.isArray(extracted.skills)) {
      const newSkillsMap = new Map<string, number>();
      selectedSkills.forEach(s => newSkillsMap.set(s.skill_id, s.proficiency));

      extracted.skills.forEach((rawSkill: any) => {
        const skillName = typeof rawSkill === 'string' ? rawSkill : rawSkill.name || rawSkill.skill_name;
        const prof = typeof rawSkill === 'object' && rawSkill.proficiency ? rawSkill.proficiency : 60;
        
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

    if (extracted.projects && Array.isArray(extracted.projects) && extracted.projects.length > 0) {
      setProjects(extracted.projects);
    }

    setResumeExtractionFeedback(`AI Intelligence extracted ${extracted.skills?.length || 0} skills, academic records, and projects. Review fields below.`);
  };

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

  // Final Synthesis & Submission
  const handleFinalSubmit = async () => {
    if (!targetCareerId) {
      setSubmitError('Please select your active Target Career from the recommendations above before proceeding.');
      return;
    }

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
      frameworks_and_tools: [],
      certifications: certifications,
      projects: projects,
      github_url: githubUrl.trim(),
      portfolio_url: portfolioUrl.trim(),
      resume_text: resumeText.trim()
    };

    try {
      setTimeout(() => setDagStep(2), 700);
      setTimeout(() => setDagStep(3), 1500);
      setTimeout(() => setDagStep(4), 2200);

      await api.submitOnboarding(payload);
      
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
      <div className="max-w-5xl mx-auto w-full mb-8">
        <div className="flex items-center justify-between pb-6 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#050608] border border-[#35D9F2]/50 flex items-center justify-center shadow-[0_0_20px_rgba(53,217,242,0.25)]">
              <span className="text-[#35D9F2] font-black text-base font-mono">N</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Learner Career Intelligence Calibration
                <Badge variant="cyan" size="sm">Step {step} of {totalSteps}</Badge>
              </h1>
              <p className="text-xs text-[#929CA3]">
                Ground your profile in genuine academic, technical, and project evidence. No pre-assigned careers.
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
            { id: 2, label: 'Interests & Goals', icon: Compass },
            { id: 3, label: 'Skill Matrix', icon: Sliders },
            { id: 4, label: 'Projects & Resume', icon: FolderGit2 },
            { id: 5, label: 'AI Career Discovery', icon: Target },
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
      <div className="max-w-5xl mx-auto w-full flex-1">
        <div className="bg-[#0B0F12] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          
          {/* STEP 1: Academic & Personal Background */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/8 pb-4">
                <Badge variant="cyan" size="sm">STEP 1: ACADEMIC FOUNDATION</Badge>
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
                    placeholder="e.g. CS Junior | Aspiring Cloud Infrastructure Engineer"
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
                  <span className="text-white font-medium">True AI Personalization:</span> NEXORA allocates a private memory graph for your learner profile. Your target career is determined only after complete evidence evaluation.
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Technical & Domain Interests & Aspirations */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/8 pb-4">
                <Badge variant="cyan" size="sm">STEP 2: DOMAIN PASSIONS & HORIZONS</Badge>
                <h2 className="text-xl font-bold text-white mt-1">Technical Interests & Career Vision</h2>
                <p className="text-xs text-[#929CA3] mt-0.5">
                  Select your primary areas of technical enthusiasm and time commitments. The Career Intelligence Agent maps these to industry trajectories.
                </p>
              </div>

              {/* Domain Interest Presets */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2 font-mono">
                  Primary Technical Domains of Interest ({careerInterests.length} selected)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {DOMAIN_INTEREST_PRESETS.map((domain) => {
                    const isSelected = careerInterests.includes(domain);
                    return (
                      <button
                        key={domain}
                        type="button"
                        onClick={() => handleToggleInterest(domain)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#35D9F2]/20 border-[#35D9F2] text-[#35D9F2] font-semibold shadow-[0_0_12px_rgba(53,217,242,0.15)]'
                            : 'bg-[#11171B] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {domain}
                      </button>
                    );
                  })}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomInterest(); } }}
                    placeholder="Add custom domain interest (e.g. WebAssembly, Quantum)..."
                    className="flex-1 bg-[#11171B] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#35D9F2]"
                  />
                  <Button variant="secondary" size="sm" onClick={handleAddCustomInterest}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Work Preference & Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-2 font-mono">
                    Preferred Work Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Remote', 'Hybrid', 'On-Site'].map((format) => (
                      <button
                        key={format}
                        type="button"
                        onClick={() => setWorkPreference(format)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-mono ${
                          workPreference === format
                            ? 'bg-[#11171B] border-[#35D9F2] text-[#35D9F2] font-bold shadow-sm'
                            : 'bg-[#11171B]/50 border-white/5 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-2 font-mono">
                    Weekly Learning Time: <span className="text-[#35D9F2] font-bold">{weeklyHours} Hours/Week</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 20].map((hours) => (
                      <button
                        key={hours}
                        type="button"
                        onClick={() => setWeeklyHours(hours)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          weeklyHours === hours
                            ? 'bg-[#11171B] border-[#35D9F2] text-[#35D9F2] shadow-sm font-bold'
                            : 'bg-[#11171B]/50 border-white/5 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="text-sm font-mono">{hours}h</div>
                        <div className="text-[9px] uppercase font-sans mt-0.5">
                          {hours === 5 ? 'Casual' : hours === 10 ? 'Balanced' : hours === 15 ? 'Intensive' : 'Accelerated'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strategic Goals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                    Short-Term Goal (Next 3–6 Months)
                  </label>
                  <textarea
                    rows={2}
                    value={shortTermGoal}
                    onChange={(e) => setShortTermGoal(e.target.value)}
                    placeholder="e.g. Master containerization, land a high-impact internship"
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
                    placeholder="e.g. Architect distributed platforms and lead engineering pods"
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#35D9F2] transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Technical Skills & 5-Level Proficiency Calibrator */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/8 pb-4">
                <Badge variant="cyan" size="sm">STEP 3: 5-LEVEL PROFICIENCY CALIBRATION</Badge>
                <h2 className="text-xl font-bold text-white mt-1">Calibrate Your Technical Skill Matrix</h2>
                <p className="text-xs text-[#929CA3] mt-0.5">
                  Select technologies you have hands-on experience with and rate your competency on the standardized 5-level scale.
                </p>
              </div>

              {/* Master Skills Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-zinc-400 uppercase">Available Core Technologies</span>
                  <input
                    type="text"
                    value={skillSearchQuery}
                    onChange={(e) => setSkillSearchQuery(e.target.value)}
                    placeholder="Search skills (e.g. Python, Docker, React)..."
                    className="bg-[#11171B] border border-white/10 rounded-lg px-3 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#35D9F2]"
                  />
                </div>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-[#11171B]/40 rounded-xl border border-white/5">
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

              {/* 5-Level Calibrators for Selected Skills */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400 uppercase">
                    Calibrate Selected Skills ({selectedSkills.length})
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    1: Beginner → 3: Intermediate → 5: Expert
                  </span>
                </div>

                {selectedSkills.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-white/10 rounded-xl bg-[#11171B]/30 text-zinc-500 text-xs font-mono">
                    Click skills above to add and calibrate your proficiency levels.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {selectedSkills.map((item) => {
                      const sInfo = availableSkills.find(s => s.id === item.skill_id);
                      const sName = sInfo?.name || item.skill_id.replace('skill-', '').replace('-', ' ');
                      const profMeta = getProficiencyLabel(item.proficiency);

                      return (
                        <div key={item.skill_id} className="p-3.5 bg-[#11171B] border border-white/5 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{sName}</span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${profMeta.color}`}>
                                Level {profMeta.level}: {profMeta.label}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleSkill(item.skill_id)}
                              className="text-zinc-500 hover:text-rose-400 text-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* 5-tier level buttons */}
                          <div className="grid grid-cols-5 gap-1.5">
                            {[1, 2, 3, 4, 5].map((lvl) => {
                              const isLvl = profMeta.level === lvl;
                              return (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => handleSetProficiencyLevel(item.skill_id, lvl)}
                                  className={`py-1.5 px-2 rounded-lg border text-center transition-all text-xs font-mono cursor-pointer ${
                                    isLvl
                                      ? 'bg-[#35D9F2]/20 border-[#35D9F2] text-[#35D9F2] font-bold'
                                      : 'bg-[#0B0F12] border-white/5 text-zinc-500 hover:text-zinc-300'
                                  }`}
                                >
                                  L{lvl}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Practical Experience, Projects & Resume Intelligence */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/8 pb-4">
                <Badge variant="cyan" size="sm">STEP 4: EVIDENCE & PRACTICAL CAPSTONES</Badge>
                <h2 className="text-xl font-bold text-white mt-1">Projects, Portfolio & Resume</h2>
                <p className="text-xs text-[#929CA3] mt-0.5">
                  Document genuine projects and open-source contributions. Optional: extract evidence from your resume text.
                </p>
              </div>

              {/* GitHub & Portfolio URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                    GitHub Profile URL
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full bg-[#11171B] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#35D9F2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                    Portfolio / Live Demo URL
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

              {/* Add Project Form */}
              <div className="p-4 bg-[#11171B] border border-white/8 rounded-xl space-y-3">
                <span className="text-xs font-mono text-zinc-300 uppercase block font-semibold">
                  Add Practical Project Deliverable
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Project Title (e.g. Distributed Telemetry Platform)"
                    className="bg-[#0B0F12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#35D9F2]"
                  />
                  <input
                    type="text"
                    value={projectTech}
                    onChange={(e) => setProjectTech(e.target.value)}
                    placeholder="Tech Stack (e.g. React, FastAPI, Docker, SQL)"
                    className="bg-[#0B0F12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#35D9F2]"
                  />
                </div>
                <textarea
                  rows={2}
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="Key deliverables, architecture, and engineering impact..."
                  className="w-full bg-[#0B0F12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#35D9F2]"
                />
                <Button variant="secondary" size="sm" onClick={handleAddProject} disabled={!projectTitle.trim()}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Project
                </Button>
              </div>

              {/* Project List */}
              {projects.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-mono text-zinc-400 uppercase">
                    Logged Deliverables ({projects.length})
                  </span>
                  {projects.map((p, idx) => (
                    <div key={idx} className="p-3 bg-[#11171B] border border-white/5 rounded-xl flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{p.title}</div>
                        <div className="text-[11px] font-mono text-[#35D9F2] mt-0.5">{p.tech}</div>
                        <div className="text-xs text-zinc-400 mt-1">{p.description}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(idx)}
                        className="text-zinc-500 hover:text-rose-400 text-xs ml-3"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Optional Resume Extraction */}
              <div className="pt-2 border-t border-white/8 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-300 uppercase">
                    Optional: AI Resume Auto-Extractor
                  </span>
                  <label className="text-[11px] font-mono text-[#35D9F2] hover:underline cursor-pointer flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Upload File (.txt, .md)
                    <input type="file" accept=".txt,.md,.text" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste plain resume text to auto-detect skills and academic records..."
                  className="w-full bg-[#11171B] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#35D9F2]"
                />
                <div className="flex items-center gap-3">
                  <Button variant="secondary" size="sm" onClick={handleExtractResume} disabled={extractingResume || !resumeText.trim()}>
                    {extractingResume ? 'Analyzing Resume...' : 'Extract & Auto-Fill Skills'}
                  </Button>
                  {resumeExtractionFeedback && (
                    <span className="text-xs text-[#C5F45B] font-mono">{resumeExtractionFeedback}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: AI Career Discovery & Top 3 Comparison Card */}
          {step === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/8 pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="cyan" size="sm">STEP 5: AI MULTI-AGENT CAREER DISCOVERY</Badge>
                  <Button variant="ghost" size="sm" onClick={handleTriggerDiscovery} disabled={discovering}>
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-[#35D9F2]" /> Re-evaluate Matches
                  </Button>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">Your Personalized Top 3 Career Matches</h2>
                <p className="text-xs text-[#929CA3] mt-0.5">
                  Calculated deterministically from your genuine academic degree, {selectedSkills.length} declared skills, and domain interests. Choose your active Target Career.
                </p>
              </div>

              {discovering ? (
                <div className="py-16 text-center space-y-4 font-mono text-xs text-zinc-400">
                  <div className="w-8 h-8 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>Orchestrator running multi-agent gap analysis across 6 industry trajectories...</p>
                </div>
              ) : discoveryResults ? (
                <div className="space-y-6">
                  {/* Missing Profile Warning if Any */}
                  {discoveryResults.missing_profile_data.length > 0 && (
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2 text-xs text-amber-300">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold">Profile Transparency Note:</span>
                        <ul className="list-disc list-inside text-[11px] text-amber-200/80">
                          {discoveryResults.missing_profile_data.map((m, idx) => (
                            <li key={idx}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Top 3 Side-by-Side Comparison */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {discoveryResults.top_matches.map((item, idx) => {
                      const isSelected = targetCareerId === item.career_id;
                      return (
                        <div
                          key={item.career_id}
                          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative ${
                            isSelected
                              ? 'bg-[#11171B] border-[#35D9F2] shadow-[0_0_25px_rgba(53,217,242,0.22)] ring-1 ring-[#35D9F2]'
                              : 'bg-[#11171B]/60 border-white/8 hover:border-white/20'
                          }`}
                        >
                          {/* Top Rank Badge */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                              #{idx + 1} Candidate Match
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-base font-bold font-mono text-[#35D9F2]">
                                {item.match_score}%
                              </span>
                              <span className="text-[10px] uppercase font-mono text-zinc-400">Match</span>
                            </div>
                          </div>

                          {/* Role Info */}
                          <div className="space-y-2 mb-4">
                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                              {item.category}
                            </span>
                            <h3 className="text-base font-bold text-white leading-snug">
                              {item.title}
                            </h3>
                            <div className="inline-block px-2 py-0.5 rounded bg-[#C5F45B]/10 text-[#C5F45B] border border-[#C5F45B]/30 text-[10px] font-mono">
                              {item.fit_level}
                            </div>
                            <p className="text-[11px] text-zinc-300 leading-relaxed pt-1">
                              {item.match_rationale}
                            </p>
                          </div>

                          {/* Metrics Breakdown */}
                          <div className="space-y-2.5 py-3 border-t border-b border-white/5 my-3 text-xs font-mono">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-zinc-400">Overlapping Strengths:</span>
                              <span className="text-[#C5F45B] font-bold">{item.overlapping_skills_count} skills</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-zinc-400">Critical Gaps to Bridge:</span>
                              <span className="text-amber-400 font-bold">{item.critical_gaps_count} deficits</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-zinc-400">Est. Runway to Ready:</span>
                              <span className="text-white font-bold">{item.estimated_weeks} Weeks</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-zinc-400">Avg Compensation:</span>
                              <span className="text-zinc-200">{item.average_salary}</span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setTargetCareerId(item.career_id);
                              setSubmitError(null);
                            }}
                            className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-[#35D9F2] text-[#050608] shadow-[0_0_15px_rgba(53,217,242,0.35)]'
                                : 'bg-[#0B0F12] border border-white/10 text-white hover:border-[#35D9F2]/50 hover:text-[#35D9F2]'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[3]" /> Active Target Selected
                              </>
                            ) : (
                              'Select as My Target Career →'
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Toggle View All Careers */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setShowAllCareers(!showAllCareers)}
                      className="text-xs font-mono text-zinc-400 hover:text-white inline-flex items-center gap-1 cursor-pointer"
                    >
                      {showAllCareers ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {showAllCareers ? 'Hide Additional Career Roles' : `Explore All ${discoveryResults.all_matches.length} Career Trajectories`}
                    </button>
                  </div>

                  {/* Full Career Catalog if expanded */}
                  {showAllCareers && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {discoveryResults.all_matches.map((item) => {
                        const isSelected = targetCareerId === item.career_id;
                        return (
                          <div
                            key={item.career_id}
                            onClick={() => setTargetCareerId(item.career_id)}
                            className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#11171B] border-[#35D9F2] text-white shadow-md'
                                : 'bg-[#11171B]/40 border-white/5 text-zinc-400 hover:border-white/20'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-white">{item.title}</span>
                              <span className="font-mono text-[#35D9F2] font-semibold">{item.match_score}%</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 line-clamp-1">{item.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Selection Notification / Warning */}
              {!targetCareerId && (
                <div className="p-3 bg-[#11171B] border border-cyan-500/30 rounded-xl text-xs text-cyan-300 font-mono text-center">
                  Select one of the Top 3 recommended careers above to calibrate your learning roadmap.
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Bottom Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 mt-8 border-t border-white/8">
            {step > 1 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(step - 1)}
                disabled={submitting}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
              </Button>
            ) : <div />}

            {step < totalSteps ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleNextStep}
                disabled={step === 1 && !fullName.trim()}
              >
                Continue <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleFinalSubmit}
                disabled={submitting || !targetCareerId}
              >
                {submitting ? 'Synthesizing Platform...' : 'Launch Learning Platform →'}
              </Button>
            )}
          </div>

        </div>
      </div>

      {/* Multi-Agent DAG Simulation Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-[#050608]/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#0B0F12] border border-[#35D9F2]/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#35D9F2]/20 border border-[#35D9F2] flex items-center justify-center">
                <Cpu className="w-4 h-4 text-[#35D9F2] animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Central Agent Orchestrator</h3>
                <p className="text-[11px] font-mono text-[#929CA3]">Synthesizing Adaptive Learning Graph</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 text-xs font-mono">
              <div className={`flex items-center gap-2 ${dagStep >= 1 ? 'text-[#35D9F2]' : 'text-zinc-600'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ProfileAgent: Ingested student evidence vector</span>
              </div>
              <div className={`flex items-center gap-2 ${dagStep >= 2 ? 'text-[#35D9F2]' : 'text-zinc-600'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SkillAnalysisAgent: Calibrated gap vectors & competencies</span>
              </div>
              <div className={`flex items-center gap-2 ${dagStep >= 3 ? 'text-[#35D9F2]' : 'text-zinc-600'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>RoadmapAgent: Generated adaptive milestone sequence</span>
              </div>
              <div className={`flex items-center gap-2 ${dagStep >= 4 ? 'text-[#C5F45B]' : 'text-zinc-600'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CareerIntelligenceAgent: Synchronized AI Career Twin</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
