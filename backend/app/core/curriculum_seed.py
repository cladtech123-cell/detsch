# -*- coding: utf-8 -*-
from __future__ import annotations

SEED_BOOKS = [
    {"code": "A1.1", "title": "Momente A1.1", "cefr": "A1"},
    {"code": "A1.2", "title": "Momente A1.2", "cefr": "A1"},
    {"code": "A2.1", "title": "Momente A2.1", "cefr": "A2"},
    {"code": "A2.2", "title": "Momente A2.2", "cefr": "A2"},
    {"code": "B1.1", "title": "Momente B1.1", "cefr": "B1"},
    {"code": "B1.2", "title": "Momente B1.2", "cefr": "B1"},
]

SEED_LESSONS = [
    # Lektion 1
    {
        "book_code": "A1.1",
        "number": 1,
        "title_de": "Hallo! Wie geht's?",
        "title_uz": "Salom! Ishlar qalay?",
        "description_de": "Begrüßung, Abschied und Vorstellung der eigenen Person.",
        "description_uz": "Salomlashish, xayrlashish va o'zini tanishtirish.",
        "grammar_title": "Verbkonjugation (Präsens) & Personalpronomen",
        "grammar_explanation": "Nemis tilida fe'llar kishilik olmoshlariga ko'ra turlanadi (konjugation). Masalan: ich heiße, du heißt, er/sie/es heißt.",
        "grammar_examples_json": [
            {"de": "Ich heiße Julian.", "uz": "Mening ismim Yulian."},
            {"de": "Wie heißt du?", "uz": "Sening isming nima?"}
        ],
        "listening_dialogue": "A: Hallo! Ich bin Max. Und wer bist du?\nB: Hallo Max! Ich heiße Anna. Freut mich.\nA: Ganz meinerseits. Woher kommst du, Anna?\nB: Ich komme aus Österreich. Und du?\nA: Ich komme aus Deutschland.",
        "listening_quiz_json": [
            {
                "question": "Woher kommt Anna?",
                "options": ["Aus Deutschland", "Aus Österreich", "Aus der Schweiz"],
                "correctIndex": 1,
                "explanation": "Anna 'Ich komme aus Österreich' deb javob berdi."
            }
        ],
        "reading_passage": "Guten Tag! Mein Name ist Julian. Ich bin 25 Jahre alt und wohne in Berlin. Ich lerne Deutsch, weil ich in Deutschland arbeiten möchte. Deutsch ist eine sehr interessante Sprache.",
        "reading_quiz_json": [
            {
                "question": "Wo wohnt Julian?",
                "options": ["In Wien", "In Berlin", "In Bern"],
                "correctIndex": 1,
                "explanation": "Matnda 'ich wohne in Berlin' deb yozilgan."
            }
        ],
        "writing_prompt": "O'zingiz haqingizda nemis tilida qisqa ma'lumot yozing (ismingiz, yoshingiz, qayerdan ekanligingiz va yashash joyingiz).",
        "speaking_topic": "O'zingizni nemis tilida ovozli tarzda tanishtiring.",
        "quiz_questions_json": [
            {
                "question": "Wer _____ das?",
                "options": ["bist", "ist", "sind", "bin"],
                "correctIndex": 1,
                "explanation": "Uchinchi shaxs birlik uchun 'ist' ishlatiladi."
            }
        ],
        "vocabulary_json": [
            {"german": "hallo", "translation": "salom", "article": "", "plural": "", "pronunciation": "hallo", "ipa": "ˈhalo", "textbook_page": 8},
            {"german": "heissen", "translation": "nomlanmoq, atalmoq", "article": "", "plural": "", "pronunciation": "heissen", "ipa": "ˈhaɪ̯sn̩", "textbook_page": 8}
        ],
        "exercises_json": [
            {"q": "1. Wie _____ du? - Ich heiße Anna.", "opts": ["heißt", "heißen", "heiße"], "correct": 0},
            {"q": "2. Woher _____ Max? - Er kommt aus Deutschland.", "opts": ["kommen", "kommst", "kommt"], "correct": 2},
            {"q": "3. Ich _____ aus Österreich.", "opts": ["bin", "bist", "ist"], "correct": 0}
        ]
    },
    # Lektion 2 to 6 placeholders to satisfy curriculum range
    {
        "book_code": "A1.1",
        "number": 2,
        "title_de": "Meine Familie",
        "title_uz": "Mening oilam",
        "description_de": "Familienmitglieder und Verwandtschaftsverhältnisse.",
        "description_uz": "Oila a'zolari va qarindoshlik aloqalari haqida suhbat.",
        "grammar_title": "Possessivartikel",
        "grammar_explanation": "Egalik olmoshlari (Possessivartikel): mein/meine (mening), dein/deine (sening).",
        "grammar_examples_json": [
            {"de": "Das ist meine Mutter.", "uz": "Bu mening onam."},
            {"de": "Ist das dein Vater?", "uz": "Bu sening otangmi?"}
        ],
        "listening_dialogue": "A: Wer ist das?\nB: Das ist mein Bruder. Er heißt Thomas.\nA: Und wer ist die Frau daneben?\nB: Das ist meine Schwester. Sie heißt Laura.",
        "listening_quiz_json": [
            {
                "question": "Wer ist Thomas?",
                "options": ["Der Vater", "Der Bruder", "Der Freund"],
                "correctIndex": 1,
                "explanation": "Bruder (aka/uka) ismi Thomas."
            }
        ],
        "reading_passage": "Das ist meine Familie. Mein Vater heißt Peter und meine Mutter heißt Helga. Ich habe einen Bruder und zwei Schwestern. Wir wohnen zusammen in einem großen Haus.",
        "reading_quiz_json": [
            {
                "question": "Wie heißt der Vater?",
                "options": ["Peter", "Thomas", "Max"],
                "correctIndex": 0,
                "explanation": "Peter - otasining ismi."
            }
        ],
        "writing_prompt": "Oilangiz a'zolari va ularning ismlari haqida yozing.",
        "speaking_topic": "Oila a'zolaringizni tanishtiring va ularning yoshini ayting.",
        "quiz_questions_json": [
            {
                "question": "Das ist _____ Schwester.",
                "options": ["mein", "meine", "meinen", "meiner"],
                "correctIndex": 1,
                "explanation": "Sister (Schwester) ayol jinsida bo'lgani uchun 'meine' ishlatiladi."
            }
        ],
        "vocabulary_json": [
            {"german": "die Familie", "translation": "oila", "article": "die", "plural": "Familien", "pronunciation": "Familie", "ipa": "faˈmiːli̯ə", "textbook_page": 16},
            {"german": "der Bruder", "translation": "aka, uka", "article": "der", "plural": "Brüder", "pronunciation": "Bruder", "ipa": "ˈbʁuːdɐ", "textbook_page": 16}
        ],
        "exercises_json": [
            {"q": "1. Das ist _____ Vater. Er heißt Peter.", "opts": ["mein", "meine", "meinen"], "correct": 0},
            {"q": "2. Ist das _____ Mutter?", "opts": ["dein", "deine", "deinen"], "correct": 1},
            {"q": "3. Wie heißen _____ Geschwister?", "opts": ["deine", "dein", "deiner"], "correct": 0}
        ]
    },
    # Fill remaining to make 12 lessons in A1.1
    # Lesson 7
    {
        "book_code": "A1.1",
        "number": 7,
        "title_de": "Modalverben im Alltag",
        "title_uz": "Kundalik hayotda modal fe'llar",
        "description_de": "Einsatz von 'können', 'müssen' und 'sollen' im deutschen Alltag.",
        "description_uz": "Nemis tili kundalik hayotida 'können', 'müssen' va 'sollen' fe'llari bilan ishlash.",
        "grammar_title": "Modalverben (können, müssen, sollen)",
        "grammar_explanation": "Modal fe'llar gapda boshqa fe'llarning ma'nosini to'ldiradi. Nemis tilida modal fe'l 2-o'rinda (asosiy gapda) turlanadi, ikkinchi fe'l esa gap oxirida Infinitiv (asli) holatda keladi.",
        "grammar_examples_json": [
            {"de": "Ich kann sehr gut Deutsch sprechen.", "uz": "Men nemischa juda yaxshi gapira olaman."},
            {"de": "Du musst heute für die B2-Prüfung lernen.", "uz": "Sen bugun imtihonga tayyorlanishing shart."}
        ],
        "listening_dialogue": "A: Hallo Thomas! Kannst du heute Abend mit mir Fußball spielen?\nB: Nein, ich kann leider nicht. Ich muss für meine Deutschprüfung lernen. Meine Lehrerin sagt, ich soll mehr Grammatik üben.\nA: Schade! Vielleicht morgen?",
        "listening_quiz_json": [
            {
                "question": "Warum kann Thomas nicht Fußball spielen?",
                "options": ["Er hat keine Lust.", "Er muss für eine Prüfung lernen.", "Er ist krank."],
                "correctIndex": 1,
                "explanation": "Thomas imtihon uchun o'qishi kerakligini aytdi (Ich muss lernen)."
            }
        ],
        "reading_passage": "In Deutschland müssen Kinder ab sechs Jahren in die Schule gehen. In der Schule können sie viele interessante Fächer lernen. Jugendliche sollen jeden Tag Hausaufgaben machen, um gute Noten zu bekommen.",
        "reading_quiz_json": [
            {
                "question": "Ab wie vielen Jahren müssen Kinder in Deutschland in die Schule gehen?",
                "options": ["Ab fünf Jahren", "Ab sechs Jahren", "Ab sieben Jahren"],
                "correctIndex": 1,
                "explanation": "Matnga ko'ra: 'ab sechs Jahren in die Schule gehen'."
            }
        ],
        "writing_prompt": "Kundalik rejangiz va nima qilishga majbur yoki qodir ekanligingiz haqida yozing (können, müssen, sollen ishtirok etsin).",
        "speaking_topic": "Nemis tilida o'zingiz bajara oladigan yoki bugun bajarishingiz shart bo'lgan ishlar haqida gapiring.",
        "quiz_questions_json": [
            {
                "question": "Er _____ heute leider nicht kommen, weil er krank ist.",
                "options": ["kann", "muss", "soll", "will"],
                "correctIndex": 0,
                "explanation": "Qobiliyat yoki imkoniyat yo'qligi sababli kelolmasligini 'kann' ifodalaydi."
            },
            {
                "question": "Wir _____ die Hausaufgaben bis morgen fertig machen.",
                "options": ["müssen", "dürfen", "mögen", "könnten"],
                "correctIndex": 0,
                "explanation": "Vazifani bajarish shartligini 'müssen' majburiyati ko'rsatadi."
            }
        ],
        "vocabulary_json": [
            {"german": "die Herausforderung", "translation": "qiyinchilik, sinov", "article": "die", "plural": "Herausforderungen", "pronunciation": "Herausforderung", "ipa": "ˈhaɪ̯ʁaʊ̯sˌfɔʁdəʁʊŋ", "textbook_page": 54},
            {"german": "nachhaltig", "translation": "ekologik barqaror", "article": "", "plural": "", "pronunciation": "nachhaltig", "ipa": "ˈnaːxˌhaltɪç", "textbook_page": 55},
            {"german": "verantwortungsvoll", "translation": "mas'uliyatli", "article": "", "plural": "", "pronunciation": "verantwortungsvoll", "ipa": "fɛɐ̯ˈantvɔʁtʊŋsˌfɔl", "textbook_page": 55},
            {"german": "entscheiden", "translation": "qaror qabul qilmoq", "article": "", "plural": "", "pronunciation": "entscheiden", "ipa": "ɛntˈʃaɪ̯dn̩", "textbook_page": 56},
            {"german": "die Erfahrung", "translation": "tajriba", "article": "die", "plural": "Erfahrungen", "pronunciation": "Erfahrung", "ipa": "ɛɐ̯ˈfaːʁʊŋ", "textbook_page": 56},
            {"german": "können", "translation": "qila olmoq (modal fe'l)", "article": "", "plural": "", "pronunciation": "können", "ipa": "ˈkœnən", "textbook_page": 58},
            {"german": "müssen", "translation": "majbur bo'lmoq", "article": "", "plural": "", "pronunciation": "müssen", "ipa": "ˈmʏsən", "textbook_page": 58}
        ],
        "exercises_json": [
            {"q": "1. Ich _____ morgen früh aufstehen. (Majburiyat)", "opts": ["kann", "muss", "soll"], "correct": 1},
            {"q": "2. _____ du schwimmen? (Imkoniyat)", "opts": ["Kannst", "Musst", "Sollst"], "correct": 0},
            {"q": "3. Der Arzt sagt, ich _____ Tee trinken.", "opts": ["kann", "muss", "soll"], "correct": 2}
        ]
    },
    # Lesson 8
    {
        "book_code": "A1.1",
        "number": 8,
        "title_de": "Kundalik Hayot va Oila",
        "title_uz": "Kundalik Hayot va Oila",
        "description_de": "Alltagsaktivitäten und familiäre Beziehungen.",
        "description_uz": "Kundalik faoliyatlar va oilaviy aloqalar haqida gapirish.",
        "grammar_title": "Wechselpräpositionen & Dativ/Akkusativ",
        "grammar_explanation": "Nemis tilida ba'zi predloglar (in, an, auf, unter h.k.) harakat yo'nalishini ko'rsatsa Akkusativ, joylashuvni ko'rsatsa Dativ kelishigini talab qiladi.",
        "grammar_examples_json": [
            {"de": "Ich gehe in den Garten (Akkusativ).", "uz": "Men bog' ichiga ketyapman."},
            {"de": "Ich bin im Garten (Dativ).", "uz": "Men bog'daman."}
        ],
        "listening_dialogue": "A: Wo ist meine Brille?\nB: Sie liegt auf dem Tisch im Wohnzimmer.\nA: Und mein Buch?\nB: Das Buch liegt neben der Lampe auf dem Regal.",
        "listening_quiz_json": [
            {
                "question": "Wo ist die Brille?",
                "options": ["Auf dem Regal", "Auf dem Tisch", "Unter dem Tisch"],
                "correctIndex": 1,
                "explanation": "Brille stol ustida (auf dem Tisch) ekanligi aytildi."
            }
        ],
        "reading_passage": "Mein Alltag ist sehr geregelt. Ich stehe um sieben Uhr auf und frühstücke mit meiner Familie. Danach fahre ich mit dem Bus zur Arbeit. Abends lese ich ein Buch oder treffe meine Freunde.",
        "reading_quiz_json": [
            {
                "question": "Wie fährt der Schreiber zur Arbeit?",
                "options": ["Mit dem Auto", "Mit dem Bus", "Zu Fuß"],
                "correctIndex": 1,
                "explanation": "Matnda 'mit dem Bus zur Arbeit' deyilgan."
            }
        ],
        "writing_prompt": "Xonangizdagi buyumlar va ularning qayerda joylashganligi haqida yozing (in, auf, an predloglarini ishlating).",
        "speaking_topic": "Kundalik kun tartibingizni nemis tilida gapirib bering.",
        "quiz_questions_json": [
            {
                "question": "Ich stelle das Buch auf _____ Tisch.",
                "options": ["der", "den", "dem", "das"],
                "correctIndex": 1,
                "explanation": "Harakat yo'nalishi (stellen) bo'lgani uchun Akkusativ (den Tisch) ishlatiladi."
            }
        ],
        "vocabulary_json": [
            {"german": "der Tisch", "translation": "stol", "article": "der", "plural": "Tische", "pronunciation": "Tisch", "ipa": "tɪʃ", "textbook_page": 62},
            {"german": "das Regal", "translation": "javon", "article": "das", "plural": "Regale", "pronunciation": "Regal", "ipa": "ʁeˈɡaːl", "textbook_page": 62}
        ],
        "exercises_json": [
            {"q": "1. Ich stelle das Buch auf _____ Tisch (Akkusativ).", "opts": ["der", "den", "dem"], "correct": 1},
            {"q": "2. Das Buch liegt auf _____ Tisch (Dativ).", "opts": ["der", "den", "dem"], "correct": 2},
            {"q": "3. Wir gehen in _____ Schule.", "opts": ["die", "der", "das"], "correct": 0}
        ]
    }
]

LESSON_META = {
    3: {
        "title_de": "Essen und Trinken",
        "title_uz": "Yegulik va ichimliklar",
        "description_de": "Lebensmittel, Preise und Einkaufen im Supermarkt.",
        "description_uz": "Oziq-ovqat mahsulotlari, narxlar va do'kondagi xaridlar.",
        "grammar_title": "Akkusativ-Objekt & Unbestimmter Artikel",
        "grammar_explanation": "Nemis tilida o'tishli fe'llardan keyin keladigan to'ldiruvchi Akkusativ kelishigida bo'ladi. Masalan: einen Apfel, eine Banane, ein Brötchen."
    },
    4: {
        "title_de": "Meine Wohnung",
        "title_uz": "Mening xonadonim",
        "description_de": "Möbelstücke, Zimmerbeschreibungen und Wohnungsanzeigen.",
        "description_uz": "Mebel jihozlari, xonalarni tasvirlash va uy e'lonlari.",
        "grammar_title": "Negationsartikel & Adjektive",
        "grammar_explanation": "Narsalarni inkor qilish uchun 'kein/keine' ishlatiladi. Xonalarni tasvirlashda esa sifatlar qo'llaniladi (groß, klein, hell)."
    },
    5: {
        "title_de": "Mein Tag",
        "title_uz": "Mening kunim",
        "description_de": "Tagesablauf, Uhrzeiten und Wochentage.",
        "description_uz": "Kun tartibi, soatlar va haftaning kunlari haqida suhbat.",
        "grammar_title": "Trennbare Verben & Temporale Präpositionen",
        "grammar_explanation": "Ajraladigan fe'llar (trennbare Verben) gapda ajralib, old qo'shimchasi gap oxiriga boradi. Masalan: aufstehen (Ich stehe auf)."
    },
    6: {
        "title_de": "Freizeit und Hobbys",
        "title_uz": "Bo'sh vaqt va sevimli mashg'ulotlar",
        "description_de": "Freizeitaktivitäten, Hobbys und Verabredungen.",
        "description_uz": "Bo'sh vaqtdagi faoliyatlar, sevimli mashg'ulotlar va uchrashuvlar.",
        "grammar_title": "Verbkonjugation mit Vokalwechsel",
        "grammar_explanation": "Ba'zi kuchli fe'llar hozirgi zamonda turlanganda o'zak unlisi o'zgaradi (e -> i/ie, a -> ä). Masalan: lesen (du liest), fahren (er fährt)."
    },
    9: {
        "title_de": "Reisen und Mobilität",
        "title_uz": "Sayohat va transport",
        "description_de": "Verkehrsmittel, Wegbeschreibungen und Urlaubsziele.",
        "description_uz": "Transport vositalari, yo'nalishlarni tushuntirish va sayohat joylari.",
        "grammar_title": "Lokale Präpositionen & Imperativ",
        "grammar_explanation": "Yo'nalish va joylashuvni ko'rsatish uchun predloglar (mit dem Zug, zum Bahnhof) va buyruq mayli (Imperativ) ishlatiladi."
    },
    10: {
        "title_de": "Gesundheit und Körper",
        "title_uz": "Salomatlik va tana a'zolari",
        "description_de": "Körperteile, Krankheiten und Arztbesuche.",
        "description_uz": "Tana a'zolari, kasalliklar va shifokor qabulida bo'lish.",
        "grammar_title": "Possessivartikel im Dativ & Imperativ",
        "grammar_explanation": "Kasal bo'lganda shifokor maslahatlari va tana a'zolari egalik olmoshlari bilan Dativ kelishigida aytiladi."
    },
    11: {
        "title_de": "Kleidung und Wetter",
        "title_uz": "Kiyimlar va ob-havo",
        "description_de": "Kleidung einkaufen und über das Wetter sprechen.",
        "description_uz": "Kiyim-kechak sotib olish va ob-havo haqida gapirish.",
        "grammar_title": "Demonstrativpronomen & Komparativ",
        "grammar_explanation": "Ko'rsatish olmoshlari (dieser, dieses) va sifatlarning qiyosiy darajalari (gut - besser, gern - lieber) ishlatiladi."
    },
    12: {
        "title_de": "Feste und Feiern",
        "title_uz": "Bayramlar va tantanalar",
        "description_de": "Geburtstage, Feiertage und Geschenke.",
        "description_uz": "Tug'ilgan kunlar, bayramlar va sovg'alar haqida suhbat.",
        "grammar_title": "Dativ-Objekt & Personalpronomen im Dativ",
        "grammar_explanation": "Kimgadir sovg'a berish yoki bayram tilashda Dativ kelishigi ishlatiladi. Masalan: Ich schenke ihm ein Buch."
    }
}

# Generate simple lessons up to 12 to ensure DB has full course structure
for num in range(3, 13):
    if num not in [7, 8]:
        meta = LESSON_META.get(num, {
            "title_de": f"Lektion {num}",
            "title_uz": f"{num}-dars",
            "description_de": f"Inhalt der Lektion {num}",
            "description_uz": f"{num}-dars mazmuni",
            "grammar_title": "Grammatik",
            "grammar_explanation": "Grammatik qoidalar."
        })
        SEED_LESSONS.append({
            "book_code": "A1.1",
            "number": num,
            "title_de": meta["title_de"],
            "title_uz": meta["title_uz"],
            "description_de": meta["description_de"],
            "description_uz": meta["description_uz"],
            "grammar_title": meta["grammar_title"],
            "grammar_explanation": meta["grammar_explanation"],
            "grammar_examples_json": [],
            "listening_dialogue": "A: Hallo!\nB: Tag!",
            "listening_quiz_json": [],
            "reading_passage": "Ein interessanter Lesetext für den Deutschunterricht.",
            "reading_quiz_json": [],
            "writing_prompt": "Schreiben Sie einen kurzen Text.",
            "speaking_topic": "Sprechen Sie über das Thema.",
            "quiz_questions_json": [],
            "vocabulary_json": [],
            "exercises_json": [
                {"q": f"1. Bu {num}-darsning 1-mashqi. Nemis tilida to'g'ri so'zni toping.", "opts": ["Ausgezeichnet", "Sehr gut", "Gut"], "correct": 0},
                {"q": f"2. Bu {num}-darsning 2-mashqi. To'g'ri fe'l shaklini tanlang.", "opts": ["spreche", "sprichst", "spricht"], "correct": 2}
            ]
        })
