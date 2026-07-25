import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  Award, 
  Layers, 
  Play, 
  Check, 
  X, 
  RefreshCw,
  Sparkles,
  AlertTriangle 
} from 'lucide-react';
import { apiService } from '@/lib/services';

interface Question {
  id: string;
  question: string;
  hint: string;
  answer: string;
}

export function ExamsPage() {
  const [examType, setExamType] = useState<'lesson' | 'mistakes' | 'cefr'>('lesson');
  const [examData, setExamData] = useState<any>(null);
  
  // Quiz running state
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizChecked, setQuizChecked] = useState(false);
  const [results, setResults] = useState<any>(null);

  const generateMutation = useMutation({
    mutationFn: (type: string) => apiService.generateExam(type),
    onSuccess: (data) => {
      setExamData(data);
      setAnswers({});
      setQuizChecked(false);
      setResults(null);
    },
    onError: (err: any) => {
      alert(err.message || "Test yaratishda xatolik yuz berdi. Avval xatolar ro'yxatini to'ldiring!");
    }
  });

  const handleStartExam = () => {
    generateMutation.mutate(examType);
  };

  const handleCheckQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examData) return;

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
    setResults({
      score,
      correct_count: correctCount,
      total: questions.length,
      feedback
    });
    setQuizChecked(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2">
          <Award className="text-primary" /> Imtihon markazi (Prüfungszentrum)
        </h1>
        <p className="text-on-surface-variant text-xs mt-1">Shaxsiy o'quv natijalari va kamchiliklaringizga moslashtirilgan testlar.</p>
      </div>

      {!examData ? (
        /* Exam Selection Interface */
        <div className="border border-slate-200 bg-white border border-slate-200 p-6 rounded-2xl backdrop-blur-md max-w-xl mx-auto space-y-6">
          <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
            <Play size={18} className="text-primary" /> Test turini tanlang
          </h2>
          
          <div className="grid grid-cols-1 gap-3">
            {/* Option 1: Lesson Quiz */}
            <button
              onClick={() => setExamType('lesson')}
              className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
                examType === 'lesson'
                  ? 'border-primary bg-primary/10 text-on-surface'
                  : 'border-slate-100 bg-surface-container-low text-on-surface-variant hover:border-slate-200'
              }`}
            >
              <Layers className="mt-1 text-primary shrink-0" size={18} />
              <div>
                <span className="block font-semibold text-sm">Lektion 7 bo'yicha test</span>
                <span className="block text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Momente A1.1 darsligining 7-darsida o'rganilgan grammatika va so'zlarni sinab ko'rish.
                </span>
              </div>
            </button>

            {/* Option 2: Mistakes-based Quiz */}
            <button
              onClick={() => setExamType('mistakes')}
              className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
                examType === 'mistakes'
                  ? 'border-primary bg-primary/10 text-on-surface'
                  : 'border-slate-100 bg-surface-container-low text-on-surface-variant hover:border-slate-200'
              }`}
            >
              <AlertTriangle className="mt-1 text-red-400 shrink-0" size={18} />
              <div>
                <span className="block font-semibold text-sm flex items-center gap-1.5">
                  Xatolarim ustida test <Sparkles className="text-amber-400" size={12} />
                </span>
                <span className="block text-xs text-on-surface-variant mt-1 leading-relaxed">
                  AI Tutor va uy ishlarida yo'l qo'ygan xatolaringizdan tuzilgan to'liq shaxsiylashtirilgan test mashqi.
                </span>
              </div>
            </button>

            {/* Option 3: CEFR Diagnostic Quiz */}
            <button
              onClick={() => setExamType('cefr')}
              className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
                examType === 'cefr'
                  ? 'border-primary bg-primary/10 text-on-surface'
                  : 'border-slate-100 bg-surface-container-low text-on-surface-variant hover:border-slate-200'
              }`}
            >
              <Award className="mt-1 text-purple-400 shrink-0" size={18} />
              <div>
                <span className="block font-semibold text-sm">CEFR A1 Diagnostik test</span>
                <span className="block text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Nemis tili A1.1/A1.2 darajasi bo'yicha jami o'zlashtirish ko'rsatkichini aniqlovchi diagnostik imtihon.
                </span>
              </div>
            </button>
          </div>

          <button
            onClick={handleStartExam}
            className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/95 text-on-surface font-bold text-xs tracking-wider transition shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5"
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? 'Test shakllantirilmoqda...' : 'Testni boshlash'}
          </button>
        </div>
      ) : (
        /* Quiz Running Interface */
        <div className="border border-slate-200 bg-white/30 p-6 rounded-2xl backdrop-blur-md space-y-6 animate-fade-in">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-on-surface">{examData.title}</h2>
              <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider mt-0.5">5 ta savoldan iborat test</p>
            </div>
            <button
              onClick={() => setExamData(null)}
              className="py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-on-surface-variant hover:text-on-surface text-xs font-semibold flex items-center gap-1"
            >
              <RefreshCw size={12} /> Boshiga qaytish
            </button>
          </div>

          <form onSubmit={handleCheckQuiz} className="space-y-4">
            {examData.questions.map((q: Question, idx: number) => (
              <div key={q.id} className="p-4 rounded-xl border border-slate-100 bg-surface-container-low text-xs space-y-2.5">
                <div className="flex justify-between items-center font-mono text-on-surface-variant">
                  <span>Savol {idx + 1}</span>
                  <span className="text-[10px] text-primary font-semibold cursor-help" title={q.hint}>Yordam</span>
                </div>
                <p className="text-sm text-on-surface font-medium leading-relaxed">{q.question}</p>
                
                <input
                  type="text"
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  placeholder="Javobni nemis tilida kiriting..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-on-surface placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
                  required
                  disabled={quizChecked}
                />

                {/* Individual feedback */}
                {results && results.feedback && results.feedback[q.id] && (
                  <div className={`p-2.5 rounded border flex gap-1.5 items-start ${
                    results.feedback[q.id].is_correct 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {results.feedback[q.id].is_correct ? <Check size={14} className="mt-0.5" /> : <X size={14} className="mt-0.5" />}
                    <div>
                      <p className="font-semibold">{results.feedback[q.id].feedback}</p>
                      {!results.feedback[q.id].is_correct && (
                        <p className="text-[11px] text-on-surface-variant mt-1 font-mono">{q.hint}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Check/Submit action */}
            <div className="flex justify-between items-center border-t border-slate-200 pt-5 mt-5">
              {results && (
                <div className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <span>Jami natija:</span>
                  <span className={`text-xl ${results.score >= 80 ? "text-emerald-400" : "text-amber-400"}`}>
                    {results.score}%
                  </span>
                  <span className="text-on-surface-variant font-normal">({results.correct_count}/{results.total})</span>
                </div>
              )}
              
              {!quizChecked ? (
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-primary hover:bg-primary/95 text-on-surface font-semibold text-xs tracking-wider transition shadow-lg shadow-indigo-600/10"
                >
                  Javoblarni tekshirish
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartExam}
                  className="py-2.5 px-5 rounded-xl bg-primary hover:bg-primary/95 text-on-surface font-semibold text-xs tracking-wider transition shadow-lg shadow-indigo-600/10 flex items-center gap-1.5"
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
}
