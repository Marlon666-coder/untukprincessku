import { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { cn } from '../../utils/cn';
import { Modal } from '../ui/Modal';
import './SecretMessage.css';

/** "Something for You ♡" — an envelope that opens into a letter. Text is editable in Settings. */
export function SecretMessage() {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="secret" onClick={() => setOpen(true)}>
        <span className="secret__envelope" aria-hidden="true">
          <span className="secret__flap" />
          <span className="secret__seal">♥</span>
        </span>
        <span className="secret__text">
          <strong>Something for You ♡</strong>
          <span>Tap to open a little letter</span>
        </span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} size="md" hideHeader>
        <div className={cn('letter', open && 'is-open')}>
          <button type="button" className="letter__close" onClick={() => setOpen(false)} aria-label="Close letter">
            ✕
          </button>
          <span className="letter__stamp" aria-hidden="true">
            🌸
          </span>
          <p className="letter__body">{settings?.secret_message}</p>
          <p className="letter__sign script">— with love ♡</p>
        </div>
      </Modal>
    </>
  );
}
