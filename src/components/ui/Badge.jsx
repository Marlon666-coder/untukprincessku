import { cn } from '../../utils/cn';
import './Badge.css';

/** Small pill label. tone: 'pink' | 'lavender' | 'green' | 'amber' | 'grey' | 'red' */
export function Badge({ tone = 'pink', icon, className, children }) {
  return (
    <span className={cn('badge', `badge--${tone}`, className)}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}

/** Selectable chip used in filters and category pickers. */
export function Chip({ selected = false, icon, onClick, children, className, ...rest }) {
  return (
    <button
      type="button"
      className={cn('chip', selected && 'chip--selected', className)}
      aria-pressed={selected}
      onClick={onClick}
      {...rest}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
