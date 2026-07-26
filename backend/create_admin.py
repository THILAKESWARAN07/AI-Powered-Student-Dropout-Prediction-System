from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.db.base import School, User
from app.core.security import get_password_hash

db: Session = SessionLocal()

try:
    # Check if admin already exists
    existing = db.query(User).filter(User.email == "admin@test.com").first()

    if existing:
        existing.password_hash = get_password_hash("Admin@123")
        existing.role = "admin"
        existing.is_active = True
        existing.email_verified = True

        db.commit()

        print("[+] Admin password reset successfully!")
    else:
        admin = User(
            full_name="System Administrator",
            email="admin@test.com",
            password_hash=get_password_hash("Admin@123"),
            role="admin",
            phone="9876543210",
            school_id=None,
            email_verified=True,
            is_active=True,
        )

        db.add(admin)
        db.commit()

        print("[+] Admin created successfully!")

finally:
    db.close()
