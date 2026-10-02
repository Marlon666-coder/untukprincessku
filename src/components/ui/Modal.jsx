import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { cn } from '../../utils/cn';
import './Modal.css';

/**
 * Accessible modal. On phones it slides up as a bottom sheet,
 * on larger screens it is a centred dialog. Always fits the viewport.
 * size: 'sm' | 'md' | 'lg' | 'full'
 */
export function Modal({ open, onClose, title, subtitle, size = 'md', footer, className, children, hideHeader = false }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  // Keep the latest onClose in a ref so the effect below only runs on open/close
  // (re-running it on every render would steal focus from inputs).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current?.();
    };
    document.addEventListener('keydown', onKeyDown);
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="modal" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <div
        ref={dialogRef}
        className={cn('modal__dialog', `modal__dialog--${size}`, className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
      >
        <span className="modal__handle" aria-hidden="true" />
        {!hideHeader && (
          <header className="modal__header">
            <div className="modal__titles">
              {title && <h2 id={titleId}>{title}</h2>}
              {subtitle && <p className="text-muted">{subtitle}</p>}
            </div>
            <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </header>
        )}
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
