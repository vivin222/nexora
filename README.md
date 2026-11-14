# NEXORA — Your Potential. Reimagined.

> **An Autonomous AI-Powered Personalized Learning & Career Intelligence Platform**

NEXORA operates as an adaptive career intelligence engine that diagnoses a learner's exact competency deficits, calculates mathematically rigorous readiness scores, and orchestrates an evolving learning journey through a collaborating multi-agent architecture.

---

## 1. System Architecture

NEXORA rejects generic course catalogs. Instead of serving an identical static video playlist to every student, NEXORA deploys a **Directed Acyclic Graph (DAG) Multi-Agent System** that synchronizes real-time learner evidence into personalized, prioritized milestones.

```
                    ┌───────────────────────────────┐
                    │      CENTRAL ORCHESTRATOR     │
                    │ (Deterministic DAG Pipeline)  │
                    └──────────────┬────────────────┘
                                   │
      ┌────────────────┬───────────┴───────────┬────────────────┬────────────────┐
      ▼                ▼                       ▼                ▼                ▼
┌───────────┐   ┌──────────────┐        ┌──────────────┐ ┌─────────────┐  ┌─────────────┐
│  Profile  │   │Skill Analysis│        │    Career    │ │   Roadmap   │  │  Resource   │
│   Agent   │   │    Agent     │        │ Intelligence │ │    Agent    │  │    Agent    │
│(Competency│   │(Deterministic│        │    Agent     │ │(Topological │  │(Curriculum &│
│ Ingestion)│   │  Gap Math)   │        │(Role Benchm.)│ │ Sequencer)  │  │ Asset Labs) │
└─────┬─────┘   └──────┬───────┘        └──────┬───────┘ └──────┬──────┘  └──────┬──────┘
      │                │                       │                │                │
      └────────────────┴───────────────────────┴────────────────┴────────────────┘
                                               │
                                      ┌────────┴────────┐
                                      ▼                 ▼
                            ┌───────────────────┐ ┌───────────┐
                            │    Assessment     │ │ AI Mentor │
                            │       Agent       │ │ (Gemini & │
                            │ (Empirical Loop)  │ │ Context)  │
                            └───────────────────┘ └───────────┘
```

### The 6 Specialized Agents
1. **Profile Agent**: Ingests verified competencies, degrees, certifications, and GitHub repositories into a unified learner knowledge graph.
2. **Skill Analysis Agent**: Computes deterministic weighted mathematical gap scores between current abilities and target role criteria. Zero hallucinated metrics.
3. **Career Intelligence Agent**: Evaluates real-time compensation bands, market demand trajectories, and role hurdles to contextualize readiness.
4. **Roadmap Agent**: Synthesizes topologically ordered milestones, prioritizing missing and high-impact skills first while preserving completion history.
5. **Resource Agent**: Curates free high-yield documentation, hands-on tutorials, and production-grade project repositories for each deficit.
6. **Assessment Agent**: Evaluates empirical quiz submissions, provides question-by-question technical rationale, and automatically updates verified proficiency levels to trigger downstream recalibration.

---

## 2. Key Features

- **Void Black & Crimson Visual Identity**: Bespoke luxury interface inspired by modern aerospace telemetry and editorial technology interfaces. No generic purple AI templates.
- **Deterministic Competency Scoring**: Career match percentage is calculated mathematically using weighted ratios ($P / R \times W$), ensuring repeatable, transparent metrics.
- **Empirical Adaptive Quizzes**: Submissions dynamically adjust verified skill proficiency and trigger downstream roadmap adaptation in real time.
- **Context-Injected AI Mentor**: Powered by Google Gemini (`google-genai` official SDK) with a high-fidelity local deterministic engine fallback when unauthenticated.
- **Live Agent Telemetry Stream**: Transparent audit logs showing every agent action, input payload, output summary, and millisecond latency.
- **Cross-Platform Responsive UI**: Fluid typography and layout engineered for desktop, tablet, and mobile displays without horizontal overflow.

---

## 3. Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Python 3.13, FastAPI, Uvicorn, Pydantic v2
- **Database**: SQLite (persisted locally with relational constraints & foreign keys)
- **AI Engine**: Google Gemini API via official `google-genai` Python SDK + Deterministic Fallback Engine

---

## 4. Quick Start & Execution

### Prerequisites
- Node.js >= 18 (Tested on Node v24)
- Python >= 3.11 (Tested on Python 3.13)

### 1. Backend Setup
```bash
# Navigate to project root
cd NEXORA

# Activate virtual environment
backend\venv\Scripts\activate   # Windows
# source backend/venv/bin/activate  # macOS / Linux

# Install dependencies (already satisfied in workspace)
pip install -r backend/requirements.txt

# Run backend server
python backend/run.py
```
*Backend runs on:* `http://127.0.0.1:8000`  
*Interactive Swagger API Docs:* `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```bash
# In a separate terminal
cd NEXORA/frontend

# Install dependencies (already satisfied in workspace)
npm install

# Start Vite dev server
npm run dev -- --host --port 5173
```
*Frontend runs on:* `http://localhost:5173/`

---

## 5. Environment Variables

Create `.env` in the root or `backend/.env`:
```env
# Server
PORT=8000
HOST=127.0.0.1
DEBUG=True

# Gemini AI (Optional: if omitted, NEXORA seamlessly operates via its high-fidelity deterministic engine)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Database
DATABASE_PATH=nexora.db

# Security
SECRET_KEY=nexora-hyperion-intelligence-secret-key-2026
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

---

## 6. Automated Testing Suite

NEXORA includes full unit and end-to-end integration test suites verifying all 10 core workflow steps:
```bash
# Run all tests
backend\venv\Scripts\pytest backend\tests -v -s
```

### Verified Test Cases
1. `test_health_check`: Validates system status and database connectivity.
2. `test_list_careers`: Verifies career catalogs and requirement schemas.
3. `test_get_profile`: Verifies learner profile ingestion.
4. `test_skill_analysis`: Verifies mathematical gap diagnostic.
5. `test_get_roadmap`: Validates topological milestone generation.
6. `test_mentor_chat`: Verifies context injection and conversational response.
7. `test_agent_telemetry`: Verifies agent status roster and execution audit logs.
8. `test_full_10_step_e2e_workflow`: Validates full registration, skill ingestion, assessment scoring, milestone completion, second assessment adaptation, and AI mentor guidance loop.
9. `test_career_match_calculation`: Validates deterministic mathematical weighted scoring logic.

---

## 7. Project Structure

```
NEXORA/
├── backend/
│   ├── app/
│   │   ├── config.py              # Environment configuration
│   │   ├── database.py            # SQLite schema & connection manager
│   │   ├── main.py                # FastAPI entrypoint & router mounts
│   │   ├── data/
│   │   │   └── seed_data.py       # Master skills, careers, quizzes, and resources
│   │   ├── models/
│   │   │   └── schemas.py         # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── auth.py            # Registration & token management
│   │   │   ├── profile.py         # Learner profile & skills CRUD
│   │   │   ├── careers.py         # Career catalogue & role selection
│   │   │   ├── skills.py          # Master skills & live gap diagnostics
│   │   │   ├── assessments.py     # Adaptive quiz delivery & grading
│   │   │   ├── roadmap.py         # Dynamic milestone management
│   │   │   ├── progress.py        # Analytics, charts, & audit trail
│   │   │   ├── mentor.py          # AI Mentor chat with context injection
│   │   │   └── agents.py          # Agent telemetry & cycle orchestration
│   │   └── services/
│   │       ├── ai_service.py      # Google GenAI SDK wrapper + fallback engine
│   │       ├── orchestrator.py    # Central Agent Orchestrator (DAG)
│   │       ├── scoring.py         # Pure mathematical scoring engine
│   │       ├── security.py        # Password hashing & verification
│   │       └── agents/            # The 6 specialized agents
│   │           ├── profile_agent.py
│   │           ├── skill_analysis_agent.py
│   │           ├── career_agent.py
│   │           ├── roadmap_agent.py
│   │           ├── resource_agent.py
│   │           └── assessment_agent.py
│   ├── tests/
│   │   ├── test_api.py            # Endpoint unit tests
│   │   ├── test_e2e_flow.py       # Full 10-step lifecycle test
│   │   └── test_scoring.py        # Mathematical scoring unit tests
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts          # Typed fetch client
│   │   ├── types/
│   │   │   └── index.ts           # Unified TypeScript definitions
│   │   ├── components/
│   │   │   ├── common/            # Badge, CrimsonButton, etc.
│   │   │   ├── landing/           # Hero, Showcase, HowItWorks, Ecosystem, Comparison, CTA
│   │   │   ├── dashboard/         # Overview, Skills, Careers, Roadmap, Quiz, Mentor, Telemetry, Settings
│   │   │   ├── Navbar.tsx         # Universal luxury navigation
│   │   │   └── Footer.tsx         # Technical architecture footer
│   │   ├── App.tsx                # Master View state router
│   │   ├── index.css              # Void black & crimson design system
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── .env.example
├── .gitignore
├── README.md
└── nexora.db                      # Local SQLite database
```

---

## 8. License & Credits

Built for the NEXORA Master Engineering Command.  
*Your Potential. Reimagined.*
