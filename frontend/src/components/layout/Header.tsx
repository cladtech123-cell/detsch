import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '@/stores/uiStore';

/** Maps route paths to i18n title/subtitle key pairs. */
const ROUTE_META: Record<string, { titleKey: string; subtitleKey: string }> = {
  '/dashboard':   { titleKey: 'nav.dashboard',      subtitleKey: 'header.dashboard_subtitle' },
  '/lessons':     { titleKey: 'header.lessons_title',    subtitleKey: 'header.lessons_subtitle' },
  '/vocabulary':  { titleKey: 'header.vocabulary_title', subtitleKey: 'header.vocabulary_subtitle' },
  '/grammar':     { titleKey: 'header.grammar_title',    subtitleKey: 'header.grammar_subtitle' },
  '/exercises':   { titleKey: 'header.exercises_title',  subtitleKey: 'header.exercises_subtitle' },
  '/listening':   { titleKey: 'header.listening_title',  subtitleKey: 'header.listening_subtitle' },
  '/tutor':       { titleKey: 'header.tutor_title',      subtitleKey: 'header.tutor_subtitle' },
  '/flashcards':  { titleKey: 'header.flashcards_title', subtitleKey: 'header.flashcards_subtitle' },
  '/achievements':{ titleKey: 'header.achievements_title', subtitleKey: 'header.achievements_subtitle' },
  '/reports':     { titleKey: 'header.reports_title',    subtitleKey: 'header.reports_subtitle' },
  '/sync':        { titleKey: 'header.sync_title',       subtitleKey: 'header.sync_subtitle' },
  '/mistakes':    { titleKey: 'header.mistakes_title',   subtitleKey: 'header.mistakes_subtitle' },
  '/exams':       { titleKey: 'header.exams_title',      subtitleKey: 'header.exams_subtitle' },
  '/settings':    { titleKey: 'header.settings_title',   subtitleKey: 'header.settings_subtitle' },
  '/profile':     { titleKey: 'header.profile_title',    subtitleKey: 'header.profile_subtitle' },
};

export function Header() {
  const { t, i18n } = useTranslation();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const location = useLocation();
  const path = location.pathname;

  const meta = ROUTE_META[path] ?? {
    titleKey: 'header.default_title',
    subtitleKey: 'header.default_subtitle',
  };

  // Format date using the active i18n language
  const currentDate = new Date().toLocaleDateString(i18n.language === 'de' ? 'de-DE' : i18n.language === 'ru' ? 'ru-RU' : 'uz-UZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-6 pt-6 bg-transparent">
      {/* Dynamic Title Block */}
      <div className="flex items-center gap-3">
        <button
          className="rounded-md p-1.5 dm-text-muted hover:bg-surface-container-high lg:hidden shrink-0"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 className="font-headline-lg text-headline-lg dm-text font-extrabold leading-tight">
            {t(meta.titleKey)}
          </h2>
          <p className="dm-text-muted font-body-md text-sm">
            {path === '/dashboard' ? currentDate : t(meta.subtitleKey)}
          </p>
        </div>
      </div>

      {/* Notifications & Avatar Block */}
      <div className="flex items-center gap-4 ml-auto md:ml-0">
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-bold text-xs shadow-sm" style={{ backgroundColor: 'var(--dm-primary)', color: 'var(--dm-on-primary)' }}>
            D
          </div>
        </div>
        <button className="relative p-2 dm-text-muted hover:bg-surface-container rounded-full transition-colors active:scale-95">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-background"></span>
        </button>
      </div>
    </header>
  );
}
