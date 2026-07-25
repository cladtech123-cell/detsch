import { useQuery } from '@tanstack/react-query';
import { 
  AlertOctagon, 
  CheckCircle2
} from 'lucide-react';

interface Mistake {
  id: number;
  category: string;
  incorrect_text: string;
  corrected_text: string;
  explanation: string;
  lesson: string | null;
  occurrence_count: number;
  created_at: string;
}

export function MistakesPage() {
  const { data: mistakes = [], isLoading } = useQuery<Mistake[]>({
    queryKey: ['mistakes'],
    queryFn: () => fetch('/api/v1/mistakes').then(r => r.json()),
  });

  // Calculate simple statistics
  const totalMistakes = mistakes.reduce((acc, curr) => acc + curr.occurrence_count, 0);
  const categoriesCount = mistakes.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.occurrence_count;
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2">
          <AlertOctagon className="text-red-400" /> Xatolar ro'yxati (Mistake Tracker)
        </h1>
        <p className="text-on-surface-variant text-xs mt-1">AI Tutor va Uy ishlarida yo'l qo'ygan xatolaringizning tizimli tahlili.</p>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : mistakes.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center text-on-surface-variant text-xs flex flex-col items-center justify-center h-[300px]">
          <CheckCircle2 size={36} className="text-emerald-500 mb-3" />
          Hozircha xatoliklar aniqlanmagan. Juda ajoyib!
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 p-5 bg-white border border-slate-200 backdrop-blur-md">
              <span className="block font-mono text-[9px] uppercase tracking-wider text-on-surface-variant">Jami yo'l qo'yilgan xatolar</span>
              <h3 className="text-3xl font-bold text-on-surface mt-1.5">{totalMistakes} marta</h3>
              <p className="text-[10px] text-on-surface-variant mt-1">Muloqotlar davomida qayd etilgan</p>
            </div>
            
            <div className="rounded-xl border border-slate-200 p-5 bg-white border border-slate-200 backdrop-blur-md md:col-span-2">
              <span className="block font-mono text-[9px] uppercase tracking-wider text-on-surface-variant">Xatolar tahlili (Kategoriyalar bo'yicha)</span>
              <div className="flex flex-wrap gap-2 mt-3">
                {Object.entries(categoriesCount).map(([cat, count]) => (
                  <span key={cat} className="px-2.5 py-1 rounded-lg border border-slate-200 bg-surface-container-low text-xs text-on-surface-variant font-mono font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    <span className="uppercase text-[10px] tracking-wide text-on-surface-variant">{cat}:</span>
                    <span className="text-on-surface">{count} ta</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Mistakes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mistakes.map((mistake) => (
              <div key={mistake.id} className="p-5 rounded-2xl border border-slate-200 bg-white border border-slate-200 backdrop-blur-md space-y-3 hover:border-slate-200 transition">
                <div className="flex justify-between items-center text-xs">
                  <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-mono text-[10px] uppercase font-bold tracking-wider">
                    {mistake.category}
                  </span>
                  <span className="text-on-surface-variant font-mono text-[10px]">{mistake.occurrence_count} marta qayd etildi</span>
                </div>
                
                <div className="space-y-1.5">
                  <p className="text-red-400 font-mono text-sm line-through leading-relaxed">
                    "{mistake.incorrect_text}"
                  </p>
                  <p className="text-emerald-400 font-mono text-sm font-semibold leading-relaxed">
                    ➔ "{mistake.corrected_text}"
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-3 text-xs text-on-surface-variant font-sans space-y-1">
                  <span className="block text-[9px] font-mono uppercase tracking-wider text-on-surface-variant">Tushuntirish (Izoh)</span>
                  <p className="leading-relaxed font-medium">{mistake.explanation.split('|')[0].trim()}</p>
                  {mistake.explanation.includes('|') && (
                    <p className="text-[10px] text-on-surface-variant leading-normal italic mt-1">{mistake.explanation.split('|')[1].trim()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
