from __future__ import annotations

import pytest
from app.models.german import Vocabulary, CurriculumLesson, UserProgress
from app.services.learning_engine import IntelligentLearningEngine


def test_get_compatible_exercise_types_nouns_only() -> None:
    # Set up some nouns
    vocab1 = Vocabulary(
        german="der Tisch",
        translation="table",
        part_of_speech="noun",
        article="der",
        plural="Tische"
    )
    vocab2 = Vocabulary(
        german="das Buch",
        translation="book",
        part_of_speech="noun",
        article="das",
        plural="Bücher"
    )
    
    compatible = IntelligentLearningEngine.get_compatible_exercise_types([vocab1, vocab2])
    
    # Should contain Article Practice and Plural Practice
    assert "Article Practice" in compatible
    assert "Plural Practice" in compatible
    # Should NOT contain Verb Conjugation
    assert "Verb Conjugation" not in compatible


def test_get_compatible_exercise_types_verbs_only() -> None:
    # Set up some verbs
    vocab1 = Vocabulary(
        german="wohnen",
        translation="to live/dwell",
        part_of_speech="verb",
        infinitive="wohnen"
    )
    vocab2 = Vocabulary(
        german="kommen",
        translation="to come",
        part_of_speech="verb",
        infinitive="kommen"
    )
    
    compatible = IntelligentLearningEngine.get_compatible_exercise_types([vocab1, vocab2])
    
    # Should contain Verb Conjugation
    assert "Verb Conjugation" in compatible
    # Should NOT contain Article Practice or Plural Practice
    assert "Article Practice" not in compatible
    assert "Plural Practice" not in compatible


def test_exercise_generation_structure() -> None:
    # Set up mixed vocabulary
    vocab1 = Vocabulary(
        id=101,
        german="der Tisch",
        translation="stol",
        part_of_speech="noun",
        article="der",
        plural="Tische",
        difficulty="easy",
        example_sentence="Das Buch liegt auf dem Tisch."
    )
    vocab2 = Vocabulary(
        id=102,
        german="kommen",
        translation="kelmoq",
        part_of_speech="verb",
        infinitive="kommen",
        difficulty="easy",
        example_sentence="Ich komme aus Usbekistan."
    )
    
    lesson = CurriculumLesson(
        number=7,
        book_code="A1.1",
        title_de="Test Lektion",
        title_uz="Test Lesson",
        description_de="",
        description_uz="",
        exercises_json=[{"q": "static", "opts": ["A"], "correct": 0}]
    )
    
    progress = UserProgress(
        user_id=1,
        current_course="Momente A1.1",
        current_lesson=7
    )
    
    exercises = IntelligentLearningEngine.generate_exercises(
        lesson=lesson,
        vocab_list=[vocab1, vocab2],
        grammar_topics=[],
        user_progress=progress,
        limit=3
    )
    
    assert len(exercises) > 0
    for ex in exercises:
        assert "q" in ex
        assert "opts" in ex
        assert "correct" in ex
        assert "type" in ex
        assert isinstance(ex["opts"], list)
        assert len(ex["opts"]) >= 2
        assert 0 <= ex["correct"] < len(ex["opts"])
