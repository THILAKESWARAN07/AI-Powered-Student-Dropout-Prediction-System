# DropGuard – AI-Powered Student Dropout Prediction System

DropGuard is a multi-role educational intelligence platform designed to combat student attrition. By combining advanced Machine Learning with multi-dimensional student profiling, DropGuard proactively identifies students at risk of dropping out before they disengage, allowing educational institutions to implement timely, targeted support.

---

## 🌐 Live Demo

Experience the active DropGuard client application live:

*   **🌐 Live Demo:** [https://ai-powered-student-dropout-predicti.vercel.app](https://ai-powered-student-dropout-predicti.vercel.app)

---

## 1. Overview

**DropGuard** is a secure, role-based educational web application designed for schools and administrative bodies. The system processes academic records, attendance history, behavioral observations, socio-economic factors, health metrics, and technology accessibility indexes to output high-accuracy dropout risk scores.

The system performs the following key functions:
*   **Multi-Dimensional Analysis:** Evaluates academic, attendance, behavioral, family, health, and technology factors.
*   **Risk Classification:** Classifies student dropout risk tiers into **Low**, **Medium**, and **High** levels.
*   **Probability & Confidence:** Provides prediction probability scores and model confidence metrics.
*   **Explainable AI (XAI):** Uses model coefficients to explain the top variables driving each prediction.
*   **Actionable Interventions:** Generates localized recommendations based on a student's specific risk vectors.
*   **Analytics Dashboard:** Displays school-level analytics for administrators, headmasters, and teachers.
*   **Secure Student Directory:** Scopes data access and operations based on user roles and school boundaries.

---

## 2. Problem Statement

Student attrition is a complex educational challenge driven by intersecting factors, including academic difficulties, socio-economic hardships, family stability, and accessibility barriers. Standard Student Information Systems (SIS) are reactive—they show historical statistics when it is often too late for intervention. Educators and school administrators lack proactive, early-warning tools to recognize at-risk students and coordinate preventive support.

---

## 3. Objectives

*   **Early Prediction:** Proactively classify student dropout risks using a predictive model.
*   **Preventive Interventions:** Identify specific risk categories early, enabling coordinated school-level support.
*   **Explainable Insights:** Provide transparent, coefficient-based explainable insights to reveal *why* a student was flagged.
*   **Data Integration:** Enable easy batch imports of student profiles with validation.
*   **School Isolation & Security:** Enforce role-based access control and school-scoped data isolation.

---

## 4. Key Features

### 🔐 Authentication & RBAC
*   **Role-Based Access Control (RBAC):** Strict permissions separation for **System Administrators**, **Headmasters**, and **Teachers**.
*   **JWT Authentication:** Secure, stateless session authorization using JSON Web Tokens.
*   **School-Level Data Isolation:** Row-level scope enforcement ensures staff members only access student records belonging to their assigned school.

### 🧑‍🎓 Student Management
*   **Comprehensive Student Profiles:** Management of demographics, academics, attendance, behaviors, family, health, and tech attributes.
*   **Manual Roster Updates:** Register, update, and search students within a scoped classroom.
*   **Permanent Student Deletion:** Admin-only function to permanently delete individual student entries.
*   **Bulk Student Deletion:** Admin-only capability to batch delete student records.
*   **Activity Logs & Timeline:** Audit trail tracking student predictions and academic adjustments over time.

### 🤖 AI Prediction
*   **Tuned Logistic Regression:** High-performance binary classifier optimized for student tabular data.
*   **Risk Categorization:** Low, Medium, and High dropout risk groups.
*   **Inference Dashboard:** Displays probability scores and prediction confidence.
*   **Coefficient-Based Explainability:** Renders the top high-impact factors behind a student's predicted risk score.

### 📋 Intervention Recommendations
*   **Targeted Recommendations:** Contextual recommendations mapped directly to primary risk vectors.
*   **Intervention Domains:** Focuses on academic support, attendance monitoring, financial aid, and counseling.

### 📥 Import System
*   **Smart CSV/Excel Import Wizard:**
    *   **Dynamic Column Mapping:** Maps arbitrary import columns to database fields in real time.
    *   **Dry-Run Validation:** Validates formats, duplicates, and missing details before writing to the database.
    *   **Normalization:** Normalizes boolean/categorical inputs (e.g., case-insensitive Yes/No normalization).
    *   **School Scoping:** Ensures imports are automatically associated with the user's school.

### 🏫 School Management
*   **School Registry CRUD:** System Admin tools to register and manage educational institutes.
*   **Performance Dashboards:** Statistics on student/staff counts, risk tier distribution, attendance metrics, and audit history.
*   **Permanent School Deletion:** Admin-only function that permanently deletes a school.
*   **Cascading Deletes:** Deleting a school automatically triggers cascading database deletion of associated students, academic records, attendance history, behavioral files, and assigned non-admin users.

### 📊 Reporting
*   **Export Actions:** Download student lists and risk distributions in CSV or Excel format.

### ⚡ Render Wake-Up Mechanism
*   **Lightweight Pings:** The client application automatically dispatches a database-free wake-up request to the backend `/ping` endpoint when loaded or returned to in the browser.
*   **Timeout & Retry:** If the initial wake-up ping fails or times out, the service retries exactly once after 4 seconds.
*   **Reactivation Listening:** Listens to `visibilitychange` events to wake the backend container if the browser tab is reactivated after being idle for 20+ minutes.

---

## 5. How It Works

```
[Student Data Source] ──> [Smart Import Wizard] ──> [Feature Engineering Layer (24 features)]
                                                                  │
                                                                  ▼
[Explainable AI Engine] <── [Tuned Logistic Regression] <── [Model Pipeline Inference]
          │
          ▼
[High-Impact Risk Factors] ──> [Intervention Recommendations] ──> [Dashboard Visualizations]
```

1.  **Ingestion:** The CSV/Excel Import Wizard maps raw files to database columns, validating data fields during parsing.
2.  **Feature Engineering:** The backend merges and normalizes the stored student attributes into a structured 24-feature vector.
3.  **Inference:** The prediction pipeline loads the Tuned Logistic Regression model to compute dropout probability, risk level, and prediction confidence.
4.  **Explainability:** The explanation engine maps the model's coefficients back to the student's values, calculating the top 5 factors impacting the risk classification.
5.  **Intervention:** Custom recommendations are generated based on the highest risk vectors (e.g., high failure counts trigger academic tutoring advice).

---

## 6. Dataset & ML Features

### Student Import Columns (29 Columns)
The CSV/Excel import system parses student datasets containing the following **29 columns**:

1.  `Student_Id`
2.  `Class`
3.  `Distance to School (km)`
4.  `Transport Mode`
5.  `Travel Time (mins)`
6.  `Gender`
7.  `Age`
8.  `Previous_Year_Percentage`
9.  `Current_Year_Percentage`
10. `Overall_Percentage`
11. `Number_of_Failures`
12. `Number_of_Absences`
13. `Attendance_Percentage`
14. `Attendance_Classification`
15. `Mother_Education`
16. `Father_Education`
17. `Family_Support`
18. `School_Support`
19. `Internet_Access`
20. `Health_Status`
21. `Family_Income`
22. `Financial_Difficulty`
23. `Homework_Completion`
24. `Low_Motivation`
25. `Mental_Health_Risk`
26. `Child_Labour_Risk`
27. `Computer_Access`
28. `Smartphone_Access`
29. `Electricity_Availability`

### Feature Engineering
*   The import columns serve as a raw registry.
*   The ML model does not ingest all 29 raw columns directly.
*   The backend feature engineering layer validates, encodes, and merges these raw attributes into the **24 engineered features** expected by the model pipeline (e.g., student IDs and class sections are saved as metadata, while scores and attendance data are normalized).

---

## 7. Machine Learning Model

The current DropGuard system uses a **Tuned Logistic Regression** pipeline, which was adopted after transitioning from the previous model implementation.

### Model Artifacts
Trained model artifacts are loaded dynamically by the prediction service:
*   `backend/app/ml/dropguard_model.pkl` — Trained scikit-learn pipeline (preprocessor + classifier).
*   `backend/app/ml/label_encoder.pkl` — Encodings for prediction targets.
*   `backend/app/ml/feature_names.pkl` — Reference order for model input features.
*   `backend/app/ml/metrics.json` — Evaluation metrics from validation.

### Verified Model Metrics
*   **Dataset Size:** 647 rows
*   **ML Input Features:** 24 features
*   **Accuracy:** 85.32%
*   **ROC-AUC:** 95.93%

*Note: Preprocessing, scaling, and categorical encoding are handled automatically inside the scikit-learn pipeline, and model coefficients are utilized directly to calculate relative feature importance for explainable insights.*

---

## 8. Tech Stack

### Frontend
*   **React** (Vite build system)
*   **TailwindCSS** (Vanilla CSS configurations)
*   **Axios** (API communications with token interceptors)
*   **Framer Motion** (Transitions and loading states)
*   **Lucide React** (Vector iconography)

### Backend
*   **FastAPI** (ASGI Framework)
*   **SQLAlchemy** (ORM model management)
*   **Pydantic** (JSON serialization & validation schemas)
*   **Alembic** (Database migration control)

### Database
*   **PostgreSQL** (Relational storage, supported by Neon Cloud PostgreSQL)

### Machine Learning
*   **Python**
*   **scikit-learn** (Pipeline, preprocessing, and classifier)
*   **joblib** (Model serialization)

---

## 9. System Architecture

```mermaid
graph TB
    subgraph Client_Tier [Client Tier - React SPA]
        A[React UI Components] -->|Calls API via Axios| B[API Client Manager]
        B -->|Saves state in Context| C[Auth & Global State Context]
    end

    subgraph API_Tier [API Gateway & Middleware - FastAPI]
        B -->|HTTPS Request with JWT| D[FastAPI Core Router]
        D -->|Validates User Session| E[JWT Security Middleware]
        D -->|Executes Business Logic| F[Services Layer]
    end

    subgraph Inference_Engine [ML Inference & Explainability]
        F -->|Input Features JSON| G[Tuned Logistic Regression Model]
        G -->|Predictions & Confidence| F
        F -->|Model Coefficient Analysis| H[Coefficient Explainability Engine]
        H -->|High-Impact Features| F
    end

    subgraph Data_Storage [Data Storage - PostgreSQL]
        F -->|Queries & Operations| I[SQLAlchemy ORM]
        I -->|Database Migrations| J[Alembic Engine]
        I -->|Read/Write Operations| K[(PostgreSQL Database)]
    end
    
    style Client_Tier fill:#0f172a,stroke:#38b2ac,stroke-width:2px,color:#fff
    style API_Tier fill:#0d1e2d,stroke:#005571,stroke-width:2px,color:#fff
    style Inference_Engine fill:#1a1c1e,stroke:#f59e0b,stroke-width:2px,color:#fff
    style Data_Storage fill:#111c24,stroke:#316192,stroke-width:2px,color:#fff
```

---

## 10. Database

The database is built on PostgreSQL, utilizing standard relations with cascade deletes to maintain integrity.

### Entities & Tables
*   **`schools`**: Relational registry of schools (District, Block, Village, School Type, Medium, Student Strength).
*   **`users`**: Central account directory storing full name, credentials, roles, active flags, and `school_id` links (FK set to NULL on school deletion).
*   **`students`**: Core registry holding demographic characteristics, commute info, and logical markers.
*   **`student_academics`**: Academic marks, fails, and backlog status.
*   **`student_attendance`**: Term attendance percentage, consecutive absences, leave days, and delays.
*   **`student_behaviour`**: Homework rates, participation metrics, classroom feedback, and motivation flags.
*   **`student_family`**: Annual household income, parents' education, sibling counts, and child labor risk.
*   **`student_health`**: Nutrition ratings, chronic illness history, and mental health risks.
*   **`student_technology`**: Availability indices for internet, electricity, smartphones, and computers.
*   **`student_predictions`**: Computed risk tier, probabilities, coefficients, and recommendations.
*   **`activity_logs`**: System audit records storing user IDs, actions, description, and IP addresses.

### Cascade & Deletion Behaviors
*   **Student Deletion:** Deleting a student deletes related tables (`student_academics`, `student_attendance`, `student_behaviour`, `student_family`, `student_health`, `student_technology`, `student_predictions`) via SQLAlchemy's `delete-orphan` cascades.
*   **School Deletion:** Deleting a school cascade-deletes all associated students, user assignments (for non-admins), and associated student history records.

---

## 11. Security & RBAC

*   **JWT Authorizations:** Session tokens authenticate requests to API endpoints.
*   **Password Protection:** Passwords are encrypted using the `bcrypt` algorithm.
*   **Row-Level Isolation:** Access scopes filter student records and user registries, locking down views to the user's assigned school.
*   **Auditing:** System events (deletes, updates, imports, logins) are logged to the database with client IP address information.
*   **Parametrized Queries:** SQLAlchemy ORM compiles queries safely, protecting the database from SQL Injection attacks.
*   **Deletion Safety:** Destructive actions (individual student deletion, bulk student deletes, and school deletion) require Admin credentials.

---

## 12. Project Structure

```
.
├── backend/                    # FastAPI ASGI Backend Service
│   ├── alembic/                # DB versioning history and migration scripts
│   ├── app/                    # Primary application package
│   │   ├── api/routers/        # Endpoint routers (auth, dashboard, logs, prediction, school, student, user)
│   │   ├── core/               # Security, token signing, config properties
│   │   ├── db/                 # Base database, connection setup, seeds
│   │   ├── middleware/         # CORS and exception middleware
│   │   ├── ml/                 # Pickled models, metadata, feature mappings, and metrics.json
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic schemas for JSON data mapping
│   │   ├── services/           # Services (predict pipelines, csv mapper, log activity)
│   │   └── utils/              # Helper utilities
│   ├── requirements.txt        # Python backend dependencies
│   ├── alembic.ini             # Alembic migration configuration
│   └── Dockerfile.backend      # Docker build configuration for backend
├── frontend/                   # React Single-Page Client Application
│   ├── public/                 # Static public assets
│   ├── src/                    # Client source
│   │   ├── assets/             # Static SVGs, custom icons, styles
│   │   ├── components/         # Reusable layouts, UI controls, navigation widgets
│   │   ├── context/            # Auth and system state hooks
│   │   ├── pages/              # App screens (Dashboard, Students, Imports, Settings, Auth)
│   │   └── services/           # Interceptors, API endpoints, wakeup service
│   ├── package.json            # Node dependency configuration
│   ├── tailwind.config.js      # Tailwind style tokens
│   ├── vite.config.js          # Vite build pipeline setup
│   └── Dockerfile.frontend     # Docker build configuration for frontend
├── dataset/                    # Reference data files
│   ├── dropguard_dataset_2_fin.csv # Full model training dataset (647 rows)
│   ├── sample_dataset.csv      # Sample batch mapping template
│   └── data_dictionary.md      # Mapping definition dictionary
├── docker-compose.yml          # Container stack orchestration config
├── LICENSE                     # System License file
└── README.md                   # Application Documentation
```

---

## 13. Installation

### Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Set up a virtual environment:
    ```bash
    # Unix/macOS
    python3 -m venv venv
    source venv/bin/activate

    # Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure environment variables in `.env`:
    ```ini
    ENVIRONMENT=development
    DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/dropguard_db
    SECRET_KEY=your_jwt_secret_key
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=1440
    BACKEND_CORS_ORIGINS=["http://127.0.0.1:5173"]
    ```
5.  Run migrations and seed the database:
    ```bash
    alembic upgrade head
    python create_admin.py
    ```
6.  Start the FastAPI application server:
    ```bash
    uvicorn app.main:app --reload
    ```

### Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure the environment URL in `.env`:
    ```ini
    VITE_API_URL=http://127.0.0.1:8000/api/v1
    ```
4.  Launch the client development server:
    ```bash
    npm run dev
    ```
    *The client application boots locally (typically on port 5173).*

---

## 14. Deployment

*   **Backend:** Deployed as a containerized Docker service on cloud infrastructure (e.g., Render Web Services) connected to a PostgreSQL instance (e.g., Neon Cloud PostgreSQL).
*   **Frontend:** Deployed on static application servers (e.g., Vercel) with the environment parameter `VITE_API_URL` pointing to the live API gateway.

---

## 15. Live Demo

🌐 **Live Demo:** [https://ai-powered-student-dropout-predicti.vercel.app](https://ai-powered-student-dropout-predicti.vercel.app)

---

## 16. Testing & Validation

### Validation Checks
*   **Compilation:** Backend Python packages build cleanly; no syntax or importing issues.
*   **Model Compatibility:** Scikit-learn pipelines load and parse predictions matching structural orders defined in `feature_names.pkl`.
*   **API Tests:** Endpoint requests (authentication, logs, profile edits) validate schema compliance using Pydantic.
*   **CSV Mapping:** CSV file parsing handles normalization, validation, and dry-run diagnostics correctly.
*   **Cascading Test:** School and student deletions trigger complete cascade removal of nested entities in the relational database.
*   **Production Build:** Client source compiles successfully using `npm run build` with zero compiler block issues.

---

## 17. Future Scope

*   **Attribution Views:** Interactive coefficient waterfall charts integrated directly into student detail pages.
*   **Intervention Outcome Ledger:** Record specific support programs applied to students and track risk tier drops.
*   **Automated Alerts:** Send automated notifications (Email/SMS) to guardians and counselors when high-risk prediction states occur.
*   **Regional Analytics:** Map regional attrition statistics across school districts.

---

## 18. Contributors

*   **DropGuard Engineering Team**

---

## 19. License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
