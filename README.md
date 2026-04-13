# 🎯 ATS — AI-Powered Applicant Tracking System

Full-stack ATS with React + Django REST + MySQL + groq AI Agent.

---

## 🚀 Quick Start

### 1. MySQL Database
```sql
CREATE DATABASE ats_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Edit .env with your MySQL password
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser  # optional
python manage.py runserver
```
→ Runs at **http://localhost:8000**

### 3. Frontend
```bash
cd frontend
npm install
npm start
```
→ Runs at **http://localhost:3000**

---

## 📁 Structure

```
backend/
  core/          ← Settings, URLs, WSGI
  users/         ← Custom User, JWT auth
  jobs/          ← Job CRUD
  applications/  ← Resume upload, applications
  services/      ← groq AI agent, PDF parser
  media/         ← Uploaded PDFs (auto-created)

frontend/src/
  api/           ← Axios + all API calls
  context/       ← AuthContext (JWT state)
  components/    ← Navbar, ScoreRing, AgentLog, ProtectedRoute
  pages/         ← All page components
  assets/        ← Global CSS
```

---

## 🤖 AI Agent Pipeline

```
PDF Upload
  ↓
Step 1: extract_skills       → comma-separated skill list
  ↓
Step 2: summarise_experience → 3-5 sentence summary
  ↓
Step 3: score_candidate      → JSON { score: 0-100, reasoning }
  ↓
Step 4: generate_feedback    → recruiter-facing note
  ↓
Saved to DB → shown in dashboard
```

---

## 🔑 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | No | Register |
| POST | `/api/auth/login/` | No | Get JWT tokens |
| GET | `/api/auth/me/` | JWT | Current user |
| GET | `/api/jobs/` | No | List open jobs |
| POST | `/api/jobs/` | Recruiter | Create job |
| PUT | `/api/jobs/:id/` | Recruiter | Update job |
| DELETE | `/api/jobs/:id/` | Recruiter | Delete job |
| GET | `/api/jobs/my/` | Recruiter | My jobs |
| POST | `/api/applications/apply/` | Candidate | Apply + upload PDF |
| GET | `/api/applications/mine/` | Candidate | My applications |
| GET | `/api/applications/job/:id/` | Recruiter | Job applicants |
| PATCH | `/api/applications/:id/status/` | Recruiter | Update status |

---

## ⚠️ Decorator Rule (Django REST Framework)

Always in this order:
```python
@api_view(['POST'])          # 1st
@permission_classes([...])   # 2nd
@parser_classes([...])       # 3rd
def my_view(request):
    ...
```

---

## 🔒 .gitignore

```
backend/venv/
backend/.env
backend/media/
frontend/node_modules/
frontend/.env
frontend/build/
```
