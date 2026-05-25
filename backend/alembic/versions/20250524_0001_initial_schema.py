"""initial schema: users, courses, modules, lessons

Revision ID: 20250524_0001
Revises:
Create Date: 2025-05-24

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20250524_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("full_name", sa.String(), nullable=True),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("is_superuser", sa.Boolean(), nullable=True),
        sa.Column("role", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=True,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_full_name"), "users", ["full_name"], unique=False)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)

    op.create_table(
        "courses",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=True),
        sa.Column("description", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_courses_id"), "courses", ["id"], unique=False)
    op.create_index(op.f("ix_courses_title"), "courses", ["title"], unique=False)

    op.create_table(
        "modules",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=True),
        sa.Column("order", sa.Integer(), nullable=True, quote=True),
        sa.Column("course_id", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(
            ["course_id"],
            ["courses.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_modules_id"), "modules", ["id"], unique=False)

    op.create_table(
        "lessons",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=True),
        sa.Column("duration", sa.String(), nullable=True),
        sa.Column("video_id", sa.String(), nullable=True),
        sa.Column("completed", sa.Boolean(), nullable=True),
        sa.Column("order", sa.Integer(), nullable=True, quote=True),
        sa.Column("module_id", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(
            ["module_id"],
            ["modules.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_lessons_id"), "lessons", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_lessons_id"), table_name="lessons")
    op.drop_table("lessons")
    op.drop_index(op.f("ix_modules_id"), table_name="modules")
    op.drop_table("modules")
    op.drop_index(op.f("ix_courses_title"), table_name="courses")
    op.drop_index(op.f("ix_courses_id"), table_name="courses")
    op.drop_table("courses")
    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_index(op.f("ix_users_full_name"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
