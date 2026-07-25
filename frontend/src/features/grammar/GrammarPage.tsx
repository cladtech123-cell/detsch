import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Search, ChevronRight, Lock, CheckCircle2 } from 'lucide-react';
import { apiService } from '@/lib/services';

interface Topic {
  id: number;
  title: string;
  lesson: string;
  explanation_uz: string;
  explanation_en: string;
  is_completed: boolean;
}

export function GrammarPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: topics = [], isLoading, isError } = useQuery<Topic[]>({
    queryKey: ['grammar-topics'],
    queryFn: apiService.getGrammar,
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="font-label-md text-on-surface-variant">Grammatikregeln werden geladen...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-error/20 bg-error/5 p-8 text-center max-w-xl mx-auto">
        <AlertTriangle className="mx-auto text-error mb-4" size={48} />
        <h3 className="text-xl font-bold text-on-surface">Fehler beim Laden</h3>
        <p className="text-sm text-on-surface-variant mt-2">
          Grammatikregeln konnten nicht geladen werden. Bitte versuchen Sie es später noch einmal.
        </p>
      </div>
    );
  }

  // Filter topics based on search query
  const filteredTopics = topics.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lesson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.explanation_uz.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group topics by lesson
  const lessonsMap: Record<string, Topic[]> = {};
  filteredTopics.forEach((t) => {
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

  // Locked check logic (Lektion 1-7 unlocked by default)
  const isLessonLocked = (lessonName: string) => {
    const num = parseInt(lessonName.replace(/^\D+/g, '')) || 0;
    if (num <= 7) return false;

    // Check if the previous lesson is fully completed
    const prevLessonName = `Lektion ${num - 1}`;
    const prevTopics = topics.filter((t) => t.lesson === prevLessonName);
    if (prevTopics.length === 0) return false;

    return !prevTopics.every((t) => t.is_completed);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search Bar Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Regeln, Themen oder Lektionen suchen..."
          />
          <Search size={14} className="absolute left-3.5 top-3.5 text-on-surface-variant opacity-60" />
        </div>

        <div className="text-xs text-on-surface-variant font-medium">
          Gefunden: <strong>{filteredTopics.length}</strong> Themen
        </div>
      </div>

      {/* Grammar syllabus list */}
      <div className="space-y-8">
        {lessonKeys.map((lessonKey) => {
          const lessonTopics = lessonsMap[lessonKey];
          const locked = isLessonLocked(lessonKey);

          return (
            <div key={lessonKey} className="space-y-4">
              <div className="flex items-center gap-3">
                <h4 className="font-bold text-on-surface text-lg">{lessonKey}</h4>
                {locked && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <Lock size={10} /> Gesperrt
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessonTopics.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => {
                      if (!locked) {
                        navigate(`/lessons/${topic.id}`);
                      }
                    }}
                    className={`bg-white border rounded-3xl p-6 flex flex-col justify-between transition-all duration-200 ${
                      locked
                        ? 'border-slate-100 opacity-60 cursor-not-allowed'
                        : 'border-slate-200 shadow-sm hover:shadow-md hover:border-primary/15 cursor-pointer group'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Grammatik
                        </span>
                        {topic.is_completed ? (
                          <CheckCircle2 size={16} className="text-tertiary" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-primary/20" />
                        )}
                      </div>

                      <h5 className="font-bold text-on-surface text-base leading-tight mb-2">
                        {topic.title}
                      </h5>
                      <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                        {topic.explanation_uz}
                      </p>
                    </div>

                    {!locked && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-primary mt-6 group-hover:translate-x-0.5 transition-transform">
                        Lektion starten
                        <ChevronRight size={14} />
                      </div>
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
