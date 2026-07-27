import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Play, 
  BookOpen, 
  TrendingUp, 
  CheckCircle2, 
  BarChart3, 
  Languages, 
  Volume2, 
  SpellCheck, 
  Calendar,
  X,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { Language, TabType, UserProfile, VocabWord } from '../../types';
import { i18nTranslations } from '../../data/i18n';
import { apiService } from '../../lib/services';
import { initialLessons } from '../../data/mockData';

interface DashboardViewProps {
  user: UserProfile;
  lang: Language;
  setActiveTab: (tab: TabType) => void;
  vocabList: VocabWord[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ user, lang, setActiveTab, vocabList }) => {
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const t = (key: string) => i18nTranslations[lang][key] || key;

  // Query live dashboard payload from SQLite
  const { data: dbData, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: apiService.getDashboard,
    refetchInterval: 15_000,
  });

  // Query real activity data (7-day XP per day)
  const { data: activityData = [] } = useQuery({
    queryKey: ['activity'],
    queryFn: apiService.getActivityData,
    refetchInterval: 60_000,
  });

  // Extract lesson number from backend current_lesson e.g. "Momente A1.1 - Lektion 7"
  const lessonMatch = dbData?.current_lesson ? dbData.current_lesson.match(/Lektion\s+(\d+)/i) : null;
  const currentLessonNumber = lessonMatch ? parseInt(lessonMatch[1], 10) : 7;

  // Retrieve matching metadata details dynamically
  const currentLessonObj = initialLessons.find(l => l.number === currentLessonNumber) || {
    id: `l${currentLessonNumber}`,
    number: currentLessonNumber,
    title: {
      uz: `Lektion ${currentLessonNumber}`,
      ru: `Lektion ${currentLessonNumber}`,
      en: `Lektion ${currentLessonNumber}`,
      de: `Lektion ${currentLessonNumber}`
    },
    description: {
      uz: `Lektion ${currentLessonNumber} darsi mavzulari va so'zlari.`,
      ru: `Изучение слов и грамматики урока Lektion ${currentLessonNumber}.`,
      en: `Studying words and grammar of Lektion ${currentLessonNumber}.`,
      de: `Themen und Vokabeln der Lektion ${currentLessonNumber}.`
    }
  };

  const displayProgress = dbData?.progress_percentage ?? 0;

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'de-DE';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 animate-pulse">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  if (isError || !dbData) {
    return (
      <div className="rounded-[32px] border border-red-500/20 bg-red-500/5 p-8 text-center max-w-xl mx-auto mt-10 space-y-4">
        <AlertTriangle className="mx-auto text-red-400 animate-bounce" size={48} />
        <h3 className="text-xl font-bold text-on-surface">Ulanishda xatolik</h3>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          FastAPI serveriga ulanishda xatolik yuz berdi. Backend jarayoni o'rnatilganligini tekshiring.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-on-surface">
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Dynamic Current Lesson Hero Card */}
        <div className="md:col-span-8 bg-surface border border-border rounded-[32px] p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden group hover:border-primary/40 transition-all duration-300">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
            <BookOpen className="w-[180px] h-[180px] text-primary" />
          </div>

          <div className="flex-1 z-10 flex flex-col justify-between space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                <span>{t('hero.badge')}</span>
              </div>
              <h3 className="text-2xl md:text-3.5xl font-serif font-bold tracking-tight text-on-surface leading-tight">
                Lektion {currentLessonNumber}: {currentLessonObj.title[lang] || currentLessonObj.title.uz}
              </h3>
              <p className="text-on-surface-variant text-xs md:text-sm mt-2 max-w-lg leading-relaxed">
                {currentLessonObj.description[lang] || currentLessonObj.description.uz}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => setActiveTab('lessons')}
                className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-primary-hover transition-all shadow-md flex items-center gap-2"
              >
                <span>{t('hero.btn_resume')}</span>
                <Play className="w-4 h-4 fill-current" />
              </button>
              <button
                onClick={() => setShowCurriculumModal(true)}
                className="border border-border bg-surface-variant px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-surface transition-colors text-on-surface"
              >
                {t('hero.btn_curriculum')}
              </button>
            </div>
          </div>

          {/* Progress Circular Ring */}
          <div className="w-full md:w-56 flex flex-col items-center justify-center z-10 bg-surface-variant rounded-2xl p-6 border border-border/80">
            <div className="relative w-28 h-28 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  className="text-border/50"
                  cx="56"
                  cy="56"
                  fill="transparent"
                  r="48"
                  stroke="currentColor"
                  strokeWidth="6"
                />
                <circle
                  className="text-primary transition-all duration-1000"
                  cx="56"
                  cy="56"
                  fill="transparent"
                  r="48"
                  stroke="currentColor"
                  strokeDasharray="301.59"
                  strokeDashoffset={301.59 * (1 - displayProgress / 100)}
                  strokeLinecap="round"
                  strokeWidth="6"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-serif font-bold text-on-surface">{displayProgress}%</span>
              </div>
            </div>
            <p className="text-[11px] text-center text-on-surface-variant font-bold uppercase tracking-wider">
              {t('hero.progress_label')}
            </p>
          </div>
        </div>

        {/* Learning Streak Widget */}
        <div className="md:col-span-4 bg-surface border border-border rounded-[32px] p-6 flex flex-col justify-between hover:border-primary/30 transition-all">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-serif font-bold text-base text-on-surface">
                {t('streak.title')}
              </h4>
              <Zap className="w-5 h-5 text-primary" />
            </div>

            {/* Days row - real activity data */}
            <div className="flex justify-between gap-1.5 mb-6">
              {activityData.length > 0 ? activityData.map((item: any, idx: number) => {
                const hasActivity = item.xp > 0;
                const isToday = item.is_today;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        isToday
                          ? 'bg-primary text-on-primary font-bold shadow-md'
                          : hasActivity
                          ? 'bg-primary/20 text-primary border border-primary/20'
                          : 'bg-surface-variant text-on-surface-variant border border-border'
                      }`}
                    >
                      <span className="text-[10px] font-bold">{item.day_abbr.slice(0, 2)}</span>
                    </div>
                    {isToday ? (
                      <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
                    ) : hasActivity ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <div className="w-1 h-1 rounded-full bg-border" />
                    )}
                  </div>
                );
              }) : (
                // Fallback static if no activity data yet
                ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-surface-variant text-on-surface-variant border border-border">
                      <span className="text-[10px] font-bold">{day.slice(0, 2)}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-border" />
                  </div>
                ))
              )}
            </div>

          </div>

          {/* Goal card */}
          <div className="bg-surface-variant p-4 rounded-2xl border border-border">
            <div className="flex justify-between text-[11px] text-on-surface font-semibold mb-2">
              <span>Kunlik Maqsad</span>
              <span>{dbData.today_xp} / {user.dailyGoalXp} XP</span>
            </div>
            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (dbData.today_xp / user.dailyGoalXp) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              {t('streak.motivation')}
            </p>
          </div>
        </div>

        {/* Weekly Stats Bar Chart - Real Data */}
        <div className="md:col-span-4 bg-surface border border-border rounded-[32px] p-6 hover:border-primary/30 transition-all">
          <h4 className="font-serif font-bold text-base text-on-surface mb-6 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span>Faollik ko'rsatkichi</span>
          </h4>

          {activityData.length > 0 ? (
            <>
              <div className="flex items-end justify-between h-36 gap-2 mb-4">
                {activityData.map((bar: any, idx: number) => {
                  const maxXp = Math.max(...activityData.map((b: any) => b.xp), 1);
                  const heightPct = bar.xp > 0 ? Math.max(8, Math.round((bar.xp / maxXp) * 100)) : 4;
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-surface border border-border text-[9px] text-on-surface px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 font-mono">
                        {bar.xp > 0 ? `${bar.xp} XP` : 'No activity'}
                      </div>
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          bar.is_today
                            ? 'bg-primary shadow-sm shadow-primary/20'
                            : bar.xp > 0
                            ? 'bg-primary/30 hover:bg-primary/50'
                            : 'bg-border/40'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-on-surface-variant text-[10px] uppercase font-bold tracking-wider pt-2 border-t border-border/50">
                {activityData.map((bar: any, idx: number) => (
                  <span key={idx} className={bar.is_today ? 'text-primary font-black' : ''}>{bar.day_abbr}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-end justify-between h-36 gap-2 mb-4">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end">
                  <div className="w-full rounded-t-md bg-border/40" style={{ height: '4%' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vocabulary Widget */}
        <div className="md:col-span-4 bg-surface border border-border rounded-[32px] p-6 hover:border-primary/30 transition-all">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-serif font-bold text-base text-on-surface flex items-center gap-2">
              <Languages className="w-4 h-4 text-primary" />
              <span>So'z boyligi</span>
            </h4>
            <button
              onClick={() => setActiveTab('vocab')}
              className="text-primary text-[11px] font-bold uppercase tracking-wider hover:underline"
            >
              {t('vocab.see_all')} ({dbData.vocab_total})
            </button>
          </div>

          <div className="space-y-2.5">
            {vocabList.slice(0, 3).map((v, i) => (
              <div
                key={i}
                className="group flex items-center justify-between p-3 rounded-2xl bg-surface-variant hover:bg-primary/10 transition-colors border border-border"
              >
                <div>
                  <p className="font-bold text-on-surface text-xs leading-none">
                    {v.german}
                  </p>
                  <p className="text-[10px] text-on-surface-variant italic mt-1 leading-none">
                    {v.translation[lang] || v.translation.uz || v.translation}
                  </p>
                </div>
                <button
                  onClick={() => speakWord(v.german)}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Grammar Progress Widget */}
        <div className="md:col-span-4 bg-surface border border-border rounded-[32px] p-6 hover:border-primary/30 transition-all">
          <h4 className="font-serif font-bold text-base text-on-surface mb-6 flex items-center gap-2">
            <SpellCheck className="w-4 h-4 text-primary" />
            <span>Grammatika</span>
          </h4>

          <div className="space-y-4">
            {[
              { labelKey: 'Modal fe\'llar (sollen)', percent: Math.round((dbData.grammar_completed / Math.max(1, dbData.grammar_total)) * 100) },
              { labelKey: 'Modal fe\'llar (können)', percent: Math.round((dbData.grammar_completed / Math.max(1, dbData.grammar_total)) * 100) },
              { labelKey: 'Modal fe\'llar (müssen)', percent: Math.round((dbData.grammar_completed / Math.max(1, dbData.grammar_total)) * 100) },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-on-surface font-medium">{item.labelKey}</span>
                  <span className="text-primary font-bold">{item.percent}%</span>
                </div>
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="md:col-span-6 bg-surface border border-border rounded-[32px] p-6 hover:border-primary/30 transition-all">
          <h4 className="font-serif font-bold text-base text-on-surface mb-6 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Bugungi vazifalar</span>
          </h4>

          <div className="space-y-2.5">
            {dbData.today_tasks?.map((task: string, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-variant border border-border text-xs">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 animate-pulse" />
                <span className="font-bold text-on-surface">{task}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Mistakes Widget */}
        <div className="md:col-span-6 bg-surface border border-border rounded-[32px] p-6 hover:border-primary/30 transition-all">
          <h4 className="font-serif font-bold text-base text-on-surface mb-6 flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Xatolar tahlili</span>
          </h4>

          <div className="space-y-3">
            {dbData.recent_mistakes?.length === 0 ? (
              <div className="py-6 text-center text-on-surface-variant/40 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <p className="text-xs italic">Hech qanday xatolik topilmadi. Ajoyib ko'rsatkich!</p>
              </div>
            ) : (
              dbData.recent_mistakes?.slice(0, 2).map((m: any, idx: number) => (
                <div key={idx} className="p-3 rounded-2xl bg-surface-variant border border-border text-xs space-y-1">
                  <p className="text-red-400 font-mono line-through">"{m.incorrect_text}"</p>
                  <p className="text-primary font-mono font-bold">➔ "{m.corrected_text}"</p>
                  <p className="text-[10px] text-on-surface-variant leading-relaxed">{m.explanation}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Curriculum Modal */}
      {showCurriculumModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative text-on-surface">
            <button
              onClick={() => setShowCurriculumModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-surface-variant text-on-surface-variant hover:text-on-surface"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-serif font-bold">Momente A1.1 O'quv Rejasi</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Darslik bo'limlarining grammatik qoidalari va o'rganilgan leksikasi.
            </p>
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2 scrollbar-none">
              {initialLessons.map((item, idx) => (
                <div key={idx} className="p-3 bg-surface-variant rounded-xl text-xs flex justify-between items-center border border-border">
                  <span className="font-medium">Lektion {item.number}: {item.title[lang] || item.title.uz}</span>
                  {item.number < currentLessonNumber ? (
                    <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold uppercase">Yakunlandi</span>
                  ) : item.number === currentLessonNumber ? (
                    <span className="text-[9px] bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded font-bold uppercase">Joriy</span>
                  ) : (
                    <span className="text-[9px] bg-border text-on-surface-variant px-2 py-0.5 rounded font-bold uppercase">Yopiq</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
