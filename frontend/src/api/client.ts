import {
  LearnerProfile,
  CareerRole,
  SkillAnalysis,
  Roadmap,
  Assessment,
  AssessmentResult,
  AgentLog,
  MentorMessage,
  ProgressOverview,
  Skill,
  Course,
  CourseLesson,
  CodingProblem,
  CodingSubmissionResult,
  Project,
  InterviewQuestion,
  InterviewEvaluationResult,
  ResumeAnalysis,
  WeeklyGoals,
  Achievement,
  Certificate,
  CareerOpportunity,
  UserResponse,
  AuthResponse,
  OnboardingSubmitPayload,
  AdminStats,
  AdminStudentItem,
  AdminAuditLogItem,
  AdminResourceItem,
  ActivityTimelineEvent,
  CareerReadinessReport,
  WeeklyGrowthReview,
  AdminPlatformHealth
} from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL 
  ? `${(import.meta as any).env.VITE_API_URL}/api` 
  : '/api';

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('nexora_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMsg = `API request failed with status ${response.status}`;
    try {
      const errData = await response.json();
      if (errData.detail) errMsg = errData.detail;
    } catch {}
    throw new Error(errMsg);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Authentication & Session
  register: (payload: {
    email: string;
    password: string;
    full_name: string;
    headline?: string;
    education_level?: string;
    institution?: string;
    department?: string;
    graduation_year?: string;
  }) =>
    fetchJSON<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (email: string, password: string) =>
    fetchJSON<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  adminLogin: (email: string, password: string) =>
    fetchJSON<AuthResponse>('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  googleLogin: (idToken: string, credential?: string) =>
    fetchJSON<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken, credential }),
    }),
  githubLogin: (code: string, redirectUri?: string) =>
    fetchJSON<AuthResponse>('/auth/github', {
      method: 'POST',
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
    }),
  juryLogin: (passkey?: string) =>
    fetchJSON<AuthResponse>('/auth/jury-login', {
      method: 'POST',
      body: JSON.stringify({ passkey }),
    }),
  getCurrentUser: () => fetchJSON<UserResponse>('/auth/me'),
  forgotPassword: (email: string) =>
    fetchJSON<{ status: string; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Student Timeline & High-Value Intelligence
  getTimeline: () => fetchJSON<ActivityTimelineEvent[]>('/profile/timeline'),
  getReadinessReport: () => fetchJSON<CareerReadinessReport>('/profile/readiness-report'),
  getWeeklyGrowth: () => fetchJSON<WeeklyGrowthReview>('/profile/weekly-growth'),

  // Onboarding & Profile Intelligence
  submitOnboarding: (data: OnboardingSubmitPayload) =>
    fetchJSON<{ status: string; message: string; profile: LearnerProfile; intelligence: any }>('/profile/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  extractResume: (resume_text: string) =>
    fetchJSON<{ status: string; data: any }>('/profile/extract-resume', {
      method: 'POST',
      body: JSON.stringify({ resume_text }),
    }),

  // Health
  checkHealth: () => fetchJSON<{ status: string; service: string; version: string }>('/health'),

  // Profile
  getProfile: () => fetchJSON<LearnerProfile>('/profile'),
  updateProfile: (data: Partial<LearnerProfile> & { skills?: Array<{ skill_id: string; proficiency: number }> }) =>
    fetchJSON<{ status: string; intelligence: any }>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Careers
  getCareers: () => fetchJSON<CareerRole[]>('/careers'),
  getCareerDetails: (id: string) => fetchJSON<CareerRole>(`/careers/${id}`),
  selectCareer: (careerId: string) =>
    fetchJSON<{ status: string; message: string; orchestration: any }>('/careers/select', {
      method: 'POST',
      body: JSON.stringify({ career_id: careerId }),
    }),

  // Skills
  getMasterSkills: () => fetchJSON<Skill[]>('/skills'),
  getSkillAnalysis: (careerId?: string) =>
    fetchJSON<{ career: any; analysis: SkillAnalysis; learner_skills: any[] }>(
      careerId ? `/skills/analysis?career_id=${careerId}` : '/skills/analysis'
    ),
  updateSkill: (skillId: string, proficiency: number) =>
    fetchJSON<{ status: string; intelligence: any }>('/skills/update', {
      method: 'POST',
      body: JSON.stringify({ skill_id: skillId, proficiency }),
    }),

  // Assessments
  getAssessments: () => fetchJSON<Assessment[]>('/assessments'),
  getAssessmentDetails: (id: string) => fetchJSON<Assessment>(`/assessments/${id}`),
  submitAssessment: (assessmentId: string, answers: Record<string, number>) =>
    fetchJSON<{ status: string; evaluation: { assessment_result: AssessmentResult; updated_intelligence: any } }>(
      '/assessments/submit',
      {
        method: 'POST',
        body: JSON.stringify({ assessment_id: assessmentId, answers }),
      }
    ),

  // Roadmap
  getRoadmap: () => fetchJSON<Roadmap>('/roadmap'),
  generateRoadmap: () => fetchJSON<Roadmap>('/roadmap/generate', { method: 'POST' }),
  toggleMilestone: (milestoneId: string, completed: boolean) =>
    fetchJSON<{ status: string; new_status: string; progress_percentage: number; completed_milestones: number }>(
      `/roadmap/milestones/${milestoneId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ completed }),
      }
    ),

  // Progress
  getProgressOverview: () => fetchJSON<ProgressOverview>('/progress'),

  // AI Mentor
  getMentorHistory: () => fetchJSON<MentorMessage[]>('/mentor/history'),
  chatWithMentor: (message: string) =>
    fetchJSON<{ id: string; sender: 'mentor'; message: string; metadata: any }>('/mentor/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  // Agents & Telemetry
  getAgentsStatus: () => fetchJSON<any>('/agents/status'),
  getAgentLogs: () => fetchJSON<AgentLog[]>('/agents/logs'),
  runAgentCycle: () => fetchJSON<any>('/agents/run-cycle', { method: 'POST' }),

  // 1. Learning Center & Lessons
  getCourses: () => fetchJSON<Course[]>('/learning/courses'),
  getCourseDetail: (courseId: string) => fetchJSON<Course>(`/learning/courses/${courseId}`),
  getCourseDetails: (courseId: string) => fetchJSON<Course>(`/learning/courses/${courseId}`),
  getLessonDetail: (lessonId: string) => fetchJSON<CourseLesson>(`/learning/lessons/${lessonId}`),
  completeLesson: (lessonId: string) => fetchJSON<{ status: string; completed: boolean }>(`/learning/lessons/${lessonId}/complete`, { method: 'POST' }),
  toggleBookmark: (lessonId: string, bookmarked: boolean) =>
    fetchJSON<{ status: string; bookmarked: boolean }>(`/learning/lessons/${lessonId}/bookmark`, {
      method: 'POST',
      body: JSON.stringify({ bookmarked }),
    }),
  updateLessonProgress: async (lessonId: string, completed: boolean, bookmarked: boolean) => {
    if (completed) {
      await fetchJSON<{ status: string; completed: boolean }>(`/learning/lessons/${lessonId}/complete`, { method: 'POST' });
    }
    return fetchJSON<{ status: string; bookmarked: boolean }>(`/learning/lessons/${lessonId}/bookmark`, {
      method: 'POST',
      body: JSON.stringify({ bookmarked }),
    });
  },
  tutorChat: (courseId: string, lessonId: string, message: string) =>
    fetchJSON<{ sender: string; message: string; metadata: any }>('/learning/tutor/chat', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId, lesson_id: lessonId, message }),
    }),
  askTutor: async (lessonId: string, message: string, courseId: string = 'course-react-core') => {
    const res = await fetchJSON<{ sender: string; message: string; metadata: any }>('/learning/tutor/chat', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId, lesson_id: lessonId, message }),
    });
    return { response: res.message };
  },

  // 2. Coding Practice Lab
  getCodingProblems: () => fetchJSON<CodingProblem[]>('/coding/problems'),
  getCodingProblem: (id: string) => fetchJSON<CodingProblem>(`/coding/problems/${id}`),
  submitCode: (id: string, code: string, language: string = 'javascript') =>
    fetchJSON<CodingSubmissionResult>(`/coding/problems/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ code, language }),
    }),

  // 3. Project Studio
  getProjects: () => fetchJSON<Project[]>('/projects'),
  getProjectDetail: (id: string) => fetchJSON<Project>(`/projects/${id}`),
  submitProject: (id: string, github_url: string, live_demo_url: string, reflection_notes: string) =>
    fetchJSON<{ status: string; submission_id: string; feedback: string }>(`/projects/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ github_url, live_demo_url, reflection_notes }),
    }),

  // 4. Interview Simulator
  getInterviewQuestions: (careerId?: string) =>
    fetchJSON<InterviewQuestion[]>(careerId ? `/interview/questions?career_id=${careerId}` : '/interview/questions'),
  startInterviewSession: (careerId?: string, interviewType: string = 'Technical', difficulty: string = 'Intermediate') =>
    fetchJSON<{ session_id: string; career_id: string; status: string }>('/interview/start', {
      method: 'POST',
      body: JSON.stringify({ career_id: careerId, interview_type: interviewType, difficulty }),
    }),
  evaluateInterviewAnswer: (questionId: string, userAnswer: string, sessionId?: string) =>
    fetchJSON<InterviewEvaluationResult>('/interview/evaluate', {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId, user_answer: userAnswer, session_id: sessionId }),
    }),
  getInterviewHistory: () => fetchJSON<any[]>('/interview/history'),

  // 5. Resume & Portfolio Analyzer
  analyzeResume: (resumeText: string, filename: string = 'Resume.txt', careerId?: string) =>
    fetchJSON<ResumeAnalysis>('/resume/analyze', {
      method: 'POST',
      body: JSON.stringify({ resume_text: resumeText, filename, career_id: careerId }),
    }),
  getLatestResumeAnalysis: () => fetchJSON<ResumeAnalysis>('/resume/latest'),

  // 6. Weekly Goals
  getWeeklyGoals: () => fetchJSON<WeeklyGoals>('/goals'),
  updateWeeklyGoals: (target_hours: number, target_lessons: number, target_assessments: number) =>
    fetchJSON<{ status: string; message: string }>('/goals', {
      method: 'PUT',
      body: JSON.stringify({ target_hours, target_lessons, target_assessments }),
    }),

  // 7. Achievements & Certificates
  getAchievements: () => fetchJSON<{ achievements: Achievement[]; certificates: Certificate[]; total_unlocked: number; total_available: number }>('/achievements'),

  // 8. Career Opportunities
  getOpportunities: (careerId?: string) =>
    fetchJSON<CareerOpportunity[]>(careerId ? `/opportunities?career_id=${careerId}` : '/opportunities'),

  // 9. Admin Portal Endpoints
  getAdminStats: () => fetchJSON<AdminStats>('/admin/stats'),
  getAdminStudents: (status?: string, department?: string, institution?: string, search?: string) => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (department) params.append('department', department);
    if (institution) params.append('institution', institution);
    if (search) params.append('search', search);
    const q = params.toString();
    return fetchJSON<AdminStudentItem[]>(`/admin/students${q ? `?${q}` : ''}`);
  },
  getStudentDetails: (studentId: string) => fetchJSON<any>(`/admin/students/${studentId}`),
  approveStudent: (studentId: string) =>
    fetchJSON<{ status: string; message: string }>(`/admin/students/${studentId}/approve`, {
      method: 'POST',
    }),
  rejectStudent: (studentId: string, rejection_reason: string) =>
    fetchJSON<{ status: string; message: string }>(`/admin/students/${studentId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejection_reason }),
    }),
  updateStudentStatus: (studentId: string, status: string) =>
    fetchJSON<{ status: string; message: string }>(`/admin/students/${studentId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
  suspendStudent: (studentId: string) =>
    fetchJSON<{ status: string; message: string }>(`/admin/students/${studentId}/suspend`, {
      method: 'POST',
    }),
  reactivateStudent: (studentId: string) =>
    fetchJSON<{ status: string; message: string }>(`/admin/students/${studentId}/reactivate`, {
      method: 'POST',
    }),
  getAdminResources: () => fetchJSON<AdminResourceItem[]>('/admin/resources'),
  createAdminResource: (data: Partial<AdminResourceItem>) =>
    fetchJSON<{ status: string; id: string; message: string }>('/admin/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteAdminResource: (resourceId: string) =>
    fetchJSON<{ status: string; message: string }>(`/admin/resources/${resourceId}`, {
      method: 'DELETE',
    }),
  getAdminAuditLogs: () => fetchJSON<AdminAuditLogItem[]>('/admin/audit-logs'),
  getPlatformHealth: () => fetchJSON<AdminPlatformHealth>('/admin/platform-health'),
};
