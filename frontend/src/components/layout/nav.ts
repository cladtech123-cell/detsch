import {
  LayoutDashboard,
  BookOpen,
  Bookmark,
  Library,
  PenTool,
  Headphones,
  Mic,
  Layers,
  Trophy,
  BarChart2,
  Settings,
  CloudUpload,
  AlertOctagon,
  Award,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  /** i18n key resolved via t(labelKey) */
  labelKey: string;
  to: string;
  icon: LucideIcon;
  materialIcon: string;
  description: string;
}

/** Primary navigation entries for the DeutschMastery sidebar. */
export const NAV_ITEMS: NavItem[] = [
  {
    labelKey: 'nav.dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
    materialIcon: 'dashboard',
    description: 'Dashboard & progress',
  },
  {
    labelKey: 'nav.lessons',
    to: '/lessons',
    icon: BookOpen,
    materialIcon: 'menu_book',
    description: 'Momente A1.1 syllabus',
  },
  {
    labelKey: 'nav.vocabulary',
    to: '/vocabulary',
    icon: Bookmark,
    materialIcon: 'translate',
    description: 'Vocabulary & bulk import',
  },
  {
    labelKey: 'nav.grammar',
    to: '/grammar',
    icon: Library,
    materialIcon: 'school',
    description: 'Rules, examples & quizzes',
  },
  {
    labelKey: 'nav.exercises',
    to: '/exercises',
    icon: PenTool,
    materialIcon: 'edit_note',
    description: 'Interactive sentence building',
  },
  {
    labelKey: 'nav.listening',
    to: '/listening',
    icon: Headphones,
    materialIcon: 'headset',
    description: 'Audio exercises & feedback',
  },
  {
    labelKey: 'nav.speaking',
    to: '/tutor',
    icon: Mic,
    materialIcon: 'mic',
    description: 'AI conversation & coaching',
  },
  {
    labelKey: 'nav.flashcards',
    to: '/flashcards',
    icon: Layers,
    materialIcon: 'style',
    description: 'Interactive repetition deck',
  },
  {
    labelKey: 'nav.achievements',
    to: '/achievements',
    icon: Trophy,
    materialIcon: 'emoji_events',
    description: 'Streaks & target milestones',
  },
  {
    labelKey: 'nav.statistics',
    to: '/reports',
    icon: BarChart2,
    materialIcon: 'quiz',
    description: 'Weekly and monthly insights',
  },
  {
    labelKey: 'nav.sync',
    to: '/sync',
    icon: CloudUpload,
    materialIcon: 'cloud_upload',
    description: 'OCR file upload',
  },
  {
    labelKey: 'nav.mistakes',
    to: '/mistakes',
    icon: AlertOctagon,
    materialIcon: 'error',
    description: 'Work on incorrect answers',
  },
  {
    labelKey: 'nav.exams',
    to: '/exams',
    icon: Award,
    materialIcon: 'verified',
    description: 'CEFR tests',
  },
  {
    labelKey: 'nav.settings',
    to: '/settings',
    icon: Settings,
    materialIcon: 'settings',
    description: 'AI model & profile options',
  },
];
