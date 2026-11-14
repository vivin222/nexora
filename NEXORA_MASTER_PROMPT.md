# NEXORA — MASTER PRODUCT TRANSFORMATION DIRECTIVE
## Production Delivery · AI Career Intelligence · Adaptive Learning · Interactive Visual Experience

**Product:** NEXORA — "Your Potential. Reimagined."  
**Repository:** `https://github.com/vivin222/nexora.git` (Branch: `main`)  
**Frontend Deployment:** `https://nexora-web-9bi2.onrender.com/` (Render Static Site)  
**Backend Deployment:** `https://nexora-omw4.onrender.com/` (Render Python Web Service)  
**Deployment Infrastructure:** Single Render Blueprint (`render.yaml`)

---

# 1. CORE MISSION & NON-NEGOTIABLE PRODUCT INVARIANTS

Transform the existing deployed NEXORA platform into a polished, production-ready **AI Career Intelligence & Personalized Adaptive Learning Platform**.

This directive is an **enhancement of the existing deployed application**, NOT a rewrite or restart:
1. **Preserve All Working Assets:** Keep all existing database tables, student accounts (all existing active learners), API endpoints, authentication flows, and administrative tools intact.
2. **Zero Course-Selling Policy:** NEXORA is an autonomous career intelligence and skill-acceleration platform. Strictly NO course purchasing, e-commerce shopping carts, pricing tiers, checkout flows, or monetized locks.
3. **Free & Instant Student Registration:** Public registration is 100% free and open to all students. Every student account activates immediately upon signup with zero manual administrator approvals or pending holding screens.
4. **Separate Portals:** Maintain strict architectural separation between the Student Portal (`/dashboard`, `/login`, `/register`) and the Institutional Administrator Portal (`/admin/login`, `/admin`). Enforce strict backend RBAC (`require_admin` returning `403 Forbidden` for student tokens).
5. **Render is the Only Deployment Target:** Use Infrastructure-as-Code (`render.yaml`) with Python backend (`region: oregon`) and React static frontend (no region). Never redirect deployment to Vercel, Netlify, or Railway.
6. **Zero Fabricated Data:** Never display hardcoded mock recommendations, fake assessment completions, or unverified job opportunities. All intelligence must be computed deterministically from genuine student profile and learning activity records.
7. **Zero Exposed Credentials:** Never commit API keys, database credentials, or secret keys to Git. Manage secrets exclusively through environment variables (`GEMINI_API_KEY`, `JURY_ADMIN_EMAIL`, `JURY_ADMIN_PASSWORD`).

---

# 2. CONTROLLED EXECUTION WORKFLOW (CHECKPOINT SYSTEM)

The implementation agent must work strictly in staged checkpoints to prevent session timeouts or crashes:

- **Checkpoint 0 — Deep Inspection & Baseline Audit:**
  Verify current Git commit, inspect frontend components, backend routers, SQLite schema in `nexora.db`, and active dev servers.
- **Checkpoint 1 — Apple × Vercel Visuals & Cursor-Responsive Elements:**
  Deploy typography hierarchy, micro-borders, obsidian theme, and the coordinated system of cursor-responsive floating symbols, SVG icons, and graduation cap achievement identity.
- **Checkpoint 2 — Guided Career Discovery & Selection Wizard:**
  Build the multi-step questionnaire. Prohibit preset careers. Compute AI analysis, display Top 3 career comparisons, allow student selection, and generate custom roadmaps.
- **Checkpoint 3 — Action-First Student Dashboard & Quick Access:**
  Prominently feature "What's Next?", the genuine learning streak counter, and the 10-item quick-action navigation hub.
- **Checkpoint 4 — Five-Level Skill Proficiency & Interactive Skill Galaxy:**
  Establish standardized Beginner-to-Expert levels with evidence badges (self, assessment, project) and render the node-based Skill Galaxy.
- **Checkpoint 5 — Missions, Genuine Streaks & Career Simulator:**
  Implement AI-adaptive weekly learning missions, multi-activity streak rules, and practical workplace challenges.
- **Checkpoint 6 — Assessments, Smart Revision & AI Mentor:**
  Build rubric-based assessments, automated topic revision for weak scores, and the dual-mode context-aware AI mentor.
- **Checkpoint 7 — Portfolio Builder, Opportunity Radar & Achievements:**
  Deliver student-controlled portfolio exports, sourced dated opportunities, and real milestone animations.
- **Checkpoint 8 — Admin Portal Extension & Security Hardening:**
  Preserve and extend admin platform health telemetry, student moderation, and audit logging.
- **Checkpoint 9 — Full Test Suite, Git Push & Live Render Verification:**
  Run all 25+ pytest backend tests, verify frontend production build, review Git diff, commit, push to GitHub `main`, and verify live Render deployment.


---

# 3. PHASE 1 — VISUAL DIRECTION: APPLE × VERCEL × CRY NOVA INTERACTIONS

## Typography, Space & Color Hierarchy
- **Visual Palette:** Deep obsidian background (`#070A0D`, `#0B0F12`), dark elevated cards (`#11171B`, `#161D22`), razor-sharp micro-borders (`border-white/5` to `border-white/10`), signature cyan accents (`#35D9F2`), vibrant lime highlights (`#C5F45B`), and warm zinc neutral typography (`#929CA3`, `#D1D5DB`, `#FFFFFF`).
- **Typography:** Strict Apple/Vercel geometric typographic scale: bold tracking-tight headings (`tracking-tight`), crisp mono badges for system metadata (`font-mono text-xs uppercase`), and comfortable line-height for instructional prose.
- **Card Composition:** Purposeful, uncluttered containers with subtle radial gradients, soft glows (`rgba(53,217,242,0.08)`), and minimal visual chrome.

## Cursor-Responsive Interactive Visual System
- **Coordinated System of Micro-Elements:**
  A lightweight collection of responsive visual tokens:
  1. Floating typographic glyphs & code fragments (`{}`, `</>`, `λ`, `01`, `=>`, `async`, `AI`).
  2. Small SVG technology icons representing domains (Programming, Machine Learning, Data Science, Cloud, Cybersecurity, Design).
  3. Geometric growth motifs (diamonds, nodes, orbit rings).
- **Physics & Motion Dynamics:**
  - Multi-layered parallax depth: distinct elements move at varying proportional speeds relative to mouse position ($0.02\times$ to $0.08\times$).
  - Gentle directional follow with smooth spring damping transitions (`cubic-bezier(0.16, 1, 0.3, 1)`).
  - Subtle angle rotation ($-12^\circ$ to $+12^\circ$) on movement.
- **Interaction Constraints & Performance:**
  - Zero cursor hijacking, zero custom laggy mouse pointers, zero invasive full-screen canvas blocks.
  - Text and interactive buttons remain 100% accessible and readable with no overlapping click-blockers (`pointer-events-none`).
  - Mobile & Tablet: Automatic static or subtle CSS-only ambient float on touch devices.
  - Accessibility: Full compliance with `prefers-reduced-motion` media query (disables active cursor tracking).
- **Graduation Cap Identity Symbol:**
  - A refined, custom vector Graduation Cap icon used as an aspirational motif for:
    - Milestone completion celebrations.
    - Assessment mastery.
    - Career readiness threshold reached (>80%).
    - Graduation pathway unlocks.
  - Interactive micro-tilt on hover in achievement sections; never visually dominant over core platform utilities.

---

# 4. PHASE 2 — GUIDED CAREER DISCOVERY & AI MATCHING ENGINE

## Strict Rule: No Preset Default Careers
The Target Career must **NEVER** appear as a generic preset before the student undergoes guided career discovery. Showing a pre-assigned career prior to assessment contradicts the core thesis of NEXORA.

## Guided Career Discovery Questionnaire
A multi-step, engaging wizard capturing rich multidimensional student evidence:
1. **Academic Background:** Degree level (Undergraduate, Postgraduate, Doctorate, Self-Taught), institution name, department/major, and expected graduation year.
2. **Technical & Domain Interests:** Primary fields of enthusiasm (e.g., Cloud Architecture, Machine Learning, Distributed Systems, Full-Stack Web, Cyber Defense, Product Design).
3. **Current Skill Competencies:** Declarative selection of existing skills with 5-level proficiency self-ratings (1: Beginner to 5: Expert).
4. **Practical Experience & Projects:** Summary of completed projects, hackathons, open-source repositories, and portfolio links.
5. **Certifications & Coursework:** Documented accreditations and academic certifications.
6. **Career Aspirations & Constraints:** Preferred work formats (remote, hybrid, on-site), dream companies/roles, and weekly time commitment (hours/week).

## AI Multi-Agent Analysis Pipeline
Upon questionnaire submission, the system triggers the Central Agent Orchestrator:
- **ProfileAgent:** Synthesizes raw answers into an immutable learner vector.
- **SkillAnalysisAgent:** Compares student's declared skills against all canonical career role requirements in the database.
- **Deterministic Gap Matrix:** Computes exact weighted skill overlap, identifying strong proficiencies, weak areas, and missing foundational competencies.

## Top 3 Career Recommendations & Comparison
Rather than forcing a single recommendation, the system presents the **Top 3 Candidate Careers** side-by-side:
- **Match Score:** Clear percentage match (e.g., 78% Match).
- **Role Title & Market Demand:** Role name, compensation outlook, and projected growth.
- **Match Rationale:** Transparent AI explanation detailing why this role fits the student's unique combination of skills and interests.
- **Competency Comparison:** Side-by-side breakdown of:
  - Overlapping strengths (skills the student already has).
  - Critical skill gaps (required skills the student lacks).
  - Estimated weeks required to reach market-ready threshold.

## Active Target Career Selection & Roadmapping
- The student actively reviews the Top 3 options and clicks **"Select as My Target Career"**.
- This explicit selection:
  1. Updates `profiles.target_career_id` in SQLite.
  2. Executes `RoadmapAgent` to generate an adaptive, milestone-based learning roadmap tailored to the student's specific gaps.
  3. Initializes AI Weekly Missions and diagnostic assessment queues.
  4. Synchronizes the **AI Career Twin** with live market requirements.
- **Discovery Recalibration:** Students can retake the questionnaire anytime from their settings or profile to explore new career trajectories without corrupting historical progress records.

---

# 5. PHASE 3 — ACTION-FIRST DASHBOARD & QUICK ACCESS HUB

## The "What's Next?" Hero Element
Every login must answer one fundamental question in under 3 seconds:
**"What should I do next to move closer to my Target Career?"**

The dashboard hero features a high-visibility **Next Best Action** card:
- **Task Title:** Specific, concrete next step (e.g., *"Master Docker Multi-Stage Builds & Container Optimization"*).
- **Direct Rationale:** *"Bridging this deficit resolves your #1 blocker for Cloud Infrastructure Engineer (+14% Career Readiness)."*
- **Estimated Time:** Clear commitment expectation (e.g., *"35 minutes"*).
- **Action Button:** One-click **"Start Now →"** button taking the student directly into the lesson, code editor, or assessment.
- **Dynamic Updates:** Automatically rotates to the next highest-priority task upon completion.

## Meaningful Learning Streak System
Streaks must measure **genuine cognitive learning activity**, NEVER empty daily logins:
- **Qualifying Actions:**
  1. Completing an interactive course lesson.
  2. Passing an algorithmic challenge in the Practice Lab.
  3. Submitting a project milestone in Project Studio.
  4. Completing an assessment quiz.
- **Dashboard Streak Display:**
  - Active Streak (e.g., *"5 Day Streak 🔥"*).
  - Longest All-Time Streak.
  - Weekly 7-day visual calendar dots indicating verified learning days.
  - Explanation tooltip showing exactly what qualifies.
  - **Graceful Recovery Suggestions:** Missed a day? Provide an encouraging *"Streak Freeze / Recovery Mission"* rather than punitive shame banners.

## Quick-Access Navigation Hub
Provide high-contrast, one-click access tiles for the 10 core student utilities:
1. **Continue Learning:** Jump back to active lesson.
2. **What's Next?:** Direct link to highest-priority gap mission.
3. **Target Career:** View career benchmark, demand, and compensation.
4. **Learning Path:** Visual adaptive milestone roadmap.
5. **Skill Galaxy:** Interactive 3D/2D prerequisite node visualization.
6. **Weekly Missions:** Active AI sprint deliverables.
7. **Assessments:** Diagnostic quizzes and rubric-based tests.
8. **AI Mentor:** 24/7 contextual career coach.
9. **Portfolio:** Evidence-backed project showcase.
10. **Achievements:** Earned badges, medals, and graduation milestone.


---

# 6. PHASE 4 — FIVE-LEVEL SKILL PROFICIENCY SYSTEM & SKILL GALAXY

## Standardized Five-Level Proficiency Scale
Replace arbitrary percentage guesses with 5 standardized, observable competency tiers:
1. **Level 1 — Beginner:** Theoretical awareness; understands core definitions and concepts.
2. **Level 2 — Basic:** Can implement basic scripts and syntax with guided scaffolding or documentation.
3. **Level 3 — Intermediate:** Independently builds practical modules, handles edge cases, and debugs errors.
4. **Level 4 — Advanced:** Architecturally competent; writes production-grade, optimized code and designs subsystems.
5. **Level 5 — Expert:** Staff-level mastery; designs distributed systems, tunes internal runtime performance, and conducts code audits.

## Three-Tier Evidence Verification Hierarchy
To maintain complete academic integrity, the platform must clearly distinguish:
- **Self-Reported Rating:** Declared by student during onboarding (unverified indicator).
- **Assessment-Verified:** Validated by passing interactive quiz or diagnostic technical test suite (verified badge).
- **Project-Verified:** Proven through shipping practical code artifacts, passing automated tests, or linking GitHub repositories (credential badge).
- **Hard Anti-Hallucination Guardrail:** Prohibit the AI agent or system from marking a student as "Advanced" or "Expert" without verified assessment or project evidence.

## Interactive Skill Galaxy Visualization
Build an interactive node graph representing the learner's evolving knowledge universe:
- **Node Semantics:** Each skill node displays its current level (1–5) and target level.
- **Visual Status Coding:**
  - *Green / Lime Glow:* Verified mastery ($\ge$ required level).
  - *Cyan Ring:* In-progress / active learning milestone.
  - *Amber / Muted:* Critical deficit / blocker requiring practice.
- **Prerequisite Dependency Edges:** Directed connecting lines showing prerequisite chains (e.g., JavaScript $\rightarrow$ TypeScript $\rightarrow$ React $\rightarrow$ Full-Stack Architecture).
- **Interactive Inspection Drawer:** Clicking any node reveals:
  - Skill description and required level for active Target Career.
  - Verification source history (evidence logs).
  - One-click button: *"Practice This Skill in Lab"* or *"Take Assessment"*.

---

# 7. PHASE 5 — PERSONALIZED LEARNING MISSIONS & CAREER SIMULATOR

## AI-Adaptive Weekly Missions
The `RoadmapAgent` generates tailored weekly missions based on the learner's active schedule:
- **Calibrated Mission Count:** Adapts dynamically (e.g., 2–4 missions/week depending on student's committed weekly hours).
- **Structured Mission Schema:**
  - *Objective:* Clear, actionable deliverable (e.g., *"Implement JWT Authentication & Refresh Token Rotation"*).
  - *Estimated Duration:* Realistic time box (e.g., *"1.5 hours"*).
  - *Difficulty:* Beginner, Intermediate, or Advanced.
  - *Target Competency:* Linked skill ID.
  - *Completion Criteria:* Explicit verification requirement (e.g., *"Pass all unit tests in practice challenge"*).
- **Strict Evidence Verification:** Missions are marked completed **only** upon valid submission evidence, never by clicking a fake checkbox.

## Practical Workplace Career Simulator
Simulate genuine on-the-job engineering and analytical scenarios:
- **Scenario Roles:**
  - *Software Engineer:* Debug a memory leak or optimize a sluggish SQL query.
  - *Data Analyst:* Query multi-table schemas to identify customer churn drivers.
  - *AI/ML Engineer:* Fine-tune a prompt pipeline or evaluate model confusion matrices.
  - *Cybersecurity Specialist:* Analyze access logs to identify an unauthorized privilege escalation attempt.
  - *UI/UX Designer:* Critique an accessibility failure and re-architect form ergonomics.
- **Simulation Feedback:** Immediate rubric evaluation linking student decisions to verified competency growth.

---

# 8. PHASE 6 — ASSESSMENT ENGINE, SMART REVISION & AI MENTOR

## Comprehensive Diagnostic Assessment Engine
- **Multimodal Evaluation Formats:**
  - Technical Multiple Choice Questions (concept verification).
  - Scenario-based Architecture Decisions (trade-off analysis).
  - Interactive Algorithmic Coding Challenges (automated test execution).
- **Scoring & Feedback Transparency:**
  - Detailed breakdown of score with question-by-question explanations.
  - Identifies specific conceptual misconceptions.
  - Updates learner skill proficiency in SQLite upon test completion.
  - Incomplete or abandoned assessments remain flagged as incomplete; history is permanently logged.

## Smart Revision System
- **Deficit Detection:** When an assessment score reveals $<60\%$ proficiency in a subtopic, the system flags it as a "High-Priority Revision Focus".
- **Targeted Micro-Lessons:** Suggests brief, focused refresher exercises before allowing a re-attempt.
- **Progressive Re-assessment:** Evaluates improvement post-revision and updates the student's Career Twin and readiness score.

## Context-Aware 24/7 AI Mentor
Powered by Google Gemini 2.5 API with rich situational awareness:
- **System Awareness:** Ingests student's Target Career, Career Twin competency status, skill gaps, assessment history, and active missions.
- **Dual Operating Modes:**
  - *Reactive Mode:* Answers technical questions, explains code syntax, and clarifies confusing concepts.
  - *Student-Controlled Proactive Mode:* Offers strategic sprint advice (e.g., *"You've mastered SQL joins—ready to tackle indexing and query execution plans this week?"*).
- **Zero Fabrication:** The mentor relies strictly on the student's real database records. It never invents nonexistent milestones or false performance claims.


---

# 9. PHASE 7 — PORTFOLIO BUILDER & VERIFIED OPPORTUNITY RADAR

## Student Portfolio Builder
- **Genuine Evidence Aggregation:** Automatically compiles verified competencies, passed coding solutions, completed capstone projects, and milestone certificates into a professional portfolio.
- **Project-to-Skill Mapping:** Learners can register personal or coursework projects, tag utilized technologies, and provide GitHub links or descriptions. The system maps verified project achievements directly to the learner's skill profile.
- **Privacy & Export Controls:**
  - *Private by Default:* Portfolios are strictly private until the student explicitly toggles them public.
  - *Export Options:* Exportable as clean Markdown, JSON resume format, or sharable public URL token.

## Verified Opportunity Radar
- **Curated Early-Career Opportunities:** Live feed of verified internships, collegiate hackathons, open-source fellowship grants, and technical competitions.
- **Verification Integrity Rules:**
  - Every listing must feature: Verified Source, Verification Date, Eligibility Criteria, and an Official Application Link.
  - Strictly NO fabricated opportunities or placeholder deadlines.
  - If a live feed is temporarily unpopulated, display a clean, honest *"Scanning for verified opportunities"* state.

---

# 10. PHASE 8 — ACHIEVEMENTS, MILESTONE TIMELINE & LEARNING CALENDAR

## Meaningful Achievement & Milestone System
- **Real Achievement Criteria:**
  - *Graduation Cap Award:* Unlocked when Career Readiness score crosses the 80% market-ready threshold.
  - *Medal Tiers:* Gold, Silver, and Bronze medals awarded for objective achievements (e.g., passing 10 coding challenges, maintaining a 7-day verified learning streak, completing all roadmap milestones for a target tier).
  - *Tasteful Unlocks:* Subtle, elegant micro-animations on achievement unlock; zero spammy gamification coins or fake points.
- **Immutable Milestone Timeline:** Complete chronological timeline recording student journey from initial registration and onboarding through milestone completions to career readiness.

## Learning Calendar & Focus Mode
- **Personalized Calendar:** Displays upcoming mission deadlines, scheduled practice sessions, and recommended assessment checkpoints.
- **Distraction-Free Focus Mode:** Dedicated full-screen interface for working through individual lessons or coding challenges with zero navigation distractions.

---

# 11. PHASE 9 — SEPARATE ADMIN PORTAL & INSTITUTIONAL OVERSIGHT

## Strict Architectural Separation
- **Independent Entrypoints:** Student portal at `/dashboard`, Admin portal at `/admin/login` and `/admin`.
- **Public Visibility:** "Admin Login" link cleanly presented on landing page and modal for institutional evaluators.
- **Jury Evaluation Access:** Dedicated 1-Click Jury Sign-In on `/admin/login` provisioned via `JURY_ADMIN_EMAIL` and `JURY_ADMIN_PASSWORD` environment variables.
- **Role-Based Access Control (RBAC):** Backend dependency `require_admin` rigorously verifies admin credentials and returns `403 Forbidden` for standard student tokens.

## Admin Portal Modules
1. **Platform Health Diagnostics (`/api/admin/platform-health`):** Live telemetry of SQLite connection state, total registered learners, active students, admin accounts, and AI agent runtime status.
2. **Student Directory & Moderation:** Full search and filter by department, institution, or status. One-click Suspend and Reactivate controls.
3. **Live Intake Feed (`/admin/registrations`):** Real-time stream of incoming student registrations.
4. **Curriculum Manager (`/admin/curriculum`):** Administrative catalog management for free open-access documentation, tutorials, and practice exercises.
5. **Administrative Audit Ledger (`/admin/audit-logs`):** Immutable log table recording all administrative moderation events with operator emails and timestamps.

---

# 12. PHASE 10 — BACKEND ARCHITECTURE, DATABASE MIGRATIONS & SECURITY

## Safe SQLite Migrations
- Use `_safe_add_column` and `CREATE TABLE IF NOT EXISTS` helpers in `backend/app/database_expansion.py` to ensure 100% backward compatibility.
- Never drop existing tables, alter existing column types, or purge user records.
- Preserve all existing registered learner records (60+ real student accounts in `nexora.db`).

## Security & API Validation
- **Authentication:** Bearer token session authentication; bcrypt password hashing for all local credentials.
- **OAuth 2.0:** Secure server-side verification of Google ID tokens and GitHub access tokens.
- **Input Validation:** Strict Pydantic models for all incoming request bodies with type checking and sanitization.
- **CORS Protection:** Configured in `app/config.py` with explicit origins (`localhost`, `127.0.0.1`, and production `FRONTEND_URL`).

---

# 13. PHASE 11 — MANDATORY TESTING, GITHUB & RENDER DEPLOYMENT

## Continuous Test Execution
The implementation agent must run and verify tests at every checkpoint:
1. **Backend Tests:** Run `pytest backend/tests/ -v` to ensure all 25+ unit and integration tests pass cleanly with zero failures.
2. **Frontend Production Build:** Run `npm.cmd --prefix frontend run build` (or `npm run build`) ensuring Vite and TypeScript compile in $<2.5$ seconds with zero errors.
3. **Localhost Validation:** Verify `/api/health` returns `HEALTHY` on port 8000 and the frontend responds with HTTP 200 on port 5173.

## GitHub Delivery
- Review `git status` and `git diff` to ensure zero temporary artifacts, cache files, or secrets are staged.
- Stage changes, commit with clear semantic messages (`feat: ...`, `fix: ...`), and push directly to `origin main` at `https://github.com/vivin222/nexora.git`.
- Never force-push or overwrite remote history.

## Render Deployment & Live Verification
- **Render Configuration:** Maintain single root `render.yaml` with Web Service `nexora-api` (`runtime: python`, `region: oregon`) and Static Site `nexora-web` (`runtime: static`, NO region).
- **Auto-Deploy:** Render automatically triggers builds upon push to `main`.
- **Live Verification:** Open and test the live deployed endpoints:
  - Frontend: `https://nexora-web-9bi2.onrender.com/`
  - Backend: `https://nexora-omw4.onrender.com/api/health`
- Verify student registration, login, career discovery, missions, streaks, and admin portal access on the live production environment.
