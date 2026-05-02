import React from 'react';
import { log } from '../middleware/logger';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error) {
    log('frontend', 'fatal', 'component', `Unhandled React error: ${error?.message || 'Unknown error'}`);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-shell">
          <div className="fatal-panel">
            <div className="status-badge status-badge-error">App Error</div>
            <h1 className="fatal-title">Something went wrong.</h1>
            <p className="fatal-copy">
              The interface hit an unexpected problem. Refresh the page to restart the session safely.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
