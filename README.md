# 🎓 Deutsch-Lernassistent

An AI-powered German language learning platform based on the **Momente A1.1** curriculum.

The project provides a modern web application for vocabulary learning, grammar practice, AI tutoring, OCR-assisted homework processing, progress tracking, and classroom management.

---

# 🤖 AI Agent Instructions

Before making **any** code changes:

1. Read `DEVELOPMENT_RULES.md`
2. Read `PROJECT_CONTEXT.md`
3. Read `DEPLOY_CHECKLIST.md`

Requirements:

- Follow the existing architecture.
- Make the smallest correct change.
- Do not rewrite working code.
- Do not refactor unrelated modules.
- Do not scan the entire repository unless necessary.
- Verify all affected functionality before reporting success.
- Prefer targeted fixes over large rewrites.
- Stop after completing the requested task.

---

# 📚 Documentation

| File | Description |
|------|-------------|
| DEVELOPMENT_RULES.md | Development workflow, coding standards, AI guidelines and token optimization |
| PROJECT_CONTEXT.md | Project architecture, folder structure, database and API overview |
| DEPLOY_CHECKLIST.md | Deployment, migrations, production verification checklist |

---

# ✨ Features

- 📊 Learning Dashboard
- 🤖 AI Tutor
- 📚 Spaced Repetition Vocabulary (Leitner System)
- 🏫 Grammar Library
- 📂 OCR Classroom Sync
- 📝 Homework Grader
- 🎤 Speech Practice (TTS / STT)
- 📈 Weekly Progress Reports
- 📖 Momente A1.1 Curriculum
- 👨‍💼 Admin Panel
- 🔐 Production-ready JWT Authentication (Register, Login, Google OAuth, User/Admin Roles)

---

# 🏗 Technology Stack

## Frontend

- React 19
- TypeScript
- Vite
- TailwindCSS
- React Router
- TanStack Query
- Zustand
- Axios

## Backend

- FastAPI
- SQLAlchemy 2.x (Async)
- Alembic
- SQLite (aiosqlite)
- Pydantic

## AI

- Gemini API
- OpenAI API

## OCR

- OCR Pipeline
- Image Processing

## Deployment

- Ubuntu VPS
- Nginx
- Uvicorn

---

# 📁 Project Structure

```
project/
│
├── backend/
│   ├── alembic/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── data/
│   │   └── german.db
│   │
│   └── tests/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── dist/
│
├── DEVELOPMENT_RULES.md
├── PROJECT_CONTEXT.md
├── DEPLOY_CHECKLIST.md
├── README.md
└── ...
```

---

# 🚀 Quick Start

## Requirements

- Python 3.11+
- Node.js 20+
- npm
- Git

---

## Backend

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux
source .venv/bin/activate

pip install -r requirements.txt

alembic upgrade head

uvicorn app.main:app --reload
```

Backend:

```
http://127.0.0.1:8000
```

Swagger:

```
http://127.0.0.1:8000/docs
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend:

```
http://localhost:5173
```

---

# ⚙ Environment

Example:

```env
APP_NAME="Deutsch-Lernassistent"

APP_ENV="development"

DEBUG=true

DATABASE_URL="sqlite+aiosqlite:///./data/german.db"

AI_PROVIDER="gemini"

GEMINI_API_KEY=""

OPENAI_API_KEY=""

EXPLANATION_LANGUAGE="uz"
```

---

# 🧪 Testing

Backend

```bash
cd backend

pytest
```

Frontend

```bash
npm run build
```

---

# 🚀 Production Deployment

See:

- `DEPLOY_CHECKLIST.md`

Production verification includes:

- Alembic migrations
- SQLite schema validation
- Backend restart
- Frontend build
- Nginx reload
- API verification
- Curriculum verification

---

# 📚 Curriculum

The project is designed around the **Momente A1.1** German course.

Supported modules include:

- Lessons
- Vocabulary
- Grammar
- Listening
- Homework
- AI Tutor
- Progress Tracking

---

# 🤝 Contributing

Before submitting changes:

- Read all project documentation.
- Keep commits focused.
- Preserve project architecture.
- Test affected functionality.
- Avoid unrelated refactoring.

---

# 📄 License

Private project.
All rights reserved.