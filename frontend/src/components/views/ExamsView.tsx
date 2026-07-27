import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Award, CheckCircle2, AlertTriangle, Clock, Sparkles, RefreshCw, Layers, Check, X, Play, BookOpen, Trophy } from 'lucide-react';
import { Language } from '../../types';
import { i18nTranslations } from '../../data/i18n';
import { apiService } from '../../lib/services';

interface ExamsViewProps {
  lang: Language;
  onAddXp: (amount: number) => void;
}

interface Question {
  id: string;
  question: string;
  hint: string;
  answer: string;
  options?: string[];
}

export const ExamsView: React.FC<ExamsViewProps> = ({ lang, onAddXp }) => {
  const t = (key: string) => i18nTranslations[lang][key] || key;
  const queryClient = useQueryClient();
  const [examType, setExamType] = useState<'lesson' | 'mistakes' | 'cefr'>('lesson');
  const [examData, setExamData] = useState<any>(null);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes standard
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const startTimeRef = useRef<number>(Date.now());

  // Quiz running states
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizChecked, setQuizChecked] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Load exam history from backend (persistent across sessions)
  const { data: examHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['exam-history'],
    queryFn: apiService.getExamHistory,
  });

  // Also load current lesson context for display
  const { data: progress } = useQuery({
    queryKey: ['progress'],
    queryFn: apiService.getProgress,
  });

  const generateMutation = useMutation({
    mutationFn: (type: string) => apiService.generateExam(type),
    onSuccess: (data) => {
      setExamData(data);
      setAnswers({});
      setQuizChecked(false);
      setResults(null);
      setTimeLeft(300); // Reset timer to 5 minutes
      setTimerActive(true);
      startTimeRef.current = Date.now();
    },
    onError: (err: any) => {
      alert(err.message || "Test yaratishda xatolik yuz berdi. Avval xatolar ro'yxatini to'ldiring!");
    }
  });

  const submitMutation = useMutation({
    mutationFn: (data: any) => apiService.submitExamResult(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-history'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    }
  });

  const handleStartExam = () => {
    generateMutation.mutate(examType);
  };

  // Timer Ticking Effect
  useEffect(() => {
    let timer: any;
    if (timerActive && timeLeft > 0 && !quizChecked) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !quizChecked) {
      setTimerActive(false);
      autoSubmitQuiz();
    }
    return () => clearInterval(timer);
  }, [timerActive, timeLeft, quizChecked]);

  const autoSubmitQuiz = () => {
    const mockEvent = { preventDefault: () => {} };
    handleCheckQuiz(mockEvent as React.FormEvent);
  };

  const handleCheckQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examData) return;
    setTimerActive(false);

    let correctCount = 0;
    const feedback: Record<string, any> = {};
    const questions: Question[] = examData.questions;

    questions.forEach((q) => {
      const userAns = (answers[q.id] || '').trim().toLowerCase();
      const correctAns = q.answer.trim().toLowerCase();
      const isCorrect = userAns === correctAns;
      
      if (isCorrect) {
        correctCount += 1;
        feedback[q.id] = { is_correct: true, feedback: "To'g'ri! Barakalla!" };
      } else {
        feedback[q.id] = { 
          is_correct: false, 
          correct_answer: q.answer, 
          feedback: `Noto'g'ri. To'g'ri javob: ${q.answer}` 
        };
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);

    setResults({
      score,
      correct_count: correctCount,
      total: questions.length,
      feedback
    });
    setQuizChecked(true);

    if (score >= 60) {
      onAddXp(60);
    }

    // Save to backend (not localStorage)
    submitMutation.mutate({
      exam_type: examType,
      title: examData.title || `${examType} Test`,
      score,
      correct_count: correctCount,
      total_questions: questions.length,
      lesson_number: progress?.current_lesson,
      time_taken_seconds: timeTaken,
      questions_json: { questions, answers, feedback },
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (score >= 60) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  };

  return (
    <div className="space-y-8 animate-fade-in text-on-surface">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-on-surface flex items-center gap-2">
          <Award className="text-primary w-6 h-6" />
          <span>Imtihon markazi</span>
        </h2>
        <p className="text-xs md:text-sm text-on-surface-variant mt-1">
          Shaxsiy o'quv natijalari va kamchiliklaringizga moslashtirilgan testlar.
          {progress && <span className="ml-2 text-primary font-semibold">• Lektion {progress.current_lesson}</span>}
        </p>
      </div>

      {!examData ? (
        /* Selection View & History */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
          {/* Options Card */}
          <div className="lg:col-span-7 bg-surface border border-border p-6 md:p-8 rounded-[32px] space-y-6">
            <h3 className="text-base font-serif font-bold text-on-surface flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" /> Test turini tanlang
            </h3>
            
            <div className="grid grid-cols-1 gap-3.5 text-xs">
              {/* Lesson Quiz */}
              <button
                onClick={() => setExamType('lesson')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                  examType === 'lesson'
                    ? 'border-primary bg-primary/10 text-on-surface font-semibold shadow-sm'
                    : 'border-border bg-surface-variant text-on-surface-variant hover:border-primary/45'
                }`}
              >
                <Layers className="mt-0.5 text-primary shrink-0" size={18} />
                <div>
                  <span className="block font-bold">Lektion {progress?.current_lesson || '?'} bo'yicha test</span>
                  <span className="block text-on-surface-variant mt-1 leading-relaxed">
                    Joriy o'rganilayotgan dars bo'yicha grammatika va so'zlarni sinab ko'rish.
                  </span>
                </div>
              </button>

              {/* Mistakes-based Quiz */}
              <button
                onClick={() => setExamType('mistakes')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                  examType === 'mistakes'
                    ? 'border-primary bg-primary/10 text-on-surface font-semibold shadow-sm'
                    : 'border-border bg-surface-variant text-on-surface-variant hover:border-primary/45'
                }`}
              >
                <AlertTriangle className="mt-0.5 text-red-400 shrink-0" size={18} />
                <div>
                  <span className="block font-bold">Xatolarim ustida test</span>
                  <span className="block text-on-surface-variant mt-1 leading-relaxed">
                    AI Tutor va uy ishlarida yo'l qo'ygan xatolaringizdan tuzilgan shaxsiylashtirilgan test.
                  </span>
                </div>
              </button>

              {/* CEFR Diagnostic Quiz */}
              <button
                onClick={() => setExamType('cefr')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                  examType === 'cefr'
                    ? 'border-primary bg-primary/10 text-on-surface font-semibold shadow-sm'
                    : 'border-border bg-surface-variant text-on-surface-variant hover:border-primary/45'
                }`}
              >
                <Trophy className="mt-0.5 text-amber-500 shrink-0" size={18} />
                <div>
                  <span className="block font-bold">CEFR A1 Diagnostik test</span>
                  <span className="block text-on-surface-variant mt-1 leading-relaxed">
                    Nemis tili A1 darajasi bo'yicha jami o'zlashtirish ko'rsatkichini aniqlovchi diagnostik imtihon.
                  </span>
                </div>
              </button>
            </div>

            <button
              onClick={handleStartExam}
              className="w-full py-4 bg-primary hover:bg-primary-hover text-on-primary font-bold rounded-2xl text-xs uppercase tracking-wider transition shadow-md shadow-primary/15"
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  Test shakllantirilmoqda...
                </span>
              ) : 'Testni boshlash'}
            </button>
          </div>

          {/* Exam History Panel */}
          <div className="lg:col-span-5 bg-surface border border-border p-6 rounded-[32px] flex flex-col">
            <h3 className="text-base font-serif font-bold text-on-surface flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" /> Imtihonlar Tarixi
            </h3>
            
            {historyLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : examHistory.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-on-surface-variant/40 space-y-2">
                <Clock className="w-8 h-8 mx-auto" />
                <p className="text-xs italic">Siz hali hech qanday test topshirmadingiz.</p>
                <p className="text-[10px]">Birinchi testingizni boshlang!</p>
              </div>
            ) : (
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[380px] pr-1">
                {examHistory.map((item: any) => (
                  <div key={item.id} className="p-3 bg-surface-variant border border-border rounded-xl flex justify-between items-center text-xs">
                    <div className="flex-1 min-w-0 mr-3">
                      <span className="font-bold text-on-surface block truncate">{item.title}</span>
                      <span className="text-[10px] text-on-surface-variant block mt-0.5">
                        {new Date(item.created_at).toLocaleDateString('uz-UZ')} •{' '}
                        {item.time_taken_seconds > 0 ? `${Math.round(item.time_taken_seconds / 60)}min` : ''}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${getScoreBg(item.score)}`}>
                        {item.score}%
                      </span>
                      <span className="text-[9px] text-on-surface-variant">
                        {item.correct_count}/{item.total_questions}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3.5 bg-surface-variant rounded-2xl border border-border mt-4 text-[11px] text-on-surface-variant leading-relaxed">
              * Muvaffaqiyatli topshirilgan imtihon (60%+) uchun <strong>+60 XP</strong> o'quv balli yoziladi.
            </div>
          </div>
        </div>
      ) : (
        /* Quiz Running View */
        <div className="bg-surface border border-border p-6 md:p-8 rounded-[32px] space-y-6 max-w-3xl mx-auto">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <div>
              <h3 className="text-lg font-serif font-bold text-on-surface">{examData.title}</h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">
                {examData.questions?.length || 0} ta savoldan iborat test
              </p>
            </div>
            
            {/* Active timer container */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-surface-variant border border-border px-3 py-1.5 rounded-full text-xs font-mono font-bold">
                <Clock className={`w-4 h-4 ${timeLeft <= 60 ? 'text-red-400 animate-pulse' : 'text-primary'}`} />
                <span className={timeLeft <= 60 ? 'text-red-400' : 'text-on-surface'}>{formatTime(timeLeft)}</span>
              </div>
              <button
                onClick={() => {
                  setTimerActive(false);
                  setExamData(null);
                }}
                className="py-1.5 px-3.5 rounded-full border border-border bg-surface-variant text-on-surface-variant hover:text-on-surface text-xs font-semibold"
              >
                Chiqish
              </button>
            </div>
          </div>

          <form onSubmit={handleCheckQuiz} className="space-y-4">
            {examData.questions.map((q: Question, idx: number) => (
              <div key={q.id} className="p-5 rounded-2xl border border-border bg-surface-variant text-xs space-y-3">
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span className="font-bold uppercase tracking-wider text-[10px]">Savol {idx + 1}</span>
                  <span
                    className="text-[10px] text-primary font-bold cursor-pointer hover:underline"
                    title={q.hint}
                  >
                    Hint (Yordam)
                  </span>
                </div>
                <p className="text-sm text-on-surface font-semibold leading-relaxed">{q.question}</p>
                
                {q.options && q.options.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[q.id] === opt;
                      const fb = results?.feedback?.[q.id];
                      const isCorrectOpt = fb && opt.toLowerCase() === q.answer.toLowerCase();
                      const isWrongSelected = fb && isSelected && !fb.is_correct;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={quizChecked}
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                          className={`p-3 rounded-xl border text-left text-xs transition-all ${
                            quizChecked
                              ? isCorrectOpt
                                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-600 font-bold'
                                : isWrongSelected
                                ? 'bg-red-500/20 border-red-500/30 text-red-400'
                                : 'border-border bg-surface text-on-surface-variant opacity-50'
                              : isSelected
                              ? 'bg-primary border-primary text-on-primary font-bold'
                              : 'bg-surface border-border text-on-surface hover:bg-surface-variant'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Javobni nemis tilida kiriting..."
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    required
                    disabled={quizChecked}
                  />
                )}

                {/* Individual feedback */}
                {results && results.feedback && results.feedback[q.id] && (
                  <div className={`p-3 rounded-xl border flex gap-2 items-start ${
                    results.feedback[q.id].is_correct 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {results.feedback[q.id].is_correct ? <Check size={14} className="mt-0.5" /> : <X size={14} className="mt-0.5" />}
                    <div>
                      <p className="font-bold text-xs">{results.feedback[q.id].feedback}</p>
                      {!results.feedback[q.id].is_correct && (
                        <p className="text-[10px] text-on-surface-variant mt-1">Hint: {q.hint}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Check/Submit action */}
            <div className="flex justify-between items-center border-t border-border pt-5 mt-5">
              {results && (
                <div className="flex items-center gap-3">
                  <div className="text-xs font-bold text-on-surface">Jami natija:</div>
                  <span className={`text-3xl font-serif font-black ${getScoreColor(results.score)}`}>
                    {results.score}%
                  </span>
                  <span className="text-xs text-on-surface-variant">({results.correct_count}/{results.total})</span>
                  {results.score >= 80 && (
                    <span className="text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                      Excellent! 🌟
                    </span>
                  )}
                </div>
              )}
              
              {!quizChecked ? (
                <button
                  type="submit"
                  className="ml-auto py-3 px-6 bg-primary text-on-primary hover:bg-primary-hover font-bold rounded-xl text-xs uppercase tracking-wider transition"
                >
                  Javoblarni tekshirish
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartExam}
                  className="ml-auto py-3 px-6 bg-primary text-on-primary hover:bg-primary-hover font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-1.5"
                >
                  <RefreshCw size={14} /> Qayta urinib ko'rish
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
