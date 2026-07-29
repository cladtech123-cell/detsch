import React, { useState } from 'react';
import { Award, CheckCircle2, AlertCircle, Clock, Sparkles } from 'lucide-react';
import { Language, ExamQuestion } from '../../types';
import { i18nTranslations } from '../../data/i18n';
import { initialExamQuestions } from '../../data/mockData';

interface ExamsViewProps {
  lang: Language;
  onAddXp: (amount: number) => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({ lang, onAddXp }) => {
  const t = (key: string) => i18nTranslations[lang][key] || key;
  const [questions] = useState<ExamQuestion[]>(initialExamQuestions);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isExamActive, setIsExamActive] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [examScore, setExamScore] = useState(0);

  const handleStart = () => {
    setIsExamActive(true);
    setIsSubmitted(false);
    setAnswers({});
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswerIndex) {
        correct += 1;
      }
    });

    const finalPercent = Math.round((correct / questions.length) * 100);
    setExamScore(finalPercent);
    setIsSubmitted(true);

    if (finalPercent >= 50) {
      onAddXp(60);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-[#1a1a1a]">{t('exams.title')}</h2>
        <p className="text-sm text-[#5c5c52] mt-1">{t('exams.subtitle')}</p>
      </div>

      {!isExamActive && !isSubmitted && (
        <div className="glass-card rounded-[28px] p-8 md:p-12 text-center space-y-6 max-w-2xl mx-auto border border-[#5A5A40]/30">
          <div className="w-20 h-20 rounded-full bg-[#e9edc9] text-[#5A5A40] border border-[#ccd5ae] flex items-center justify-center mx-auto shadow-md">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
              CEFR B2 Level Assessment
            </span>
            <h3 className="text-2xl font-serif font-bold text-[#1a1a1a]">
              DeutschMastery B2 Sertifikat Imtihoni
            </h3>
            <p className="text-xs md:text-sm text-[#5c5c52] max-w-lg mx-auto leading-relaxed">
              Grammatika, so'z tartibi, modal fe'llar va B2 lug'at boyligi bo'yicha imtihon topshiring. Barcha savollarga to'g'ri javob bering va +60 XP va sertifikat unvoniga ega bo'ling.
            </p>
          </div>

          <div className="flex justify-center items-center gap-6 text-xs text-[#5c5c52] pt-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#5A5A40]" />
              <span>Davomiyligi: 15 daqiqa</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4A373]" />
              <span>Mukofot: +60 XP</span>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="px-10 py-3.5 rounded-full bg-[#5A5A40] text-white font-bold text-sm hover:bg-[#4a4a34] transition-all shadow-md"
          >
            {t('exams.start_exam')}
          </button>
        </div>
      )}

      {isExamActive && !isSubmitted && (
        <div className="glass-card rounded-[28px] p-6 md:p-8 space-y-6 max-w-3xl mx-auto">
          <div className="flex justify-between items-center pb-4 border-b border-[#e8e8e0]">
            <span className="text-xs font-bold text-[#5A5A40]">
              B2 Test • {Object.keys(answers).length}/{questions.length} Bajarildi
            </span>
            <span className="text-xs font-mono text-[#8a531f] bg-[#faedcd] px-3 py-1 rounded-full border border-[#D4A373]/30">
              15:00
            </span>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-5 bg-[#f8f8f5] border border-[#e8e8e0] rounded-2xl space-y-4">
                <p className="font-bold text-sm text-[#1a1a1a]">
                  {idx + 1}. {q.question}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[idx] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => setAnswers((prev) => ({ ...prev, [idx]: optIdx }))}
                        className={`p-3.5 rounded-xl border text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-[#e9edc9] border-[#5A5A40] text-[#3a3a2a] font-bold'
                            : 'bg-white border-[#e8e8e0] text-[#2d2d2d] hover:bg-[#f8f8f5]'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < questions.length}
            className="w-full py-4 rounded-2xl bg-[#5A5A40] text-white font-bold text-sm hover:bg-[#4a4a34] transition-all disabled:opacity-50 shadow-sm"
          >
            {t('exams.submit')}
          </button>
        </div>
      )}

      {isSubmitted && (
        <div className="glass-card rounded-[28px] p-8 md:p-12 text-center space-y-6 max-w-2xl mx-auto border border-[#5A5A40]/30 animate-fade-in">
          <Award className="w-16 h-16 text-[#5A5A40] mx-auto animate-bounce" />

          <div className="space-y-2">
            <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
              Imtihon Yakunlandi
            </span>
            <h3 className="text-3xl font-serif font-bold text-[#1a1a1a]">
              Sizning Natijangiz: {examScore}%
            </h3>
            <p className="text-xs md:text-sm text-[#5c5c52]">
              {examScore >= 70
                ? "Tabriklaymiz! B2 darajadagi bilimingiz a'lo darajada va siz B2 Sertifikat unvonini qo'lga kiritdingiz (+60 XP)!"
                : "Yaxshi harakat! Xatolarni tahlil qilib, darslarni qayta takrorlang."}
            </p>
          </div>

          <div className="space-y-4 text-left pt-4">
            <h4 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
              Javoblar Tahlili:
            </h4>
            {questions.map((q, idx) => {
              const userAns = answers[idx];
              const isCorrect = userAns === q.correctAnswerIndex;
              return (
                <div key={idx} className="p-4 bg-[#f8f8f5] rounded-2xl border border-[#e8e8e0] space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-[#1a1a1a]">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{idx + 1}. {q.question}</span>
                  </div>
                  <p className="text-[#5c5c52] pl-6">{q.explanation[lang] || q.explanation.uz}</p>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => {
              setIsExamActive(false);
              setIsSubmitted(false);
            }}
            className="px-8 py-3 rounded-full bg-[#5A5A40] text-white font-semibold text-xs hover:bg-[#4a4a34] transition-all shadow-sm"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      )}
    </div>
  );
};
