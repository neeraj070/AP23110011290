export default function StatusMessage({ type = 'info', title, message }) {
  if (!title && !message) {
    return null;
  }

  return (
    <div className={`status-message status-message-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {title ? <strong className="status-message-title">{title}</strong> : null}
      {message ? <span className="status-message-copy">{message}</span> : null}
    </div>
  );
}
