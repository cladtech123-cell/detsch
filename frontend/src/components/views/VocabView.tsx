import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Volume2, Plus, RotateCw, CheckCircle2, X, Sparkles, Loader2, Award, Zap } from 'lucide-react';
import { Language, VocabWord } from '../../types';
import { i18nTranslations } from '../../data/i18n';
import { apiService } from '../../lib/services';

interface VocabViewProps {
  vocabList: VocabWord[];
  lang: Language;
}

type StudyMode = 'flashcard' | 'multiple_choice' | 'reverse_quiz' | 'typing' | 'article' | 'listening' | 'match' | 'speed_challenge';

export const VocabView: React.FC<VocabViewProps> = ({ vocabList, lang }) => {
  const t = (key: string) => i18nTranslations[lang][key] || key;
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'review' | 'list' | 'add'>('review');
  const [addSubTab, setAddSubTab] = useState<'single' | 'bulk'>('single');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Single Word form state
  const [newWord, setNewWord] = useState('');
  const [newArticle, setNewArticle] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newLevel, setNewLevel] = useState('B2');
  const [generatingExample, setGeneratingExample] = useState(false);

  // Bulk Import state
  const [bulkText, setBulkText] = useState('');

  // Immersive session state
  const [studyMode, setStudyMode] = useState<StudyMode>('flashcard');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionIdx, setSessionIdx] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  
  // Quiz states
  const [showAnswer, setShowAnswer] = useState(false);
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<string[]>([]);
  const [typingInput, setTypingInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

  // Match Game details
  const [matchPairs, setMatchPairs] = useState<{ id: string; text: string; type: 'de' | 'uz' }[]>([]);
  const [selectedDe, setSelectedDe] = useState<string | null>(null);
  const [selectedUz, setSelectedUz] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);

  // Speed Challenge details
  const [speedTranslation, setSpeedTranslation] = useState('');
  const [speedIsCorrectOption, setSpeedIsCorrectOption] = useState(true);
  const [timeLeft, setTimeLeft] = useState(5);

  // Load user progress to determine active lesson number
  const { data: progress } = useQuery({
    queryKey: ['progress'],
    queryFn: apiService.getProgress,
  });
  const currentLessonNumber = progress?.current_lesson || 7;

  // Load due vocabulary
  const { data: dueWords = [], isLoading: loadingDue } = useQuery<any[]>({
    queryKey: ['vocabulary-due'],
    queryFn: apiService.getDueVocabulary,
    enabled: activeTab === 'review',
  });

  // Filter words so that vocabulary comes only from the active lesson
  const activeLessonVocab = vocabList.filter(
    (v: any) => v.lesson_number === currentLessonNumber || v.lesson === `Lektion ${currentLessonNumber}`
  );

  const filteredDue = dueWords.filter(
    (v: any) => v.lesson_number === currentLessonNumber || v.lesson === `Lektion ${currentLessonNumber}`
  );

  const finalWords = filteredDue.length > 0 
    ? filteredDue 
    : (activeLessonVocab.length > 0 ? activeLessonVocab : vocabList);

  const effectiveWords = studyMode === 'article'
    ? finalWords.filter((v: any) => 
        v.part_of_speech === 'noun' || 
        (v.article && ['der', 'die', 'das'].includes(v.article.toLowerCase())) ||
        ['der ', 'die ', 'das '].some(prefix => v.german.toLowerCase().startsWith(prefix))
      )
    : finalWords;

  const speak = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'de-DE';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleGenerateExample = async () => {
    if (!newWord || !newTranslation) return;
    setGeneratingExample(true);
    try {
      const data = await apiService.generateVocabExample(newWord, newTranslation);
      setNewExample(data.example_sentence || '');
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingExample(false);
    }
  };

  const addWordMutation = useMutation({
    mutationFn: (data: any) => apiService.addVocabulary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary-all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setNewWord('');
      setNewArticle('');
      setNewTranslation('');
      setNewExample('');
      alert(lang === 'uz' ? "So'z muvaffaqiyatli qo'shildi!" : "Wort hinzugefügt!");
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord || !newTranslation) return;
    addWordMutation.mutate({
      german: newArticle ? `${newArticle} ${newWord}` : newWord,
      translation: newTranslation,
      example_sentence: newExample || `${newWord} ist nützlich.`,
      cefr_level: newLevel,
      category: newCategory,
      lesson: 'Lektion 7',
    });
  };

  const bulkImportMutation = useMutation({
    mutationFn: (words: any[]) => apiService.bulkImportVocabulary(words),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary-all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setBulkText('');
      alert(lang === 'uz' ? "Barcha so'zlar import qilindi!" : "Bulk importiert!");
    },
  });

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n');
    const items = lines.map((line) => {
      const parts = line.split(/[=;]/);
      if (parts.length >= 2) {
        return {
          german: parts[0].trim(),
          translation: parts[1].trim(),
          example_sentence: parts[2]?.trim() || `${parts[0].trim()} ist wichtig.`,
          cefr_level: 'B2',
          category: 'General',
        };
      }
      return null;
    }).filter(Boolean);

    if (items.length > 0) {
      bulkImportMutation.mutate(items);
    }
  };

  const reviewMutation = useMutation({
    mutationFn: (data: { word_id: number; is_correct: boolean }) =>
      apiService.submitVocabReview(data.word_id, data.is_correct),
  });

  const initGameQuestion = (idx: number) => {
    if (effectiveWords.length === 0 || idx >= effectiveWords.length) return;
    const current = effectiveWords[idx];
    setShowAnswer(false);
    setTypingInput('');
    setSelectedOption(null);
    setAnswerChecked(false);

    if (studyMode === 'multiple_choice' || studyMode === 'listening') {
      const correct = current.translation;
      const filtered = vocabList.filter(v => v.german !== current.german).map(v => v.translation);
      const shuffled = [correct, ...filtered.slice(0, 3)].sort(() => Math.random() - 0.5);
      setMultipleChoiceOptions(shuffled);
      if (studyMode === 'listening') {
        speak(current.german);
      }
    } else if (studyMode === 'reverse_quiz') {
      const correct = current.german;
      const filtered = vocabList.filter(v => v.german !== current.german).map(v => v.german);
      const shuffled = [correct, ...filtered.slice(0, 3)].sort(() => Math.random() - 0.5);
      setMultipleChoiceOptions(shuffled);
    } else if (studyMode === 'article') {
      setMultipleChoiceOptions(['der', 'die', 'das']);
    } else if (studyMode === 'speed_challenge') {
      const isCorrectOption = Math.random() > 0.5;
      setSpeedIsCorrectOption(isCorrectOption);
      if (isCorrectOption) {
        setSpeedTranslation(current.translation);
      } else {
        const wrongWords = vocabList.filter(v => v.german !== current.german);
        const wrongTranslation = wrongWords.length > 0
          ? wrongWords[Math.floor(Math.random() * wrongWords.length)].translation
          : "noto'g'ri tarjima";
        setSpeedTranslation(wrongTranslation);
      }
      setTimeLeft(5);
    }
  };

  // Speed Challenge Countdown Effect
  useEffect(() => {
    let interval: any;
    if (isSessionActive && studyMode === 'speed_challenge' && !answerChecked && !sessionCompleted) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            checkAnswer('timeout');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, studyMode, sessionIdx, answerChecked, sessionCompleted]);

  const handleStartSession = () => {
    if (effectiveWords.length === 0) return;
    setIsSessionActive(true);
    setSessionIdx(0);
    setSessionCorrect(0);
    setSessionCompleted(false);
    
    if (studyMode === 'match') {
      const sliced = effectiveWords.slice(0, 5);
      const items: any[] = [];
      sliced.forEach((v) => {
        items.push({ id: v.id.toString(), text: v.german, type: 'de' });
        items.push({ id: v.id.toString(), text: v.translation, type: 'uz' });
      });
      setMatchPairs(items.sort(() => Math.random() - 0.5));
      setMatchedIds([]);
    } else {
      initGameQuestion(0);
    }
  };

  const handleNextQuestion = () => {
    const nextIdx = sessionIdx + 1;
    if (nextIdx >= effectiveWords.length) {
      setSessionCompleted(true);
    } else {
      setSessionIdx(nextIdx);
      initGameQuestion(nextIdx);
    }
  };

  const checkAnswer = (userAns: string) => {
    if (answerChecked) return;
    const current = effectiveWords[sessionIdx];
    let isCorrect = false;

    if (studyMode === 'flashcard') {
      isCorrect = true; 
    } else if (studyMode === 'multiple_choice' || studyMode === 'listening') {
      isCorrect = userAns.toLowerCase() === current.translation.toLowerCase();
    } else if (studyMode === 'reverse_quiz') {
      isCorrect = userAns.toLowerCase() === current.german.toLowerCase();
    } else if (studyMode === 'typing') {
      isCorrect = userAns.trim().toLowerCase() === current.german.toLowerCase();
    } else if (studyMode === 'article') {
      const cleanGerman = current.german.split(' ')[1] || current.german;
      const article = current.german.split(' ')[0] || '';
      isCorrect = userAns.toLowerCase() === article.toLowerCase();
    } else if (studyMode === 'speed_challenge') {
      if (userAns === 'timeout') {
        isCorrect = false;
      } else {
        const answeredTrue = userAns === 'true';
        isCorrect = answeredTrue === speedIsCorrectOption;
      }
    }

    setIsCorrectAnswer(isCorrect);
    if (isCorrect) setSessionCorrect(prev => prev + 1);
    setAnswerChecked(true);

    reviewMutation.mutate({
      word_id: current.id,
      is_correct: isCorrect,
    });
  };

  const selectMatch = (id: string, type: 'de' | 'uz') => {
    if (type === 'de') {
      setSelectedDe(id);
      if (selectedUz) {
        if (id === selectedUz) {
          setMatchedIds(prev => [...prev, id]);
          setSessionCorrect(prev => prev + 1);
        }
        setSelectedDe(null);
        setSelectedUz(null);
      }
    } else {
      setSelectedUz(id);
      if (selectedDe) {
        if (id === selectedDe) {
          setMatchedIds(prev => [...prev, id]);
          setSessionCorrect(prev => prev + 1);
        }
        setSelectedDe(null);
        setSelectedUz(null);
      }
    }
  };

  useEffect(() => {
    if (studyMode === 'match' && matchedIds.length === 5) {
      setSessionCompleted(true);
    }
  }, [matchedIds, studyMode]);

  const filteredWords = vocabList.filter((v) => {
    const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory;
    const matchesSearch =
      (v.german || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.translation || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in text-on-surface">
      {/* Tab selection */}
      <div className="flex justify-between items-center border-b border-border pb-3">
        <div className="flex gap-2">
          {(['review', 'list', 'add'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                activeTab === tab
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface hover:bg-surface-variant text-on-surface-variant'
              }`}
            >
              {tab === 'review' ? 'Mashq (Practice)' : tab === 'list' ? 'So\'zlar Ro\'yxati' : 'Yangi So\'z'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'review' && !isSessionActive && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-surface border border-border p-8 rounded-[28px] text-center space-y-6">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
              <Zap className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-serif font-bold text-on-surface">Algoritmlangan So'z Yodlash</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed max-w-md mx-auto">
                Leitner 5-box tizimi orqali nemis tili so'zlarini 8 xil interaktiv rejimda takrorlang va mustahkamlang.
              </p>
            </div>

            <div className="p-4 bg-surface-variant rounded-2xl border border-border max-w-sm mx-auto flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">Takrorlanadigan so'zlar:</span>
              <span className="font-bold text-primary text-sm">
                {dueWords.length > 0 ? `${dueWords.length} ta so'z` : `Hozircha barcha so'zlar takrorlandi (Umumiy: ${vocabList.length} ta)`}
              </span>
            </div>

            {/* Study Modes selectors */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Mashq Turini Tanlang</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'flashcard', label: 'Flashcard' },
                  { id: 'multiple_choice', label: 'Varaqlar' },
                  { id: 'reverse_quiz', label: 'Teskari' },
                  { id: 'typing', label: 'Typing' },
                  { id: 'article', label: 'Artikl' },
                  { id: 'listening', label: 'Eshitish' },
                  { id: 'match', label: 'Match' },
                  { id: 'speed_challenge', label: 'Tezlik' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setStudyMode(mode.id as StudyMode)}
                    className={`p-3 rounded-xl border text-center text-[10px] font-bold uppercase transition-all ${
                      studyMode === mode.id
                        ? 'bg-primary border-primary text-on-primary'
                        : 'bg-surface-variant border-border text-on-surface hover:border-primary/45'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartSession}
              disabled={effectiveWords.length === 0}
              className="w-full py-3.5 bg-primary text-on-primary hover:bg-primary-hover font-bold rounded-2xl text-xs uppercase tracking-wider transition disabled:opacity-40"
            >
              {dueWords.length > 0 ? "Mashqni boshlash" : "Umumiy mashqni boshlash"}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'review' && isSessionActive && !sessionCompleted && (
        <div className="max-w-2xl mx-auto bg-surface border border-border rounded-[28px] p-6 space-y-6">
          {/* Header Progress */}
          <div className="flex justify-between items-center border-b border-border pb-4 text-xs">
            <span className="text-on-surface-variant">
              Rejim: <strong className="uppercase text-primary">{studyMode}</strong>
            </span>
            <span className="font-bold">
              {studyMode === 'match' ? `${matchedIds.length}/5` : `${sessionIdx + 1}/${effectiveWords.length}`}
            </span>
          </div>

          {/* Matches Game view */}
          {studyMode === 'match' ? (
            <div className="grid grid-cols-2 gap-3 pt-2">
              {matchPairs.map((pair, idx) => {
                const isMatched = matchedIds.includes(pair.id);
                const isSelected = pair.type === 'de' ? selectedDe === pair.id : selectedUz === pair.id;
                return (
                  <button
                    key={idx}
                    disabled={isMatched}
                    onClick={() => selectMatch(pair.id, pair.type)}
                    className={`p-4 rounded-xl border text-center text-xs font-semibold transition ${
                      isMatched
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 opacity-40 line-through'
                        : isSelected
                        ? 'bg-primary border-primary text-on-primary'
                        : 'bg-surface-variant border-border hover:border-primary/45'
                    }`}
                  >
                    {pair.text}
                  </button>
                );
              })}
            </div>
          ) : studyMode === 'speed_challenge' ? (
            /* Speed Challenge View */
            <div className="space-y-6 text-center">
              <div className="flex justify-between items-center bg-surface-variant p-3.5 rounded-2xl border border-border">
                <span className="text-xs text-on-surface-variant font-medium">Vaqt qoldi:</span>
                <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${timeLeft <= 2 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-primary/20 text-primary'}`}>{timeLeft}s</span>
              </div>

              <div className="p-6 bg-surface-variant rounded-2xl border border-border space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Tarjima to'g'rimi?</span>
                <h4 className="text-2xl font-serif font-bold text-on-surface">{effectiveWords[sessionIdx]?.german}</h4>
                <p className="text-lg font-semibold text-primary">➔ {speedTranslation}</p>
              </div>

              {!answerChecked ? (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => checkAnswer('true')}
                    className="py-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold rounded-2xl text-xs uppercase"
                  >
                    ✔ To'g'ri
                  </button>
                  <button
                    onClick={() => checkAnswer('false')}
                    className="py-3.5 bg-red-500/15 border border-red-500/30 text-red-400 font-bold rounded-2xl text-xs uppercase"
                  >
                    ❌ Noto'g'ri
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className={`p-3.5 rounded-2xl text-xs font-bold ${
                    isCorrectAnswer ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {isCorrectAnswer ? "To'g'ri!" : `Noto'g'ri. Bu taklif etilgan tarjima ${speedIsCorrectOption ? "to'g'ri edi" : "noto'g'ri edi"}.`}
                  </div>
                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-3.5 bg-primary text-on-primary hover:bg-primary-hover font-bold rounded-2xl text-xs uppercase"
                  >
                    Keyingi savol
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Standard Quiz views */
            <div className="space-y-6">
              <div className="p-6 bg-surface-variant rounded-2xl border border-border text-center space-y-3 relative">
                {studyMode === 'listening' && (
                  <button
                    onClick={() => speak(effectiveWords[sessionIdx].german)}
                    className="p-3 bg-primary/20 text-primary border border-primary/30 rounded-full mx-auto flex items-center justify-center"
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                )}

                {!showAnswer && studyMode !== 'reverse_quiz' && studyMode !== 'listening' ? (
                  <h4 className="text-2xl font-serif font-bold">{effectiveWords[sessionIdx].german}</h4>
                ) : studyMode === 'reverse_quiz' ? (
                  <h4 className="text-xl font-serif font-bold text-primary">"{effectiveWords[sessionIdx].translation}"</h4>
                ) : (
                  <div className="space-y-2 animate-fade-in">
                    <h4 className="text-xl font-serif font-bold text-primary">{effectiveWords[sessionIdx].translation}</h4>
                    <p className="text-xs text-on-surface-variant font-mono">"{effectiveWords[sessionIdx].example_sentence}"</p>
                  </div>
                )}
              </div>

              {/* Action views */}
              {studyMode === 'flashcard' && (
                <div className="space-y-4">
                  {!showAnswer ? (
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="w-full py-3.5 bg-primary text-on-primary hover:bg-primary-hover font-bold rounded-2xl text-xs uppercase tracking-wider"
                    >
                      Tarjimasini ko'rish
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          checkAnswer('');
                          handleNextQuestion();
                        }}
                        className="py-3 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-xl text-xs uppercase"
                      >
                        Bilmadim
                      </button>
                      <button
                        onClick={() => {
                          setSessionCorrect(prev => prev + 1);
                          reviewMutation.mutate({ word_id: effectiveWords[sessionIdx].id, is_correct: true });
                          handleNextQuestion();
                        }}
                        className="py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-xl text-xs uppercase"
                      >
                        Bilar edim
                      </button>
                    </div>
                  )}
                </div>
              )}

              {(studyMode === 'multiple_choice' || studyMode === 'reverse_quiz' || studyMode === 'article' || studyMode === 'listening') && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {multipleChoiceOptions.map((opt, i) => {
                      const isSel = selectedOption === opt;
                      return (
                        <button
                          key={i}
                          disabled={answerChecked}
                          onClick={() => {
                            setSelectedOption(opt);
                            checkAnswer(opt);
                          }}
                          className={`p-3 rounded-xl border text-left text-xs transition ${
                            isSel
                              ? isCorrectAnswer 
                                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400' 
                                : 'bg-red-500/15 border-red-500 text-red-400'
                              : 'bg-surface border-border hover:bg-surface-variant'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {answerChecked && (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-3.5 bg-primary text-on-primary hover:bg-primary-hover font-bold rounded-2xl text-xs uppercase tracking-wider"
                    >
                      Keyingi savol
                    </button>
                  )}
                </div>
              )}

              {studyMode === 'typing' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={typingInput}
                    onChange={(e) => setTypingInput(e.target.value)}
                    disabled={answerChecked}
                    placeholder="Nemischa tarjimasini yozing..."
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none"
                  />

                  {!answerChecked ? (
                    <button
                      onClick={() => checkAnswer(typingInput)}
                      className="w-full py-3.5 bg-primary text-on-primary hover:bg-primary-hover font-bold rounded-2xl text-xs uppercase tracking-wider"
                    >
                      Javobni tekshirish
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className={`p-3 rounded-xl text-xs font-semibold ${
                        isCorrectAnswer ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {isCorrectAnswer ? "To'g'ri!" : `Noto'g'ri. To'g'ri javob: ${effectiveWords[sessionIdx].german}`}
                      </div>
                      <button
                        onClick={handleNextQuestion}
                        className="w-full py-3.5 bg-primary text-on-primary hover:bg-primary-hover font-bold rounded-2xl text-xs uppercase"
                      >
                        Keyingi savol
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isSessionActive && sessionCompleted && (
        <div className="max-w-md mx-auto bg-surface border border-border rounded-[28px] p-8 text-center space-y-6 animate-fade-in">
          <Award className="w-16 h-16 text-primary mx-auto animate-bounce" />
          <div className="space-y-2">
            <h3 className="text-2xl font-serif font-bold text-on-surface">Mashq Yakunlandi!</h3>
            <p className="text-xs text-on-surface-variant font-medium">Tizimdagi bilimlar bazasi va SuperMemo kartalari muvaffaqiyatli yangilandi.</p>
          </div>
          <div className="p-4 bg-surface-variant rounded-2xl border border-border flex justify-between items-center text-xs">
            <span>To'g'ri javoblar:</span>
            <span className="font-bold text-primary">{sessionCorrect} ta</span>
          </div>
          <button
            onClick={() => {
              setIsSessionActive(false);
              setSessionCompleted(false);
              queryClient.invalidateQueries({ queryKey: ['vocabulary-due'] });
            }}
            className="w-full py-3.5 bg-primary text-on-primary hover:bg-primary-hover font-bold rounded-2xl text-xs uppercase"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4.5 h-4.5 text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('vocab.search_placeholder')}
                className="w-full bg-surface border border-border rounded-full pl-11 pr-4 py-2.5 text-xs text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {['All', 'B1', 'B2', 'Daily', 'General'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-variant text-on-surface hover:bg-surface border border-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWords.map((v: any) => (
              <div
                key={v.id}
                className="bg-surface border border-border rounded-[28px] p-6 relative flex flex-col justify-between min-h-[180px] hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/20 uppercase">
                    {v.cefr_level || v.category}
                  </span>
                  <button
                    onClick={() => speak(v.german)}
                    className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="my-auto py-2">
                  <h4 className="text-lg font-serif font-bold text-on-surface">{v.german}</h4>
                  <p className="text-xs text-on-surface-variant mt-1 italic">{v.translation}</p>
                </div>

                <p className="text-[10px] text-on-surface-variant leading-relaxed bg-surface-variant p-2 rounded-xl border border-border/50 font-mono mt-3">
                  "{v.example_sentence}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'add' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-4xl mx-auto">
          {/* Sub-tab selection */}
          <div className="lg:col-span-12 flex gap-2 border-b border-border pb-2">
            <button
              onClick={() => setAddSubTab('single')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                addSubTab === 'single' ? 'bg-primary text-on-primary' : 'bg-surface text-on-surface-variant'
              }`}
            >
              Bittalab qo'shish
            </button>
            <button
              onClick={() => setAddSubTab('bulk')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                addSubTab === 'bulk' ? 'bg-primary text-on-primary' : 'bg-surface text-on-surface-variant'
              }`}
            >
              Ommaviy import (Bulk Parser)
            </button>
          </div>

          {addSubTab === 'single' ? (
            <div className="lg:col-span-8 bg-surface border border-border rounded-[28px] p-6 space-y-4">
              <h3 className="text-base font-serif font-bold text-on-surface">Yangi So'z Kiritish</h3>
              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 font-medium text-on-surface-variant">Artikl (optional)</label>
                    <input
                      type="text"
                      value={newArticle}
                      onChange={(e) => setNewArticle(e.target.value)}
                      placeholder="die, der, das"
                      className="w-full bg-surface-variant border border-border rounded-xl px-4 py-2.5 text-on-surface focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 font-medium text-on-surface-variant">Nemischa so'z *</label>
                    <input
                      type="text"
                      required
                      value={newWord}
                      onChange={(e) => setNewWord(e.target.value)}
                      placeholder="z.B. Herausforderung"
                      className="w-full bg-surface-variant border border-border rounded-xl px-4 py-2.5 text-on-surface focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 font-medium text-on-surface-variant">Tarjimasi *</label>
                  <input
                    type="text"
                    required
                    value={newTranslation}
                    onChange={(e) => setNewTranslation(e.target.value)}
                    placeholder="O'zbekcha tarjimasi"
                    className="w-full bg-surface-variant border border-border rounded-xl px-4 py-2.5 text-on-surface focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block mb-1.5 font-medium text-on-surface-variant">Misol Gap (Context Sentence)</label>
                    <input
                      type="text"
                      value={newExample}
                      onChange={(e) => setNewExample(e.target.value)}
                      placeholder="z.B. Das ist eine große Herausforderung."
                      className="w-full bg-surface-variant border border-border rounded-xl px-4 py-2.5 text-on-surface focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={generatingExample || !newWord}
                    onClick={handleGenerateExample}
                    className="mt-6 px-4 bg-primary/20 border border-primary/30 text-primary font-bold rounded-xl flex items-center justify-center gap-1 hover:bg-primary/30 transition disabled:opacity-40"
                  >
                    {generatingExample ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>AI yordamida yaratish</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-primary text-on-primary hover:bg-primary-hover font-bold rounded-xl text-xs uppercase"
                >
                  Ma'lumotlar bazasiga yozish
                </button>
              </form>
            </div>
          ) : (
            <div className="lg:col-span-8 bg-surface border border-border rounded-[28px] p-6 space-y-4">
              <h3 className="text-base font-serif font-bold text-on-surface">Ommaviy Import Qilish</h3>
              <p className="text-xs text-on-surface-variant">
                So'zlarni har bir qatorga bittadan quyidagi formatda kiriting:<br />
                <code>so'z = tarjima</code> yoki <code>so'z ; tarjima</code>
              </p>

              <form onSubmit={handleBulkSubmit} className="space-y-4 text-xs">
                <textarea
                  rows={6}
                  required
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Herausforderung = qiyinchilik&#10;nachhaltig = barqaror"
                  className="w-full bg-surface-variant border border-border rounded-xl px-4 py-2.5 text-on-surface focus:outline-none resize-none"
                />

                <button
                  type="submit"
                  className="w-full py-3.5 bg-primary text-on-primary hover:bg-primary-hover font-bold rounded-xl text-xs uppercase"
                >
                  Hammasini import qilish
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
