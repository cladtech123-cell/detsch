# Graph Report - project  (2026-07-28)

## Corpus Check
- 142 files · ~67,804 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 840 nodes · 1635 edges · 74 communities (61 shown, 13 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 42 edges (avg confidence: 0.56)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `95a6a440`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- GermanRepository
- get_ai_provider
- AbstractModule
- grammar.py
- devDependencies
- vocabulary.py
- package.json
- BaseOCRProvider
- compilerOptions
- compilerOptions
- main.py
- Sidebar.tsx
- 🎓 Deutsch-Lernassistent (AI-Powered German Language Tutor)
- plugins
- Button.tsx
- react
- deploy_sprint8.py
- Badge.tsx
- deploy_sprint8_final.py
- deploy_sprint8_fix.py
- React + TypeScript + Vite
- App.tsx
- AchievementsPage.tsx
- GermanRepository
- test_progress_extended.py
- ListeningPage.tsx
- services.ts
- index.ts
- Input.tsx
- PageHeader.tsx
- FlashcardsPage.tsx
- GrammarPage.tsx
- LessonsPage.tsx
- SyncPage.tsx
- uiStore.ts
- tsconfig.json
- api/__init__.py
- core/__init__.py
- images/__init__.py
- social/__init__.py
- username/__init__.py
- schemas/__init__.py
- services/__init__.py
- eslint.config.js
- postcss.config.js
- tailwind.config.js
- dotenv
- motion
- react

## God Nodes (most connected - your core abstractions)
1. `GermanRepository` - 88 edges
2. `Vocabulary` - 34 edges
3. `Language` - 31 edges
4. `Language` - 27 edges
5. `GermanService` - 24 edges
6. `get_ai_provider()` - 19 edges
7. `Base` - 18 edges
8. `UserProgress` - 17 edges
9. `MistakeLog` - 16 edges
10. `StudySession` - 16 edges

## Surprising Connections (you probably didn't know these)
- `ChatMessage` --uses--> `Base`  [INFERRED]
  backend/app/models/german.py → backend/app/core/database.py
- `CurriculumBook` --uses--> `Base`  [INFERRED]
  backend/app/models/german.py → backend/app/core/database.py
- `ExamResult` --uses--> `Base`  [INFERRED]
  backend/app/models/german.py → backend/app/core/database.py
- `HomeworkSubmission` --uses--> `Base`  [INFERRED]
  backend/app/models/german.py → backend/app/core/database.py
- `MistakeLog` --uses--> `Base`  [INFERRED]
  backend/app/models/german.py → backend/app/core/database.py

## Import Cycles
- None detected.

## Communities (74 total, 13 thin omitted)

### Community 0 - "GermanRepository"
Cohesion: 0.33
Nodes (3): Tracks individual study activity per day for reporting and activity chart., StudySession, ChatMessage

### Community 1 - "get_ai_provider"
Cohesion: 0.07
Nodes (25): ConnectionTestRequest, ConnectionTestResponse, BaseModel, post, test_ai_connection(), BaseAIProvider, ABC, Generates simple content response from prompt. (+17 more)

### Community 2 - "AbstractModule"
Cohesion: 0.06
Nodes (28): AbstractModule, ModuleCategory, ModuleFinding, ModuleInput, ModuleResult, ABC, Any, BaseModel (+20 more)

### Community 3 - "grammar.py"
Cohesion: 0.43
Nodes (6): get_grammar_topic(), list_grammar_topics(), get, post, submit_grammar_quiz(), toggle_grammar_complete()

### Community 4 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, autoprefixer, esbuild, tailwindcss, tsx, @types/express, @types/node, typescript (+7 more)

### Community 5 - "vocabulary.py"
Cohesion: 0.07
Nodes (56): Persists exam result to the database so history survives across sessions., submit_exam_result(), complete_lesson_section(), get_activity(), get_progress(), log_study_session(), get, post (+48 more)

### Community 6 - "package.json"
Cohesion: 0.12
Nodes (17): axios, dependencies, axios, express, @google/genai, lucide-react, react-dom, @tailwindcss/vite (+9 more)

### Community 7 - "BaseOCRProvider"
Cohesion: 0.11
Nodes (17): post, UploadFile, submit_homework(), BaseOCRProvider, ABC, Any, Extracts raw text from an image., Parses classroom whiteboard photos or notes, returning structured JSON with voca (+9 more)

### Community 8 - "compilerOptions"
Cohesion: 0.10
Nodes (41): FABProps, FloatingActionButton(), Footer(), FooterProps, Header(), HeaderProps, Sidebar(), SidebarProps (+33 more)

### Community 9 - "compilerOptions"
Cohesion: 0.04
Nodes (48): dependencies, dotenv, express, @google/genai, lucide-react, motion, react, react-dom (+40 more)

### Community 10 - "main.py"
Cohesion: 0.24
Nodes (3): Smoke test for the health endpoint (uses FastAPI TestClient)., asyncio, test_extended_progress_tracking()

### Community 12 - "Sidebar.tsx"
Cohesion: 0.18
Nodes (8): import_classroom_notes(), post, UploadFile, Vocabulary cards with spaced repetition stats., Vocabulary, Determines which exercise types are compatible with the current vocabulary subse, test_get_compatible_exercise_types_nouns_only(), test_get_compatible_exercise_types_verbs_only()

### Community 13 - "🎓 Deutsch-Lernassistent (AI-Powered German Language Tutor)"
Cohesion: 0.09
Nodes (21): AI, 🤖 AI Agent Instructions, Backend, Backend, 🤝 Contributing, 📚 Curriculum, Deployment, 🎓 Deutsch-Lernassistent (+13 more)

### Community 14 - "plugins"
Cohesion: 0.12
Nodes (22): Run migrations in 'offline' mode.      This configures the context with just a U, Run migrations in 'online' mode.      In this scenario we need to create an Engi, run_migrations_offline(), run_migrations_online(), Base, _ensure_sqlite_dir(), Database engine and session management (SQLAlchemy 2.x async).  The engine is cr, Declarative base for all ORM models. (+14 more)

### Community 15 - "Button.tsx"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+10 more)

### Community 16 - "react"
Cohesion: 0.06
Nodes (54): get_admin_user(), get_current_user(), get_request_id(), get_settings_dep(), AsyncSession, Request, Shared FastAPI dependencies., Inject the application settings (override-friendly for tests). (+46 more)

### Community 17 - "deploy_sprint8.py"
Cohesion: 0.70
Nodes (4): banner(), p(), prog(), run()

### Community 18 - "Badge.tsx"
Cohesion: 0.13
Nodes (20): API v1 router aggregator.  Mounts every endpoint router under the v1 prefix., get_dashboard_data(), get, Health endpoint.  Phase 1's only "real" endpoint. Returns a simple status object, API v1 endpoint modules., get_german_repo(), get_german_service(), AsyncSession (+12 more)

### Community 19 - "deploy_sprint8_final.py"
Cohesion: 0.83
Nodes (3): banner(), p(), run()

### Community 20 - "deploy_sprint8_fix.py"
Cohesion: 0.83
Nodes (3): banner(), p(), run()

### Community 22 - "App.tsx"
Cohesion: 0.07
Nodes (52): queryClient, FABProps, FloatingActionButton(), Footer(), FooterProps, Header(), HeaderProps, Sidebar() (+44 more)

### Community 23 - "AchievementsPage.tsx"
Cohesion: 0.67
Nodes (3): health(), get, Return service health. Used by the frontend and CI smoke checks.

### Community 24 - "GermanRepository"
Cohesion: 0.06
Nodes (17): get_homework_history(), get, get_chat_messages(), get, ExamResult, HomeworkSubmission, MistakeLog, Categorized mistake history logged from chat and homework corrections. (+9 more)

### Community 25 - "test_progress_extended.py"
Cohesion: 0.22
Nodes (14): check_conjugation(), generate_exam(), generate_exam_signature(), get_conjugations_for_key(), get_exam_history(), Any, get, post (+6 more)

### Community 26 - "ListeningPage.tsx"
Cohesion: 0.15
Nodes (18): enrich_vocab_metadata(), ensure_user_vocabulary_seeded(), get_lesson(), list_all_lessons(), list_books(), get, post, Ensure that vocabulary table is populated with cards for the user from the seed (+10 more)

### Community 28 - "services.ts"
Cohesion: 0.25
Nodes (7): 1. `UserProgress` Table, 2. `StudySession` Table, 🔌 API Endpoints, 🛠 Architecture Overview, 💾 Database Models, 💻 Frontend Synchronization, 📊 User Progress System (Fortschrittssystem)

### Community 29 - "index.ts"
Cohesion: 0.29
Nodes (6): API Verification, Backend, Database, DEPLOY_CHECKLIST, Final Checks, Frontend

### Community 32 - "Input.tsx"
Cohesion: 0.29
Nodes (7): scripts, build, clean, dev, lint, preview, start

### Community 33 - "PageHeader.tsx"
Cohesion: 0.33
Nodes (4): ai, app, __dirname, __filename

### Community 34 - "FlashcardsPage.tsx"
Cohesion: 0.33
Nodes (5): Coding, DEVELOPMENT_RULES, Mission, Rules, Validation

### Community 35 - "GrammarPage.tsx"
Cohesion: 0.33
Nodes (4): ai, app, __dirname, __filename

### Community 36 - "LessonsPage.tsx"
Cohesion: 0.33
Nodes (5): Important Rules, Lessons Engine (Database-driven), PROJECT_CONTEXT, Project Goals, Stack

### Community 39 - "SyncPage.tsx"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 41 - "uiStore.ts"
Cohesion: 0.83
Nodes (3): banner(), p(), run()

### Community 42 - "tsconfig.json"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+10 more)

### Community 59 - "postcss.config.js"
Cohesion: 0.67
Nodes (3): vite, vite, vite

## Knowledge Gaps
- **147 isolated node(s):** `Config`, `name`, `private`, `version`, `type` (+142 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GermanRepository` connect `GermanRepository` to `GermanRepository`, `grammar.py`, `vocabulary.py`, `Sidebar.tsx`, `plugins`, `Badge.tsx`, `test_progress_extended.py`, `ListeningPage.tsx`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `get_ai_provider()` connect `get_ai_provider` to `GermanRepository`, `vocabulary.py`, `BaseOCRProvider`, `Badge.tsx`, `GermanRepository`, `test_progress_extended.py`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `Vocabulary` connect `Sidebar.tsx` to `GermanRepository`, `vocabulary.py`, `plugins`, `Badge.tsx`, `GermanRepository`, `ListeningPage.tsx`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `GermanRepository` (e.g. with `ChatMessage` and `ExamResult`) actually correct?**
  _`GermanRepository` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `Vocabulary` (e.g. with `Base` and `GermanRepository`) actually correct?**
  _`Vocabulary` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Config`, `name`, `private` to the rest of the system?**
  _147 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `get_ai_provider` be split into smaller, more focused modules?**
  _Cohesion score 0.070578231292517 - nodes in this community are weakly interconnected._