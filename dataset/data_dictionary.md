# School Student Dropout Prediction Dataset Dictionary

This dictionary defines each of the **61 columns** present in the `Balanced_School_Dropout_Prediction_Dataset.csv` and mapped to the PostgreSQL database schema.

---

## 1. Demographics & Travel Characteristics (12 features)

| Column Name | DB Column | Data Type | Description / Valid Values |
| :--- | :--- | :--- | :--- |
| `Student_ID` | `student_id` | `VARCHAR(100)` | Unique alphanumeric identifier for each student (e.g. `STU000001`). |
| `Gender` | `gender` | `VARCHAR(50)` | Gender of the student: `Male` or `Female`. |
| `Age` | `age` | `INTEGER` | Age of the student (typically ranges from 5 to 18). |
| `Class` | `class_name` | `VARCHAR(50)` | Current academic class/grade level (e.g. `1` to `12`). |
| `Section` | `section` | `VARCHAR(50)` | Section designation within the grade (e.g. `A`, `B`, `C`, `D`). |
| `Medium_of_Instruction` | `medium_of_instruction` | `VARCHAR(100)` | Medium of instruction: `English` or `Regional Language`. |
| `Community` | `community` | `VARCHAR(100)` | Social/community group category (e.g. `General`, `OBC`, `SC`, `ST`, `EWS`). |
| `Distance_to_School_km` | `distance_to_school_km` | `DOUBLE PRECISION` | Commute distance in kilometers. |
| `Transport_Mode` | `transport_mode` | `VARCHAR(100)` | Commute mode (e.g. `Walking`, `Bicycle`, `Public Bus`, `School Bus`). |
| `Travel_Time_min` | `travel_time_min` | `DOUBLE PRECISION` | Daily travel time in minutes. |
| `School_Type` | `school_type` | `VARCHAR(100)` | Category of school node: `Government`, `Private`, or `Aided`. |
| `Teacher_Student_Ratio` | `teacher_student_ratio` | `VARCHAR(50)` | Average ratio in student classes (e.g. `1:35`, `1:40`). |

---

## 2. Academic Records (13 features)

| Column Name | DB Column | Data Type | Description / Valid Values |
| :--- | :--- | :--- | :--- |
| `Previous_Year_Percentage` | `previous_year_percentage` | `DOUBLE PRECISION` | Overall marks percentage in the previous year (0.0 to 100.0). |
| `Unit_Test_Average` | `unit_test_average` | `DOUBLE PRECISION` | Average score across periodic unit tests (0.0 to 100.0). |
| `Quarterly_Exam` | `quarterly_exam` | `DOUBLE PRECISION` | Quarterly term exam score (0.0 to 100.0). |
| `Half_Yearly_Exam` | `half_yearly_exam` | `DOUBLE PRECISION` | Half-yearly term exam score (0.0 to 100.0). |
| `Annual_Exam` | `annual_exam` | `DOUBLE PRECISION` | Annual term exam score (0.0 to 100.0). |
| `Mathematics_Marks` | `mathematics_marks` | `DOUBLE PRECISION` | Final score in Mathematics class (0.0 to 100.0). |
| `Science_Marks` | `science_marks` | `DOUBLE PRECISION` | Final score in Science class (0.0 to 100.0). |
| `English_Marks` | `english_marks` | `DOUBLE PRECISION` | Final score in English class (0.0 to 100.0). |
| `Social_Science_Marks` | `social_science_marks` | `DOUBLE PRECISION` | Final score in Social Science class (0.0 to 100.0). |
| `Regional_Language_Marks` | `regional_language_marks` | `DOUBLE PRECISION` | Final score in Regional Language class (0.0 to 100.0). |
| `Overall_Percentage` | `overall_percentage` | `DOUBLE PRECISION` | Average percentage across final academic exams (0.0 to 100.0). |
| `Number_of_Failed_Subjects` | `number_of_failed_subjects` | `INTEGER` | Count of failed subjects in the current year. |
| `Academic_Backlogs` | `academic_backlogs` | `VARCHAR(50)` | Indicates pending unpassed backlogs: `Yes` or `No`. |

---

## 3. Attendance Records (4 features)

| Column Name | DB Column | Data Type | Description / Valid Values |
| :--- | :--- | :--- | :--- |
| `Attendance_Percentage` | `attendance_percentage` | `DOUBLE PRECISION` | Percentage of school days attended during current term. |
| `Consecutive_Absences` | `consecutive_absences` | `INTEGER` | Maximum length of contiguous unexcused absences. |
| `Leave_Days` | `leave_days` | `INTEGER` | Number of approved leave days requested. |
| `Late_Arrivals` | `late_arrivals` | `INTEGER` | Frequency of late arrivals at class. |

---

## 4. Behaviour & Feedback (9 features)

| Column Name | DB Column | Data Type | Description / Valid Values |
| :--- | :--- | :--- | :--- |
| `Homework_Completion` | `homework_completion` | `DOUBLE PRECISION` | Completion rate of assigned daily homework (0.0 to 100.0). |
| `Assignment_Submission_Rate` | `assignment_submission_rate` | `DOUBLE PRECISION` | Submission rate of projects/assignments (0.0 to 100.0). |
| `Classroom_Participation` | `classroom_participation` | `VARCHAR(100)` | Classroom involvement level: `High`, `Medium`, or `Low`. |
| `Discipline_Incidents` | `discipline_incidents` | `INTEGER` | Count of recorded infractions or warnings. |
| `Teacher_Feedback` | `teacher_feedback` | `VARCHAR(255)` | Short summary comments (e.g. `Excellent`, `Average`, `Poor`). |
| `Participation_in_Extracurricular` | `participation_in_extracurricular` | `VARCHAR(50)` | Engagement in sports, arts or clubs: `Yes` or `No`. |
| `Library_Usage` | `library_usage` | `VARCHAR(100)` | Library visit frequency: `High`, `Medium`, or `Low`. |
| `Low_Motivation` | `low_motivation` | `VARCHAR(50)` | Identified sign of academic disengagement: `Yes` or `No`. |
| `Bullying_Experience` | `bullying_experience` | `VARCHAR(50)` | Student subjected to bullying: `Yes` or `No`. |

---

## 5. Family & Household Context (11 features)

| Column Name | DB Column | Data Type | Description / Valid Values |
| :--- | :--- | :--- | :--- |
| `Family_Income` | `family_income` | `DOUBLE PRECISION` | Total annual income of the household. |
| `Parents_Education` | `parents_education` | `VARCHAR(255)` | Highest education level attained by parent (e.g. `Illiterate`, `Primary`, `Secondary`, `Graduate`). |
| `Parents_Occupation` | `parents_occupation` | `VARCHAR(255)` | Primary occupation type (e.g. `Farmer`, `Private Job`, `Business`, `Daily Wage Labourer`). |
| `Single_Parent` | `single_parent` | `VARCHAR(50)` | Single parent status: `Yes` or `No`. |
| `Number_of_Siblings` | `number_of_siblings` | `INTEGER` | Total count of brothers/sisters in household. |
| `Guardian_Support` | `guardian_support` | `VARCHAR(100)` | Perceived level of household academic support: `High`, `Medium`, or `Low`. |
| `Home_Study_Hours` | `home_study_hours` | `DOUBLE PRECISION` | Average daily study hours outside of school. |
| `Financial_Difficulty` | `financial_difficulty` | `VARCHAR(50)` | Identified household financial struggle: `Yes` or `No`. |
| `Child_Labour_Risk` | `child_labour_risk` | `VARCHAR(50)` | Risk of student working during study years: `Yes` or `No`. |
| `Frequent_Migration` | `frequent_migration` | `VARCHAR(50)` | Frequent migration history for work: `Yes` or `No`. |
| `Family_Issues` | `family_issues` | `VARCHAR(50)` | Domestic family conflict or instability: `Yes` or `No`. |

---

## 6. Health & Nutrition (6 features)

| Column Name | DB Column | Data Type | Description / Valid Values |
| :--- | :--- | :--- | :--- |
| `Chronic_Illness` | `chronic_illness` | `VARCHAR(50)` | Persistent medical condition: `Yes` or `No`. |
| `Nutrition_Status` | `nutrition_status` | `VARCHAR(100)` | Nutritional assessment: `Good`, `Average`, or `Poor`. |
| `Vision_Problems` | `vision_problems` | `VARCHAR(50)` | Vision problems or uncorrected issues: `Yes` or `No`. |
| `Mental_Health_Risk` | `mental_health_risk` | `VARCHAR(100)` | Perceived mental health risk category: `Low`, `Medium`, or `High`. |
| `Disability_Status` | `disability_status` | `VARCHAR(50)` | Identified student physical/learning disability: `Yes` or `No`. |
| `Midday_Meal_Beneficiary` | `midday_meal_beneficiary` | `VARCHAR(50)` | Student enrolled in midday nutrition plan: `Yes` or `No`. |

---

## 7. Technology & Infrastructure Access (4 features)

| Column Name | DB Column | Data Type | Description / Valid Values |
| :--- | :--- | :--- | :--- |
| `Internet_Access` | `internet_access` | `VARCHAR(50)` | Broadband or mobile internet access at home: `Yes` or `No`. |
| `Smartphone_Access` | `smartphone_access` | `VARCHAR(50)` | Smartphone available for educational tasks: `Yes` or `No`. |
| `Computer_Access` | `computer_access` | `VARCHAR(50)` | Laptop/Desktop computer access at home: `Yes` or `No`. |
| `Electricity_Availability` | `electricity_availability` | `VARCHAR(50)` | Stable electricity in home: `Yes` or `No`. |

---

## 8. Prediction Targets (2 features)

| Column Name | DB Column | Data Type | Description / Valid Values |
| :--- | :--- | :--- | :--- |
| `Dropout_Risk` | `dropout_risk` | `VARCHAR(50)` | ML Predicted Dropout Risk Group: `Low`, `Medium`, or `High`. |
| `Dropout_Status` | `dropout_status` | `VARCHAR(50)` | Final dropout status classification: `Yes` or `No`. |
