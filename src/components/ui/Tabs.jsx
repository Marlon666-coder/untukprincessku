import { cn } from '../../utils/cn';
import './Tabs.css';

/** Segmented tabs. items: [{ key, label, icon, count }] */
export function Tabs({ items, value, onChange, label = 'Tabs' }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          role="tab"
          aria-selected={value === item.key}
          className={cn('tabs__tab', value === item.key && 'is-active')}
          onClick={() => onChange(item.key)}
        >
          {item.icon && <span aria-hidden="true">{item.icon}</span>}
          <span>{item.label}</span>
          {item.count != null && <span className="tabs__count">{item.count}</span>}
        </button>
      ))}
    </div>
  );
}
