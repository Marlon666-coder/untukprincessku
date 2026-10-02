import { useCallback, useState } from 'react';
import { useToast } from '../context/ToastContext';

/**
 * Wraps a service call with a pending flag + friendly toasts.
 *   const [save, saving] = useAsyncAction(placeService.createPlace, { success: 'Saved ♡' });
 */
export function useAsyncAction(action, { success, error: errorMessage } = {}) {
  const [pending, setPending] = useState(false);
  const toast = useToast();

  const run = useCallback(
    async (...args) => {
      setPending(true);
      try {
        const result = await action(...args);
        if (success) toast.show(success);
        return result;
      } catch (err) {
        toast.show(errorMessage || err.message || 'Ada yang salah, coba lagi ya.', 'error');
        return undefined;
      } finally {
        setPending(false);
      }
    },
    [action, success, errorMessage, toast],
  );

  return [run, pending];
}
