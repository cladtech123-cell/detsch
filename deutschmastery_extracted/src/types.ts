export type Language = 'uz' | 'ru' | 'en' | 'de';

export type TabType = 
  | 'dashboard' 
  | 'lessons' 
  | 'vocab' 
  | 'grammar' 
  | 'ai_tutor' 
  | 'ocr' 
  | 'exams' 
  | 'settings';

export interface UserProfile {
  name: string;
  level: string; // e.g. "B2 O'rta nemis tili"
  avatarUrl: string;
  streakDays: number;
  dailyGoalXp: number;
  currentXp: number;
  completedLessonsCount: number;
  todayMinutesSpent: number;
}

export interface VocabWord {
  id: string;
  word: string; // e.g. "nachhaltig"
  article?: string; // e.g. "die"
  translation: Record<Language, string>;
  phonetic?: string;
  category: 'B1' | 'B2' | 'Daily' | 'Business' | 'Grammar';
  exampleGerman: string;
  exampleTranslation: Record<Language, string>;
  isMastered?: boolean;
}

export interface GrammarTopic {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  progress: number; // 0-100
  keyRules: string[];
  examples: { german: string; translation: Record<Language, string> }[];
  exerciseCount: number;
}

export interface Lesson {
  id: string;
  number: number;
  title: Record<Language, string>;
  description: Record<Language, string>;
  level: string;
  progressPercent: number;
  isCurrent?: boolean;
  contentHtml?: string;
  modalVerbsFocus?: string[];
  quizQuestions?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface ActivityItem {
  id: string;
  type: 'test' | 'chat' | 'vocab' | 'lesson';
  title: Record<Language, string>;
  timeAgo: Record<Language, string>;
  xpEarned: number;
  scorePercent?: number;
  minutesSpent?: number;
}

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: Record<Language, string>;
  category: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  correction?: string;
  audioUrl?: string;
}

export interface OcrResultData {
  extractedText: string;
  translation: string;
  cefrLevel: string;
  vocabularyList: {
    word: string;
    translation: string;
    context: string;
    type: string;
  }[];
  grammarNotes: string[];
}
