# Import all the models, so that Base has them before being
# imported by Alembic
from app.db.base_class import Base  # noqa
# In future modules, we will import models here:
# from app.models.user import User  # noqa
