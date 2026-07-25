import { type ReactNode } from 'react';

type Tone = 'accent' | 'muted' | 'warn' | 'danger';

const TONES: Record<Tone, string> = {
  accent: 'border-accent/40 bg-accent/10 text-accent',
  muted: 'border-cyber-border bg-cyber-panel text-cyber-muted',
  warn: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  danger: 'border-red-500/40 bg-red-500/10 text-red-400',
};

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

/** Small status pill. */
export function Badge({ tone = 'muted', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wide ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
