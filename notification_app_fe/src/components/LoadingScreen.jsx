export default function LoadingScreen({ message }) {
  return (
    <div className="app-shell app-shell-centered">
      <div className="loading-panel">
        <div className="loading-spinner" aria-hidden="true" />
        <p className="loading-text">{message}</p>
      </div>
    </div>
  );
}
