export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface LearnerSkill {
  skill_id: string;
  proficiency: number;
  verified: number;
  name: string;
  category: string;
}

export interface CareerRequirement {
  id: string;
  career_id: string;
  skill_id: string;
  required_level: number;
  importance_weight: number;
  why_it_matters: string;
  skill_name: string;
  skill_category: string;
}

export interface CareerRole {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  average_salary: string;
  growth_outlook: string;
  difficulty_level: string;
  requirements?: CareerRequirement[];
}

export interface DetailedGap {
  skill_id: string;
  skill_name: string;
  current_level: number;
  required_level: number;
  importance_weight: number;
  gap: number;
  gap_percentage: number;
  why_it_matters: string;
  status: 'missing' | 'weak' | 'strong';
}

export interface SkillAnalysis {
  career_id: string;
  overall_score: number;
  strengths: DetailedGap[];
  weaknesses: DetailedGap[];
  missing_skills: DetailedGap[];
  detailed_gaps: DetailedGap[];
  summary: string;
}

export interface Milestone {
  id: string;
  roadmap_id: string;
  order_index: number;
  skill_id: string;
  skill_name?: string;
  title: string;
  objective: string;
  resource_type: string;
  estimated_hours: number;
  status: 'pending' | 'in_progress' | 'completed';
  completed_at?: string | null;
}

export interface Roadmap {
  id: string;
  learner_id: string;
  career_id: string;
  title: string;
  description: string;
  total_milestones: number;
  completed_milestones: number;
  progress_percentage: number;
  milestones: Milestone[];
}

export interface AssessmentQuestion {
  id: string;
  question_text: string;
  options: string[];
  weight?: number;
}

export interface Assessment {
  id: string;
  title: string;
  skill_id: string;
  skill_name?: string;
  skill_category?: string;
  career_id?: string;
  difficulty: string;
  description: string;
  question_count?: number;
  last_result?: {
    score: number;
    total_questions: number;
    percentage: number;
    passed: number;
    created_at: string;
  } | null;
  questions?: AssessmentQuestion[];
}

export interface QuestionBreakdown {
  question_id: string;
  question_text: string;
  options: string[];
  user_selected: number;
  correct_option_index: number;
  is_correct: boolean;
  explanation: string;
}

export interface AssessmentResult {
  result_id: string;
  assessment_id: string;
  assessment_title: string;
  skill_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  new_proficiency: number;
  feedback: string;
  breakdown: QuestionBreakdown[];
}

export interface LearnerProfile {
  learner_id: string;
  full_name: string;
  email: string;
  headline: string;
  education: string;
  bio: string;
  target_career_id: string;
  current_level: string;
  interests: string[];
  certifications: string[];
  projects: Array<{ title: string; tech: string; description: string }>;
  skills: LearnerSkill[];
  skill_map: Record<string, number>;
}

export interface AgentLog {
  id: string;
  learner_id: string;
  agent_name: string;
  action: string;
  input_summary: string;
  output_summary: string;
  execution_time_ms: number;
  status: string;
  created_at: string;
}

export interface MentorMessage {
  id: string;
  sender: 'user' | 'mentor' | 'system';
  message: string;
  created_at?: string;
  metadata_json?: string;
}

export interface ProgressOverview {
  career: {
    title: string;
    average_salary: string;
    growth_outlook: string;
    match_score: number;
    readiness_band: string;
    strategic_advice: string;
    top_blockers: string[];
  };
  overall_readiness_score: number;
  strengths_count: number;
  weaknesses_count: number;
  missing_count: number;
  roadmap_total: number;
  roadmap_completed: number;
  roadmap_progress_percentage: number;
  chart_data: Array<{
    skill: string;
    current: number;
    required: number;
    gap: number;
  }>;
  recent_assessments: any[];
  recent_activity: Array<{
    id: string;
    event_type: string;
    description: string;
    metric_name: string;
    new_value: number;
    created_at: string;
  }>;
}
