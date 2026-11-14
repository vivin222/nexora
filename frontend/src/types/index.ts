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

export interface CareerMatchItem {
  career_id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  average_salary: string;
  growth_outlook: string;
  difficulty_level: string;
  match_score: number;
  fit_level: string;
  skill_matrix_score: number;
  interest_alignment_score: number;
  overlapping_skills: Array<{
    skill_id: string;
    skill_name: string;
    current_level: number;
    required_level: number;
  }>;
  critical_gaps: Array<{
    skill_id: string;
    skill_name: string;
    current_level: number;
    required_level: number;
    gap_percentage: number;
    importance_weight: number;
    why_it_matters?: string;
  }>;
  overlapping_skills_count: number;
  critical_gaps_count: number;
  estimated_weeks: number;
  match_rationale: string;
  is_active_target?: boolean;
}

export interface CareerDiscoveryResponse {
  status: string;
  top_matches: CareerMatchItem[];
  all_matches: CareerMatchItem[];
  missing_profile_data: string[];
  total_evaluated: number;
}

export interface CareerDiscoveryPayload {
  education_level?: string;
  department?: string;
  academic_year?: string;
  institution?: string;
  interests?: string[];
  skills?: Array<{ skill_id: string; proficiency: number }>;
  projects?: Array<{ title: string; tech: string; description: string }>;
  certifications?: string[];
  weekly_hours?: number;
  work_preference?: string;
  dream_roles?: string;
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
  role?: 'student' | 'admin';
  status?: 'pending' | 'approved' | 'rejected' | 'suspended' | 'inactive';
  rejection_reason?: string;
  education_level?: string;
  institution?: string;
  department?: string;
  graduation_year?: string;
  onboarding_completed: boolean;
  is_demo: boolean;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
  onboarding_completed: boolean;
  status?: string;
}

export interface AdminStats {
  total_students: number;
  new_registrations_today?: number;
  active_students?: number;
  pending_registrations?: number;
  approved_students: number;
  rejected_registrations?: number;
  suspended_students: number;
  assessment_submissions: number;
  coding_submissions?: number;
  project_submissions?: number;
  skill_gap_distribution: Record<string, number>;
  registration_trends: Array<{ date: string; count: number }>;
  recent_registrations?: Array<{
    id: string;
    email: string;
    full_name: string;
    status: string;
    institution?: string;
    department?: string;
    created_at: string;
    target_career_title?: string;
  }>;
}

export interface AdminStudentItem {
  id: string;
  email: string;
  full_name: string;
  headline: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'inactive';
  role: 'student' | 'admin';
  rejection_reason?: string;
  education_level?: string;
  institution?: string;
  department?: string;
  graduation_year?: string;
  target_career_id?: string;
  target_career_title?: string;
  onboarding_completed: boolean;
  created_at: string;
}

export interface AdminAuditLogItem {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  target_type: string;
  target_id: string;
  details: any;
  created_at: string;
}

export interface AdminResourceItem {
  id: string;
  skill_id: string;
  skill_name?: string;
  title: string;
  url: string;
  provider: string;
  resource_type: string;
  difficulty: string;
  estimated_duration: string;
  is_free: number | boolean;
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
  learning_streak?: {
    active_streak_days: number;
    longest_streak_days: number;
    week_dots: Array<{
      day: string;
      day_short: string;
      date: string;
      active: boolean;
      is_today?: boolean;
    }>;
    today_active: boolean;
    streak_freeze_available: boolean;
    recovery_mission: {
      title: string;
      estimated_minutes: number;
      target_tab: string;
    };
    qualifying_actions: string[];
  };
  next_best_action?: {
    task_title: string;
    focus_skill: string;
    direct_rationale: string;
    estimated_time: string;
    action_type: string;
    target_tab: string;
    target_id: string;
    impact_badge: string;
  };
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

export interface ActivityTimelineEvent {
  id: string;
  event_type: string;
  title: string;
  description: string;
  category: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CareerReadinessReport {
  learner_id: string;
  career_id: string;
  career_title: string;
  readiness_score: number;
  readiness_level: string;
  score_breakdown: {
    skill_matrix_score: number;
    project_portfolio_score: number;
    coding_competency_score: number;
    assessment_accuracy_score: number;
    completed_projects_count: number;
    coding_problems_passed: number;
    verified_skills_count: number;
  };
  formula_explanation: string;
  verified_skills_count: number;
  skill_gap_count: number;
  top_strengths: DetailedGap[];
  critical_gaps: DetailedGap[];
  recommended_sprints: Array<{
    sprint_number: number;
    focus_skill: string;
    objective: string;
    recommended_action: string;
  }>;
  estimated_weeks_to_market_ready: number;
}

export interface WeeklyGrowthReview {
  learner_id: string;
  week_start: string;
  hours_invested: number;
  target_hours: number;
  modules_completed: number;
  assessments_completed: number;
  average_assessment_score: number;
  streak_days: number;
  velocity_indicator: string;
  neglected_skills: string[];
  ai_sprint_actions: Array<{
    priority: string;
    title: string;
    estimated_time: string;
    impact: string;
  }>;
}

export interface AdminPlatformHealth {
  status: string;
  database_status: string;
  total_registered_learners: number;
  active_students: number;
  admin_accounts: number;
  total_assessments_taken: number;
  total_coding_solutions: number;
  total_project_milestones: number;
  ai_agent_status: string;
  model_version: string;
}

export interface WeeklyMission {
  id: string;
  learner_id: string;
  objective: string;
  estimated_duration: string;
  difficulty: string;
  target_skill_id: string;
  target_skill_name: string;
  completion_criteria: string;
  action_type: 'coding_lab' | 'lesson' | 'project' | 'simulator';
  action_target_slug: string;
  status: 'active' | 'completed';
  completed_at?: string;
  evidence_summary?: string;
  created_at: string;
}

export interface WeeklyMissionsResponse {
  missions: WeeklyMission[];
  weekly_hours_allocated: number;
  total_missions: number;
  completed_missions: number;
  completion_percentage: number;
}

export interface WorkplaceScenarioOption {
  id: string;
  title: string;
  description: string;
}

export interface WorkplaceScenario {
  id: string;
  role_slug: string;
  role_title: string;
  title: string;
  context_markdown: string;
  evidence_data: string;
  technical_challenge: string;
  options: WorkplaceScenarioOption[];
  difficulty: string;
  target_skill_id: string;
  latest_submission?: {
    score: number;
    selected_action: string;
    created_at: string;
  } | null;
}

export interface WorkplaceScenarioSubmissionResult {
  submission_id: string;
  scenario_id: string;
  score: number;
  passed: boolean;
  feedback: string;
  competency_growth: string;
  optimal_action: string;
  target_skill_id: string;
}

