import React, { useState } from 'react';
import { BookOpen, Volume2, CheckCircle2, Play, Award, Sparkles, HelpCircle } from 'lucide-react';
import { Language, Lesson } from '../../types';
import { i18nTranslations } from '../../data/i18n';
import { initialLessons } from '../../data/mockData';

interface LessonsViewProps {
  lang: Language;
  onAddXp: (amount: number) => void;
}

export const LessonsView: React.FC<LessonsViewProps> = ({ lang, onAddXp }) => {
  const t = (key: string) => i18nTranslations[lang][key] || key;
  const [lessons] = useState<Lesson[]>(initialLessons);
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(initialLessons[3]); // Lesson 4
  const [activeTabMode, setActiveTabMode] = useState<'study' | 'quiz'>('study');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const modalVerbsGuide = [
    {
      verb: 'können',
      meaning: 'qobiliyat, imkoniyat (can / to be able to)',
      examples: [
        'Ich kann sehr gut Deutsch sprechen.',
        'Kannst du mir bitte helfen?',
      ],
    },
    {
      verb: 'müssen',
      meaning: 'zarurat, majburiyat (must / to have to)',
      examples: [
        'Ich muss heute für die B2-Prüfung lernen.',
        'Wir müssen pünktlich am Bahnhof sein.',
      ],
    },
    {
      verb: 'sollen',
      meaning: 'boshqalarning maslahati yoki buyrug\'i (should / supposed to)',
      examples: [
        'Der Arzt sagt, ich soll täglich Wasser trinken.',
        'Was soll ich jetzt machen?',
      ],
    },
    {
      verb: 'dürfen',
      meaning: 'ruxsat berilganlik (may / allowed to)',
      examples: [
        'Hier darf man nicht parken.',
        'Darf ich eine Frage stellen?',
      ],
    },
  ];

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleFinishQuiz = () => {
    if (!selectedLesson.quizQuestions) return;
    let correctCount = 0;
    selectedLesson.quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / selectedLesson.quizQuestions.length) * 100);
    setScore(calculatedScore);
    setQuizSubmitted(true);
    if (calculatedScore >= 60) {
      onAddXp(45);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-[#1a1a1a]">{t('lessons.page_title')}</h2>
        <p className="text-sm text-[#5c5c52] mt-1">{t('lessons.page_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Lesson Selector List */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-bold text-[#5A5A40] uppercase tracking-wider">
            Modullar Ro'yxati
          </h3>
          <div className="space-y-3">
            {lessons.map((lesson) => {
              const isSelected = selectedLesson.id === lesson.id;
              return (
                <div
                  key={lesson.id}
                  onClick={() => {
                    setSelectedLesson(lesson);
                    setQuizSubmitted(false);
                    setQuizAnswers({});
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#e9edc9] border-[#5A5A40] shadow-md shadow-[#5A5A40]/10'
                      : 'bg-white border-[#e8e8e0] hover:bg-[#f8f8f5]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white text-[#5A5A40] border border-[#e8e8e0]">
                      Dars {lesson.number}
                    </span>
                    <span className="text-xs font-medium text-[#71716b]">
                      {lesson.progressPercent}%
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-[#1a1a1a] mb-1">
                    {lesson.title[lang] || lesson.title.uz}
                  </h4>
                  <p className="text-xs text-[#5c5c52] line-clamp-2">
                    {lesson.description[lang] || lesson.description.uz}
                  </p>

                  <div className="w-full h-1.5 bg-[#e8e8e0] rounded-full overflow-hidden mt-3">
                    <div
                      className="h-full bg-[#5A5A40] rounded-full"
                      style={{ width: `${lesson.progressPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Lesson Workspace */}
        <div className="lg:col-span-8 glass-card rounded-[28px] p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-[#e8e8e0]">
            <div>
              <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                Dars {selectedLesson.number} • Level {selectedLesson.level}
              </span>
              <h3 className="text-2xl font-serif font-bold text-[#1a1a1a] mt-1">
                {selectedLesson.title[lang] || selectedLesson.title.uz}
              </h3>
            </div>

            {/* Switch Mode Tabs */}
            <div className="flex bg-[#f8f8f5] p-1 rounded-full border border-[#e8e8e0] shrink-0">
              <button
                onClick={() => setActiveTabMode('study')}
                className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeTabMode === 'study'
                    ? 'bg-[#5A5A40] text-white shadow'
                    : 'text-[#5c5c52] hover:text-[#1a1a1a]'
                }`}
              >
                Nazariya & Misollar
              </button>
              <button
                onClick={() => setActiveTabMode('quiz')}
                className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeTabMode === 'quiz'
                    ? 'bg-[#5A5A40] text-white shadow'
                    : 'text-[#5c5c52] hover:text-[#1a1a1a]'
                }`}
              >
                Mashq va Quiz
              </button>
            </div>
          </div>

          {/* Study Mode */}
          {activeTabMode === 'study' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-[#e9edc9]/60 border border-[#ccd5ae] p-5 rounded-2xl">
                <p className="text-sm text-[#2d2d2d] leading-relaxed">
                  Modal fe'llar gapda boshqa fe'llarning ma'nosini to'ldiradi. Nemis tilida modal fe'l <b>2-o'rinda</b> (asosiy gapda) turlanadi, ikkinchi fe'l esa gap oxirida <b>Infinitiv (asli)</b> holatda keladi.
                </p>
              </div>

              <h4 className="text-base font-serif font-bold text-[#1a1a1a] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#5A5A40]" />
                <span>Modal fe'llar tahlili</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modalVerbsGuide.map((item, idx) => (
                  <div key={idx} className="bg-[#f8f8f5] border border-[#e8e8e0] p-5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-serif font-bold text-[#5A5A40]">{item.verb}</span>
                      <button
                        onClick={() => speak(item.verb)}
                        className="p-1.5 rounded-lg bg-white border border-[#e8e8e0] text-[#71716b] hover:text-[#5A5A40]"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-[#5c5c52] italic">{item.meaning}</p>
                    <div className="space-y-1.5 pt-2 border-t border-[#e8e8e0]">
                      {item.examples.map((ex, exIdx) => (
                        <div key={exIdx} className="flex items-center justify-between text-xs text-[#2d2d2d]">
                          <span>• {ex}</span>
                          <button
                            onClick={() => speak(ex)}
                            className="p-1 text-[#71716b] hover:text-[#5A5A40]"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quiz Mode */}
          {activeTabMode === 'quiz' && (
            <div className="space-y-6 animate-fade-in">
              {selectedLesson.quizQuestions && selectedLesson.quizQuestions.length > 0 ? (
                <>
                  <div className="space-y-6">
                    {selectedLesson.quizQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="bg-[#f8f8f5] p-5 rounded-2xl border border-[#e8e8e0] space-y-4">
                        <p className="font-bold text-sm text-[#1a1a1a]">
                          {qIdx + 1}. {q.question}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = quizAnswers[qIdx] === optIdx;
                            const isCorrect = q.correctIndex === optIdx;

                            let btnStyle = 'bg-white border-[#e8e8e0] text-[#2d2d2d] hover:bg-[#e9edc9]/30';
                            if (quizSubmitted) {
                              if (isCorrect) {
                                btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-800 font-bold';
                              } else if (isSelected && !isCorrect) {
                                btnStyle = 'bg-rose-100 border-rose-400 text-rose-800';
                              }
                            } else if (isSelected) {
                              btnStyle = 'bg-[#e9edc9] border-[#5A5A40] text-[#3a3a2a] font-bold';
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectOption(qIdx, optIdx)}
                                className={`p-3.5 rounded-xl border text-left text-xs transition-all ${btnStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div className="p-3 bg-white border border-[#e8e8e0] rounded-xl text-xs text-[#5c5c52] flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-[#5A5A40] shrink-0 mt-0.5" />
                            <span>{q.explanation}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {!quizSubmitted ? (
                    <button
                      onClick={handleFinishQuiz}
                      disabled={Object.keys(quizAnswers).length < selectedLesson.quizQuestions.length}
                      className="w-full py-3.5 rounded-xl bg-[#5A5A40] text-white font-bold text-sm hover:bg-[#4a4a34] transition-all disabled:opacity-50"
                    >
                      Javoblarni Tekshirish
                    </button>
                  ) : (
                    <div className="p-6 bg-[#faedcd] rounded-2xl border border-[#D4A373]/30 text-center space-y-3">
                      <Award className="w-10 h-10 text-[#D4A373] mx-auto" />
                      <h4 className="text-xl font-serif font-bold text-[#1a1a1a]">
                        Natija: {score}%
                      </h4>
                      <p className="text-xs text-[#5c5c52]">
                        {score >= 60
                          ? "Ajoyib! Siz +45 XP ishladingiz va modal fe'llar mavzusini muvaffaqiyatli topshirdingiz."
                          : "Yaxshi urinish! Qoidalarni qayta ko'rib chiqib, testni yana topshirib ko'ring."}
                      </p>
                      <button
                        onClick={() => {
                          setQuizSubmitted(false);
                          setQuizAnswers({});
                        }}
                        className="px-6 py-2.5 rounded-full bg-[#5A5A40] text-white text-xs font-semibold hover:bg-[#4a4a34]"
                      >
                        Qayta topshirish
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-10 text-center text-[#71716b]">
                  <HelpCircle className="w-10 h-10 mx-auto mb-3 text-[#5A5A40]" />
                  <p>Ushbu modul uchun test tayyorlanmoqda.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
