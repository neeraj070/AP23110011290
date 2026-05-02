import { formatDateTime } from '../utils/format';

export default function NotificationDetailModal({ notification, onClose }) {
  if (!notification) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="detail-modal-header">
          <div className="detail-modal-heading">
            <span className={`type-badge type-badge-${notification.type.toLowerCase()}`}>{notification.type}</span>
            <h2 className="detail-modal-title" id="detail-title">
              {notification.title}
            </h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close notification details" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="detail-modal-body">
          <p className="detail-modal-message">{notification.message}</p>
          <dl className="detail-grid">
            <div className="detail-grid-row">
              <dt className="detail-grid-label">Notification ID</dt>
              <dd className="detail-grid-value">{notification.id}</dd>
            </div>
            <div className="detail-grid-row">
              <dt className="detail-grid-label">Timestamp</dt>
              <dd className="detail-grid-value">{formatDateTime(notification.timestamp)}</dd>
            </div>
            <div className="detail-grid-row">
              <dt className="detail-grid-label">Status</dt>
              <dd className="detail-grid-value">Viewed</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
