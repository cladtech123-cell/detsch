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
    { code: 'uz', flag: '🇺🇿', label: 'O\'zbek (Latin)' },
    { code: 'ru', flag: '🇷🇺', label: 'Русский' },
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  ];

  const currentLangObj = languages.find((l) => l.code === lang) || languages[0];

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 relative z-30">
      <div>
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#1a1a1a] tracking-tight">
          {t('header.welcome')}
        </h2>
        <p className="text-[#5c5c52] text-sm md:text-base mt-1">
          {t('header.subtitle')}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-full border border-[#e8e8e0] shadow-sm hover:bg-[#f8f8f5] transition-colors"
          >
            <span className="text-lg leading-none">{currentLangObj.flag}</span>
            <span className="text-sm font-medium text-[#2d2d2d]">{currentLangObj.label.split(' ')[0]}</span>
            <ChevronDown className="w-4 h-4 text-[#71716b]" />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-[#e8e8e0] rounded-2xl shadow-xl py-2 z-50 animate-fade-in">
              {languages.map((l) => {
                const isSelected = l.code === lang;
                return (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setIsLangOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-4 py-2.5 hover:bg-[#f5f5f0] transition-colors text-left text-sm ${
                      isSelected ? 'text-[#5A5A40] font-bold bg-[#e9edc9]/50' : 'text-[#2d2d2d]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{l.flag}</span>
                      <span>{l.label}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#5A5A40]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Streak Counter */}
        <div className="flex items-center gap-2.5 bg-[#faedcd] px-4 py-2 rounded-full border border-[#D4A373]/30 shadow-sm">
          <Flame className="w-5 h-5 text-[#D4A373] fill-[#D4A373]" />
          <span className="font-bold text-sm text-[#5a3a1a]">
            {user.streakDays} {t('header.streak').replace('12 ', '')}
          </span>
        </div>

        {/* User Profile Avatar */}
        <div className="w-10 h-10 rounded-full border-2 border-[#5A5A40]/30 p-0.5 overflow-hidden shadow-sm bg-white">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};
