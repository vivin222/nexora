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
  Skill
} from '../types';

const API_BASE = '/api';

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
};
