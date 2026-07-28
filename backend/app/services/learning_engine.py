from __future__ import annotations

import random
import re
from typing import Any, Dict, List

from app.models.german import Vocabulary, GrammarTopic, UserProgress, CurriculumLesson


class IntelligentLearningEngine:
    """
    Intelligent Learning Engine
    ---------------------------
    Manages context-aware and compatible exercise generation by matching lesson vocabulary,
    parts of speech, grammar topics, and user progress.
    """

    @staticmethod
    def get_compatible_exercise_types(vocab_list: List[Vocabulary]) -> List[str]:
        """
        Determines which exercise types are compatible with the current vocabulary subset.
        """
        types = []
        if not vocab_list:
            return types

        # Article Practice requires nouns with articles
        nouns_with_articles = [
            v for v in vocab_list 
            if v.part_of_speech == "noun" and v.article and v.article.lower() in ("der", "die", "das")
        ]
        if nouns_with_articles:
            types.append("Article Practice")

        # Plural Practice requires nouns with plurals
        nouns_with_plurals = [
            v for v in vocab_list 
            if v.part_of_speech == "noun" and v.plural and v.plural.strip() != ""
        ]
        if nouns_with_plurals:
            types.append("Plural Practice")

        # Verb Conjugation requires verbs
        verbs = [v for v in vocab_list if v.part_of_speech == "verb"]
        if verbs:
            types.append("Verb Conjugation")

        # Translation can be applied to all vocabulary
        types.append("Translation")

        # Sentence Building works if we have vocab with example sentences
        vocab_with_examples = [v for v in vocab_list if v.example_sentence]
        if vocab_with_examples:
            types.append("Sentence Building")

        # Listening and Speaking can consume all lesson vocabulary
        types.append("Listening")
        types.append("Speaking")

        return types

    @staticmethod
    def generate_exercises(
        lesson: CurriculumLesson,
        vocab_list: List[Vocabulary],
        grammar_topics: List[GrammarTopic],
        user_progress: UserProgress,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Generates context-aware, compatible exercises dynamically.
        Prepares the ground for future adaptive learning (spaced repetition, mistake logs).
        """
        # If no vocabulary items are available, return static lesson exercises to avoid empty state
        if not vocab_list:
            return lesson.exercises_json or []

        # 1. Filter compatible exercise types based on vocabulary structure
        compatible_types = IntelligentLearningEngine.get_compatible_exercise_types(vocab_list)
        if not compatible_types:
            return lesson.exercises_json or []

        # Filter the vocabulary lists for extraction
        nouns = [v for v in vocab_list if v.part_of_speech == "noun"]
        verbs = [v for v in vocab_list if v.part_of_speech == "verb"]

        # Seed random number generator with lesson number and user progress state for consistency
        # Future adaptive logic can seed based on user mistakes / interval days
        random.seed(lesson.number + len(vocab_list))

        exercises = []
        attempts = 0
        shuffled_types = list(compatible_types)
        random.shuffle(shuffled_types)

        type_index = 0
        while len(exercises) < limit and attempts < limit * 5:
            attempts += 1
            ex_type = shuffled_types[type_index % len(shuffled_types)]
            type_index += 1

            if ex_type == "Article Practice":
                noun_pool = [n for n in nouns if n.article and n.article.lower() in ("der", "die", "das")]
                if not noun_pool:
                    continue
                noun = random.choice(noun_pool)
                opts = ["der", "die", "das"]
                correct_art = noun.article.lower().strip()
                correct_idx = opts.index(correct_art)
                # Strip the article from the German word if it is prepended
                german_word = noun.german
                for art in ["der", "die", "das", "Der", "Die", "Das"]:
                    if german_word.startswith(art + " "):
                        german_word = german_word.replace(art + " ", "", 1)
                        break
                
                exercises.append({
                    "q": f"_____ {german_word} ({noun.translation})",
                    "opts": opts,
                    "correct": correct_idx,
                    "type": "Article Practice",
                    "vocab_id": noun.id
                })

            elif ex_type == "Plural Practice":
                noun_pool = [n for n in nouns if n.plural and n.plural.strip() != ""]
                if not noun_pool:
                    continue
                noun = random.choice(noun_pool)
                correct_plural = noun.plural
                
                # Strip article for cleaner options
                noun_de = noun.german
                for art in ["der", "die", "das", "Der", "Die", "Das"]:
                    if noun_de.startswith(art + " "):
                        noun_de = noun_de.replace(art + " ", "", 1)
                        break

                opts = [correct_plural]
                # Synthesize fake plurals
                if not correct_plural.endswith("en"):
                    opts.append(noun_de + "en")
                else:
                    opts.append(noun_de + "e")
                if not correct_plural.endswith("s"):
                    opts.append(noun_de + "s")
                else:
                    opts.append(noun_de + "er")

                opts = list(set(opts))
                while len(opts) < 3:
                    opts.append(noun_de + "n")
                opts = list(set(opts))
                random.shuffle(opts)
                correct_idx = opts.index(correct_plural)

                exercises.append({
                    "q": f"'{noun.german}' so'zining ko'plik (Plural) shakli qaysi?",
                    "opts": opts,
                    "correct": correct_idx,
                    "type": "Plural Practice",
                    "vocab_id": noun.id
                })

            elif ex_type == "Verb Conjugation":
                if not verbs:
                    continue
                verb = random.choice(verbs)
                pronouns = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"]
                pronoun = random.choice(pronouns)

                stem = verb.german[:-2] if verb.german.endswith("en") else verb.german[:-1]
                verb_clean = verb.german.lower().strip()

                # Basic conjugate mappings for seeded verbs
                conjugations = {}
                if verb_clean in ("heissen", "heißen"):
                    conjugations = {"ich": "heiße", "du": "heißt", "er/sie/es": "heißt", "wir": "heißen", "ihr": "heißt", "sie/Sie": "heißen"}
                elif verb_clean == "können":
                    conjugations = {"ich": "kann", "du": "kannst", "er/sie/es": "kann", "wir": "können", "ihr": "könnt", "sie/Sie": "können"}
                elif verb_clean == "müssen":
                    conjugations = {"ich": "muss", "du": "musst", "er/sie/es": "muss", "wir": "müssen", "ihr": "müsst", "sie/Sie": "müssen"}
                elif verb_clean == "kommen":
                    conjugations = {"ich": "komme", "du": "kommst", "er/sie/es": "kommt", "wir": "kommen", "ihr": "kommt", "sie/Sie": "kommen"}
                elif verb_clean == "wohnen":
                    conjugations = {"ich": "wohne", "du": "wohnst", "er/sie/es": "wohnt", "wir": "wohnen", "ihr": "wohnt", "sie/Sie": "wohnen"}
                elif verb_clean == "entscheiden":
                    conjugations = {"ich": "entscheide", "du": "entscheidest", "er/sie/es": "entscheidet", "wir": "entscheiden", "ihr": "entscheidet", "sie/Sie": "entscheiden"}
                else:
                    # Regular verb fallback
                    conjugations = {
                        "ich": stem + "e",
                        "du": stem + "st",
                        "er/sie/es": stem + "t",
                        "wir": verb.german,
                        "ihr": stem + "t",
                        "sie/Sie": verb.german
                    }

                correct_conj = conjugations.get(pronoun)
                if not correct_conj:
                    continue

                opts = [correct_conj]
                for p in pronouns:
                    val = conjugations.get(p)
                    if val and val not in opts:
                        opts.append(val)
                    if len(opts) >= 3:
                        break
                while len(opts) < 3:
                    opts.append(stem + "t")
                opts = list(set(opts))
                random.shuffle(opts)
                correct_idx = opts.index(correct_conj)

                exercises.append({
                    "q": f"{pronoun.capitalize()} _____ ({verb.german} - {verb.translation})",
                    "opts": opts,
                    "correct": correct_idx,
                    "type": "Verb Conjugation",
                    "vocab_id": verb.id
                })

            elif ex_type == "Translation":
                word = random.choice(vocab_list)
                correct_trans = word.translation
                opts = [correct_trans]
                
                # Fetch translation options from other vocabulary
                other_words = [w for w in vocab_list if w.id != word.id]
                if other_words:
                    random.shuffle(other_words)
                    for ow in other_words:
                        if ow.translation not in opts:
                            opts.append(ow.translation)
                        if len(opts) >= 3:
                            break
                while len(opts) < 3:
                    opts.append("Boshqa tarjima " + str(len(opts)))

                opts = list(set(opts))
                random.shuffle(opts)
                correct_idx = opts.index(correct_trans)

                exercises.append({
                    "q": f"'{word.german}' so'zining tarjimasi nima?",
                    "opts": opts,
                    "correct": correct_idx,
                    "type": "Translation",
                    "vocab_id": word.id
                })

            elif ex_type == "Sentence Building":
                vocab_pool = [w for w in vocab_list if w.example_sentence]
                if not vocab_pool:
                    continue
                word = random.choice(vocab_pool)
                ex_de = word.example_sentence
                
                # Clean up Uzbek translation parentheses if present
                if "(" in ex_de:
                    ex_de = ex_de.split("(")[0].strip()

                # Replace word in sentence
                word_to_replace = word.german
                if word.part_of_speech == "noun" and word.article:
                    word_to_replace = word.german.replace(word.article + " ", "", 1).strip()

                pattern = re.compile(re.escape(word_to_replace), re.IGNORECASE)
                if not pattern.search(ex_de):
                    # Fallback to full german word
                    word_to_replace = word.german
                    pattern = re.compile(re.escape(word_to_replace), re.IGNORECASE)

                if not pattern.search(ex_de):
                    continue

                masked_sentence = pattern.sub("_____", ex_de)
                correct_answer = word_to_replace
                opts = [correct_answer]

                other_words = [w for w in vocab_list if w.id != word.id]
                if other_words:
                    random.shuffle(other_words)
                    for ow in other_words:
                        val = ow.german
                        if ow.part_of_speech == "noun" and ow.article:
                            val = ow.german.replace(ow.article + " ", "", 1).strip()
                        if val not in opts:
                            opts.append(val)
                        if len(opts) >= 3:
                            break
                while len(opts) < 3:
                    opts.append("spielen")

                opts = list(set(opts))
                random.shuffle(opts)
                correct_idx = opts.index(correct_answer)

                exercises.append({
                    "q": f"Gapni to'ldiring: {masked_sentence}",
                    "opts": opts,
                    "correct": correct_idx,
                    "type": "Sentence Building",
                    "vocab_id": word.id
                })

            elif ex_type == "Listening":
                word = random.choice(vocab_list)
                correct_trans = word.translation
                opts = [correct_trans]
                
                other_words = [w for w in vocab_list if w.id != word.id]
                if other_words:
                    random.shuffle(other_words)
                    for ow in other_words:
                        if ow.translation not in opts:
                            opts.append(ow.translation)
                        if len(opts) >= 3:
                            break
                while len(opts) < 3:
                    opts.append("Boshqa javob " + str(len(opts)))

                opts = list(set(opts))
                random.shuffle(opts)
                correct_idx = opts.index(correct_trans)

                exercises.append({
                    "q": f"🎧 '{word.german}' (talaffuzi: {word.pronunciation or word.german}) so'zining ma'nosi nima?",
                    "opts": opts,
                    "correct": correct_idx,
                    "type": "Listening",
                    "vocab_id": word.id
                })

            elif ex_type == "Speaking":
                word = random.choice(vocab_list)
                correct_pron = word.pronunciation or word.german
                opts = [correct_pron]

                other_words = [w for w in vocab_list if w.id != word.id]
                if other_words:
                    random.shuffle(other_words)
                    for ow in other_words:
                        val = ow.pronunciation or ow.german
                        if val not in opts:
                            opts.append(val)
                        if len(opts) >= 3:
                            break
                while len(opts) < 3:
                    opts.append("talaffuz")

                opts = list(set(opts))
                random.shuffle(opts)
                correct_idx = opts.index(correct_pron)

                exercises.append({
                    "q": f"🎤 '{word.german}' so'zining to'g'ri talaffuzini tanlang:",
                    "opts": opts,
                    "correct": correct_idx,
                    "type": "Speaking",
                    "vocab_id": word.id
                })

        # Deduplicate by question text
        unique_exercises = []
        seen_qs = set()
        for ex in exercises:
            if ex["q"] not in seen_qs:
                seen_qs.add(ex["q"])
                unique_exercises.append(ex)

        return unique_exercises[:limit]
