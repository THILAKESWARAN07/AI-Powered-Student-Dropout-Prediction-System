import sys
import os

# Add backend root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.services import model_loader, prediction_service
from app.models.student import Student, StudentAcademics, StudentAttendance, StudentBehaviour, StudentFamily, StudentHealth, StudentTechnology
from app.models.school import School

def run_test():
    print("Initializing model loader...")
    model_loader._loader.load_all_artifacts()
    
    db = SessionLocal()
    try:
        print("Fetching student with ID 11...")
        student = db.query(Student).filter(Student.id == 11).first()
        if not student:
            print("ERROR: Student 11 not found.")
            return
            
        print(f"Student: {student.full_name} (ID: {student.id})")
        print(f"Demographics: Gender={student.gender}, Age={student.age}")
        print(f"Academics: prev={student.academics.previous_year_percentage}, overall={student.academics.overall_percentage}, failed={student.academics.number_of_failed_subjects}")
        print(f"Attendance: percentage={student.attendance.attendance_percentage}")
        print(f"Behaviour: homework_completion={student.behaviour.homework_completion}")
        print(f"Family: income={student.family.family_income}, difficulty={student.family.financial_difficulty}")
        
        print("\nRunning predict_student directly...")
        result = prediction_service.predict_student(db, 11)
        print("Success! Result:")
        print(result)
        
    except Exception as e:
        import traceback
        print("\n--- TRACEBACK ---")
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    run_test()
