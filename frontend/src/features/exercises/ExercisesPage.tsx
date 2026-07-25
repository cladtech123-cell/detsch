import { useState } from 'react';
import { CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';

interface SentenceTask {
  id: number;
  translation: string;
  correctAnswer: string[];
  words: string[];
}

const SEED_EXERCISES: SentenceTask[] = [
  {
    id: 1,
    translation: 'Men shifokor bo\'lib ishlayman.',
    correctAnswer: ['Ich', 'arbeite', 'als', 'Arzt.'],
    words: ['als', 'Ich', 'Arzt.', 'Spiele', 'arbeite', 'habe'],
  },
  {
    id: 2,
    translation: 'Sizning ismingiz nima (Siz - hurmat ma\'nosida)?',
    correctAnswer: ['Wie', 'heißen', 'Sie?'],
    words: ['Sie?', 'du?', 'Wie', 'heißen', 'ist', 'Wer'],
  },
  {
    id: 3,
    translation: 'Mening mashinam bor.',
    correctAnswer: ['Ich', 'habe', 'ein', 'Auto.'],
    words: ['ein', 'Auto.', 'habe', 'kein', 'Ich', 'bin'],
  },
  {
    id: 4,
    translation: 'Ular nemis tilida gaplashadilar.',
    correctAnswer: ['Sie', 'sprechen', 'Deutsch.'],
    words: ['Deutsch.', 'sprechen', 'Sie', 'wir', 'heißt', 'deutsch'],
  }
];

export function ExercisesPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const task = SEED_EXERCISES[currentIdx];

  const handleWordClick = (word: string) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
    setFeedback(null);
  };

  const handleCheck = () => {
    const isCorrect = selectedWords.join(' ') === task.correctAnswer.join(' ');
    setFeedback(isCorrect ? 'correct' : 'incorrect');
  };

  const handleReset = () => {
    setSelectedWords([]);
    setFeedback(null);
  };

  const handleNext = () => {
    setSelectedWords([]);
    setFeedback(null);
    setCurrentIdx((prev) => (prev + 1) % SEED_EXERCISES.length);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Exercise Card Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          Bilde den Satz (Gap tuzing)
        </span>
        <h3 className="text-2xl font-black text-on-surface tracking-tight">Interactive Satzbau-Übung</h3>
        <p className="text-on-surface-variant text-sm mt-2">
          So'zlarni to'g'ri tartibda bosib, nemischa gapni hosil qiling.
        </p>
      </div>

      {/* Main Interactive Board */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
        
        {/* Translation Prompt */}
        <div className="p-6 rounded-2xl bg-surface-container flex items-center justify-between gap-4 border border-outline-variant/50">
          <div>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Tarjimasi:</span>
            <p className="font-headline-md text-on-surface font-bold text-lg mt-1">"{task.translation}"</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">translate</span>
          </div>
        </div>

        {/* Selected Words Area (Your Sentence) */}
        <div className="min-h-[80px] p-6 rounded-2xl border border-dashed border-outline-variant bg-surface-container-low flex flex-wrap gap-3 items-center">
          {selectedWords.length === 0 ? (
            <span className="text-on-surface-variant/50 text-sm font-medium italic">
              Gap tuzish uchun quyidagi so'zlarni bosing...
            </span>
          ) : (
            selectedWords.map((word) => (
              <button 
                key={word}
                onClick={() => handleWordClick(word)}
                className="px-4 py-2.5 bg-primary text-on-primary font-bold text-sm rounded-xl hover:scale-95 transition-transform active:scale-90 shadow-sm"
              >
                {word}
              </button>
            ))
          )}
        </div>

        {/* Options / Word Pool */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">So'zlar to'plami:</p>
          <div className="flex flex-wrap gap-3">
            {task.words.map((word) => {
              const isSelected = selectedWords.includes(word);
              return (
                <button
                  key={word}
                  disabled={isSelected}
                  onClick={() => handleWordClick(word)}
                  className={`px-5 py-3 rounded-2xl text-sm font-bold border transition-all active:scale-95 ${
                    isSelected 
                      ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                      : 'bg-white border-slate-200 text-on-surface hover:border-primary/20 hover:shadow-sm'
                  }`}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Display */}
        {feedback && (
          <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-bold ${
            feedback === 'correct' 
              ? 'bg-tertiary/10 border-tertiary/20 text-tertiary' 
              : 'bg-error/5 border-error/15 text-error'
          }`}>
            <span className="material-symbols-outlined text-2xl">
              {feedback === 'correct' ? 'check_circle' : 'error'}
            </span>
            <span>
              {feedback === 'correct' 
                ? 'Barakalla! To\'g\'ri javob! 🎉' 
                : 'Noto\'g\'ri tartib. Iltimos qaytadan urinib ko\'ring! 😢'}
            </span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
          <button 
            onClick={handleCheck}
            disabled={selectedWords.length === 0}
            className="px-8 py-3.5 bg-primary text-on-primary font-bold rounded-xl flex items-center gap-2 hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
          >
            Tekshirish
            <CheckCircle size={16} />
          </button>
          <button 
            onClick={handleReset}
            className="px-6 py-3.5 bg-white border border-slate-200 text-on-surface hover:bg-slate-50 font-bold rounded-xl flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            Tozalash
            <RefreshCw size={14} />
          </button>
          <button 
            onClick={handleNext}
            className="px-6 py-3.5 bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-bold rounded-xl flex items-center gap-2 transition-all active:scale-[0.98] ml-auto"
          >
            Keyingisi
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
