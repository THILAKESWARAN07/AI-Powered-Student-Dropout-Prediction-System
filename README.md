# DropGuard – AI Powered Student Dropout Prediction System

DropGuard is an advanced, multi-tier intelligence system designed to predict and prevent student dropouts in educational institutions. Using modern machine learning inference combined with secure database tracking, DropGuard provides administrators, headmasters, and teachers with the data-driven insights needed to identify high-risk students and coordinate timely interventions.

---

## 📋 Problem Statement

Educational institutions face challenges with early student dropouts, often driven by factors ranging from academic struggles and poor attendance to socio-economic hardships, family circumstances, and digital divide constraints. Traditional administrative tools lack predictive capability, leaving educators unaware of dropout indicators until it is too late.

DropGuard addresses this gap by aggregating key demographics, metrics, and academic results, then passing them through a machine learning classifier to identify students at risk *before* dropouts occur.

---

## 🎯 Objectives

1. **Early Risk Detection**: Run predictive machine learning modeling on student profiles to flag risk tiers early.
2. **Visual Insights**: Provide charts and feature importances (Explainable AI via SHAP) showing why a student is flagged.
3. **Actionable Recommendations**: Deliver personalized behavioral and financial counseling advice based on specific risk factors.
4. **Institutional Security**: Restrict access permissions on student records based on role hierarchies (Admin, Headmaster, Teacher).

---

## ✨ Features

- **Multi-Role User Dashboard**: 
  - **Admin**: System-wide configuration, school registry management, and global analytics.
  - **Headmaster**: Scoped school dashboard, user setup, student database access, and CSV wizard importing.
  - **Teacher**: Local classroom rosters, risk prediction updates, and individual student profiles.
- **CSV Smart Importer**: Wizard mapper that automatically parses CSV column headers, validates data formats, prevents duplicate imports, and executes database transactions safely.
- **AI Dropout Risk Inference**: Classifies student records into **High**, **Medium**, or **Low** risk tiers, along with confidence score ratings.
- **Explainable AI (XAI)**: Displays human-readable explanations of the key drivers behind each student's risk score (powered by SHAP analysis).
- **Automated Recommendation Engine**: Recommends personalized actions based on the student's metrics (e.g., academic support, financial aid referrals, counseling).
- **Excel & CSV Report Exports**: Exposes student registries and risk analysis matrices in `.xlsx` and `.csv` formats.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TailwindCSS, Vite, Framer Motion, Lucide React, Axios.
- **Backend**: FastAPI, SQLAlchemy ORM, Pydantic validations, python-jose (JWT), Alembic.
- **Database**: PostgreSQL (relational database).
- **Machine Learning**: CatBoost Classifier (for tabular inference), SHAP (for explainability insights).

---

## 🗺️ Architecture Diagram

```mermaid
graph TD
    A[React Client Frontend] -->|REST API Requests| B[FastAPI Backend Router]
    B -->|User Session auth| C[JWT Security Middleware]
    B -->|Inference Execution| D[CatBoost Model Engine]
    D -->|Explainability Metrics| E[SHAP Explanations]
    B -->|Database Querying| F[SQLAlchemy ORM]
    F -->|Data Persistence| G[PostgreSQL Database]
```

---

## 📂 Folder Structure

```
├── backend/                  # FastAPI REST API Backend
│   ├── alembic/              # Database migration history
│   ├── app/                  # Application source
│   │   ├── api/              # Routers and dependencies
│   │   ├── core/             # Security, logging and configuration
│   │   ├── db/               # Session setup and seeds
│   │   ├── ml/               # Model binaries, loaders, and metrics
│   │   ├── models/           # SQLAlchemy DB models
│   │   ├── schemas/          # Pydantic schemas
│   │   └── services/         # Business logic & inference engines
│   └── requirements.txt      # Python backend packages
├── dataset/                  # Initial model training CSV datasets
├── frontend/                 # React 19 Client Application
│   ├── src/                  # Source files
│   │   ├── components/       # Custom cards, headers, sidebars
│   │   ├── context/          # State and auth context bindings
│   │   ├── pages/            # View pages and wizards
│   │   └── services/         # API connection handlers
│   ├── package.json          # Node dependency definitions
│   └── vite.config.js        # Vite configurations
└── README.md                 # Project documentation
```

---

## 🗄️ Database Schema

The database uses a clean, normalized relational model with cascaded deletes to prevent orphan records:

| Table | Columns | Purpose |
| :--- | :--- | :--- |
| **schools** | `id`, `school_name`, `school_code`, `created_at` | Stores educational institution details. |
| **users** | `id`, `full_name`, `email`, `password_hash`, `role`, `school_id`, `is_active`, `email_verified` | Manages credentials, roles, and assigned schools. |
| **students** | `id`, `student_id`, `full_name`, `gender`, `age`, `class_name`, `section`, `medium_of_instruction`, `community`, `distance_to_school_km`, `school_type`, `school_id` | Core demographics of enrolled students. |
| **student_academics** | `id`, `student_id`, `previous_year_percentage`, `overall_percentage`, `number_of_failed_subjects`, `academic_backlogs` | Academic achievements and history. |
| **student_attendance** | `id`, `student_id`, `attendance_percentage`, `consecutive_absences`, `leave_days`, `late_arrivals` | Classroom attendance metrics. |
| **student_behaviour** | `id`, `student_id`, `homework_completion`, `discipline_incidents`, `teacher_feedback`, `low_motivation` | Classroom engagement and behavioural reports. |
| **student_family** | `id`, `student_id`, `family_income`, `parents_education`, `single_parent`, `financial_difficulty`, `child_labour_risk` | Socio-economic and domestic details. |
| **student_health** | `id`, `student_id`, `chronic_illness`, `nutrition_status`, `vision_problems`, `mental_health_risk` | Physical and mental wellness indicators. |
| **student_technology** | `id`, `student_id`, `internet_access`, `smartphone_access`, `computer_access`, `electricity_availability` | Digital access indicators. |
| **student_predictions** | `id`, `student_id`, `dropout_risk`, `dropout_status`, `probability`, `confidence`, `top_features`, `recommended_actions` | History logs of ML predictions. |

---

## 🚀 Installation Guide

### Prerequisites
- **Python**: version 3.10 or higher.
- **Node.js**: version 18.0 or higher.
- **PostgreSQL**: version 13 or higher.

---

### Backend Setup

1. **Navigate to backend folder**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup environment variables**:
   Create a `.env` file in the `backend` folder based on `.env.example`:
   ```ini
   ENVIRONMENT=development
   DATABASE_URL=postgresql://postgres:password@localhost:5432/dropout_prediction_db
   SECRET_KEY=generate-a-secure-secret-key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ```

5. **Run database migrations**:
   ```bash
   alembic upgrade head
   ```

6. **Start Uvicorn backend server**:
   ```bash
   uvicorn app.main:app --reload
   ```

---

### Frontend Setup

1. **Navigate to frontend folder**:
   ```bash
   cd ../frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment variables**:
   Create a `.env` file in the `frontend` folder:
   ```ini
   VITE_API_URL=http://localhost:8000/api/v1
   ```

4. **Start Vite development server**:
   ```bash
   npm run dev
   ```

---

## 🖼️ Screenshots

*Placeholders for system interface screenshots:*

1. **Dashboard Overview**: `![Dashboard Overview](docs/screenshots/dashboard.png)`
2. **CSV Import Wizard**: `![CSV Import Wizard](docs/screenshots/import_wizard.png)`
3. **Risk Analysis Timeline**: `![Risk Analysis](docs/screenshots/risk_analysis.png)`

---

## 🌐 API Documentation

Once the backend starts, interactive API documentation is automatically generated:
- **Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Redoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🤖 ML Model Information

DropGuard's core classifier is a **CatBoost Classification Model** trained on student academic and socio-economic demographics.
- **Model Metrics**: Accuracy: **92.05%** | ROC AUC: **95.35%**
- **Explainability**: SHAP (SHapley Additive exPlanations) values are extracted during inference to present educators with the top 3 feature factors contributing positively or negatively to the risk level.

---

## ☁️ Deployment Guide

### Heroku / Render (Backend)
1. Deploy the backend code containing your `Dockerfile.backend`.
2. Provision a managed PostgreSQL database.
3. Configure settings in dashboard environment variables (`DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`).

### Netlify / Vercel (Frontend)
1. Link your frontend directory.
2. Build command: `npm run build`, Output directory: `dist`.
3. Set environment variable: `VITE_API_URL` pointing to the deployed backend.

---

## 🔮 Future Scope

- **Intervention Tracking**: Add workflow features enabling teachers to log meetings, counseling sessions, and financial aid referrals to monitor student risk level improvements.
- **Automated Alerts**: Email or SMS notifications dispatched to school counselors when a student enters the "High" risk tier.
- **SMS Student Support**: Interactive chatbot channels supporting query features for parents.

---

## 👥 Contributors
- **DropGuard System Architects & Developers**

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
