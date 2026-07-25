import { useQuery } from '@tanstack/react-query';
import { Shield, Target, Flame, AlertCircle } from 'lucide-react';
import { apiService } from '@/lib/services';

export function ProfilePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: apiService.getDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex h-[40vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="font-label-md text-on-surface-variant">Profil wird geladen...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-error/20 bg-error/5 p-8 text-center max-w-xl mx-auto">
        <AlertCircle className="mx-auto text-error mb-4" size={48} />
        <h3 className="text-xl font-bold text-on-surface">Fehler</h3>
        <p className="text-sm text-on-surface-variant mt-2">Profildaten konnten nicht geladen werden.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Profile Overview Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary text-on-primary text-3xl font-extrabold flex items-center justify-center shadow-md">
          D
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h3 className="text-2xl font-black text-on-surface tracking-tight">Dean (Student)</h3>
          <p className="text-xs text-on-surface-variant font-medium">LernDeutsch Account seit Juli 2026</p>
          <div className="flex flex-wrap gap-2 pt-2 justify-center sm:justify-start">
            <span className="px-2.5 py-0.5 rounded bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider">
              Level {data.cefr_estimate}
            </span>
            <span className="px-2.5 py-0.5 rounded bg-tertiary/10 text-tertiary font-bold text-[10px] uppercase tracking-wider">
              Goethe A1 Prep
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Profile Stats & Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Statistics summary */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <h4 className="font-bold text-on-surface flex items-center gap-2">
            <Shield size={18} className="text-primary" />
            Lernfortschritt & Statistiken
          </h4>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs text-on-surface-variant font-medium">Aktuelle Lektion</span>
              <span className="text-sm font-bold text-on-surface">{data.current_lesson}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs text-on-surface-variant font-medium">Studien-Streak</span>
              <span className="text-sm font-bold text-error flex items-center gap-1">
                <Flame size={16} className="fill-error/10" />
                {data.streak} Tage
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-xs text-on-surface-variant font-medium">Gelerntes Vokabular</span>
              <span className="text-sm font-bold text-on-surface">{data.vocab_total} Wörter</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-on-surface-variant font-medium">Grammatik-Themen</span>
              <span className="text-sm font-bold text-on-surface">
                {data.grammar_completed} / {data.grammar_total} abgeschlossen
              </span>
            </div>
          </div>
        </div>

        {/* Goals & Preferences */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <h4 className="font-bold text-on-surface flex items-center gap-2">
            <Target size={18} className="text-amber-500" />
            Wöchentliche Ziele
          </h4>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                <span>Studienstunden Ziel</span>
                <span>{Math.round(data.weekly_goal_progress * 100)}% erreicht</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${data.weekly_goal_progress * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Tägliches Studienziel (in Minuten):
              </label>
              <select className="w-full bg-surface-container-low border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-on-surface focus:ring-primary focus:border-primary">
                <option>15 Minuten (Entspannt)</option>
                <option selected>30 Minuten (Normal)</option>
                <option>60 Minuten (Intensiv)</option>
                <option>90 Minuten (Superhirn)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
