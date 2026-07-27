import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Lightbulb, FileText, CheckCircle } from 'lucide-react';
import { apiService } from '../../lib/services';
import { Language } from '../../types';

interface ReportsViewProps {
  lang: Language;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ lang }) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await apiService.getWeeklyReport();
        setReport(data);
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-8 text-center bg-surface border border-border rounded-3xl max-w-lg mx-auto">
        <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
        <h3 className="text-lg font-bold">Hisobot yuklanmadi</h3>
        <p className="text-xs text-on-surface-variant mt-2">Iltimos, ma'lumotlar bazasida darslar yoki lug'atlar mavjudligini tekshiring.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-on-surface flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          <span>Haftalik Tahliliy Hisobot (Wochenbericht)</span>
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">
          {new Date(report.start_date).toLocaleDateString()} dan {new Date(report.end_date).toLocaleDateString()} gacha bo'lgan davr.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Core Stats */}
        <div className="md:col-span-4 bg-surface border border-border p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Taxminiy CEFR Darajasi</h4>
            <div className="text-4xl font-black mt-2 text-primary flex items-baseline gap-1">
              {report.estimated_level}
              <span className="text-xs text-on-surface-variant font-normal">Level</span>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-border space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">Yodlangan so'zlar:</span>
              <span className="font-bold text-on-surface">{report.vocabulary_learned} ta</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">Grammatika mavzulari:</span>
              <span className="font-bold text-on-surface">{report.grammar_mastered?.length || 0} ta</span>
            </div>
          </div>
        </div>

        {/* Strengths */}
        <div className="md:col-span-8 bg-surface border border-border p-6 rounded-3xl">
          <h3 className="text-base font-serif font-bold text-on-surface flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Kuchsiz va kuchli tomonlar tahlili</span>
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wide">Kuchli taraflar:</h4>
              <ul className="space-y-2">
                <li className="text-xs text-on-surface flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Nemischa so'zlarni o'zlashtirishda barqaror o'sish ko'rsatkichi ({report.vocabulary_learned} ta faol so'z).</span>
                </li>
                {report.topics_completed?.map((topic: string, i: number) => (
                  <li key={i} className="text-xs text-on-surface flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>"{topic}" mavzusi muvaffaqiyatli yakunlandi.</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Frequent Mistakes */}
        <div className="md:col-span-12 bg-surface border border-border p-6 rounded-3xl">
          <h3 className="text-base font-serif font-bold text-on-surface flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>Eng ko'p takrorlanayotgan xatolar</span>
          </h3>

          {report.frequent_mistakes?.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant bg-surface-variant rounded-2xl">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-medium">Bu haftada hech qanday jiddiy xato aniqlanmadi. Ajoyib! 🌟</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.frequent_mistakes?.map((m: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-surface-variant border border-border text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-bold text-[9px] uppercase tracking-wider">
                      {m.category}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-medium">
                      Takrorlanish: {m.count} marta
                    </span>
                  </div>
                  <p className="text-red-400 font-mono line-through">"{m.wrong}"</p>
                  <p className="text-emerald-400 font-mono font-bold">➔ "{m.right}"</p>
                  <p className="text-[11px] text-on-surface-variant italic pt-1 border-t border-border/50">
                    {m.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="md:col-span-12 bg-surface border border-border p-6 rounded-3xl">
          <h3 className="text-base font-serif font-bold text-on-surface flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-[#ccd5ae]" />
            <span>AI Tutor tavsiyalari va keyingi qadamlar</span>
          </h3>
          <div className="space-y-3">
            {report.recommendations?.map((rec: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-surface-variant border border-border text-xs">
                <span className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
                  {i + 1}
                </span>
                <p className="text-on-surface font-medium leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
