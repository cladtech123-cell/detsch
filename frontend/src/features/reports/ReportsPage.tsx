import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  Layers, 
  AlertTriangle, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { apiService } from '@/lib/services';

interface Report {
  start_date: string;
  end_date: string;
  topics_completed: string[];
  vocabulary_learned: number;
  grammar_mastered: string[];
  frequent_mistakes: Array<{
    category: string;
    wrong: string;
    right: string;
    explanation: string;
    count: number;
  }>;
  estimated_level: string;
  recommendations: string[];
}

export function ReportsPage() {
  const { data: report, isLoading, isError } = useQuery<Report>({
    queryKey: ['weekly-report'],
    queryFn: apiService.getWeeklyReport,
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="font-mono text-xs text-on-surface-variant font-medium">Haftalik hisobot tuzilmoqda...</p>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="border border-slate-200 bg-white border border-slate-200 p-8 rounded-2xl text-center space-y-2 max-w-md mx-auto">
        <AlertTriangle className="text-red-400 mx-auto" size={32} />
        <h3 className="text-base font-semibold text-on-surface">Hisobot yaratib bo'lmadi</h3>
        <p className="text-xs text-on-surface-variant">Tizimda hisobot yaratish uchun ma'lumotlar yetarli emas yoki backend o'chiq.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2">
          <FileText className="text-primary" /> Tahlil hisoboti (Lernbericht)
        </h1>
        <p className="text-on-surface-variant text-xs mt-1">
          {report.start_date} dan {report.end_date} gacha bo'lgan haftalik o'zlashtirish tahlili.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core level summary card */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-indigo-950/20 to-slate-900 p-6 flex flex-col justify-between backdrop-blur-md relative overflow-hidden shadow-lg h-fit">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="space-y-4">
            <span className="block font-mono text-[9px] uppercase tracking-wider text-primary font-bold">Hisoblangan daraja (CEFR)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-on-surface tracking-tight font-mono">{report.estimated_level}</span>
              <span className="text-xs text-on-surface-variant">daraja</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed leading-normal">
              Siz hozirda A1.1 va A1.2 oraliq darajadasiz. Maqsad B2 darajasiga erishish va darsliklar bilan ishlash.
            </p>
          </div>

          <div className="border-t border-slate-200 pt-5 mt-6 grid grid-cols-2 gap-4">
            <div>
              <span className="block text-[10px] font-mono text-on-surface-variant uppercase">Lug'atlar soni</span>
              <span className="text-lg font-bold text-on-surface mt-1 flex items-center gap-1">
                <BookOpen size={14} className="text-emerald-400" /> {report.vocabulary_learned} ta
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-mono text-on-surface-variant uppercase">Grammatika</span>
              <span className="text-lg font-bold text-on-surface mt-1 flex items-center gap-1">
                <Layers size={14} className="text-blue-400" /> {report.topics_completed.length} ta
              </span>
            </div>
          </div>
        </div>

        {/* Detailed reports column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Completed topics */}
          <div className="border border-slate-200 bg-white border border-slate-200 p-5 rounded-2xl backdrop-blur-md space-y-3">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Layers size={16} className="text-primary" />
              O'zlashtirilgan grammatika mavzulari
            </h2>
            {report.topics_completed.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic">Ushbu haftada yangi grammatika darslari tugatilmadi.</p>
            ) : (
              <div className="space-y-2">
                {report.topics_completed.map((topic, i) => (
                  <div key={i} className="flex gap-2.5 items-center p-3 rounded-xl border border-slate-100 bg-surface-container-low text-xs">
                    <CheckCircle className="text-emerald-400 shrink-0" size={14} />
                    <span className="font-semibold text-on-surface">{topic}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Frequent Mistakes section */}
          <div className="border border-slate-200 bg-white border border-slate-200 p-5 rounded-2xl backdrop-blur-md space-y-3">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400" />
              Eng ko'p yo'l qo'yilgan xatolar (Haftalik)
            </h2>
            {report.frequent_mistakes.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic">Hafta davomida xatolar aniqlanmadi.</p>
            ) : (
              <div className="space-y-3">
                {report.frequent_mistakes.map((m, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-slate-100 bg-surface-container-low text-xs space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono text-on-surface-variant">
                      <span>Tahlil {i + 1} ({m.count} marta)</span>
                      <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-bold uppercase">{m.category}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-red-400 font-mono line-through">"{m.wrong}"</p>
                      <p className="text-emerald-400 font-mono font-semibold">➔ "{m.right}"</p>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-normal border-t border-slate-100 pt-1.5 font-sans italic">{m.explanation.split('|')[0]}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Tutor recommendations (Uzbek language) */}
          <div className="border border-slate-200 bg-white border border-slate-200 p-5 rounded-2xl backdrop-blur-md space-y-3">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              O'qituvchi tavsiyalari (Empfehlungen)
            </h2>
            <div className="space-y-2">
              {report.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-2.5 items-start p-3 rounded-xl border border-slate-100 bg-white/10 text-xs">
                  <ArrowRight className="text-primary shrink-0 mt-0.5" size={14} />
                  <span className="text-on-surface leading-relaxed font-medium">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
