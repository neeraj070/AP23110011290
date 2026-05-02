import NotificationCard from './NotificationCard';

export default function PriorityInbox({ notifications, onOpen }) {
  return (
    <section className="priority-panel" aria-labelledby="priority-heading">
      <div className="section-heading-row">
        <div className="section-heading-copy">
          <p className="section-kicker">Top 10 unread</p>
          <h2 className="section-title" id="priority-heading">
            Priority Inbox
          </h2>
        </div>
        <span className="section-count">{notifications.length}</span>
      </div>
      {notifications.length ? (
        <div className="priority-list">
          {notifications.map((notification) => (
            <NotificationCard
              compact
              showScore
              key={notification.id}
              notification={notification}
              onOpen={onOpen}
            />
          ))}
        </div>
      ) : (
        <div className="empty-priority">
          <p className="empty-priority-title">All caught up</p>
          <p className="empty-priority-copy">Unread notifications will surface here automatically.</p>
        </div>
      )}
    </section>
  );
}
