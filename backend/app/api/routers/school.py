from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user, RoleChecker
from app.models.user import User
from app.models.school import School
from app.models.student import Student
from app.schemas.school import SchoolCreate, SchoolUpdate, SchoolResponse
from app.services.activity_log import log_activity

router = APIRouter()


@router.post("/", response_model=SchoolResponse, status_code=status.HTTP_201_CREATED)
def create_school(
    school_in: SchoolCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin"]))
):
    """
    Create a new school. Admin only.
    """
    new_school = School(
        school_name=school_in.school_name,
        district=school_in.district,
        block=school_in.block,
        village=school_in.village,
        school_type=school_in.school_type,
        medium=school_in.medium,
        headmaster_name=school_in.headmaster_name,
        student_strength=school_in.student_strength
    )
    db.add(new_school)
    db.commit()
    db.refresh(new_school)

    # Log action
    client_ip = request.client.host if request.client else None
    log_activity(
        db=db,
        user_id=current_user.id,
        action="school_create",
        description=f"Created school {new_school.school_name} (ID: {new_school.id})",
        ip_address=client_ip
    )

    return new_school


@router.get("/", response_model=List[SchoolResponse])
def list_schools(
    db: Session = Depends(get_db)
):
    """
    List all schools. Available publicly to allow signup selection dropdown loading.
    """
    return db.query(School).order_by(School.id.desc()).all()


@router.get("/{school_id}", response_model=SchoolResponse)
def get_school(
    school_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve specific school details.
    """
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found."
        )
    if current_user.role != "admin" and current_user.school_id != school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You can only view details of your assigned school."
        )
    return school


@router.put("/{school_id}", response_model=SchoolResponse)
def update_school(
    school_id: int,
    school_in: SchoolUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update school details.
    Only Admin can update any school.
    """
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found."
        )

    # Verify authorization (only admin can edit)
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can modify school details."
        )

    # Apply updates
    update_data = school_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(school, field, value)

    db.commit()
    db.refresh(school)

    # Log action
    client_ip = request.client.host if request.client else None
    log_activity(
        db=db,
        user_id=current_user.id,
        action="school_update",
        description=f"Updated school {school.school_name} (ID: {school_id})",
        ip_address=client_ip
    )

    return school


@router.delete("/{school_id}", status_code=status.HTTP_200_OK)
def delete_school(
    school_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin"]))
):
    """
    Permanently delete a school. Admin only.
    Enforces dependency validation: cannot delete if school contains users or students.
    """
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found."
        )

    # Option B: Dependency Validation Check
    has_users = db.query(User).filter(User.school_id == school_id).first() is not None
    has_students = db.query(Student).filter(Student.school_id == school_id).first() is not None
    if has_users or has_students:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This school contains users or students. Remove them before deleting the school."
        )

    school_name = school.school_name
    db.delete(school)
    db.commit()

    # Log action to audit logs
    client_ip = request.client.host if request.client else None
    log_activity(
        db=db,
        user_id=current_user.id,
        action="Deleted School",
        description=f"Admin {current_user.full_name} permanently deleted school {school_name} (ID: {school_id})",
        ip_address=client_ip
    )

    return {"message": "School deleted successfully."}
