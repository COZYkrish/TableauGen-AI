# TableauGen AI

> **AI-powered Tableau dashboard generator** — upload a CSV, get a production-ready `.twbx` file with intelligent chart recommendations, KPI cards, statistical insights, and time-series forecasts.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🗂 CSV Upload | Drag-and-drop upload with type detection and validation |
| 📊 Dataset Profiler | Statistical profiling: distributions, nulls, outliers, correlations |
| 🧠 Metadata Engine | Semantic type inference (currency, geography, dates, categories) |
| 🎯 Recommendation Engine | AI-scored chart recommendations (bar, line, scatter, pie, map, treemap) |
| 💡 KPI Generator | Auto-generated KPI cards with Tableau calculated field expressions |
| 🗺 Dashboard Planner | Blueprint JSON with grid layout, filters, and 4 color themes |
| 📁 Tableau Generator | Valid `.twb` XML (Tableau 2021.1+ compatible) |
| 📦 Export Manager | Packages `.twb` + CSV into a standard `.twbx` archive |
| 🔍 Insight Engine | 5-category statistical insights (distribution, correlation, trend, quality) |
| 📈 Forecast Engine | Linear/moving-average/seasonal-naive time-series forecasts |
| 📝 Narrative Engine | Auto-generated executive summaries and action items |
| 🔐 Auth | JWT-based signup, login, and session management |
| 🏗 Project Management | Rename, delete, search, filter, and track projects |
| 📜 Export History | Full audit trail with file sizes and download links |

---

## 🏗 Architecture

```
CSV Upload
  ↓
Dataset Profiler      (statistics, type detection)
  ↓
Metadata Engine       (field roles, semantic types, aggregations)
  ↓
Recommendation Engine  (6 rule modules → ranked chart list)
  ↓
KPI Generator         (KPI cards with Tableau formulas)
  ↓
Dashboard Planner     (Blueprint JSON — theme, layout, filters)
  ↓
Tableau Generator     (.twb XML)
  ↓
Export Manager        (.twbx ZIP)

Parallel:
Insight Engine        (statistical insights)
Forecast Engine       (time-series projections)
Narrative Engine      (natural-language summaries)
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS v4, Framer Motion |
| Backend | FastAPI, SQLAlchemy, SQLite/PostgreSQL, Pydantic v2, Loguru |
| Export | Python standard library (xml.etree, zipfile) |
| Auth | JWT (python-jose), bcrypt |
| Container | Docker, Docker Compose, Nginx |

---

## 🚀 Quick Start (Development)

### Prerequisites
- Python 3.11+
- Node.js 20+
- Git

### Backend

```bash
cd backend

# Create virtualenv
python -m venv venv
.\venv\Scripts\activate          # Windows
# source venv/bin/activate       # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.template .env          # Windows
# cp .env.template .env          # macOS/Linux
# Edit .env — at minimum change SECRET_KEY

# Run dev server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/api/docs

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (proxies /api → localhost:8000)
npm run dev
```

App: http://localhost:5173

---

## 🐳 Docker Deployment

```bash
# Build and run everything
docker compose up --build -d

# Check logs
docker compose logs -f backend

# Stop
docker compose down
```

App: http://localhost:80

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login → JWT token |
| GET  | `/api/auth/me` | Current user profile |
| PATCH | `/api/auth/me` | Update profile |
| GET  | `/api/projects/` | List user's projects |
| GET  | `/api/projects/stats/summary` | Project stats |
| GET  | `/api/projects/exports/history` | Export audit log |
| PATCH | `/api/projects/{id}` | Rename project |
| DELETE | `/api/projects/{id}` | Delete project |
| POST | `/api/uploads/` | Upload CSV |
| GET  | `/api/uploads/{id}/profile` | Get dataset profile |
| POST | `/api/dashboard/{id}/generate` | Generate Blueprint |
| GET  | `/api/dashboard/{id}` | Get stored Blueprint |
| POST | `/api/dashboard/{id}/export` | Generate `.twbx` |
| GET  | `/api/dashboard/{id}/download` | Download `.twbx` |
| GET  | `/api/intelligence/{id}/insights` | Statistical insights |
| GET  | `/api/intelligence/{id}/forecast` | Time-series forecast |
| GET  | `/api/intelligence/{id}/narrative` | AI narrative |
| GET  | `/api/intelligence/{id}/full` | Combined intelligence |

Full interactive docs: http://localhost:8000/api/docs

---

## 📁 Project Structure

```
TableauGen AI/
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI routers
│   │   │   ├── auth.py
│   │   │   ├── projects.py
│   │   │   ├── uploads.py
│   │   │   ├── dashboard.py
│   │   │   └── intelligence.py
│   │   ├── core/             # Config, DB, security
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   │   ├── dataset_profiler/
│   │   │   ├── metadata_engine/
│   │   │   ├── recommendation_engine/
│   │   │   │   └── rules/    # 6 chart-type rule modules
│   │   │   ├── kpi_generator/
│   │   │   ├── dashboard_planner/
│   │   │   ├── insight_engine/
│   │   │   ├── forecast_engine/
│   │   │   └── narrative_engine/
│   │   └── plugins/
│   │       ├── tableau_generator/  # .twb XML generator + validator
│   │       └── export_manager.py   # .twbx packaging
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.template
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   └── dashboard/
│   │   │       ├── ProjectsPage.tsx
│   │   │       ├── UploadPage.tsx
│   │   │       ├── ProfilePage.tsx
│   │   │       ├── DashboardPage.tsx
│   │   │       ├── IntelligencePage.tsx
│   │   │       ├── HistoryPage.tsx
│   │   │       └── SettingsPage.tsx
│   │   ├── layouts/DashboardLayout.tsx
│   │   └── lib/api.ts
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

---

## 🔐 Security Notes

- Change `SECRET_KEY` in `.env` before deploying to production
- Use PostgreSQL instead of SQLite for multi-user/production deployments
- Enable HTTPS via a reverse proxy (nginx, Caddy, or cloud load balancer)
- File uploads are stored server-side — review `UPLOAD_DIR` permissions

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
