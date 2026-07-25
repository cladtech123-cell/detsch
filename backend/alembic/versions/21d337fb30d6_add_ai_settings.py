"""add_ai_settings

Revision ID: 21d337fb30d6
Revises: 33647eecb9ab
Create Date: 2026-07-25 15:08:52.209376

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '21d337fb30d6'
down_revision: Union[str, None] = '33647eecb9ab'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('user_progress', sa.Column('ai_provider', sa.String(length=50), nullable=True, server_default='gemini'))
    op.add_column('user_progress', sa.Column('ai_model', sa.String(length=50), nullable=True, server_default='gemini-2.5-flash'))


def downgrade() -> None:
    op.drop_column('user_progress', 'ai_provider')
    op.drop_column('user_progress', 'ai_model')
