import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NAV_ITEMS } from './nav';
import { useUiStore } from '@/stores/uiStore';

/** App brand block at the top of the sidebar. */
function Brand() {
  return (
    <div className="px-6 mb-8">
      <h1 className="font-headline-md text-headline-md font-black tracking-tight" style={{ color: 'var(--dm-primary)' }}>
        DeutschMastery
      </h1>
    </div>
  );
}

/** User info block under the brand. */
function UserBlock() {
  const { t } = useTranslation();
  return (
    <div className="px-6 mb-8">
      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--dm-surface-container-high)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm text-sm" style={{ backgroundColor: 'var(--dm-primary)', color: 'var(--dm-on-primary)' }}>
          D
        </div>
        <div>
          <p className="font-label-md font-semibold dm-text">{t('sidebar.welcome')}</p>
          <p className="text-[11px] font-medium dm-text-muted">
            {t('sidebar.level_streak', { level: 'A1.1', streak: 12 })}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Desktop sidebar + mobile drawer. */
export function Sidebar() {
  const { t } = useTranslation();
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-150',
      isActive
        ? 'font-bold border-r-4 border-primary bg-primary/5 shadow-sm dm-primary'
        : 'dm-text-muted hover:bg-surface-container-high',
    ].join(' ');

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar navigation shell */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r py-8 transition-transform duration-200 dm-sidebar',
          'lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between">
          <Brand />
          <button
            className="mr-3 mb-8 rounded-md p-1.5 dm-text-muted hover:bg-surface-container-high lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <UserBlock />

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={linkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined text-xl">{item.materialIcon}</span>
              <span className="font-label-md">{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer widgets inside sidebar */}
        <div className="px-4 mt-auto pt-6 border-t dm-border space-y-1">
          <div className="mb-4 p-4 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--dm-primary)', color: 'var(--dm-on-primary)' }}>
            <p className="font-label-sm uppercase tracking-wider mb-2 font-bold text-xs">{t('sidebar.upgrade_title')}</p>
            <p className="text-xs mb-3 opacity-90">{t('sidebar.upgrade_desc')}</p>
            <NavLink
              to="/settings"
              className="block w-full text-center py-2 rounded-lg font-bold text-xs hover:scale-[0.98] transition-transform shadow-sm"
              style={{ backgroundColor: 'var(--dm-surface)', color: 'var(--dm-primary)' }}
            >
              {t('sidebar.upgrade_btn')}
            </NavLink>
          </div>
          <div className="text-[10px] text-center font-medium tracking-wider dm-text-muted opacity-70">
            {t('sidebar.footer', { lesson: 7 })}
          </div>
        </div>
      </aside>
    </>
  );
}
