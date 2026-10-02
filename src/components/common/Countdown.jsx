import { useNow } from '../../hooks/useNow';
import { getCountdownParts } from '../../utils/date';
import './Countdown.css';

/** Live countdown to `target` (Date). Shows a friendly message when it's time. */
export function Countdown({ target, doneLabel = "It's date time ♡" }) {
  const now = useNow(1000, Boolean(target));
  if (!target) return null;

  const remaining = target.getTime() - now;
  if (remaining <= 0) return <p className="countdown__done script">{doneLabel}</p>;

  const parts = getCountdownParts(remaining);
  const units = [
    ['days', parts.days],
    ['hours', parts.hours],
    ['mins', parts.minutes],
    ['secs', parts.seconds],
  ];

  return (
    <div className="countdown" role="timer" aria-label={`${parts.days} days ${parts.hours} hours left`}>
      {units.map(([label, value]) => (
        <div key={label} className="countdown__unit">
          <strong>{String(value).padStart(2, '0')}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
