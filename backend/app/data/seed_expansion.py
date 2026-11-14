"""
Seed data for NEXORA expanded platform features:
- Courses, Modules & Structured Lessons
- Coding Problems with Real Test Cases
- Project Studio Projects & Milestones
- Interview Simulator Questions
- Weekly Learning Goals
- Achievements & Platform Certificates
- Career Opportunities
"""
import uuid
import json
from app.database import get_db

def seed_expanded_features():
    with get_db() as conn:
        cursor = conn.cursor()

        # Check if courses already seeded
        cursor.execute("SELECT COUNT(*) as count FROM courses")
        if cursor.fetchone()["count"] > 0:
            return

        print("Seeding Expanded Feature Datasets...")

        # 1. COURSES & LESSONS
        course_js_id = "course-js-mastery"
        course_react_id = "course-react-enterprise"
        course_python_id = "course-python-microservices"

        courses = [
            (
                course_js_id,
                "javascript-deep-dive",
                "Advanced JavaScript & V8 Runtime Architecture",
                "Core Web & Runtime",
                "skill-javascript",
                "Intermediate to Advanced",
                16,
                "Master asynchronous execution, event loop phases, closures, prototypal inheritance, and memory management in modern JavaScript.",
                "Code"
            ),
            (
                course_react_id,
                "react-enterprise-architecture",
                "Enterprise React 19 & State Architecture",
                "Frontend Engineering",
                "skill-react",
                "Advanced",
                20,
                "Architect scalable frontend applications using React 19 primitives, Server Components, optimistic UI, and custom state machines.",
                "Layout"
            ),
            (
                course_python_id,
                "python-async-fastapi",
                "High-Performance Async Python & FastAPI Microservices",
                "Backend & Architecture",
                "skill-fastapi",
                "Intermediate",
                14,
                "Design low-latency asynchronous REST and WebSocket microservices with Pydantic validation, connection pools, and containerized deployments.",
                "Server"
            )
        ]
        cursor.executemany("""
            INSERT INTO courses (id, slug, title, category, skill_id, difficulty_level, estimated_hours, description, thumbnail_icon)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, courses)

        # Course Modules for JS
        mod_js_1 = str(uuid.uuid4())
        mod_js_2 = str(uuid.uuid4())
        cursor.execute("INSERT INTO course_modules (id, course_id, order_index, title, description) VALUES (?, ?, ?, ?, ?)",
                       (mod_js_1, course_js_id, 1, "The JavaScript Event Loop & Concurrency", "Deep dive into macrotasks, microtasks, and synchronous call stacks."))
        cursor.execute("INSERT INTO course_modules (id, course_id, order_index, title, description) VALUES (?, ?, ?, ?, ?)",
                       (mod_js_2, course_js_id, 2, "Lexical Scoping, Closures & Memory", "Variable lifecycles, execution contexts, and preventing memory leaks."))

        # Lessons for Module 1
        lesson_1 = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO course_lessons (id, module_id, course_id, order_index, title, content_markdown, code_snippet, key_takeaways_json, quiz_question_json, estimated_minutes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            lesson_1,
            mod_js_1,
            course_js_id,
            1,
            "Understanding Microtasks vs Macrotasks",
            """### The Architecture of the V8 Event Loop

JavaScript is single-threaded, operating on a single call stack and memory heap. However, non-blocking I/O operations are achieved through the browser/Node.js libuv event loop.

#### Execution Phases:
1. **Call Stack**: Executes synchronous functions immediately until empty.
2. **Microtask Queue**: Promises (`.then`, `.catch`), `queueMicrotask`, `MutationObserver`. The microtask queue is completely drained after each synchronous task before any macrotask runs.
3. **Macrotask Queue**: `setTimeout`, `setInterval`, `setImmediate`, I/O callbacks. One macrotask is processed per loop tick, followed immediately by draining any pending microtasks.

Understanding this sequence prevents race conditions in production React effects and server-side request pipelines.""",
            """console.log("1: Synchronous start");

setTimeout(() => {
  console.log("2: Macrotask execution");
}, 0);

Promise.resolve().then(() => {
  console.log("3: Microtask execution");
});

console.log("4: Synchronous end");

// Output Order:
// 1: Synchronous start
// 4: Synchronous end
// 3: Microtask execution
// 2: Macrotask execution""",
            json.dumps([
                "Microtasks always preempt macrotasks.",
                "Promise callbacks queue as microtasks.",
                "setTimeout(..., 0) schedules a macrotask on the next tick."
            ]),
            json.dumps({
                "question": "Which queue has priority when the synchronous call stack empties?",
                "options": ["Macrotask queue", "Microtask queue", "Animation frame queue", "Garbage collector"],
                "correct_index": 1,
                "explanation": "The microtask queue is always drained completely before the event loop advances to execute the next macrotask."
            }),
            18
        ))

        # 2. CODING PRACTICE LAB PROBLEMS
        code_p1 = "prob-event-emitter"
        code_p2 = "prob-debounce-async"
        code_p3 = "prob-lru-cache"

        problems = [
            (
                code_p1,
                "custom-event-emitter",
                "Implement a Robust Custom Event Emitter",
                "skill-javascript",
                "Medium",
                "Design a complete EventEmitter class with support for `on(event, listener)`, `emit(event, ...args)`, and `off(event, listener)` methods. Ensure listeners can be detached cleanly without memory leaks.",
                "javascript",
                """class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
    return () => this.off(eventName, callback);
  }

  emit(eventName, ...args) {
    if (!this.events[eventName]) return false;
    this.events[eventName].forEach(cb => cb(...args));
    return true;
  }

  off(eventName, callback) {
    if (!this.events[eventName]) return;
    this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
  }
}

// Test runner will instantiate EventEmitter and execute test cases.
""",
                json.dumps([
                    {"input": "on('data', cb), emit('data', 42)", "expected_output": "42 received", "description": "Basic publish and subscribe behavior"},
                    {"input": "emit('unhandled', 1)", "expected_output": "false", "description": "Emitting non-existent event returns false cleanly"},
                    {"input": "off('data', cb), emit('data', 10)", "expected_output": "no execution", "description": "Unsubscribed callback is not triggered"}
                ]),
                json.dumps([
                    "Store event callbacks in an object keyed by event name.",
                    "Ensure emit passes all arguments forward using the rest operator (...args).",
                    "Return an unsubscribe function directly from the `on` method for cleaner React hooks integration."
                ])
            ),
            (
                code_p2,
                "async-debounce-with-cancel",
                "Asynchronous Debounce with Cancellation",
                "skill-javascript",
                "Medium",
                "Write an enhanced debounce function that accepts a function `fn` and a delay in milliseconds `wait`. It must return a debounced function equipped with a `.cancel()` method to discard pending invocations.",
                "javascript",
                """function debounce(fn, wait) {
  let timerId = null;

  function debounced(...args) {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
      timerId = null;
    }, wait);
  }

  debounced.cancel = function() {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return debounced;
}
""",
                json.dumps([
                    {"input": "debounce(fn, 100) called 5 times in 50ms", "expected_output": "fn executed exactly once after 100ms", "description": "Only latest invocation executes"},
                    {"input": "debounce(fn, 100), call cancel() at 50ms", "expected_output": "fn never executes", "description": "Cancellation cleanly clears pending timer"}
                ]),
                json.dumps([
                    "Maintain timerId in outer closure scope.",
                    "Attach cancel method directly onto the returned function object."
                ])
            )
        ]
        cursor.executemany("""
            INSERT INTO coding_problems (id, slug, title, skill_id, difficulty, description, language, initial_code, test_cases_json, hints_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, problems)

        # 3. PROJECT STUDIO
        proj_1 = "proj-cloud-analytics-saas"
        proj_2 = "proj-realtime-collaboration"

        projects = [
            (
                proj_1,
                "cloud-telemetry-analytics-platform",
                "Cloud Telemetry & Real-Time Analytics Platform",
                "career-full-stack-developer",
                "Advanced",
                "Construct an end-to-end full-stack SaaS telemetry ingest pipeline capable of receiving thousands of events per second, computing aggregations, and rendering real-time streaming dashboards.",
                """### Architectural Specification
- **Client Layer**: React 19 + TypeScript + Tailwind CSS with WebGL/SVG streaming charts.
- **Backend API**: Python FastAPI asynchronous endpoints with streaming WebSockets.
- **Data Persistence**: Relational schema for account access + fast time-series telemetry table.
- **Verification Criteria**: Sub-50ms ingestion latency and comprehensive end-to-end test coverage.""",
                json.dumps(["skill-python", "skill-react", "skill-javascript", "skill-sql", "skill-fastapi"]),
                json.dumps([
                    "FastAPI ingestion endpoint accepting batch JSON metrics",
                    "Reactive single-page dashboard displaying live throughput charts",
                    "Automated integration test suite with coverage report",
                    "Containerized Dockerfile & docker-compose configuration"
                ])
            ),
            (
                proj_2,
                "realtime-collaborative-canvas",
                "Real-Time Collaborative Multi-User Canvas",
                "career-frontend-engineer",
                "Advanced",
                "Build a high-performance vector canvas allowing multiple users to draw, manipulate shapes, and see live cursor positions synchronized with conflict-free replicated data types.",
                """### Architectural Specification
- **Engine**: HTML5 Canvas / SVG with requestAnimationFrame optimization.
- **Networking**: Bidirectional WebSocket protocol with optimistic local updates.
- **State Management**: Conflict-free data synchronization with undo/redo history.""",
                json.dumps(["skill-javascript", "skill-react", "skill-typescript"]),
                json.dumps([
                    "60fps smooth canvas rendering without garbage collection stutters",
                    "WebSocket multiplayer room connection protocol",
                    "Presence indicator showing remote user mouse cursors and active selections"
                ])
            )
        ]
        cursor.executemany("""
            INSERT INTO projects (id, slug, title, target_career_id, difficulty, description, architecture_markdown, required_skills_json, deliverables_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, projects)

        # Milestones for Project 1
        cursor.execute("""
            INSERT INTO project_milestones (id, project_id, order_index, title, objective, deliverable)
            VALUES (?, ?, 1, 'Data Model & Ingestion Endpoint', 'Design high-throughput SQLite time-series schema and FastAPI POST /ingest route.', 'FastAPI schema & integration test')
        """, (str(uuid.uuid4()), proj_1))
        cursor.execute("""
            INSERT INTO project_milestones (id, project_id, order_index, title, objective, deliverable)
            VALUES (?, ?, 2, 'WebSocket Streaming Pipeline', 'Establish bidirectional event push from server to subscribed client dashboard.', 'Working WebSocket handler & client receiver')
        """, (str(uuid.uuid4()), proj_1))
        cursor.execute("""
            INSERT INTO project_milestones (id, project_id, order_index, title, objective, deliverable)
            VALUES (?, ?, 3, 'Production Dashboard & Visual Polish', 'Render Recharts / SVG live time-series graph with latency and throughput counters.', 'Deployed web dashboard with dark obsidian theme')
        """, (str(uuid.uuid4()), proj_1))

        # 4. INTERVIEW SIMULATOR QUESTIONS
        interview_qs = [
            (
                str(uuid.uuid4()),
                "career-full-stack-developer",
                "Technical",
                "Intermediate",
                "How does the browser event loop coordinate microtasks versus macrotasks, and why does an unhandled Promise rejection freeze or crash an asynchronous pipeline?",
                "Candidate should distinguish microtask queue (Promises) from macrotask queue (setTimeout), explain that microtasks drain to completion after each synchronous cycle, and highlight why unhandled rejections prevent expected subsequent state transitions."
            ),
            (
                str(uuid.uuid4()),
                "career-full-stack-developer",
                "Architectural",
                "Advanced",
                "Design a rate-limiting middleware for an API gateway handling 10,000 requests/sec. How would you handle distributed state and bursty traffic without degrading latency?",
                "Candidate should discuss Token Bucket or Leaky Bucket algorithms, Redis atomic counters (INCR/EXPIRE) or sliding window logs, and describe graceful HTTP 429 Retry-After response headers."
            ),
            (
                str(uuid.uuid4()),
                "career-full-stack-developer",
                "Behavioral",
                "General",
                "Describe a situation where a technical decision you made resulted in a performance bottleneck or unexpected production bug. How did you diagnose, resolve, and prevent future recurrence?",
                "Look for clear ownership, root cause analysis (profiling, logs, reproducible tests), blameless remediation, and architectural guardrails (automated linting, CI benchmarks)."
            )
        ]
        cursor.executemany("""
            INSERT INTO interview_questions (id, career_id, category, difficulty, question_text, criteria_notes)
            VALUES (?, ?, ?, ?, ?, ?)
        """, interview_qs)

        # 6. MASTER ACHIEVEMENTS CATALOG
        achievements = [
            ("ach-first-quiz", "first-assessment-passed", "Diagnostic Pioneer", "Successfully verified your first technical skill assessment with >70% score.", "Award", "Assessments", "assessment_count", 1),
            ("ach-roadmap-pioneer", "roadmap-pioneer", "Pathfinder", "Completed your first personalized milestone on your adaptive career roadmap.", "Compass", "Roadmap", "milestone_count", 1),
            ("ach-streak-3", "streak-master-3", "Consistent Momentum", "Maintained an active engineering learning streak for 3 or more consecutive days.", "Zap", "Habits", "streak_days", 3),
            ("ach-fullstack-ready", "fullstack-foundation", "Full-Stack Trajectory", "Attained a career readiness score above 50% for your chosen engineering track.", "Target", "Readiness", "readiness_score", 50),
            ("ach-code-lab-champ", "code-lab-solver", "Syntax Virtuoso", "Passed all unit test suites on a practical coding challenge in the Coding Lab.", "Terminal", "Coding", "code_problems_solved", 1)
        ]
        cursor.executemany("""
            INSERT OR IGNORE INTO achievements (id, slug, title, description, badge_icon, category, criteria_type, threshold_val)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, achievements)

        # 7. CAREER OPPORTUNITIES (Demo Market Catalog)
        opportunities = [
            (
                str(uuid.uuid4()),
                "career-full-stack-developer",
                "Vercel Ecosystem Labs",
                "Junior Full-Stack Platform Engineer",
                "Remote (US / Europe / Asia)",
                "Full-time",
                "$110,000 - $135,000",
                json.dumps(["skill-javascript", "skill-react", "skill-node", "skill-python"]),
                "Build next-generation developer tooling, streaming deployment webhooks, and modern responsive dashboard user interfaces.",
                1
            ),
            (
                str(uuid.uuid4()),
                "career-full-stack-developer",
                "Linear Technologies",
                "Frontend & Systems Associate",
                "San Francisco / Remote",
                "Full-time",
                "$120,000 - $145,000",
                json.dumps(["skill-react", "skill-typescript", "skill-javascript"]),
                "Craft lightning-fast desktop-grade web applications with offline sync, keyboard navigation, and micro-interactions.",
                1
            ),
            (
                str(uuid.uuid4()),
                "career-ai-ml-engineer",
                "DeepScale Intelligence",
                "AI Agent Infrastructure Intern",
                "Remote / Hybrid",
                "Internship",
                "$50 - $65 / hour",
                json.dumps(["skill-python", "skill-fastapi", "skill-docker", "skill-sql"]),
                "Implement structured JSON output pipelines, vector caching, and evaluation harnesses for autonomous multi-agent swarms.",
                1
            )
        ]
        cursor.executemany("""
            INSERT INTO career_opportunities (id, career_id, company_name, role_title, location, role_type, salary_range, required_skills_json, description, is_demo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, opportunities)

        print("NEXORA expanded feature dataset seeded successfully!")

if __name__ == "__main__":
    seed_expanded_features()
