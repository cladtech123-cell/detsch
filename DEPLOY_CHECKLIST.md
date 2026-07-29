# DEPLOY_CHECKLIST

## Backend

-   Apply Alembic migrations.
-   Verify database schema.
-   Restart backend.

## Database

-   Confirm backend/data/german.db schema.
-   Seed Momente Lessons 1-8 if required.

## Frontend

-   npm run build
-   Deploy frontend/dist
-   Verify Nginx root matches deployed directory.

## API Verification

-   /api/v1/dashboard
-   /api/v1/progress
-   /api/v1/activity
-   /api/v1/vocabulary
-   /api/v1/curriculum/lessons/A1.1/1-8

## Final Checks

-   No HTTP 500
-   No HTTP 404 for required lessons
-   Frontend loads completely
-   Browser cache verified (Ctrl+F5)
