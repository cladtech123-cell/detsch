import React, { useState } from 'react';
import { TabType, Language, UserProfile, VocabWord } from './types';
import { initialUserProfile, initialVocabWords } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FloatingActionButton } from './components/FloatingActionButton';

// Views
import { DashboardView } from './components/views/DashboardView';
import { LessonsView } from './components/views/LessonsView';
import { VocabView } from './components/views/VocabView';
import { GrammarView } from './components/views/GrammarView';
import { AiTutorView } from './components/views/AiTutorView';
import { OcrView } from './components/views/OcrView';
import { ExamsView } from './components/views/ExamsView';
import { SettingsView } from './components/views/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [lang, setLang] = useState<Language>('uz');
  const [user, setUser] = useState<UserProfile>(initialUserProfile);
  const [vocabList, setVocabList] = useState<VocabWord[]>(initialVocabWords);

  const handleAddXp = (amount: number) => {
    setUser((prev) => ({
      ...prev,
      currentXp: Math.min(prev.dailyGoalXp, prev.currentXp + amount),
    }));
  };

  const handleAddVocabWord = (newWord: VocabWord) => {
    setVocabList((prev) => [newWord, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#2d2d2d] selection:bg-[#ccd5ae]/50 font-sans antialiased relative">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} />

      {/* Main Content Area */}
      <main className="ml-20 transition-all duration-300 md:ml-20 p-6 md:p-10 lg:p-12 max-w-[1600px] mx-auto min-h-screen flex flex-col justify-between">
        <div>
          {/* Header */}
          <Header user={user} lang={lang} setLang={setLang} />

          {/* Active View Container */}
          <div className="mt-6">
            {activeTab === 'dashboard' && (
              <DashboardView
                user={user}
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
                setVocabList={setVocabList}
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

            {activeTab === 'settings' && (
              <SettingsView
                user={user}
                setUser={setUser}
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
