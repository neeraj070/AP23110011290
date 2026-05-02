import { useAuth } from '../context/AuthContext';

export default function TopBar({ unreadCount }) {
  const { profile, signOut } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-brand-block">
        <p className="topbar-kicker">Campus Notifications</p>
        <h1 className="topbar-title">Priority inbox</h1>
      </div>
      <div className="topbar-actions">
        <div className="auth-pill" aria-label="Authentication status">
          <span className="auth-pill-dot" />
          <span className="auth-pill-text">Authenticated</span>
        </div>
        <div className="user-chip" title={profile?.email || 'Registered user'}>
          <span className="user-chip-name">{profile?.name || 'User'}</span>
          <span className="user-chip-count">{unreadCount} new</span>
        </div>
        <button className="secondary-button" type="button" onClick={signOut}>
          Re-auth
        </button>
      </div>
    </header>
  );
}
