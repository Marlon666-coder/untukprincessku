import { cn } from '../../utils/cn';
import './Card.css';

/**
 * Glassy card container.
 * variant: 'glass' (default) | 'solid' | 'soft' | 'paper' (scrapbook)
 * Pass `as={Link}` + `to` or `onClick` to make the whole card interactive.
 */
export function Card({ as: Component = 'div', variant = 'glass', interactive = false, padded = true, className, children, ...rest }) {
  return (
    <Component
      className={cn('card', `card--${variant}`, interactive && 'card--interactive', padded && 'card--padded', className)}
      {...rest}
    >
      {children}
    </Component>
  );
}
