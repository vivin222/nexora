# NEXORA — COMPREHENSIVE REQUIREMENTS INVENTORY
**Project:** NEXORA — Your Potential. Reimagined.  
**Repository:** `https://github.com/vivin222/nexora` (branch: `main`)  
**Deployment Target:** Render (Web Service: `nexora-api`, Static Site: `nexora-web`)  
**Challenge Origin:** PromptWars X RTC Hackathon Problem Statement  

---

## 1. Core Architectural & Business Boundaries
- **Product Definition:** AI-powered Career Intelligence & Personalized Adaptive Learning Platform.
- **Zero Course Selling:** Strictly NO course marketplace, buy buttons, carts, pricing tiers, payment gateways, or monetization locks.
- **Free Open Student Registration:** Instant active account upon signup. Zero administrator approval blockers, manual invitations, or pending status screens.
- **Separate Portals:** Dedicated, findable Admin Portal (`/admin/login`, `/admin`) isolated from Student Portal (`/dashboard`, `/login`, `/register`). Strict backend RBAC returning `403 Forbidden` for students on admin endpoints.
- **Render-Only Target:** Single IaC blueprint (`render.yaml`) with Python backend (`region: oregon`) and static React frontend (no region), configured with environment variables for Gemini API and OAuth credentials.
- **Preserve Existing Records:** Maintain 100% data integrity for all existing registered learners, database schema tables, and API contracts.

---

## 2. Visual & Interactive Direction (Apple × Vercel × CRY NOVA)
- **Design Philosophy:** Minimalist Apple typography hierarchy, spacious layout, generous whitespace, refined micro-borders (`border-white/5` to `border-white/10`), obsidian/charcoal background (`#0B0F12`, `#11171B`), cyan (`#35D9F2`) and lime (`#C5F45B`) identity accents, and warm zinc neutrals.
- **Cursor-Responsive Interactive Visual System:**
  - Lightweight floating visual elements: typographic fragments, small skill illustrations, domain SVG icons (code, AI, data, cybersecurity, cloud, design), and learning objects.
  - Natural mouse interaction: subtle parallax, rotation, spring-like depth, and varied movement speeds.
  - Non-distracting, text remains 100% readable, zero cursor hijacking or replacement.
  - Graceful fallback for mobile (touch/static) and respect for `prefers-reduced-motion`.
- **Graduation Cap Identity:** Meaningful achievement motif used in milestone moments, career readiness unlocks, and skill mastery celebrations with refined animations.

---

## 3. Guided Career Discovery & Selection Flow (CRITICAL)
- **Target Career Preset Prohibition:** Target Career must NOT appear pre-selected or generic before discovery is conducted.
- **Guided Discovery Questionnaire:** Multi-step wizard collecting:
  - Education level, degree, department, current academic year.
  - Core interests, domain passions, and long-term career aspirations.
  - Existing skills with self-rated proficiencies (1 to 5).
  - Practical projects, technical experience, certifications, and GitHub/portfolio links.
  - Preferred learning styles and weekly hour commitment.
- **AI Profile Analysis:** Multi-agent DAG analyzes candidate evidence, identifies baseline strengths, detects skill deficits, and computes career compatibility.
- **Top 3 Career Recommendations:** Displays top 3 matching roles with transparent comparisons (match percentage, required skills, current overlap, critical gaps, compensation trends, and match rationale).
- **Target Career Confirmation:** Student actively selects one role as Target Career, triggering immediate generation of:
  - Personalized career roadmap.
  - Skill dependency DAG.
  - Adaptive learning mission sequence.
  - Curated practical projects and diagnostic assessments.
- **Retake & Recalibration:** Student can retake discovery anytime without silent overwrite of active progress.
- **Career Twin Synchronization:** Digital Twin state continuously mirrors selected career, verified skills, and roadmap progress.

---

## 4. Action-First Student Dashboard & Quick Access
- **"What's Next?" Hero Element:** Prominent Next Best Action answering: *"What should I do next to move closer to my Target Career?"* Displays task title, direct rationale, estimated completion time, and a 1-click action button.
- **Meaningful Learning Streak:** Tracks genuine daily learning (submitting code, completing lessons, passing assessments, landing milestones), never login alone. Includes weekly calendar view, longest streak, and gentle recovery tips with zero shaming.
- **Quick Access Hub:** Desktop and mobile shortcuts for Continue Learning, What's Next, Target Career, Learning Path, Skill Galaxy, Weekly Missions, Assessments, AI Mentor, Portfolio, and Achievements.
- **Responsive Layout:** Adaptive desktop sidebar, tablet layout, and touch-optimized mobile navigation with zero horizontal overflow.

---

## 5. Five-Level Skill Proficiency System & Skill Galaxy
- **Five Standardized Levels:** Beginner (1), Basic (2), Intermediate (3), Advanced (4), Expert (5).
- **Evidence Verification Hierarchy:** Explicitly differentiates between:
  1. Student Self-Rating.
  2. Assessment-Verified Proficiency.
  3. Project-Verified Competency.
- **Strict Verification Safeguards:** Prohibits AI from marking skills as Advanced or Expert without verified assessment or project evidence.
- **Interactive Skill Galaxy:** Visual node-based competency graph displaying current proficiency, required target levels, prerequisite dependency links, verified status, and clickable modal with direct practice tasks.

---

## 6. Personalized Weekly Learning Missions
- AI-generated adaptive missions calibrated to student weekly hour availability.
- Clear objectives, difficulty level, estimated duration, linked competency, and validation criteria.
- Only marked complete upon genuine submission evidence (code validation, lesson quiz, project milestone).

---

## 7. Comprehensive Assessment & Adaptive Testing
- Supports Multiple Choice Questions (MCQs), scenario-based technical questions, coding lab problems, and practical project deliverables.
- Transparent scoring, rubric explanations, immediate feedback, and verified proficiency updates.
- Incomplete assessments never marked complete; assessment history persisted in database.

---

## 8. Context-Aware AI Mentor
- Full situational awareness: student's Target Career, Career Twin competency matrix, skill gaps, assessment track record, and active missions.
- Dual-mode support: Reactive (answering student questions, explaining code) and Student-Controlled Proactive (suggesting next actions, project architectures).
- Strict data privacy: Never fabricates student history or exposes API credentials to frontend.

---

## 9. Student Portfolio Builder
- Synthesizes genuine evidence: verified skills, completed projects, passed assessments, certificates, and learning timeline.
- Privacy-first: Private by default with student-controlled public link generation.
- Exportable format for internship and job applications.

---

## 10. Practical Career Simulator
- Role-based workplace challenges across Software Engineering, Data Analysis, AI/ML, Cybersecurity, and UI/UX Design.
- Practical problem solving mapped directly to competency verification (clearly labeled as simulation, not fake job employment).

---

## 11. Smart Revision & Project-to-Skill Mapping
- **Smart Revision:** Detects assessment deficits, generates targeted review modules, and offers focused re-assessment.
- **Project-to-Skill Mapping:** Allows learners to attach GitHub repositories or project files, automatically mapping code deliverables to verified skills.

---

## 12. Verified Opportunity Radar
- Curated discovery feed for internships, hackathons, open-source grants, and student technical competitions.
- Every entry strictly dated, sourced, and verified with official application links.
- Honest empty/unavailable state if live verified feeds are unavailable (never fabricated).

---

## 13. Achievements, Milestones & Learning Calendar
- Real criteria achievements: Graduation Cap (career readiness), Medals (Gold/Silver/Bronze), Skill Mastery, and Streak Milestones.
- Milestone Timeline tracking student journey from onboarding to placement-ready.
- Learning Calendar with mission deadlines, assessment schedules, and integrated Focus Mode.

---

## 14. Separate Administrator Portal & Institutional Health
- Distinct `/admin/login` and `/admin` routes.
- Live platform health telemetry (`/api/admin/platform-health`): DB connection status, registered vs active students, total submissions.
- Real-time student directory, search/filter, and instant suspend/reactivate moderation.
- Curriculum resource management and immutable administrative audit ledger (`admin_audit_logs`).

---

## 15. Security, Database & Deployment Invariants
- Safe SQLite migrations preserving all existing tables and records.
- Proper Bearer token authentication, password hashing (`bcrypt`), and strict RBAC (`require_admin`).
- OAuth 2.0 verification for Google and GitHub.
- Zero hardcoded passwords; Render environment variable support for `JURY_ADMIN_EMAIL` and `JURY_ADMIN_PASSWORD`.
- Full test suite: 25+ backend pytest tests, frontend Vite production build passing in <2 seconds.
- Continuous delivery: Git commit, push to `main`, and Render live deployment verification.
