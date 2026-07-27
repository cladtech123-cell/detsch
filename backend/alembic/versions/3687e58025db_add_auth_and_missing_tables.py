"""add_auth_and_missing_tables

Revision ID: 3687e58025db
Revises: 21d337fb30d6
Create Date: 2026-07-27 15:59:27.423465

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3687e58025db'
down_revision: Union[str, None] = '21d337fb30d6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create independent tables
    op.create_table('curriculum_book',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('code', sa.String(length=50), nullable=False),
    sa.Column('title', sa.String(length=150), nullable=False),
    sa.Column('cefr', sa.String(length=10), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_curriculum_book_code'), 'curriculum_book', ['code'], unique=True)
    op.create_index(op.f('ix_curriculum_book_id'), 'curriculum_book', ['id'], unique=False)
    
    op.create_table('curriculum_lesson',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('book_code', sa.String(length=50), nullable=False),
    sa.Column('number', sa.Integer(), nullable=False),
    sa.Column('title_uz', sa.String(length=200), nullable=False),
    sa.Column('title_de', sa.String(length=200), nullable=False),
    sa.Column('description_uz', sa.Text(), nullable=False),
    sa.Column('description_de', sa.Text(), nullable=False),
    sa.Column('grammar_title', sa.String(length=150), nullable=False),
    sa.Column('grammar_explanation', sa.Text(), nullable=False),
    sa.Column('grammar_examples_json', sa.JSON(), nullable=False),
    sa.Column('listening_dialogue', sa.Text(), nullable=False),
    sa.Column('listening_quiz_json', sa.JSON(), nullable=False),
    sa.Column('reading_passage', sa.Text(), nullable=False),
    sa.Column('reading_quiz_json', sa.JSON(), nullable=False),
    sa.Column('writing_prompt', sa.Text(), nullable=False),
    sa.Column('speaking_topic', sa.Text(), nullable=False),
    sa.Column('quiz_questions_json', sa.JSON(), nullable=False),
    sa.Column('vocabulary_json', sa.JSON(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_curriculum_lesson_book_code'), 'curriculum_lesson', ['book_code'], unique=False)
    op.create_index(op.f('ix_curriculum_lesson_id'), 'curriculum_lesson', ['id'], unique=False)
    op.create_index(op.f('ix_curriculum_lesson_number'), 'curriculum_lesson', ['number'], unique=False)
    
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('username', sa.String(length=100), nullable=False),
    sa.Column('hashed_password', sa.String(length=255), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('role', sa.String(length=20), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
    
    op.create_table('exam_result',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('exam_type', sa.String(length=50), nullable=False),
    sa.Column('title', sa.String(length=200), nullable=False),
    sa.Column('score', sa.Integer(), nullable=False),
    sa.Column('correct_count', sa.Integer(), nullable=False),
    sa.Column('total_questions', sa.Integer(), nullable=False),
    sa.Column('lesson_number', sa.Integer(), nullable=True),
    sa.Column('time_taken_seconds', sa.Integer(), nullable=False),
    sa.Column('questions_json', sa.JSON(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_exam_result_id'), 'exam_result', ['id'], unique=False)
    op.create_index(op.f('ix_exam_result_user_id'), 'exam_result', ['user_id'], unique=False)
    
    op.create_table('study_session',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('session_date', sa.Date(), nullable=False),
    sa.Column('activity_type', sa.String(length=50), nullable=False),
    sa.Column('xp_earned', sa.Integer(), nullable=False),
    sa.Column('duration_minutes', sa.Integer(), nullable=False),
    sa.Column('lesson_number', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_study_session_id'), 'study_session', ['id'], unique=False)
    op.create_index(op.f('ix_study_session_session_date'), 'study_session', ['session_date'], unique=False)
    op.create_index(op.f('ix_study_session_user_id'), 'study_session', ['user_id'], unique=False)

    # 2. Modify existing tables using batch operations
    with op.batch_alter_table('chat_message', schema=None) as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=True))
        batch_op.create_index(batch_op.f('ix_chat_message_user_id'), ['user_id'], unique=False)
        batch_op.create_foreign_key('fk_chat_message_users', 'users', ['user_id'], ['id'], ondelete='CASCADE')

    with op.batch_alter_table('homework_submission', schema=None) as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=True))
        batch_op.create_index(batch_op.f('ix_homework_submission_user_id'), ['user_id'], unique=False)
        batch_op.create_foreign_key('fk_homework_submission_users', 'users', ['user_id'], ['id'], ondelete='CASCADE')

    with op.batch_alter_table('mistake_log', schema=None) as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=True))
        batch_op.create_index(batch_op.f('ix_mistake_log_user_id'), ['user_id'], unique=False)
        batch_op.create_foreign_key('fk_mistake_log_users', 'users', ['user_id'], ['id'], ondelete='CASCADE')

    with op.batch_alter_table('user_progress', schema=None) as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=True))
        batch_op.alter_column('ai_provider',
                   existing_type=sa.VARCHAR(length=50),
                   nullable=False,
                   existing_server_default=sa.text("'gemini'"))
        batch_op.alter_column('ai_model',
                   existing_type=sa.VARCHAR(length=50),
                   nullable=False,
                   existing_server_default=sa.text("'gemini-2.5-flash'"))
        batch_op.create_index(batch_op.f('ix_user_progress_user_id'), ['user_id'], unique=False)
        batch_op.create_foreign_key('fk_user_progress_users', 'users', ['user_id'], ['id'], ondelete='CASCADE')

    with op.batch_alter_table('vocabulary', schema=None) as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('article', sa.String(length=20), nullable=True))
        batch_op.add_column(sa.Column('plural', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('pronunciation', sa.String(length=150), nullable=True))
        batch_op.add_column(sa.Column('ipa', sa.String(length=150), nullable=True))
        batch_op.add_column(sa.Column('audio_url', sa.String(length=250), nullable=True))
        batch_op.add_column(sa.Column('textbook_page', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('lesson_number', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('mastery_percentage', sa.Integer(), nullable=False, server_default='0'))
        batch_op.add_column(sa.Column('mistake_count', sa.Integer(), nullable=False, server_default='0'))
        batch_op.add_column(sa.Column('review_history_json', sa.JSON(), nullable=False, server_default='[]'))
        batch_op.create_index(batch_op.f('ix_vocabulary_user_id'), ['user_id'], unique=False)
        batch_op.create_foreign_key('fk_vocabulary_users', 'users', ['user_id'], ['id'], ondelete='CASCADE')


def downgrade() -> None:
    with op.batch_alter_table('vocabulary', schema=None) as batch_op:
        batch_op.drop_constraint('fk_vocabulary_users', type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_vocabulary_user_id'))
        batch_op.drop_column('review_history_json')
        batch_op.drop_column('mistake_count')
        batch_op.drop_column('mastery_percentage')
        batch_op.drop_column('lesson_number')
        batch_op.drop_column('textbook_page')
        batch_op.drop_column('audio_url')
        batch_op.drop_column('ipa')
        batch_op.drop_column('pronunciation')
        batch_op.drop_column('plural')
        batch_op.drop_column('article')
        batch_op.drop_column('user_id')

    with op.batch_alter_table('user_progress', schema=None) as batch_op:
        batch_op.drop_constraint('fk_user_progress_users', type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_user_progress_user_id'))
        batch_op.alter_column('ai_model',
                   existing_type=sa.VARCHAR(length=50),
                   nullable=True,
                   existing_server_default=sa.text("'gemini-2.5-flash'"))
        batch_op.alter_column('ai_provider',
                   existing_type=sa.VARCHAR(length=50),
                   nullable=True,
                   existing_server_default=sa.text("'gemini'"))
        batch_op.drop_column('user_id')

    with op.batch_alter_table('mistake_log', schema=None) as batch_op:
        batch_op.drop_constraint('fk_mistake_log_users', type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_mistake_log_user_id'))
        batch_op.drop_column('user_id')

    with op.batch_alter_table('homework_submission', schema=None) as batch_op:
        batch_op.drop_constraint('fk_homework_submission_users', type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_homework_submission_user_id'))
        batch_op.drop_column('user_id')

    with op.batch_alter_table('chat_message', schema=None) as batch_op:
        batch_op.drop_constraint('fk_chat_message_users', type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_chat_message_user_id'))
        batch_op.drop_column('user_id')

    op.drop_index(op.f('ix_study_session_user_id'), table_name='study_session')
    op.drop_index(op.f('ix_study_session_session_date'), table_name='study_session')
    op.drop_index(op.f('ix_study_session_id'), table_name='study_session')
    op.drop_table('study_session')
    
    op.drop_index(op.f('ix_exam_result_user_id'), table_name='exam_result')
    op.drop_index(op.f('ix_exam_result_id'), table_name='exam_result')
    op.drop_table('exam_result')
    
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    
    op.drop_index(op.f('ix_curriculum_lesson_number'), table_name='curriculum_lesson')
    op.drop_index(op.f('ix_curriculum_lesson_id'), table_name='curriculum_lesson')
    op.drop_index(op.f('ix_curriculum_lesson_book_code'), table_name='curriculum_lesson')
    op.drop_table('curriculum_lesson')
    
    op.drop_index(op.f('ix_curriculum_book_id'), table_name='curriculum_book')
    op.drop_index(op.f('ix_curriculum_book_code'), table_name='curriculum_book')
    op.drop_table('curriculum_book')
