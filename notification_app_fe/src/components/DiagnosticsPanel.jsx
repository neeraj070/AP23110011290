import { getDiagnostics } from '../utils/storage';

export default function DiagnosticsPanel() {
  const diagnostics = getDiagnostics();

  if (!import.meta.env.DEV || diagnostics.length === 0) {
    return null;
  }

  return (
    <section className="diagnostics-panel" aria-labelledby="diagnostics-heading">
      <div className="section-heading-row">
        <div className="section-heading-copy">
          <p className="section-kicker">Development</p>
          <h2 className="section-title" id="diagnostics-heading">
            Diagnostics
          </h2>
        </div>
      </div>
      <div className="diagnostics-list">
        {diagnostics.map((entry) => (
          <div className="diagnostic-row" key={entry.id}>
            <span className={`diagnostic-level diagnostic-level-${entry.level}`}>{entry.level}</span>
            <span className="diagnostic-message">{entry.message}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
