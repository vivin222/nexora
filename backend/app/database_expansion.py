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
        _safe_add_column(cursor, "profiles", "portfolio_is_public", "INTEGER DEFAULT 0")
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

        _safe_add_column(cursor, "learner_skills", "verification_source", "TEXT DEFAULT 'self'")
        _safe_add_column(cursor, "assessment_results", "status", "TEXT DEFAULT 'completed'")
        _safe_add_column(cursor, "assessment_results", "misconceptions_json", "TEXT DEFAULT '[]'")

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

        # Ensure canonical benchmark student records exist for institutional oversight
        benchmark_students = [
            ("learner-alex-mercer", "alex.mercer@nexora.ai", "Alex Mercer", "Senior CS Undergraduate | Aspiring Full Stack Architect", "Undergraduate", "Stanford University", "Computer Science", "2026", "career-full-stack-developer"),
            ("learner-sarah-chen", "sarah.chen@mit.edu", "Sarah Chen", "Graduate Researcher | Deep Learning & LLM Systems", "Postgraduate", "Massachusetts Institute of Technology", "Electrical Engineering & Computer Science", "2026", "career-ai-ml-engineer"),
            ("learner-marcus-vance", "marcus.vance@berkeley.edu", "Marcus Vance", "Distributed Systems & Cloud Platform Engineer", "Undergraduate", "UC Berkeley", "Computer Science", "2025", "career-cloud-devops-architect")
        ]
        for sid, semail, sname, sheadline, sedu, sinst, sdept, sgrad, scid in benchmark_students:
            cursor.execute("SELECT id FROM learners WHERE email = ?", (semail,))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO learners (id, email, password_hash, full_name, headline, role, status, education_level, institution, department, graduation_year, is_demo)
                    VALUES (?, ?, ?, ?, ?, 'student', 'approved', ?, ?, ?, ?, 1)
                """, (sid, semail, hash_password("Password123!"), sname, sheadline, sedu, sinst, sdept, sgrad))
                cursor.execute("""
                    INSERT OR IGNORE INTO profiles (id, learner_id, target_career_id, education, institution, department, academic_year, onboarding_completed)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
                """, (str(uuid.uuid4()), sid, scid, sedu, sinst, sdept, sgrad))

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
        _safe_add_column(cursor, "career_opportunities", "verified_source", "TEXT DEFAULT 'Major League Hacking / Linux Foundation'")
        _safe_add_column(cursor, "career_opportunities", "verification_date", "TEXT DEFAULT '2026-11-10'")
        _safe_add_column(cursor, "career_opportunities", "eligibility_criteria", "TEXT DEFAULT 'Enrolled undergraduate or early-career self-taught developer'")
        _safe_add_column(cursor, "career_opportunities", "application_url", "TEXT DEFAULT 'https://github.com/tech-internships'")

        # 16. AI-Adaptive Weekly Missions
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS weekly_missions (
                id TEXT PRIMARY KEY,
                learner_id TEXT NOT NULL,
                objective TEXT NOT NULL,
                estimated_duration TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                target_skill_id TEXT NOT NULL,
                target_skill_name TEXT NOT NULL,
                completion_criteria TEXT NOT NULL,
                action_type TEXT NOT NULL, -- 'coding_lab', 'lesson', 'project', 'simulator'
                action_target_slug TEXT NOT NULL,
                status TEXT DEFAULT 'active', -- 'active', 'completed'
                completed_at TIMESTAMP NULL,
                evidence_summary TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
            );
        """)

        # 17. Practical Workplace Career Simulator Scenarios
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS workplace_scenarios (
                id TEXT PRIMARY KEY,
                role_slug TEXT NOT NULL, -- software-engineer, data-analyst, ai-ml-engineer, cyber-defense, ui-ux-designer
                role_title TEXT NOT NULL,
                title TEXT NOT NULL,
                context_markdown TEXT NOT NULL,
                evidence_data TEXT NOT NULL,
                technical_challenge TEXT NOT NULL,
                options_json TEXT NOT NULL,
                rubric_json TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                target_skill_id TEXT NOT NULL
            );
        """)

        # 18. Workplace Scenario Submissions
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS workplace_scenario_submissions (
                id TEXT PRIMARY KEY,
                learner_id TEXT NOT NULL,
                scenario_id TEXT NOT NULL,
                selected_action TEXT NOT NULL,
                rationale_text TEXT NOT NULL,
                score INTEGER NOT NULL,
                evaluation_rubric_json TEXT NOT NULL,
                competency_growth_feedback TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
                FOREIGN KEY (scenario_id) REFERENCES workplace_scenarios(id) ON DELETE CASCADE
            );
        """)

        # 19. Ensure Canonical Master Skills, Roles, and Complete Skill Requirements
        _seed_canonical_knowledge_graph(cursor)
        _seed_workplace_scenarios(cursor)

        # High-Performance Indexes for Expanded Features
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_weekly_missions_learner ON weekly_missions(learner_id, status);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workplace_scenarios_slug ON workplace_scenarios(role_slug);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_workplace_subs_learner ON workplace_scenario_submissions(learner_id, scenario_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_learner_achievements_learner ON learner_achievements(learner_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_weekly_goals_learner ON weekly_goals(learner_id);")

        print("Database expansion tables verified successfully.")

def _seed_canonical_knowledge_graph(cursor):
    # Expanded skills
    extra_skills = [
        ("skill-kubernetes", "Kubernetes & Container Orchestration", "DevOps & Cloud", "Deploying, scaling, and managing containerized applications with K8s manifests, helm charts, and service meshes."),
        ("skill-machine-learning", "Machine Learning & Model Training", "Artificial Intelligence", "Supervised and unsupervised model training, deep neural networks, transformer evaluation, and feature engineering."),
        ("skill-cloud-aws-gcp", "Cloud Architecture (AWS / GCP)", "DevOps & Cloud", "Designing highly available, fault-tolerant cloud systems using managed compute, IAM policies, and VPC networking."),
        ("skill-cybersecurity", "Application Security & Zero Trust", "Security & Cyber", "Threat modeling, OWASP Top 10 mitigation, token cryptographic verification, and least-privilege security."),
        ("skill-data-pipelines", "Data Engineering & ETL Pipelines", "Data & Storage", "Designing streaming and batch data pipelines, data lakehouses, schema migrations, and idempotent data contracts.")
    ]
    cursor.executemany("""
        INSERT OR IGNORE INTO skills (id, name, category, description)
        VALUES (?, ?, ?, ?)
    """, extra_skills)

    # Expanded career roles
    extra_careers = [
        (
            "career-data-engineer",
            "data-engineer",
            "Data & AI Platform Engineer",
            "Data & Storage",
            "Builds high-throughput ingestion pipelines, analytical data warehouses, and reliable feature stores for enterprise intelligence.",
            "$140,000 - $180,000",
            "+28% (Very High Demand)",
            "Advanced"
        ),
        (
            "career-cybersecurity-engineer",
            "cybersecurity-engineer",
            "Cyber Defense & Security Engineer",
            "Security & Cyber",
            "Protects critical infrastructure, audits vulnerability vectors, enforces zero-trust architectures, and hardens application boundaries.",
            "$135,000 - $175,000",
            "+32% (Explosive Growth)",
            "Advanced"
        )
    ]
    cursor.executemany("""
        INSERT OR IGNORE INTO career_roles (id, slug, title, category, description, average_salary, growth_outlook, difficulty_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, extra_careers)

    # Complete Requirements for all career roles
    requirements = [
        # Full Stack Developer
        ("career-full-stack-developer", "skill-javascript", 5.0, 85, "Primary runtime and language for interactive UI and backend runtime compatibility."),
        ("career-full-stack-developer", "skill-react", 4.5, 80, "Component state management, hook architectures, and reactive client rendering."),
        ("career-full-stack-developer", "skill-nodejs", 4.0, 75, "Server-side asynchronous API execution and session handling."),
        ("career-full-stack-developer", "skill-python", 4.0, 75, "Robust backend business logic, scripting, and modular services."),
        ("career-full-stack-developer", "skill-sql", 4.5, 80, "Relational data modeling, ACID transactions, and query optimization."),
        ("career-full-stack-developer", "skill-html-css", 3.5, 80, "Semantic structure, responsive CSS layout engines, and a11y standards."),
        ("career-full-stack-developer", "skill-git", 3.5, 75, "Collaborative Git branches, code reviews, and CI automation."),
        ("career-full-stack-developer", "skill-docker", 3.0, 65, "Container encapsulation ensuring local and production environment parity."),

        # AI / ML Engineer
        ("career-ai-ml-engineer", "skill-python", 5.0, 95, "Foundational language for scientific computing, model architectures, and LLM frameworks."),
        ("career-ai-ml-engineer", "skill-machine-learning", 5.0, 90, "Supervised training, transformer models, evaluation metrics, and fine-tuning."),
        ("career-ai-ml-engineer", "skill-fastapi", 4.5, 85, "High-throughput asynchronous model inference endpoints and validation."),
        ("career-ai-ml-engineer", "skill-sql", 4.0, 80, "Dataset extraction, cleaning, feature transformation, and embeddings retrieval."),
        ("career-ai-ml-engineer", "skill-docker", 4.0, 75, "Isolated container environments for GPU inference runtimes and reproducible models."),
        ("career-ai-ml-engineer", "skill-system-design", 4.5, 85, "Vector database architectures, semantic search retrieval, and low-latency caching."),
        ("career-ai-ml-engineer", "skill-git", 3.0, 75, "Experiment tracking, model weights version control, and team collaboration."),

        # Cloud DevOps Architect
        ("career-cloud-devops-architect", "skill-docker", 5.0, 90, "Containerization, minimal base images, multi-stage builds, and microservices."),
        ("career-cloud-devops-architect", "skill-cloud-aws-gcp", 5.0, 90, "VPC networking, managed cloud infrastructure, and IAM security policies."),
        ("career-cloud-devops-architect", "skill-kubernetes", 4.5, 85, "Cluster orchestration, ingress controllers, autoscaling, and helm deployments."),
        ("career-cloud-devops-architect", "skill-system-design", 4.5, 85, "Fault-tolerant distributed topologies, disaster recovery, and observability."),
        ("career-cloud-devops-architect", "skill-git", 4.0, 85, "CI/CD automated test suites, GitOps deployment pipelines, and release gates."),
        ("career-cloud-devops-architect", "skill-python", 3.5, 75, "Automation scripts, CLI tooling, and infrastructure-as-code automation."),
        ("career-cloud-devops-architect", "skill-sql", 3.0, 70, "Database clustering, read replica configuration, and backup durability."),

        # Frontend Engineer
        ("career-frontend-engineer", "skill-react", 5.0, 95, "Advanced component composition, custom hooks, and high-performance rendering."),
        ("career-frontend-engineer", "skill-typescript", 5.0, 90, "Type safety, compile-time contract enforcement, and maintainable large-scale codebases."),
        ("career-frontend-engineer", "skill-javascript", 4.5, 90, "Deep knowledge of the event loop, async programming, browser DOM, and memory."),
        ("career-frontend-engineer", "skill-html-css", 4.5, 95, "Semantic HTML5, CSS Grid/Flexbox layouts, responsive design, and WCAG accessibility."),
        ("career-frontend-engineer", "skill-tailwind", 4.0, 85, "Design system execution, utility styling, and design token integration."),
        ("career-frontend-engineer", "skill-git", 3.5, 80, "Pull request hygiene, feature branches, and semantic versioning."),
        ("career-frontend-engineer", "skill-system-design", 3.5, 70, "Client-side caching, bundle optimization, SSR/SSG, and CDN edge delivery."),

        # Data & AI Platform Engineer
        ("career-data-engineer", "skill-python", 5.0, 90, "Data manipulation, automated batch jobs, and workflow orchestration."),
        ("career-data-engineer", "skill-sql", 5.0, 95, "Advanced analytical queries, window functions, partitioning, and relational schemas."),
        ("career-data-engineer", "skill-data-pipelines", 5.0, 90, "Idempotent ETL pipelines, event streaming, data contracts, and DAG schedulers."),
        ("career-data-engineer", "skill-docker", 4.0, 80, "Containerized data workers, reproducible environments, and batch runners."),
        ("career-data-engineer", "skill-cloud-aws-gcp", 4.0, 80, "Cloud data warehouses (BigQuery, Redshift, Snowflake) and distributed object storage."),
        ("career-data-engineer", "skill-system-design", 4.0, 80, "Data lakehouse architectures, schema evolution, and high-throughput streaming."),
        ("career-data-engineer", "skill-git", 3.0, 75, "Data pipeline CI/CD and dbt schema versioning."),

        # Cyber Defense & Security Engineer
        ("career-cybersecurity-engineer", "skill-cybersecurity", 5.0, 95, "Vulnerability research, threat modeling, OWASP defense, and zero-trust verification."),
        ("career-cybersecurity-engineer", "skill-system-design", 4.5, 85, "Secure architecture design, network segmentation, and identity federation."),
        ("career-cybersecurity-engineer", "skill-python", 4.0, 80, "Automated security scanning, forensic log parsing, and exploit remediation."),
        ("career-cybersecurity-engineer", "skill-docker", 4.0, 80, "Container security hardening, vulnerability scanning, and minimal attack surfaces."),
        ("career-cybersecurity-engineer", "skill-cloud-aws-gcp", 4.0, 80, "Least-privilege cloud IAM, security groups, audit trails, and compliance monitoring."),
        ("career-cybersecurity-engineer", "skill-git", 3.5, 75, "Secret detection in repositories and DevSecOps automated pipeline gates.")
    ]

    for career_id, skill_id, weight, level, why in requirements:
        # Guard against foreign key violations in case parents are missing
        cursor.execute("SELECT 1 FROM career_roles WHERE id = ?", (career_id,))
        if not cursor.fetchone():
            continue
        cursor.execute("SELECT 1 FROM skills WHERE id = ?", (skill_id,))
        if not cursor.fetchone():
            continue

        req_id = f"req-{career_id.replace('career-', '')}-{skill_id.replace('skill-', '')}"
        cursor.execute("""
            INSERT OR IGNORE INTO career_skill_requirements (id, career_id, skill_id, importance_weight, required_level, why_it_matters)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (req_id, career_id, skill_id, weight, level, why))

def _seed_workplace_scenarios(cursor):
    scenarios = [
        (
            "sim-swe-query-opt",
            "software-engineer",
            "Staff Software Engineer",
            "Production Outage: Sluggish Database Query & Connection Pool Exhaustion",
            "E-Commerce checkout endpoint latency spiked from 45ms to 8,200ms during flash sale. The database connection pool is 98% saturated, throwing HTTP 504 Gateway Timeouts. An unindexed multi-table JOIN on `orders` and `order_items` is performing sequential scans over 4.2 million rows.",
            "EXPLAIN ANALYZE SELECT o.id, o.customer_id, SUM(i.price * i.quantity) FROM orders o JOIN order_items i ON o.id = i.order_id WHERE o.created_at >= '2026-11-01' AND o.status = 'paid' GROUP BY o.id;\n\nResult:\n-> Hash Aggregate (cost=94200.50..95800.00)\n  -> Seq Scan on orders o (cost=0.00..89240.50 rows=4210000 width=128)\n     Filter: (status = 'paid' AND created_at >= '2026-11-01')\n     Rows Removed by Filter: 3980000\n  -> Hash (cost=3400.00..3400.00)\n     -> Seq Scan on order_items i (cost=0.00..3400.00 rows=180000 width=24)",
            "Diagnose root bottleneck and determine the most effective combination of immediate production mitigation and long-term architectural resolution.",
            json.dumps([
                {
                    "id": "action-composite-index",
                    "title": "Create Partial Composite Index & Pool Tuning",
                    "description": "Deploy concurrent index: CREATE INDEX CONCURRENTLY idx_orders_paid_recent ON orders (created_at, status) WHERE status = 'paid'; increase pool max_connections by 25% with aggressive checkout statement timeout (2000ms)."
                },
                {
                    "id": "action-cache-redis",
                    "title": "Cache Raw Query in Redis with 5s TTL",
                    "description": "Wrap the checkout query in Redis cache with 5s expiration to absorb flash traffic without changing database indexes."
                },
                {
                    "id": "action-vertical-scale",
                    "title": "Immediately Double DB Instance CPU and RAM",
                    "description": "Trigger AWS RDS instant failover to an 8x.large instance to brute-force the sequential scans with high memory."
                }
            ]),
            json.dumps({
                "optimal_action": "action-composite-index",
                "rubric": {
                    "action-composite-index": {"score": 95, "feedback": "Superb engineering decision. A partial composite index on (created_at, status) where status='paid' converts a 4.2M-row Seq Scan into an Index Range Scan (~12ms). Concurrent creation prevents table locking, and query timeouts protect pool starvation."},
                    "action-cache-redis": {"score": 50, "feedback": "Dangerous partial band-aid. Caching checkout state risks stale order processing or inventory race conditions, and misses new unique order lookups causing cache stampedes."},
                    "action-vertical-scale": {"score": 30, "feedback": "Expensive anti-pattern. Scaling compute masked an algorithmic $O(N)$ sequential scan; query volume would saturate larger hardware within minutes while causing downtime during instance resize."}
                }
            }),
            "Advanced",
            "skill-sql"
        ),
        (
            "sim-da-churn-cohort",
            "data-analyst",
            "Senior Data Analyst & Platform BI",
            "SaaS Enterprise Churn Investigation: Multi-Table Cohort Analysis",
            "Q3 enterprise churn increased by 3.8% across EMEA accounts. Executive leadership wants to know whether this is correlated with the recent v2.4 API deprecation, contract renewal cycles, or lower product usage frequency.",
            "Schema: accounts (id, tier, region, renewal_date), usage_telemetry (account_id, endpoint, error_rate, weekly_sessions), support_tickets (account_id, tag, escalated).\n\nKey finding: 78% of churned EMEA accounts logged >45 HTTP 410 Gone errors on deprecated `/v1/sync` endpoint in the 30 days prior to non-renewal. Escalated support tickets for this cohort were 4.1x higher.",
            "Formulate an analytical data conclusion and recommend the high-leverage business and retention intervention for executive leadership.",
            json.dumps([
                {
                    "id": "action-cohort-migration-tiger-team",
                    "title": "Automated Migration Sentry & Solutions Engineering Sprints",
                    "description": "Identify all 142 remaining active accounts calling deprecated `/v1/sync`; deploy automated in-app migration telemetry and allocate solutions engineers to guide technical migration."
                },
                {
                    "id": "action-price-discount",
                    "title": "Offer Immediate 20% Contract Renewal Discount to EMEA",
                    "description": "Send bulk discount promo emails to all EMEA accounts up for renewal to offset frustration."
                },
                {
                    "id": "action-revert-api",
                    "title": "Revert the v2.4 API Deprecation Indefinitely",
                    "description": "Bring back legacy unmaintained endpoints to eliminate customer errors unconditionally."
                }
            ]),
            json.dumps({
                "optimal_action": "action-cohort-migration-tiger-team",
                "rubric": {
                    "action-cohort-migration-tiger-team": {"score": 95, "feedback": "Excellent data-driven synthesis. The root cause is technical friction during API breaking change, not pricing. Targeted proactive developer enablement halts customer defection at the source."},
                    "action-price-discount": {"score": 40, "feedback": "Misdiagnosed intervention. Discounting damages contract ARR without fixing the broken integration causing daily workflow disruptions."},
                    "action-revert-api": {"score": 45, "feedback": "Short-sighted compromise. Reverting deprecations accumulates technical debt and security risks; targeted partner migration assistance is the standard enterprise practice."}
                }
            }),
            "Intermediate",
            "skill-sql"
        ),
        (
            "sim-aiml-rag-drift",
            "ai-ml-engineer",
            "AI / Machine Learning Engineer",
            "LLM Pipeline Degradation & Hallucination Drift Evaluation",
            "A production retrieval-augmented generation (RAG) assistant is experiencing a 14% hallucination rate on domain-specific policy questions following a vector index chunk size migration from 256 tokens to 1024 tokens.",
            "Telemetry:\n- Average chunk semantic similarity: dropped from 0.84 to 0.61\n- Retrieval recall@5: degraded by 28%\n- Top retrieved chunks contain diluted irrelevant subsections flanking critical policy clauses\n- Perplexity on policy terms increased by 3.2x",
            "Architect the optimal retrieval pipeline remediation to restore grounded accuracy and eliminate context dilution.",
            json.dumps([
                {
                    "id": "action-parent-doc-reranker",
                    "title": "Hierarchical Chunking with Cross-Encoder Re-Ranking",
                    "description": "Implement small 128-token leaf chunks for dense vector embedding search, mapping back to 512-token parent document context, followed by a BGE Cross-Encoder re-ranking stage prior to prompt injection."
                },
                {
                    "id": "action-temperature-zero",
                    "title": "Set Model Temperature to 0.0 & Double System Prompt Length",
                    "description": "Force deterministic greedy decoding and append 10 extra negative constraint rules to the system prompt."
                },
                {
                    "id": "action-switch-gpt4",
                    "title": "Switch Base Foundation Model to a Larger Size",
                    "description": "Upgrade to a 70B parameter model hoping higher reasoning capacity compensates for diluted input chunks."
                }
            ]),
            json.dumps({
                "optimal_action": "action-parent-doc-reranker",
                "rubric": {
                    "action-parent-doc-reranker": {"score": 98, "feedback": "State-of-the-art solution. Hierarchical (parent-child) chunking maintains pinpoint vector search precision while delivering adequate contextual breadth. The cross-encoder re-ranker filters out distracting noise before LLM context generation."},
                    "action-temperature-zero": {"score": 40, "feedback": "Superficial fix. Temperature=0 cannot compensate for irrelevant retrieved context; if the prompt context is diluted or misleading, the model deterministically cites the wrong material."},
                    "action-switch-gpt4": {"score": 35, "feedback": "Costly and ineffective. Larger models still suffer from 'lost in the middle' syndrome when flooded with unranked, noisy context, while multiplying inference latency and token costs by 4x."}
                }
            }),
            "Advanced",
            "skill-machine-learning"
        ),
        (
            "sim-sec-jwt-audit",
            "cyber-defense",
            "Lead Application Security Engineer",
            "Privilege Escalation & JWT Secret Confusion Attack Audit",
            "WAF alerts flagged 47 anomalous requests to `/api/v1/admin/tenants/export`. The incoming Authorization bearer token specified 'alg': 'HS256' signed with HMAC, but the server verification infrastructure is configured to use an RS256 RSA public/private keypair.",
            "Token Header: {\"alg\": \"HS256\", \"typ\": \"JWT\"}\nToken Payload: {\"sub\": \"attacker@test.com\", \"role\": \"super_admin\", \"exp\": 1763164800}\nVerification code vulnerability:\njwt.decode(token, key=app_config.PUBLIC_KEY, algorithms=['HS256', 'RS256'])\n\nRoot flaw: The server accepted HS256 and treated the public RSA certificate string as the HMAC symmetric shared secret!",
            "Propose the immediate incident response containment action and the permanent code hardening patch.",
            json.dumps([
                {
                    "id": "action-enforce-asymmetric-patch",
                    "title": "Enforce Strict Algorithm Whitelist & Invalidate Compromised Tokens",
                    "description": "Pin verification strictly to ['RS256'], revoke active admin sessions via redis blocklist, and ensure asymmetric public key cannot be coerced into a symmetric HMAC secret."
                },
                {
                    "id": "action-ip-block",
                    "title": "Block the Attacker's Origin IP on Cloudflare",
                    "description": "Add IP rate limit rule and ban the source IP subnet while leaving application code unchanged."
                },
                {
                    "id": "action-shorten-expiry",
                    "title": "Shorten JWT Expiration Window to 5 Minutes",
                    "description": "Reduce token lifetime so forged tokens expire quicker."
                }
            ]),
            json.dumps({
                "optimal_action": "action-enforce-asymmetric-patch",
                "rubric": {
                    "action-enforce-asymmetric-patch": {"score": 98, "feedback": "Outstanding cybersecurity practice. Algorithm confusion (CVE-2015-9235 pattern) requires strict algorithm pinning (algorithms=['RS256']). Revoking sessions immediately stops ongoing unauthorized traversal."},
                    "action-ip-block": {"score": 35, "feedback": "Ineffective triage. IP addresses are easily rotated via proxies or VPNs; the critical remote code execution / authorization bypass remains wide open to any actor."},
                    "action-shorten-expiry": {"score": 25, "feedback": "Fundamentally flawed. The attacker generates the forged tokens themselves with arbitrary future expiration timestamps (`exp: 2029`), completely bypassing server default lifetimes."}
                }
            }),
            "Advanced",
            "skill-cybersecurity"
        ),
        (
            "sim-uiux-a11y-wcag",
            "ui-ux-designer",
            "Staff Product & Accessibility Architect",
            "Enterprise Checkout Accessibility Failure & Form Ergonomics Redesign",
            "Audit revealed non-compliance with WCAG 2.1 AA standards. Low contrast placeholder labels disappear on input focus, form error states rely exclusively on red color without text or icon cues, and custom dropdowns lack ARIA keyboard trapping.",
            "Accessibility Audit Report:\n1. Contrast ratio for input borders and placeholder text is 2.1:1 (WCAG AA requirement: >= 4.5:1 text, >= 3:1 graphical components).\n2. Missing <label> elements: Inputs only rely on placeholder='Enter Card Number'. Screen readers announce 'Empty edit text'.\n3. Error state: Field border turns #FF0000 with no error text or aria-invalid='true', failing WCAG 1.4.1 (Use of Color).\n4. Dropdown navigation: Tabbing skips options; Escape key does not close menu.",
            "Select the comprehensive architectural solution to attain full WCAG 2.1 AA compliance and intuitive ergonomics.",
            json.dumps([
                {
                    "id": "action-wcag-design-system",
                    "title": "Implement Accessible Form Pattern with Explicit Labels and ARIA Live Regions",
                    "description": "Add persistent high-contrast visible <label> elements with htmlFor bindings; connect errors using aria-describedby and aria-invalid='true'; provide dual visual cues (red border + exclamation icon + text message); implement WAI-ARIA 1.2 Combobox keyboard navigation (Arrow keys, Enter, Escape)."
                },
                {
                    "id": "action-darken-placeholder",
                    "title": "Darken Placeholder Text and Add Javascript alert() on Error",
                    "description": "Change placeholder color to #444444 and pop a standard alert() modal if validation fails."
                },
                {
                    "id": "action-remove-custom-fields",
                    "title": "Replace Custom Form with an Unstyled Native HTML Form",
                    "description": "Strip all styling and use default browser grey inputs with no error styling."
                }
            ]),
            json.dumps({
                "optimal_action": "action-wcag-design-system",
                "rubric": {
                    "action-wcag-design-system": {"score": 98, "feedback": "Flawless UX and accessibility architecture. Explicit labels with htmlFor, aria-describedby for error associations, redundant visual indicators (color + icon + text), and standardized keyboard listeners represent the gold standard of WCAG 2.1 AA."},
                    "action-darken-placeholder": {"score": 30, "feedback": "Fails multiple standards. Placeholders still vanish upon typing, causing working memory burden. Window alert() is jarring, disrupts keyboard focus, and is hostile to screen reader users."},
                    "action-remove-custom-fields": {"score": 40, "feedback": "Regressive design. While native elements have basic a11y, abandoning brand design systems and helpful error guidance degrades the overall user completion rate."}
                }
            }),
            "Intermediate",
            "skill-html-css"
        )
    ]

    for s_id, role_slug, role_title, title, context, evidence, challenge, options, rubric, diff, skill_id in scenarios:
        cursor.execute("""
            INSERT OR IGNORE INTO workplace_scenarios (
                id, role_slug, role_title, title, context_markdown, evidence_data,
                technical_challenge, options_json, rubric_json, difficulty, target_skill_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (s_id, role_slug, role_title, title, context, evidence, challenge, options, rubric, diff, skill_id))

if __name__ == "__main__":
    run_database_expansion()
