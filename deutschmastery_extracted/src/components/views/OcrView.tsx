import React, { useState } from 'react';
import { UploadCloud, ScanText, FileText, Sparkles, Loader2, Plus, Check } from 'lucide-react';
import { Language, OcrResultData, VocabWord } from '../../types';
import { i18nTranslations } from '../../data/i18n';

interface OcrViewProps {
  lang: Language;
  onAddVocab: (word: VocabWord) => void;
}

export const OcrView: React.FC<OcrViewProps> = ({ lang, onAddVocab }) => {
  const t = (key: string) => i18nTranslations[lang][key] || key;

  const [pastedText, setPastedText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResultData | null>(null);
  const [addedWordsMap, setAddedWordsMap] = useState<Record<string, boolean>>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!pastedText.trim() && !selectedImage) return;

    setIsAnalyzing(true);
    setOcrResult(null);

    try {
      const res = await fetch('/api/ocr-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage || undefined,
          textContent: pastedText || undefined,
          targetLanguage: lang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOcrResult(data);
      } else {
        throw new Error('OCR API Error');
      }
    } catch {
      // Fallback OCR result
      setOcrResult({
        extractedText:
          pastedText ||
          "Wir müssen nachhaltige Lösungen für unsere Energieversorgung finden. Neue Herausforderungen erfordern beschleunigte Maßnahmen.",
        translation:
          "Energiya ta'minotimiz uchun barqaror yechimlarni topishimiz kerak. Yangi qiyinchiliklar tezlashtirilgan chora-tadbirlarni talab qiladi.",
        cefrLevel: "B2 Upper Intermediate",
        vocabularyList: [
          {
            word: "die Energieversorgung",
            translation: "energiya ta'minoti",
            context: "unsere Energieversorgung",
            type: "noun",
          },
          {
            word: "erfordern",
            translation: "talab qilmoq",
            context: "erfordern beschleunigte Maßnahmen",
            type: "verb",
          },
          {
            word: "die Maßnahme",
            translation: "chora-tadbir",
            context: "beschleunigte Maßnahmen",
            type: "noun",
          },
        ],
        grammarNotes: [
          "Satz 1 verwendet das Modalverb 'müssen' auf Position 2 und den Infinitiv 'finden' am Satzende.",
          "Satz 2 nutzt das Partizip I 'beschleunigte' als attributives Adjektiv vor dem Nomen.",
        ],
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddWordToList = (item: { word: string; translation: string }) => {
    const newWordItem: VocabWord = {
      id: `ocr_${Date.now()}_${Math.random()}`,
      word: item.word,
      translation: {
        uz: item.translation,
        ru: item.translation,
        en: item.translation,
        de: item.word,
      },
      category: 'B2',
      exampleGerman: ocrResult?.extractedText || item.word,
      exampleTranslation: {
        uz: item.translation,
        ru: item.translation,
        en: item.translation,
        de: item.word,
      },
      isMastered: false,
    };

    onAddVocab(newWordItem);
    setAddedWordsMap((prev) => ({ ...prev, [item.word]: true }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-[#1a1a1a]">{t('ocr.title')}</h2>
        <p className="text-sm text-[#5c5c52] mt-1">{t('ocr.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload & Input Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-[28px] p-6 space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1a1a1a] flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-[#5A5A40]" />
              <span>Rasm yuklash</span>
            </h3>

            <label className="border-2 border-dashed border-[#e8e8e0] hover:border-[#5A5A40] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#f8f8f5] group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <ScanText className="w-10 h-10 text-[#5A5A40] mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-semibold text-[#1a1a1a]">{t('ocr.drag_drop')}</p>
              <p className="text-[11px] text-[#71716b] mt-1">PNG, JPG, WEBP (Max 10MB)</p>
            </label>

            {selectedImage && (
              <div className="relative rounded-2xl overflow-hidden border border-[#e8e8e0] max-h-48 bg-[#f5f5f0]">
                <img
                  src={selectedImage}
                  alt="Selected text scan"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          <div className="glass-card rounded-[28px] p-6 space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1a1a1a] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#5A5A40]" />
              <span>{t('ocr.paste_text')}</span>
            </h3>

            <textarea
              rows={5}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Wir müssen nachhaltige Lösungen für unsere Energieversorgung finden..."
              className="w-full bg-[#f8f8f5] border border-[#e8e8e0] rounded-2xl p-4 text-xs text-[#2d2d2d] placeholder-[#71716b]/50 focus:outline-none focus:border-[#5A5A40]"
            />

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!selectedImage && !pastedText.trim())}
              className="w-full py-3.5 rounded-2xl bg-[#5A5A40] text-white font-bold text-xs hover:bg-[#4a4a34] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Matn OCR tahlil qilinmoqda...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t('ocr.analyze_btn')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* OCR Result View */}
        <div className="lg:col-span-7 glass-card rounded-[28px] p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#e8e8e0]">
            <h3 className="font-serif font-bold text-lg text-[#1a1a1a]">OCR va Linqvistik Tahlil</h3>
            {ocrResult && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#e9edc9] text-[#5A5A40] border border-[#ccd5ae]">
                {ocrResult.cefrLevel}
              </span>
            )}
          </div>

          {ocrResult ? (
            <div className="space-y-6 animate-fade-in">
              {/* Extracted German Text */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                  Olingan Nemischa Matn
                </span>
                <p className="p-4 bg-[#f8f8f5] border border-[#e8e8e0] rounded-2xl text-xs md:text-sm text-[#1a1a1a] font-medium leading-relaxed font-mono">
                  "{ocrResult.extractedText}"
                </p>
              </div>

              {/* Translation */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#8a531f] uppercase tracking-wider">
                  Tarjima
                </span>
                <p className="p-4 bg-[#faedcd] border border-[#D4A373]/30 rounded-2xl text-xs md:text-sm text-[#1a1a1a] leading-relaxed">
                  {ocrResult.translation}
                </p>
              </div>

              {/* Discovered Vocabulary */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                  Topilgan Lug'at Boyligi (Vocabulary)
                </span>
                <div className="space-y-2">
                  {ocrResult.vocabularyList.map((v, idx) => {
                    const isAdded = addedWordsMap[v.word];
                    return (
                      <div
                        key={idx}
                        className="p-3.5 bg-[#f8f8f5] border border-[#e8e8e0] rounded-2xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-[#1a1a1a]">{v.word}</p>
                          <p className="text-[#5c5c52] italic text-[11px]">{v.translation}</p>
                        </div>

                        <button
                          onClick={() => handleAddWordToList(v)}
                          disabled={isAdded}
                          className={`px-3 py-1.5 rounded-full font-semibold text-[11px] flex items-center gap-1.5 transition-all ${
                            isAdded
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-white border border-[#e8e8e0] text-[#5A5A40] hover:bg-[#e9edc9]'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Qo'shildi</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Lug'atga qo'shish</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grammar Notes */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                  Grammatik Izohlar
                </span>
                <ul className="space-y-2">
                  {ocrResult.grammarNotes.map((note, idx) => (
                    <li
                      key={idx}
                      className="p-3 bg-[#f8f8f5] border border-[#e8e8e0] rounded-xl text-xs text-[#5c5c52] flex items-start gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-[#5A5A40] shrink-0 mt-0.5" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-[#71716b] space-y-3">
              <ScanText className="w-12 h-12 mx-auto text-[#5A5A40]" />
              <p className="text-xs">Rasm yuklang yoki nemischa matn kiriting va "Matnni Tahlil Qilish" tugmasini bosing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
