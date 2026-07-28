# PROJECT_CONTEXT

## Stack

-   Frontend: React + Vite + TypeScript
-   Backend: FastAPI
-   ORM: SQLAlchemy
-   Database: SQLite (backend/data/german.db)
-   Migrations: Alembic
-   Web Server: Nginx
-   Runtime: Ubuntu VPS

## Project Goals

-   DeutschMastery based on Momente A1.1
-   Lessons, Grammar, Vocabulary, Listening
-   AI Tutor
-   Progress tracking
-   Admin Panel

## Lessons Engine (Database-driven)

-   Curriculum: 12 lessons mapping to Momente A1.1.
-   Dynamic Linking: Lessons are dynamically compiled from `Vocabulary` and `GrammarTopic` database tables.
-   Seeding: Automated check-and-seed logic ensures that all global curriculum, grammar topics, and user-specific vocabulary cards are correctly populated in the database.
-   Exercises/Quizzes: Exercises and quizzes are persisted inside the lessons schema database-driven column, with UI support for interactive validation.

## Important Rules

-   Never assume DB schema matches models.
-   Always check Alembic migrations.
-   Keep Momente curriculum intact.
-   Preserve API contracts.
