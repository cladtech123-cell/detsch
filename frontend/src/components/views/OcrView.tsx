import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UploadCloud, ScanText, FileText, Sparkles, Loader2, Plus, Check, History, Award, CheckCircle } from 'lucide-react';
import { Language, VocabWord } from '../../types';
import { i18nTranslations } from '../../data/i18n';
import { apiService } from '../../lib/services';

interface OcrViewProps {
  lang: Language;
  onAddVocab: (word: any) => void;
}

export const OcrView: React.FC<OcrViewProps> = ({ lang, onAddVocab }) => {
  const t = (key: string) => i18nTranslations[lang][key] || key;
  const queryClient = useQueryClient();

  const [activeSubTab, setActiveSubTab] = useState<'classroom' | 'homework'>('classroom');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Homework state
  const [homeworkTitle, setHomeworkTitle] = useState('');
  const [homeworkText, setHomeworkText] = useState('');
  const [hwFile, setHwFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const ocrMutation = useMutation({
    mutationFn: (formData: FormData) => apiService.uploadOCRImport(formData),
    onSuccess: (data) => {
      alert(lang === 'uz' 
        ? `Tahlil yakunlandi! Yangi so'zlar: ${data.added_vocabulary.length} ta, yangi grammatika: ${data.added_grammar.length} ta` 
        : `Analyse beendet! Neue Vokabeln: ${data.added_vocabulary.length}`);
      queryClient.invalidateQueries({ queryKey: ['vocabulary-all'] });
      queryClient.invalidateQueries({ queryKey: ['grammar-all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setSelectedFile(null);
      setPreviewUrl(null);
    },
    onError: (err: any) => {
      alert(err.message || 'Xatolik yuz berdi.');
    }
  });

  const handleUploadClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    const fd = new FormData();
    fd.append('file', selectedFile);
    ocrMutation.mutate(fd);
  };

  // Homework submissions history
  const { data: homeworkHistory = [], isLoading: loadingHwHistory } = useQuery({
    queryKey: ['homework-history'],
    queryFn: apiService.getHomeworkHistory,
    enabled: activeSubTab === 'homework',
  });

  // Submit Homework Mutation
  const homeworkMutation = useMutation({
    mutationFn: (formData: FormData) => apiService.uploadHomework(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework-history'] });
      setHomeworkTitle('');
      setHomeworkText('');
      setHwFile(null);
      alert(lang === 'uz' ? "Uy vazifasi tekshirish uchun yuborildi va baholandi!" : "Hausaufgabe bewertet!");
    },
    onError: (err: any) => {
      alert(err.message || 'Xatolik');
    }
  });

  const handleHomeworkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeworkTitle.trim()) return;
    const fd = new FormData();
    fd.append('title', homeworkTitle);
    if (homeworkText.trim()) {
      fd.append('homework_text', homeworkText);
    }
    if (hwFile) {
      fd.append('file', hwFile);
    }
    homeworkMutation.mutate(fd);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-on-surface flex items-center gap-2">
          <ScanText className="w-6 h-6 text-primary" />
          <span>Hujjatlar tahlili va Uy vazifalarini baholash</span>
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">Sinf materiallarini skanerlang yoki uy ishlarini tekshirishga yuboring.</p>
      </div>

      {/* Sub-Tabs */}
      <div className="flex gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveSubTab('classroom')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
            activeSubTab === 'classroom'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface hover:bg-surface-variant text-on-surface-variant'
          }`}
        >
          Sinf xonasi sinxronizatsiyasi (OCR)
        </button>
        <button
          onClick={() => setActiveSubTab('homework')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
            activeSubTab === 'homework'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface hover:bg-surface-variant text-on-surface-variant'
          }`}
        >
          Uy vazifasini baholash (Grader)
        </button>
      </div>

      {activeSubTab === 'classroom' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface border border-border rounded-[28px] p-6 space-y-4">
              <h3 className="font-serif font-bold text-base text-on-surface flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-primary" />
                <span>Material yuklash</span>
              </h3>

              <form onSubmit={handleUploadClassroom} className="space-y-4">
                <label className="border-2 border-dashed border-border hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-surface-variant group">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <ScanText className="w-10 h-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold text-on-surface">Rasmni yoki PDF faylni tanlang</p>
                  <p className="text-[11px] text-on-surface-variant mt-1">PNG, JPG, PDF (Max 10MB)</p>
                </label>

                {selectedFile && (
                  <div className="p-3 bg-surface-variant border border-border rounded-xl text-xs flex justify-between items-center text-on-surface">
                    <span className="font-mono truncate">{selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="text-red-400 font-bold hover:underline"
                    >
                      O'chirish
                    </button>
                  </div>
                )}

                {previewUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-border max-h-48">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedFile || ocrMutation.isPending}
                  className="w-full py-3.5 bg-primary hover:bg-primary-hover text-on-primary font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
                >
                  {ocrMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Skanerlanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Ma'lumotlarni tahlil qilish</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7 bg-surface border border-border rounded-[28px] p-6">
            <h3 className="text-base font-serif font-bold text-on-surface mb-3">Tahlil jarayoni haqida</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Sinf o'quv materiallari, doska surati yoki darslik sahifasini PDF ko'rinishida yuklang.
              Tizim undan avtomatik ravishda yangi nemischa so'zlarni hamda grammatika qoidalarini aniqlab,
              sizning shaxsiy ma'lumotlar bazangizga saqlaydi.
            </p>
          </div>
        </div>
      )}

      {activeSubTab === 'homework' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Submit form */}
          <div className="lg:col-span-5 bg-surface border border-border p-6 rounded-[28px] space-y-4">
            <h3 className="font-serif font-bold text-base text-on-surface">Vazifa topshirish</h3>
            
            <form onSubmit={handleHomeworkSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-semibold text-on-surface-variant">Vazifa sarlavhasi *</label>
                <input
                  type="text"
                  required
                  value={homeworkTitle}
                  onChange={(e) => setHomeworkTitle(e.target.value)}
                  placeholder="z.B. Mein Hobby Essay"
                  className="w-full bg-surface-variant border border-border rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-on-surface-variant">Insho yoki Matn</label>
                <textarea
                  rows={4}
                  value={homeworkText}
                  onChange={(e) => setHomeworkText(e.target.value)}
                  placeholder="Matnni shu yerga yozing..."
                  className="w-full bg-surface-variant border border-border rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-on-surface-variant">Rasm shaklida yuklash (ixtiyoriy)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setHwFile(e.target.files?.[0] || null)}
                  className="w-full"
                />
              </div>

              <button
                type="submit"
                disabled={homeworkMutation.isPending || !homeworkTitle.trim()}
                className="w-full py-3.5 bg-primary text-on-primary hover:bg-primary-hover rounded-xl font-bold uppercase tracking-wider transition flex items-center justify-center gap-2"
              >
                {homeworkMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Baholanmoqda...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Tekshirishga yuborish</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* History */}
          <div className="lg:col-span-7 bg-surface border border-border rounded-[28px] p-6 space-y-4">
            <h3 className="text-base font-serif font-bold text-on-surface flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <span>Avvalgi natijalar</span>
            </h3>

            {loadingHwHistory ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : homeworkHistory.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic">Vazifalar hali yuborilmagan.</p>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-none">
                {homeworkHistory.map((sub: any) => (
                  <div key={sub.id} className="p-4 rounded-2xl bg-surface-variant border border-border space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-on-surface">{sub.title}</h4>
                        <span className="text-[10px] text-on-surface-variant">
                          {new Date(sub.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-sm bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/20">
                        <Award className="w-4 h-4" />
                        <span>Baholash: {sub.score}%</span>
                      </div>
                    </div>

                    {sub.corrections_json && (
                      <div className="pt-2 border-t border-border/50 space-y-1.5 text-on-surface-variant">
                        <p className="font-semibold text-on-surface">Grammatika tahlili:</p>
                        <p className="italic leading-relaxed">{sub.corrections_json.feedback || sub.corrections_json.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
