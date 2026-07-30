import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import { TabType, Language, UserProfile, VocabWord } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FloatingActionButton } from './components/FloatingActionButton';
import { apiService } from './lib/services';

// Views
import { DashboardView } from './components/views/DashboardView';
import { LessonsView } from './components/views/LessonsView';
import { VocabView } from './components/views/VocabView';
import { GrammarView } from './components/views/GrammarView';
import { AiTutorView } from './components/views/AiTutorView';
import { OcrView } from './components/views/OcrView';
import { ExamsView } from './components/views/ExamsView';
import { SettingsView } from './components/views/SettingsView';
import { ReportsView } from './components/views/ReportsView';
import { AdminView } from './components/views/AdminView';

// Icons
import { Globe, Lock, Shield, Key, Eye, EyeOff, Sparkles, LogOut } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [lang, setLangState] = useState<Language>('uz');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState<string>('');

  // Handle i18n language persistence
  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('dm_language', newLang);
  };

  // Sync theme with Document Element class list
  useEffect(() => {
    const savedTheme = localStorage.getItem('dm_theme') as 'dark' | 'light' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }

    const savedLang = localStorage.getItem('dm_language') as Language | null;
    if (savedLang) {
      setLangState(savedLang);
    }

    const savedAuth = localStorage.getItem('dm_auth_session');
    if (savedAuth) {
      setIsLoggedIn(true);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('dm_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  // Integrated Authentication Flow
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (authMode === 'register') {
        if (!email.trim() || !username.trim() || password.length < 4) {
          setAuthError(lang === 'uz' ? "Barcha maydonlarni to'ldiring va parol kamida 4 ta belgi bo'lsin!" : "Заполните все поля и пароль должен быть от 4 символов!");
          return;
        }
        await apiService.register({ email, username, password });
      }

      // Automatically login after successful registration or direct login
      const res = await apiService.login({ username, password });
      localStorage.setItem('dm_auth_token', res.access_token);
      localStorage.setItem('dm_auth_session', res.user.username);
      localStorage.setItem('dm_user_role', res.user.role);
      setIsLoggedIn(true);
      setAuthError('');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const mockEmail = prompt(lang === 'uz' ? "Google pochtangizni kiriting:" : "Введите вашу Google почту:", "user@gmail.com");
      if (!mockEmail) return;
      
      const credential = `mock-google-jwt-token-email:${mockEmail}`;
      const res = await apiService.googleLogin(credential);
      
      localStorage.setItem('dm_auth_token', res.access_token);
      localStorage.setItem('dm_auth_session', res.user.username);
      localStorage.setItem('dm_user_role', res.user.role);
      setIsLoggedIn(true);
      setAuthError('');
    } catch (err: any) {
      setAuthError(err.message || 'Google Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dm_auth_session');
    localStorage.removeItem('dm_auth_token');
    localStorage.removeItem('dm_user_role');
    queryClient.clear();
    setIsLoggedIn(false);
  };

  // Load user progress metrics from FastAPI
  const { data: progress, refetch: refetchProgress } = useQuery({
    queryKey: ['progress'],
    queryFn: apiService.getProgress,
    enabled: isLoggedIn,
  });

  // Load all vocab words
  const { data: vocabList = [], refetch: refetchVocabs } = useQuery<VocabWord[]>({
    queryKey: ['vocabulary-all'],
    queryFn: apiService.getVocabulary,
    enabled: isLoggedIn,
  });

  const handleAddXp = async (amount: number) => {
    // Save/award study XP to backend progress
    queryClient.invalidateQueries({ queryKey: ['progress'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['activity'] });
  };

  const handleAddVocabWord = async (newWord: any) => {
    refetchVocabs();
  };

  // Assemble Profile info dynamically
  const userProfile: UserProfile = {
    name: localStorage.getItem('dm_auth_session') || "O'rganuvchi",
    level: progress ? `${progress.target_level} Level` : "B2 O'rta nemis tili",
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIbdrcjAMVx-7TNIA1NylVdL_VjpVWoF8JQhXP7wTG4YXmrA_z5q34E6kYz5gbous0FOa2IFx2NN2rMzkJcbVfJyOpQBe2qVvs3rBIcsa0eppqpv60VsrOZB1MQiNsf5iqx3RoTVN_FL0-G1QnqlQCatdUHOzejcyiPwWGO_ZH4b7v60C7j_V7BPv9F_e3bPbVdeoyirJaI1V1ZxagAEIoLdsfa6qO8vFmW6H5q9B0Yu6a2LxR4wcpgRG3qGxUf9EM-xxvZ7nIJa1C',
    streakDays: progress?.study_streak ?? 12,
    dailyGoalXp: progress ? (progress.weekly_goal_hours > 20 ? Math.round(progress.weekly_goal_hours) : 50) : 50,
    currentXp: progress ? (progress.total_xp || 0) : 35,
    completedLessonsCount: progress?.completed_lessons?.length || 0,
    todayMinutesSpent: 20,
  };

  const handleSetUserProfile = (updated: any) => {
    // Updates settings details
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative font-sans select-none overflow-hidden text-on-surface">
        {/* Background shapes */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="w-full max-w-md bg-surface border border-border rounded-[32px] p-8 md:p-10 shadow-2xl relative z-10 space-y-8 animate-fade-in text-on-surface">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-primary/20 text-primary border border-primary/30 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tight">DeutschMastery</h1>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest">Premium til o'rganish platformasi</p>
          </div>

          {authError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-semibold">
              {authError}
            </div>
          )}

          {/* Login/Register Tabs */}
          <div className="flex border-b border-border mb-4">
            <button
              type="button"
              className={`flex-1 pb-3 text-xs uppercase tracking-wider font-black transition-all ${authMode === 'login' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant/60 hover:text-on-surface'}`}
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
            >
              {lang === 'uz' ? 'Kirish' : 'Вход'}
            </button>
            <button
              type="button"
              className={`flex-1 pb-3 text-xs uppercase tracking-wider font-black transition-all ${authMode === 'register' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant/60 hover:text-on-surface'}`}
              onClick={() => { setAuthMode('register'); setAuthError(''); }}
            >
              {lang === 'uz' ? 'Ro\'yxatdan o\'tish' : 'Регистрация'}
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authMode === 'register' && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Elektron pochta</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-surface-variant border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition text-on-surface placeholder-on-surface-variant/40"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Foydalanuvchi nomi</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={authMode === 'register' ? "z.B. Max" : "Username yoki Email"}
                className="w-full bg-surface-variant border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition text-on-surface placeholder-on-surface-variant/40"
              />
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Parol</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-variant border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition text-on-surface placeholder-on-surface-variant/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-9 text-on-surface-variant hover:text-on-surface"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-primary text-on-primary hover:bg-primary-hover font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-primary/10 mt-6"
            >
              {authMode === 'login' 
                ? (lang === 'uz' ? 'Platformaga kirish' : 'Войти в платформу')
                : (lang === 'uz' ? 'Ro\'yxatdan o\'tish' : 'Зарегистрироваться')
              }
            </button>
          </form>

          {/* Social login divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-on-surface-variant/40 text-[9px] uppercase font-bold tracking-wider">
              {lang === 'uz' ? 'Yoki' : 'Или'}
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3.5 bg-surface border border-border text-on-surface hover:bg-surface-variant font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
              />
            </svg>
            {lang === 'uz' ? 'Google orqali kirish' : 'Войти через Google'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans antialiased relative">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="ml-20 transition-all duration-300 p-6 md:p-10 lg:p-12 max-w-[1600px] mx-auto min-h-screen flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="pb-6 border-b border-border mb-6">
            <Header user={userProfile} lang={lang} setLang={setLang} />
          </div>

          {/* Active View Container */}
          <div className="mt-6">
            {activeTab === 'dashboard' && (
              <DashboardView
                user={userProfile}
                lang={lang}
                setActiveTab={setActiveTab}
                vocabList={vocabList}
              />
            )}

            {activeTab === 'lessons' && (
              <LessonsView lang={lang} onAddXp={handleAddXp} />
            )}

            {activeTab === 'vocab' && (
              <VocabView
                vocabList={vocabList}
                lang={lang}
              />
            )}

            {activeTab === 'grammar' && (
              <GrammarView lang={lang} />
            )}

            {activeTab === 'ai_tutor' && (
              <AiTutorView lang={lang} onAddXp={handleAddXp} />
            )}

            {activeTab === 'ocr' && (
              <OcrView lang={lang} onAddVocab={handleAddVocabWord} />
            )}

            {activeTab === 'exams' && (
              <ExamsView lang={lang} onAddXp={handleAddXp} />
            )}

            {activeTab === 'reports' && (
              <ReportsView lang={lang} />
            )}

            {activeTab === 'admin' && (
              <AdminView lang={lang} />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                user={userProfile}
                setUser={handleSetUserProfile as any}
                lang={lang}
                setLang={setLang}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <Footer lang={lang} />
      </main>

      {/* Contextual FAB */}
      <FloatingActionButton setActiveTab={setActiveTab} lang={lang} />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainApp />
    </QueryClientProvider>
  );
}
