import { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Optional eyebrow label rendered above the title (mono accent). */
  eyebrow?: string;
  actions?: ReactNode;
}

/** Consistent page title block used at the top of every feature page. */
export function PageHeader({ title, description, eyebrow, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="heading-accent mb-1">{eyebrow}</p>}
        <h1 className="text-2xl font-bold text-cyber-text">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-cyber-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
