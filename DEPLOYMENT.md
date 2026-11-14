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
| `ENVIRONMENT` | Operational environment | `production` |
| `PYTHON_VERSION` | Python runtime version | `3.11.9` |

#### Frontend (`nexora-web`):
| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Full URL to the deployed backend service | `https://nexora-api.onrender.com` |

---

## 3. Database Persistence Note

- On Render's Free tier, the SQLite database (`backend/nexora.db`) resides on ephemeral storage. 
- For production persistence on Render:
  1. Attach a **Render Persistent Disk** mounted at `/var/data` on the `nexora-api` web service.
  2. Set `NEXORA_DB_PATH=/var/data/nexora.db` in the backend environment variables.
  3. Alternatively, for enterprise scale, configure PostgreSQL by specifying `DATABASE_URL`.

---

## 4. Default Seed Credentials

Upon first startup, the database auto-migrates and provisions the bootstrap institutional administrator:

- **Portal:** Institutional Admin Governance
- **Email:** `admin@nexora.ai`
- **Password:** `AdminPassword2026!`
- **Role:** `admin` (Authorized for student admissions, status management, curriculum creation, and audit logging)

Student accounts register via the public portal, enter their academic batch and campus credentials, and enter `pending` status until authorized by an administrator.

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
# Backend pytest suite (18 tests including admin portal RBAC):
cd backend
venv\Scripts\python -m pytest tests/ -v

# Frontend type checking and bundle build:
cd frontend
npm run build
```
