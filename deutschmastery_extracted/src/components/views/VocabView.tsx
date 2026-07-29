import React, { useState } from 'react';
import { Search, Volume2, Plus, RotateCw, CheckCircle2, Bookmark, X } from 'lucide-react';
import { Language, VocabWord } from '../../types';
import { i18nTranslations } from '../../data/i18n';

interface VocabViewProps {
  vocabList: VocabWord[];
  setVocabList: React.Dispatch<React.SetStateAction<VocabWord[]>>;
  lang: Language;
}

export const VocabView: React.FC<VocabViewProps> = ({ vocabList, setVocabList, lang }) => {
  const t = (key: string) => i18nTranslations[lang][key] || key;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);

  // New word form state
  const [newWord, setNewWord] = useState('');
  const [newArticle, setNewArticle] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newCategory, setNewCategory] = useState<'B1' | 'B2' | 'Daily'>('B2');
  const [newExample, setNewExample] = useState('');

  const speak = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'de-DE';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleMastered = (id: string) => {
    setVocabList((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isMastered: !v.isMastered } : v))
    );
  };

  const handleAddWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord || !newTranslation) return;

    const created: VocabWord = {
      id: `v_${Date.now()}`,
      word: newWord,
      article: newArticle || undefined,
      translation: {
        uz: newTranslation,
        ru: newTranslation,
        en: newTranslation,
        de: newWord,
      },
      category: newCategory,
      exampleGerman: newExample || `${newWord} ist wichtig.`,
      exampleTranslation: {
        uz: newTranslation,
        ru: newTranslation,
        en: newTranslation,
        de: newWord,
      },
      isMastered: false,
    };

    setVocabList([created, ...vocabList]);
    setShowAddModal(false);
    setNewWord('');
    setNewArticle('');
    setNewTranslation('');
    setNewExample('');
  };

  const filteredWords = vocabList.filter((v) => {
    const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory;
    const matchesSearch =
      v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.translation[lang] || v.translation.uz).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#1a1a1a]">{t('vocab.page_title')}</h2>
          <p className="text-sm text-[#5c5c52] mt-1">{t('vocab.page_subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#5A5A40] text-white px-6 py-2.5 rounded-full font-semibold text-xs hover:bg-[#4a4a34] transition-all shadow-md flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('vocab.add_word')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#71716b] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('vocab.search_placeholder')}
            className="w-full bg-white border border-[#e8e8e0] rounded-full pl-11 pr-4 py-2.5 text-xs text-[#2d2d2d] placeholder-[#71716b]/60 focus:outline-none focus:border-[#5A5A40]"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['All', 'B1', 'B2', 'Daily'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#5A5A40] text-white shadow-sm'
                  : 'bg-white text-[#5c5c52] border border-[#e8e8e0] hover:bg-[#f8f8f5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Flashcards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWords.map((v) => {
          const isFlipped = flippedCards[v.id];
          return (
            <div
              key={v.id}
              className={`glass-card rounded-[28px] p-6 relative flex flex-col justify-between min-h-[200px] transition-all duration-300 ${
                v.isMastered ? 'border-emerald-500/30 bg-[#e9edc9]/30' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#e9edc9] text-[#3a3a2a] border border-[#ccd5ae]">
                  {v.category}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => speak(v.word)}
                    className="p-1.5 rounded-lg text-[#71716b] hover:text-[#5A5A40] hover:bg-[#f8f8f5] transition-colors"
                    title={t('vocab.listen')}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleMastered(v.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      v.isMastered ? 'text-emerald-700 bg-emerald-100' : 'text-[#71716b] hover:text-[#2d2d2d]'
                    }`}
                    title="Mastered toggle"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Content */}
              <div className="my-auto py-2">
                {!isFlipped ? (
                  <div className="space-y-1">
                    <h4 className="text-xl font-serif font-bold text-[#1a1a1a]">
                      {v.article ? <span className="text-[#5A5A40] font-sans font-medium">{v.article} </span> : ''}
                      {v.word}
                    </h4>
                    {v.phonetic && <p className="text-xs text-[#71716b] font-mono">{v.phonetic}</p>}
                  </div>
                ) : (
                  <div className="space-y-2 animate-fade-in">
                    <p className="text-lg font-serif font-bold text-[#8a531f]">
                      {v.translation[lang] || v.translation.uz}
                    </p>
                    <p className="text-xs text-[#5c5c52] leading-relaxed bg-[#f8f8f5] p-2.5 rounded-xl border border-[#e8e8e0]">
                      "{v.exampleGerman}"
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer Action */}
              <div className="pt-4 border-t border-[#e8e8e0] flex justify-between items-center text-xs">
                <span className="text-[#71716b] text-[11px]">
                  {isFlipped ? 'Nemischa misol' : 'Tarjimasini ko\'rish'}
                </span>
                <button
                  onClick={() => toggleFlip(v.id)}
                  className="flex items-center gap-1.5 text-[#5A5A40] font-semibold hover:underline"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{t('vocab.flip_card')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e8e8e0] rounded-3xl max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-[#f8f8f5] text-[#5c5c52] hover:text-[#1a1a1a]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-bold text-[#1a1a1a]">{t('vocab.add_word')}</h3>

            <form onSubmit={handleAddWordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-[#5c5c52] mb-1 font-medium">Artikl (ixtiyoriy: der, die, das)</label>
                <input
                  type="text"
                  value={newArticle}
                  onChange={(e) => setNewArticle(e.target.value)}
                  placeholder="die"
                  className="w-full bg-[#f8f8f5] border border-[#e8e8e0] rounded-xl px-4 py-2 text-xs text-[#2d2d2d] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#5c5c52] mb-1 font-medium">Nemischa so'z *</label>
                <input
                  type="text"
                  required
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Verhandlung"
                  className="w-full bg-[#f8f8f5] border border-[#e8e8e0] rounded-xl px-4 py-2 text-xs text-[#2d2d2d] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#5c5c52] mb-1 font-medium">Tarjimasi *</label>
                <input
                  type="text"
                  required
                  value={newTranslation}
                  onChange={(e) => setNewTranslation(e.target.value)}
                  placeholder="muzokara"
                  className="w-full bg-[#f8f8f5] border border-[#e8e8e0] rounded-xl px-4 py-2 text-xs text-[#2d2d2d] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#5c5c52] mb-1 font-medium">Daraja / Kategoriya</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-[#f8f8f5] border border-[#e8e8e0] rounded-xl px-4 py-2 text-xs text-[#2d2d2d] focus:outline-none focus:border-[#5A5A40]"
                >
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="Daily">Daily</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#5c5c52] mb-1 font-medium">Misol gap (nemischa)</label>
                <input
                  type="text"
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  placeholder="Die Verhandlung verlief erfolgreich."
                  className="w-full bg-[#f8f8f5] border border-[#e8e8e0] rounded-xl px-4 py-2 text-xs text-[#2d2d2d] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#5A5A40] text-white font-bold text-xs hover:bg-[#4a4a34] transition-all pt-3 mt-4 shadow-sm"
              >
                Qo'shish
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
