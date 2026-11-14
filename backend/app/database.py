import sqlite3
import json
import logging
from contextlib import contextmanager
from typing import Generator
from app.config import settings

logger = logging.getLogger("nexora.database")

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(settings.DATABASE_PATH, timeout=20.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA cache_size = -64000;")
    conn.execute("PRAGMA temp_store = MEMORY;")
    return conn

@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Users / Learners
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS learners (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                headline TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 2. Profiles
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS profiles (
                id TEXT PRIMARY KEY,
                learner_id TEXT UNIQUE NOT NULL,
                education TEXT DEFAULT '',
                interests TEXT DEFAULT '[]', -- JSON array of strings
                target_career_id TEXT DEFAULT '',
                bio TEXT DEFAULT '',
                current_level TEXT DEFAULT 'Intermediate',
                certifications TEXT DEFAULT '[]', -- JSON array
                projects TEXT DEFAULT '[]', -- JSON array of objects
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
            );
        """)

        # 3. Master Skills
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS skills (
                id TEXT PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                category TEXT NOT NULL,
                description TEXT DEFAULT ''
            );
        """)

        # 4. Learner Skills
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS learner_skills (
                id TEXT PRIMARY KEY,
                learner_id TEXT NOT NULL,
                skill_id TEXT NOT NULL,
                proficiency INTEGER NOT NULL CHECK (proficiency >= 0 AND proficiency <= 100),
                verified INTEGER DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
                FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
                UNIQUE(learner_id, skill_id)
            );
        """)

        # 5. Career Roles
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS career_roles (
                id TEXT PRIMARY KEY,
                slug TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                average_salary TEXT NOT NULL,
                growth_outlook TEXT NOT NULL,
                difficulty_level TEXT NOT NULL
            );
        """)

        # 6. Career Skill Requirements
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS career_skill_requirements (
                id TEXT PRIMARY KEY,
                career_id TEXT NOT NULL,
                skill_id TEXT NOT NULL,
                importance_weight REAL DEFAULT 1.0, -- 1.0 to 5.0
                required_level INTEGER NOT NULL, -- 0 to 100
                why_it_matters TEXT NOT NULL,
                FOREIGN KEY (career_id) REFERENCES career_roles(id) ON DELETE CASCADE,
                FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
                UNIQUE(career_id, skill_id)
            );
        """)

        # 7. Assessments
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS assessments (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                skill_id TEXT NOT NULL,
                career_id TEXT DEFAULT '',
                difficulty TEXT DEFAULT 'Intermediate',
                description TEXT NOT NULL,
                FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
            );
        """)

        # 8. Assessment Questions
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS assessment_questions (
                id TEXT PRIMARY KEY,
                assessment_id TEXT NOT NULL,
                question_text TEXT NOT NULL,
                options_json TEXT NOT NULL, -- JSON array of strings
                correct_option_index INTEGER NOT NULL,
                explanation TEXT NOT NULL,
                weight INTEGER DEFAULT 1,
                FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
            );
        """)

        # 9. Assessment Results
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS assessment_results (
                id TEXT PRIMARY KEY,
                learner_id TEXT NOT NULL,
                assessment_id TEXT NOT NULL,
                score INTEGER NOT NULL,
                total_questions INTEGER NOT NULL,
                percentage REAL NOT NULL,
                passed INTEGER NOT NULL,
                answers_json TEXT NOT NULL,
                feedback TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
                FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
            );
        """)

        # 10. Roadmaps
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS roadmaps (
                id TEXT PRIMARY KEY,
                learner_id TEXT NOT NULL,
                career_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                total_milestones INTEGER DEFAULT 0,
                completed_milestones INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE,
                FOREIGN KEY (career_id) REFERENCES career_roles(id) ON DELETE CASCADE
            );
        """)

        # 11. Milestones
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS milestones (
                id TEXT PRIMARY KEY,
                roadmap_id TEXT NOT NULL,
                order_index INTEGER NOT NULL,
                skill_id TEXT NOT NULL,
                title TEXT NOT NULL,
                objective TEXT NOT NULL,
                resource_type TEXT NOT NULL,
                estimated_hours INTEGER NOT NULL,
                status TEXT DEFAULT 'pending', -- pending, in_progress, completed
                completed_at TIMESTAMP NULL,
                FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE,
                FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
            );
        """)

        # 12. Learning Resources
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS learning_resources (
                id TEXT PRIMARY KEY,
                skill_id TEXT NOT NULL,
                title TEXT NOT NULL,
                url TEXT NOT NULL,
                provider TEXT NOT NULL,
                resource_type TEXT NOT NULL, -- course, docs, project, exercise, video
                difficulty TEXT NOT NULL,
                estimated_duration TEXT NOT NULL,
                is_free INTEGER DEFAULT 1,
                FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
            );
        """)

        # 13. Progress Records
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS progress_records (
                id TEXT PRIMARY KEY,
                learner_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                description TEXT NOT NULL,
                metric_name TEXT NOT NULL,
                previous_value REAL,
                new_value REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
            );
        """)

        # 14. Agent Execution Telemetry Logs
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS agent_logs (
                id TEXT PRIMARY KEY,
                learner_id TEXT NOT NULL,
                agent_name TEXT NOT NULL,
                action TEXT NOT NULL,
                input_summary TEXT NOT NULL,
                output_summary TEXT NOT NULL,
                execution_time_ms INTEGER NOT NULL,
                status TEXT NOT NULL, -- SUCCESS, FALLBACK, ERROR
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
            );
        """)

        # 15. AI Mentor Conversations
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS mentor_conversations (
                id TEXT PRIMARY KEY,
                learner_id TEXT NOT NULL,
                sender TEXT NOT NULL, -- user, mentor, system
                message TEXT NOT NULL,
                metadata_json TEXT DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE
            );
        """)

        # Performance Indexes for Sub-Millisecond Relational Lookups
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_learners_email ON learners(email);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_profiles_learner_id ON profiles(learner_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_learner_skills_learner_id ON learner_skills(learner_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_learner_skills_skill_id ON learner_skills(skill_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_career_skill_reqs_career ON career_skill_requirements(career_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_career_skill_reqs_skill ON career_skill_requirements(skill_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_assessments_skill_id ON assessments(skill_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_asmt_questions_asmt_id ON assessment_questions(assessment_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_asmt_results_learner_id ON assessment_results(learner_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_progress_records_learner_id ON progress_records(learner_id, created_at);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_agent_logs_learner_id ON agent_logs(learner_id, created_at);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_mentor_conv_learner_id ON mentor_conversations(learner_id, created_at);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_learning_resources_skill_id ON learning_resources(skill_id);")

        logger.info("Database initialized successfully.")
