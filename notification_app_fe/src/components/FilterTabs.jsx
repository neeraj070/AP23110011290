import { NOTIFICATION_TYPES } from '../config/api';

const FILTERS = ['All', ...NOTIFICATION_TYPES];

export default function FilterTabs({ activeFilter, onChange, disabled }) {
  return (
    <div className="filter-tabs" role="tablist" aria-label="Notification type filters">
      {FILTERS.map((filter) => (
        <button
          className={`filter-tab ${activeFilter === filter ? 'filter-tab-active' : ''}`}
          disabled={disabled}
          key={filter}
          type="button"
          role="tab"
          aria-selected={activeFilter === filter}
          onClick={() => onChange(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
