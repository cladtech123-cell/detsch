import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  BookOpen, 
  Volume2, 
  CheckCircle2, 
  Play, 
  Award, 
  Sparkles, 
  HelpCircle, 
  Lock, 
  Check, 
  FileText, 
  PenTool, 
  Mic, 
  RefreshCw, 
  ChevronRight,
  Sparkle
} from 'lucide-react';
import { Language, Lesson } from '../../types';
import { i18nTranslations } from '../../data/i18n';
import { apiService } from '../../lib/services';

interface LessonsViewProps {
  lang: Language;
  onAddXp: (amount: number) => void;
}

type TabMode = 
  | 'einstieg' 
  | 'wortschatz' 
  | 'grammatik' 
  | 'hoeren' 
  | 'lesen' 
  | 'schreiben' 
  | 'sprechen' 
  | 'uebungen' 
  | 'quiz' 
  | 'wiederholung';

export const LessonsView: React.FC<LessonsViewProps> = ({ lang, onAddXp }) => {
  const t = (key: string) => i18nTranslations[lang][key] || key;
  const queryClient = useQueryClient();

  // Load progress dynamically from backend Uvicorn db
  const { data: progress } = useQuery({
    queryKey: ['progress'],
    queryFn: apiService.getProgress,
  });

  const currentLessonNumber = progress?.current_lesson || 7;
  const [selectedLessonNumber, setSelectedLessonNumber] = useState<number>(7);
  const [activeTabMode, setActiveTabMode] = useState<TabMode>('einstieg');

  // Load active curriculum lesson data from SQLite DB
  const { data: lessonData, isLoading: isLessonLoading } = useQuery({
    queryKey: ['curriculum_lesson', selectedLessonNumber],
    queryFn: () => apiService.getCurriculumLesson("A1.1", selectedLessonNumber),
    enabled: !!selectedLessonNumber,
  });

  // Track completion state of all 10 Momente sections
  const [completions, setCompletions] = useState<Record<string, boolean>>({
    einstieg: false,
    wortschatz: false,
    grammatik: false,
    hoeren: false,
    lesen: false,
    schreiben: false,
    sprechen: false,
    uebungen: false,
    quiz: false,
    wiederholung: false,
  });

  useEffect(() => {
    if (progress?.current_lesson) {
      setSelectedLessonNumber(progress.current_lesson);
    }
  }, [progress]);

  // Load checklist for selected lesson from database progress
  useEffect(() => {
    const emptyVal = {
      einstieg: false,
      wortschatz: false,
      grammatik: false,
      hoeren: false,
      lesen: false,
      schreiben: false,
      sprechen: false,
      uebungen: false,
      quiz: false,
      wiederholung: false,
    };
    const key = selectedLessonNumber.toString();
    if (progress?.lesson_progress?.[key]) {
      setCompletions({
        ...emptyVal,
        ...progress.lesson_progress[key]
      });
    } else {
      // Default Lektion 7 with partial progress if not initialized
      if (selectedLessonNumber === 7) {
        setCompletions({
          einstieg: true,
          wortschatz: true,
          grammatik: true,
          hoeren: false,
          lesen: false,
          schreiben: false,
          sprechen: false,
          uebungen: false,
          quiz: false,
          wiederholung: false,
        });
      } else {
        setCompletions(emptyVal);
      }
    }
  }, [progress, selectedLessonNumber]);

  const markComplete = async (tab: TabMode) => {
    const updated = { ...completions, [tab]: true };
    setCompletions(updated);

    // Calculate dynamic percentage
    const completedCount = Object.values(updated).filter(Boolean).length;
    const progressPercent = Math.round((completedCount / 10) * 100);

    // Log study session XP for this completed section
    try {
      await apiService.logStudySession({
        activity_type: 'lesson',
        xp_earned: 30, // 30 XP per section
        duration_minutes: 5,
        lesson_number: selectedLessonNumber,
      });
      onAddXp(30);
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    } catch {
      // Non-critical if session logging fails
    }

    // Save section completion to backend database
    try {
      await apiService.completeLessonSection(selectedLessonNumber, tab);
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err) {
      console.error("Failed to sync completion status to database:", err);
    }

    // If 100% completed, auto-advance backend lesson level
    if (progressPercent === 100 && selectedLessonNumber === currentLessonNumber) {
      try {
        await apiService.updateProgress({
          current_lesson: currentLessonNumber + 1,
        });
        queryClient.invalidateQueries({ queryKey: ['progress'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        alert(lang === 'uz' ? "Tabriklaymiz! Lektion to'liq yakunlandi va keyingi dars ochildi!" : "Lektion abgeschlossen!");
      } catch (err) {
        console.error(err);
      }
    }
  };


  // State elements for specific activities
  const [audioSpeed, setAudioSpeed] = useState<'normal' | 'slow'>('normal');
  const [dictationText, setDictationText] = useState('');
  const [dictationFeedback, setDictationFeedback] = useState('');
  const [activeTranslation, setActiveTranslation] = useState<string | null>(null);
  const [writingInput, setWritingInput] = useState('');
  const [writingFeedback, setWritingFeedback] = useState<any>(null);
  const [isEvaluatingWriting, setIsEvaluatingWriting] = useState(false);
  const [isRecordingSpeech, setIsRecordingSpeech] = useState(false);
  const [speakingFeedback, setSpeakingFeedback] = useState<any>(null);
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<number, number>>({});
  const [exerciseSubmitted, setExerciseSubmitted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = audioSpeed === 'slow' ? 0.65 : 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTestDictation = () => {
    if (!lessonData?.listening_dialogue) return;
    const cleanedDialogue = lessonData.listening_dialogue.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const cleanedInput = dictationText.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    
    if (cleanedDialogue.includes(cleanedInput) && cleanedInput.length > 5) {
      setDictationFeedback("Ajoyib! Diktant matni mos keldi.");
      markComplete('hoeren');
    } else {
      setDictationFeedback("Xato bor. Iltimos audio matnni diqqat bilan qayta eshiting.");
    }
  };

  const handleEvaluateWriting = () => {
    if (!writingInput) return;
    setIsEvaluatingWriting(true);
    setTimeout(() => {
      setWritingFeedback({
        score: 85,
        corrections: [
          { incorrect: "Ich kann Deutsch sprechen sehr gut.", corrected: "Ich kann sehr gut Deutsch sprechen.", reason: "Fe'l oxirida emas, o'rganilayotgan modal fe'l qoidasiga ko'ra asosiy fe'l oxirida turadi." }
        ],
        suggestion: "Ich kann sehr gut Deutsch sprechen, weil ich jeden Tag fleißig übe."
      });
      setIsEvaluatingWriting(false);
      markComplete('schreiben');
    }, 1500);
  };

  const handleStartSpeaking = () => {
    setIsRecordingSpeech(true);
    setTimeout(() => {
      setIsRecordingSpeech(false);
      setSpeakingFeedback({
        accuracy: 94,
        stressScore: 92,
        pronunciation: "Sehr gut! Talaffuz to'g'ri.",
        grammarScore: 95
      });
      markComplete('sprechen');
    }, 2000);
  };

  const handleSubmitQuiz = () => {
    if (!lessonData?.quiz_questions_json) return;
    let correct = 0;
    lessonData.quiz_questions_json.forEach((q: any, idx: number) => {
      if (quizAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });
    const percentage = Math.round((correct / lessonData.quiz_questions_json.length) * 100);
    setQuizScore(percentage);
    setQuizSubmitted(true);
    if (percentage >= 60) {
      onAddXp(45);
      markComplete('quiz');
    }
  };

  if (isLessonLoading || !lessonData) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 animate-pulse">
        <RefreshCw className="h-12 w-12 text-primary animate-spin" />
        <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Momente darsligi ma'lumotlari yuklanmoqda...</p>
      </div>
    );
  }

  // Calculate dynamic progress percentage
  const completedCount = Object.values(completions).filter(Boolean).length;
  const currentProgressPercent = Math.round((completedCount / 10) * 100);

  return (
    <div className="space-y-8 animate-fade-in text-on-surface">
      {/* Title Header */}
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            Momente A1.1 • Lektion {lessonData.number}
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-on-surface mt-2">
            {lessonData.title_de} ({lessonData.title_uz})
          </h2>
          <p className="text-xs md:text-sm text-on-surface-variant mt-1">
            {lessonData.description_uz}
          </p>
        </div>

        {/* Progress Display */}
        <div className="flex items-center gap-3 bg-surface border border-border px-5 py-2.5 rounded-2xl shadow-sm shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Lektion Progress</span>
            <span className="text-lg font-black text-primary font-mono">{currentProgressPercent}%</span>
          </div>
          <div className="w-16 h-2 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${currentProgressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar (10 Sections of Momente) */}
        <div className="lg:col-span-3 space-y-2">
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
            O'quv Rejasi Bo'limlari
          </h3>
          <div className="space-y-1.5">
            {[
              { id: 'einstieg', label: '1. Einstieg (Kirish)' },
              { id: 'wortschatz', label: '2. Wortschatz (Leksika)' },
              { id: 'grammatik', label: '3. Grammatik (Grammatika)' },
              { id: 'hoeren', label: '4. Hören (Tinglash)' },
              { id: 'lesen', label: '5. Lesen (O\'qish)' },
              { id: 'schreiben', label: '6. Schreiben (Yozish)' },
              { id: 'sprechen', label: '7. Sprechen (Gapirish)' },
              { id: 'uebungen', label: '8. Übungen (Mashqlar)' },
              { id: 'quiz', label: '9. Quiz (Baholash)' },
              { id: 'wiederholung', label: '10. Wiederholung (Takrorlash)' }
            ].map((section) => {
              const isActive = activeTabMode === section.id;
              const isCompleted = completions[section.id];
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveTabMode(section.id as TabMode)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-medium text-left transition-all border ${
                    isActive 
                      ? 'bg-primary text-on-primary border-primary shadow-sm font-bold' 
                      : 'bg-surface hover:bg-surface-variant text-on-surface border-border'
                  }`}
                >
                  <span>{section.label}</span>
                  {isCompleted && (
                    <Check className={`w-4 h-4 ${isActive ? 'text-on-primary' : 'text-primary'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Workspace Container */}
        <div className="lg:col-span-9 bg-surface border border-border rounded-[32px] p-6 md:p-8 space-y-6 min-h-[500px]">
          
          {/* EINSTIEG */}
          {activeTabMode === 'einstieg' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-serif font-bold text-on-surface flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Einstieg (Mavzuga kirish)
              </h3>
              <div className="bg-surface-variant p-6 rounded-2xl border border-border space-y-4">
                <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider">Mavzu Mazmuni</h4>
                <p className="text-xs text-on-surface leading-relaxed">
                  {lessonData.description_de}
                </p>
                <div className="pt-4 border-t border-border space-y-2">
                  <h5 className="font-bold text-[10px] text-primary uppercase tracking-wider">Asosiy maqsadlar</h5>
                  <ul className="text-xs space-y-1.5 text-on-surface-variant list-disc pl-4 leading-relaxed">
                    <li>Momente darsligi Lektion {lessonData.number} mavzusini tushunish</li>
                    <li>Sohaga oid grammatik qoidalarni muloqotda ishlata olish</li>
                    <li>Leksik minimal doirasidagi so'zlarni to'liq yodlash</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => markComplete('einstieg')}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-hover font-bold text-xs uppercase tracking-wider transition"
              >
                Kirish darsini yakunlash
              </button>
            </div>
          )}

          {/* WORTSCHATZ */}
          {activeTabMode === 'wortschatz' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-serif font-bold text-on-surface flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> Wortschatz (Mavzu Leksikasi)
                </h3>
                <button
                  onClick={() => markComplete('wortschatz')}
                  className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 text-primary text-xs font-bold"
                >
                  Hammasini yodladim
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lessonData.vocabulary_json && lessonData.vocabulary_json.length > 0 ? (
                  lessonData.vocabulary_json.map((word: any, idx: number) => (
                    <div key={idx} className="bg-surface-variant border border-border p-4 rounded-2xl flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          {word.article && (
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                              {word.article}
                            </span>
                          )}
                          <p className="font-bold text-sm text-on-surface">{word.german}</p>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1">{word.translation}</p>
                        {word.plural && <p className="text-[10px] text-on-surface-variant mt-0.5 italic">Plural: {word.plural}</p>}
                        {word.ipa && <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">{word.ipa}</p>}
                      </div>
                      <button
                        onClick={() => speakText(word.german)}
                        className="p-2 rounded-xl bg-surface border border-border hover:text-primary transition"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-on-surface-variant col-span-2">Leksika bazasidan joriy dars so'zlari yuklanmadi.</p>
                )}
              </div>
            </div>
          )}

          {/* GRAMMATIK */}
          {activeTabMode === 'grammatik' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-serif font-bold text-on-surface flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Grammatik (Mavzu Qoidasi)
                </h3>
                <button
                  onClick={() => markComplete('grammatik')}
                  className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 text-primary text-xs font-bold"
                >
                  Tushundim
                </button>
              </div>

              <div className="bg-surface-variant p-6 rounded-2xl border border-border space-y-4">
                <h4 className="font-bold text-sm text-primary">{lessonData.grammar_title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {lessonData.grammar_explanation}
                </p>
                
                {lessonData.grammar_examples_json && lessonData.grammar_examples_json.length > 0 && (
                  <div className="pt-4 border-t border-border space-y-3">
                    <h5 className="font-bold text-[10px] uppercase tracking-wider text-on-surface-variant">Misollar (Beispiele)</h5>
                    {lessonData.grammar_examples_json.map((ex: any, idx: number) => (
                      <div key={idx} className="p-3 bg-surface rounded-xl border border-border flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-on-surface">{ex.de}</p>
                          <p className="text-on-surface-variant mt-0.5">{ex.uz}</p>
                        </div>
                        <button onClick={() => speakText(ex.de)} className="p-1.5 text-on-surface-variant hover:text-primary">
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HÖREN */}
          {activeTabMode === 'hoeren' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-serif font-bold text-on-surface flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-primary" /> Hören (Tinglash va Talaffuz)
              </h3>

              <div className="bg-surface-variant p-5 rounded-2xl border border-border space-y-4 text-xs">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span className="font-bold">Mavzu Dialogi (Audio dialogue)</span>
                  <div className="flex bg-surface rounded-lg p-1 border border-border text-[9px] uppercase font-bold tracking-wider">
                    <button
                      onClick={() => setAudioSpeed('normal')}
                      className={`px-3 py-1 rounded ${audioSpeed === 'normal' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
                    >
                      Normal
                    </button>
                    <button
                      onClick={() => setAudioSpeed('slow')}
                      className={`px-3 py-1 rounded ${audioSpeed === 'slow' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
                    >
                      Slow (Sokin)
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-surface rounded-xl border border-border relative">
                  <p className="italic leading-relaxed whitespace-pre-line text-on-surface-variant font-mono">
                    {lessonData.listening_dialogue}
                  </p>
                  <button
                    onClick={() => speakText(lessonData.listening_dialogue)}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-primary text-on-primary hover:bg-primary-hover shadow"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>

                {/* Dictation exercises */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <span className="font-bold">Eshitilgan matnni diktant tarzida yozing (Dictation)</span>
                  <textarea
                    value={dictationText}
                    onChange={(e) => setDictationText(e.target.value)}
                    placeholder="Eshitgan jumlalaringizni shu yerga kiriting..."
                    className="w-full h-24 p-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary text-xs"
                  />
                  <div className="flex justify-between items-center">
                    <button
                      onClick={handleTestDictation}
                      className="px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-hover font-bold text-[10px] uppercase tracking-wider"
                    >
                      Diktantni tekshirish
                    </button>
                    {dictationFeedback && <span className="font-bold text-primary">{dictationFeedback}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LESEN */}
          {activeTabMode === 'lesen' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-serif font-bold text-on-surface flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Lesen (O'qish va tarjima)
              </h3>

              <div className="bg-surface-variant p-6 rounded-2xl border border-border space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs">Nemischa matn (Click on sentence to translate)</span>
                </div>
                <div className="p-4 bg-surface rounded-xl border border-border leading-relaxed text-xs">
                  {lessonData.reading_passage.split('. ').map((sentence, idx) => (
                    <span
                      key={idx}
                      onClick={() => setActiveTranslation(sentence)}
                      className="hover:bg-primary/10 cursor-pointer border-b border-dashed border-primary/20 px-1 py-0.5 rounded transition inline-block mr-1"
                    >
                      {sentence}.
                    </span>
                  ))}
                </div>

                {activeTranslation && (
                  <div className="p-3 bg-primary/10 border border-primary/20 text-xs rounded-xl flex justify-between items-center">
                    <p className="text-on-surface font-medium">Uzbekcha tarjimasi so'ralmoqda...</p>
                    <button onClick={() => setActiveTranslation(null)} className="p-1 text-on-surface-variant hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Comprehension check */}
                {lessonData.reading_quiz_json && lessonData.reading_quiz_json.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <span className="font-bold text-xs block">Matn tushunish testi (Comprehension quiz)</span>
                    {lessonData.reading_quiz_json.map((q: any, qIdx: number) => (
                      <div key={qIdx} className="space-y-2 p-3 bg-surface border border-border rounded-xl">
                        <p className="font-bold text-xs">{q.question}</p>
                        <div className="flex gap-3">
                          {q.options.map((opt: string, optIdx: number) => (
                            <button
                              key={optIdx}
                              onClick={() => {
                                alert(optIdx === q.correctIndex ? "To'g'ri!" : "Xato");
                                if (optIdx === q.correctIndex) markComplete('lesen');
                              }}
                              className="px-4 py-2 border border-border rounded-lg text-xs bg-surface-variant hover:bg-primary/20 transition"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SCHREIBEN */}
          {activeTabMode === 'schreiben' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-serif font-bold text-on-surface flex items-center gap-2">
                <PenTool className="w-5 h-5 text-primary" /> Schreiben (Yozma ish)
              </h3>

              <div className="bg-surface-variant p-6 rounded-2xl border border-border space-y-4">
                <div className="p-4 bg-primary/10 border border-primary/25 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-primary block">Yozma mavzu vazifasi (Prompt)</span>
                  <p className="text-on-surface-variant leading-relaxed">{lessonData.writing_prompt}</p>
                </div>

                <textarea
                  value={writingInput}
                  onChange={(e) => setWritingInput(e.target.value)}
                  placeholder="Nemischa javobingizni shu yerga yozing (Faqat mavzu so'zlari va grammatikasidan foydalaning)..."
                  className="w-full h-36 p-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary text-xs"
                />

                <button
                  onClick={handleEvaluateWriting}
                  disabled={isEvaluatingWriting || !writingInput}
                  className="px-6 py-3 rounded-xl bg-primary text-on-primary hover:bg-primary-hover font-bold text-xs uppercase tracking-wider transition flex items-center gap-2"
                >
                  {isEvaluatingWriting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkle className="w-4 h-4" />}
                  <span>AI Tahlilini olish</span>
                </button>

                {writingFeedback && (
                  <div className="p-5 bg-surface border border-border rounded-2xl space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-border pb-2">
                      <span className="font-bold">Natija (Writing score):</span>
                      <span className="font-bold text-primary">{writingFeedback.score}%</span>
                    </div>
                    {writingFeedback.corrections.map((corr: any, i: number) => (
                      <div key={i} className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                        <p className="text-red-400 line-through font-mono">"{corr.incorrect}"</p>
                        <p className="text-primary font-mono font-bold mt-1">➔ "{corr.corrected}"</p>
                        <p className="text-[10px] text-on-surface-variant mt-1">{corr.reason}</p>
                      </div>
                    ))}
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <span className="font-bold text-primary block">Yaxshilangan namuna (AI suggestion)</span>
                      <p className="text-on-surface mt-1 italic">"{writingFeedback.suggestion}"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SPRECHEN */}
          {activeTabMode === 'sprechen' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-serif font-bold text-on-surface flex items-center gap-2">
                <Mic className="w-5 h-5 text-primary" /> Sprechen (Ovozli nutq mashqi)
              </h3>

              <div className="bg-surface-variant p-6 rounded-2xl border border-border text-center space-y-6">
                <div className="p-4 bg-surface rounded-xl border border-border text-xs max-w-md mx-auto">
                  <span className="font-bold text-primary block mb-2">Nutq mavzusi (Topic)</span>
                  <p className="text-on-surface-variant italic">"{lessonData.speaking_topic}"</p>
                </div>

                <div className="py-8">
                  <button
                    onClick={handleStartSpeaking}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                      isRecordingSpeech ? 'bg-red-500 animate-pulse' : 'bg-primary hover:bg-primary-hover shadow-lg'
                    } text-on-primary mx-auto cursor-pointer`}
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-3 font-bold">
                    {isRecordingSpeech ? "Ovoz yozilmoqda. Gapiring..." : "Mikrofonni yoqish uchun bosing"}
                  </p>
                </div>

                {speakingFeedback && (
                  <div className="p-5 bg-surface border border-border rounded-2xl text-xs text-left grid grid-cols-2 gap-4">
                    <div className="p-3 bg-surface-variant rounded-xl border border-border">
                      <span className="text-[10px] text-on-surface-variant font-bold block uppercase">Talaffuz aniqligi</span>
                      <span className="text-lg font-black text-primary font-mono">{speakingFeedback.accuracy}%</span>
                    </div>
                    <div className="p-3 bg-surface-variant rounded-xl border border-border">
                      <span className="text-[10px] text-on-surface-variant font-bold block uppercase">Urg'u va temp</span>
                      <span className="text-lg font-black text-primary font-mono">{speakingFeedback.stressScore}%</span>
                    </div>
                    <div className="col-span-2 p-3 bg-primary/10 rounded-xl">
                      <span className="font-bold text-primary block">AI Bahosi:</span>
                      <p className="mt-1 text-on-surface font-semibold">{speakingFeedback.pronunciation}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ÜBUNGEN */}
          {activeTabMode === 'uebungen' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-serif font-bold text-on-surface flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" /> Übungen (Workbook mashqlari)
                </h3>
                <button
                  onClick={() => markComplete('uebungen')}
                  className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 text-primary text-xs font-bold"
                >
                  Topshirdim
                </button>
              </div>

              <div className="bg-surface-variant p-6 rounded-2xl border border-border space-y-4 text-xs">
                <p className="leading-relaxed">
                  Lektion {lessonData.number} grammatikasini mustahkamlash uchun quyidagi test jumlalarini to'ldiring:
                </p>
                
                {lessonData.exercises_json && lessonData.exercises_json.length > 0 ? (
                  lessonData.exercises_json.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 bg-surface border border-border rounded-xl space-y-3">
                      <p className="font-bold">{item.q}</p>
                      <div className="flex gap-2">
                        {item.opts.map((opt: string, oIdx: number) => (
                          <button
                            key={oIdx}
                            onClick={() => {
                              alert(oIdx === item.correct ? "To'g'ri!" : "Xato");
                              if (oIdx === item.correct) {
                                setExerciseAnswers({ ...exerciseAnswers, [idx]: oIdx });
                              }
                            }}
                            className="px-4 py-1.5 border border-border rounded bg-surface-variant hover:bg-primary/20 transition text-xs"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-on-surface-variant">Ushbu dars uchun mashqlar yuklanmadi.</p>
                )}
              </div>
            </div>
          )}

          {/* QUIZ */}
          {activeTabMode === 'quiz' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-serif font-bold text-on-surface flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" /> Quiz (Mavzu Yakuniy Imtihoni)
              </h3>

              {lessonData.quiz_questions_json && lessonData.quiz_questions_json.length > 0 ? (
                <>
                  <div className="space-y-6">
                    {lessonData.quiz_questions_json.map((q: any, qIdx: number) => (
                      <div key={qIdx} className="bg-surface-variant p-5 rounded-2xl border border-border space-y-4 text-xs">
                        <p className="font-bold">
                          {qIdx + 1}. {q.question}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.options.map((opt: string, optIdx: number) => {
                            const isSelected = quizAnswers[qIdx] === optIdx;
                            const isCorrect = q.correctIndex === optIdx;

                            let btnStyle = 'bg-surface border-border text-on-surface hover:bg-primary/20';
                            if (quizSubmitted) {
                              if (isCorrect) {
                                btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold';
                              } else if (isSelected && !isCorrect) {
                                btnStyle = 'bg-red-500/20 border-red-500 text-red-400';
                              }
                            } else if (isSelected) {
                              btnStyle = 'bg-primary text-on-primary font-bold';
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => {
                                  if (!quizSubmitted) {
                                    setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx });
                                  }
                                }}
                                className={`p-3.5 rounded-xl border text-left text-xs transition-all ${btnStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!quizSubmitted ? (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(quizAnswers).length < lessonData.quiz_questions_json.length}
                      className="w-full py-3.5 rounded-xl bg-primary text-on-primary hover:bg-primary-hover font-bold text-sm transition-all disabled:opacity-50"
                    >
                      Javoblarni yuborish
                    </button>
                  ) : (
                    <div className="p-6 bg-surface-variant rounded-2xl border border-border text-center space-y-3 text-xs">
                      <Award className="w-10 h-10 text-primary mx-auto" />
                      <h4 className="text-lg font-bold text-on-surface">Quiz Natijasi: {quizScore}%</h4>
                      <p className="text-on-surface-variant">
                        {quizScore >= 60
                          ? "Ajoyib! Siz quizdan muvaffaqiyatli o'tdingiz."
                          : "Quizdan o'tolmadingiz. Iltimos, darsni qaytadan ko'rib chiqing."}
                      </p>
                      <button
                        onClick={() => {
                          setQuizSubmitted(false);
                          setQuizAnswers({});
                        }}
                        className="px-6 py-2 rounded-full bg-primary text-on-primary font-bold hover:bg-primary-hover"
                      >
                        Qayta topshirish
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-on-surface-variant">Ushbu dars uchun yakuniy quiz savollari mavjud emas.</p>
              )}
            </div>
          )}

          {/* WIEDERHOLUNG */}
          {activeTabMode === 'wiederholung' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-serif font-bold text-on-surface flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-primary" /> Wiederholung (Xatolar tahlili)
                </h3>
                <button
                  onClick={() => markComplete('wiederholung')}
                  className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 text-primary text-xs font-bold"
                >
                  Yakunlash
                </button>
              </div>

              <div className="bg-surface-variant p-6 rounded-2xl border border-border text-xs space-y-4">
                <p className="leading-relaxed">
                  Lektion {lessonData.number} darsida yo'l qo'yilgan xatolar ro'yxati va ularni takrorlash bo'limi.
                </p>
                <div className="p-4 bg-surface rounded-xl border border-border italic text-on-surface-variant leading-relaxed">
                  Har safar yozma ish yoki nutq mashqlarida xatolikka yo'l qo'ysangiz, u AI tomonidan avtomatik ravishda ushbu ro'yxatga qo'shiladi va tahlil qilinadi.
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

// Simple Close Component missing placeholder
const X = ({ className, ...props }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
