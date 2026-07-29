warning: in the working copy of 'backend/app/api/v1/endpoints/progress.py', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'backend/app/repositories/german.py', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'backend/app/schemas/german.py', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/backend/app/api/v1/endpoints/progress.py b/backend/app/api/v1/endpoints/progress.py[m
[1mindex 1a7576f..8830f06 100644[m
[1m--- a/backend/app/api/v1/endpoints/progress.py[m
[1m+++ b/backend/app/api/v1/endpoints/progress.py[m
[36m@@ -19,11 +19,22 @@[m [mrouter = APIRouter()[m
 DAY_ABBRS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][m
 [m
 [m
[32m+[m[32mdef normalize_progress(progress: UserProgress) -> UserProgress:[m
[32m+[m[32m    """Ensure completed_lessons, lesson_progress, and completed_grammar_topics are not None."""[m
[32m+[m[32m    if progress.completed_lessons is None:[m
[32m+[m[32m        progress.completed_lessons = [][m
[32m+[m[32m    if progress.lesson_progress is None:[m
[32m+[m[32m        progress.lesson_progress = {}[m
[32m+[m[32m    if progress.completed_grammar_topics is None:[m
[32m+[m[32m        progress.completed_grammar_topics = [][m
[32m+[m[32m    return progress[m
[32m+[m
[32m+[m
 @router.get("/progress", response_model=UserProgressSchema, summary="Get user progress metrics")[m
 async def get_progress(repo: GermanRepository = Depends(get_german_repo)):[m
     progress = await repo.get_progress()[m
     progress.total_xp = await repo.get_total_xp()[m
[31m-    return UserProgressSchema.from_orm(progress)[m
[32m+[m[32m    return UserProgressSchema.from_orm(normalize_progress(progress))[m
 [m
 [m
 @router.post("/progress/update", response_model=UserProgressSchema, summary="Update CEFR levels or course settings")[m
[36m@@ -66,7 +77,7 @@[m [masync def update_progress([m
 [m
     updated = await repo.update_progress(progress)[m
     updated.total_xp = await repo.get_total_xp()[m
[31m-    return UserProgressSchema.from_orm(updated)[m
[32m+[m[32m    return UserProgressSchema.from_orm(normalize_progress(updated))[m
 [m
 [m
 @router.post("/progress/log-session", response_model=StudySessionSchema, summary="Log a study session (XP + activity)")[m
[36m@@ -133,7 +144,7 @@[m [masync def complete_lesson_section([m
     sections = dict(lesson_progress_dict[lesson_key])[m
     if sections.get(section_name) is True:[m
         progress.total_xp = await repo.get_total_xp()[m
[31m-        return UserProgressSchema.from_orm(progress)[m
[32m+[m[32m        return UserProgressSchema.from_orm(normalize_progress(progress))[m
 [m
     sections[section_name] = True[m
     lesson_progress_dict[lesson_key] = sections[m
[36m@@ -151,4 +162,4 @@[m [masync def complete_lesson_section([m
 [m
     updated = await repo.update_progress(progress)[m
     updated.total_xp = await repo.get_total_xp()[m
[31m-    return UserProgressSchema.from_orm(updated)[m
[32m+[m[32m    return UserProgressSchema.from_orm(normalize_progress(updated))[m
[1mdiff --git a/backend/app/repositories/german.py b/backend/app/repositories/german.py[m
[1mindex de7da3e..29e93d2 100644[m
[1m--- a/backend/app/repositories/german.py[m
[1m+++ b/backend/app/repositories/german.py[m
[36m@@ -47,13 +47,35 @@[m [mclass GermanRepository:[m
             self.db.add(progress)[m
             await self.db.commit()[m
             await self.db.refresh(progress)[m
[32m+[m
[32m+[m[32m        if progress.completed_lessons is None:[m
[32m+[m[32m            progress.completed_lessons = [][m
[32m+[m[32m        if progress.lesson_progress is None:[m
[32m+[m[32m            progress.lesson_progress = {}[m
[32m+[m[32m        if progress.completed_grammar_topics is None:[m
[32m+[m[32m            progress.completed_grammar_topics = [][m
[32m+[m
         return progress[m
 [m
     async def update_progress(self, progress: UserProgress) -> UserProgress:[m
         progress.user_id = self.user_id[m
[32m+[m[32m        if progress.completed_lessons is None:[m
[32m+[m[32m            progress.completed_lessons = [][m
[32m+[m[32m        if progress.lesson_progress is None:[m
[32m+[m[32m            progress.lesson_progress = {}[m
[32m+[m[32m        if progress.completed_grammar_topics is None:[m
[32m+[m[32m            progress.completed_grammar_topics = [][m
         self.db.add(progress)[m
         await self.db.commit()[m
         await self.db.refresh(progress)[m
[32m+[m[41m        [m
[32m+[m[32m        if progress.completed_lessons is None:[m
[32m+[m[32m            progress.completed_lessons = [][m
[32m+[m[32m        if progress.lesson_progress is None:[m
[32m+[m[32m            progress.lesson_progress = {}[m
[32m+[m[32m        if progress.completed_grammar_topics is None:[m
[32m+[m[32m            progress.completed_grammar_topics = [][m
[32m+[m[41m            [m
         return progress[m
 [m
     # --- Vocabulary ---[m
[1mdiff --git a/backend/app/schemas/german.py b/backend/app/schemas/german.py[m
[1mindex 8494d1c..3c9b352 100644[m
[1m--- a/backend/app/schemas/german.py[m
[1m+++ b/backend/app/schemas/german.py[m
[36m@@ -3,7 +3,7 @@[m [mfrom __future__ import annotations[m
 from datetime import date, datetime[m
 from typing import Any[m
 [m
[31m-from pydantic import BaseModel[m
[32m+[m[32mfrom pydantic import BaseModel, field_validator[m
 [m
 [m
 class UserProgressSchema(BaseModel):[m
[36m@@ -27,6 +27,16 @@[m [mclass UserProgressSchema(BaseModel):[m
     completed_grammar_topics: list[int] = [][m
     total_xp: int = 0[m
 [m
[32m+[m[32m    @field_validator("completed_lessons", "completed_grammar_topics", mode="before")[m
[32m+[m[32m    @classmethod[m
[32m+[m[32m    def coerce_list(cls, v: Any) -> Any:[m
[32m+[m[32m        return v if v is not None else [][m
[32m+[m
[32m+[m[32m    @field_validator("lesson_progress", mode="before")[m
[32m+[m[32m    @classmethod[m
[32m+[m[32m    def coerce_dict(cls, v: Any) -> Any:[m
[32m+[m[32m        return v if v is not None else {}[m
[32m+[m
     class Config:[m
         from_attributes = True[m
 [m
