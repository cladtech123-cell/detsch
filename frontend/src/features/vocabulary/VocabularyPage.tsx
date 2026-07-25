import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Sparkles, 
  Check, 
  X, 
  Bookmark, 
  Volume2,
  Clock,
  Award
} from 'lucide-react';
import { apiService } from '@/lib/services';

interface Word {
  id: number;
  german: string;
  translation: string;
  example_sentence: string;
  cefr_level: string;
  lesson: string;
  category: string;
  box: number;
  next_review: string;
}

interface PreviewItem {
  german: string;
  translation: string;
  example_sentence: string;
  cefr_level: string;
  category: string;
  status: 'pending' | 'generating' | 'ready' | 'failed';
}

type StudyMode = 'flashcard' | 'multiple_choice' | 'reverse_quiz' | 'typing' | 'article' | 'listening' | 'match' | 'speed_challenge';

export function VocabularyPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'review' | 'list' | 'add'>('review');
  const [addSubTab, setAddSubTab] = useState<'single' | 'bulk'>('single');
  
  // Single Word Add state
  const [newGerman, setNewGerman] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [isGenerating, setIsGenerating] = useState(false);

  // Bulk Import state
  const [bulkInput, setBulkInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [previewList, setPreviewList] = useState<PreviewItem[]>([]);
  const [generateProgress, setGenerateProgress] = useState<number | null>(null);
  const [importProgress, setImportProgress] = useState<number | null>(null);
  const [importSummary, setImportSummary] = useState<{ imported: number; skipped: number; failed: number } | null>(null);

  // Learning System Configurations
  const [studyMode, setStudyMode] = useState<StudyMode>('flashcard');
  const [filterLesson, setFilterLesson] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMistakesOnly, setFilterMistakesOnly] = useState(false);
  
  // Immersive Session states
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [sessionIdx, setSessionIdx] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [sessionMaxStreak, setSessionMaxStreak] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [mistakeWordsTrack, setMistakeWordsTrack] = useState<Word[]>([]);
  
  // Mode gameplay details
  const [showAnswer, setShowAnswer] = useState(false); // Flashcards
  const [quizOptions, setQuizOptions] = useState<string[]>([]); // Multiple Choice / Reverse / Article
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'wrong' | null>(null);
  const [typingInput, setTypingInput] = useState(''); // Typing
  const [speedTimer, setSpeedTimer] = useState(60); // Speed Challenge
  const [speedIntervalId, setSpeedIntervalId] = useState<any | null>(null);

  // Match Mode gameplay details
  const [matchGermanWords, setMatchGermanWords] = useState<{ id: number; text: string }[]>([]);
  const [matchUzbekWords, setMatchUzbekWords] = useState<{ id: number; text: string }[]>([]);
  const [selectedGermanId, setSelectedGermanId] = useState<number | null>(null);
  const [selectedUzbekId, setSelectedUzbekId] = useState<number | null>(null);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [wrongMatchPair, setWrongMatchPair] = useState<{ germanId: number; uzbekId: number } | null>(null);

  const hasMissingTranslation = previewList.length > 0 && previewList.some(item => !item.translation.trim());

  // Automatically parse text on bulk paste
  React.useEffect(() => {
    if (!bulkInput.trim()) {
      setPreviewList([]);
      return;
    }
    const lines = bulkInput.split('\n');
    const parsedRaw: PreviewItem[] = [];
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      
      let german = '';
      let translation = '';
      
      if (line.includes('=')) {
        const parts = line.split('=');
        german = parts[0].trim();
        translation = parts[1].trim();
      } else if (line.includes(';')) {
        const parts = line.split(';');
        german = parts[0].trim();
        translation = parts[1].trim();
      } else {
        german = line;
        translation = '';
      }
      
      parsedRaw.push({
        german,
        translation,
        example_sentence: '',
        cefr_level: '',
        category: 'General',
        status: 'ready'
      });
    }
    setPreviewList(parsedRaw);
  }, [bulkInput]);

  // Queries
  const { data: allWords = [], isLoading: isLoadingAll } = useQuery<Word[]>({
    queryKey: ['vocabulary-all'],
    queryFn: apiService.getVocabulary,
    enabled: activeTab === 'list' || activeTab === 'review',
  });

  const { data: dueWords = [] } = useQuery<Word[]>({
    queryKey: ['vocabulary-due'],
    queryFn: apiService.getDueVocabulary,
    enabled: activeTab === 'review',
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: apiService.addVocabulary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary-all'] });
      queryClient.invalidateQueries({ queryKey: ['vocabulary-due'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setNewGerman('');
      setNewTranslation('');
      setNewExample('');
      setActiveTab('list');
    },
    onError: (err: any) => {
      alert(err.message || "Xatolik yuz berdi");
    }
  });

  // Generate example via AI
  const handleGenerateExample = async () => {
    if (!newGerman || !newTranslation) {
      alert("Avval so'z va tarjimasini kiriting!");
      return;
    }
    setIsGenerating(true);
    try {
      const data = await apiService.generateVocabExample(newGerman, newTranslation);
      setNewExample(`${data.example_de} (${data.example_uz})`);
    } catch (e) {
      console.error(e);
      setNewExample(`Ich lerne das Wort ${newGerman}.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGerman.trim() || !newTranslation.trim()) return;
    addMutation.mutate({
      german: newGerman,
      translation: newTranslation,
      example_sentence: newExample,
      cefr_level: 'A1',
      category: newCategory,
      lesson: 'Lektion 7'
    });
  };

  // Dynamic Distractor Generator
  const generateOptions = (word: Word, pool: Word[], field: 'translation' | 'german') => {
    const correct = word[field];
    const distractors = pool
      .filter(w => w.id !== word.id && w[field] !== correct)
      .map(w => w[field]);
    
    const shuffled = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);
    const finalOptions = [correct, ...shuffled].sort(() => 0.5 - Math.random());
    
    while (finalOptions.length < 4) {
      finalOptions.push(field === 'translation' ? "unbekannt (noma'lum)" : "unbekannt");
    }
    return finalOptions;
  };

  // Autoplay Voice and generate quiz options
  useEffect(() => {
    if (isSessionActive && sessionWords.length > 0 && sessionIdx < sessionWords.length) {
      const currentWord = sessionWords[sessionIdx];
      const pool = allWords.length > 0 ? allWords : dueWords;

      if (studyMode === 'multiple_choice' || studyMode === 'listening') {
        setQuizOptions(generateOptions(currentWord, pool, 'translation'));
      } else if (studyMode === 'reverse_quiz') {
        setQuizOptions(generateOptions(currentWord, pool, 'german'));
      } else if (studyMode === 'article') {
        setQuizOptions(['der', 'die', 'das']);
      }

      if (studyMode === 'listening' || studyMode === 'flashcard') {
        speakWord(currentWord.german);
      }
    }
  }, [sessionIdx, isSessionActive, studyMode, allWords, dueWords]);

  // Bulk Import Handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const name = file.name.toLowerCase();
      if (name.endsWith('.txt') || name.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setBulkInput(event.target?.result as string);
        };
        reader.readAsText(file);
      } else {
        alert("Faqat .txt yoki .csv fayllar qo'llab-quvvatlanadi!");
      }
    }
  };

  const handleGenerateData = async () => {
    const missingItems = previewList.filter(item => !item.translation.trim());
    if (missingItems.length === 0) return;

    setGenerateProgress(0);
    setImportSummary(null);

    const batchSize = 15;
    const completedList = [...previewList];

    for (let i = 0; i < missingItems.length; i += batchSize) {
      const batch = missingItems.slice(i, i + batchSize);
      
      for (const batchItem of batch) {
        const idx = completedList.findIndex(item => item.german === batchItem.german && !item.translation.trim());
        if (idx !== -1) {
          completedList[idx].status = 'generating';
        }
      }
      setPreviewList([...completedList]);

      try {
        const generatedBatch = await apiService.bulkGenerateVocabulary(
          batch.map(item => ({ german: item.german }))
        );
        
        for (let genItem of generatedBatch) {
          const idx = completedList.findIndex(
            item => item.german.toLowerCase() === genItem.german.toLowerCase() && item.status === 'generating'
          );
          if (idx !== -1) {
            completedList[idx] = {
              german: genItem.german,
              translation: genItem.translation || '',
              example_sentence: genItem.example_sentence || '',
              cefr_level: genItem.cefr_level || '',
              category: genItem.category || 'General',
              status: 'ready'
            };
          }
        }
      } catch (err) {
        console.error(err);
        for (const batchItem of batch) {
          const idx = completedList.findIndex(item => item.german === batchItem.german && item.status === 'generating');
          if (idx !== -1) {
            completedList[idx].status = 'failed';
          }
        }
      }

      for (const batchItem of batch) {
        const idx = completedList.findIndex(item => item.german === batchItem.german && item.status === 'generating');
        if (idx !== -1) {
          completedList[idx].status = 'ready';
        }
      }

      setGenerateProgress(Math.round(((i + batch.length) / missingItems.length) * 100));
      setPreviewList([...completedList]);
    }
    setGenerateProgress(null);
  };

  const handleImportAll = async () => {
    if (previewList.length === 0) return;
    setImportProgress(0);
    try {
      setImportProgress(30);
      const payloadWords = previewList.map(item => ({
        german: item.german,
        translation: item.translation,
        example_sentence: item.example_sentence,
        cefr_level: item.cefr_level,
        category: item.category,
        lesson: 'Lektion 7'
      }));

      setImportProgress(70);
      const res = await apiService.bulkImportVocabulary(payloadWords);
      setImportProgress(100);
      
      setImportSummary({
        imported: res.imported,
        skipped: res.skipped,
        failed: res.failed
      });

      queryClient.invalidateQueries({ queryKey: ['vocabulary-all'] });
      queryClient.invalidateQueries({ queryKey: ['vocabulary-due'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err: any) {
      alert("Import qilishda xatolik yuz berdi: " + (err.message || "noma'lum xato"));
    } finally {
      setTimeout(() => setImportProgress(null), 1000);
    }
  };

  const updatePreviewRow = (idx: number, field: keyof PreviewItem, value: string) => {
    setPreviewList(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value } as PreviewItem;
      return copy;
    });
  };

  // Browser Speech synthesis
  const speakWord = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    window.speechSynthesis.speak(utterance);
  };

  // Study Session Orchestration
  const startStudySession = (mode: StudyMode) => {
    let pool = activeTab === 'review' ? dueWords : allWords;
    if (pool.length === 0) pool = allWords;

    let filtered = [...pool];

    // Filter by Selected Lesson
    if (filterLesson !== 'all') {
      filtered = filtered.filter(w => w.lesson === filterLesson);
    }

    // Filter by Selected Category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(w => w.category === filterCategory);
    }

    // Filter by Mistakes Only (box 1 contains hard/incorrect cards)
    if (filterMistakesOnly) {
      filtered = filtered.filter(w => w.box === 1);
    }

    // Article quiz filters only words starting with der/die/das
    if (mode === 'article') {
      filtered = filtered.filter(w => /^(der|die|das)\s/i.test(w.german));
    }

    if (filtered.length === 0) {
      alert("Tanlangan filtrlarga mos so'zlar topilmadi!");
      return;
    }

    // Shuffle
    filtered = filtered.sort(() => 0.5 - Math.random());

    if (mode === 'match' && filtered.length < 2) {
      alert("Match Mode uchun kamida 2 ta so'z bo'lishi kerak!");
      return;
    }

    setStudyMode(mode);
    setSessionWords(filtered);
    setSessionIdx(0);
    setSessionXP(0);
    setSessionStreak(0);
    setSessionMaxStreak(0);
    setSessionCorrect(0);
    setSessionWrong(0);
    setSessionStartTime(Date.now());
    setSessionCompleted(false);
    setMistakeWordsTrack([]);
    setIsSessionActive(true);

    if (mode === 'match') {
      initMatchMode(filtered);
    } else if (mode === 'speed_challenge') {
      startSpeedTimer();
    }
  };

  const startSpeedTimer = () => {
    setSpeedTimer(60);
    const interval = setInterval(() => {
      setSpeedTimer(t => {
        if (t <= 1) {
          clearInterval(interval);
          endStudySession();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    setSpeedIntervalId(interval);
  };

  const endStudySession = () => {
    if (speedIntervalId) {
      clearInterval(speedIntervalId);
      setSpeedIntervalId(null);
    }
    setSessionCompleted(true);
  };

  // Submit Answer Action
  const handleAnswerSelect = (option: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(option);

    const currentWord = sessionWords[sessionIdx];
    let isCorrect = false;

    if (studyMode === 'multiple_choice' || studyMode === 'listening' || studyMode === 'speed_challenge') {
      isCorrect = option === currentWord.translation;
    } else if (studyMode === 'reverse_quiz') {
      isCorrect = option === currentWord.german;
    } else if (studyMode === 'article') {
      const match = currentWord.german.match(/^(der|die|das)\s/i);
      const correctArticle = match ? match[1].toLowerCase() : '';
      isCorrect = option.toLowerCase() === correctArticle;
    }

    if (isCorrect) {
      setAnswerStatus('correct');
      setSessionXP(xp => xp + 10);
      setSessionStreak(s => {
        const next = s + 1;
        if (next > sessionMaxStreak) setSessionMaxStreak(next);
        return next;
      });
      setSessionCorrect(c => c + 1);
      apiService.submitVocabReview(currentWord.id, true).catch(err => console.error(err));
    } else {
      setAnswerStatus('wrong');
      setSessionXP(xp => Math.max(0, xp - 2));
      setSessionStreak(0);
      setSessionWrong(w => w + 1);
      setMistakeWordsTrack(prev => [...prev, currentWord]);
      apiService.submitVocabReview(currentWord.id, false).catch(err => console.error(err));
    }

    setTimeout(() => {
      setSelectedOption(null);
      setAnswerStatus(null);
      if (sessionIdx + 1 >= sessionWords.length) {
        endStudySession();
      } else {
        setSessionIdx(idx => idx + 1);
      }
    }, 1000);
  };

  // Submit Typing Input
  const handleTypingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOption !== null || !typingInput.trim()) return;

    const currentWord = sessionWords[sessionIdx];
    const cleanInput = typingInput.trim().toLowerCase().replace(/\s+/g, ' ');
    const cleanTarget = currentWord.german.trim().toLowerCase().replace(/\s+/g, ' ');

    const isCorrect = cleanInput === cleanTarget;
    setSelectedOption(typingInput);

    if (isCorrect) {
      setAnswerStatus('correct');
      setSessionXP(xp => xp + 10);
      setSessionStreak(s => {
        const next = s + 1;
        if (next > sessionMaxStreak) setSessionMaxStreak(next);
        return next;
      });
      setSessionCorrect(c => c + 1);
      apiService.submitVocabReview(currentWord.id, true).catch(err => console.error(err));
    } else {
      setAnswerStatus('wrong');
      setSessionXP(xp => Math.max(0, xp - 2));
      setSessionStreak(0);
      setSessionWrong(w => w + 1);
      setMistakeWordsTrack(prev => [...prev, currentWord]);
      apiService.submitVocabReview(currentWord.id, false).catch(err => console.error(err));
    }

    setTimeout(() => {
      setSelectedOption(null);
      setAnswerStatus(null);
      setTypingInput('');
      if (sessionIdx + 1 >= sessionWords.length) {
        endStudySession();
      } else {
        setSessionIdx(idx => idx + 1);
      }
    }, 1800);
  };

  // Match Mode logic
  const initMatchMode = (words: Word[]) => {
    const batch = words.slice(0, 5);
    const german = batch.map(w => ({ id: w.id, text: w.german })).sort(() => 0.5 - Math.random());
    const uzbek = batch.map(w => ({ id: w.id, text: w.translation })).sort(() => 0.5 - Math.random());
    setMatchGermanWords(german);
    setMatchUzbekWords(uzbek);
    setMatchedIds([]);
    setSelectedGermanId(null);
    setSelectedUzbekId(null);
  };

  const handleMatchClick = (id: number, type: 'german' | 'uzbek') => {
    if (type === 'german') {
      setSelectedGermanId(id);
      if (selectedUzbekId !== null) {
        checkMatch(id, selectedUzbekId);
      }
    } else {
      setSelectedUzbekId(id);
      if (selectedGermanId !== null) {
        checkMatch(selectedGermanId, id);
      }
    }
  };

  const checkMatch = (gId: number, uId: number) => {
    if (gId === uId) {
      setMatchedIds(prev => [...prev, gId]);
      setSessionXP(xp => xp + 10);
      setSessionStreak(s => {
        const next = s + 1;
        if (next > sessionMaxStreak) setSessionMaxStreak(next);
        return next;
      });
      setSessionCorrect(c => c + 1);
      setSelectedGermanId(null);
      setSelectedUzbekId(null);
      
      const batchCount = Math.min(sessionWords.length - sessionIdx, 5);
      if (matchedIds.length + 1 >= batchCount) {
        const nextIdx = sessionIdx + 5;
        if (nextIdx >= sessionWords.length) {
          endStudySession();
        } else {
          setSessionIdx(nextIdx);
          initMatchMode(sessionWords.slice(nextIdx));
        }
      }
    } else {
      setWrongMatchPair({ germanId: gId, uzbekId: uId });
      setSessionXP(xp => Math.max(0, xp - 2));
      setSessionStreak(0);
      setSessionWrong(w => w + 1);
      setTimeout(() => {
        setWrongMatchPair(null);
        setSelectedGermanId(null);
        setSelectedUzbekId(null);
      }, 500);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header (Hidden when inside immersive study session) */}
      {!isSessionActive && (
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2">
              <Bookmark className="text-primary" /> Lug'at boyligi (Wortschatz)
            </h1>
            <p className="text-on-surface-variant text-xs mt-1">Gamified study modes, spaced repetition and Leitner box parameters.</p>
          </div>
          
          <div className="flex bg-white border border-slate-200 rounded-lg p-1">
            <button 
              onClick={() => { setActiveTab('review'); setSessionCompleted(false); }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'review' 
                  ? 'bg-primary text-on-surface' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Mashq qilish (Practice)
            </button>
            <button 
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'list' 
                  ? 'bg-primary text-on-surface' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Barcha so'zlar
            </button>
            <button 
              onClick={() => setActiveTab('add')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === 'add' 
                  ? 'bg-primary text-on-surface' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Yangi so'z
            </button>
          </div>
        </div>
      )}

      {/* Review Tab Panel */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          {/* 1. Immersive Session Active Screen */}
          {isSessionActive && !sessionCompleted && (
            <div className="border border-slate-200 bg-white border border-slate-200 p-6 rounded-3xl backdrop-blur-md space-y-6 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
              {/* Header indicators */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 gap-4">
                <button 
                  onClick={() => {
                    if (confirm("Mashqni yakunlamasdan chiqishni xohlaysizmi?")) {
                      setIsSessionActive(false);
                      if (speedIntervalId) {
                        clearInterval(speedIntervalId);
                        setSpeedIntervalId(null);
                      }
                    }
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-on-surface-variant hover:text-on-surface transition"
                  title="Mashqdan chiqish"
                >
                  <X size={15} />
                </button>

                {/* Progress bar */}
                <div className="flex-1 max-w-md bg-white h-2.5 rounded-full overflow-hidden border border-slate-100 mx-2">
                  <div 
                    className="bg-primary/50 h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${studyMode === 'match' 
                        ? (matchedIds.length / sessionWords.length) * 100 
                        : ((sessionIdx + (selectedOption !== null ? 1 : 0)) / sessionWords.length) * 100}%` 
                    }}
                  />
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs font-semibold font-mono">
                  {studyMode === 'speed_challenge' && (
                    <span className="text-red-400 flex items-center gap-1 font-bold animate-pulse">
                      ⏱️ {speedTimer}s
                    </span>
                  )}
                  <span className="text-amber-400">⭐ {sessionXP} XP</span>
                  <span className="text-orange-400">🔥 {sessionStreak}</span>
                </div>
              </div>

              {/* Mode Specific Gameplay */}
              <div className="min-h-[260px] flex flex-col justify-center items-center py-4">
                {/* Mode 1: Flashcards */}
                {studyMode === 'flashcard' && (
                  <div className="w-full text-center space-y-6">
                    <div className="space-y-3">
                      <span className="text-[9px] font-mono tracking-wider uppercase bg-primary/10 text-primary border border-outline-variant px-2 py-0.5 rounded-full">
                        {sessionWords[sessionIdx]?.category}
                      </span>
                      <h2 className="text-3xl font-extrabold text-on-surface tracking-tight flex items-center justify-center gap-2">
                        {sessionWords[sessionIdx]?.german}
                        <button 
                          onClick={() => speakWord(sessionWords[sessionIdx]?.german)}
                          className="p-1.5 rounded-lg bg-white border border-slate-100 hover:bg-slate-800 text-primary transition"
                        >
                          <Volume2 size={16} />
                        </button>
                      </h2>
                    </div>

                    {showAnswer ? (
                      <div className="space-y-4 animate-fade-in border-t border-slate-100 pt-5 mt-5">
                        <div>
                          <span className="block text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">O'zbekcha tarjimasi:</span>
                          <p className="text-xl font-bold text-on-surface mt-0.5">{sessionWords[sessionIdx]?.translation}</p>
                        </div>
                        {sessionWords[sessionIdx]?.example_sentence && (
                          <div className="max-w-md mx-auto bg-surface-container-low p-3 rounded-lg border border-slate-100 text-left text-xs leading-normal italic text-on-surface-variant">
                            {sessionWords[sessionIdx]?.example_sentence}
                          </div>
                        )}
                        
                        {/* Leitner Action buttons */}
                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-3">
                          <button 
                            onClick={() => {
                              setSessionWrong(w => w + 1);
                              setSessionStreak(0);
                              setSessionXP(xp => Math.max(0, xp - 2));
                              setMistakeWordsTrack(prev => [...prev, sessionWords[sessionIdx]]);
                              apiService.submitVocabReview(sessionWords[sessionIdx].id, false);
                              setShowAnswer(false);
                              if (sessionIdx + 1 >= sessionWords.length) endStudySession();
                              else setSessionIdx(idx => idx + 1);
                            }}
                            className="py-2.5 px-4 rounded-xl border border-red-500/20 bg-red-500/15 text-red-400 font-semibold text-xs hover:bg-red-500/25 transition flex items-center justify-center gap-1.5"
                          >
                            <X size={14} /> Esda yo'q (Wrong)
                          </button>
                          <button 
                            onClick={() => {
                              setSessionCorrect(c => c + 1);
                              setSessionXP(xp => xp + 10);
                              setSessionStreak(s => {
                                const next = s + 1;
                                if (next > sessionMaxStreak) setSessionMaxStreak(next);
                                return next;
                              });
                              apiService.submitVocabReview(sessionWords[sessionIdx].id, true);
                              setShowAnswer(false);
                              if (sessionIdx + 1 >= sessionWords.length) endStudySession();
                              else setSessionIdx(idx => idx + 1);
                            }}
                            className="py-2.5 px-4 rounded-xl border border-emerald-500/20 bg-emerald-500/15 text-emerald-400 font-semibold text-xs hover:bg-emerald-500/25 transition flex items-center justify-center gap-1.5"
                          >
                            <Check size={14} /> Yaxshi eslayman
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowAnswer(true)}
                        className="py-2.5 px-6 rounded-xl bg-primary hover:bg-primary/95 text-on-surface text-xs font-semibold shadow-lg shadow-indigo-600/15 transition"
                      >
                        Tarjimani ko'rish
                      </button>
                    )}
                  </div>
                )}

                {/* Mode 2: Multiple Choice / Mode 6: Listening Quiz / Mode 8: Speed Challenge */}
                {(studyMode === 'multiple_choice' || studyMode === 'listening' || studyMode === 'speed_challenge') && (
                  <div className="w-full space-y-6 text-center">
                    <div className="space-y-3">
                      <span className="text-[9px] font-mono tracking-wider uppercase bg-primary/10 text-primary border border-outline-variant px-2 py-0.5 rounded-full">
                        {studyMode === 'listening' ? 'Tinglang (Listen)' : 'Tarjimasini toping'}
                      </span>
                      <h2 className="text-3xl font-extrabold text-on-surface tracking-tight flex items-center justify-center gap-2">
                        {studyMode === 'listening' ? (
                          <button 
                            onClick={() => speakWord(sessionWords[sessionIdx]?.german)}
                            className="p-3 rounded-full bg-primary border border-outline-variant hover:bg-primary/95 text-on-surface transition flex items-center justify-center animate-pulse"
                          >
                            <Volume2 size={24} />
                          </button>
                        ) : (
                          sessionWords[sessionIdx]?.german
                        )}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
                      {quizOptions.map((option, idx) => {
                        const isCorrectOption = option === sessionWords[sessionIdx]?.translation;
                        const isSelected = option === selectedOption;
                        let btnStyle = "border-slate-200 bg-surface-container-low hover:border-slate-200 text-on-surface";
                        
                        if (selectedOption !== null) {
                          if (isCorrectOption) {
                            btnStyle = "border-emerald-500/30 bg-emerald-500/15 text-emerald-400";
                          } else if (isSelected) {
                            btnStyle = "border-red-500/30 bg-red-500/15 text-red-400";
                          } else {
                            btnStyle = "border-slate-100 bg-surface-container-low text-slate-600 opacity-60";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleAnswerSelect(option)}
                            disabled={selectedOption !== null}
                            className={`py-3 px-4 rounded-xl border text-xs font-semibold transition flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{option}</span>
                            {selectedOption !== null && isCorrectOption && <Check size={14} className="text-emerald-400" />}
                            {selectedOption !== null && isSelected && !isCorrectOption && <X size={14} className="text-red-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Mode 3: Reverse Quiz */}
                {studyMode === 'reverse_quiz' && (
                  <div className="w-full space-y-6 text-center">
                    <div className="space-y-3">
                      <span className="text-[9px] font-mono tracking-wider uppercase bg-primary/10 text-primary border border-outline-variant px-2 py-0.5 rounded-full">
                        Nemischa so'zni toping (German Translation)
                      </span>
                      <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">
                        {sessionWords[sessionIdx]?.translation}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
                      {quizOptions.map((option, idx) => {
                        const isCorrectOption = option === sessionWords[sessionIdx]?.german;
                        const isSelected = option === selectedOption;
                        let btnStyle = "border-slate-200 bg-surface-container-low hover:border-slate-200 text-on-surface";
                        
                        if (selectedOption !== null) {
                          if (isCorrectOption) {
                            btnStyle = "border-emerald-500/30 bg-emerald-500/15 text-emerald-400";
                          } else if (isSelected) {
                            btnStyle = "border-red-500/30 bg-red-500/15 text-red-400";
                          } else {
                            btnStyle = "border-slate-100 bg-surface-container-low text-slate-600 opacity-60";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleAnswerSelect(option)}
                            disabled={selectedOption !== null}
                            className={`py-3 px-4 rounded-xl border text-xs font-semibold font-mono transition flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{option}</span>
                            {selectedOption !== null && isCorrectOption && <Check size={14} className="text-emerald-400" />}
                            {selectedOption !== null && isSelected && !isCorrectOption && <X size={14} className="text-red-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Mode 4: Typing Mode */}
                {studyMode === 'typing' && (
                  <div className="w-full space-y-6 text-center max-w-md">
                    <div className="space-y-3">
                      <span className="text-[9px] font-mono tracking-wider uppercase bg-primary/10 text-primary border border-outline-variant px-2 py-0.5 rounded-full">
                        Nemischasini yozing (Type in German)
                      </span>
                      <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">
                        {sessionWords[sessionIdx]?.translation}
                      </h2>
                    </div>

                    <form onSubmit={handleTypingSubmit} className="space-y-3 pt-2">
                      <input 
                        type="text"
                        value={typingInput}
                        onChange={(e) => setTypingInput(e.target.value)}
                        disabled={selectedOption !== null}
                        placeholder="das Wort..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs text-on-surface placeholder-slate-650 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition text-center font-mono"
                        required
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={selectedOption !== null || !typingInput.trim()}
                        className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-on-surface text-xs font-semibold shadow-lg shadow-indigo-600/10 transition"
                      >
                        Tekshirish (Submit)
                      </button>
                    </form>

                    {/* Feedback spelling highlights */}
                    {answerStatus === 'correct' && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold animate-fade-in flex items-center justify-center gap-1.5">
                        <Check size={14} /> To'g'ri! Barakalla!
                      </div>
                    )}
                    {answerStatus === 'wrong' && (
                      <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-left text-xs text-red-300 space-y-1.5 animate-fade-in leading-relaxed">
                        <p className="font-semibold flex items-center gap-1">⚠️ To'g'ri yozilishi:</p>
                        <p className="font-mono text-sm text-on-surface font-bold bg-white/80 px-2 py-1.5 rounded border border-slate-100">
                          {sessionWords[sessionIdx]?.german}
                        </p>
                        <p className="text-[10px] text-on-surface-variant">Siz yozdingiz: <span className="font-mono text-red-400 line-through">{typingInput}</span></p>
                      </div>
                    )}
                  </div>
                )}

                {/* Mode 5: Article Quiz */}
                {studyMode === 'article' && (
                  <div className="w-full space-y-6 text-center">
                    <div className="space-y-3">
                      <span className="text-[9px] font-mono tracking-wider uppercase bg-primary/10 text-primary border border-outline-variant px-2 py-0.5 rounded-full">
                        Mos keladigan artiklni tanlang (Article selector)
                      </span>
                      <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">
                        ___ {sessionWords[sessionIdx]?.german.replace(/^(der|die|das)\s/i, '')}
                      </h2>
                      <p className="text-xs text-on-surface-variant italic">Tarjimasi: {sessionWords[sessionIdx]?.translation}</p>
                    </div>

                    <div className="flex gap-4 justify-center pt-2 max-w-sm mx-auto">
                      {quizOptions.map((option, idx) => {
                        const match = sessionWords[sessionIdx]?.german.match(/^(der|die|das)\s/i);
                        const correctArticle = match ? match[1].toLowerCase() : '';
                        const isCorrectOption = option.toLowerCase() === correctArticle;
                        const isSelected = option === selectedOption;
                        let btnStyle = "border-slate-200 bg-surface-container-low hover:border-slate-200 text-on-surface";
                        
                        if (selectedOption !== null) {
                          if (isCorrectOption) {
                            btnStyle = "border-emerald-500/30 bg-emerald-500/15 text-emerald-400";
                          } else if (isSelected) {
                            btnStyle = "border-red-500/30 bg-red-500/15 text-red-400";
                          } else {
                            btnStyle = "border-slate-100 bg-surface-container-low text-slate-650 opacity-60";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleAnswerSelect(option)}
                            disabled={selectedOption !== null}
                            className={`flex-1 py-3 px-4 rounded-xl border text-sm font-extrabold uppercase font-mono tracking-wider transition ${btnStyle}`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Mode 7: Match Mode */}
                {studyMode === 'match' && (
                  <div className="w-full space-y-6 pt-2">
                    <div className="text-center pb-2">
                      <span className="text-[9px] font-mono tracking-wider uppercase bg-primary/10 text-primary border border-outline-variant px-2 py-0.5 rounded-full">
                        Match words (Mos juftliklarni toping)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                      {/* German column */}
                      <div className="space-y-2">
                        {matchGermanWords.map((item) => {
                          const isMatched = matchedIds.includes(item.id);
                          const isSelected = selectedGermanId === item.id;
                          const isWrong = wrongMatchPair?.germanId === item.id;
                          
                          let cardStyle = "border-slate-200 bg-surface-container-low text-on-surface hover:border-slate-200";
                          if (isMatched) cardStyle = "border-emerald-500/10 bg-emerald-500/5 text-slate-650 line-through opacity-30 cursor-default";
                          else if (isWrong) cardStyle = "border-red-500/30 bg-red-500/20 text-red-400 animate-shake";
                          else if (isSelected) cardStyle = "border-primary bg-primary/10 text-primary ring-2 ring-indigo-500/20";

                          return (
                            <button
                              key={item.id}
                              onClick={() => !isMatched && handleMatchClick(item.id, 'german')}
                              disabled={isMatched}
                              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold font-mono text-left transition ${cardStyle}`}
                            >
                              {item.text}
                            </button>
                          );
                        })}
                      </div>

                      {/* Uzbek column */}
                      <div className="space-y-2">
                        {matchUzbekWords.map((item) => {
                          const isMatched = matchedIds.includes(item.id);
                          const isSelected = selectedUzbekId === item.id;
                          const isWrong = wrongMatchPair?.uzbekId === item.id;
                          
                          let cardStyle = "border-slate-200 bg-surface-container-low text-on-surface hover:border-slate-200";
                          if (isMatched) cardStyle = "border-emerald-500/10 bg-emerald-500/5 text-slate-650 line-through opacity-30 cursor-default";
                          else if (isWrong) cardStyle = "border-red-500/30 bg-red-500/20 text-red-400 animate-shake";
                          else if (isSelected) cardStyle = "border-primary bg-primary/10 text-primary ring-2 ring-indigo-500/20";

                          return (
                            <button
                              key={item.id}
                              onClick={() => !isMatched && handleMatchClick(item.id, 'uzbek')}
                              disabled={isMatched}
                              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold text-left transition ${cardStyle}`}
                            >
                              {item.text}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Session Completed End Screen */}
          {sessionCompleted && (
            <div className="border border-slate-200 bg-white border border-slate-200 p-8 rounded-2xl text-center space-y-6 max-w-md mx-auto backdrop-blur-md animate-scale-up">
              <div className="h-16 w-16 rounded-full bg-primary/10 border border-outline-variant text-primary flex items-center justify-center mx-auto animate-bounce">
                <Award size={32} />
              </div>
              
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-on-surface">Dars Yakunlandi!</h2>
                <p className="text-xs text-on-surface-variant">Yaxshi natija! Bilimingizni oshirishda davom eting.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div className="p-3 bg-white/60 rounded-xl border border-slate-100 flex flex-col justify-center">
                  <span className="text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">To'g'ri</span>
                  <span className="text-base font-extrabold text-emerald-400 mt-1">{sessionCorrect}</span>
                </div>
                <div className="p-3 bg-white/60 rounded-xl border border-slate-100 flex flex-col justify-center">
                  <span className="text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Xato</span>
                  <span className="text-base font-extrabold text-red-400 mt-1">{sessionWrong}</span>
                </div>
                <div className="p-3 bg-white/60 rounded-xl border border-slate-100 flex flex-col justify-center">
                  <span className="text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Aniqlik</span>
                  <span className="text-base font-extrabold text-primary mt-1">
                    {sessionCorrect + sessionWrong > 0 
                      ? Math.round((sessionCorrect / (sessionCorrect + sessionWrong)) * 100) 
                      : 100}%
                  </span>
                </div>
                <div className="p-3 bg-white/60 rounded-xl border border-slate-100 flex flex-col justify-center">
                  <span className="text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Sarflangan vaqt</span>
                  <span className="text-base font-extrabold text-blue-400 mt-1">
                    {Math.round((Date.now() - sessionStartTime) / 1000)}s
                  </span>
                </div>
                <div className="p-3 bg-white/60 rounded-xl border border-slate-100 flex flex-col justify-center">
                  <span className="text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Olingan XP</span>
                  <span className="text-base font-extrabold text-amber-400 mt-1">🔥 +{sessionXP} XP</span>
                </div>
                <div className="p-3 bg-white/60 rounded-xl border border-slate-100 flex flex-col justify-center">
                  <span className="text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Eng yaxshi Streak</span>
                  <span className="text-base font-extrabold text-orange-400 mt-1">⚡ {sessionMaxStreak}</span>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsSessionActive(false);
                    setSessionCompleted(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-on-surface-variant hover:border-slate-200 transition"
                >
                  Chiqish
                </button>
                {mistakeWordsTrack.length > 0 && (
                  <button
                    onClick={() => {
                      setSessionWords([...mistakeWordsTrack]);
                      setSessionIdx(0);
                      setSessionXP(0);
                      setSessionStreak(0);
                      setSessionMaxStreak(0);
                      setSessionCorrect(0);
                      setSessionWrong(0);
                      setSessionStartTime(Date.now());
                      setSessionCompleted(false);
                      setMistakeWordsTrack([]);
                      setStudyMode('multiple_choice');
                      setIsSessionActive(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-on-surface font-semibold text-xs transition"
                  >
                    Xatolarni takrorlash ({mistakeWordsTrack.length})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 3. Configuration Screen / Main dashboard */}
          {!isSessionActive && !sessionCompleted && (
            <div className="space-y-6">
              {/* Header configurator */}
              <div className="border border-slate-200 bg-white/30 p-5 rounded-2xl backdrop-blur-md flex flex-wrap gap-4 items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-on-surface">1. Mashq filtrlari (Study Options)</h3>
                  <p className="text-[10px] text-on-surface-variant">Mashq qiladigan so'zlarni guruhlar bo'yicha cheklang.</p>
                </div>
                
                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-on-surface-variant">Dars (Lesson)</label>
                    <select 
                      value={filterLesson} 
                      onChange={(e) => setFilterLesson(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-100 bg-white text-on-surface font-semibold focus:outline-none"
                    >
                      <option value="all">Barchasi (All)</option>
                      {Array.from(new Set(allWords.map(w => w.lesson))).map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-on-surface-variant">Turkum (Category)</label>
                    <select 
                      value={filterCategory} 
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-100 bg-white text-on-surface font-semibold focus:outline-none"
                    >
                      <option value="all">Barchasi (All)</option>
                      {Array.from(new Set(allWords.map(w => w.category))).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 pt-4">
                    <input 
                      type="checkbox" 
                      id="mistakes-only" 
                      checked={filterMistakesOnly}
                      onChange={(e) => setFilterMistakesOnly(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-200 bg-white text-indigo-650 focus:ring-primary/30"
                    />
                    <label htmlFor="mistakes-only" className="text-[10px] font-semibold text-on-surface-variant cursor-pointer">
                      Faqat qiyin so'zlar (Box 1)
                    </label>
                  </div>
                </div>
              </div>

              {/* Mode Selector Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-on-surface-variant">2. Mashq turini tanlang (Choose Mode)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Flashcard Mode */}
                  <button 
                    onClick={() => startStudySession('flashcard')}
                    className="p-5 border border-slate-200 bg-white border border-slate-200 rounded-2xl text-left hover:border-primary/50 hover:bg-white border border-slate-200 transition group space-y-3 relative overflow-hidden active:translate-y-[1px]"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary border border-outline-variant flex items-center justify-center">
                      <Bookmark size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">Flashcards</h4>
                      <p className="text-[10px] text-on-surface-variant mt-1 leading-normal">Klassik Leitner kartalari orqali so'zlarni faol eslash.</p>
                    </div>
                  </button>

                  {/* Multiple Choice Quiz */}
                  <button 
                    onClick={() => startStudySession('multiple_choice')}
                    className="p-5 border border-slate-200 bg-white border border-slate-200 rounded-2xl text-left hover:border-primary/50 hover:bg-white border border-slate-200 transition group space-y-3 relative overflow-hidden active:translate-y-[1px]"
                  >
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                      <Check size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface flex items-center gap-1">Multiple Choice ⭐</h4>
                      <p className="text-[10px] text-on-surface-variant mt-1 leading-normal">Nemischa so'zga mos o'zbekcha tarjimani variantlar orasidan tanlang.</p>
                    </div>
                  </button>

                  {/* Reverse Quiz */}
                  <button 
                    onClick={() => startStudySession('reverse_quiz')}
                    className="p-5 border border-slate-200 bg-white border border-slate-200 rounded-2xl text-left hover:border-primary/50 hover:bg-white border border-slate-200 transition group space-y-3 relative overflow-hidden active:translate-y-[1px]"
                  >
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">Reverse Quiz</h4>
                      <p className="text-[10px] text-on-surface-variant mt-1 leading-normal">O'zbekcha tarjimaga mos nemischa so'zni variantlar orasidan toping.</p>
                    </div>
                  </button>

                  {/* Typing Mode */}
                  <button 
                    onClick={() => startStudySession('typing')}
                    className="p-5 border border-slate-200 bg-white border border-slate-200 rounded-2xl text-left hover:border-primary/50 hover:bg-white border border-slate-200 transition group space-y-3 relative overflow-hidden active:translate-y-[1px]"
                  >
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                      <Plus size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">Typing Mode</h4>
                      <p className="text-[10px] text-on-surface-variant mt-1 leading-normal">So'zlar to'g'ri yozilishini klaviaturada kiriting (imlo xatolari tekshiriladi).</p>
                    </div>
                  </button>

                  {/* Article Quiz */}
                  <button 
                    onClick={() => startStudySession('article')}
                    className="p-5 border border-slate-200 bg-white border border-slate-200 rounded-2xl text-left hover:border-primary/50 hover:bg-white border border-slate-200 transition group space-y-3 relative overflow-hidden active:translate-y-[1px]"
                  >
                    <div className="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center">
                      <Award size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">Article Quiz</h4>
                      <p className="text-[10px] text-on-surface-variant mt-1 leading-normal">Ot so'zlarga mos artikllarni (der, die, das) aniqlang.</p>
                    </div>
                  </button>

                  {/* Listening Quiz */}
                  <button 
                    onClick={() => startStudySession('listening')}
                    className="p-5 border border-slate-200 bg-white border border-slate-200 rounded-2xl text-left hover:border-primary/50 hover:bg-white border border-slate-200 transition group space-y-3 relative overflow-hidden active:translate-y-[1px]"
                  >
                    <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                      <Volume2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">Listening Quiz</h4>
                      <p className="text-[10px] text-on-surface-variant mt-1 leading-normal">Nemischa talaffuzni tinglang va variantlar orasidan mos so'zni toping.</p>
                    </div>
                  </button>

                  {/* Match Mode */}
                  <button 
                    onClick={() => startStudySession('match')}
                    className="p-5 border border-slate-200 bg-white border border-slate-200 rounded-2xl text-left hover:border-primary/50 hover:bg-white border border-slate-200 transition group space-y-3 relative overflow-hidden active:translate-y-[1px]"
                  >
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                      <Check size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">Match Mode</h4>
                      <p className="text-[10px] text-on-surface-variant mt-1 leading-normal">Nemischa so'zlarni o'zbekcha tarjimalari bilan bir-biriga moslang.</p>
                    </div>
                  </button>

                  {/* Speed Challenge */}
                  <button 
                    onClick={() => startStudySession('speed_challenge')}
                    className="p-5 border border-slate-200 bg-white border border-slate-200 rounded-2xl text-left hover:border-primary/50 hover:bg-white border border-slate-200 transition group space-y-3 relative overflow-hidden active:translate-y-[1px]"
                  >
                    <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">Speed Challenge</h4>
                      <p className="text-[10px] text-on-surface-variant mt-1 leading-normal">60 soniya vaqt ichida imkon qadar ko'p so'zlarga tezkor javob bering.</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* List Tab Panel */}
      {activeTab === 'list' && (
        <div className="border border-slate-200 bg-white border border-slate-200 p-5 rounded-2xl backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-on-surface">So'zlar ro'yxati ({allWords.length} ta so'z)</h2>
            <span className="text-[10px] font-mono text-on-surface-variant">Alifbo tartibida saralangan</span>
          </div>

          {isLoadingAll ? (
            <div className="flex h-30 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : allWords.length === 0 ? (
            <div className="text-center py-10 text-on-surface-variant text-xs">
              Hali hech qanday so'z mavjud emas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 font-mono text-on-surface-variant">
                    <th className="py-2.5 px-3">Nemischa</th>
                    <th className="py-2.5 px-3">Tarjimasi</th>
                    <th className="py-2.5 px-3">Kategoriya</th>
                    <th className="py-2.5 px-3 text-center">Quti (Box)</th>
                    <th className="py-2.5 px-3 text-right">Navbatdagi takrorlash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {allWords.map((word) => (
                    <tr key={word.id} className="hover:bg-surface-container-low transition-all">
                      <td className="py-3 px-3 font-semibold text-on-surface flex items-center gap-1.5">
                        <button 
                          onClick={() => speakWord(word.german)}
                          className="p-1 rounded text-on-surface-variant hover:text-on-surface-variant"
                        >
                          <Volume2 size={12} />
                        </button>
                        {word.german}
                      </td>
                      <td className="py-3 px-3 text-on-surface-variant">{word.translation}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-on-surface-variant">
                          {word.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold border border-outline-variant">
                          Box {word.box}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-on-surface-variant font-mono">
                        {word.next_review === new Date().toISOString().slice(0,10) ? 'Bugun' : word.next_review}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Tab Panel */}
      {activeTab === 'add' && (
        <div className="border border-slate-200 bg-white border border-slate-200 p-6 rounded-2xl backdrop-blur-md max-w-3xl mx-auto space-y-6">
          <div className="flex border-b border-slate-200 pb-3 mb-2 gap-4">
            <button
              type="button"
              onClick={() => setAddSubTab('single')}
              className={`text-xs font-bold pb-1 transition border-b-2 ${
                addSubTab === 'single'
                  ? 'border-primary text-on-surface'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Yakka tartibda (Single Word)
            </button>
            <button
              type="button"
              onClick={() => setAddSubTab('bulk')}
              className={`text-xs font-bold pb-1 transition border-b-2 ${
                addSubTab === 'bulk'
                  ? 'border-primary text-on-surface'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Guruhli yuklash (Bulk Import)
            </button>
          </div>

          {/* Single Word Form */}
          {addSubTab === 'single' && (
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Plus size={18} className="text-primary" /> Yangi so'z qo'shish
              </h2>
              <p className="text-xs text-on-surface-variant">Yangi so'zni kiriting. Biz misol gapni AI orqali avtomatik hosil qilishimiz mumkin.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant">Nemischa so'z</label>
                  <input 
                    type="text" 
                    value={newGerman}
                    onChange={(e) => setNewGerman(e.target.value)}
                    placeholder="masalan: der Tisch"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-on-surface placeholder-slate-650 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant">O'zbekcha tarjimasi</label>
                  <input 
                    type="text" 
                    value={newTranslation}
                    onChange={(e) => setNewTranslation(e.target.value)}
                    placeholder="masalan: stol"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-on-surface placeholder-slate-650 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant">Kategoriya</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
                >
                  <option value="Nouns">Nouns (Otlar)</option>
                  <option value="Verbs">Verbs (Fe'llar)</option>
                  <option value="Adjectives">Adjectives (Sifatlar)</option>
                  <option value="Greetings">Greetings (Salomlashish)</option>
                  <option value="General">General (Umumiy)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant">Misol gap (Beispielsatz)</label>
                  <button 
                    type="button" 
                    onClick={handleGenerateExample}
                    disabled={isGenerating || !newGerman || !newTranslation}
                    className="text-[11px] text-primary hover:text-primary-fixed-dim font-semibold flex items-center gap-1 hover:underline disabled:opacity-50"
                  >
                    <Sparkles size={11} /> {isGenerating ? 'Yaratilmoqda...' : 'AI orqali yaratish'}
                  </button>
                </div>
                <textarea 
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  placeholder="masalan: Der Tisch ist sehr schön. (Stol juda chiroyli.)"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-on-surface placeholder-slate-650 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
                />
              </div>

              <button 
                type="submit"
                className="w-full mt-4 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/95 text-on-surface font-semibold text-xs tracking-wider transition shadow-lg shadow-indigo-600/10 disabled:opacity-50"
                disabled={addMutation.isPending || isGenerating}
              >
                {addMutation.isPending ? 'Saqlanmoqda...' : 'Lug\'atga qo\'shish'}
              </button>
            </form>
          )}

          {/* Bulk Import View */}
          {addSubTab === 'bulk' && (
            <div className="space-y-6">
              <input 
                type="file" 
                id="file-upload" 
                accept=".txt,.csv" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setBulkInput(event.target?.result as string);
                    };
                    reader.readAsText(file);
                  }
                }}
                className="hidden"
              />

              {/* Drag & Drop Zone */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${
                  isDragging 
                    ? 'border-primary bg-primary/50/5' 
                    : 'border-slate-855 bg-slate-955/40 hover:border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <p className="text-xs text-on-surface-variant">
                    Faylni bu yerga tashlang (<strong>Drag & drop</strong>) yoki yozma kiriting (faqat <strong>.txt</strong> yoki <strong>.csv</strong>)
                  </p>
                  <div className="flex justify-center gap-2 pt-1">
                    <label 
                      htmlFor="file-upload"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-on-surface-variant hover:border-slate-200 transition cursor-pointer"
                    >
                      Fayl tanlash
                    </label>
                  </div>
                </div>
              </div>

              {/* Bulk Text Area */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant">Yozma matn kiritish</label>
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="Format 1: Haus = Uy&#10;Format 2: Haus;Uy&#10;Format 3: Haus (Tarjimani AI bajaradi)"
                  rows={6}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-955 text-xs text-on-surface placeholder-slate-650 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition font-mono leading-relaxed"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setBulkInput(''); setPreviewList([]); setImportSummary(null); }}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-on-surface-variant hover:text-on-surface transition"
                >
                  Cancel (Bekor qilish)
                </button>
                {hasMissingTranslation && (
                  <button
                    type="button"
                    onClick={handleGenerateData}
                    disabled={!bulkInput.trim() || generateProgress !== null}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/95 text-on-surface font-semibold text-xs transition disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-indigo-600/10"
                  >
                    <Sparkles size={13} /> Generate Missing Data with AI (Sun'iy intellekt orqali tarjima)
                  </button>
                )}
              </div>

              {/* Generating Progress */}
              {generateProgress !== null && (
                <div className="space-y-2 border border-slate-200 bg-surface-container-low p-4 rounded-xl">
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-primary">
                    <span>Generating...</span>
                    <span>{generateProgress}%</span>
                  </div>
                  <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className="bg-primary/50 h-full rounded-full transition-all duration-300"
                      style={{ width: `${generateProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Importing Progress */}
              {importProgress !== null && (
                <div className="space-y-2 border border-slate-200 bg-surface-container-low p-4 rounded-xl">
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                    <span>Importing...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Summary message */}
              {importSummary && (
                <div className="p-4 rounded-2xl border border-outline-variant bg-primary/50/5 space-y-2 max-w-sm">
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Import yakunlandi:</h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-white/60 rounded-xl border border-slate-100">
                      <span className="block font-bold text-emerald-400">{importSummary.imported}</span>
                      <span className="text-[9px] text-on-surface-variant uppercase font-mono">Imported</span>
                    </div>
                    <div className="p-2 bg-white/60 rounded-xl border border-slate-100">
                      <span className="block font-bold text-amber-400">{importSummary.skipped}</span>
                      <span className="text-[9px] text-on-surface-variant uppercase font-mono">Skipped</span>
                    </div>
                    <div className="p-2 bg-white/60 rounded-xl border border-slate-100">
                      <span className="block font-bold text-red-400">{importSummary.failed}</span>
                      <span className="text-[9px] text-on-surface-variant uppercase font-mono">Failed</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Grid Table */}
              {previewList.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-on-surface-variant">Jadval tahriri (Preview)</h3>
                    <span className="text-[10px] text-on-surface-variant">So'zlarni bevosita jadval ichida tahrirlashingiz mumkin</span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-surface-container-low backdrop-blur-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 font-mono text-on-surface-variant bg-white border border-slate-200">
                          <th className="py-2.5 px-3">German (Nemischa)</th>
                          <th className="py-2.5 px-3">Translation (Tarjimasi)</th>
                          <th className="py-2.5 px-3">Example Sentence (Misol gap)</th>
                          <th className="py-2.5 px-3 w-28">Category</th>
                          <th className="py-2.5 px-3 w-20 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {previewList.map((item, idx) => (
                          <tr key={idx} className="hover:bg-surface-container-low transition-all">
                            <td className="p-2">
                              <input 
                                type="text"
                                value={item.german}
                                onChange={(e) => updatePreviewRow(idx, 'german', e.target.value)}
                                className="bg-transparent border border-transparent hover:border-slate-200 focus:border-primary rounded px-2 py-1 w-full text-on-surface focus:outline-none"
                              />
                            </td>
                            <td className="p-2">
                              <input 
                                type="text"
                                value={item.translation}
                                onChange={(e) => updatePreviewRow(idx, 'translation', e.target.value)}
                                className="bg-transparent border border-transparent hover:border-slate-200 focus:border-primary rounded px-2 py-1 w-full text-on-surface focus:outline-none"
                              />
                            </td>
                            <td className="p-2">
                              <input 
                                type="text"
                                value={item.example_sentence}
                                onChange={(e) => updatePreviewRow(idx, 'example_sentence', e.target.value)}
                                className="bg-transparent border border-transparent hover:border-slate-200 focus:border-primary rounded px-2 py-1 w-full text-on-surface-variant italic focus:outline-none"
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={item.category}
                                onChange={(e) => updatePreviewRow(idx, 'category', e.target.value)}
                                className="bg-transparent border border-transparent hover:border-slate-100 focus:border-primary rounded px-1.5 py-1 w-full text-on-surface-variant focus:outline-none"
                              >
                                <option value="Nouns">Nouns</option>
                                <option value="Verbs">Verbs</option>
                                <option value="Adjectives">Adjectives</option>
                                <option value="Greetings">Greetings</option>
                                <option value="General">General</option>
                              </select>
                            </td>
                            <td className="p-2 text-center">
                              {item.status === 'pending' && (
                                <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[9px] font-mono text-on-surface-variant">
                                  Pending
                                </span>
                              )}
                              {item.status === 'generating' && (
                                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold border border-outline-variant text-[9px] font-mono animate-pulse">
                                  Generating
                                </span>
                              )}
                              {item.status === 'ready' && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-[9px] font-mono">
                                  Ready
                                </span>
                              )}
                              {item.status === 'failed' && (
                                <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-bold border border-red-500/20 text-[9px] font-mono">
                                  Failed
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleImportAll}
                      disabled={previewList.some(i => i.status === 'generating') || importProgress !== null}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-on-surface font-semibold text-xs tracking-wider transition shadow-lg shadow-emerald-600/10 disabled:opacity-50"
                    >
                      Barchasini saqlash (Import All)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
