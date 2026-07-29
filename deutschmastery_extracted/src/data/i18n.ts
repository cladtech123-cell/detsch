import { Language } from '../types';

export const i18nTranslations: Record<Language, Record<string, string>> = {
  uz: {
    'sidebar.title': 'DeutschMastery',
    'sidebar.subtitle': 'Til Mahorati',
    'sidebar.dashboard': 'Boshqaruv paneli',
    'sidebar.lessons': 'Darslar',
    'sidebar.vocab': "Lug'at",
    'sidebar.grammar': 'Grammatika',
    'sidebar.ai_tutor': "AI O'qituvchi",
    'sidebar.ocr': 'OCR',
    'sidebar.exams': 'Imtihonlar',
    'sidebar.settings': 'Sozlamalar',

    'header.welcome': 'Qaytganingiz bilan, Julian',
    'header.subtitle': "B2 O'rta nemis tilida ajoyib yutuqlarga erishyapsiz.",
    'header.streak': '12 Kunlik Davomiylik',

    'hero.badge': 'Joriy Kurs',
    'hero.title': "Dars 4: Modal fe'llar",
    'hero.desc': "Murakkab gap tuzilmalarida 'können', 'müssen' va 'sollen' so'zlarini o'zlashtirish. Ushbu modulni 65% yakunladingiz.",
    'hero.btn_resume': "O'qishni davom ettirish",
    'hero.btn_curriculum': "O'quv rejasini ko'rish",
    'hero.progress_label': 'Kunlik Maqsad Jarayoni',

    'streak.title': 'Davomiylik Holati',
    'streak.goal': 'Maqsad: 50 XP',
    'streak.motivation': 'Shunday davom eting! Bugun atigi 15 daqiqa qoldi.',

    'days.mon': 'D',
    'days.tue': 'S',
    'days.wed': 'Ch',
    'days.thu': 'P',
    'days.fri': 'J',
    'days.sat': 'Sh',
    'days.sun': 'Yak',

    'days.short.mon': 'Dush',
    'days.short.tue': 'Sesh',
    'days.short.wed': 'Chor',
    'days.short.thu': 'Pay',
    'days.short.fri': 'Jum',
    'days.short.sat': 'Shan',
    'days.short.sun': 'Yak',

    'stats.title': 'Haftalik Taraqqiyot',

    'vocab.title': "Bugungi Lug'at",
    'vocab.see_all': "Barchasini ko'rish",
    'vocab.word1': 'barqaror',
    'vocab.word2': 'qiyinchilik',
    'vocab.word3': 'tezlashtirmoq',

    'grammar.title': 'Grammatika Jarayoni',
    'grammar.item1': "Sifat qo'shimchalari",
    'grammar.item2': 'Majhul nisbat',
    'grammar.item3': 'Shart mayli II',

    'activity.title': "So'nggi Faollik",
    'activity.item1.title': "Yakunlangan Test: Modal fe'llar I",
    'activity.item1.time': '2 soat oldin • Natija: 92%',
    'activity.item2.title': "AI Suhbat Mashg'uloti",
    'activity.item2.time': 'Kecha • 15 daqiqa',
    'activity.item3.title': "Lug'at ro'yxati yangilandi",
    'activity.item3.time': "2 kun oldin • 12 ta yangi so'z",

    'upcoming.badge': 'Kelgusi Dars',
    'upcoming.title': 'Nemis Madaniyati: Ganza Ittifoqi',
    'upcoming.desc': "Shimoliy Germaniya savdosining tarixiy ahamiyatini va uning zamonaviy shevaga qanday ta'sir qilganini kashf eting.",
    'upcoming.btn_schedule': "Mashg'ulotni Rejalashtirish",

    'footer.rights': 'Barcha huquqlar himoyalangan.',
    'footer.privacy': 'Maxfiylik Siyosati',
    'footer.terms': 'Xizmat Shartlari',
    'footer.imprint': "Nashr Ma'lumotlari",
    'footer.help': 'Yordam Markazi',

    'fab.ai_chat': 'AI Suhbatni Boshlash',

    // Lessons page
    'lessons.page_title': 'Nemis tili darslari',
    'lessons.page_subtitle': 'B2 darajasidagi interaktiv modullar va dars materiallari',
    'lessons.start_quiz': 'Kichik testni topshirish',
    'lessons.quiz_completed': 'Test muvaffaqiyatli topshirildi!',

    // Vocab page
    'vocab.page_title': 'Lug\'at Boyligi',
    'vocab.page_subtitle': 'Flip-karta va talaffuz audiosi bilan nemischa so\'zlarni yodlang',
    'vocab.search_placeholder': 'So\'zni qidirish (nemischa yoki o\'zbekcha)...',
    'vocab.add_word': 'Yangi so\'z qo\'shish',
    'vocab.flip_card': 'Kartani aylantirish',
    'vocab.listen': 'Talaffuzni tinglash',

    // Grammar page
    'grammar.page_title': 'Nemis Grammatikasi Reference',
    'grammar.page_subtitle': 'Qoidalar, misollar va interaktiv mashqlar',
    'grammar.check_btn': 'Gapni tekshirish',
    'grammar.placeholder': 'Nemischa gap kiriting (masalan: Ich kann deutsch sprechen)...',

    // AI Tutor page
    'ai_tutor.title': 'DeutschMastery AI O\'qituvchi',
    'ai_tutor.subtitle': 'Sun\'iy intellect bilan nemis tilida jonli muloqot qiling',
    'ai_tutor.placeholder': 'Nemischa xabar yoki savol yozing...',
    'ai_tutor.send': 'Yuborish',
    'ai_tutor.suggested': 'Tavsiya etilgan mavzular:',

    // OCR page
    'ocr.title': 'Hujjat va Rasm Skaneri (OCR)',
    'ocr.subtitle': 'Nemischa matnli rasmni yuklang yoki matnni joylashtiring va lahzalik tahlil oling',
    'ocr.drag_drop': 'Rasmni shu yerga tashlang yoki tanlang',
    'ocr.paste_text': 'Yoki nemischa matnni bu yerga kiriting:',
    'ocr.analyze_btn': 'Matnni Tahlil Qilish',

    // Exams page
    'exams.title': 'Nemis Tili Imtihonlari va Testlar',
    'exams.subtitle': 'B2 CEFR darajangizni va bilimlaringizni sinab ko\'ring',
    'exams.start_exam': 'Imtihonni Boshlash',
    'exams.submit': 'Javoblarni Yuborish',

    // Settings page
    'settings.title': 'Platforma Sozlamalari',
    'settings.subtitle': 'Shaxsiy rejangiz va dastur ko\'rinishini moslashtiring',
    'settings.daily_xp': 'Kunlik XP Maqsadi',
    'settings.language': 'Interfeys Tili',
    'settings.save': 'Saqlash',
  },
  ru: {
    'sidebar.title': 'DeutschMastery',
    'sidebar.subtitle': 'Языковое Мастерство',
    'sidebar.dashboard': 'Панель управления',
    'sidebar.lessons': 'Уроки',
    'sidebar.vocab': 'Словарь',
    'sidebar.grammar': 'Грамматика',
    'sidebar.ai_tutor': 'AI Репетитор',
    'sidebar.ocr': 'OCR Сканер',
    'sidebar.exams': 'Экзамены',
    'sidebar.settings': 'Настройки',

    'header.welcome': 'С возвращением, Джулиан',
    'header.subtitle': 'Вы делаете отличные успехи в немецком языке уровня B2.',
    'header.streak': '12 Дней Подряд',

    'hero.badge': 'Текущий Курс',
    'hero.title': 'Урок 4: Модальные глаголы',
    'hero.desc': "Освоение 'können', 'müssen' и 'sollen' в сложных предложениях. Вы завершили 65% этого модуля.",
    'hero.btn_resume': 'Продолжить обучение',
    'hero.btn_curriculum': 'Просмотреть программу',
    'hero.progress_label': 'Прогресс Дневной Цели',

    'streak.title': 'Статус Серии',
    'streak.goal': 'Цель: 50 XP',
    'streak.motivation': 'Так держать! Сегодня осталось всего 15 минут.',

    'days.mon': 'П',
    'days.tue': 'В',
    'days.wed': 'С',
    'days.thu': 'Ч',
    'days.fri': 'П',
    'days.sat': 'С',
    'days.sun': 'В',

    'days.short.mon': 'Пн',
    'days.short.tue': 'Вт',
    'days.short.wed': 'Ср',
    'days.short.thu': 'Чт',
    'days.short.fri': 'Пт',
    'days.short.sat': 'Сб',
    'days.short.sun': 'Вс',

    'stats.title': 'Недельный Прогресс',

    'vocab.title': 'Словарь На Сегодня',
    'vocab.see_all': 'Смотреть все',
    'vocab.word1': 'устойчивый / экологичный',
    'vocab.word2': 'вызов / трудность',
    'vocab.word3': 'ускорять',

    'grammar.title': 'Грамматический Прогресс',
    'grammar.item1': 'Окончания прилагательных',
    'grammar.item2': 'Пассивный залог',
    'grammar.item3': 'Сослагательное наклонение II',

    'activity.title': 'Последняя Активность',
    'activity.item1.title': 'Завершенный Тест: Модальные глаголы I',
    'activity.item1.time': '2 часа назад • Результат: 92%',
    'activity.item2.title': 'Практика диалога с AI',
    'activity.item2.time': 'Вчера • 15 минут',
    'activity.item3.title': 'Словарь обновлен',
    'activity.item3.time': '2 дня назад • 12 новых слов',

    'upcoming.badge': 'Предстоящий Урок',
    'upcoming.title': 'Немецкая Культура: Ганзейский Союз',
    'upcoming.desc': 'Узнайте об историческом значении торговли в Северной Германии и ее влиянии на современный диалект.',
    'upcoming.btn_schedule': 'Запланировать Занятие',

    'footer.rights': 'Все права защищены.',
    'footer.privacy': 'Политика Конфиденциальности',
    'footer.terms': 'Условия Обслуживания',
    'footer.imprint': 'Выходные Данные',
    'footer.help': 'Центр Помощи',

    'fab.ai_chat': 'Начать AI Диалог',

    // Lessons page
    'lessons.page_title': 'Уроки Немецкого Языка',
    'lessons.page_subtitle': 'Интерактивные модули и учебные материалы уровня B2',
    'lessons.start_quiz': 'Пройти короткий тест',
    'lessons.quiz_completed': 'Тест успешно пройден!',

    // Vocab page
    'vocab.page_title': 'Словарный Запас',
    'vocab.page_subtitle': 'Изучайте немецкие слова с помощью флеш-карточек и озвучки',
    'vocab.search_placeholder': 'Поиск слова (на немецком или русском)...',
    'vocab.add_word': 'Добавить новое слово',
    'vocab.flip_card': 'Перевернуть карточку',
    'vocab.listen': 'Прослушать произношение',

    // Grammar page
    'grammar.page_title': 'Справочник Немецкой Грамматики',
    'grammar.page_subtitle': 'Правила, примеры и интерактивные упражнения',
    'grammar.check_btn': 'Проверить предложение',
    'grammar.placeholder': 'Введите предложение на немецком (например: Ich kann deutsch sprechen)...',

    // AI Tutor page
    'ai_tutor.title': 'DeutschMastery AI Репетитор',
    'ai_tutor.subtitle': 'Общайтесь на немецком языке с искусственным интеллектом в реальном времени',
    'ai_tutor.placeholder': 'Напишите сообщение или вопрос на немецком...',
    'ai_tutor.send': 'Отправить',
    'ai_tutor.suggested': 'Рекомендуемые темы:',

    // OCR page
    'ocr.title': 'Сканер Документов и Изображений (OCR)',
    'ocr.subtitle': 'Загрузите изображение с немецким текстом или вставьте текст для мгновенного анализа',
    'ocr.drag_drop': 'Перетащите сюда изображение или выберите файл',
    'ocr.paste_text': 'Или вставьте немецкий текст сюда:',
    'ocr.analyze_btn': 'Анализировать Текст',

    // Exams page
    'exams.title': 'Экзамены и Тесты по Немецкому Языку',
    'exams.subtitle': 'Проверьте свой уровень B2 CEFR и знания',
    'exams.start_exam': 'Начать Экзамен',
    'exams.submit': 'Отправить Ответы',

    // Settings page
    'settings.title': 'Настройки Платформы',
    'settings.subtitle': 'Настройте личный план и внешний вид приложения',
    'settings.daily_xp': 'Дневная Цель XP',
    'settings.language': 'Язык Интерфейса',
    'settings.save': 'Сохранить',
  },
  en: {
    'sidebar.title': 'DeutschMastery',
    'sidebar.subtitle': 'Language Mastery',
    'sidebar.dashboard': 'Dashboard',
    'sidebar.lessons': 'Lessons',
    'sidebar.vocab': 'Vocabulary',
    'sidebar.grammar': 'Grammar',
    'sidebar.ai_tutor': 'AI Tutor',
    'sidebar.ocr': 'OCR Scanner',
    'sidebar.exams': 'Exams',
    'sidebar.settings': 'Settings',

    'header.welcome': 'Welcome back, Julian',
    'header.subtitle': 'You are making remarkable progress in B2 Intermediate German.',
    'header.streak': '12 Day Streak',

    'hero.badge': 'Current Course',
    'hero.title': 'Lesson 4: Modal Verbs',
    'hero.desc': "Mastering 'können', 'müssen' and 'sollen' in complex sentence structures. You have completed 65% of this module.",
    'hero.btn_resume': 'Resume Learning',
    'hero.btn_curriculum': 'View Curriculum',
    'hero.progress_label': 'Daily Goal Progress',

    'streak.title': 'Streak Status',
    'streak.goal': 'Goal: 50 XP',
    'streak.motivation': 'Keep it up! Only 15 minutes left today.',

    'days.mon': 'M',
    'days.tue': 'T',
    'days.wed': 'W',
    'days.thu': 'T',
    'days.fri': 'F',
    'days.sat': 'S',
    'days.sun': 'S',

    'days.short.mon': 'Mon',
    'days.short.tue': 'Tue',
    'days.short.wed': 'Wed',
    'days.short.thu': 'Thu',
    'days.short.fri': 'Fri',
    'days.short.sat': 'Sat',
    'days.short.sun': 'Sun',

    'stats.title': 'Weekly Progress',

    'vocab.title': "Today's Vocabulary",
    'vocab.see_all': 'See all',
    'vocab.word1': 'sustainable',
    'vocab.word2': 'challenge',
    'vocab.word3': 'to accelerate',

    'grammar.title': 'Grammar Progress',
    'grammar.item1': 'Adjective Endings',
    'grammar.item2': 'Passive Voice',
    'grammar.item3': 'Subjunctive II',

    'activity.title': 'Recent Activity',
    'activity.item1.title': 'Completed Test: Modal Verbs I',
    'activity.item1.time': '2 hours ago • Score: 92%',
    'activity.item2.title': 'AI Chat Session',
    'activity.item2.time': 'Yesterday • 15 mins',
    'activity.item3.title': 'Vocabulary list updated',
    'activity.item3.time': '2 days ago • 12 new words',

    'upcoming.badge': 'Upcoming Lesson',
    'upcoming.title': 'German Culture: Hanseatic League',
    'upcoming.desc': 'Discover the historical importance of Northern German trade and how it shaped the modern dialect.',
    'upcoming.btn_schedule': 'Schedule Session',

    'footer.rights': 'All rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.imprint': 'Imprint',
    'footer.help': 'Help Center',

    'fab.ai_chat': 'Start AI Conversation',

    // Lessons page
    'lessons.page_title': 'German Language Lessons',
    'lessons.page_subtitle': 'Interactive modules & curriculum materials at B2 level',
    'lessons.start_quiz': 'Take Quick Quiz',
    'lessons.quiz_completed': 'Quiz completed successfully!',

    // Vocab page
    'vocab.page_title': 'Vocabulary Trainer',
    'vocab.page_subtitle': 'Memorize German words with interactive flashcards and native audio',
    'vocab.search_placeholder': 'Search word (German or English)...',
    'vocab.add_word': 'Add New Word',
    'vocab.flip_card': 'Flip Card',
    'vocab.listen': 'Listen Pronunciation',

    // Grammar page
    'grammar.page_title': 'German Grammar Reference',
    'grammar.page_subtitle': 'Rules, examples and interactive sentence exercises',
    'grammar.check_btn': 'Check Sentence',
    'grammar.placeholder': 'Enter German sentence (e.g. Ich kann deutsch sprechen)...',

    // AI Tutor page
    'ai_tutor.title': 'DeutschMastery AI Tutor',
    'ai_tutor.subtitle': 'Practice live German conversation with artificial intelligence',
    'ai_tutor.placeholder': 'Type a German message or question...',
    'ai_tutor.send': 'Send',
    'ai_tutor.suggested': 'Suggested Topics:',

    // OCR page
    'ocr.title': 'Document & Image Scanner (OCR)',
    'ocr.subtitle': 'Upload an image containing German text or paste text for instant breakdown',
    'ocr.drag_drop': 'Drag and drop image here or browse file',
    'ocr.paste_text': 'Or paste German text here:',
    'ocr.analyze_btn': 'Analyze Text',

    // Exams page
    'exams.title': 'German Proficiency Exams',
    'exams.subtitle': 'Test your B2 CEFR knowledge and earn certification badges',
    'exams.start_exam': 'Start Exam',
    'exams.submit': 'Submit Answers',

    // Settings page
    'settings.title': 'Platform Settings',
    'settings.subtitle': 'Customize your study plan and app options',
    'settings.daily_xp': 'Daily XP Target',
    'settings.language': 'Interface Language',
    'settings.save': 'Save Changes',
  },
  de: {
    'sidebar.title': 'DeutschMastery',
    'sidebar.subtitle': 'Sprachbeherrschung',
    'sidebar.dashboard': 'Dashboard',
    'sidebar.lessons': 'Lektionen',
    'sidebar.vocab': 'Wortschatz',
    'sidebar.grammar': 'Grammatik',
    'sidebar.ai_tutor': 'KI-Tutor',
    'sidebar.ocr': 'OCR-Scanner',
    'sidebar.exams': 'Prüfungen',
    'sidebar.settings': 'Einstellungen',

    'header.welcome': 'Willkommen zurück, Julian',
    'header.subtitle': 'Sie machen hervorragende Fortschritte im B2-Deutschkurs.',
    'header.streak': '12 Tage Serien-Streak',

    'hero.badge': 'Aktueller Kurs',
    'hero.title': 'Lektion 4: Modalverben',
    'hero.desc': "Beherrschung von 'können', 'müssen' und 'sollen' in komplexen Satzstrukturen. Sie haben 65% dieses Moduls abgeschlossen.",
    'hero.btn_resume': 'Lernen fortsetzen',
    'hero.btn_curriculum': 'Lehrplan anzeigen',
    'hero.progress_label': 'Tagesziel-Fortschritt',

    'streak.title': 'Streak-Status',
    'streak.goal': 'Ziel: 50 XP',
    'streak.motivation': 'Weiter so! Heute fehlen nur noch 15 Minuten.',

    'days.mon': 'M',
    'days.tue': 'D',
    'days.wed': 'M',
    'days.thu': 'D',
    'days.fri': 'F',
    'days.sat': 'S',
    'days.sun': 'S',

    'days.short.mon': 'Mo',
    'days.short.tue': 'Di',
    'days.short.wed': 'Mi',
    'days.short.thu': 'Do',
    'days.short.fri': 'Fr',
    'days.short.sat': 'Sa',
    'days.short.sun': 'So',

    'stats.title': 'Wöchentlicher Fortschritt',

    'vocab.title': 'Vokabeln für heute',
    'vocab.see_all': 'Alle anzeigen',
    'vocab.word1': 'nachhaltig',
    'vocab.word2': 'die Herausforderung',
    'vocab.word3': 'beschleunigen',

    'grammar.title': 'Grammatik-Fortschritt',
    'grammar.item1': 'Adjektivdeklination',
    'grammar.item2': 'Passiv',
    'grammar.item3': 'Konjunktiv II',

    'activity.title': 'Letzte Aktivität',
    'activity.item1.title': 'Abgeschlossener Test: Modalverben I',
    'activity.item1.time': 'Vor 2 Stunden • Ergebnis: 92%',
    'activity.item2.title': 'KI-Gesprächssitzung',
    'activity.item2.time': 'Gestern • 15 Minuten',
    'activity.item3.title': 'Vokabelliste aktualisiert',
    'activity.item3.time': 'Vor 2 Tagen • 12 neue Wörter',

    'upcoming.badge': 'Nächste Lektion',
    'upcoming.title': 'Deutsche Kultur: Die Hanse',
    'upcoming.desc': 'Entdecken Sie die historische Bedeutung des norddeutschen Handels und seine Auswirkungen auf den modernen Dialekt.',
    'upcoming.btn_schedule': 'Sitzung planen',

    'footer.rights': 'Alle Rechte vorbehalten.',
    'footer.privacy': 'Datenschutz',
    'footer.terms': 'AGB',
    'footer.imprint': 'Impressum',
    'footer.help': 'Hilfe-Center',

    'fab.ai_chat': 'KI-Gespräch starten',

    // Lessons page
    'lessons.page_title': 'Deutschlektionen',
    'lessons.page_subtitle': 'Interaktive Module & Lehrplanmaterialien auf B2-Niveau',
    'lessons.start_quiz': 'Kurztest starten',
    'lessons.quiz_completed': 'Test erfolgreich absolviert!',

    // Vocab page
    'vocab.page_title': 'Wortschatz-Trainer',
    'vocab.page_subtitle': 'Lernen Sie deutsche Wörter mit Karteikarten und Aussprache',
    'vocab.search_placeholder': 'Wort suchen (Deutsch oder Muttersprache)...',
    'vocab.add_word': 'Neues Wort hinzufügen',
    'vocab.flip_card': 'Karte umdrehen',
    'vocab.listen': 'Aussprache anhören',

    // Grammar page
    'grammar.page_title': 'Deutsche Grammatik-Referenz',
    'grammar.page_subtitle': 'Regeln, Beispiele und interaktive Satzübungen',
    'grammar.check_btn': 'Satz überprüfen',
    'grammar.placeholder': 'Geben Sie einen deutschen Satz ein...',

    // AI Tutor page
    'ai_tutor.title': 'DeutschMastery KI-Tutor',
    'ai_tutor.subtitle': 'Üben Sie deutsche Gespräche mit künstlicher Intelligenz',
    'ai_tutor.placeholder': 'Schreiben Sie eine Nachricht auf Deutsch...',
    'ai_tutor.send': 'Senden',
    'ai_tutor.suggested': 'Empfohlene Themen:',

    // OCR page
    'ocr.title': 'Dokumenten- & Bildscanner (OCR)',
    'ocr.subtitle': 'Laden Sie ein Bild mit deutschem Text hoch oder fügen Sie Text ein',
    'ocr.drag_drop': 'Bild hierher ziehen oder Datei auswählen',
    'ocr.paste_text': 'Oder deutschen Text hier einfügen:',
    'ocr.analyze_btn': 'Text analysieren',

    // Exams page
    'exams.title': 'Deutschprüfungen',
    'exams.subtitle': 'Testen Sie Ihr B2-Niveau und erwerben Sie Zertifikate',
    'exams.start_exam': 'Prüfung starten',
    'exams.submit': 'Antworten absenden',

    // Settings page
    'settings.title': 'Plattform-Einstellungen',
    'settings.subtitle': 'Passen Sie Ihren Lernplan und Optionen an',
    'settings.daily_xp': 'Tägliches XP-Ziel',
    'settings.language': 'Schnittstellensprache',
    'settings.save': 'Speichern',
  },
};
