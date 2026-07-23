# Import all the models, so that Base has them before being
# imported by Alembic
from app.db.base_class import Base  # noqa
from app.models.school import School  # noqa
from app.models.user import User  # noqa
from app.models.activity_log import ActivityLog  # noqa
from app.models.student import (  # noqa
    Student,
    StudentAcademics,
    StudentAttendance,
    StudentBehaviour,
    StudentFamily,
    StudentHealth,
    StudentTechnology,
    StudentPrediction
)

