from app.models.german import GrammarTopic

SEED_GRAMMAR_TOPICS = [
    # --- Lektion 1 ---
    GrammarTopic(
        title="Personalpronomen (ich, du, Sie)",
        lesson="Lektion 1",
        explanation_uz="Nemis tilida kishilik olmoshlari birlikda: ich (men), du (sen), Sie (Siz - hurmat ma'nosida).",
        explanation_en="Personal pronouns in the singular: ich (I), du (you - informal), Sie (you - formal/polite).",
        examples_json=[
            {"de": "Ich bin Alex.", "uz": "Men Aleksman."},
            {"de": "Wer bist du?", "uz": "Sen kimsan?"},
            {"de": "Wie heißen Sie?", "uz": "Ismingiz nima (Siz)?"}
        ],
        common_mistakes_json=[
            {"de": "du heißen Alex (XATO)", "uz": "To'g'ri: du heißt Alex. ('du' olmoshiga '-st' qo'shimchasi qo'shiladi)"}
        ],
        practice_questions_json=[
            {"id": "l1_q1", "question": "Wer bist ___ (sen)?", "answer": "du", "hint": "Kishilik olmoshi 'sen' = du"},
            {"id": "l1_q2", "question": "Wie heißen ___ (Siz)?", "answer": "Sie", "hint": "Hurmat ma'nosidagi 'Siz' = Sie"}
        ],
        is_completed=False
    ),
    GrammarTopic(
        title="Hilfsverben: sein und heißen",
        lesson="Lektion 1",
        explanation_uz="Nemis tilida eng muhim fe'llar: 'sein' (bo'lmoq) va 'heißen' (nomlanmoq/ismga ega bo'lmoq). Hozirgi zamonda ular quyidagicha tuslanadi:\n\n- ich bin / heiße\n- du bist / heißt\n- Sie sind / heißen",
        explanation_en="Verbs 'sein' (to be) and 'heißen' (to be named). Present tense conjugation:\n- ich bin / heiße\n- du bist / heißt\n- Sie sind / heißen",
        examples_json=[
            {"de": "Ich bin Lehrer.", "uz": "Men o'qituvchiman."},
            {"de": "Du heißt Martin.", "uz": "Sening isming Martin."},
            {"de": "Sie sind Herr Wagner.", "uz": "Siz janob Vagner siz."}
        ],
        common_mistakes_json=[
            {"de": "Ich heiße Martin bin. (XATO)", "uz": "To'g'ri: Ich bin Martin. yoki Ich heiße Martin."}
        ],
        practice_questions_json=[
            {"id": "l1_q3", "question": "Ich ___ (sein) Student.", "answer": "bin", "hint": "ich bin"},
            {"id": "l1_q4", "question": "Du ___ (heißen) Sarah.", "answer": "heißt", "hint": "du heißt"}
        ],
        is_completed=False
    ),
    GrammarTopic(
        title="W-Fragen: Wer? Wie? Woher?",
        lesson="Lektion 1",
        explanation_uz="Nemis tilida so'roq so'zlar 'W' harfi bilan boshlanadi: Wer? (Kim?), Wie? (Qanday/Ism so'rashda?), Woher? (Qayerdan?). Gapda so'roq so'z 1-o'rinda, fe'l esa 2-o'rinda keladi.",
        explanation_en="Question words starting with W: Wer? (Who?), Wie? (How?), Woher? (Where from?). The question word takes the 1st position, the conjugated verb takes the 2nd position.",
        examples_json=[
            {"de": "Wer ist das?", "uz": "Bu kim?"},
            {"de": "Wie ist dein Name?", "uz": "Isming nima?"},
            {"de": "Woher kommst du?", "uz": "Qayerdan kelasan?"}
        ],
        common_mistakes_json=[
            {"de": "Woher du kommst? (XATO)", "uz": "To'g'ri: Woher kommst du? (Fe'l har doim 2-o'rinda bo'lishi karat)"}
        ],
        practice_questions_json=[
            {"id": "l1_q5", "question": "___ (Qayerdan) kommen Sie?", "answer": "Woher", "hint": "Qayerdan = Woher"},
            {"id": "l1_q6", "question": "___ (Kim) ist Herr Wagner?", "answer": "Wer", "hint": "Kim = Wer"}
        ],
        is_completed=False
    ),
    GrammarTopic(
        title="Begrüßungen und Abschiede",
        lesson="Lektion 1",
        explanation_uz="Salomlashish va xayrlashish iboralari:\n- Hallo! (Salom!)\n- Guten Morgen! (Xayrli tong!)\n- Guten Tag! (Xayrli kun!)\n- Guten Abend! (Xayrli kech!)\n- Tschüss! (Xayr!)\n- Auf Wiedersehen! (Ko'rishguncha!)",
        explanation_en="Greetings and farewells in German:\n- Hallo! (Hello!)\n- Guten Morgen! (Good morning!)\n- Guten Tag! (Good day!)\n- Guten Abend! (Good evening!)\n- Tschüss! (Bye!)\n- Auf Wiedersehen! (Goodbye!)",
        examples_json=[
            {"de": "Hallo, wie geht es dir?", "uz": "Salom, qalaysan?"},
            {"de": "Guten Tag, Herr Müller.", "uz": "Xayrli kun, janob Myuller."},
            {"de": "Auf Wiedersehen!", "uz": "Ko'rishguncha xayr!"}
        ],
        common_mistakes_json=[
            {"de": "Guten Tschüss. (XATO)", "uz": "Tschüss faqat ketishda xayrlashganda ishlatiladi."}
        ],
        practice_questions_json=[
            {"id": "l1_q7", "question": "Guten ___ (Kun)! Wie geht es Ihnen?", "answer": "Tag", "hint": "Guten Tag"},
            {"id": "l1_q8", "question": "Auf ___ (Ko'rishguncha)!", "answer": "Wiedersehen", "hint": "Auf Wiedersehen"}
        ],
        is_completed=False
    ),
    GrammarTopic(
        title="Satzbildung (Sodda gap tuzish)",
        lesson="Lektion 1",
        explanation_uz="Nemis tilida darak gaplarda kishilik olmoshi (ega) 1-o'rinda, tuslangan fe'l esa har doim 2-o'rinda turadi.\n\nEga + Fe'l + Ikkinchi darajali bo'laklar.",
        explanation_en="Word order in simple declarative sentences. The subject takes the 1st position and the conjugated verb MUST take the 2nd position.",
        examples_json=[
            {"de": "Ich komme aus Usbekistan.", "uz": "Men O'zbekistondanman."},
            {"de": "Das ist Herr Wagner.", "uz": "Bu janob Vagner."}
        ],
        common_mistakes_json=[
            {"de": "Aus Usbekistan ich komme. (XATO)", "uz": "To'g'ri: Ich komme aus Usbekistan. yoki Aus Usbekistan komme ich. (fe'l baribir 2-o'rinda)"}
        ],
        practice_questions_json=[
            {"id": "l1_q9", "question": "Ich ___ (komme) aus Taschkent.", "answer": "komme", "hint": "ich uchun fe'l oxiriga -e qo'shiladi."}
        ],
        is_completed=False
    ),

    # --- Lektion 2 ---
    GrammarTopic(
        title="Regelmäßige Verben (Muntazam fe'llar)",
        lesson="Lektion 2",
        explanation_uz="Muntazam fe'llarni tuslash uchun fe'l o'zagiga (stem) quyidagi qo'shimchalar qo'shiladi:\n\n- ich: -e (wohne)\n- du: -st (wohnst)\n- er/sie/es: -t (wohnt)\n- wir: -en (wohnen)\n- ihr: -t (wohnt)\n- sie/Sie: -en (wohnen)",
        explanation_en="Present tense conjugation of regular verbs. Add the endings to the verb stem:\n- ich: -e\n- du: -st\n- er/sie/es: -t\n- wir: -en\n- ihr: -t\n- sie/Sie: -en",
        examples_json=[
            {"de": "Wir learnen Deutsch.", "uz": "Biz nemis tilini o'rganyapmiz."},
            {"de": "Ihr wohnt in Berlin.", "uz": "Sizlar Berlinda yashaysizlar."}
        ],
        common_mistakes_json=[
            {"de": "Ihr wohnen in Hamburg. (XATO)", "uz": "To'g'ri: Ihr wohnt in Hamburg. ('ihr' olmoshi uchun '-t' qo'shimchasi qo'shiladi)"}
        ],
        practice_questions_json=[
            {"id": "l2_q1", "question": "Du ___ (lernen) schnell.", "answer": "lernst", "hint": "du lernst"},
            {"id": "l2_q2", "question": "Er ___ (wohnen) in Taschkent.", "answer": "wohnt", "hint": "er wohnt"}
        ],
        is_completed=False
    ),
    GrammarTopic(
        title="Personalpronomen (er, sie, es, wir, ihr, sie)",
        lesson="Lektion 2",
        explanation_uz="Uchinchi shaxs kishilik olmoshlari:\n- er (u - erkak jinsi, der)\n- sie (u - ayol jinsi, die)\n- es (u - o'rta jins, das)\n\nKo'plikda:\n- wir (biz)\n- ihr (sizlar - do'stona ko'plik)\n- sie (ular)",
        explanation_en="Personal pronouns in singular and plural:\n- er (he/masculine)\n- sie (she/feminine)\n- es (it/neuter)\n- wir (we)\n- ihr (you plural - informal)\n- sie (they)",
        examples_json=[
            {"de": "Das ist Martin. Er ist Architekt.", "uz": "Bu Martin. U me'mor."},
            {"de": "Wir sind hier.", "uz": "Biz shu yerdamiz."}
        ],
        common_mistakes_json=[
            {"de": "Martin sie ist Architekt. (XATO)", "uz": "Martin erkak kishi bo'lgani uchun 'er' ishlatiladi."}
        ],
        practice_questions_json=[
            {"id": "l2_q3", "question": "Anna und Maria sind Schüler. ___ (Ular) lernen Deutsch.", "answer": "Sie", "hint": "Ular = Sie"},
            {"id": "l2_q4", "question": "___ (Biz) sind glücklich.", "answer": "Wir", "hint": "Biz = Wir"}
        ],
        is_completed=False
    ),
    GrammarTopic(
        title="Berufe, Zahlen und Alter",
        lesson="Lektion 2",
        explanation_uz="Kasblar va yoshni aytish:\n- Er ist Lehrer. (U o'qituvchi - erkak).\n- Sie ist Lehrerin. (U o'qituvchi - ayol. Ayol kasblariga '-in' qo'shiladi).\n- Yoshni aytishda 'sein' fe'li ishlatiladi: Ich bin 25 Jahre alt.\n- Sonlar: eins (1), zwei (2), drei (3), zehn (10), zwanzig (20).",
        explanation_en="Talking about professions, numbers, and age:\n- Er ist Lehrer. (He is a teacher).\n- Sie ist Lehrerin. (She is a teacher. Add '-in' for female professions).\n- Age uses 'sein': Ich bin 25 Jahre alt.\n- Numbers: eins (1), zwei (2), drei (3), zehn (10), zwanzig (20).",
        examples_json=[
            {"de": "Sie ist Ärztin.", "uz": "U shifokor (ayol)."},
            {"de": "Wie alt bist du?", "uz": "Yoshing nechada?"},
            {"de": "Ich bin dreißig Jahre alt.", "uz": "Men o'ttiz yoshdaman."}
        ],
        common_mistakes_json=[
            {"de": "Ich habe 20 Jahre alt. (XATO)", "uz": "To'g'ri: Ich bin 20 Jahre alt. (Yosh aytishda 'sein' fe'li ishlatiladi)"}
        ],
        practice_questions_json=[
            {"id": "l2_q5", "question": "Sie ist Journalistin. Er ist ___ (Journalist - erkak).", "answer": "Journalist", "hint": "Erkak kishi uchun -in qo'shimchasi olib tashlanadi."},
            {"id": "l2_q6", "question": "Wie alt ___ (bist) du?", "answer": "bist", "hint": "du bist"}
        ],
        is_completed=False
    ),
    GrammarTopic(
        title="Hilfsverben: haben va sein",
        lesson="Lektion 2",
        explanation_uz="Nemis tilidagi eng muhim ikki yordamchi fe'lning tuslanishi:\n\nsein (bo'lmoq):\n- ich bin, du bist, er/sie/es ist, wir sind, ihr seid, sie/Sie sind\n\nhaben (bor bo'lmoq/egalik):\n- ich habe, du hast, er/sie/es hat, wir haben, ihr habt, sie/Sie haben",
        explanation_en="Conjugation of 'haben' (to have) and 'sein' (to be):\nsein:\n- ich bin, du bist, er/sie/es ist, wir sind, ihr seid, sie/Sie sind\nhaben:\n- ich habe, du hast, er/sie/es hat, wir haben, ihr habt, sie/Sie haben",
        examples_json=[
            {"de": "Ich habe ein Auto.", "uz": "Mening mashinam bor."},
            {"de": "Ihr seid schlau.", "uz": "Sizlar aqllidirsizlar."}
        ],
        common_mistakes_json=[
            {"de": "Du habt ein Buch. (XATO)", "uz": "To'g'ri: Du hast ein Buch. ('du' uchun 'hast')"}
        ],
        practice_questions_json=[
            {"id": "l2_q7", "question": "Er ___ (haben) ein Kind.", "answer": "hat", "hint": "er hat"},
            {"id": "l2_q8", "question": "Ihr ___ (sein) bereit.", "answer": "seid", "hint": "ihr seid"}
        ],
        is_completed=False
    ),

    # --- Lektion 3 ---
    GrammarTopic(
        title="Possessivartikel (Egalik artikllari)",
        lesson="Lektion 3",
        explanation_uz="Kishilik olmoshlariga mos egalik artikllari:\n- ich -> mein (mening)\n- du -> dein (sening)\n- Sie -> Ihr (Sizning)\n\nAgar orqasidan kelgan ot ayol jinsida (die) yoki ko'plikda bo'lsa, artikl oxiriga '-e' qo'shiladi: meine Mutter, dein Vater.",
        explanation_en="Possessive articles in German:\n- ich -> mein (my)\n- du -> dein (your)\n- Sie -> Ihr (your - formal)\n\nIf the following noun is feminine or plural, add '-e': meine Mutter, dein Vater.",
        examples_json=[
            {"de": "Das ist mein Vater.", "uz": "Bu mening dadam."},
            {"de": "Ist das deine Mutter?", "uz": "Bu sening onangmi?"},
            {"de": "Wie ist Ihr Name?", "uz": "Ismingiz nima (Sizning)?"}
        ],
        common_mistakes_json=[
            {"de": "Das ist meine Vater. (XATO)", "uz": "To'g'ri: Das ist mein Vater. (Vater - erkak jinsida, shuning uchun 'mein' ishlatiladi)"}
        ],
        practice_questions_json=[
            {"id": "l3_q1", "question": "Das ist ___ (mening - Vater: der) Vater.", "answer": "mein", "hint": "Vater erkak jinsida, shuning uchun 'mein'."},
            {"id": "l3_q2", "question": "Das ist ___ (sening - Schwester: die) Schwester.", "answer": "deine", "hint": "Schwester ayol jinsida, shuning uchun 'deine'."}
        ],
        is_completed=False
    ),
    GrammarTopic(
        title="Familie und Pluralformen (Oila va Ko'plik shakllari)",
        lesson="Lektion 3",
        explanation_uz="Oila a'zolari va otlarning ko'plik shakli yasalishi. Ko'plikdagi barcha otlarning artikli 'die' bo'ladi va ularga quyidagi qo'shimchalar qo'shilishi mumkin:\n\n- '-e': der Sohn -> die Söhne\n- '-n' / '-en': die Schwester -> die Schwestern\n- '-er': das Kind -> die Kinder\n- '-s': das Auto -> die Autos\n- o'zgarmas: der Vater -> die Väter (umlyaut bilan)",
        explanation_en="Family members and plural nouns. All plural nouns use the article 'die'. Endings vary:\n- '-e': die Söhne\n- '-n'/'-en': die Schwestern\n- '-er': die Kinder\n- '-s': die Autos\n- Umlaut only: die Väter",
        examples_json=[
            {"de": "Meine Kinder sind hier.", "uz": "Mening bolalarim shu yerda."},
            {"de": "Ich habe zwei Schwestern.", "uz": "Mening ikkita opam bor."}
        ],
        common_mistakes_json=[
            {"de": "zwei Kind (XATO)", "uz": "To'g'ri: zwei Kinder. (Sonlardan keyin ot ko'plikda keladi)"}
        ],
        practice_questions_json=[
            {"id": "l3_q3", "question": "die Schwester (birlik) -> die ___ (ko'plik)", "answer": "Schwestern", "hint": "-n qo'shiladi."},
            {"id": "l3_q4", "question": "das Kind (birlik) -> die ___ (ko'plik)", "answer": "Kinder", "hint": "-er qo'shiladi."}
        ],
        is_completed=False
    ),

    # --- Lektion 4 ---
    GrammarTopic(
        title="Bestimmter Artikel: der, die, das",
        lesson="Lektion 4",
        explanation_uz="Nemis tilida har bir ot o'zining jinsiga ko'ra aniq artiklga ega:\n- Erk jinsi (Maskulin): der (der Tisch - stol)\n- Ayol jinsi (Feminin): die (die Lampe - chiroq)\n- O'rta jins (Neutral): das (das Bett - karovot)\n- Ko'plik (Plural): die (die Stühle - stullar)",
        explanation_en="Definite articles: der (masculine), die (feminine), das (neuter), die (plural). Every noun in German has a gender which must be memorized.",
        examples_json=[
            {"de": "Der Schrank ist groß.", "uz": "Javon katta."},
            {"de": "Die Couch ist bequem.", "uz": "Divan qulay."},
            {"de": "Das Bild ist schön.", "uz": "Rasm chiroyli."}
        ],
        common_mistakes_json=[
            {"de": "das Tisch (XATO)", "uz": "To'g'ri: der Tisch. (Tisch erkak jinsida)"}
        ],
        practice_questions_json=[
            {"id": "l4_q1", "question": "___ (der/die/das) Stuhl ist alt.", "answer": "Der", "hint": "Stuhl = der"},
            {"id": "l4_q2", "question": "___ (der/die/das) Bett ist neu.", "answer": "Das", "hint": "Bett = das"}
        ],
        is_completed=False
    ),
    GrammarTopic(
        title="Nominativ und Adjektive",
        lesson="Lektion 4",
        explanation_uz="Nominativ - bosh kelishik (Kim? Nima? savollariga javob beradi). Gapning egasi har doim Nominativda bo'ladi. Sifatlar buyumlarning belgilarini tasvirlashda ishlatiladi va gapda o'zgarmasdan keladi: Der Tisch ist billig (Stol arzon).",
        explanation_en="The Nominative case represents the subject of the sentence (answers: Who? or What?). Adjectives describing nouns after the verb 'sein' do not change their endings.",
        examples_json=[
            {"de": "Das Sofa ist teuer.", "uz": "Divan qimmat."},
            {"de": "Der Teppich ist billig.", "uz": "Gilam arzon."}
        ],
        common_mistakes_json=[
            {"de": "Der Tisch ist billige. (XATO)", "uz": "To'g'ri: Der Tisch ist billig. (Sifat fe'ldan keyin kelganda qo'shimcha olmaydi)"}
        ],
        practice_questions_json=[
            {"id": "l4_q3", "question": "Die Lampe ist ___ (modern - modern).", "answer": "modern", "hint": "Sifatni o'zini yozing."}
        ],
        is_completed=False
    ),

    # --- Lektion 5 ---
    GrammarTopic(
        title="Unbestimmter Artikel: ein, eine",
        lesson="Lektion 5",
        explanation_uz="Noaniq artikllar narsa-buyum birinchi marta tilga olinganda ishlatiladi:\n- der -> ein\n- das -> ein\n- die -> eine\n- Ko'plikda noaniq artikl ishlatilmaydi (nol artikl).",
        explanation_en="Indefinite articles: ein (masculine/neuter), eine (feminine). Used when introducing a noun for the first time. Plural nouns have no indefinite article.",
        examples_json=[
            {"de": "Das ist ein Tisch.", "uz": "Bu stol (qandaydir stol)."},
            {"de": "Das ist eine Brille.", "uz": "Bu ko'zoynak."}
        ],
        common_mistakes_json=[
            {"de": "Das ist eine Tisch. (XATO)", "uz": "To'g'ri: Das ist ein Tisch. (Tisch erkak jinsida, shuning uchun 'ein')"}
        ],
        practice_questions_json=[
            {"id": "l5_q1", "question": "Das ist ___ (ein/eine - Buch: das) Buch.", "answer": "ein", "hint": "Buch o'rta jinsda, shuning uchun 'ein'."},
            {"id": "l5_q2", "question": "Das ist ___ (ein/eine - Tasche: die) Tasche.", "answer": "eine", "hint": "Tasche ayol jinsida, shuning uchun 'eine'."}
        ],
        is_completed=False
    ),
    GrammarTopic(
        title="Negativartikel: kein, keine",
        lesson="Lektion 5",
        explanation_uz="Noaniq artiklli yoki artiklsiz otlarni inkor qilishda 'kein' (erkak/o'rta jins) va 'keine' (ayol jinsi/ko'plik) inkor artikli ishlatiladi.\n\n- Das ist ein Stuhl. -> Das ist kein Stuhl. (Bu stul emas).\n- Das ist eine Tasche. -> Das ist keine Tasche.",
        explanation_en="Negative articles: kein (masculine/neuter), keine (feminine/plural). Used to negate nouns that would otherwise take an indefinite article or no article.",
        examples_json=[
            {"de": "Ich habe kein Geld.", "uz": "Mening pulim yo'q."},
            {"de": "Das ist keine Lampe.", "uz": "Bu chiroq emas."}
        ],
        common_mistakes_json=[
            {"de": "Das ist nicht ein Buch. (XATO)", "uz": "To'g'ri: Das ist kein Buch. (Otlar 'kein' bilan inkor qilinadi, 'nicht' bilan emas)"}
        ],
        practice_questions_json=[
            {"id": "l5_q3", "question": "Das ist ___ (kein/keine - Tisch: der) Tisch.", "answer": "kein", "hint": "Tisch - der, shuning uchun kein."},
            {"id": "l5_q4", "question": "Das ist ___ (kein/keine - Uhr: die) Uhr.", "answer": "keine", "hint": "Uhr - die, shuning uchun keine."}
        ],
        is_completed=False
    ),

    # --- Lektion 6 ---
    GrammarTopic(
        title="Akkusativ (Tushum kelishigi)",
        lesson="Lektion 6",
        explanation_uz="Akkusativ (tushum kelishigi - Kimni? Nimani? so'roqlariga javob beradi). Akkusativ kelishigida FAQAT erkak jinsidagi (der) artikllar o'zgaradi:\n\n- der -> den / ein -> einen / kein -> keinen / mein -> meinen\n\nAyol jinsi, o'rta jins va ko'plik artikllari mutlaqo o'zgarmasdan qoladi.",
        explanation_en="The Accusative case (direct object). ONLY masculine nouns change their articles:\n- der -> den / ein -> einen / kein -> keinen / mein -> meinen\nFeminine, neuter, and plural articles remain unchanged.",
        examples_json=[
            {"de": "Ich suche den Schlüssel (der Schlüssel).", "uz": "Men kalitni qidiryapman."},
            {"de": "Er kauft einen Tisch.", "uz": "U stol sotib olyapti."},
            {"de": "Ich habe ein Buch (das Buch - o'zgarmas).", "uz": "Menda kitob bor."}
        ],
        common_mistakes_json=[
            {"de": "Ich habe ein Hund. (XATO)", "uz": "To'g'ri: Ich habe einen Hund. (Hund - der, Akkusativda 'einen' bo'ladi)"}
        ],
        practice_questions_json=[
            {"id": "l6_q1", "question": "Ich brauche ___ (den/die/das - Stuhl: der) Stuhl.", "answer": "den", "hint": "Stuhl erkak jinsida, Akkusativda den bo'ladi."},
            {"id": "l6_q2", "question": "Wir suchen ___ (den/die/das - Tasche: die) Tasche.", "answer": "die", "hint": "Tasche ayol jinsida, Akkusativda o'zgarmaydi."}
        ],
        is_completed=False
    ),
    GrammarTopic(
        title="Büro und Modal expressions",
        lesson="Lektion 6",
        explanation_uz="Ofis jihozlari, uchrashuvlar belgilash va vaqt kelishish iboralari. Nemis tilida vaqt kelishish uchun 'haben' fe'li ishlatiladi: 'Haben Sie Zeit?' (Vaqtingiz bormi?).",
        explanation_en="Office items, appointments, and modal expressions. German uses 'haben' to ask about availability: 'Haben Sie Zeit?' (Do you have time?).",
        examples_json=[
            {"de": "Ich brauche einen Stift.", "uz": "Menga ruchka kerak."},
            {"de": "Haben Sie heute Zeit?", "uz": "Bugun vaqtingiz bormi?"}
        ],
        common_mistakes_json=[
            {"de": "Ich brauche ein Stift. (XATO)", "uz": "To'g'ri: Ich brauche einen Stift. (Stift - der, Akkusativda 'einen')"}
        ],
        practice_questions_json=[
            {"id": "l6_q3", "question": "___ (Haben) Sie Zeit?", "answer": "Haben", "hint": "Sie uchun Haben."}
        ],
        is_completed=False
    ),

    # --- Lektion 7 ---
    GrammarTopic(
        title="Modalverb: können",
        lesson="Lektion 7",
        explanation_uz="Modal fe'l 'können' (qila olmoq, jismoniy qobiliyat yoki imkoniyatga ega bo'lish). Hozirgi zamonda tuslanishi:\n- ich kann\n- du kannst\n- er/sie/es kann\n- wir können\n- ihr könnt\n- sie/Sie können",
        explanation_en="The modal verb 'können' (can, to be able to). Present tense conjugation:\n- ich kann\n- du kannst\n- er/sie/es kann\n- wir können\n- ihr könnt\n- sie/Sie können",
        examples_json=[
            {"de": "Ich kann Deutsch sprechen.", "uz": "Men nemis tilida gaplasha olaman."},
            {"de": "Kannst du schwimmen?", "uz": "Sen suza olasanmi?"}
        ],
        common_mistakes_json=[
            {"de": "Ich kanns spielen. (XATO)", "uz": "To'g'ri: Ich kann spielen."}
        ],
        practice_questions_json=[
            {"id": "l7_q1", "question": "Er ___ (können) gut Fußball spielen.", "answer": "kann", "hint": "er kann"},
            {"id": "l7_q2", "question": "___ (können) du schwimmen?", "answer": "Kannst", "hint": "du kannst"}
        ],
        is_completed=False
    ),
    GrammarTopic(
        title="Verbposition mit Modalverben",
        lesson="Lektion 7",
        explanation_uz="Modal fe'l ishtirok etgan gaplarda tuslangan modal fe'l har doim gapda 2-o'rinda keladi. Asosiy harakat fe'li esa gapning eng oxirida infinitiv (boshlang'ich) shaklida o'zgarmasdan keladi.",
        explanation_en="Word order with modal verbs. The conjugated modal verb takes the 2nd position, and the main action verb goes to the very end of the sentence in its infinitive form.",
        examples_json=[
            {"de": "Ich kann heute nicht kommen.", "uz": "Men bugun kela olmayman."},
            {"de": "Wir müssen Deutsch lernen.", "uz": "Biz nemis tilini o'rganishimiz kerak."}
        ],
        common_mistakes_json=[
            {"de": "Ich kann sprechen Deutsch. (XATO)", "uz": "To'g'ri: Ich kann Deutsch sprechen. (Asosiy fe'l gap oxiriga borishi shart)"}
        ],
        practice_questions_json=[
            {"id": "l7_q3", "question": "Wir wollen morgen ___ (lernen - infinitiv).", "answer": "lernen", "hint": "Fe'l infinitiv shaklda gap oxirida bo'ladi."}
        ],
        is_completed=False
    ),
    GrammarTopic(
        title="Häufigkeitsadverbien (Tez-tezlik ravishlari)",
        lesson="Lektion 7",
        explanation_uz="Harakatning takrorlanish darajasini ko'rsatadigan ravishlar:\n- immer (har doim)\n- oft (tez-tez)\n- manchmal (ba'zida)\n- fast nie (deyarli hech qachon)\n- nie (hech qachon)",
        explanation_en="Adverbs of frequency in German:\n- immer (always)\n- oft (often)\n- manchmal (sometimes)\n- fast nie (almost never)\n- nie (never)",
        examples_json=[
            {"de": "Ich spiele oft Fußball.", "uz": "Men tez-tez futbol o'ynayman."},
            {"de": "Er lernt immer Deutsch.", "uz": "U har doim nemis tilini o'rganadi."}
        ],
        common_mistakes_json=[
            {"de": "Ich oft spiele Fußball. (XATO)", "uz": "To'g'ri: Ich spiele oft Fußball. (Fe'l 2-o'rinda qoladi)"}
        ],
        practice_questions_json=[
            {"id": "l7_q4", "question": "Men deyarli hech qachon televizor ko'rmayman. -> Ich sehe fast ___ (hech qachon) fern.", "answer": "nie", "hint": "fast nie"}
        ],
        is_completed=False
    ),

    # --- Lektion 8 ---
    GrammarTopic(
        title="Uhrzeit (Soat va Vaqt)",
        lesson="Lektion 8",
        explanation_uz="Soatni aytishning ikki xil usuli bor:\n1. Norasmiy (og'zaki): 'halb' (yarim), 'viertel vor' (chorak kam), 'viertel nach' (chorak o'tdi).\n2. Rasmiy (radioda, vokzalda): 'Uhr' so'zi ishlatiladi. Masalan: 14:30 = vierzehn Uhr dreißig.",
        explanation_en="Telling the time in German. Two systems:\n1. Informal: 'halb' (half past), 'viertel vor' (quarter to), 'viertel nach' (quarter past).\n2. Formal: uses 'Uhr', e.g., 14:30 = vierzehn Uhr dreißig.",
        examples_json=[
            {"de": "Es ist halb acht (7:30).", "uz": "Soat yetti yarim."},
            {"de": "Es ist viertel nach zwei (2:15).", "uz": "Soat ikkidan chorak o'tdi."}
        ],
        common_mistakes_json=[
            {"de": "Es ist halb sieben (7:30). (XATO)", "uz": "To'g'ri: Es ist halb acht (7:30). (Nemis tilida keyingi soatning yarmi aytiladi)"}
        ],
        practice_questions_json=[
            {"id": "l8_q1", "question": "Soat 8:30 -> Es ist halb ___.", "answer": "neun", "hint": "Keyingi soat aytiladi: 9 ning yarmi."}
        ],
        is_completed=False
    ),
    GrammarTopic(
        title="Temporale Präpositionen: am, um",
        lesson="Lektion 8",
        explanation_uz="Vaqt predloglari:\n- 'am' predlogi hafta kunlari va kun qismlari uchun ishlatiladi: am Montag (dushanbada), am Abend (kechqurun).\n- 'um' predlogi aniq soat uchun ishlatiladi: um 8 Uhr (soat 8 da).\n- 'Wann?' (Qachon?) savoliga javob beradi.",
        explanation_en="Time prepositions:\n- 'am': used for days and parts of the day, e.g., am Montag, am Abend.\n- 'um': used for specific times, e.g., um 8 Uhr.\n- Answers the question 'Wann?' (When?).",
        examples_json=[
            {"de": "Am Samstag gehe ich ins Kino.", "uz": "Shanba kuni kinoga boraman."},
            {"de": "Der Kurs beginnt um 9 Uhr.", "uz": "Kurs soat 9 da boshlanadi."}
        ],
        common_mistakes_json=[
            {"de": "Ich komme um Montag. (XATO)", "uz": "To'g'ri: Ich komme am Montag."}
        ],
        practice_questions_json=[
            {"id": "l8_q2", "question": "___ (um/am) Montag habe ich frei.", "answer": "Am", "hint": "Hafta kunlari uchun am."},
            {"id": "l8_q3", "question": "Der Film startet ___ (um/am) 20 Uhr.", "answer": "um", "hint": "Soat uchun um."}
        ],
        is_completed=False
    ),

    # --- Lektion 9 ---
    GrammarTopic(
        title="Modalverben: mögen und möchten",
        lesson="Lektion 9",
        explanation_uz="Yoqtirmoq va xohlamoq modal fe'llari:\n- 'mögen' (umuman yoqtirmoq): ich mag, du magst, er mag, wir mögen\n- 'möchten' (nimanidir xohlamoq - muloyim shakl): ich möchte, du möchtest, er möchte, wir möchten",
        explanation_en="Modal verbs: 'mögen' (to like in general) and 'möchten' (would like - polite request):\nConjugations:\n- ich mag / möchte\n- du magst / möchtest\n- er/sie/es mag / möchte\n- wir mögen / möchten",
        examples_json=[
            {"de": "Ich mag Pizza.", "uz": "Men pitsani yaxshi ko'raman."},
            {"de": "Ich möchte einen Kaffee trinken.", "uz": "Men kofe ichishni xohlayman."}
        ],
        common_mistakes_json=[
            {"de": "Ich möchte Pizza mögen. (XATO)", "uz": "Bu ikki fe'l birga kelmaydi."}
        ],
        practice_questions_json=[
            {"id": "l9_q1", "question": "Ich ___ (möchten) einen Tee bitte.", "answer": "möchte", "hint": "ich möchte"},
            {"id": "l9_q2", "question": "Du ___ (mögen) Schokolade.", "answer": "magst", "hint": "du magst"}
        ],
        is_completed=False
    ),

    # --- Lektion 10 ---
    GrammarTopic(
        title="Trennbare Verben (Ajraladigan fe'llar)",
        lesson="Lektion 10",
        explanation_uz="Nemis tilida ba'zi fe'llarning old qo'shimchalari gapda ajralib, gapning eng oxiriga ketadi. Hozirgi zamonda faqat fe'lning o'zi tuslanadi.\n\nMasalan: einkaufen (bozorlik qilmoq) -> Ich kaufe ein. (Men bozorlik qilyapman).",
        explanation_en="Separable verbs. The prefix detaches and goes to the very end of the sentence. Only the base verb is conjugated in the 2nd position.\nExample: einkaufen -> Ich kaufe ein.",
        examples_json=[
            {"de": "Ich rufe dich an (anrufen).", "uz": "Men senga qo'ng'iroq qilyapman."},
            {"de": "Wann stehst du auf (aufstehen)?", "uz": "Qachon uyg'onasan?"}
        ],
        common_mistakes_json=[
            {"de": "Ich einkaufe heute. (XATO)", "uz": "To'g'ri: Ich kaufe today ein. ('ein' qo'shimchasi gap oxiriga ketadi)"}
        ],
        practice_questions_json=[
            {"id": "l10_q1", "question": "Ich stehe um 6 Uhr ___ (aufstehen - old qo'shimcha).", "answer": "auf", "hint": "aufstehen -> auf oxirida."},
            {"id": "l10_q2", "question": "Du ___ (anrufen - call) mich an.", "answer": "rufst", "hint": "du rufst"}
        ],
        is_completed=False
    ),

    # --- Lektion 11 ---
    GrammarTopic(
        title="Perfekt mit haben",
        lesson="Lektion 11",
        explanation_uz="O'tgan zamon (Perfekt) shakli yordamchi fe'l 'haben' (gapda 2-o'rinda keladi) va asosiy harakat fe'lining Partizip II shakli (gap oxirida) yordamida yasaladi.\n\nPartizip II yasalishi (muntazam fe'llar): ge- + o'zak + -t. Masalan: lernen -> gelernt.",
        explanation_en="The conversational past tense (Perfekt) with 'haben'. Formed with the auxiliary 'haben' in the 2nd position and the Partizip II of the main verb at the end.\nPartizip II formula for regular verbs: ge- + stem + -t (e.g., lernen -> gelernt).",
        examples_json=[
            {"de": "Ich habe gestern Deutsch gelernt.", "uz": "Men kecha nemis tilini o'rgandim."},
            {"de": "Wir haben Pizza gemaht.", "uz": "Biz pitsa qildik."}
        ],
        common_mistakes_json=[
            {"de": "Ich habe Deutsch gelernt gestern. (XATO)", "uz": "To'g'ri: Ich habe gestern Deutsch gelernt. (Partizip II gapning eng oxirida bo'lishi shart)"}
        ],
        practice_questions_json=[
            {"id": "l11_q1", "question": "Ich habe Hausaufgaben ___ (machen - Partizip II).", "answer": "gemacht", "hint": "machen -> gemacht"},
            {"id": "l11_q2", "question": "Du ___ (haben) gestern gearbeitet.", "answer": "hast", "hint": "du hast"}
        ],
        is_completed=False
    ),

    # --- Lektion 12 ---
    GrammarTopic(
        title="Perfekt mit sein",
        lesson="Lektion 12",
        explanation_uz="Harakat (bir joydan ikkinchi joyga ko'chish: gehen, fahren) yoki holat o'zgarishi (uyg'onish: aufstehen) fe'llari o'tgan zamonda 'haben' emas, balki 'sein' yordamchi fe'li bilan keladi.",
        explanation_en="The past tense (Perfekt) with 'sein'. Used for verbs of movement (change of location, e.g., gehen, fahren) or change of state (e.g., aufstehen, einschlafen).",
        examples_json=[
            {"de": "Ich bin nach Berlin gefahren.", "uz": "Men Berlinga bordim (mashinada/poyezdda)."},
            {"de": "Wir sind ins Kino gegangen.", "uz": "Biz kinoga bordik."}
        ],
        common_mistakes_json=[
            {"de": "Ich habe nach Berlin gefahren. (XATO)", "uz": "To'g'ri: Ich bin nach Berlin gefahren. (Fahren - harakat fe'li, shuning uchun 'sein' ishlatiladi)"}
        ],
        practice_questions_json=[
            {"id": "l12_q1", "question": "Ich ___ (sein) gestern nach Hause gegangen.", "answer": "bin", "hint": "ich bin"},
            {"id": "l12_q2", "question": "Wir ___ (sein) nach Taschkent gefahren.", "answer": "sind", "hint": "wir sind"}
        ],
        is_completed=False
    )
]
