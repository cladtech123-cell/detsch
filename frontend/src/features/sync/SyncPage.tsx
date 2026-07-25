import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CloudUpload, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle, 
  Award, 
  History, 
  Cpu
} from 'lucide-react';
import { apiService } from '@/lib/services';

interface Homework {
  id: number;
  title: string;
  file_type: string;
  raw_content: string;
  score: number;
  corrections_json: {
    score: number;
    feedback: string;
    corrections: Array<{
      incorrect_segment: string;
      corrected_segment: string;
      explanation_uz: string;
      explanation_en: string;
      category: string;
    }>;
  };
  created_at: string;
}

export function SyncPage() {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'sync' | 'homework'>('sync');

  // OCR Sync state
  const [syncFile, setSyncFile] = useState<File | null>(null);
  const [syncTitle, setSyncTitle] = useState('Dars qaydlari');
  const [syncResult, setSyncResult] = useState<any>(null);

  // Homework state
  const [hwFile, setHwFile] = useState<File | null>(null);
  const [hwTitle, setHwTitle] = useState('Uy ishi');
  const [hwText, setHwText] = useState('');
  const [hwResult, setHwResult] = useState<any>(null);

  // Queries
  const { data: homeworks = [], isLoading: isLoadingHw } = useQuery<Homework[]>({
    queryKey: ['homework-history'],
    queryFn: apiService.getHomeworkHistory,
    enabled: activeSubTab === 'homework',
  });

  // Mutations
  const syncMutation = useMutation({
    mutationFn: (formData: FormData) => apiService.uploadOCRImport(formData),
    onSuccess: (res) => {
      setSyncResult(res);
      setSyncFile(null);
      // Invalidate queries to refresh dashboard statistics and vocabulary
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['vocabulary-all'] });
    },
    onError: (err: any) => {
      alert(err.message || "Tahlil qilishda xatolik yuz berdi");
    }
  });

  const hwMutation = useMutation({
    mutationFn: (formData: FormData) => apiService.uploadHomework(formData),
    onSuccess: (res) => {
      setHwResult(res.corrections_json);
      setHwFile(null);
      setHwText('');
      queryClient.invalidateQueries({ queryKey: ['homework-history'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['mistakes'] });
    },
    onError: (err: any) => {
      alert(err.message || "Tekshirishda xatolik yuz berdi");
    }
  });

  const handleSyncSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncFile) return;
    const formData = new FormData();
    formData.append('file', syncFile);
    formData.append('title', syncTitle);
    syncMutation.mutate(formData);
  };

  const handleHwSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwText.trim() && !hwFile) {
      alert("Iltimos, uy vazifasi matnini kiriting yoki rasm yuklang!");
      return;
    }
    const formData = new FormData();
    formData.append('title', hwTitle);
    if (hwFile) {
      formData.append('file', hwFile);
    }
    if (hwText) {
      formData.append('homework_text', hwText);
    }
    hwMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Tab select header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2">
            <CloudUpload className="text-primary" /> Darslarni sinxronlash va Uy ishlari
          </h1>
          <p className="text-on-surface-variant text-xs mt-1">Maktab darslarini import qilish va uy vazifalarini baholatish.</p>
        </div>

        <div className="flex bg-white border border-slate-200 rounded-lg p-1">
          <button 
            onClick={() => setActiveSubTab('sync')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
              activeSubTab === 'sync' 
                ? 'bg-primary text-on-surface' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Cpu size={14} /> Dars materialini o'qish (OCR)
          </button>
          <button 
            onClick={() => setActiveSubTab('homework')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
              activeSubTab === 'homework' 
                ? 'bg-primary text-on-surface' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <FileText size={14} /> Uy vazifasi tekshirgich
          </button>
        </div>
      </div>

      {/* Sync (OCR) Tab */}
      {activeSubTab === 'sync' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form container */}
          <div className="border border-slate-200 bg-white border border-slate-200 p-6 rounded-2xl backdrop-blur-md space-y-4">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <CloudUpload size={18} className="text-primary" />
              Sinf materiallarini yuklash
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Momente A1.1 darsligi kitoblari varog'ini, doskadagi yozuvlar rasmini yoki dars konspekti PDF-faylini yuklang. 
              Tizim undan so'zlar va grammatikani aniqlab, shaxsiy ma'lumotlar bazangizga qo'shadi.
            </p>

            <form onSubmit={handleSyncSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant">Dars nomi / Izoh</label>
                <input 
                  type="text" 
                  value={syncTitle}
                  onChange={(e) => setSyncTitle(e.target.value)}
                  placeholder="masalan: Dushanba kungi 7-dars konspekti"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-on-surface placeholder-slate-650 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant">Rasm yoki PDF tanlang</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-slate-200 bg-surface-container-low rounded-xl p-6 text-center cursor-pointer relative transition-all">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSyncFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2 flex flex-col items-center justify-center">
                    {syncFile ? (
                      <>
                        <CheckCircle className="text-emerald-400" size={30} />
                        <p className="text-xs text-on-surface font-semibold">{syncFile.name}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono">{(syncFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="text-slate-600" size={30} />
                        <p className="text-xs text-on-surface-variant font-medium">Faylni sudrab kelib tashlang yoki bosing</p>
                        <p className="text-[10px] text-on-surface-variant font-mono">Qo'llab-quvvatlanadi: JPG, PNG, PDF</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/95 text-on-surface font-semibold text-xs tracking-wider transition shadow-lg shadow-indigo-600/10 disabled:opacity-50 flex items-center justify-center gap-1.5"
                disabled={syncMutation.isPending || !syncFile}
              >
                {syncMutation.isPending ? 'Fayl o\'qilmoqda (AI OCR)...' : 'Ma\'lumotlarni bazaga yuborish'}
              </button>
            </form>
          </div>

          {/* Results display */}
          <div className="border border-slate-200 bg-white border border-slate-200 p-6 rounded-2xl backdrop-blur-md flex flex-col min-h-[350px]">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2 mb-3">
              <Cpu size={18} className="text-primary" />
              Tahlil natijalari (OCR Results)
            </h2>

            {syncMutation.isPending ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="font-mono text-xs text-on-surface-variant">Tasvir yuklanmoqda va AI orqali so'zlar & grammatika ajratib olinmoqda...</p>
              </div>
            ) : syncResult ? (
              <div className="space-y-4 flex-1 overflow-y-auto max-h-[420px] text-xs">
                {/* Summary */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-surface-container-low">
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-on-surface-variant mb-1">Dars Qisqacha Mazmuni</span>
                  <p className="text-on-surface leading-relaxed font-sans">{syncResult.summary}</p>
                </div>

                {/* Added Vocabulary */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-surface-container-low">
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-emerald-400 mb-2 font-bold">Qo'shilgan yangi so'zlar ({syncResult.added_vocabulary.length} ta)</span>
                  {syncResult.added_vocabulary.length === 0 ? (
                    <p className="text-on-surface-variant italic">Yangi so'zlar topilmadi.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {syncResult.added_vocabulary.map((w: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold font-mono">
                          {w}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Added Grammar */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-surface-container-low">
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-primary mb-2 font-bold font-mono">O'rnatilgan grammatika mavzulari</span>
                  {syncResult.added_grammar.length === 0 ? (
                    <p className="text-on-surface-variant italic">Yangi grammatika mavzulari aniqlanmadi.</p>
                  ) : (
                    <div className="space-y-1">
                      {syncResult.added_grammar.map((g: string, i: number) => (
                        <p key={i} className="text-on-surface-variant font-semibold">• {g}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-on-surface-variant text-xs p-6 text-center">
                <CloudUpload className="text-slate-700 mb-2" size={32} />
                Tasvir yoki PDF yuklangandan so'ng, AI tomonidan tahlil qilingan so'zlar va dars mazmuni bu yerda chiqadi.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Homework Grader Tab */}
      {activeSubTab === 'homework' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* HW Form */}
            <div className="border border-slate-200 bg-white border border-slate-200 p-6 rounded-2xl backdrop-blur-md space-y-4">
              <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                Uy vazifasini tekshirish uchun yuborish
              </h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Yozgan matningizni qo'lda kiriting yoki daftaringizdagi matn suratini yuklang. AI o'qituvchi xatolaringizni topib, ball (0-100) belgilaydi.
              </p>

              <form onSubmit={handleHwSubmit} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant">Vazifa sarlavhasi</label>
                  <input 
                    type="text" 
                    value={hwTitle}
                    onChange={(e) => setHwTitle(e.target.value)}
                    placeholder="masalan: 7-dars yozma mashqi"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-on-surface placeholder-slate-650 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant">Yozma matningiz (yoki rasm yuklang)</label>
                  <textarea 
                    value={hwText}
                    onChange={(e) => setHwText(e.target.value)}
                    placeholder="Daftardagi matnni terishingiz mumkin..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-on-surface placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
                  />
                </div>

                <div className="text-center font-mono text-[10px] text-on-surface-variant">yoki</div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant">Rasm yuklash</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setHwFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-xs text-on-surface-variant file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-outline-variant file:bg-primary/10 file:text-primary file:text-xs file:font-semibold file:cursor-pointer hover:file:bg-primary/50/20"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/95 text-on-surface font-semibold text-xs tracking-wider transition shadow-lg shadow-indigo-600/10 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  disabled={hwMutation.isPending}
                >
                  {hwMutation.isPending ? 'AI tomonidan tekshirilmoqda...' : 'Tekshirishga yuborish'}
                </button>
              </form>
            </div>

            {/* HW Result */}
            <div className="border border-slate-200 bg-white border border-slate-200 p-6 rounded-2xl backdrop-blur-md flex flex-col min-h-[350px]">
              <h2 className="text-sm font-bold text-on-surface flex items-center gap-2 mb-3">
                <Award size={18} className="text-primary" />
                Vazifa natijasi (Evaluation)
              </h2>

              {hwMutation.isPending ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="font-mono text-xs text-on-surface-variant">AI imlo, morfologiya va gap tuzilishini tahlil qilmoqda...</p>
                </div>
              ) : hwResult ? (
                <div className="space-y-4 flex-1 overflow-y-auto max-h-[420px] text-xs">
                  {/* Score */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-surface-container-low">
                    <span className="font-semibold text-on-surface-variant">Belgilangan ball:</span>
                    <span className={`font-mono text-2xl font-bold ${hwResult.score >= 80 ? "text-emerald-400" : "text-amber-400"}`}>
                      {hwResult.score} / 100
                    </span>
                  </div>

                  {/* Feedback */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-surface-container-low">
                    <span className="block font-mono text-[9px] uppercase tracking-wider text-on-surface-variant mb-1">O'qituvchi fikri (Feedback)</span>
                    <p className="text-on-surface leading-relaxed italic">"{hwResult.feedback}"</p>
                  </div>

                  {/* Detailed Corrections */}
                  <div className="space-y-2">
                    <span className="block font-mono text-[9px] uppercase tracking-wider text-red-400 font-bold mb-1">Topilgan xatolar ({hwResult.corrections.length} ta)</span>
                    {hwResult.corrections.length === 0 ? (
                      <p className="text-emerald-400 font-semibold p-2 bg-emerald-500/5 rounded border border-emerald-500/10">Xatolar topilmadi! Tabriklaymiz!</p>
                    ) : (
                      hwResult.corrections.map((c: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-surface-container-low space-y-1">
                          <div className="flex justify-between items-center text-[9px] font-mono text-on-surface-variant">
                            <span>Tahrir {idx + 1}</span>
                            <span className="px-1 py-0.5 rounded bg-red-500/10 text-red-400 font-bold uppercase">{c.category}</span>
                          </div>
                          <p className="text-red-400 font-mono line-through">"{c.incorrect_segment}"</p>
                          <p className="text-emerald-400 font-mono font-semibold">➔ "{c.corrected_segment}"</p>
                          <p className="text-[11px] text-on-surface-variant border-t border-slate-200 pt-1.5 mt-1.5 leading-normal">{c.explanation_uz}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-on-surface-variant text-xs p-6 text-center">
                  <FileText className="text-slate-700 mb-2" size={32} />
                  Uy vazifasi matnini yuklagandan so'ng, AI o'qituvchining baholash va tuzatish kartalari shu yerda ko'rinadi.
                </div>
              )}
            </div>
          </div>

          {/* Past HW History list */}
          <div className="border border-slate-200 bg-white border border-slate-200 p-5 rounded-2xl backdrop-blur-md">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2 mb-3">
              <History size={16} className="text-primary" />
              Yuborilgan uy vazifalari tarixi
            </h2>

            {isLoadingHw ? (
              <div className="flex justify-center py-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : homeworks.length === 0 ? (
              <div className="text-center py-6 text-on-surface-variant text-xs">Ushbu bo'limda ma'lumotlar mavjud emas.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {homeworks.map((hw) => (
                  <div key={hw.id} className="p-4 rounded-xl border border-slate-100 bg-surface-container-low text-xs space-y-2 hover:border-slate-200 transition">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-on-surface truncate max-w-[70%]">{hw.title}</span>
                      <span className={`font-mono font-bold px-2 py-0.5 rounded ${hw.score >= 80 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                        {hw.score} ball
                      </span>
                    </div>
                    {hw.raw_content && (
                      <p className="text-on-surface-variant line-clamp-2 italic border-b border-slate-100 pb-2 mt-1">
                        "{hw.raw_content}"
                      </p>
                    )}
                    <div className="flex justify-between items-center text-[10px] text-on-surface-variant pt-1 font-mono">
                      <span>Turi: {hw.file_type}</span>
                      <span>{hw.created_at.slice(0, 10)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
