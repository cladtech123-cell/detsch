import React from 'react';
import { Bot } from 'lucide-react';
import { Language, TabType } from '../types';
import { i18nTranslations } from '../data/i18n';

interface FABProps {
  setActiveTab: (tab: TabType) => void;
  lang: Language;
}

export const FloatingActionButton: React.FC<FABProps> = ({ setActiveTab, lang }) => {
  const t = (key: string) => i18nTranslations[lang][key] || key;

  return (
    <button
      onClick={() => setActiveTab('ai_tutor')}
      className="fixed bottom-10 right-10 w-14 h-14 rounded-full bg-[#5A5A40] text-[#faedcd] shadow-lg shadow-[#5A5A40]/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
      title={t('fab.ai_chat')}
    >
      <Bot className="w-7 h-7" />
      <div className="absolute right-16 bg-white px-4 py-2 rounded-2xl border border-[#e8e8e0] shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        <p className="text-xs font-bold text-[#2d2d2d]">{t('fab.ai_chat')}</p>
      </div>
    </button>
  );
};
