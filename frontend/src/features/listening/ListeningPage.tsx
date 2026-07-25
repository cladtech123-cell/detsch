import { useState } from 'react';
import { Volume2, HelpCircle, Send, Sparkles } from 'lucide-react';

interface ListeningTask {
  id: number;
  sentence: string;
  translation: string;
  hint: string;
}

const SEED_LISTENING: ListeningTask[] = [
  {
    id: 1,
    sentence: 'Wie geht es dir?',
    translation: 'Sening ishlaring qanday?',
    hint: 'Suhbatni boshlashdagi eng keng tarqalgan iboralardan biri.',
  },
  {
    id: 2,
    sentence: 'Ich trinke einen Kaffee.',
    translation: 'Men kofe ichyapman.',
    hint: 'Akkusativ kelishigi qo\'llangan oddiy gap.',
  },
  {
    id: 3,
    sentence: 'Wo wohnen Sie?',
    translation: 'Siz qayerda yashaysiz?',
    hint: 'Yashash joyi haqidagi so\'roq gap.',
  },
  {
    id: 4,
    sentence: 'Wir lernen jeden Tag Deutsch.',
    translation: 'Biz har kuni nemis tilini o\'rganamiz.',
    hint: 'Muntazam faoliyatni ifodalovchi gap.',
  }
];

export function ListeningPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userText, setUserText] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; diff?: string } | null>(null);

  const task = SEED_LISTENING[currentIdx];

  const playAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(task.sentence);
      utterance.lang = 'de-DE';
      utterance.rate = 0.8; // slightly slower for better listening
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = userText.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '');
    const cleanCorrect = task.sentence.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '');
    
    const isCorrect = cleanUser === cleanCorrect;
    setFeedback({
      isCorrect,
      diff: !isCorrect ? `To'g'ri yozilishi: "${task.sentence}"` : undefined
    });
  };

  const handleNext = () => {
    setUserText('');
    setFeedback(null);
    setCurrentIdx((prev) => (prev + 1) % SEED_LISTENING.length);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          Hörverstehen (Hörübungen)
        </span>
        <h3 className="text-2xl font-black text-on-surface tracking-tight">Audio-Diktat (Eshitib yozish)</h3>
        <p className="text-on-surface-variant text-sm mt-2">
          Audio tugmasini bosing, gapni eshiting va uni nemis tilida to'g'ri yozing.
        </p>
      </div>

      {/* Dictation Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex flex-col items-center justify-center p-8 bg-surface-container-low border border-slate-100 rounded-2xl gap-4">
          <button
            onClick={playAudio}
            className="w-20 h-20 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-105 transition-all shadow-md active:scale-95 group"
          >
            <Volume2 size={36} className="group-hover:animate-pulse" />
          </button>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Audioni tinglash uchun bosing
          </p>
        </div>

        <form onSubmit={handleCheck} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Siz eshitgan gapni yozing:
            </label>
            <input
              type="text"
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Nemischa gapni shu yerga yozing..."
              required
            />
          </div>

          <div className="text-xs text-on-surface-variant opacity-75 flex items-start gap-1.5 leading-normal">
            <HelpCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
            <span>Katta-kichik harflar va tinish belgilariga e'tibor bermasangiz ham bo'ladi.</span>
          </div>

          {/* Feedback section */}
          {feedback && (
            <div className={`p-4 rounded-2xl border flex flex-col gap-2 text-sm font-bold ${
              feedback.isCorrect 
                ? 'bg-tertiary/10 border-tertiary/20 text-tertiary' 
                : 'bg-error/5 border-error/15 text-error'
            }`}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl">
                  {feedback.isCorrect ? 'check_circle' : 'cancel'}
                </span>
                <span>
                  {feedback.isCorrect ? 'Ajoyib! To\'g\'ri eshitdingiz! 🌟' : 'Xatolik bor.'}
                </span>
              </div>
              {feedback.diff && (
                <p className="font-mono text-xs font-medium pl-8">{feedback.diff}</p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-8 py-3.5 bg-primary text-on-primary font-bold rounded-xl flex items-center gap-2 hover:shadow-md transition-all active:scale-[0.98]"
            >
              Tekshirish
              <Send size={16} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3.5 bg-slate-50 border border-slate-200 text-on-surface hover:bg-slate-100 font-bold rounded-xl flex items-center gap-2 transition-all active:scale-[0.98] ml-auto"
            >
              Keyingisi
              <Sparkles size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
