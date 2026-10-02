import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import './Toast.css';

const ICONS = { success: '♡', error: '!', info: '✨' };

export function ToastViewport({ toasts, onDismiss }) {
  return createPortal(
    <div className="toast-viewport" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          className={cn('toast', `toast--${toast.tone}`)}
          onClick={() => onDismiss(toast.id)}
        >
          <span className="toast__icon" aria-hidden="true">
            {ICONS[toast.tone] ?? ICONS.info}
          </span>
          <span>{toast.message}</span>
        </button>
      ))}
    </div>,
    document.body,
  );
}
