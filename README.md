# 🎓 Deutsch-Lernassistent (AI-Powered German Language Tutor)

A personalized, private web application designed to act as your study mentor, reviewed exercises logger, vocabulary manager, and homework OCR assistant. Synthesized specifically for the *Momente A1.1* curriculum.

---

## ✨ Core Features

1. 📊 **Lern-Dashboard** — Quick view of CEFR levels, vocabulary lists, active lesson status, streaking history, and recent grammar mistakes.
2. 💬 **AI Tutor Chat** — Strict German language mentor with automatic mistake checks. Provides friendly grammar corrections and explains rules in **Uzbek** (primary) and **English** (fallback).
3. 📚 **Spaced Repetition Vocab (Wortschatz)** — Uses the **Leitner box system** (Box 1 to 5) to review words on optimal days. Features TTS voice readings and AI-generated context sentences.
4. 🏫 **Grammar Library** — Interactive cards explaining rules in Uzbek and English, paired with mini check-up quizzes.
5. 📂 **Classroom Sync (OCR)** — Upload whiteboard snapshots, notebooks, or class PDFs. The system parses them to automatically extract new vocabulary words and register new grammar concepts.
6. 📝 **Homework Grader** — Submits essays or worksheets (via text or image OCR) to receive grade sheets, scores, and correction cards.
7. 🎤 **Voice Practicing** — Connects to the browser's native **Web Speech API** for hands-free Text-to-Speech (TTS) reading and Speech-to-Text (STT) German transcription.
8. 📈 **Weekly Reports** — Compiles haftalik progress analysis, highlighting strengths, recurring weaknesses, and personal study suggestions.

---

## 🏗️ Tech Stack

| Layer      | Technology                                                     |
| ---------- | -------------------------------------------------------------- |
| **Frontend**| React 19, TypeScript, TailwindCSS, TanStack Query, Zustand, React Router, Axios |
| **Backend** | FastAPI, SQLAlchemy 2.x (async), Alembic, SQLite (`aiosqlite`) |
| **AI / OCR**| Gemini API (REST Client), OpenAI API (REST Client) |
| **Audio**   | HTML5 Web Speech API (TTS & STT) |

---

## 📁 Modular Project Structure

```
project/
├── backend/                # FastAPI Application
│   ├── alembic/            # Alembic DB Migrations
│   ├── app/
│   │   ├── api/            # API Router Aggregators (v1)
│   │   ├── core/           # DB session, settings, dependencies injection
│   │   ├── models/         # SQLAlchemy ORM schemas
│   │   ├── schemas/        # Pydantic schemas (request/response validation)
│   │   ├── repositories/   # GermanRepository (CRUD queries database)
│   │   └── services/       # GermanService (Core business orchestrations) & AI/OCR adapters
│   ├── data/               # SQLite database file (german.db)
│   └── tests/              # pytest unit & integration tests
├── frontend/               # React + TS + Tailwind Application
│   ├── src/
│   │   ├── components/     # AppLayout, Sidebar, Header, custom cards
│   │   ├── features/       # Modular features pages (Dashboard, Tutor, Vocab, Grammar, Sync, Mistakes, Exams, Reports)
│   │   ├── lib/            # Axios API config, services mappings
│   │   └── routes/         # Central route aggregators
│   └── ...
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 20 (LTS recommended)
- **Python** ≥ 3.11
- **pip**

### 1. Configuration Setup
Create a `.env` file under the `backend/` folder:
```env
APP_NAME="Deutsch-Lernassistent"
APP_ENV="development"
DEBUG=true
DATABASE_URL="sqlite+aiosqlite:///./data/german.db"

# AI Configuration (gemini or openai)
AI_PROVIDER="gemini"
GEMINI_API_KEY="your_api_key_here"
OPENAI_API_KEY=""

EXPLANATION_LANGUAGE="uz"
```

### 2. Backend Startup
```bash
cd backend
python -m venv .venv
# Activate virtual environment:
# Windows (PowerShell): .venv\Scripts\Activate.ps1
# Windows (cmd): .venv\Scripts\activate.bat
# Linux/macOS: source .venv/bin/activate

pip install -r requirements.txt

# Run migrations to update SQLite database:
alembic upgrade head

# Start server:
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Interactive docs will load at **http://127.0.0.1:8000/docs**.

### 3. Frontend Startup
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** to run the app.

---

## 🧪 Testing

Run backend tests using pytest:
```bash
cd backend
.venv/Scripts/pytest
```
All tests should pass.
