import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Volume2, Star, Plus } from 'lucide-react';
import { apiService } from '@/lib/services';

interface Word {
  id: number;
  german: string;
  translation: string;
  lesson: string;
  category: string;
}

export function FlashcardsPage() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Nomen' | 'Verb' | 'Adjektiv'>('All');
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [starredCards, setStarredCards] = useState<Record<number, boolean>>({});

  const { data: words = [], isLoading, isError } = useQuery<Word[]>({
    queryKey: ['vocabulary-all'],
    queryFn: apiService.getVocabulary,
  });

  const toggleFlip = (id: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleStar = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setStarredCards((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const playAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="font-label-md text-on-surface-variant">Lernkarten werden geladen...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-error/20 bg-error/5 p-8 text-center max-w-xl mx-auto">
        <AlertCircle className="mx-auto text-error mb-4" size={48} />
        <h3 className="text-xl font-bold text-on-surface">Ladefehler</h3>
        <p className="text-sm text-on-surface-variant mt-2">Die Wortschatz-Lernkarten konnten nicht geladen werden.</p>
      </div>
    );
  }

  // Filter words
  const filteredWords = words.filter((w) => {
    if (selectedFilter === 'All') return true;
    return w.category.toLowerCase().trim() === selectedFilter.toLowerCase().trim();
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Filters Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex flex-wrap items-center gap-2 bg-surface-container-high p-1.5 rounded-full border border-outline-variant">
          {(['All', 'Nomen', 'Verb', 'Adjektiv'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-5 py-1.5 rounded-full font-bold text-xs transition-all ${
                selectedFilter === filter 
                  ? 'bg-primary text-on-primary shadow-sm' 
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              {filter === 'All' ? 'Alle' : filter}
            </button>
          ))}
        </div>

        <div className="text-xs text-on-surface-variant font-medium">
          Zeigt <strong>{filteredWords.length}</strong> von <strong>{words.length}</strong> Wörtern
        </div>
      </div>

      {/* Progress banner */}
      <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="flex-1 w-full">
          <div className="flex justify-between items-center mb-2">
            <span className="font-label-md text-xs text-primary font-bold">Tagesziel: 25 Wörter</span>
            <span className="font-label-md text-xs text-on-surface-variant font-medium">18 / 25 gelernt</span>
          </div>
          <div className="w-full bg-outline-variant/30 h-2.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-1000" style={{ width: '72%' }}></div>
          </div>
        </div>
        <div className="flex gap-6 shrink-0">
          <div className="text-center px-4 border-r border-outline-variant">
            <p className="font-headline-md text-lg font-black text-on-surface">{words.length}</p>
            <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Gesamt</p>
          </div>
          <div className="text-center px-4">
            <p className="font-headline-md text-lg font-black text-tertiary">85%</p>
            <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Meisterung</p>
          </div>
        </div>
      </div>

      {/* Flashcards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredWords.map((word) => {
          const isFlipped = flippedCards[word.id] || false;
          const isStarred = starredCards[word.id] || false;

          return (
            <div 
              key={word.id} 
              className={`group relative perspective-1000 h-[320px] ${
                isFlipped ? 'flashcard-flipped' : ''
              }`}
              onClick={() => toggleFlip(word.id)}
            >
              <div className="flashcard-inner relative w-full h-full duration-500 cursor-pointer rounded-3xl shadow-sm border border-outline-variant hover:border-primary hover:shadow-md transition-all">
                
                {/* Front Side */}
                <div className="flashcard-front absolute inset-0 w-full h-full bg-white rounded-3xl p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="bg-primary-fixed text-on-primary-fixed text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {word.lesson} • {word.category}
                    </span>
                    <button 
                      onClick={(e) => toggleStar(e, word.id)}
                      className={`transition-colors active:scale-90 ${
                        isStarred ? 'text-amber-500' : 'text-on-surface-variant hover:text-amber-500'
                      }`}
                    >
                      <Star size={18} fill={isStarred ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  
                  <div className="text-center flex-1 flex flex-col justify-center">
                    <h3 className="text-2xl font-black text-on-surface mb-1">
                      {word.german}
                    </h3>
                    <p className="text-on-surface-variant text-xs italic font-medium opacity-70">
                      Klicken zum Wenden
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <button 
                      onClick={(e) => playAudio(e, word.german)}
                      className="w-12 h-12 rounded-full bg-slate-50 text-primary border border-slate-200 flex items-center justify-center hover:bg-primary-container hover:text-on-primary hover:border-primary-container transition-all active:scale-90 shadow-sm"
                      title="Audio anhören"
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Back Side */}
                <div className="flashcard-back absolute inset-0 w-full h-full bg-primary text-on-primary rounded-3xl p-6 flex flex-col justify-between">
                  <div className="text-center flex-1 flex flex-col justify-center gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold mb-1">Übersetzung</p>
                      <h3 className="text-2xl font-bold">{word.translation}</h3>
                    </div>
                    <div className="h-[1px] bg-white/20 w-12 mx-auto"></div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold mb-2">Beispiel</p>
                      <p className="font-body-md text-sm italic leading-relaxed text-white/95">
                        "{word.german} ist sehr wichtig."
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })}

        {/* Add Card placeholder */}
        <div 
          onClick={() => navigate('/vocabulary')}
          className="group relative h-[320px] rounded-3xl border-2 border-dashed border-outline-variant hover:border-primary hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-primary border border-slate-200 group-hover:scale-110 transition-transform shadow-sm">
            <Plus size={24} />
          </div>
          <p className="font-label-md text-sm text-on-surface-variant font-bold">Neue Karte hinzufügen</p>
        </div>

      </div>
    </div>
  );
}
