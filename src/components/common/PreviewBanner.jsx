import { useState } from 'react';
import { isPreviewMode } from '../../config/env';
import './PreviewBanner.css';

/**
 * Honest notice while Supabase is not connected:
 * the data shown is sample data and changes are not saved.
 */
export function PreviewBanner() {
  const [hidden, setHidden] = useState(false);
  if (!isPreviewMode || hidden) return null;

  return (
    <div className="preview-banner" role="status">
      <span aria-hidden="true">🧪</span>
      <p>
        <strong>Preview mode</strong> — ini data contoh. Perubahan belum disimpan dan akan hilang saat halaman di-refresh.
      </p>
      <button type="button" onClick={() => setHidden(true)} aria-label="Hide notice">
        ✕
      </button>
    </div>
  );
}
