# DropGuard 🛡️ — AI-Powered Student Dropout Prediction System...

<div align="center">
  
  <br />
  
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

  <p align="center">
    <strong>An enterprise-grade educational intelligence platform leveraging Machine Learning to predict student dropout risks and power timely, targeted institutional interventions.</strong>
  </p>

</div>

---

## 🚀 Live Demo

Experience DropGuard live using the deployed application or explore the backend APIs through the interactive documentation.

| Resource | Link |
|----------|------|
| 🌐 Live Application | [https://ai-powered-student-dropout-predicti.vercel.app](https://ai-powered-student-dropout-predicti.vercel.app) |
| ⚙️ Backend API | [https://dropguard-backend.onrender.com](https://dropguard-backend.onrender.com) |
| 📖 Swagger API Documentation | [https://dropguard-backend.onrender.com/docs](https://dropguard-backend.onrender.com/docs) |
| 📚 ReDoc API Documentation | [https://dropguard-backend.onrender.com/redoc](https://dropguard-backend.onrender.com/redoc) |

> **Note:** The backend is deployed on Render's free plan. If the application has been inactive for some time, the first request may take approximately **30–60 seconds** while the backend service starts. Subsequent requests will respond normally.

---

## 📌 Overview

**DropGuard** is a multi-role web application designed to help educational institutions combat student attrition. By combining advanced Machine Learning algorithms with multi-dimensional student profiling, DropGuard proactively identifies students at risk of dropping out *before* they disengage.

### ❓ Why DropGuard Was Built
Educational dropouts are rarely caused by a single factor. They are the result of compounding issues across academics, attendance, socio-economic hardships, family stability, and digital access barriers. Traditional student information systems are reactive, displaying historical statistics when it is often too late to intervene. DropGuard transforms this paradigm into a proactive model.

### 👥 Who Can Use It
- **System Administrators (DEO / Admin)**: Enforce global school registries, audit system operations, and manage administrative credentials.
- **Headmasters / School Principals**: Monitor school-wide metrics, perform bulk database migrations via intelligent CSV uploads, and manage teaching staff.
- **Teachers / Educators**: Maintain classroom rosters, edit individual student profiles, log performance details, and access machine learning explainability dashboards to understand and address student risks.

### 📈 Real-World Educational Impact
By giving educators an interactive, predictive window into student struggles, DropGuard drives metrics-based actions. The integration of **Explainable AI (XAI)** highlights the exact root causes of a student's risk profile—be it attendance drops, technology deserts, or socio-economic strain—allowing school counselors to implement tailored financial, academic, or counseling support systems.

---

## ✨ Key Features

### 🔐 Authentication & Session Security
- **JWT Session Authorization**: Cryptographically signed JSON Web Tokens for stateless, secure API validation.
- **Role-Based Access Control (RBAC)**: Strict separation of privileges between Admins, Headmasters, and Teachers.
- **Automatic School Isolation**: Direct row-level security filtering ensures educators only access student records belonging to their assigned institution.

### 🏫 School & Registry Management
- **School Registry CRUD**: Complete lifecycle management of schools with detailed regional tracking (districts, blocks, villages).
- **User Directory**: Central user repository with status toggles (`is_active`) and email verification attributes.
- **Audit Trails**: Global activity logging tracking IP addresses, operational actions, timestamps, and detail payloads.

### 🧑‍🎓 Student Administration & CSV Wizard
- **Comprehensive Profiles**: Management of demographic, academic, behavioral, health, and technological attributes.
- **Smart CSV Import Wizard**:
  - **Dynamic Column Mapping**: Map arbitrary CSV columns to database schemas in real-time.
  - **Live Preview & Dry Run**: Inspect data parsing before initiating database commits.
  - **Robust Validation**: Identifies duplicates, parses formatting errors, and displays a comprehensive import summary.
  - **Transactional Bulk Import**: Inserts large student batches safely using rollback mechanics.

### 🤖 Machine Learning Inference Engine
- **CatBoost Classifier**: Advanced gradient boosting model trained on multi-dimensional tabular datasets.
- **Dual Inference Flow**: Supports single student updates and scheduled batch predictions.
- **Explainable Insights (SHAP)**: Renders the top three driving features behind a student's predicted risk score.
- **Prescriptive Actions**: Contextual recommendations generated dynamically based on the student's primary risk vectors.

### 📊 Modern UI & Responsive UX
- **Interactive Dashboards**: Live data visualizations displaying risk distributions, attendance trends, and recent logs.
- **Student History Timeline**: Chronological record tracking a student's performance logs and risk status over time.
- **Optimistic UI Updates**: Instant state feedback on forms and logs for smooth navigation.
- **Backend Cold-Start Handling**: Built-in backend wake-up triggers and premium loading screens for serverless deployments.

---

## 🖼️ System Interface & Mockups

| Screen | Preview Placeholder | Description |
| :--- | :--- | :--- |
| **Landing & Auth** | `![Landing Page](https://via.placeholder.com/800x450/1e293b/ffffff?text=DropGuard+Landing+Page)` | Secure entry point with JWT login and landing resources. |
| **Global Dashboard** | `![Global Dashboard](https://via.placeholder.com/800x450/1e293b/ffffff?text=Analytics+Dashboard)` | Comprehensive view showing school performance, risk maps, and user counts. |
| **School Panel** | `![School Dashboard](https://via.placeholder.com/800x450/1e293b/ffffff?text=School+Management)` | Scoped overview of a school's statistics, active rosters, and registries. |
| **Student Roster** | `![Students Panel](https://via.placeholder.com/800x450/1e293b/ffffff?text=Student+Roster+Directory)` | List view of students with filtering by class, section, and dropout risk tiers. |
| **CSV Importer** | `![Import Wizard](https://via.placeholder.com/800x450/1e293b/ffffff?text=CSV+Import+Wizard+Mapper)` | Dynamic database mapping tool, file parsing preview, and collision validation. |
| **Timeline View** | `![Student Timeline](https://via.placeholder.com/800x450/1e293b/ffffff?text=Student+Timeline+Tracking)` | Chronological mapping of academic tests, attendance logs, and risk adjustments. |

---

## 🏗️ System Architecture

The following diagram illustrates the decoupled architecture of DropGuard, detailing data flow and boundaries:

```mermaid
graph TB
    subgraph Client_Tier [Client Tier - React SPA]
        A[React UI Component] -->|Calls API via Axios| B[API Client Manager]
        B -->|Saves state in Context| C[Auth & Global State Context]
    end

    subgraph API_Tier [API Gateway & Middleware - FastAPI]
        B -->|HTTPS Request with JWT| D[FastAPI Core Router]
        D -->|Validates User Session| E[JWT Security Middleware]
        D -->|Executes Business Logic| F[Services Layer]
    end

    subgraph Inference_Engine [ML Inference & Explainability]
        F -->|Input Features JSON| G[CatBoost Classifier Model]
        G -->|Predictions & Confidence| F
        F -->|Feature Contribution Analysis| H[SHAP Explainability Loader]
        H -->|Feature Importances| F
    end

    subgraph Data_Storage [Data Storage - PostgreSQL]
        F -->|Queries & Operations| I[SQLAlchemy ORM]
        I -->|Database Migrations| J[Alembic Engine]
        I -->|Read/Write Operations| K[(PostgreSQL Neon Instance)]
    end
    
    style Client_Tier fill:#0f172a,stroke:#38b2ac,stroke-width:2px,color:#fff
    style API_Tier fill:#0d1e2d,stroke:#005571,stroke-width:2px,color:#fff
    style Inference_Engine fill:#1a1c1e,stroke:#f59e0b,stroke-width:2px,color:#fff
    style Data_Storage fill:#111c24,stroke:#316192,stroke-width:2px,color:#fff
```

---

## 📂 Folder Structure

```
.
├── backend/                    # FastAPI ASGI Backend Service
│   ├── alembic/                # Database versioning and schemas history
│   ├── app/                    # Primary application package
│   │   ├── api/                # API Routers (auth, school, user, logs, student, prediction, dashboard)
│   │   ├── core/               # Security, logging, tokens, configuration setup
│   │   ├── db/                 # Base database class, session config, seeding scripts
│   │   ├── middleware/         # Custom CORS filters and HTTP exception handlers
│   │   ├── ml/                 # CatBoost model binaries, pipelines, and evaluation metrics
│   │   ├── models/             # SQLAlchemy ORM schemas
│   │   ├── schemas/            # Pydantic schemas for request/response serialization
│   │   ├── services/           # Backend services (inference runner, CSV mapping processor)
│   │   └── utils/              # Helper utilities
│   ├── requirements.txt        # Python backend package checklist
│   ├── alembic.ini             # Database migration configuration file
│   └── Dockerfile.backend      # Container image definition for backend
├── frontend/                   # React Single-Page Application
│   ├── public/                 # Static asset server assets
│   ├── src/                    # Primary source code
│   │   ├── assets/             # Styled assets, global styles
│   │   ├── components/         # Reusable layouts, UI controls, loading components
│   │   ├── context/            # React Auth context and Global app hooks
│   │   ├── lib/                # Utility configurations (Tailwind merges, CN hooks)
│   │   ├── pages/              # Modular screens (Dashboard, Students, Imports, Management)
│   │   └── services/           # Axios interceptors, REST API wrapper handlers
│   ├── package.json            # NPM package and scripts checklist
│   ├── tailwind.config.js      # Tailwind layout specifications
│   ├── vite.config.js          # Vite build pipeline setup
│   └── Dockerfile.frontend     # Container image definition for frontend
└── README.md                   # Project Documentation
```

---

## 🗄️ Database Design

DropGuard utilizes a normalized relational database schema built on PostgreSQL. Cascade deletes (`ondelete="CASCADE"`) are enforced on sub-tables to maintain integrity.

```mermaid
erDiagram
    SCHOOLS ||--o{ USERS : "employs"
    SCHOOLS ||--o{ STUDENTS : "enrolls"
    USERS ||--o{ ACTIVITY_LOGS : "logs"
    STUDENTS ||--|| STUDENT_ACADEMICS : "has"
    STUDENTS ||--|| STUDENT_ATTENDANCE : "has"
    STUDENTS ||--|| STUDENT_BEHAVIOUR : "exhibits"
    STUDENTS ||--|| STUDENT_FAMILY : "belongs_to"
    STUDENTS ||--|| STUDENT_HEALTH : "displays"
    STUDENTS ||--|| STUDENT_TECHNOLOGY : "uses"
    STUDENTS ||--o{ STUDENT_PREDICTIONS : "generates"

    SCHOOLS {
        int id PK
        string school_name
        string school_code
        string district
        string block
        string village
        string school_type
        string medium
        string headmaster_name
        int student_strength
        datetime created_at
    }

    USERS {
        int id PK
        string full_name
        string email UK
        string password_hash
        string role
        int school_id FK
        string phone
        string profile_image
        boolean email_verified
        boolean is_active
        datetime last_login
    }

    STUDENTS {
        int id PK
        string student_id UK
        string full_name
        string gender
        int age
        string class_name
        string section
        string medium_of_instruction
        string community
        float distance_to_school_km
        string transport_mode
        float travel_time_min
        string school_type
        int school_id FK
        boolean is_deleted
    }

    STUDENT_PREDICTIONS {
        int id PK
        int student_id FK
        string dropout_risk
        string dropout_status
        float probability
        float confidence
        json top_features
        json recommended_actions
        string model_version
        datetime predicted_at
    }
```

### Table Dictionary Details
1. **`schools`**: Represents the educational institutes. Key parameters include regional indicators and student capacity.
2. **`users`**: Central repository for credentials, access levels (`admin`, `headmaster`, `teacher`), and school links.
3. **`students`**: Basic demographics, school settings, and a logical deletion flag (`is_deleted`) to support optimistic updates.
4. **`student_academics`**: High-resolution performance history (grades across mathematics, science, language, and exams).
5. **`student_attendance`**: Granular attendance profiles (leave days, consecutive absences, and delay occurrences).
6. **`student_behaviour`**: Educator feedback, assignment completion tracking, and involvement details.
7. **`student_family`**: Socio-economic variables including parents' education level, domestic income, and migration signals.
8. **`student_health`**: Physical and psychological assessments (mental health indicators, vision, and chronic illness records).
9. **`student_technology`**: Digital accessibility indexes (electricity, hardware access, and internet details).
10. **`student_predictions`**: Model outcomes containing computed risks, scores, SHAP top parameters, and advice text.
11. **`activity_logs`**: System audit ledger tracking administrative movements with IP address logging.

---

## 🔑 Role-Based Access Control (RBAC)

DropGuard implements role-based boundaries to protect student records. School-level data isolation is active for school staff.

| Role | School Isolation Enforced | Permissions Scope |
| :---: | :---: | :--- |
| **System Admin** | ❌ (Global View) | • Create, view, update, and delete all school registries.<br>• Full system user management (CRUD, active toggles, permanent deletion).<br>• View global system-wide analytics.<br>• Inspect all security audit activity logs. |
| **Headmaster** | ✅ (School-only) | • Manage user registry for teachers belonging to their school.<br>• Full CSV Smart Import Wizard suite (mapping, validations, imports).<br>• Create and update student entries inside the school registry.<br>• View school-specific analytics dashboards and student timelines.<br>• Execute batch risk predictions. |
| **Teacher** | ✅ (School-only) | • Access, read, and search scoped classrooms.<br>• Manually add, update, and soft-delete classroom students.<br>• Run single predictions and update profiles.<br>• View individual student metrics, SHAP feature logs, and timelines. |

---

## 🤖 Machine Learning Pipeline

The AI engine in DropGuard processes comprehensive tabular data to output risk predictions alongside actionable interventions.

```mermaid
graph TD
    A[Student Raw Profile] -->|Parse & Clean| B[Preprocessing Pipeline]
    B -->|Impute & Map Encodings| C[Feature Vector Engine]
    C -->|Feed Array| D[CatBoost Inference Model]
    
    subgraph Model_Execution_Engine [Prediction Suite]
        D -->|Probability Scoring| E[Binary Classifier]
        D -->|Confidence Score| F[Confidence Evaluator]
        D -->|Feature Influence Matrix| G[SHAP Explanations Engine]
    end

    E -->|Dropout Status: Yes/No| H[Risk Assignment Engine]
    F -->|Risk Classification: Low/Med/High| H
    G -->|Extract Top 3 Feature Weights| H

    H -->|Generate JSON Payload| I[PostgreSQL Database]
    I -->|Live JSON Feed| J[Interactive Dashboard UI]
    
    J -->|View Risk Indicators| K[Educator Intervention]
```

1. **Preprocessing Pipeline**: Handles missing data, cleans text, and scales metrics.
2. **CatBoost Classifier**: Classifies binary dropout likelihood using trees optimized for categorical features.
3. **SHAP Engine**: Calculates Shapley values dynamically to return the three largest features impacting each prediction.
4. **Recommendation Module**: Matches risk factors to structured advice (e.g., poor hardware access triggers technology loan programs).

---

## 🚀 Installation & Setup

### Prerequisites
- **Python**: `3.10` or higher
- **Node.js**: `18.0` or higher (with `npm`)
- **PostgreSQL**: `13` or higher (Local database server or cloud instance like Neon)

---

### Backend Service Setup

1. **Clone and navigate to backend**:
   ```bash
   cd backend
   ```

2. **Establish Python virtual environment**:
   ```bash
   # Linux/macOS
   python3 -m venv venv
   source venv/bin/activate

   # Windows
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. **Install application dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment variables**:
   Create a `.env` configuration file in the backend root:
   ```ini
   ENVIRONMENT=development
   DATABASE_URL=postgresql://postgres:password@localhost:5432/dropout_prediction_db
   SECRET_KEY=enter-a-highly-secure-jwt-secret-key-phrase
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   BACKEND_CORS_ORIGINS=["http://localhost:5173"]
   ```

5. **Run database migrations**:
   Create database structure using Alembic:
   ```bash
   alembic upgrade head
   ```

6. **Seed administrative account (Optional)**:
   Create a root administrator user to get started:
   ```bash
   python create_admin.py
   ```

7. **Start FastAPI Application**:
   Run the ASGI development server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

---

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install Node packages**:
   ```bash
   npm install
   ```

3. **Configure Environment variables**:
   Create a `.env` configuration file in the frontend root:
   ```ini
   VITE_API_URL=http://127.0.0.1:8000/api/v1
   ```

4. **Launch development server**:
   Run the Vite development server locally:
   ```bash
   npm run dev
   ```
   *The application will boot on [http://localhost:5173](http://localhost:5173).*

---

## 🌐 API Documentation

Once the backend service initializes, you can access the self-documenting interactive API suites:

- **Swagger UI (Interactive API Client)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc (Structured documentation)**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## ☁️ Deployment Guide

### Backend Service (Render Deployment)
1. Fork or push the repository. Link your repository in Render's control center.
2. Select **Web Service**, specify the **Root Directory** as `backend`, and choose the **Docker** runtime environment.
3. Attach environment configurations under **Environment Variables** (`DATABASE_URL`, `SECRET_KEY`, `ALGORITHM`, `BACKEND_CORS_ORIGINS`).
4. Ensure the Web Service uses port `8000` (Render binds this automatically or reads the Dockerfile environment).

### Frontend Application (Vercel Deployment)
1. Link your repository in the Vercel dashboard.
2. Choose the project directory as `frontend`.
3. Set the **Framework Preset** to `Vite`.
4. Configure the **Build Command** to `npm run build` and **Output Directory** to `dist`.
5. Add the production environment configuration `VITE_API_URL` pointing to your Render backend domain.

---

## 🔒 Security Architectures

- **Password Hashing**: Cryptographic password hashing implemented using `bcrypt` and verification through `passlib`.
- **Stateless Authorization**: Encrypted API gateways require verified headers containing valid bearer JWTs.
- **Data Isolation Rules**: Queries automatically enforce user-to-school relationships, isolating database read/write queries behind school parameters.
- **SQL Injection Prevention**: All queries pass through SQLAlchemy ORM parametrizations, preventing SQL injection issues.

---

## ⚡ Performance Optimizations

- **Automatic Backend Wake-Up**: Cold-start handler script in the client application issues health checks at boot time to wake up free-tier backend instances.
- **Modular Code-Splitting**: Code-splitting and React routing lazy loading speeds up initial client loads.
- **Axios Optimization**: Configured timeouts and retry parameters prevent client hangs on slow network connections.
- **Optimistic State Management**: Actions immediately update the local client state before database validation reports back, improving UI responsiveness.

---

## 🛠️ Implementation Status

- [x] JWT Authentication & Token Validations
- [x] Role-Based Access Control Policies (RBAC)
- [x] School Registry CRUD Endpoints
- [x] Student Registry CRUD Endpoints
- [x] Student Soft-deletion & Optimistic UI Updates
- [x] User Directory and Active/Inactive Toggles
- [x] CSV Import Wizard with Dynamic Mapping
- [x] CatBoost Prediction Engine Implementation
- [x] Single Predict & Batch Predict Handlers
- [x] Interactive Analytics & Chart Dashboards
- [x] Student Chronological Performance Timeline
- [x] Security Audit Logging Engine
- [x] Automated Recommendation Pipeline
- [x] Docker Containers for Dev and Prod Deployments

---

## 🔮 Future Roadmap

- **Explainable AI UI Enhancements**: Visual SHAP waterfalls directly inside the student detail card.
- **Intervention Logging Engine**: Track support actions (e.g. scholarship awards, counseling sessions) and evaluate if student risk levels drop over time.
- **Automated Alerts**: Email and SMS alerts sent to school authorities when a student is predicted as "High Risk".
- **Predictive Trend Mapping**: Longitudinal analytics mapping predictive drop trends across school clusters.

---

## 👥 Contributors

- **DropGuard System Architects & Developers** - *For questions, reach out to the core engineering team.*

---

## 📄 License

This project is licensed under the **MIT License**. Check the [LICENSE](file:///c:/Users/HP/OneDrive/Pictures/Desktop/Dropout%20Prediction/LICENSE) file for details.
