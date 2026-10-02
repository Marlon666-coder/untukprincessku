import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import './Button.css';

/**
 * Button used everywhere.
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 * size: 'sm' | 'md' | 'lg'
 * Pass `to` to render a router link, or `href` for an external link.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  icon,
  loading = false,
  block = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}) {
  const classes = cn('btn', `btn--${variant}`, `btn--${size}`, block && 'btn--block', className);
  const content = (
    <>
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : icon && <span aria-hidden="true">{icon}</span>}
      {children && <span>{children}</span>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
}

/** Round icon-only button. Always give it a `label` for screen readers. */
export function IconButton({ label, children, className, active = false, ...rest }) {
  return (
    <button
      type="button"
      className={cn('icon-btn', active && 'icon-btn--active', className)}
      aria-label={label}
      title={label}
      {...rest}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
