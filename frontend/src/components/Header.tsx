import React, { useState } from 'react';
import { Flame, ChevronDown, Check } from 'lucide-react';
import { Language, UserProfile } from '../types';
import { i18nTranslations } from '../data/i18n';

interface HeaderProps {
  user: UserProfile;
  lang: Language;
  setLang: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, lang, setLang }) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const t = (key: string) => i18nTranslations[lang][key] || key;

  const languages: { code: Language; flag: string; label: string }[] = [
    { code: 'uz', flag: '🇺🇿', label: 'O\'zbek' },
    { code: 'ru', flag: '🇷🇺', label: 'Русский' },
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  ];

  const currentLangObj = languages.find((l) => l.code === lang) || languages[0];

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-30 w-full">
      <div>
        <h2 className="text-2xl md:text-3.5xl font-serif font-bold text-on-surface tracking-tight">
          {t('header.welcome').replace(', Julian', `, ${user.name}`).replace(' Julian', ` ${user.name}`).replace(' Юлиан', ` ${user.name}`)}
        </h2>
        <p className="text-on-surface-variant text-xs md:text-sm mt-1">
          {t('header.subtitle')}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Language Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-2.5 bg-surface px-4 py-2 rounded-full border border-border shadow-sm hover:bg-surface-variant transition-colors"
          >
            <span className="text-lg leading-none">{currentLangObj.flag}</span>
            <span className="text-xs font-semibold text-on-surface">{currentLangObj.label.split(' ')[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant" />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-2xl shadow-xl py-2 z-50 animate-fade-in">
              {languages.map((l) => {
                const isSelected = l.code === lang;
                return (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setIsLangOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-4 py-2 hover:bg-surface-variant transition-colors text-left text-xs ${
                      isSelected ? 'text-primary font-bold bg-primary/10' : 'text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{l.flag}</span>
                      <span>{l.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Streak Counter */}
        <div className="flex items-center gap-2 bg-surface-variant px-4 py-2 rounded-full border border-border shadow-sm">
          <Flame className="w-4 h-4 text-primary fill-primary" />
          <span className="font-bold text-xs text-on-surface">
            {user.streakDays} {t('header.streak').replace('12 ', '')}
          </span>
        </div>
      </div>
    </header>
  );
};
