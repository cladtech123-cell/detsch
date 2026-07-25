import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle,
  PlayCircle
} from 'lucide-react';
import { apiService } from '@/lib/services';

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: apiService.getDashboard,
    refetchInterval: 15_000,
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="font-label-md text-on-surface-variant">Lernfortschritt wird geladen...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-error/20 bg-error/5 p-8 text-center max-w-xl mx-auto mt-10">
        <AlertTriangle className="mx-auto text-error mb-4" size={48} />
        <h3 className="text-xl font-bold text-on-surface">Verbindungsfehler</h3>
        <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
          Verbindung zum Backend fehlgeschlagen. Bitte stellen Sie sicher, dass der Server läuft.
        </p>
        <pre className="mt-4 p-4 bg-slate-900 text-white rounded-2xl text-left text-xs font-mono overflow-x-auto shadow-inner">
          python3 -m uvicorn app.main:app --reload
        </pre>
      </div>
    );
  }

  const weeklyPercentage = Math.round(data.weekly_goal_progress * 100);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Continue Learning Hero Card */}
        <div className="md:col-span-8 group relative overflow-hidden rounded-3xl bg-primary text-on-primary p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                Weiterlernen
              </span>
              <h3 className="text-3xl font-extrabold mb-2 tracking-tight">
                {data.current_lesson}
              </h3>
              <p className="text-on-primary/80 max-w-md text-sm leading-relaxed">
                Meistern Sie die Verwendung von grammatikalischen Strukturen und Vokabeln der aktuellen Lektion.
              </p>
            </div>
            <div className="mt-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Lektionsfortschritt</span>
                <span className="text-sm font-bold">{data.progress_percentage}%</span>
              </div>
              <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-500"
                  style={{ width: `${data.progress_percentage}%` }}
                ></div>
              </div>
              <button 
                onClick={() => navigate('/lessons')}
                className="mt-6 flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-bold hover:scale-[1.03] transition-transform active:scale-95 shadow-md"
              >
                Lektion fortsetzen
                <PlayCircle size={18} />
              </button>
            </div>
          </div>
          {/* Decorative ornaments */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
            <span className="material-symbols-outlined !text-[180px]">auto_stories</span>
          </div>
        </div>

        {/* Tagesziel Circular Goal Card */}
        <div className="md:col-span-4 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <h4 className="font-headline-md text-on-surface font-bold text-lg mb-6">Tagesziel</h4>
          <div className="relative w-40 h-40 mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle className="text-slate-100" cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeWidth="8"></circle>
              <circle 
                className="text-primary transition-all duration-1000 ease-out" 
                cx="50" 
                cy="50" 
                fill="transparent" 
                r="45" 
                stroke="currentColor" 
                strokeDasharray="282.7" 
                strokeDashoffset={282.7 - (282.7 * Math.min(weeklyPercentage, 100)) / 100}
                strokeWidth="8"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-on-surface">{weeklyPercentage}%</span>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mt-1">Erreicht</span>
            </div>
          </div>
          <p className="text-on-surface-variant font-body-md text-sm">
            {weeklyPercentage >= 100 ? 'Hervorragend! Wochenziel erreicht! 🎉' : 'Sehr gut! Bleib dran für dein tägliches Ziel.'}
          </p>
          <div className="mt-4 flex gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${weeklyPercentage >= 20 ? 'bg-primary' : 'bg-slate-200'}`}></div>
            <div className={`w-2.5 h-2.5 rounded-full ${weeklyPercentage >= 40 ? 'bg-primary' : 'bg-slate-200'}`}></div>
            <div className={`w-2.5 h-2.5 rounded-full ${weeklyPercentage >= 60 ? 'bg-primary' : 'bg-slate-200'}`}></div>
            <div className={`w-2.5 h-2.5 rounded-full ${weeklyPercentage >= 80 ? 'bg-primary' : 'bg-slate-200'}`}></div>
            <div className={`w-2.5 h-2.5 rounded-full ${weeklyPercentage >= 100 ? 'bg-primary' : 'bg-slate-200'}`}></div>
          </div>
        </div>

        {/* Today's Tasks (Heutige Lektionen) */}
        <div className="md:col-span-5 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-headline-md text-on-surface font-bold text-lg">Tagesaufgaben</h4>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">B1 Level</span>
            </div>
            <div className="space-y-4">
              {data.today_tasks.map((task: string, idx: number) => {
                let icon = 'translate';
                let bg = 'bg-tertiary/10 text-tertiary';
                if (idx === 1) {
                  icon = 'headset';
                  bg = 'bg-primary/10 text-primary';
                } else if (idx >= 2) {
                  icon = 'mic';
                  bg = 'bg-secondary-container/20 text-on-secondary-container';
                }
                return (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer group">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${bg}`}>
                      <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-on-surface text-sm">{task}</p>
                      <p className="text-xs text-on-surface-variant">Empfohlene tägliche Übung</p>
                    </div>
                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                  </div>
                );
              })}
            </div>
          </div>
          <button 
            onClick={() => navigate('/lessons')}
            className="w-full mt-6 py-3 bg-slate-50 border border-slate-200 text-on-surface hover:bg-slate-100 rounded-xl font-bold text-sm transition-all"
          >
            Alle Aufgaben ansehen
          </button>
        </div>

        {/* Weekly Progress Bar Chart (Wöchentlicher Fortschritt) */}
        <div className="md:col-span-7 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="font-headline-md text-on-surface font-bold text-lg">Wöchentlicher Fortschritt</h4>
                <p className="text-xs text-on-surface-variant mt-1">Gelerntes Vokabular und Aktivität</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-on-surface">{data.vocab_total}</span>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wide">Wörter gelernt</p>
              </div>
            </div>
            
            <div className="flex items-end justify-between h-44 gap-3 mt-4 px-2">
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-surface-container-highest rounded-t-lg relative group h-20">
                  <div className="absolute bottom-0 w-full bg-primary/20 rounded-t-lg h-full"></div>
                  <div className="absolute bottom-0 w-full bg-primary rounded-t-lg h-1/2 group-hover:h-2/3 transition-all"></div>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Mo</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-surface-container-highest rounded-t-lg relative group h-28">
                  <div className="absolute bottom-0 w-full bg-primary/20 rounded-t-lg h-full"></div>
                  <div className="absolute bottom-0 w-full bg-primary rounded-t-lg h-3/4 group-hover:h-full transition-all"></div>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Di</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-surface-container-highest rounded-t-lg relative group h-40">
                  <div className="absolute bottom-0 w-full bg-primary/20 rounded-t-lg h-full"></div>
                  <div className="absolute bottom-0 w-full bg-primary rounded-t-lg h-full group-hover:opacity-85 transition-all"></div>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Mi</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-surface-container-highest rounded-t-lg relative group h-16">
                  <div className="absolute bottom-0 w-full bg-primary/20 rounded-t-lg h-full"></div>
                  <div className="absolute bottom-0 w-full bg-primary rounded-t-lg h-1/3 group-hover:h-1/2 transition-all"></div>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Do</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-surface-container-highest rounded-t-lg relative group h-32">
                  <div className="absolute bottom-0 w-full bg-primary/20 rounded-t-lg h-full"></div>
                  <div className="absolute bottom-0 w-full bg-primary rounded-t-lg h-4/5 group-hover:h-full transition-all"></div>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Fr</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-surface-container-highest rounded-t-lg relative group h-12">
                  <div className="absolute bottom-0 w-full bg-primary/20 rounded-t-lg h-full"></div>
                  <div className="absolute bottom-0 w-full bg-primary rounded-t-lg h-1/4 group-hover:h-1/2 transition-all"></div>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Sa</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-surface-container-highest rounded-t-lg relative group h-8">
                  <div className="absolute bottom-0 w-full bg-primary/20 rounded-t-lg h-full"></div>
                  <div className="absolute bottom-0 w-full bg-primary rounded-t-lg h-0 group-hover:h-1/4 transition-all"></div>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">So</span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-on-surface-variant">
            <span>Erlerntes Vokabular insgesamt: <strong>{data.vocab_total} Wörter</strong></span>
            <span>Heute fällig: <strong>{data.vocab_due_today} Wörter</strong></span>
          </div>
        </div>

        {/* Mistakes & Recent Errors Block */}
        <div className="md:col-span-6 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-headline-md text-on-surface font-bold text-lg mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-error">error</span>
              Letzte Fehler (Fehleranalyse)
            </h4>
            <p className="text-xs text-on-surface-variant mb-6">AI Tutor va mashqlarda eng ko'p yo'l qo'yilgan xatolar.</p>

            <div className="space-y-4">
              {data.recent_mistakes.length === 0 ? (
                <div className="py-12 text-center text-on-surface-variant border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <span className="material-symbols-outlined text-4xl text-primary mb-3">check_circle</span>
                  <p className="font-medium text-sm">Hozircha xatoliklar yo'q! 🌟</p>
                </div>
              ) : (
                data.recent_mistakes.map((mistake: any) => (
                  <div key={mistake.id} className="p-4 rounded-2xl border border-slate-100 bg-surface-container-low text-xs space-y-2 hover:shadow-sm transition-all">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded bg-error/10 text-error font-bold text-[9px] uppercase tracking-wider">{mistake.category}</span>
                      <span className="text-[10px] text-on-surface-variant font-medium">Lektion Thema</span>
                    </div>
                    <p className="text-error font-mono line-through leading-relaxed">"{mistake.incorrect_text}"</p>
                    <p className="text-primary font-mono font-bold leading-relaxed">➔ "{mistake.corrected_text}"</p>
                    <p className="text-[11px] text-on-surface-variant leading-normal border-t border-slate-200/50 pt-2 mt-2 italic font-sans">{mistake.explanation.split('|')[0].trim()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <button 
            onClick={() => navigate('/mistakes')}
            className="w-full mt-6 py-3 bg-primary text-on-primary hover:bg-primary/95 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
          >
            Alle Fehler überprüfen
          </button>
        </div>

        {/* Learning Calendar (Lernkalender) */}
        <div className="md:col-span-6 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-headline-md text-on-surface font-bold text-lg">Lernkalender</h4>
              <div className="flex gap-1">
                <button className="p-1 hover:bg-surface-container rounded-lg"><span className="material-symbols-outlined !text-lg">chevron_left</span></button>
                <button className="p-1 hover:bg-surface-container rounded-lg"><span className="material-symbols-outlined !text-lg">chevron_right</span></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs mb-4">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">M</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">D</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">M</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">D</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">F</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">S</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">S</span>
              <span className="p-2 font-medium text-slate-300">21</span>
              <span className="p-2 font-medium text-slate-300">22</span>
              <span className="p-2 font-medium text-slate-300">23</span>
              <span className="p-2 font-medium bg-primary text-on-primary rounded-xl ring-4 ring-primary/10">24</span>
              <span className="p-2 font-medium hover:bg-surface-container rounded-xl transition-colors cursor-pointer relative">25
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-secondary-container rounded-full"></span>
              </span>
              <span className="p-2 font-medium hover:bg-surface-container rounded-xl transition-colors cursor-pointer">26</span>
              <span className="p-2 font-medium hover:bg-surface-container rounded-xl transition-colors cursor-pointer">27</span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-4">
            <div className="w-2.5 h-10 bg-secondary-fixed-dim rounded-full shadow-sm"></div>
            <div>
              <p className="text-xs font-bold text-on-surface">Grammatik Live: Modalverben</p>
              <p className="text-[10px] text-on-surface-variant uppercase font-semibold">Morgen, 10:00 Uhr</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
