from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
import shutil

from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user, RoleChecker
from app.models.user import User
from app.models.school import School
from app.schemas.user import UserResponse, UserUpdate, UserRoleUpdate
from app.services.activity_log import log_activity

router = APIRouter()

UPLOADS_DIR = "uploads"
# Create uploads directory if it does not exist
os.makedirs(UPLOADS_DIR, exist_ok=True)


@router.get("/", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "deo"]))
):
    """
    List all users. Admin and DEO only.
    """
    return db.query(User).order_by(User.id.desc()).all()


@router.post("/me/profile-image", response_model=UserResponse)
def upload_profile_image(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload and update profile picture for the logged-in user.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image."
        )

    # Extract extension and create a unique file name
    file_extension = os.path.splitext(file.filename or "")[1]
    if not file_extension:
        file_extension = ".jpg"  # default fallback

    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOADS_DIR, unique_filename)

    # Save to disk
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save profile image: {e}"
        )

    # Delete old profile image if it exists and is local
    if current_user.profile_image and current_user.profile_image.startswith("/uploads/"):
        old_path = current_user.profile_image.lstrip("/")
        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except Exception:
                pass

    # Update path in DB (accessible via relative URL path)
    current_user.profile_image = f"/uploads/{unique_filename}"
    db.commit()
    db.refresh(current_user)

    # Log action
    client_ip = request.client.host if request.client else None
    log_activity(
        db=db,
        user_id=current_user.id,
        action="profile_update",
        description="Uploaded a new profile picture",
        ip_address=client_ip
    )

    return current_user


@router.get("/{user_id}", response_model=UserResponse)
def get_user_details(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve specific user details. Admin, DEO, or the user themselves only.
    """
    if current_user.role not in ["admin", "deo"] and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have privilege to view this user's details."
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user_profile(
    user_id: int,
    user_in: UserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update user profile data. Admin, or the user themselves.
    Note: Setting school_id is restricted to Admin.
    """
    # Verify privileges
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have privilege to update this profile."
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # Apply updates
    update_data = user_in.model_dump(exclude_unset=True)

    # Check for school_id restriction
    if "school_id" in update_data and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can change a user's assigned school."
        )

    # Check school validity
    if user_in.school_id:
        school = db.query(School).filter(School.id == user_in.school_id).first()
        if not school:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="School not found."
            )

    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)

    # Log action
    client_ip = request.client.host if request.client else None
    log_activity(
        db=db,
        user_id=current_user.id,
        action="profile_update",
        description=f"Updated profile for user {user.email} (ID: {user_id})",
        ip_address=client_ip
    )

    return user


@router.put("/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    role_in: UserRoleUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin"]))
):
    """
    Update a user's role. Admin only.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # Prevent self-demotion to avoid lockout scenario
    if user.id == current_user.id and role_in.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot demote themselves."
        )

    old_role = user.role
    user.role = role_in.role
    db.commit()
    db.refresh(user)

    # Log action
    client_ip = request.client.host if request.client else None
    log_activity(
        db=db,
        user_id=current_user.id,
        action="profile_update",
        description=f"Changed role of user {user.email} from {old_role} to {role_in.role}",
        ip_address=client_ip
    )

    return user


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin"]))
):
    """
    Delete a user. Admin only.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot delete their own account."
        )

    user_email = user.email
    db.delete(user)
    db.commit()

    # Log action
    client_ip = request.client.host if request.client else None
    log_activity(
        db=db,
        user_id=current_user.id,
        action="profile_update",
        description=f"Deleted user account {user_email} (ID: {user_id})",
        ip_address=client_ip
    )

    return {"detail": f"User '{user_email}' deleted successfully."}
