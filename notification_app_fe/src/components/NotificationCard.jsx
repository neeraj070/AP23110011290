import { formatDateTime, formatRelativeTime, truncateText } from '../utils/format';

export default function NotificationCard({ notification, onOpen, compact = false, showScore = false }) {
  return (
    <button
      className={`notification-card ${notification.viewed ? 'notification-card-viewed' : 'notification-card-new'} ${
        compact ? 'notification-card-compact' : ''
      }`}
      type="button"
      onClick={() => onOpen(notification)}
    >
      <span className="notification-card-topline">
        <span className={`type-badge type-badge-${notification.type.toLowerCase()}`}>{notification.type}</span>
        <span className={notification.viewed ? 'read-badge read-badge-viewed' : 'read-badge read-badge-new'}>
          {notification.viewed ? 'Viewed' : 'New'}
        </span>
      </span>
      <span className="notification-card-title">{notification.title}</span>
      <span className="notification-card-message">
        {compact ? truncateText(notification.message, 90) : truncateText(notification.message, 170)}
      </span>
      <span className="notification-card-meta">
        <span className="notification-card-id">ID {notification.id}</span>
        <span className="notification-card-time" title={formatDateTime(notification.timestamp)}>
          {formatRelativeTime(notification.timestamp)}
        </span>
        {showScore ? <span className="notification-card-score">Score {notification.priorityScore}</span> : null}
      </span>
    </button>
  );
}
