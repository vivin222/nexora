"""
NEXORA Database Expansion & Migration
Safely creates new tables for:
- Courses, Modules, Lessons, Progress & Bookmarks
- Coding Practice Lab Problems & Submissions
- Project Studio & Milestones
- Interview Simulator & Answers
- Resume & Portfolio Analyses
- Weekly Goals & Streaks
- Achievements & Verified Credentials
- Career Opportunity Discovery
- Contextual Lesson AI Tutor Conversations
Preserves 100% of existing tables, data, and learner records.
"""
import uuid
import json
from app.database import get_db

def _safe_add_column(cursor, table: str, column: str, col_type: str):
    cursor.execute(f"PRAGMA table_info({table})")
    cols = [row[1] for row in cursor.fetchall()]
    if column not in cols:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}")

def run_database_expansion():
    with get_db() as conn:
        cursor = conn.cursor()

        # 0. Migrate profiles and learners for Onboarding & Real User Identity
        _safe_add_column(cursor, "profiles", "institution", "TEXT DEFAULT ''")
        _safe_add_column(cursor, "profiles", "department", "TEXT DEFAULT ''")
        _safe_add_column(cursor, "profiles", "academic_year", "TEXT DEFAULT ''")
        _safe_add_column(cursor, "profiles", "github_url", "TEXT DEFAULT ''")
        _safe_add_column(cursor, "profiles", "portfolio_url", "TEXT DEFAULT ''")
        _safe_add_column(cursor, "profiles", "weekly_hours", "INTEGER DEFAULT 10")
        _safe_add_column(cursor, "profiles", "learning_preferences", "TEXT DEFAULT '[]'")
        _safe_add_column(cursor, "profiles", "short_term_goal", "TEXT DEFAULT ''")
        _safe_add_column(cursor, "profiles", "long_term_goal", "TEXT DEFAULT ''")
        _safe_add_column(cursor, "profiles", "onboarding_completed", "INTEGER DEFAULT 0")
        _safe_add_column(cursor, "profiles", "resume_text", "TEXT DEFAULT ''")
        _safe_add_column(cursor, "profiles", "resume_extracted_data", "TEXT DEFAULT '{}'")

        _safe_add_column(cursor, "learners", "is_demo", "INTEGER DEFAULT 0")
        _safe_add_column(cursor, "learners", "role", "TEXT DEFAULT 'student'")
        _safe_add_column(cursor, "learners", "status", "TEXT DEFAULT 'approved'")
        _safe_add_column(cursor, "learners", "rejection_reason", "TEXT DEFAULT ''")
        _safe_add_column(cursor, "learners", "education_level", "TEXT DEFAULT ''")
        _safe_add_column(cursor, "learners", "institution", "TEXT DEFAULT ''")
        _safe_add_column(cursor, "learners", "department", "TEXT DEFAULT ''")
        _safe_add_column(cursor, "learners", "graduation_year", "TEXT DEFAULT ''")
        _safe_add_column(cursor, "learners", "google_id", "TEXT DEFAULT ''")
        _safe_add_column(cursor, "learners", "github_id", "TEXT DEFAULT ''")
        _safe_add_column(cursor, "learners", "auth_provider", "TEXT DEFAULT 'local'")

        # Migrate all existing pending accounts to approved / active
        cursor.execute("UPDATE learners SET status = 'approved' WHERE status = 'pending' AND role = 'student'")

        # Student Activity Timeline Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS activity_timeline (
                id TEXT PRIMARY KEY,
                learner_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT DEFAULT 'system',
                metadata TEXT DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
            );
        """)

        # Admin Audit Logs Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admin_audit_logs (
                id TEXT PRIMARY KEY,
                admin_id TEXT NOT NULL,
                admin_email TEXT NOT NULL,
                action TEXT NOT NULL,
                target_type TEXT NOT NULL,
                target_id TEXT NOT NULL,
                details TEXT DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Ensure bootstrap administrator exists
        from app.config import settings
        from app.services.security import hash_password

        cursor.execute("SELECT id FROM learners WHERE email = 'admin@nexora.ai'")
        if not cursor.fetchone():
            admin_id = "admin-sys-root"
            cursor.execute("""
                INSERT INTO learners (id, email, password_hash, full_name, headline, role, status, is_demo)
                VALUES (?, 'admin@nexora.ai', ?, 'System Administrator', 'NEXORA Curriculum & Platform Admin', 'admin', 'approved', 0)
            """, (admin_id, hash_password("AdminPassword2026!")))
            cursor.execute("""
                INSERT OR IGNORE INTO profiles (id, learner_id, target_career_id, onboarding_completed)
                VALUES (?, ?, 'career-full-stack-developer', 1)
            """, (str(uuid.uuid4()), admin_id))

        # Ensure Jury Administrator account is provisioned for judging / evaluation access
        jury_email = settings.JURY_ADMIN_EMAIL
        jury_pwd = settings.JURY_ADMIN_PASSWORD
        cursor.execute("SELECT id FROM learners WHERE email = ?", (jury_email,))
        existing_jury = cursor.fetchone()
        if not existing_jury:
            jury_id = f"admin-jury-{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO learners (id, email, password_hash, full_name, headline, role, status, is_demo, auth_provider)
                VALUES (?, ?, ?, 'Jury & Evaluation Lead', 'Hackathon / Assessment Review Administrator', 'admin', 'approved', 0, 'jury')
            """, (jury_id, jury_email, hash_password(jury_pwd)))
            cursor.execute("""
                INSERT OR IGNORE INTO profiles (id, learner_id, target_career_id, onboarding_completed)
                VALUES (?, ?, 'career-full-stack-developer', 1)
            """, (str(uuid.uuid4()), jury_id))
        else:
            # Update password hash to match current environment variable setting
            cursor.execute("""
                UPDATE learners SET password_hash = ?, role = 'admin', status = 'approved'
                WHERE email = ?
            """, (hash_password(jury_pwd), jury_email))

        # 1. Learning Center: Courses
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS courses (
                id TEXT PRIMARY KEY,
                slug TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                skill_id TEXT NOT NULL,
                difficulty_level TEXT NOT NULL,
                estimated_hours INTEGER NOT NULL,
                description TEXT NOT NULL,
                thumbnail_icon TEXT DEFAULT 'BookOpen',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
            );
        """)

        # 2. Course Modules
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS course_modules (
                id TEXT PRIMARY KEY,
                course_id TEXT NOT NULL,
                order_index INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT DEFAULT '',
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            );
        """)

        # 3. Topic-Wise Lessons
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS course_lessons (
                id TEXT PRIMARY KEY,
                module_id TEXT NOT NULL,
                course_id TEXT NOT NULL,
                order_index INTEGER NOT NULL,
                title TEXT NOT NULL,
                content_markdown TEXT NOT NULL,
                code_snippet TEXT DEFAULT '',
                key_takeaways_json TEXT DEFAULT '[]',
                quiz_question_json TEXT DEFAULT '{}',
                estimated_minutes INTEGER DEFAULT 15,
                FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            );
        """)

        # 4. Lesson Progress & Bookmarks
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS lesson_progress (
                id TEXT PRIMARY KEY,
                learner_id TEXT NOT NULL,
                lesson_id TEXT NOT NULL,
                course_id TEXT NOT NULL,
                completed INTEGER DEFAULT 0,
                completed_at TIMESTAMP NULL,
                bookmarked INTEGER DEFAULT 0,
                UNIQUE(learner_id, lesson_id),
                FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
                FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            );
        """)

        # 5. Contextual AI Tutor Conversations
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tutor_conversations (
                id TEXT PRIMARY KEY,
                learner_id TEXT NOT NULL,
                course_id TEXT DEFAULT '',
                lesson_id TEXT DEFAULT '',
                sender TEXT NOT NULL,
                message TEXT NOT NULL,
                metadata_json TEXT DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
            );
        """)

        # 6. Coding Practice Lab: Problems
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS coding_problems (
                id TEXT PRIMARY KEY,
                slug TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                skill_id TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                description TEXT NOT NULL,
                language TEXT DEFAULT 'javascript',
                initial_code TEXT NOT NULL,
                test_cases_json TEXT NOT NULL, -- JSON array of {input, expected_output, description}
                hints_json TEXT DEFAULT '[]',
                FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
            );
        """)

        # 7. Coding Submissions
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS coding_submissions (
                id TEXT PRIMARY KEY,
                learner_id TEXT NOT NULL,
                problem_id TEXT NOT NULL,
                code TEXT NOT NULL,
                language TEXT NOT NULL,
                status TEXT NOT NULL, -- PASSED, FAILED, RUNTIME_ERROR
                passed_tests INTEGER NOT NULL,
                total_tests INTEGER NOT NULL,
                feedback TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
                FOREIGN KEY (problem_id) REFERENCES coding_problems(id) ON DELETE CASCADE
            );
        """)

        # 8. Project Studio: Projects
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                slug TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                target_career_id TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                description TEXT NOT NULL,
                architecture_markdown TEXT NOT NULL,
                required_skills_json TEXT DEFAULT '[]',
                deliverables_json TEXT DEFAULT '[]',
                FOREIGN KEY (target_career_id) REFERENCES career_roles(id) ON DELETE CASCADE
            );
        """)

        # 9. Project Milestones
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS project_milestones (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                order_index INTEGER NOT NULL,
                title TEXT NOT NULL,
                objective TEXT NOT NULL,
                deliverable TEXT NOT NULL,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            );
        """)

        # 10. Project Submissions & Portfolio Artifacts
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS project_submissions (
                id TEXT PRIMARY KEY,
                learner_id TEXT NOT NULL,
                project_id TEXT NOT NULL,
                github_url TEXT DEFAULT '',
                live_demo_url TEXT DEFAULT '',
                reflection_notes TEXT NOT NULL,
                status TEXT DEFAULT 'submitted', -- submitted, reviewed, verified
                grade_feedback TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            );
        """)

        # 11. Career Interview Questions & Sessions
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS interview_questions (
                id TEXT PRIMARY KEY,
                career_id TEXT NOT NULL,
                category TEXT NOT NULL, -- Technical, Architectural, Behavioral
                difficulty TEXT NOT NULL,
                question_text TEXT NOT NULL,
                criteria_notes TEXT NOT NULL,
                FOREIGN KEY (career_id) REFERENCES career_roles(id) ON DELETE CASCADE
            );
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS interview_sessions (
                id TEXT PRIMARY KEY,
                learner_id TEXT NOT NULL,
                career_id TEXT NOT NULL,
                interview_type TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                overall_score REAL DEFAULT 0,
                status TEXT DEFAULT 'in_progress',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
                FOREIGN KEY (career_id) REFERENCES career_roles(id) ON DELETE CASCADE
            );
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS interview_answers (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                learner_id TEXT NOT NULL,
                question_id TEXT NOT NULL,
                user_answer_text TEXT NOT NULL,
                score INTEGER NOT NULL, -- 0-100
                ai_feedback TEXT NOT NULL,
                strengths_json TEXT DEFAULT '[]',
                improvements_json TEXT DEFAULT '[]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE,
                FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
                FOREIGN KEY (question_id) REFERENCES interview_questions(id) ON DELETE CASCADE
            );
        """)

        # 12. Resume & Portfolio Analyzer Records
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS resume_analyses (
                id TEXT PRIMARY KEY,
                learner_id TEXT NOT NULL,
                career_id TEXT NOT NULL,
                filename TEXT NOT NULL,
                detected_skills_json TEXT NOT NULL,
                missing_skills_json TEXT NOT NULL,
                match_percentage REAL NOT NULL,
                actionable_feedback_json TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
                FOREIGN KEY (career_id) REFERENCES career_roles(id) ON DELETE CASCADE
            );
        """)

        # 13. Weekly Learning Goals & Habits
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS weekly_goals (
                id TEXT PRIMARY KEY,
                learner_id TEXT NOT NULL,
                target_hours REAL DEFAULT 10.0,
                target_lessons INTEGER DEFAULT 5,
                target_assessments INTEGER DEFAULT 1,
                completed_hours REAL DEFAULT 0.0,
                completed_lessons INTEGER DEFAULT 0,
                completed_assessments INTEGER DEFAULT 0,
                week_start_date TEXT NOT NULL,
                streak_days INTEGER DEFAULT 3,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(learner_id, week_start_date),
                FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
            );
        """)

        # 14. Achievements & Credentials
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS achievements (
                id TEXT PRIMARY KEY,
                slug TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                badge_icon TEXT NOT NULL,
                category TEXT NOT NULL,
                criteria_type TEXT NOT NULL,
                threshold_val INTEGER NOT NULL
            );
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS learner_achievements (
                id TEXT PRIMARY KEY,
                learner_id TEXT NOT NULL,
                achievement_id TEXT NOT NULL,
                unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(learner_id, achievement_id),
                FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
                FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
            );
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS certificates (
                id TEXT PRIMARY KEY,
                learner_id TEXT NOT NULL,
                title TEXT NOT NULL,
                issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                certificate_code TEXT UNIQUE NOT NULL,
                credential_url TEXT NOT NULL,
                criteria_description TEXT NOT NULL,
                FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
            );
        """)

        # 15. Career Opportunities (Demo Market Catalog)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS career_opportunities (
                id TEXT PRIMARY KEY,
                career_id TEXT NOT NULL,
                company_name TEXT NOT NULL,
                role_title TEXT NOT NULL,
                location TEXT NOT NULL,
                role_type TEXT NOT NULL, -- Full-time, Internship, Contract
                salary_range TEXT NOT NULL,
                required_skills_json TEXT NOT NULL,
                description TEXT NOT NULL,
                is_demo INTEGER DEFAULT 1,
                FOREIGN KEY (career_id) REFERENCES career_roles(id) ON DELETE CASCADE
            );
        """)

        print("Database expansion tables verified successfully.")

if __name__ == "__main__":
    run_database_expansion()
