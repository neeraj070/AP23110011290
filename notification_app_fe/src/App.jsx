import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import SetupPage from './pages/SetupPage';
import DashboardPage from './pages/DashboardPage';
import LoadingScreen from './components/LoadingScreen';

function AppContent() {
  const { status, startupMessage } = useAuth();

  if (status === 'initializing') {
    return <LoadingScreen message={startupMessage || 'Preparing your notification workspace...'} />;
  }

  if (status === 'authenticated') {
    return <DashboardPage />;
  }

  return <SetupPage />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
