"""add prediction fields

Revision ID: f9b8417c80d2
Revises: dffa3106e17d
Create Date: 2026-07-24 13:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f9b8417c80d2'
down_revision = 'dffa3106e17d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('student_predictions', sa.Column('probability', sa.Float(), nullable=True))
    op.add_column('student_predictions', sa.Column('confidence', sa.Float(), nullable=True))
    op.add_column('student_predictions', sa.Column('top_features', sa.JSON(), nullable=True))
    op.add_column('student_predictions', sa.Column('recommended_actions', sa.JSON(), nullable=True))
    op.add_column('student_predictions', sa.Column('model_version', sa.String(length=50), nullable=True))


def downgrade() -> None:
    op.drop_column('student_predictions', 'model_version')
    op.drop_column('student_predictions', 'recommended_actions')
    op.drop_column('student_predictions', 'top_features')
    op.drop_column('student_predictions', 'confidence')
    op.drop_column('student_predictions', 'probability')
