import uuid
import json
from app.database import get_db

# Canonical IDs
SKILL_PYTHON = "skill-python"
SKILL_JS = "skill-javascript"
SKILL_TS = "skill-typescript"
SKILL_REACT = "skill-react"
SKILL_NODE = "skill-nodejs"
SKILL_HTML_CSS = "skill-html-css"
SKILL_SQL = "skill-sql"
SKILL_DOCKER = "skill-docker"
SKILL_FASTAPI = "skill-fastapi"
SKILL_GIT = "skill-git"
SKILL_SYSTEM_DESIGN = "skill-system-design"
SKILL_TAILWIND = "skill-tailwind"

CAREER_FULLSTACK = "career-full-stack-developer"
CAREER_AIML = "career-ai-ml-engineer"
CAREER_DEVOPS = "career-cloud-devops-architect"
CAREER_FRONTEND = "career-frontend-engineer"

def seed_database():
    with get_db() as conn:
        cursor = conn.cursor()

        # Check if already seeded
        cursor.execute("SELECT COUNT(*) as count FROM skills")
        if cursor.fetchone()["count"] > 0:
            return

        print("Seeding NEXORA master skills...")
        skills = [
            (SKILL_PYTHON, "Python", "Backend & AI", "Modern high-level language standard for data, AI, and robust backend services."),
            (SKILL_JS, "JavaScript", "Core Web", "Dynamic scripting language powering the interactive web and modern runtimes."),
            (SKILL_TS, "TypeScript", "Core Web", "Typed superset of JavaScript bringing compile-time safety and scalability."),
            (SKILL_REACT, "React", "Frontend", "Declarative UI component library for building reactive client applications."),
            (SKILL_NODE, "Node.js", "Backend & Runtime", "V8-powered asynchronous event-driven JavaScript server runtime."),
            (SKILL_HTML_CSS, "HTML5 & Modern CSS", "Frontend", "Core markup and styling standards for responsive semantic digital experiences."),
            (SKILL_SQL, "SQL & Relational DBs", "Data & Storage", "Declarative query language for relational database design, transactions, and indexing."),
            (SKILL_DOCKER, "Docker & Containers", "DevOps & Cloud", "Platform for packaging software into isolated, portable containers."),
            (SKILL_FASTAPI, "FastAPI", "Backend", "High-performance asynchronous Python web framework based on standard type hints."),
            (SKILL_GIT, "Git & Version Control", "Engineering Workflow", "Distributed version control system for branch management and collaborative shipping."),
            (SKILL_SYSTEM_DESIGN, "System Design & Architecture", "Architecture", "Engineering scalable distributed architectures, caching, and resiliency."),
            (SKILL_TAILWIND, "Tailwind CSS", "Frontend", "Utility-first CSS framework for rapid and maintainable visual design systems.")
        ]
        cursor.executemany("INSERT INTO skills (id, name, category, description) VALUES (?, ?, ?, ?)", skills)

        print("Seeding Career Roles...")
        careers = [
            (
                CAREER_FULLSTACK,
                "full-stack-developer",
                "Full Stack Developer",
                "Software Engineering",
                "Architects and builds complete web applications from database schemas to client-side reactive interfaces.",
                "$125,000 - $165,000",
                "+22% (Very High Demand)",
                "Advanced"
            ),
            (
                CAREER_AIML,
                "ai-ml-engineer",
                "AI / ML Engineer",
                "Artificial Intelligence",
                "Designs, fine-tunes, and deploys intelligent models, LLM agents, and data retrieval pipelines into production.",
                "$145,000 - $190,000",
                "+38% (Explosive Growth)",
                "Expert"
            ),
            (
                CAREER_DEVOPS,
                "cloud-devops-architect",
                "Cloud DevOps Architect",
                "Infrastructure & Platform",
                "Constructs reliable CI/CD delivery pipelines, manages Kubernetes clusters, and provisions cloud infrastructure.",
                "$135,000 - $175,000",
                "+25% (High Demand)",
                "Advanced"
            ),
            (
                CAREER_FRONTEND,
                "frontend-engineer",
                "Frontend Engineer",
                "Frontend & UX",
                "Crafts high-performance, accessible, visually striking interfaces and design systems.",
                "$115,000 - $150,000",
                "+18% (Steady Growth)",
                "Intermediate to Advanced"
            )
        ]
        cursor.executemany("""
            INSERT INTO career_roles (id, slug, title, category, description, average_salary, growth_outlook, difficulty_level)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, careers)

        print("Seeding Career Skill Requirements...")
        career_reqs = [
            # Full Stack Developer
            (str(uuid.uuid4()), CAREER_FULLSTACK, SKILL_JS, 5.0, 85, "Core language for interactive user interfaces and full-stack runtime compatibility."),
            (str(uuid.uuid4()), CAREER_FULLSTACK, SKILL_REACT, 4.5, 80, "Primary UI architecture for building modern single-page applications."),
            (str(uuid.uuid4()), CAREER_FULLSTACK, SKILL_NODE, 4.0, 75, "Server-side runtime powering microservices, APIs, and authentication flows."),
            (str(uuid.uuid4()), CAREER_FULLSTACK, SKILL_PYTHON, 4.0, 75, "Essential for backend API development, data scripting, and system integrations."),
            (str(uuid.uuid4()), CAREER_FULLSTACK, SKILL_SQL, 4.5, 80, "Crucial for persistent relational modeling, query planning, and schema integrity."),
            (str(uuid.uuid4()), CAREER_FULLSTACK, SKILL_HTML_CSS, 3.5, 80, "Fundamental web building blocks ensuring responsive visual hierarchy and accessibility."),
            (str(uuid.uuid4()), CAREER_FULLSTACK, SKILL_GIT, 3.5, 75, "Collaborative source control, branch strategies, and CI/CD pipeline triggers."),
            (str(uuid.uuid4()), CAREER_FULLSTACK, SKILL_DOCKER, 3.0, 65, "Container encapsulation ensuring local dev parity and cloud reproducibility."),

            # AI/ML Engineer
            (str(uuid.uuid4()), CAREER_AIML, SKILL_PYTHON, 5.0, 95, "Foundational programming language for all modern machine learning models and libraries."),
            (str(uuid.uuid4()), CAREER_AIML, SKILL_SQL, 4.0, 80, "Data extraction, feature store creation, and training dataset sanitization."),
            (str(uuid.uuid4()), CAREER_AIML, SKILL_FASTAPI, 4.5, 85, "Exposing low-latency model inference endpoints and LLM agent streaming endpoints."),
            (str(uuid.uuid4()), CAREER_AIML, SKILL_DOCKER, 4.0, 75, "Encapsulating CUDA drivers and AI runtime environments for GPU clusters."),
            (str(uuid.uuid4()), CAREER_AIML, SKILL_SYSTEM_DESIGN, 4.5, 85, "Architecting scalable vector stores, embeddings caching, and asynchronous workers.")
        ]
        cursor.executemany("""
            INSERT INTO career_skill_requirements (id, career_id, skill_id, importance_weight, required_level, why_it_matters)
            VALUES (?, ?, ?, ?, ?, ?)
        """, career_reqs)

        print("Seeding Assessments & Questions...")
        # Assessment 1: JavaScript Proficiency & Modern ES6+
        asmt_js_id = "asmt-js-core"
        cursor.execute("""
            INSERT INTO assessments (id, title, skill_id, career_id, difficulty, description)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            asmt_js_id,
            "JavaScript Core & Asynchronous Runtime Assessment",
            SKILL_JS,
            CAREER_FULLSTACK,
            "Intermediate",
            "Evaluates your understanding of JavaScript closures, event loop, Promise chaining, and modern ES6+ paradigms."
        ))

        js_questions = [
            (
                str(uuid.uuid4()),
                asmt_js_id,
                "What is the output order of: console.log('1'); setTimeout(() => console.log('2'), 0); Promise.resolve().then(() => console.log('3')); console.log('4'); ?",
                json.dumps(["1, 2, 3, 4", "1, 4, 3, 2", "1, 4, 2, 3", "1, 3, 4, 2"]),
                1,
                "Synchronous code runs first (1, 4), then microtasks like Promise callbacks (3), and finally macrotasks like setTimeout (2).",
                1
            ),
            (
                str(uuid.uuid4()),
                asmt_js_id,
                "Which statement correctly describes JavaScript closures?",
                json.dumps([
                    "A function bundled together with references to its lexical environment.",
                    "A syntax error caused by forgetting to close curly braces.",
                    "An object that cannot accept new properties after creation.",
                    "A method for terminating recursive loops prematurely."
                ]),
                0,
                "A closure gives an inner function access to its outer scope's variables even after the outer function has executed.",
                1
            ),
            (
                str(uuid.uuid4()),
                asmt_js_id,
                "What happens when using Array.prototype.map() vs Array.prototype.forEach()?",
                json.dumps([
                    "map mutates the original array; forEach returns a copy.",
                    "forEach returns a new array; map returns undefined.",
                    "map returns a new array with transformed elements; forEach returns undefined.",
                    "Both methods have identical return values and memory behavior."
                ]),
                2,
                "map constructs and returns a new array based on the callback's return value for each element, whereas forEach executes side effects and returns undefined.",
                1
            ),
            (
                str(uuid.uuid4()),
                asmt_js_id,
                "How does the 'this' keyword behave inside an ES6 arrow function?",
                json.dumps([
                    "It dynamically binds to the calling object at execution time.",
                    "It retains the 'this' value of the enclosing lexical context.",
                    "It always resolves to undefined in strict mode.",
                    "It automatically binds to the global window/globalThis object."
                ]),
                1,
                "Arrow functions do not define their own 'this' binding; they inherit 'this' lexically from the enclosing scope.",
                1
            ),
            (
                str(uuid.uuid4()),
                asmt_js_id,
                "Which approach safely catches unhandled rejections in an async/await function?",
                json.dumps([
                    "Wrapping the await expression in a try...catch block.",
                    "Assigning the function to a window.onerror handler.",
                    "Adding a 'throw error' statement inside a finally block.",
                    "Async functions automatically discard runtime errors silently."
                ]),
                0,
                "Wrapping await statements inside try...catch blocks cleanly intercepts rejected Promises and allows graceful error recovery.",
                1
            )
        ]
        cursor.executemany("""
            INSERT INTO assessment_questions (id, assessment_id, question_text, options_json, correct_option_index, explanation, weight)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, js_questions)

        # Assessment 2: React Component Architecture
        asmt_react_id = "asmt-react-core"
        cursor.execute("""
            INSERT INTO assessments (id, title, skill_id, career_id, difficulty, description)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            asmt_react_id,
            "React State & Lifecycle Architecture Assessment",
            SKILL_REACT,
            CAREER_FULLSTACK,
            "Intermediate",
            "Tests your mastery of reactive state updates, useEffect dependencies, custom hooks, and memoization."
        ))

        react_questions = [
            (
                str(uuid.uuid4()),
                asmt_react_id,
                "Why should you never mutate state directly in React (e.g., state.count = 5)?",
                json.dumps([
                    "It causes an immediate syntax error during compilation.",
                    "React relies on shallow object equality to detect changes and schedule re-renders.",
                    "State values are stored in read-only hardware registers.",
                    "Direct mutation slows down CSS animations."
                ]),
                1,
                "React determines if components need to re-render using referential equality checks (Object.is). Direct mutations bypass this and lead to stale UI.",
                1
            ),
            (
                str(uuid.uuid4()),
                asmt_react_id,
                "When does a useEffect hook cleanup function execute?",
                json.dumps([
                    "Only when the browser window closes.",
                    "Before the component unmounts and before re-running the effect on dependency change.",
                    "Every time a sibling component re-renders.",
                    "Never, unless manually triggered via window.gc()."
                ]),
                1,
                "React runs the effect cleanup function when the component unmounts and before re-running the effect on consecutive dependency changes.",
                1
            ),
            (
                str(uuid.uuid4()),
                asmt_react_id,
                "What is the primary purpose of the useMemo hook?",
                json.dumps([
                    "To cache the result of an expensive calculation between renders.",
                    "To persist data to localStorage automatically.",
                    "To create a global singleton store across browser tabs.",
                    "To enforce synchronous rendering of UI subtrees."
                ]),
                0,
                "useMemo caches the output of an expensive computation across renders unless one of its specified dependencies changes.",
                1
            )
        ]
        cursor.executemany("""
            INSERT INTO assessment_questions (id, assessment_id, question_text, options_json, correct_option_index, explanation, weight)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, react_questions)

        print("Seeding Curated Learning Resources...")
        resources = [
            (str(uuid.uuid4()), SKILL_JS, "Deep JavaScript Foundations & V8 Internals", "https://javascript.info", "JavaScript.info", "docs", "Intermediate", "14 hours", 1),
            (str(uuid.uuid4()), SKILL_JS, "Asynchronous JavaScript & Event Loop Mastery", "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous", "MDN Web Docs", "course", "Intermediate", "6 hours", 1),
            (str(uuid.uuid4()), SKILL_JS, "Build an Interactive Real-time Task Board", "https://github.com/topics/javascript-project", "NEXORA Labs", "project", "Advanced", "10 hours", 1),
            
            (str(uuid.uuid4()), SKILL_REACT, "React 19 Official Documentation & Architecture", "https://react.dev", "React Team", "docs", "Beginner to Advanced", "12 hours", 1),
            (str(uuid.uuid4()), SKILL_REACT, "Production State Management with Zustand & React Query", "https://tanstack.com/query/latest", "TanStack", "course", "Intermediate", "8 hours", 1),
            (str(uuid.uuid4()), SKILL_REACT, "Architecting a Scalable SaaS Dashboard", "https://github.com/topics/react-dashboard", "NEXORA Labs", "project", "Advanced", "16 hours", 1),

            (str(uuid.uuid4()), SKILL_NODE, "Node.js Design Patterns & Scalable Microservices", "https://nodejs.org/docs", "Node.js Foundation", "docs", "Intermediate", "10 hours", 1),
            (str(uuid.uuid4()), SKILL_NODE, "Production REST & WebSocket API Development", "https://expressjs.com", "Express & Node Ecosystem", "course", "Intermediate", "8 hours", 1),

            (str(uuid.uuid4()), SKILL_PYTHON, "High-Performance Python 3 & AsyncIO", "https://docs.python.org/3/", "Python Software Foundation", "docs", "Advanced", "12 hours", 1),
            (str(uuid.uuid4()), SKILL_SQL, "Relational Database Design & Query Optimization", "https://use-the-index-luke.com/", "Markus Winand", "docs", "Advanced", "10 hours", 1),
            (str(uuid.uuid4()), SKILL_HTML_CSS, "Modern Responsive Layouts & CSS Grid / Flexbox", "https://web.dev/learn/css/", "web.dev", "course", "Beginner", "6 hours", 1)
        ]
        cursor.executemany("""
            INSERT INTO learning_resources (id, skill_id, title, url, provider, resource_type, difficulty, estimated_duration, is_free)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, resources)

        # Seed Default Learner: Alex Mercer (Matching prompt: Python, SQL, basic HTML, Target: Full Stack)
        learner_id = "learner-alex-mercer"
        cursor.execute("""
            INSERT INTO learners (id, email, password_hash, full_name, headline)
            VALUES (?, ?, ?, ?, ?)
        """, (
            learner_id,
            "alex.mercer@nexora.ai",
            "$2b$12$eX8mP.EXAMPLE.HASHED.PASSWORD.NEXORA",  # Simulated bcrypt hash
            "Alex Mercer",
            "Aspiring Full-Stack Software Engineer & Technology Enthusiast"
        ))

        cursor.execute("""
            INSERT INTO profiles (id, learner_id, education, interests, target_career_id, bio, current_level, certifications, projects)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            str(uuid.uuid4()),
            learner_id,
            "B.S. in Computer Science (Junior Year)",
            json.dumps(["Distributed Systems", "Web Engineering", "Artificial Intelligence", "Cloud Architecture"]),
            CAREER_FULLSTACK,
            "Dedicated learner with solid backend scripting and data querying fundamentals seeking to master modern full-stack web engineering.",
            "Intermediate",
            json.dumps(["Python Certified Associate Programmer", "SQL Fundamentals Bootcamp"]),
            json.dumps([
                {"title": "CLI Automated Data Scraper", "tech": "Python, BeautifulSoup", "description": "Automated data harvesting pipeline with SQLite persistence."},
                {"title": "Personal Portfolio v1", "tech": "HTML5, CSS3", "description": "Responsive static showcase site."}
            ])
        ))

        # Seed learner's starting skills: Python: 75, SQL: 70, HTML5/CSS3: 40 (basic HTML)
        cursor.execute("INSERT INTO learner_skills (id, learner_id, skill_id, proficiency, verified) VALUES (?, ?, ?, ?, ?)",
                       (str(uuid.uuid4()), learner_id, SKILL_PYTHON, 75, 1))
        cursor.execute("INSERT INTO learner_skills (id, learner_id, skill_id, proficiency, verified) VALUES (?, ?, ?, ?, ?)",
                       (str(uuid.uuid4()), learner_id, SKILL_SQL, 70, 1))
        cursor.execute("INSERT INTO learner_skills (id, learner_id, skill_id, proficiency, verified) VALUES (?, ?, ?, ?, ?)",
                       (str(uuid.uuid4()), learner_id, SKILL_HTML_CSS, 40, 0))

        # Initial Agent Execution Log
        cursor.execute("""
            INSERT INTO agent_logs (id, learner_id, agent_name, action, input_summary, output_summary, execution_time_ms, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            str(uuid.uuid4()),
            learner_id,
            "ProfileAgent",
            "INGEST_LEARNER_BASELINE",
            "Ingested initial skills: Python (75%), SQL (70%), HTML/CSS (40%). Goal: Full Stack Developer",
            "Identified baseline profile strengths in backend data manipulation; flagged JavaScript and React gaps.",
            48,
            "SUCCESS"
        ))

        print("NEXORA seed data created successfully!")

if __name__ == "__main__":
    from app.database import init_db
    init_db()
    seed_database()
