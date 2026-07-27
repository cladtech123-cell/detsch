import { UserProfile, VocabWord, GrammarTopic, Lesson, ActivityItem, ExamQuestion } from '../types';

export const initialUserProfile: UserProfile = {
  name: 'Julian',
  level: "B2 O'rta nemis tili",
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIbdrcjAMVx-7TNIA1NylVdL_VjpVWoF8JQhXP7wTG4YXmrA_z5q34E6kYz5gbous0FOa2IFx2NN2rMzkJcbVfJyOpQBe2qVvs3rBIcsa0eppqpv60VsrOZB1MQiNsf5iqx3RoTVN_FL0-G1QnqlQCatdUHOzejcyiPwWGO_ZH4b7v60C7j_V7BPv9F_e3bPbVdeoyirJaI1V1ZxagAEIoLdsfa6qO8vFmW6H5q9B0Yu6a2LxR4wcpgRG3qGxUf9EM-xxvZ7nIJa1C',
  streakDays: 12,
  dailyGoalXp: 50,
  currentXp: 35,
  completedLessonsCount: 18,
  todayMinutesSpent: 20,
};

export const initialVocabWords: VocabWord[] = [
  {
    id: 'v1',
    word: 'nachhaltig',
    translation: {
      uz: 'barqaror, ekologik',
      ru: 'устойчивый, экологичный',
      en: 'sustainable',
      de: 'nachhaltig, dauerhaft',
    },
    phonetic: '/ˈnaːxˌhaltɪç/',
    category: 'B2',
    exampleGerman: 'Wir müssen nachhaltige Lösungen für unsere Energieversorgung finden.',
    exampleTranslation: {
      uz: 'Energiya ta\'minotimiz uchun barqaror yechimlarni topishimiz kerak.',
      ru: 'Мы должны найти устойчивые решения для нашего энергоснабжения.',
      en: 'We must find sustainable solutions for our energy supply.',
      de: 'Wir müssen nachhaltige Lösungen für unsere Energieversorgung finden.',
    },
    isMastered: true,
  },
  {
    id: 'v2',
    word: 'die Herausforderung',
    article: 'die',
    translation: {
      uz: 'qiyinchilik, chaqiriq',
      ru: 'вызов, сложность',
      en: 'challenge',
      de: 'die Herausforderung',
    },
    phonetic: '/ˈhaɪ̯ʁaʊ̯sˌfɔʁdəʁʊŋ/',
    category: 'B2',
    exampleGerman: 'Neue Sprachen zu lernen ist eine große Herausforderung, aber sehr lohnend.',
    exampleTranslation: {
      uz: 'Yangi tillarni o\'rganish katta qiyinchilik, lekin juda foydali.',
      ru: 'Изучение новых языков — сложная задача, но очень полезная.',
      en: 'Learning new languages is a big challenge, but very rewarding.',
      de: 'Neue Sprachen zu lernen ist eine große Herausforderung, aber sehr lohnend.',
    },
    isMastered: false,
  },
  {
    id: 'v3',
    word: 'beschleunigen',
    translation: {
      uz: 'tezlashtirmoq',
      ru: 'ускорять, форсировать',
      en: 'to accelerate',
      de: 'beschleunigen',
    },
    phonetic: '/bəˈʃlɔɪ̯nɪɡn̩/',
    category: 'B2',
    exampleGerman: 'Wir müssen den Prozess beschleunigen, um die Frist einzuhalten.',
    exampleTranslation: {
      uz: 'Muxlatga ulgurish uchun jarayonni tezlashtirishimiz kerak.',
      ru: 'Нам нужно ускорить процесс, чтобы успеть в срок.',
      en: 'We need to accelerate the process to meet the deadline.',
      de: 'Wir müssen den Prozess beschleunigen, um die Frist einzuhalten.',
    },
    isMastered: false,
  },
  {
    id: 'v4',
    word: 'die Verhandlung',
    article: 'die',
    translation: {
      uz: 'muzokara',
      ru: 'переговоры',
      en: 'negotiation',
      de: 'die Verhandlung',
    },
    phonetic: '/fɛɐ̯ˈhandlʊŋ/',
    category: 'B2',
    exampleGerman: 'Die Verhandlungen dauerten bis tief in die Nacht.',
    exampleTranslation: {
      uz: 'Muzokaralar tunga qadar davom etdi.',
      ru: 'Переговоры продолжались до глубокой ночи.',
      en: 'The negotiations lasted deep into the night.',
      de: 'Die Verhandlungen dauerten bis tief in die Nacht.',
    },
    isMastered: false,
  },
  {
    id: 'v5',
    word: 'überzeugen',
    translation: {
      uz: 'ishontirmoq, ko\'ndirmoq',
      ru: 'убеждать',
      en: 'to convince',
      de: 'überzeugen',
    },
    phonetic: '/yːbɐˈtsɔɪ̯ɡn̩/',
    category: 'B1',
    exampleGerman: 'Seine Argumente konnten mich vollkommen überzeugen.',
    exampleTranslation: {
      uz: 'Uning dalillari meni to\'liq ishontira oldi.',
      ru: 'Его аргументы смогли меня полностью убедить.',
      en: 'His arguments managed to convince me completely.',
      de: 'Seine Argumente konnten mich vollkommen überzeugen.',
    },
    isMastered: true,
  },
  {
    id: 'v6',
    word: 'das Vorurteil',
    article: 'das',
    translation: {
      uz: 'asossiz fikr, xurofot',
      ru: 'предрассудок',
      en: 'prejudice',
      de: 'das Vorurteil',
    },
    phonetic: '/ˈfoːɐ̯ˌʔʊʁtaɪ̯l/',
    category: 'B2',
    exampleGerman: 'Wir sollten versuchen, Vorurteile durch Dialog abzubauen.',
    exampleTranslation: {
      uz: 'Muloqot orqali xurofotlarni bartaraf etishga harakat qilishimiz kerak.',
      ru: 'Мы должны стараться преодолевать предрассудки с помощью диалога.',
      en: 'We should try to dismantle prejudices through dialogue.',
      de: 'Wir sollten versuchen, Vorurteile durch Dialog abzubauen.',
    },
    isMastered: false,
  },
];

export const initialGrammarTopics: GrammarTopic[] = [
  {
    id: 'g1',
    title: {
      uz: 'Sifat qo\'shimchalari (Adjektivdeklination)',
      ru: 'Окончания прилагательных',
      en: 'Adjective Endings',
      de: 'Adjektivdeklination',
    },
    description: {
      uz: 'Aniq va noaniq artikllar bilan sifatlarning turlanishi (Schwache, Starke, Gemischte Deklination).',
      ru: 'Склонение прилагательных с определенными и неопределенными артиклями.',
      en: 'Declension of adjectives with definite and indefinite articles.',
      de: 'Deklination der Adjektive mit bestimmten und unbestimmten Artikeln.',
    },
    level: 'B1',
    progress: 90,
    keyRules: [
      'Nach bestimmtem Artikel (der/die/das): meist -e oder -en Ending.',
      'Nach unbestimmtem Artikel (ein/eine/ein): Ending zeigt Genus im Nominativ.',
      'Im Dativ und Genitiv tragen Adjektive fast immer die Endung -en.',
    ],
    examples: [
      {
        german: 'Der gute Mann hilft dem alten Kind.',
        translation: {
          uz: 'Yaxshi kishi keksa bolaga yordam beradi.',
          ru: 'Добрый человек помогает пожилому ребенку.',
          en: 'The good man helps the old child.',
          de: 'Der gute Mann hilft dem alten Kind.',
        },
      },
    ],
    exerciseCount: 15,
  },
  {
    id: 'g2',
    title: {
      uz: 'Majhul nisbat (Passiv)',
      ru: 'Пассивный залог (Passiv)',
      en: 'Passive Voice (Vorgangspassiv & Zustandspassiv)',
      de: 'Passiv (Vorgangs- und Zustandspassiv)',
    },
    description: {
      uz: 'Vorgangspassiv (werden + Partizip II) va Zustandspassiv (sein + Partizip II) ishlatilishi.',
      ru: 'Образование пассива действия (werden) и пассива состояния (sein).',
      en: 'Formation of action passive (werden) and state passive (sein).',
      de: 'Bildung von Vorgangspassiv mit werden und Zustandspassiv mit sein.',
    },
    level: 'B2',
    progress: 45,
    keyRules: [
      'Vorgangspassiv: werden + Partizip II (Das Haus wird gebaut).',
      'Passiv mit Modalverben: Modalverb + Partizip II + werden (Das Haus muss gebaut werden).',
      'Zustandspassiv: sein + Partizip II (Das Haus ist gebaut).',
    ],
    examples: [
      {
        german: 'Der Bericht wurde von der Expertin verfasst.',
        translation: {
          uz: 'Hisobot ekspert tomonidan yozildi.',
          ru: 'Отчет был составлен экспертом.',
          en: 'The report was written by the expert.',
          de: 'Der Bericht wurde von der Expertin verfasst.',
        },
      },
    ],
    exerciseCount: 12,
  },
  {
    id: 'g3',
    title: {
      uz: 'Shart mayli II (Konjunktiv II)',
      ru: 'Сослагательное наклонение II',
      en: 'Subjunctive II (Konjunktiv II)',
      de: 'Konjunktiv II (Wünsche & Hypothesen)',
    },
    description: {
      uz: 'Istak-xohish, shart va muloyim iltimoslarni ifodalash (würde + Infinitiv, hätte, wäre).',
      ru: 'Выражение желаний, гипотетических условий и вежливых просьб.',
      en: 'Expressing wishes, hypothetical scenarios and polite requests.',
      de: 'Ausdruck von Wünschen, Bedingungen und höflichen Bitten.',
    },
    level: 'B2',
    progress: 20,
    keyRules: [
      'Gegenwart: würde + Infinitiv (Ich würde gerne reisen).',
      'Ausnahmen: wäre, hätte, könnte, müsste, sollte stehen meist ohne würde.',
      'Vergangenheit: hätte/wäre + Partizip II (Ich wäre gerne gekommen).',
    ],
    examples: [
      {
        german: 'Wenn ich mehr Zeit hätte, würde ich öfter Deutsch lernen.',
        translation: {
          uz: 'Agar ko\'proq vaqtim bo\'lganda, nemis tilini tez-tez o\'rgangan bo\'lardim.',
          ru: 'Если бы у меня было больше времени, я бы чаще учил немецкий.',
          en: 'If I had more time, I would study German more often.',
          de: 'Wenn ich mehr Zeit hätte, würde ich öfter Deutsch lernen.',
        },
      },
    ],
    exerciseCount: 18,
  },
  {
    id: 'g4',
    title: {
      uz: 'Modal fe\'llar (Modalverben in B2)',
      ru: 'Модальные глаголы (B2)',
      en: 'Modal Verbs (können, müssen, sollen, dürfen, wollen, mögen)',
      de: 'Modalverben und subjektive Bedeutung',
    },
    description: {
      uz: 'Modal fe\'llarning murakkab va subyektiv ma\'nolari (können, müssen, sollen).',
      ru: 'Объективные и субъективные значения модальных глаголов.',
      en: 'Objective and subjective meanings of German modal verbs.',
      de: 'Subjektive Aussagen mit Modalverben (Vermutung, Weitergabe).',
    },
    level: 'B2',
    progress: 65,
    keyRules: [
      'können: Fähigkeit oder Möglichkeit (Er kann Deutsch sprechen).',
      'müssen: Zwang oder Notwendigkeit (Ich muss heute arbeiten).',
      'sollen: Auftrag oder Rat (Du sollst zum Arzt gehen).',
      'Modalverb auf Position 2, Infinitiv am Satzende.',
    ],
    examples: [
      {
        german: 'Er muss den Zug verpasst haben (Subjektive Vermutung).',
        translation: {
          uz: 'U poyezdni o\'tkazib yuborgan bo\'lsa kerak (Taxmin).',
          ru: 'Должно быть, он опоздал на поезд (Предположение).',
          en: 'He must have missed the train (Assumption).',
          de: 'Er muss den Zug verpasst haben.',
        },
      },
    ],
    exerciseCount: 20,
  },
];

export const initialLessons: Lesson[] = [
  {
    id: 'l1',
    number: 1,
    title: {
      uz: 'Sayohat va Transport',
      ru: 'Путешествия и Транспорт',
      en: 'Travel and Transportation',
      de: 'Reisen und Verkehr',
    },
    description: {
      uz: 'Aeroportda, vokzalda va mehmonxonada so\'zlashuv iboralari.',
      ru: 'Разговорные выражения в аэропорту, на вокзале и в отеле.',
      en: 'Conversational phrases at airports, train stations and hotels.',
      de: 'Gespräche am Flughafen, Bahnhof und im Hotel.',
    },
    level: 'B2.1',
    progressPercent: 100,
  },
  {
    id: 'l2',
    number: 2,
    title: {
      uz: 'Ish va Kasbiy Muloqot',
      ru: 'Работа и Делевое Общение',
      en: 'Work & Professional Communication',
      de: 'Beruf und Geschäftskommunikation',
    },
    description: {
      uz: 'Rasmiy xat yozish va majlisda qatnashish.',
      ru: 'Деловая переписка и участие в совещаниях.',
      en: 'Writing formal emails and participating in business meetings.',
      de: 'E-Mails schreiben und an Meetings teilnehmen.',
    },
    level: 'B2.1',
    progressPercent: 100,
  },
  {
    id: 'l3',
    number: 3,
    title: {
      uz: 'Atrof-muhit va Ekologiya',
      ru: 'Окружающая Среда и Экология',
      en: 'Environment and Sustainability',
      de: 'Umwelt und Nachhaltigkeit',
    },
    description: {
      uz: 'Iqlim o\'zgarishi va barqaror rivojlanish haqida bahslashish.',
      ru: 'Дискуссии об изменении климата и устойчивом развитии.',
      en: 'Debating climate change and sustainable solutions.',
      de: 'Diskussionen über Klimawandel und Nachhaltigkeit.',
    },
    level: 'B2.2',
    progressPercent: 100,
  },
  {
    id: 'l4',
    number: 4,
    title: {
      uz: 'Modal fe\'llar (Modalverben)',
      ru: 'Модальные глаголы',
      en: 'Modal Verbs',
      de: 'Modalverben',
    },
    description: {
      uz: "Murakkab gap tuzilmalarida 'können', 'müssen' va 'sollen' so'zlarini o'zlashtirish.",
      ru: "Освоение 'können', 'müssen' и 'sollen' в сложных предложениях.",
      en: "Mastering 'können', 'müssen' and 'sollen' in complex sentences.",
      de: "Sicherer Umgang mit 'können', 'müssen' und 'sollen'.",
    },
    level: 'B2.2',
    progressPercent: 65,
    isCurrent: true,
    modalVerbsFocus: ['können', 'müssen', 'sollen', 'dürfen', 'wollen', 'mögen'],
    quizQuestions: [
      {
        question: 'Er _____ heute leider nicht kommen, weil er krank ist.',
        options: ['kann', 'muss', 'soll', 'will'],
        correctIndex: 0,
        explanation: "'kann' imfodalaydi imkoniyat yoki qobiliyat yo'qligini (kassal bo'lgani uchun kelolmaydi).",
      },
      {
        question: 'Wir _____ die Hausaufgaben bis morgen fertig machen.',
        options: ['müssen', 'dürfen', 'mögen', 'könnten'],
        correctIndex: 0,
        explanation: "'müssen' majburiyat va zaruratni anglatadi (vazifani topshirish shart).",
      },
      {
        question: 'Der Arzt sagt, ich _____ mehr Wasser trinken.',
        options: ['soll', 'muss', 'darf', 'will'],
        correctIndex: 0,
        explanation: "'soll' boshqa shaxsning maslahati yoki topshirig'ini bildiradi.",
      },
    ],
  },
  {
    id: 'l5',
    number: 5,
    title: {
      uz: 'Birlashgan Gaplar va Bog\'lovchilar',
      ru: 'Сложные Предложения и Союзы',
      en: 'Complex Sentences & Conjunctions',
      de: 'Satzverbindungen und Konnektoren',
    },
    description: {
      uz: 'weil, obwohl, damit, dass bog\'lovchilari va fe\'l o\'rni.',
      ru: 'Союзы weil, obwohl, damit, dass и порядок слов.',
      en: 'Conjunctions weil, obwohl, damit, dass and word order.',
      de: 'Nebensätze mit weil, obwohl, damit, dass.',
    },
    level: 'B2.3',
    progressPercent: 0,
  },
  {
    id: 'l6',
    number: 6,
    title: {
      uz: 'Nemis Madaniyati: Ganza Ittifoqi',
      ru: 'Немецкая Культура: Ганзейский Союз',
      en: 'German Culture: Hanseatic League',
      de: 'Deutsche Kultur: Die Hanse',
    },
    description: {
      uz: 'Shimoliy Germaniya savdosining tarixiy ahamiyati va madaniy ta\'siri.',
      ru: 'Историческое значение торговли в Северной Германии и культура.',
      en: 'Historical importance of Northern German trade and culture.',
      de: 'Geschichte und Kultur der norddeutschen Handelsstädte.',
    },
    level: 'B2.3',
    progressPercent: 0,
  },
  {
    id: 'l7',
    number: 7,
    title: {
      uz: 'Modal fe\'llar (Modalverben) II',
      ru: 'Модальные глаголы II',
      en: 'Modal Verbs II',
      de: 'Modalverben II',
    },
    description: {
      uz: "Nemis tilidagi 'können', 'müssen' va 'sollen' fe'llari bilan ishlash.",
      ru: "Освоение 'können', 'müssen' и 'sollen' в немецком языке.",
      en: "Working with 'können', 'müssen' and 'sollen' verbs in German.",
      de: "Sicherer Umgang mit 'können', 'müssen' und 'sollen'.",
    },
    level: 'A1.1',
    progressPercent: 85,
    isCurrent: true,
    modalVerbsFocus: ['können', 'müssen', 'sollen'],
    quizQuestions: [
      {
        question: 'Ich _____ Deutsch sprechen.',
        options: ['kann', 'muss', 'soll', 'darf'],
        correctIndex: 0,
        explanation: 'Qobiliyatni ifodalash uchun können (kann) fe\'li ishlatiladi.'
      },
      {
        question: 'Wir _____ pünktlich kommen.',
        options: ['müssen', 'dürfen', 'mögen', 'wollen'],
        correctIndex: 0,
        explanation: 'Majburiyatni ifodalash uchun müssen (müssen) fe\'li ishlatiladi.'
      }
    ]
  },
  {
    id: 'l8',
    number: 8,
    title: {
      uz: 'Kundalik Hayot va Oila',
      ru: 'Ежедневная Жизнь и Семья',
      en: 'Daily Life & Family',
      de: 'Alltag und Familie',
    },
    description: {
      uz: 'Oilaviy munosabatlar, kun tartibi va sevimli mashg\'ulotlar haqida suhbat.',
      ru: 'Разговоры о семейных отношениях, распорядке дня и хобби.',
      en: 'Conversations about family relationships, daily routines, and hobbies.',
      de: 'Gespräche über Familie, Tagesablauf und Hobbys.',
    },
    level: 'A1.2',
    progressPercent: 0,
  }
];

export const initialActivities: ActivityItem[] = [
  {
    id: 'a1',
    type: 'test',
    title: {
      uz: 'Yakunlangan Test: Modal fe\'llar I',
      ru: 'Завершенный Тест: Модальные глаголы I',
      en: 'Completed Test: Modal Verbs I',
      de: 'Abschlusstest: Modalverben I',
    },
    timeAgo: {
      uz: '2 soat oldin • Natija: 92%',
      ru: '2 часа назад • Результат: 92%',
      en: '2 hours ago • Score: 92%',
      de: 'Vor 2 Stunden • Ergebnis: 92%',
    },
    xpEarned: 45,
    scorePercent: 92,
  },
  {
    id: 'a2',
    type: 'chat',
    title: {
      uz: 'AI Suhbat Mashg\'uloti',
      ru: 'Практика диалога с AI',
      en: 'AI Chat Practice Session',
      de: 'KI-Gesprächstraining',
    },
    timeAgo: {
      uz: 'Kecha • 15 daqiqa',
      ru: 'Вчера • 15 минут',
      en: 'Yesterday • 15 mins',
      de: 'Gestern • 15 Minuten',
    },
    xpEarned: 30,
    minutesSpent: 15,
  },
  {
    id: 'a3',
    type: 'vocab',
    title: {
      uz: 'Lug\'at ro\'yxati yangilandi',
      ru: 'Словарь обновлен',
      en: 'Vocabulary list updated',
      de: 'Vokabelliste aktualisiert',
    },
    timeAgo: {
      uz: '2 kun oldin • 12 ta yangi so\'z',
      ru: '2 дня назад • 12 новых слов',
      en: '2 days ago • 12 new words',
      de: 'Vor 2 Tagen • 12 neue Wörter',
    },
    xpEarned: 10,
  },
];

export const initialExamQuestions: ExamQuestion[] = [
  {
    id: 'eq1',
    question: 'Er fragte mich, ob ich ihm bei den Hausaufgaben _____ könnte.',
    options: ['helfen', 'geholfen', 'helfe', 'geholfen zu haben'],
    correctAnswerIndex: 0,
    explanation: {
      uz: "Modal fe'l (könnte) mavjud bo'lganda asosiy fe'l gap oxirida Infinitiv ko'rinishida keladi.",
      ru: 'При наличии модального глагола смысловой глагол стоит в конце в инфинитиве.',
      en: 'With a modal verb, the main verb appears at the end in the infinitive form.',
      de: 'Mit einem Modalverb steht das Vollverb am Satzende im Infinitiv.',
    },
    category: 'Grammatik B2',
  },
  {
    id: 'eq2',
    question: 'Obwohl es stark regnete, _____ wir den Spaziergang nicht ab.',
    options: ['sagten', 'sagen', 'abgesagt', 'hatten abgesagt'],
    correctAnswerIndex: 0,
    explanation: {
      uz: "Obwohl bog'lovchili ergash gapdan so'ng bosh gap fe'l (sagten) bilan boshlanadi.",
      ru: 'После придательного предложения с obwohl главное начинается с глагола.',
      en: 'After a subordinate clause with obwohl, the main clause starts with the verb.',
      de: 'Nach dem Nebensatz folgt im Hauptsatz sogleich das Verb.',
    },
    category: 'Satzstruktur B2',
  },
  {
    id: 'eq3',
    question: 'Welches Wort ist ein Synonym für "nachhaltig"?',
    options: ['dauerhaft', 'kurzfristig', 'schwach', 'selten'],
    correctAnswerIndex: 0,
    explanation: {
      uz: "'nachhaltig' va 'dauerhaft' barqaror va davomiylikni anglatadi.",
      ru: "'nachhaltig' и 'dauerhaft' означают устойчивый и долгосрочный.",
      en: "'nachhaltig' and 'dauerhaft' both mean sustainable/long-lasting.",
      de: "'nachhaltig' bedeutet lang anhaltend und dauerhaft.",
    },
    category: 'Wortschatz B2',
  },
  {
    id: 'eq4',
    question: 'Das Haus _____ vor fünf Jahren von einem berühmten Architekten gebaut.',
    options: ['wurde', 'ist', 'hat', 'wird'],
    correctAnswerIndex: 0,
    explanation: {
      uz: "O'tgan zamon Passiv (Präteritum Passiv): wurde + Partizip II (gebaut).",
      ru: 'Прошедшее время пассива (Präteritum Passiv): wurde + Partizip II.',
      en: 'Past passive (Präteritum Passiv): wurde + Partizip II.',
      de: 'Präteritum Passiv mit wurde + Partizip II.',
    },
    category: 'Passiv B2',
  },
];
