from fastapi import APIRouter, Depends, HTTPException, status, Header, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from typing import Optional
import os
from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user
from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.models.school import School
from app.schemas.auth import LoginRequest, RefreshRequest, Token, ForgotPasswordRequest, ResetPasswordRequest
from app.schemas.user import UserCreate, UserResponse, UserPasswordChange
from app.services.activity_log import log_activity

router = APIRouter()


def authenticate_local_user(db: Session, email: str, password: str) -> User:
    """Authenticate a local-password user from an email and password.

    Both the JSON login endpoint and OAuth2 form endpoint call this function so
    they use the same database session, user lookup, and password verifier.
    """
    email_normalized = email.lower().strip() if email else ""
    user = db.query(User).filter(User.email.ilike(email_normalized)).first()
    if (
        not user
        or not user.password_hash
        or not verify_password(password, user.password_hash)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is inactive."
        )
    return user


def get_current_user_optional(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
) -> Optional[User]:
    """Helper dependency to get current user if a valid bearer token is present."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id:
            return db.query(User).filter(User.id == int(user_id)).first()
    except (JWTError, ValueError):
        return None
    return None


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_in: UserCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Register a new user.
    Only active Admins can assign roles other than 'teacher' or allocate users to schools.
    Anonymous registration defaults to role 'teacher' and school_id None.
    """
    # Check if email is already taken
    email_normalized = user_in.email.lower().strip() if user_in.email else ""
    existing_user = db.query(User).filter(User.email.ilike(email_normalized)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The email is already registered."
        )

    # Determine role and school assignment permissions
    assigned_role = "teacher"
    assigned_school_id = None

    if current_user and current_user.role == "admin":
        assigned_role = user_in.role or "teacher"
        assigned_school_id = user_in.school_id
    else:
        # Prevent non-admins from assigning elevated roles
        if user_in.role and user_in.role != "teacher":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can assign user roles."
            )
        # Prevent non-admins from setting school directly at signup
        if user_in.school_id is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can assign schools to users."
            )

    # Verify school existence if assigned
    if assigned_school_id:
        school = db.query(School).filter(School.id == assigned_school_id).first()
        if not school:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned school not found."
            )

    # Create new user
    new_user = User(
        full_name=user_in.full_name,
        email=email_normalized,
        password_hash=get_password_hash(user_in.password),
        role=assigned_role,
        school_id=assigned_school_id,
        phone=user_in.phone,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Log action
    client_ip = request.client.host if request.client else None
    log_activity(
        db=db,
        user_id=new_user.id,
        action="register",
        description=f"User registered with role {assigned_role}",
        ip_address=client_ip
    )

    return new_user


@router.post("/login", response_model=Token)
def login(
    login_data: LoginRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and generate access & refresh tokens.
    """
    user = authenticate_local_user(db, login_data.email, login_data.password)

    # Create tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    refresh_token_expires = timedelta(days=7)
    refresh_token = create_access_token(
        subject=user.id, expires_delta=refresh_token_expires
    )

    # Update last login timestamp
    user.last_login = datetime.now(timezone.utc)
    db.commit()

    # Log action
    client_ip = request.client.host if request.client else None
    log_activity(
        db=db,
        user_id=user.id,
        action="login",
        description="User logged in successfully",
        ip_address=client_ip
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/token", response_model=Token)
def login_oauth2(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login endpoint for Swagger UI Authorization.
    Accepts username (email) and password form parameters.
    """
    user = authenticate_local_user(db, form_data.username, form_data.password)

    # Create tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    refresh_token_expires = timedelta(days=7)
    refresh_token = create_access_token(
        subject=user.id, expires_delta=refresh_token_expires
    )

    # Update last login timestamp
    user.last_login = datetime.now(timezone.utc)
    db.commit()

    # Log action
    client_ip = request.client.host if request.client else None
    log_activity(
        db=db,
        user_id=user.id,
        action="login",
        description="User logged in via Swagger UI / OAuth2",
        ip_address=client_ip
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=Token)
def refresh(
    refresh_data: RefreshRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using a valid refresh token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate refresh credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(refresh_data.refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise credentials_exception

    # Generate new tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    refresh_token_expires = timedelta(days=7)
    new_refresh_token = create_access_token(
        subject=user.id, expires_delta=refresh_token_expires
    )

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@router.post("/logout")
def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Log out the user (invalidates session on client-side, logs action on server-side).
    """
    client_ip = request.client.host if request.client else None
    log_activity(
        db=db,
        user_id=current_user.id,
        action="logout",
        description="User logged out successfully",
        ip_address=client_ip
    )
    return {"detail": "Logged out successfully"}


@router.post("/change-password")
def change_password(
    pwd_in: UserPasswordChange,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change password for the currently logged-in user.
    """
    if not verify_password(pwd_in.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password."
        )

    current_user.password_hash = get_password_hash(pwd_in.new_password)
    db.commit()

    # Log action
    client_ip = request.client.host if request.client else None
    log_activity(
        db=db,
        user_id=current_user.id,
        action="password_change",
        description="User changed their password",
        ip_address=client_ip
    )

    return {"detail": "Password updated successfully."}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Retrieve session data of current user.
    """
    return current_user




@router.post("/forgot-password")
def forgot_password(
    data: ForgotPasswordRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Generate password reset token and print reset link to console for local testing.
    """
    email_normalized = data.email.lower().strip() if data.email else ""
    user = db.query(User).filter(User.email.ilike(email_normalized)).first()
    if not user:
        # Generic response to prevent user enumeration
        return {"detail": "If the email is registered, a password reset link has been generated."}

    # Generate temporary reset token (expires in 15 minutes)
    expires = timedelta(minutes=15)
    token = create_access_token(
        subject=str(user.id),
        expires_delta=expires,
        additional_claims={"action": "reset_password"}
    )

    # Log to stdout console
    reset_url = f"http://127.0.0.1:5173/reset-password?token={token}"
    print("\n" + "="*80)
    print(f" PASSWORD RESET REQUEST RECEIVED FOR: {user.email}")
    print(f" RESET URL: {reset_url}")
    print("="*80 + "\n")

    # Log activity
    client_ip = request.client.host if request.client else None
    log_activity(
        db=db,
        user_id=user.id,
        action="password_reset_requested",
        description="Password reset token issued and printed to log console",
        ip_address=client_ip
    )

    return {
        "detail": "If the email is registered, a password reset link has been generated.",
        "token": token  # returned for testing verification scripts
    }


@router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Verify reset token and update user password.
    """
    try:
        payload = jwt.decode(
            data.token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("sub")
        action = payload.get("action")
        
        if not user_id or action != "reset_password":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid password reset token claims."
            )
            
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The password reset link is invalid or has expired."
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found."
        )

    # Update password hash
    user.password_hash = get_password_hash(data.new_password)
    db.commit()

    # Log activity
    client_ip = request.client.host if request.client else None
    log_activity(
        db=db,
        user_id=user.id,
        action="password_reset",
        description="User password successfully reset via token link",
        ip_address=client_ip
    )

    return {"detail": "Your password has been reset successfully."}
