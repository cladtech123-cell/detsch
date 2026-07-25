import { type HTMLAttributes, type ReactNode } from 'react';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  /** Optional node rendered top-right of the card (actions, status). */
  action?: ReactNode;
}

/** Surface panel with optional header. */
export function Card({ title, description, action, className = '', children, ...rest }: CardProps) {
  return (
    <div className={`panel p-5 ${className}`} {...rest}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-semibold text-cyber-text">{title}</h3>}
            {description && (
              <p className="mt-1 text-sm text-cyber-muted">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
