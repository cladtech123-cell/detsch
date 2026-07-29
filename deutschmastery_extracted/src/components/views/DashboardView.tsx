import React, { useState } from 'react';
import { 
  Play, 
  BookOpen, 
  TrendingUp, 
  CheckCircle2, 
  BarChart3, 
  Languages, 
  Volume2, 
  SpellCheck, 
  History, 
  MessageSquare, 
  FileText, 
  Calendar,
  X
} from 'lucide-react';
import { Language, TabType, UserProfile, VocabWord } from '../../types';
import { i18nTranslations } from '../../data/i18n';

interface DashboardViewProps {
  user: UserProfile;
  lang: Language;
  setActiveTab: (tab: TabType) => void;
  vocabList: VocabWord[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ user, lang, setActiveTab, vocabList }) => {
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const [scheduledToast, setScheduledToast] = useState(false);

  const t = (key: string) => i18nTranslations[lang][key] || key;

  // Speak German word function
  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'de-DE';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleScheduleLesson = () => {
    setScheduledToast(true);
    setTimeout(() => setScheduledToast(false), 3500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast notification */}
      {scheduledToast && (
        <div className="fixed top-6 right-6 bg-[#5A5A40] text-white px-5 py-3 rounded-2xl shadow-xl font-semibold flex items-center gap-3 z-50 animate-bounce">
          <Calendar className="w-5 h-5 text-[#faedcd]" />
          <span>Mashg'ulot rejalashtirildi! Eslatma o'rnatildi.</span>
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Hero Widget: Current Lesson */}
        <div className="md:col-span-8 glass-card rounded-[28px] p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <BookOpen className="w-[140px] h-[140px] text-[#5A5A40]" />
          </div>

          <div className="flex-1 z-10 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#e9edc9] text-[#3a3a2a] text-xs font-semibold mb-4 border border-[#ccd5ae]">
                <span className="w-2 h-2 rounded-full bg-[#5A5A40] animate-ping" />
                <span>{t('hero.badge')}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#1a1a1a] mb-3">
                {t('hero.title')}
              </h3>
              <p className="text-[#5c5c52] text-sm md:text-base mb-6 max-w-lg leading-relaxed">
                {t('hero.desc')}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => setActiveTab('lessons')}
                className="bg-[#5A5A40] text-white px-7 py-3 rounded-full font-semibold text-sm hover:bg-[#4a4a34] transition-all shadow-md shadow-[#5A5A40]/20 flex items-center gap-2"
              >
                <span>{t('hero.btn_resume')}</span>
                <Play className="w-4 h-4 fill-current" />
              </button>
              <button
                onClick={() => setShowCurriculumModal(true)}
                className="border border-[#e8e8e0] bg-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#f8f8f5] transition-colors text-[#2d2d2d]"
              >
                {t('hero.btn_curriculum')}
              </button>
            </div>
          </div>

          {/* Progress Circular Ring */}
          <div className="w-full md:w-52 flex flex-col items-center justify-center z-10 bg-[#f8f8f5] rounded-2xl p-6 border border-[#e8e8e0]">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  className="text-[#e8e8e0]"
                  cx="64"
                  cy="64"
                  fill="transparent"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="8"
                />
                <circle
                  className="text-[#5A5A40] transition-all duration-1000"
                  cx="64"
                  cy="64"
                  fill="transparent"
                  r="54"
                  stroke="currentColor"
                  strokeDasharray="339.29"
                  strokeDashoffset={339.29 * (1 - 0.65)}
                  strokeLinecap="round"
                  strokeWidth="8"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-serif font-bold text-[#1a1a1a]">65%</span>
              </div>
            </div>
            <p className="text-xs text-center text-[#5c5c52] font-medium">
              {t('hero.progress_label')}
            </p>
          </div>
        </div>

        {/* Side Widget: Learning Streak Status */}
        <div className="md:col-span-4 glass-card rounded-[28px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-serif font-bold text-lg text-[#1a1a1a]">
                {t('streak.title')}
              </h4>
              <TrendingUp className="w-5 h-5 text-[#D4A373]" />
            </div>

            {/* Days row */}
            <div className="flex justify-between gap-2 mb-8">
              {[
                { dayKey: 'days.mon', state: 'done' },
                { dayKey: 'days.tue', state: 'done' },
                { dayKey: 'days.wed', state: 'done' },
                { dayKey: 'days.thu', state: 'active' },
                { dayKey: 'days.fri', state: 'future' },
                { dayKey: 'days.sat', state: 'future' },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      item.state === 'active'
                        ? 'bg-[#5A5A40] text-white shadow-md shadow-[#5A5A40]/20'
                        : item.state === 'done'
                        ? 'bg-[#e9edc9] text-[#3a3a2a] border border-[#ccd5ae]'
                        : 'bg-[#f8f8f5] text-[#a0a095] border border-[#e8e8e0]'
                    }`}
                  >
                    <span className="text-xs font-bold">{t(item.dayKey)}</span>
                  </div>
                  {item.state === 'done' && (
                    <CheckCircle2 className="w-4 h-4 text-[#5A5A40]" />
                  )}
                  {item.state === 'active' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5A5A40] animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Goal card */}
          <div className="bg-[#faedcd] p-4 rounded-2xl border border-[#D4A373]/30">
            <p className="text-xs text-[#8a531f] font-semibold mb-2">
              {t('streak.goal')}
            </p>
            <div className="w-full h-2 bg-white/70 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-[#D4A373] rounded-full transition-all duration-500"
                style={{ width: `${(user.currentXp / user.dailyGoalXp) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-[#8a531f] font-medium">
              {t('streak.motivation')}
            </p>
          </div>
        </div>

        {/* Weekly Progress Bar Chart */}
        <div className="md:col-span-4 glass-card rounded-[28px] p-6 delay-1">
          <h4 className="font-serif font-bold text-lg text-[#1a1a1a] mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#5A5A40]" />
            <span>{t('stats.title')}</span>
          </h4>

          <div className="flex items-end justify-between h-40 gap-2 mb-4">
            {[
              { dayKey: 'days.short.mon', height: '40%', xp: '120xp' },
              { dayKey: 'days.short.tue', height: '65%', xp: '180xp' },
              { dayKey: 'days.short.wed', height: '85%', xp: '240xp' },
              { dayKey: 'days.short.thu', height: '60%', xp: '160xp', active: true },
              { dayKey: 'days.short.fri', height: '45%', xp: '130xp' },
              { dayKey: 'days.short.sat', height: '20%', xp: '50xp' },
              { dayKey: 'days.short.sun', height: '15%', xp: '30xp' },
            ].map((bar, idx) => (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#2d2d2d] text-[10px] text-white px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                  {bar.xp}
                </div>
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    bar.active
                      ? 'bg-[#5A5A40] shadow-md shadow-[#5A5A40]/20'
                      : 'bg-[#ccd5ae] hover:bg-[#b5c292]'
                  }`}
                  style={{ height: bar.height }}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[#71716b] text-xs uppercase font-medium">
            <span>{t('days.short.mon')}</span>
            <span>{t('days.short.tue')}</span>
            <span>{t('days.short.wed')}</span>
            <span>{t('days.short.thu')}</span>
            <span>{t('days.short.fri')}</span>
            <span>{t('days.short.sat')}</span>
            <span>{t('days.short.sun')}</span>
          </div>
        </div>

        {/* Vocabulary Widget */}
        <div className="md:col-span-4 glass-card rounded-[28px] p-6 delay-2">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-serif font-bold text-lg text-[#1a1a1a] flex items-center gap-2">
              <Languages className="w-5 h-5 text-[#5A5A40]" />
              <span>{t('vocab.title')}</span>
            </h4>
            <button
              onClick={() => setActiveTab('vocab')}
              className="text-[#5A5A40] text-xs font-semibold hover:underline"
            >
              {t('vocab.see_all')}
            </button>
          </div>

          <div className="space-y-3">
            {vocabList.slice(0, 3).map((v) => (
              <div
                key={v.id}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-[#f8f8f5] hover:bg-[#e9edc9]/40 transition-colors border border-[#e8e8e0]"
              >
                <div>
                  <p className="font-bold text-[#1a1a1a] text-sm">
                    {v.article ? `${v.article} ` : ''}{v.word}
                  </p>
                  <p className="text-xs text-[#5c5c52] italic mt-0.5">
                    {v.translation[lang] || v.translation.uz}
                  </p>
                </div>
                <button
                  onClick={() => speakWord(v.word)}
                  className="p-2 rounded-lg text-[#71716b] group-hover:text-[#5A5A40] hover:bg-white transition-colors"
                  title={t('vocab.listen')}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Grammar Progress Widget */}
        <div className="md:col-span-4 glass-card rounded-[28px] p-6 delay-3">
          <h4 className="font-serif font-bold text-lg text-[#1a1a1a] mb-6 flex items-center gap-2">
            <SpellCheck className="w-5 h-5 text-[#5A5A40]" />
            <span>{t('grammar.title')}</span>
          </h4>

          <div className="space-y-5">
            {[
              { labelKey: 'grammar.item1', percent: 90 },
              { labelKey: 'grammar.item2', percent: 45 },
              { labelKey: 'grammar.item3', percent: 20 },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-[#2d2d2d] font-medium">{t(item.labelKey)}</span>
                  <span className="text-[#5A5A40] font-bold">{item.percent}%</span>
                </div>
                <div className="w-full h-2 bg-[#e8e8e0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5A5A40] rounded-full transition-all duration-700"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="md:col-span-7 glass-card rounded-[28px] p-6 delay-4">
          <h4 className="font-serif font-bold text-lg text-[#1a1a1a] mb-6">
            {t('activity.title')}
          </h4>

          <div className="space-y-2">
            {[
              {
                icon: <History className="w-4 h-4 text-[#D4A373]" />,
                bgColor: 'bg-[#faedcd]',
                titleKey: 'activity.item1.title',
                timeKey: 'activity.item1.time',
                xp: '+45 XP',
              },
              {
                icon: <MessageSquare className="w-4 h-4 text-[#5A5A40]" />,
                bgColor: 'bg-[#e9edc9]',
                titleKey: 'activity.item2.title',
                timeKey: 'activity.item2.time',
                xp: '+30 XP',
              },
              {
                icon: <FileText className="w-4 h-4 text-[#5A5A40]" />,
                bgColor: 'bg-[#ccd5ae]/50',
                titleKey: 'activity.item3.title',
                timeKey: 'activity.item3.time',
                xp: '+10 XP',
              },
            ].map((act, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 py-3 px-3.5 rounded-2xl hover:bg-[#f8f8f5] transition-colors"
              >
                <div className={`w-10 h-10 rounded-full ${act.bgColor} flex items-center justify-center shrink-0`}>
                  {act.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a] truncate">
                    {t(act.titleKey)}
                  </p>
                  <p className="text-xs text-[#71716b] mt-0.5">
                    {t(act.timeKey)}
                  </p>
                </div>
                <span className="text-xs font-bold text-[#5A5A40] shrink-0">
                  {act.xp}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Lesson Card */}
        <div className="md:col-span-5 glass-card rounded-[28px] overflow-hidden delay-4 flex flex-col justify-between">
          <div
            className="h-36 bg-cover bg-center relative"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCM9DZg4PTRbcA-VzLvff6pIJgr7uzZFgoX49Uy605XW1VeyEnBFwspIO0-sW2vgTRCARAbIMpw30Tbai6IYpxttuYWxgA_k4YRVJa43dxqrpMFUlxIM4zgEk476WykLOr-B0CvSn6Kh4GLc1bErHFlqpRPA13t8C4o3ECIViJJKsnOlXOIHK9ujFiEfEBTemFtytU2XhC3F8K9oqaynowfzvreF3hUEJZCTVUJ4EnoqYV5ppQid2bhxP6p4wFxvf5uYUktlBO0UiWa')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
          </div>

          <div className="p-6 -mt-8 relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] text-[#5A5A40] uppercase tracking-widest font-bold mb-1">
                  {t('upcoming.badge')}
                </p>
                <h5 className="text-lg font-serif font-bold text-[#1a1a1a]">
                  {t('upcoming.title')}
                </h5>
              </div>
              <div className="bg-[#f8f8f5] p-2 rounded-xl text-[#5A5A40] border border-[#e8e8e0]">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <p className="text-xs text-[#5c5c52] leading-relaxed">
              {t('upcoming.desc')}
            </p>

            <button
              onClick={handleScheduleLesson}
              className="w-full py-3 rounded-2xl bg-[#f8f8f5] border border-[#e8e8e0] font-semibold text-xs text-[#2d2d2d] hover:bg-[#e9edc9]/50 transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#5A5A40]" />
              <span>{t('upcoming.btn_schedule')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Curriculum Modal */}
      {showCurriculumModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e8e8e0] rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowCurriculumModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-[#f8f8f5] text-[#5c5c52] hover:text-[#1a1a1a]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#5A5A40]">
                B2 Curriculum
              </span>
              <h3 className="text-2xl font-serif font-bold text-[#1a1a1a] mt-1">
                DeutschMastery O'quv Rejasi
              </h3>
            </div>

            <div className="space-y-3">
              {[
                { num: 1, title: 'Sayohat va Transport', status: '100% Completed' },
                { num: 2, title: 'Ish va Kasbiy Muloqot', status: '100% Completed' },
                { num: 3, title: 'Atrof-muhit va Ekologiya', status: '100% Completed' },
                { num: 4, title: 'Modal fe\'llar (Modalverben)', status: '65% In Progress' },
                { num: 5, title: 'Birlashgan Gaplar va Bog\'lovchilar', status: 'Locked' },
                { num: 6, title: 'Nemis Madaniyati: Ganza Ittifoqi', status: 'Locked' },
              ].map((m) => (
                <div
                  key={m.num}
                  className="p-4 rounded-2xl bg-[#f8f8f5] border border-[#e8e8e0] flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#e9edc9] text-[#5A5A40] font-bold text-sm flex items-center justify-center">
                      {m.num}
                    </div>
                    <span className="font-semibold text-sm text-[#1a1a1a]">{m.title}</span>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-white text-[#5A5A40] border border-[#e8e8e0] font-medium">
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
