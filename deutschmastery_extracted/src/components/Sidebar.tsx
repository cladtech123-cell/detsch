import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Languages, 
  GraduationCap, 
  Bot, 
  ScanText, 
  Award, 
  Settings,
  Globe
} from 'lucide-react';
import { TabType, Language } from '../types';
import { i18nTranslations } from '../data/i18n';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  lang: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, lang }) => {
  const t = (key: string) => i18nTranslations[lang][key] || key;

  const navItems: { id: TabType; icon: React.ReactNode; labelKey: string }[] = [
    { id: 'dashboard', icon: <LayoutDashboard className="w-5 h-5 shrink-0" />, labelKey: 'sidebar.dashboard' },
    { id: 'lessons', icon: <BookOpen className="w-5 h-5 shrink-0" />, labelKey: 'sidebar.lessons' },
    { id: 'vocab', icon: <Languages className="w-5 h-5 shrink-0" />, labelKey: 'sidebar.vocab' },
    { id: 'grammar', icon: <GraduationCap className="w-5 h-5 shrink-0" />, labelKey: 'sidebar.grammar' },
    { id: 'ai_tutor', icon: <Bot className="w-5 h-5 shrink-0" />, labelKey: 'sidebar.ai_tutor' },
    { id: 'ocr', icon: <ScanText className="w-5 h-5 shrink-0" />, labelKey: 'sidebar.ocr' },
    { id: 'exams', icon: <Award className="w-5 h-5 shrink-0" />, labelKey: 'sidebar.exams' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-full flex flex-col py-6 z-40 overflow-hidden bg-white border-r border-[#e8e8e0] w-20 hover:w-64 transition-all duration-300 group shadow-sm">
      {/* Brand Header */}
      <div className="px-5 mb-8 flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-[#5A5A40] flex items-center justify-center shrink-0 shadow-md shadow-[#5A5A40]/10">
          <Globe className="w-6 h-6 text-[#faedcd]" />
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">
          <h1 className="text-base font-serif font-bold text-[#2d2d2d] tracking-tight">{t('sidebar.title')}</h1>
          <p className="text-[10px] text-[#71716b] uppercase tracking-widest">{t('sidebar.subtitle')}</p>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex flex-col gap-2 px-3">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 text-left w-full ${
                isActive
                  ? 'bg-[#5A5A40] text-white font-semibold shadow-md shadow-[#5A5A40]/15'
                  : 'text-[#5c5c52] hover:bg-[#f8f8f5] hover:text-[#2d2d2d]'
              }`}
            >
              {item.icon}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm whitespace-nowrap">
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Settings at Bottom */}
      <div className="mt-auto px-3 flex flex-col gap-2">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 text-left w-full ${
            activeTab === 'settings'
              ? 'bg-[#5A5A40] text-white font-semibold shadow-md shadow-[#5A5A40]/15'
              : 'text-[#5c5c52] hover:bg-[#f8f8f5] hover:text-[#2d2d2d]'
          }`}
        >
          <Settings className="w-5 h-5 shrink-0" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm whitespace-nowrap">
            {t('sidebar.settings')}
          </span>
        </button>
      </div>
    </nav>
  );
};
