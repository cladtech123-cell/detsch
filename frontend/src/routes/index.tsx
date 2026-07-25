import { type RouteObject } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LandingPage } from '@/features/landing/LandingPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { TutorPage } from '@/features/tutor/TutorPage';
import { VocabularyPage } from '@/features/vocabulary/VocabularyPage';
import { GrammarPage } from '@/features/grammar/GrammarPage';
import { SyncPage } from '@/features/sync/SyncPage';
import { MistakesPage } from '@/features/mistakes/MistakesPage';
import { ExamsPage } from '@/features/exams/ExamsPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

// Study routes
import { LessonsPage } from '@/features/lessons/LessonsPage';
import { LessonDetailPage } from '@/features/lessons/LessonDetailPage';
import { FlashcardsPage } from '@/features/flashcards/FlashcardsPage';
import { ExercisesPage } from '@/features/exercises/ExercisesPage';
import { ListeningPage } from '@/features/listening/ListeningPage';
import { AchievementsPage } from '@/features/achievements/AchievementsPage';
import { ProfilePage } from '@/features/profile/ProfilePage';

// NOTE: PricingPage has been removed in Sprint 8.

export const routes: RouteObject[] = [
  // Public standalone Landing Page
  {
    path: '/',
    element: <LandingPage />,
  },
  // App Shell containing all study workspaces
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'tutor', element: <TutorPage /> },
      { path: 'vocabulary', element: <VocabularyPage /> },
      { path: 'grammar', element: <GrammarPage /> },
      { path: 'sync', element: <SyncPage /> },
      { path: 'mistakes', element: <MistakesPage /> },
      { path: 'exams', element: <ExamsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },

      // Study routes
      { path: 'lessons', element: <LessonsPage /> },
      { path: 'lessons/:id', element: <LessonDetailPage /> },
      { path: 'flashcards', element: <FlashcardsPage /> },
      { path: 'exercises', element: <ExercisesPage /> },
      { path: 'listening', element: <ListeningPage /> },
      { path: 'achievements', element: <AchievementsPage /> },
      { path: 'profile', element: <ProfilePage /> },

      // Catch-all redirects back to dashboard
      { path: '*', element: <DashboardPage /> },
    ],
  },
];
