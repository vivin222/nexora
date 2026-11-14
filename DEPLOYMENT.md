# NEXORA Deployment & Infrastructure Guide

This guide covers deploying **NEXORA — Your Potential. Reimagined.** to [Render](https://render.com) using Infrastructure-as-Code (`render.yaml`), as well as local development and production configurations.

---

## 1. Architecture Overview

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4, built to static output in `./dist`.
- **Backend:** Python 3.11+ FastAPI with async Uvicorn server.
- **Database:** SQLite with WAL journaling and foreign key integrity.
- **AI Engine:** Google Gemini 2.5 API with multi-agent orchestration.
- **Role-Based Access Control (RBAC):** Distinct Student and Admin portals with institutional approval workflow.

---

## 2. Render Deployment (Blueprint)

NEXORA includes a `render.yaml` blueprint at the root for automated multi-service provisioning.

### Step 1: Connect GitHub Repository
1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** $\rightarrow$ **Blueprint**.
3. Connect `https://github.com/vivin222/nexora.git`.
4. Render will detect `render.yaml` and configure two services:
   - `nexora-api`: Python Web Service (FastAPI)
   - `nexora-web`: Static Site (React/Vite)

### Step 2: Configure Environment Variables
In the Render dashboard, set the following environment variables:

#### Backend (`nexora-api`):
| Variable | Description | Example / Required |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API Key for AI Agents | `AIzaSy...` (Required for live AI) |
| `FRONTEND_URL` | Allowed CORS origin for frontend | `https://nexora-web.onrender.com` |
| `SECRET_KEY` | Session and token signing key | Strong random string |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Web Client ID | `<client-id>.apps.googleusercontent.com` |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | `Ov23...` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | `<github-secret>` |
| `JURY_ADMIN_EMAIL` | Jury Evaluator Admin Account Email | `jury-admin@nexora.ai` (Default) |
| `JURY_ADMIN_PASSWORD` | Jury Evaluator Admin Password | Provisioned securely via Render env |
| `ENVIRONMENT` | Operational environment | `production` |
| `PYTHON_VERSION` | Python runtime version | `3.11.9` |

#### Frontend (`nexora-web`):
| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Full URL to the deployed backend service | `https://nexora-api.onrender.com` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID for frontend | `<client-id>.apps.googleusercontent.com` |
| `VITE_GITHUB_CLIENT_ID` | GitHub OAuth Client ID for frontend | `Ov23...` |

---

## 3. Database Persistence Note

- On Render's Free tier, the SQLite database (`backend/nexora.db`) resides on ephemeral storage. 
- For production persistence on Render:
  1. Attach a **Render Persistent Disk** mounted at `/var/data` on the `nexora-api` web service.
  2. Set `NEXORA_DB_PATH=/var/data/nexora.db` in the backend environment variables.
  3. Alternatively, for enterprise scale, configure PostgreSQL by specifying `DATABASE_URL`.

---

## 4. Student Registration & Admin Portal Access

### Free Open Student Registration
- **URL:** [http://localhost:5173/](http://localhost:5173/) $\rightarrow$ **Get Started Free** (or `/register`)
- **Cost:** 100% Free forever. No payments, subscriptions, or credit card requirements.
- **Activation:** Instantaneous upon form submission. Zero administrator approval, invitation, or manual verification required.
- **Workflow:** Registration $\rightarrow$ Immediate active account $\rightarrow$ Onboarding Wizard (Resume extraction & goal calibration) $\rightarrow$ Student Workspace.

### Dedicated Institutional Admin Portal & Jury Access
- **Direct Routes:** [http://localhost:5173/admin/login](http://localhost:5173/admin/login) or [http://localhost:5173/admin](http://localhost:5173/admin)
- **Visible Link:** Click **Admin Login** in the top navigation bar or on the sign-in modal.
- **Jury & Hackathon Evaluation Access:**
  - Evaluators and judges can access the administrator portal using the **1-Click Jury Admin Sign-In** button on `/admin/login`, or by supplying the configured jury evaluation passkey.
  - Zero hardcoded passwords exposed in client code.
  - Backed by environment variables `JURY_ADMIN_EMAIL` (`jury-admin@nexora.ai`) and `JURY_ADMIN_PASSWORD` (`NexoraJury2026!Evaluator`).
  - Strict RBAC: Any non-admin student token attempting to query `/api/admin/*` receives an immediate `403 Forbidden`.
- **Default Bootstrap Administrator:**
  - **Email:** `admin@nexora.ai`
  - **Password:** `AdminPassword2026!`
  - **Role:** `admin` (enforced via backend RBAC at `/api/auth/admin-login` and `/api/admin/*`)
- **Password Visibility:**
  - Password inputs across both student and administrator interfaces feature an interactive show/hide toggle (Eye icon) for friction-free authentication.
- **Google & GitHub OAuth Integration:**
  - Student registration and login feature official Google and GitHub OAuth options.
  - Backend verifies identity tokens directly with identity provider APIs and auto-provisions student accounts with immediate activation and zero administrative friction.

### Admin Responsibilities
Administrators oversee institutional health rather than gating student registrations:
- **Platform Health Diagnostics:** Live inspection of database connectivity, student enrollment volume, practice problem completions, and AI model health (`/api/admin/platform-health`).
- **Intake & Metrics:** Live telemetry of total students, daily registration volume, active vs. suspended counts.
- **Student Directory & Moderation:** Search/filter learners, view neural competency vectors, and suspend/reactivate accounts when justified.
- **Curriculum Architecture:** Link open-access documentation and interactive labs into student roadmaps (100% free of course selling).
- **Audit Logging:** Immutable audit ledger tracking all administrative actions with operator identities.

---

## 5. Local Development Execution

### Backend:
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows (or source venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend health check is accessible at `http://127.0.0.1:8000/api/health`.

### Frontend:
```bash
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:5173`.

---

## 6. Automated Test Verification

Run all test suites locally prior to deployment:

```bash
# Backend pytest suite (25 tests including OAuth, jury access, readiness diagnostic, and admin RBAC):
cd backend
venv\Scripts\python -m pytest tests/ -v

# Frontend type checking and bundle build:
cd frontend
npm run build
```
