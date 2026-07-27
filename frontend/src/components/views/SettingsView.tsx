import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, Check, User, Globe, Target, Cpu, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';
import { Language, UserProfile } from '../../types';
import { i18nTranslations } from '../../data/i18n';
import { apiService } from '../../lib/services';

interface SettingsViewProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  lang: Language;
  setLang: (lang: Language) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, setUser, lang, setLang }) => {
  const t = (key: string) => i18nTranslations[lang][key] || key;
  const queryClient = useQueryClient();

  const [userName, setUserName] = useState(user.name);
  const [userLevel, setUserLevel] = useState(user.level);
  const [dailyGoal, setDailyGoal] = useState(user.dailyGoalXp);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // AI Connection Test states
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'openai'>('gemini');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'failed'>('idle');
  const [latency, setLatency] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Load progress details to populate fields on mount
  const { data: progress } = useQuery({
    queryKey: ['progress-settings'],
    queryFn: apiService.getProgress,
  });

  useEffect(() => {
    if (progress) {
      setUserLevel(progress.target_level || 'B2');
      if (progress.ai_provider) {
        setSelectedProvider(progress.ai_provider === 'openai' ? 'openai' : 'gemini');
      }
    }
  }, [progress]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiService.updateProgress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    },
    onError: (err: any) => {
      alert(err.message || 'Xatolik');
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Save to local storage for frontend simulated profile
    setUser((prev) => ({
      ...prev,
      name: userName,
      level: userLevel,
      dailyGoalXp: dailyGoal,
    }));

    // Update backend progress values
    updateMutation.mutate({
      reading: userLevel,
      writing: userLevel,
      speaking: userLevel,
      listening: userLevel,
      grammar: userLevel,
      vocabulary: userLevel,
      ai_provider: selectedProvider,
      weekly_goal: dailyGoal,
    });
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    setLatency(null);
    setApiError(null);

    try {
      const data = await apiService.testAIConnection(selectedProvider);
      if (data.status === 'connected') {
        setConnectionStatus('connected');
        setLatency(data.response_time);
      } else {
        setConnectionStatus('failed');
        setApiError(data.error || 'Connection failed');
      }
    } catch (err: any) {
      setConnectionStatus('failed');
      setApiError(err.message || 'Connection error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-on-surface">{t('settings.title')}</h2>
        <p className="text-sm text-on-surface-variant mt-1">{t('settings.subtitle')}</p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-semibold flex items-center gap-3">
          <Check className="w-5 h-5" />
          <span>Sozlamalar muvaffaqiyatli saqlandi!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-surface border border-border rounded-[28px] p-6 md:p-8 space-y-6">
        {/* User Info Section */}
        <div className="space-y-4 pb-6 border-b border-border">
          <h3 className="text-base font-serif font-bold text-on-surface flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <span>Foydalanuvchi Profili</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-on-surface-variant mb-1.5 font-medium">Ismingiz</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-surface-variant border border-border rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs text-on-surface-variant mb-1.5 font-medium">Maqsad Darajasi (CEFR Target)</label>
              <input
                type="text"
                value={userLevel}
                onChange={(e) => setUserLevel(e.target.value)}
                className="w-full bg-surface-variant border border-border rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Language Selection Section */}
        <div className="space-y-4 pb-6 border-b border-border">
          <h3 className="text-base font-serif font-bold text-on-surface flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
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
                    ? 'bg-primary/20 border-primary text-on-surface font-bold'
                    : 'bg-surface-variant border-border text-on-surface hover:bg-surface'
                }`}
              >
                <span className="text-lg">{l.flag}</span>
                <span className="text-xs">{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Connection Test Section */}
        <div className="space-y-4 pb-6 border-b border-border">
          <h3 className="text-base font-serif font-bold text-on-surface flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            <span>AI Tutor Ulanish Konsoli</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-on-surface-variant mb-1.5 font-medium">Model Provayderi</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value as any)}
                className="w-full bg-surface-variant border border-border rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="gemini">Gemini AI (Google Studio)</option>
                <option value="openai">OpenAI (GPT Models)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={testConnection}
                disabled={connectionStatus === 'testing'}
                className="w-full py-2.5 bg-surface-variant border border-border hover:bg-surface text-on-surface font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className={`w-4 h-4 ${connectionStatus === 'testing' ? 'animate-spin' : ''}`} />
                <span>Ulanishni tekshirish</span>
              </button>
            </div>
          </div>

          {connectionStatus !== 'idle' && (
            <div className="p-4 rounded-xl border text-xs">
              {connectionStatus === 'testing' && (
                <p className="text-on-surface-variant">API javob tezligi o'lchanmoqda...</p>
              )}
              {connectionStatus === 'connected' && (
                <p className="text-emerald-400 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Ulanish muvaffaqiyatli! Kechikish: {latency}s</span>
                </p>
              )}
              {connectionStatus === 'failed' && (
                <div className="space-y-1 text-red-400">
                  <p className="font-semibold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Ulanish amalga oshmadi</span>
                  </p>
                  <p className="text-[10px] font-mono whitespace-pre-wrap">{apiError}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Daily Goal XP Section */}
        <div className="space-y-4 pb-2">
          <h3 className="text-base font-serif font-bold text-on-surface flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <span>{t('settings.daily_xp')}</span>
          </h3>

          <div className="grid grid-cols-4 gap-3 text-xs">
            {[30, 50, 80, 100].map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => setDailyGoal(goal)}
                className={`py-3 rounded-xl border text-center font-bold transition-all ${
                  dailyGoal === goal
                    ? 'bg-primary text-on-primary border-primary shadow-sm'
                    : 'bg-surface-variant border-border text-on-surface hover:bg-surface'
                }`}
              >
                {goal} XP
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-sm uppercase tracking-wider"
        >
          <Save className="w-4 h-4" />
          <span>{t('settings.save')}</span>
        </button>
      </form>
    </div>
  );
};
