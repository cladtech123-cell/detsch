import { Trophy, Star, Zap, Flame, Award, Shield } from 'lucide-react';

interface BadgeItem {
  id: number;
  title: string;
  description: string;
  icon: any;
  colorClass: string;
  unlocked: boolean;
}

const SEED_BADGES: BadgeItem[] = [
  {
    id: 1,
    title: 'Frühaufsteher',
    description: 'Lerne vor 8:00 Uhr morgens.',
    icon: Zap,
    colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    unlocked: true
  },
  {
    id: 2,
    title: 'Flammenmeister',
    description: '10 Tage Streak erreichen.',
    icon: Flame,
    colorClass: 'text-error bg-error/10 border-error/20',
    unlocked: true
  },
  {
    id: 3,
    title: 'Wortakrobat',
    description: '100 Wörter gelernt.',
    icon: Star,
    colorClass: 'text-primary bg-primary/10 border-primary/20',
    unlocked: true
  },
  {
    id: 4,
    title: 'Grammatikgenie',
    description: 'Lektion 7 Grammatik abgeschlossen.',
    icon: Award,
    colorClass: 'text-tertiary bg-tertiary/10 border-tertiary/20',
    unlocked: true
  },
  {
    id: 5,
    title: 'Goethe-Kandidat',
    description: 'Bestehe die Goethe A1 Test-Simulation.',
    icon: Shield,
    colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    unlocked: false
  }
];

export function AchievementsPage() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Achievements Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-2xl font-black text-on-surface tracking-tight">Erfolge & Meilensteine</h3>
          <p className="text-on-surface-variant text-sm mt-2">
            Verfolgen Sie Ihre Erfolge auf dem Weg zu B2. Jedes abgeschlossene Thema bringt Sie neuen Abzeichen näher!
          </p>
        </div>
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 shadow-inner">
          <Trophy size={32} />
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SEED_BADGES.map((badge) => {
          const Icon = badge.icon;
          return (
            <div 
              key={badge.id}
              className={`bg-white border rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${
                badge.unlocked 
                  ? 'border-slate-200 shadow-sm hover:shadow-md' 
                  : 'border-slate-100 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`p-4 rounded-2xl border ${badge.colorClass.split(' ').slice(0,3).join(' ')}`}>
                  <Icon size={24} />
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  badge.unlocked 
                    ? 'bg-tertiary/10 text-tertiary' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {badge.unlocked ? 'Freigeschaltet' : 'Gesperrt'}
                </span>
              </div>

              <div className="mt-6">
                <h4 className="font-bold text-on-surface text-base">{badge.title}</h4>
                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">{badge.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
