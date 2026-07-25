import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Check, Clock, Award, Sparkles, Palette, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService } from '@/lib/services';
import { useThemeStore, type Theme } from '@/stores/themeStore';

interface Progress {
  current_course: string;
  current_lesson: number;
  weekly_goal_hours: number;
  target_level: string;
  reading_level: string;
  listening_level: string;
  writing_level: string;
  speaking_level: string;
  grammar_level: string;
  vocabulary_level: string;
  ai_provider?: string;
  ai_model?: string;
}

const PROVIDER_MODELS: Record<string, string[]> = {
  gemini: ['gemini-2.5-flash', 'gemini-2.0-flash'],
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'openai/gpt-oss-120b'],
  openai: ['gpt-4o-mini', 'gpt-4o'],
};

const SUPPORTED_LANGS = [
  { code: 'uz', labelKey: 'settings.lang_uz', flag: '🇺🇿' },
  { code: 'ru', labelKey: 'settings.lang_ru', flag: '🇷🇺' },
  { code: 'de', labelKey: 'settings.lang_de', flag: '🇩🇪' },
];

const THEME_OPTIONS: { value: Theme; labelKey: string; icon: string }[] = [
  { value: 'light', labelKey: 'settings.theme_light', icon: '☀️' },
  { value: 'dark',  labelKey: 'settings.theme_dark',  icon: '🌙' },
  { value: 'system',labelKey: 'settings.theme_system', icon: '💻' },
];

/** Reusable themed input class */
const inputCls =
  'w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 transition dm-input focus:border-[var(--dm-primary)] focus:ring-[var(--dm-primary)]/30';
const labelCls = 'text-[11px] font-mono uppercase tracking-wider dm-text-muted';

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useThemeStore();

  // Course states
  const [lesson, setLesson] = useState(7);
  const [weeklyGoal, setWeeklyGoal] = useState(10);
  const [reading, setReading] = useState('A1.1');
  const [writing, setWriting] = useState('A1.1');
  const [listening, setListening] = useState('A1.1');
  const [speaking, setSpeaking] = useState('A1.1');
  const [grammar, setGrammar] = useState('A1.1');
  const [vocabulary, setVocabulary] = useState('A1.1');
  const [aiProvider, setAiProvider] = useState('gemini');
  const [aiModel, setAiModel] = useState('gemini-2.5-flash');

  // Test Connection
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'connected' | 'failed' | null;
    responseTime?: number;
    modelUsed?: string;
    error?: string;
  }>({ status: null });

  const { data: progress, isLoading } = useQuery<Progress>({
    queryKey: ['settings-progress'],
    queryFn: apiService.getProgress,
  });

  useEffect(() => {
    if (progress) {
      setLesson(progress.current_lesson);
      setWeeklyGoal(progress.weekly_goal_hours);
      setReading(progress.reading_level);
      setWriting(progress.writing_level);
      setListening(progress.listening_level);
      setSpeaking(progress.speaking_level);
      setGrammar(progress.grammar_level);
      setVocabulary(progress.vocabulary_level);
      if (progress.ai_provider) setAiProvider(progress.ai_provider);
      if (progress.ai_model) setAiModel(progress.ai_model);
    }
  }, [progress]);

  const updateMutation = useMutation({
    mutationFn: (vars: object) => apiService.updateProgress(vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings-progress'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      alert(t('settings.save_success'));
    },
    onError: (err: { message?: string }) => {
      alert(err.message || t('settings.save_error'));
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      current_lesson: lesson,
      weekly_goal: weeklyGoal,
      reading,
      writing,
      listening,
      speaking,
      grammar,
      vocabulary,
      ai_provider: aiProvider,
      ai_model: aiModel,
    });
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    setTestResult({ status: null });
    try {
      const res = await apiService.testAIConnection(aiProvider, aiModel);
      if (res.status === 'connected') {
        setTestResult({
          status: 'connected',
          responseTime: res.response_time,
          modelUsed: res.model_used,
        });
      } else {
        setTestResult({ status: 'failed', error: res.error || t('settings.connection_failed') });
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      setTestResult({
        status: 'failed',
        error: e.response?.data?.detail || e.message || 'Network error.',
      });
    } finally {
      setTestLoading(false);
    }
  };

  const levelOptions = ['A0', 'A1.1', 'A1.2', 'A2.1', 'A2.2', 'B1.1', 'B1.2', 'B2'];

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--dm-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl mx-auto">
      {/* Card wrapper */}
      <div
        className="border rounded-2xl backdrop-blur-md p-6 shadow-panel transition-colors duration-300"
        style={{ background: 'var(--dm-surface)', borderColor: 'var(--dm-outline-variant)' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-6" style={{ borderColor: 'var(--dm-outline-variant)' }}>
          <div>
            <h1 className="text-xl font-bold dm-text tracking-tight flex items-center gap-2">
              <Settings className="dm-primary" size={20} /> {t('settings.title')}
            </h1>
            <p className="dm-text-muted text-xs mt-1">{t('settings.subtitle')}</p>
          </div>
          <button
            type="submit"
            className="py-2 px-4 rounded-xl font-semibold text-xs tracking-wider transition shadow-lg flex items-center gap-1"
            style={{ backgroundColor: 'var(--dm-primary)', color: 'var(--dm-on-primary)' }}
            disabled={updateMutation.isPending}
          >
            <Check size={14} /> {updateMutation.isPending ? t('settings.saving') : t('settings.save')}
          </button>
        </div>

        {/* ─── Appearance Section ────────────────────────────────── */}
        <section className="mb-6 space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider dm-primary flex items-center gap-1.5 border-b pb-2" style={{ borderColor: 'var(--dm-outline-variant)' }}>
            <Palette size={14} /> {t('settings.appearance')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language Selector */}
            <div className="space-y-2">
              <label className={labelCls}>
                <Globe size={12} className="inline mr-1" />
                {t('settings.language')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SUPPORTED_LANGS.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => i18n.changeLanguage(lang.code)}
                    className="flex flex-col items-center gap-1 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all duration-150"
                    style={{
                      borderColor: i18n.language === lang.code ? 'var(--dm-primary)' : 'var(--dm-input-border)',
                      backgroundColor: i18n.language === lang.code ? 'color-mix(in srgb, var(--dm-primary) 10%, transparent)' : 'var(--dm-input-bg)',
                      color: i18n.language === lang.code ? 'var(--dm-primary)' : 'var(--dm-on-surface-variant)',
                      boxShadow: i18n.language === lang.code ? '0 0 0 2px color-mix(in srgb, var(--dm-primary) 30%, transparent)' : 'none',
                    }}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span>{t(lang.labelKey)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-2">
              <label className={labelCls}>
                <Palette size={12} className="inline mr-1" />
                {t('settings.theme')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTheme(opt.value)}
                    className="flex flex-col items-center gap-1 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all duration-150"
                    style={{
                      borderColor: theme === opt.value ? 'var(--dm-primary)' : 'var(--dm-input-border)',
                      backgroundColor: theme === opt.value ? 'color-mix(in srgb, var(--dm-primary) 10%, transparent)' : 'var(--dm-input-bg)',
                      color: theme === opt.value ? 'var(--dm-primary)' : 'var(--dm-on-surface-variant)',
                      boxShadow: theme === opt.value ? '0 0 0 2px color-mix(in srgb, var(--dm-primary) 30%, transparent)' : 'none',
                    }}
                  >
                    <span className="text-xl">{opt.icon}</span>
                    <span>{t(opt.labelKey)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Main Grid: Course + AI / CEFR ──────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Course & AI */}
          <div className="space-y-6">
            {/* Course params */}
            <div className="space-y-4">
              <h2 className="text-xs font-mono uppercase tracking-wider dm-primary flex items-center gap-1.5 border-b pb-2" style={{ borderColor: 'var(--dm-outline-variant)' }}>
                <Clock size={14} /> {t('settings.course_params')}
              </h2>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className={labelCls}>{t('settings.current_lesson_label')}</label>
                  <input
                    type="number"
                    value={lesson}
                    onChange={(e) => setLesson(parseInt(e.target.value) || 1)}
                    min={1}
                    max={24}
                    className={inputCls}
                    required
                  />
                  <span className="text-[10px] dm-text-muted block">{t('settings.current_lesson_hint')}</span>
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls}>{t('settings.weekly_goal_label')}</label>
                  <input
                    type="number"
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(parseInt(e.target.value) || 5)}
                    min={1}
                    max={40}
                    className={inputCls}
                    required
                  />
                  <span className="text-[10px] dm-text-muted block">{t('settings.weekly_goal_hint')}</span>
                </div>
              </div>
            </div>

            {/* AI Settings */}
            <div className="space-y-4 border-t pt-6" style={{ borderColor: 'var(--dm-outline-variant)' }}>
              <h2 className="text-xs font-mono uppercase tracking-wider dm-primary flex items-center gap-1.5 border-b pb-2" style={{ borderColor: 'var(--dm-outline-variant)' }}>
                <Sparkles size={14} /> {t('settings.ai_settings')}
              </h2>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className={labelCls}>{t('settings.ai_provider')}</label>
                  <select
                    value={aiProvider}
                    onChange={(e) => {
                      const prov = e.target.value;
                      setAiProvider(prov);
                      setAiModel(PROVIDER_MODELS[prov][0]);
                      setTestResult({ status: null });
                    }}
                    className={inputCls}
                  >
                    <option value="gemini">Google Gemini</option>
                    <option value="groq">Groq AI</option>
                    <option value="openai">OpenAI</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls}>{t('settings.ai_model')}</label>
                  <select
                    value={aiModel}
                    onChange={(e) => {
                      setAiModel(e.target.value);
                      setTestResult({ status: null });
                    }}
                    className={inputCls}
                  >
                    {PROVIDER_MODELS[aiProvider]?.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Test Connection */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testLoading}
                    className="w-full py-2 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 border"
                    style={{
                      backgroundColor: 'var(--dm-surface-container)',
                      borderColor: 'var(--dm-outline-variant)',
                      color: 'var(--dm-on-surface)',
                    }}
                  >
                    {testLoading ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--dm-primary)] border-t-transparent" />
                    ) : (
                      t('settings.test_connection')
                    )}
                  </button>

                  {testResult.status === 'connected' && (
                    <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-[10px] leading-relaxed flex items-center justify-between">
                      <span>
                        {t('settings.connected')} <strong className="font-mono">{testResult.modelUsed}</strong>
                      </span>
                      <span className="font-mono">⚡ {testResult.responseTime}s</span>
                    </div>
                  )}

                  {testResult.status === 'failed' && (
                    <div className="p-2.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 text-[10px] leading-normal">
                      <p className="font-semibold mb-0.5">{t('settings.connection_failed')}</p>
                      <p className="text-[9px] font-mono leading-tight opacity-80">{testResult.error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: CEFR */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-wider dm-primary flex items-center gap-1.5 border-b pb-2" style={{ borderColor: 'var(--dm-outline-variant)' }}>
              <Award size={14} /> {t('settings.cefr_title')}
            </h2>
            <p className="text-[10px] dm-text-muted leading-normal">{t('settings.cefr_desc')}</p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {([
                [t('settings.reading'), reading, setReading],
                [t('settings.writing'), writing, setWriting],
                [t('settings.listening'), listening, setListening],
                [t('settings.speaking'), speaking, setSpeaking],
                [t('settings.grammar_skill'), grammar, setGrammar],
                [t('settings.vocabulary_skill'), vocabulary, setVocabulary],
              ] as [string, string, (v: string) => void][]).map(([label, val, setter]) => (
                <div key={label} className="space-y-1">
                  <label className="text-[10px] font-mono uppercase dm-text-muted">{label}</label>
                  <select
                    value={val}
                    onChange={(e) => setter(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs dm-input"
                  >
                    {levelOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
