"""Add headmaster unique index constraint

Revision ID: a2c3b4e5f6d7
Revises: f9b8417c80d2
Create Date: 2026-07-30 19:33:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a2c3b4e5f6d7'
down_revision = 'f9b8417c80d2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.create_index(
            'uq_headmaster_per_school',
            'users',
            ['school_id'],
            unique=True,
            postgresql_where=sa.text("role = 'headmaster' AND is_active = true")
        )
    else:
        # Fallback index for SQLite / Local dev databases
        op.create_index(
            'uq_headmaster_per_school',
            'users',
            ['school_id', 'role'],
            unique=False
        )


def downgrade() -> None:
    op.drop_index('uq_headmaster_per_school', table_name='users')
