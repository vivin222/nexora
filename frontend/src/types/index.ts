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
  institution?: string;
  department?: string;
  academic_year?: string;
  bio: string;
  target_career_id: string;
  current_level: string;
  github_url?: string;
  portfolio_url?: string;
  weekly_hours?: number;
  learning_preferences?: string[];
  short_term_goal?: string;
  long_term_goal?: string;
  onboarding_completed?: boolean;
  is_demo?: boolean;
  interests: string[];
  certifications: string[];
  projects: Array<{ title: string; tech: string; description: string }>;
  skills: LearnerSkill[];
  skill_map: Record<string, number>;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  headline: string;
  onboarding_completed: boolean;
  is_demo: boolean;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
  onboarding_completed: boolean;
}

export interface OnboardingSubmitPayload {
  full_name: string;
  headline?: string;
  education_level: string;
  institution: string;
  department: string;
  academic_year: string;
  target_career_id: string;
  career_interests: string[];
  short_term_goal: string;
  long_term_goal: string;
  weekly_hours: number;
  learning_preferences: string[];
  skills: Array<{ skill_id: string; proficiency: number }>;
  frameworks_and_tools: string[];
  certifications: string[];
  projects: Array<{ title: string; tech: string; description: string }>;
  github_url: string;
  portfolio_url: string;
  resume_text?: string;
  resume_extracted_data?: any;
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

// Expanded Feature Interfaces
export interface CourseLesson {
  id: string;
  module_id: string;
  course_id: string;
  order_index: number;
  title: string;
  content_markdown: string;
  code_snippet?: string;
  key_takeaways?: string[];
  quiz_question?: {
    question?: string;
    options?: string[];
    correct_index?: number;
    explanation?: string;
  };
  estimated_minutes: number;
  completed?: boolean;
  bookmarked?: boolean;
}

export interface CourseModule {
  id: string;
  course_id: string;
  order_index: number;
  title: string;
  description: string;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  category: string;
  skill_id: string;
  skill_name?: string;
  difficulty_level: string;
  estimated_hours: number;
  description: string;
  thumbnail_icon: string;
  lesson_count?: number;
  completed_lessons?: number;
  progress_percentage?: number;
  modules?: CourseModule[];
}

export interface CodingProblem {
  id: string;
  slug: string;
  title: string;
  skill_id: string;
  skill_name?: string;
  difficulty: string;
  description: string;
  language: string;
  initial_code: string;
  test_cases?: Array<{
    input: string;
    expected_output: string;
    description: string;
  }>;
  hints?: string[];
}

export interface CodingSubmissionResult {
  submission_id: string;
  status: string;
  passed_tests: number;
  total_tests: number;
  feedback: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  order_index: number;
  title: string;
  objective: string;
  deliverable: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  target_career_id: string;
  career_title?: string;
  difficulty: string;
  description: string;
  architecture_markdown: string;
  required_skills: string[];
  deliverables: string[];
  milestones?: ProjectMilestone[];
  submission?: {
    id: string;
    github_url: string;
    live_demo_url: string;
    reflection_notes: string;
    status: string;
    grade_feedback: string;
    created_at: string;
  } | null;
}

export interface InterviewQuestion {
  id: string;
  career_id: string;
  category: string;
  difficulty: string;
  question_text: string;
  criteria_notes: string;
}

export interface InterviewEvaluationResult {
  answer_id: string;
  score: number;
  ai_feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface ResumeAnalysis {
  has_analysis?: boolean;
  analysis_id?: string;
  career_id?: string;
  filename?: string;
  match_percentage: number;
  detected_skills: string[];
  missing_skills: string[];
  actionable_feedback: string[];
  summary?: string;
  created_at?: string;
}

export interface WeeklyGoals {
  id: string;
  learner_id: string;
  target_hours: number;
  target_lessons: number;
  target_assessments: number;
  completed_hours: number;
  completed_lessons: number;
  completed_assessments: number;
  week_start_date: string;
  streak_days: number;
  overall_progress: number;
}

export interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  badge_icon: string;
  category: string;
  threshold_val: number;
  unlocked: number;
  unlocked_at?: string;
}

export interface Certificate {
  id: string;
  learner_id: string;
  title: string;
  issue_date: string;
  certificate_code: string;
  credential_url: string;
  criteria_description: string;
}

export interface CareerOpportunity {
  id: string;
  career_id: string;
  career_title?: string;
  company_name: string;
  role_title: string;
  location: string;
  role_type: string;
  salary_range: string;
  required_skills: string[];
  description: string;
  match_score?: number;
  is_demo?: number;
}
