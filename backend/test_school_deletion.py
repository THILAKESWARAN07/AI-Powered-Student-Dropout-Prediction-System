import os
import sys
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime, timezone

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.api.dependencies.db import get_db
from app.core.config import settings
from app.models.school import School
from app.models.user import User
from app.models.student import (
    Student, StudentAcademics, StudentAttendance, 
    StudentBehaviour, StudentFamily, StudentHealth, 
    StudentTechnology, StudentPrediction
)
from app.models.activity_log import ActivityLog
from app.core.security import create_access_token, get_password_hash

client = TestClient(app)

def run_deletion_tests():
    print("==================================================")
    print("STARTING PERMANENT SCHOOL CASCADE DELETION TEST SUITE")
    print("==================================================")

    db: Session = next(get_db())

    # Clean up pre-existing test data from previous runs if any
    db.query(User).filter(User.email.in_(["hm_school_a@test.com", "teacher_school_a@test.com", "hm_school_b@test.com"])).delete(synchronize_session=False)
    db.query(Student).filter(Student.student_id.in_(["STUD_DEL_A", "STUD_DEL_B"])).delete(synchronize_session=False)
    db.query(School).filter(School.school_name.in_(["Target School A", "Control School B"])).delete(synchronize_session=False)
    db.commit()

    # Find or create admin user for performing operations
    admin = db.query(User).filter(User.role == "admin").first()
    if not admin:
        admin = User(
            full_name="Admin Test",
            email="admin_delete_test@example.com",
            password_hash=get_password_hash("password123"),
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

    # 1. CREATE TEST DATA
    # Create target school A (to be deleted)
    school_a = School(
        school_name="Target School A",
        district="Test District A",
        block="Test Block A",
        village="Test Village A",
        school_type="Government High School",
        medium="English",
        headmaster_name="HM Test A",
        student_strength=100
    )
    # Create unrelated school B (control)
    school_b = School(
        school_name="Control School B",
        district="Test District B",
        block="Test Block B",
        village="Test Village B",
        school_type="Private School",
        medium="English",
        headmaster_name="HM Test B",
        student_strength=50
    )
    db.add(school_a)
    db.add(school_b)
    db.commit()
    db.refresh(school_a)
    db.refresh(school_b)

    school_a_id = school_a.id
    school_b_id = school_b.id
    print(f"Created target school A (ID: {school_a_id}) and control school B (ID: {school_b_id})")

    # Create non-admin users for target school A
    hm_a = User(
        full_name="HM School A",
        email="hm_school_a@test.com",
        password_hash=get_password_hash("password123"),
        role="headmaster",
        school_id=school_a_id,
        is_active=True
    )
    teacher_a = User(
        full_name="Teacher School A",
        email="teacher_school_a@test.com",
        password_hash=get_password_hash("password123"),
        role="teacher",
        school_id=school_a_id,
        is_active=True
    )
    # Create non-admin users for control school B
    hm_b = User(
        full_name="HM School B",
        email="hm_school_b@test.com",
        password_hash=get_password_hash("password123"),
        role="headmaster",
        school_id=school_b_id,
        is_active=True
    )
    db.add(hm_a)
    db.add(teacher_a)
    db.add(hm_b)
    db.commit()
    db.refresh(hm_a)
    db.refresh(teacher_a)
    db.refresh(hm_b)

    hm_a_id = hm_a.id
    teacher_a_id = teacher_a.id
    hm_b_id = hm_b.id

    # Generate JWT token for target headmaster to test session invalidation later
    stale_hm_token = create_access_token(subject=str(hm_a_id))
    print("Generated JWT token for target headmaster to verify access invalidation.")

    # Create students and sub-records for target school A
    student_a = Student(
        student_id="STUD_DEL_A",
        full_name="Student School A",
        gender="Male",
        age=15,
        class_name="9",
        section="A",
        medium_of_instruction="English",
        community="General",
        school_id=school_a_id
    )
    db.add(student_a)
    db.commit()
    db.refresh(student_a)

    student_a_id = student_a.id

    # Sub-records for student A
    acad_a = StudentAcademics(
        student_id=student_a_id,
        previous_year_percentage=85.0,
        unit_test_average=80.0,
        quarterly_exam=78.0,
        half_yearly_exam=82.0,
        annual_exam=85.0,
        mathematics_marks=80.0,
        science_marks=85.0,
        english_marks=90.0,
        social_science_marks=88.0,
        regional_language_marks=82.0,
        overall_percentage=85.0,
        number_of_failed_subjects=0,
        academic_backlogs="No"
    )
    att_a = StudentAttendance(
        student_id=student_a_id,
        attendance_percentage=92.5,
        consecutive_absences=0,
        leave_days=3,
        late_arrivals=1
    )
    beh_a = StudentBehaviour(
        student_id=student_a_id,
        homework_completion=90.0,
        assignment_submission_rate=95.0,
        classroom_participation="High",
        discipline_incidents=0,
        teacher_feedback="Good student",
        participation_in_extracurricular="Yes",
        library_usage="Medium",
        low_motivation="No",
        bullying_experience="No"
    )
    fam_a = StudentFamily(
        student_id=student_a_id,
        family_income=50000.0,
        parents_education="High School",
        parents_occupation="Clerk",
        single_parent="No",
        number_of_siblings=2,
        guardian_support="High",
        home_study_hours=2.0,
        financial_difficulty="No",
        child_labour_risk="No",
        frequent_migration="No",
        family_issues="No"
    )
    health_a = StudentHealth(
        student_id=student_a_id,
        chronic_illness="No",
        nutrition_status="Good",
        vision_problems="No",
        mental_health_risk="Low",
        disability_status="No",
        midday_meal_beneficiary="Yes"
    )
    tech_a = StudentTechnology(
        student_id=student_a_id,
        internet_access="Yes",
        smartphone_access="Yes",
        computer_access="No",
        electricity_availability="Yes"
    )
    pred_a = StudentPrediction(
        student_id=student_a_id,
        dropout_risk="Low",
        dropout_status="No",
        probability=0.015,
        confidence=0.88,
        top_features={"Financial_Difficulty": 11.55, "Attendance_Classification": 10.35},
        recommended_actions=["Continue Monitoring", "Regular Follow-up"],
        model_version="2.0.0",
        predicted_at=datetime.now(timezone.utc)
    )
    db.add_all([acad_a, att_a, beh_a, fam_a, health_a, tech_a, pred_a])
    db.commit()

    # Create students and sub-records for control school B
    student_b = Student(
        student_id="STUD_DEL_B",
        full_name="Student School B",
        gender="Female",
        age=14,
        class_name="8",
        section="B",
        medium_of_instruction="English",
        community="OBC",
        school_id=school_b_id
    )
    db.add(student_b)
    db.commit()
    db.refresh(student_b)

    student_b_id = student_b.id

    acad_b = StudentAcademics(
        student_id=student_b_id,
        previous_year_percentage=72.0,
        unit_test_average=70.0,
        quarterly_exam=68.0,
        half_yearly_exam=72.0,
        annual_exam=70.0,
        mathematics_marks=65.0,
        science_marks=70.0,
        english_marks=75.0,
        social_science_marks=72.0,
        regional_language_marks=70.0,
        overall_percentage=70.0,
        number_of_failed_subjects=0,
        academic_backlogs="No"
    )
    db.add(acad_b)
    db.commit()

    print("Created test students and child records.")

    # 2. RUN DELETION ROUTE
    admin_token = create_access_token(subject=str(admin.id))
    headers = {"Authorization": f"Bearer {admin_token}"}

    print("\nExecuting permanent school cascade delete API request...")
    response = client.delete(f"/api/v1/schools/{school_a_id}", headers=headers)
    print("Delete School Endpoint Response status:", response.status_code)
    print("Delete School Endpoint Response JSON:", response.json())

    assert response.status_code == 200, "Deletion API failed!"
    assert response.json()["message"] == "School and all associated records deleted successfully."

    # 3. VERIFY DELETIONS
    # A. School A is deleted
    school_a_check = db.query(School).filter(School.id == school_a_id).first()
    assert school_a_check is None, "Target school A was not deleted!"
    print("[OK] Verified: Target school A is permanently deleted.")

    # B. Non-admin users of School A are deleted
    hm_a_check = db.query(User).filter(User.id == hm_a_id).first()
    teacher_a_check = db.query(User).filter(User.id == teacher_a_id).first()
    assert hm_a_check is None, "Headmaster of school A was not deleted!"
    assert teacher_a_check is None, "Teacher of school A was not deleted!"
    print("[OK] Verified: Headmaster and Teacher of school A are permanently deleted.")

    # C. Students of School A are deleted
    student_a_check = db.query(Student).filter(Student.id == student_a_id).first()
    assert student_a_check is None, "Student of school A was not deleted!"
    print("[OK] Verified: Student of school A is permanently deleted.")

    # D. All student child records are deleted
    acad_a_check = db.query(StudentAcademics).filter(StudentAcademics.student_id == student_a_id).first()
    att_a_check = db.query(StudentAttendance).filter(StudentAttendance.student_id == student_a_id).first()
    beh_a_check = db.query(StudentBehaviour).filter(StudentBehaviour.student_id == student_a_id).first()
    fam_a_check = db.query(StudentFamily).filter(StudentFamily.student_id == student_a_id).first()
    health_a_check = db.query(StudentHealth).filter(StudentHealth.student_id == student_a_id).first()
    tech_a_check = db.query(StudentTechnology).filter(StudentTechnology.student_id == student_a_id).first()
    pred_a_check = db.query(StudentPrediction).filter(StudentPrediction.student_id == student_a_id).first()

    assert acad_a_check is None, "StudentAcademics of student A was not deleted!"
    assert att_a_check is None, "StudentAttendance of student A was not deleted!"
    assert beh_a_check is None, "StudentBehaviour of student A was not deleted!"
    assert fam_a_check is None, "StudentFamily of student A was not deleted!"
    assert health_a_check is None, "StudentHealth of student A was not deleted!"
    assert tech_a_check is None, "StudentTechnology of student A was not deleted!"
    assert pred_a_check is None, "StudentPrediction of student A was not deleted!"
    print("[OK] Verified: All student child sub-records are permanently deleted.")

    # E. Unrelated school B and records remain unchanged
    school_b_check = db.query(School).filter(School.id == school_b_id).first()
    hm_b_check = db.query(User).filter(User.id == hm_b_id).first()
    student_b_check = db.query(Student).filter(Student.id == student_b_id).first()
    acad_b_check = db.query(StudentAcademics).filter(StudentAcademics.student_id == student_b_id).first()

    assert school_b_check is not None, "Unrelated school B was accidentally deleted!"
    assert hm_b_check is not None, "Unrelated user HM B was accidentally deleted!"
    assert student_b_check is not None, "Unrelated student B was accidentally deleted!"
    assert acad_b_check is not None, "Unrelated student B's sub-records were accidentally deleted!"
    print("[OK] Verified: Control school B, control users, control students, and control child records remain unchanged.")

    # F. Admin remains
    admin_check = db.query(User).filter(User.id == admin.id).first()
    assert admin_check is not None, "System Administrator was accidentally deleted!"
    print("[OK] Verified: System Administrator account remains intact.")

    # G. Audit log is created
    audit_log = db.query(ActivityLog).filter(
        ActivityLog.action == "Deleted School",
        ActivityLog.description.contains("permanently deleted school Target School A")
    ).first()
    assert audit_log is not None, "Audit log for Deleted School was not created!"
    print(f"[OK] Verified: Audit logging works. Log description: '{audit_log.description}'")

    # H. JWT / Session invalidation
    # Attempt to request profile endpoints using the deleted headmaster's stale token
    invalid_headers = {"Authorization": f"Bearer {stale_hm_token}"}
    profile_response = client.get("/api/v1/auth/me", headers=invalid_headers)
    print("Stale JWT token request response status:", profile_response.status_code)
    # The user was deleted, so we expect 401 Unauthorized because user is not found in database
    assert profile_response.status_code == 401, f"Expected 401 Unauthorized for deleted user token, got {profile_response.status_code}"
    print("[OK] Verified: Deleted users are successfully rejected from the API with 401 Unauthorized.")

    # Clean up control school B and control items
    db.delete(hm_b_check)
    db.delete(student_b_check)
    db.delete(school_b_check)
    db.commit()
    print("Cleaned up control database records.")
    print("==================================================")
    print("ALL TESTS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    run_deletion_tests()
