import React, { useState } from 'react';
import { Settings, Save, Check, User, Globe, Target } from 'lucide-react';
import { Language, UserProfile } from '../../types';
import { i18nTranslations } from '../../data/i18n';

interface SettingsViewProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  lang: Language;
  setLang: (lang: Language) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, setUser, lang, setLang }) => {
  const t = (key: string) => i18nTranslations[lang][key] || key;

  const [userName, setUserName] = useState(user.name);
  const [userLevel, setUserLevel] = useState(user.level);
  const [dailyGoal, setDailyGoal] = useState(user.dailyGoalXp);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser((prev) => ({
      ...prev,
      name: userName,
      level: userLevel,
      dailyGoalXp: dailyGoal,
    }));

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-[#1a1a1a]">{t('settings.title')}</h2>
        <p className="text-sm text-[#5c5c52] mt-1">{t('settings.subtitle')}</p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-3">
          <Check className="w-5 h-5" />
          <span>Sozlamalar muvaffaqiyatli saqlandi!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-card rounded-[28px] p-6 md:p-8 space-y-6">
        {/* User Info Section */}
        <div className="space-y-4 pb-6 border-b border-[#e8e8e0]">
          <h3 className="text-base font-serif font-bold text-[#1a1a1a] flex items-center gap-2">
            <User className="w-5 h-5 text-[#5A5A40]" />
            <span>Foydalanuvchi Profili</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#5c5c52] mb-1.5 font-medium">Ismingiz</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-[#f8f8f5] border border-[#e8e8e0] rounded-xl px-4 py-2.5 text-xs text-[#2d2d2d] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#5c5c52] mb-1.5 font-medium">Joriy Daraja (Level)</label>
              <input
                type="text"
                value={userLevel}
                onChange={(e) => setUserLevel(e.target.value)}
                className="w-full bg-[#f8f8f5] border border-[#e8e8e0] rounded-xl px-4 py-2.5 text-xs text-[#2d2d2d] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
          </div>
        </div>

        {/* Language Selection Section */}
        <div className="space-y-4 pb-6 border-b border-[#e8e8e0]">
          <h3 className="text-base font-serif font-bold text-[#1a1a1a] flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#5A5A40]" />
            <span>{t('settings.language')}</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { code: 'uz', flag: '🇺🇿', label: 'O\'zbek' },
              { code: 'ru', flag: '🇷🇺', label: 'Русский' },
              { code: 'en', flag: '🇬🇧', label: 'English' },
              { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
            ].map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code as Language)}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  lang === l.code
                    ? 'bg-[#e9edc9] border-[#5A5A40] text-[#3a3a2a] font-bold'
                    : 'bg-[#f8f8f5] border-[#e8e8e0] text-[#2d2d2d] hover:bg-white'
                }`}
              >
                <span className="text-lg">{l.flag}</span>
                <span className="text-xs">{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Daily Goal XP Section */}
        <div className="space-y-4 pb-2">
          <h3 className="text-base font-serif font-bold text-[#1a1a1a] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#5A5A40]" />
            <span>{t('settings.daily_xp')}</span>
          </h3>

          <div className="grid grid-cols-4 gap-3">
            {[30, 50, 80, 100].map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => setDailyGoal(goal)}
                className={`py-3 rounded-xl border text-center font-bold text-xs transition-all ${
                  dailyGoal === goal
                    ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-sm'
                    : 'bg-[#f8f8f5] border-[#e8e8e0] text-[#2d2d2d] hover:bg-white'
                }`}
              >
                {goal} XP
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-[#5A5A40] text-white font-bold text-xs hover:bg-[#4a4a34] transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>{t('settings.save')}</span>
        </button>
      </form>
    </div>
  );
};
