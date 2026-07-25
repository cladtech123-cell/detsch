import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Optional icon node rendered before the input. */
  leftIcon?: React.ReactNode;
}

/** Text input styled for the dark theme. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ leftIcon, className = '', ...props }, ref) => (
    <div className="relative flex items-center">
      {leftIcon && (
        <span className="pointer-events-none absolute left-3 text-cyber-muted">{leftIcon}</span>
      )}
      <input
        ref={ref}
        className={`h-10 w-full rounded-md border border-cyber-border bg-cyber-bg/60 px-3 text-sm text-cyber-text placeholder:text-cyber-muted/70 transition-colors focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40 ${
          leftIcon ? 'pl-9' : ''
        } ${className}`}
        {...props}
      />
    </div>
  ),
);
Input.displayName = 'Input';
