import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import { apiService } from '@/lib/services';

interface GrammarTopic {
  id: number;
  title: string;
  lesson: string;
  explanation_uz: string;
  explanation_en: string;
  is_completed: boolean;
}

export function LessonsPage() {
  const navigate = useNavigate();

  const { data: topics, isLoading, isError } = useQuery<GrammarTopic[]>({
    queryKey: ['grammar-topics'],
    queryFn: apiService.getGrammar,
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="font-label-md text-on-surface-variant">Lektionen werden geladen...</p>
      </div>
    );
  }

  if (isError || !topics) {
    return (
      <div className="rounded-3xl border border-error/20 bg-error/5 p-8 text-center max-w-xl mx-auto">
        <AlertTriangle className="mx-auto text-error mb-4" size={48} />
        <h3 className="text-xl font-bold text-on-surface">Fehler beim Laden</h3>
        <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
          Die Lektionen konnten nicht geladen werden. Bitte versuchen Sie es später noch einmal.
        </p>
      </div>
    );
  }

  // Group topics by lesson name (e.g. Lektion 1, Lektion 2)
  const lessonsMap: Record<string, GrammarTopic[]> = {};
  topics.forEach((t) => {
    if (!lessonsMap[t.lesson]) {
      lessonsMap[t.lesson] = [];
    }
    lessonsMap[t.lesson].push(t);
  });

  const lessonKeys = Object.keys(lessonsMap).sort((a, b) => {
    const numA = parseInt(a.replace(/^\D+/g, '')) || 0;
    const numB = parseInt(b.replace(/^\D+/g, '')) || 0;
    return numA - numB;
  });

  // Business logic: Lektion 1 to 7 are unlocked by default. Subsequent lessons are locked if previous is not completed
  const isLessonLocked = (lessonKey: string, index: number) => {
    const num = parseInt(lessonKey.replace(/^\D+/g, '')) || 0;
    if (num <= 7) return false;
    
    // Check if the previous lesson is fully completed
    const prevLessonKey = lessonKeys[index - 1];
    if (!prevLessonKey) return false;
    
    const prevTopics = lessonsMap[prevLessonKey];
    return !prevTopics.every((t) => t.is_completed);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Syllabus Header Banner */}
      <div className="bg-primary text-on-primary rounded-3xl p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            Dein Lernpfad
          </span>
          <h3 className="text-3xl font-extrabold mb-2 tracking-tight">Syllabus Momente A1.1</h3>
          <p className="text-on-primary/80 text-sm leading-relaxed">
            Folgen Sie dem offiziellen Lehrplan von Lektion 1 bis Lektion 12. Schalten Sie neue Themen frei, indem Sie die vorherigen Lektionen erfolgreich abschließen.
          </p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none hidden md:block">
          <span className="material-symbols-outlined !text-[120px]">menu_book</span>
        </div>
      </div>

      {/* Lessons Roadmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessonKeys.map((lessonKey, index) => {
          const lessonTopics = lessonsMap[lessonKey];
          const completedCount = lessonTopics.filter((t) => t.is_completed).length;
          const totalCount = lessonTopics.length;
          const percent = Math.round((completedCount / totalCount) * 100);
          const locked = isLessonLocked(lessonKey, index);

          return (
            <div 
              key={lessonKey} 
              className={`bg-white rounded-3xl p-6 border transition-all duration-300 ${
                locked 
                  ? 'border-slate-100 opacity-75 shadow-sm' 
                  : 'border-slate-200 shadow-sm hover:shadow-md hover:border-primary/20'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-bold text-on-surface">{lessonKey}</h4>
                  <p className="text-xs text-on-surface-variant font-medium mt-1">
                    {totalCount} Themen • {completedCount} abgeschlossen
                  </p>
                </div>
                {locked ? (
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Lock size={16} />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {percent}%
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>

              {/* Topics list */}
              <div className="space-y-3">
                {lessonTopics.map((topic) => (
                  <div 
                    key={topic.id}
                    onClick={() => {
                      if (!locked) {
                        navigate(`/lessons/${topic.id}`);
                      }
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      locked 
                        ? 'border-slate-100/50 bg-slate-50/50 cursor-not-allowed text-slate-400' 
                        : 'border-slate-100 bg-surface-container-low hover:border-primary/15 hover:bg-surface-container-high cursor-pointer group'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {topic.is_completed ? (
                        <CheckCircle2 size={16} className="text-tertiary shrink-0" />
                      ) : (
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                          locked ? 'border-slate-200' : 'border-primary/30 group-hover:border-primary'
                        }`} />
                      )}
                      <span className="font-bold text-xs leading-tight line-clamp-1">
                        {topic.title}
                      </span>
                    </div>
                    {!locked && (
                      <ChevronRight size={14} className="text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
