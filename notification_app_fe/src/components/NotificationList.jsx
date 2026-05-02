import NotificationCard from './NotificationCard';
import StatusMessage from './StatusMessage';

export default function NotificationList({ notifications, onOpen, loading, error }) {
  if (loading && notifications.length === 0) {
    return (
      <div className="list-state">
        <div className="loading-spinner loading-spinner-small" aria-hidden="true" />
        <p className="list-state-text">Loading notifications...</p>
      </div>
    );
  }

  if (error && notifications.length === 0) {
    return <StatusMessage type="error" title="Could not load notifications" message={error} />;
  }

  if (notifications.length === 0) {
    return <StatusMessage title="No notifications found" message="Try a different filter or load again later." />;
  }

  return (
    <div className="notification-list">
      {notifications.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} onOpen={onOpen} />
      ))}
    </div>
  );
}
