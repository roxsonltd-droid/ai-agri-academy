"""lessons: add content (markdown body)

Revision ID: 20250525_0002
Revises: 20250524_0001
Create Date: 2025-05-25

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20250525_0002"
down_revision: Union[str, None] = "20250524_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("lessons", sa.Column("content", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("lessons", "content")
