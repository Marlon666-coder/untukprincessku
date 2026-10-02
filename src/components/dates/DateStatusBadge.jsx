import { DATE_STATUS } from '../../types/models';
import { Badge } from '../ui/Badge';

const TONES = { planned: 'lavender', ongoing: 'pink', finished: 'green', cancelled: 'grey' };

export function DateStatusBadge({ status }) {
  const info = DATE_STATUS[status] ?? DATE_STATUS.planned;
  return (
    <Badge tone={TONES[info.key]} icon={info.emoji} className={status === 'ongoing' ? 'badge--live' : undefined}>
      {info.label}
    </Badge>
  );
}
