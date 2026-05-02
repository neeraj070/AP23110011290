import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { log } from '../middleware/logger';
import { getStoredCredentials, getStoredProfile } from '../utils/storage';
import { validateSetupForm } from '../utils/validation';
import StatusMessage from '../components/StatusMessage';

const INITIAL_VALUES = {
  email: '',
  name: '',
  mobileNo: '',
  githubUsername: '',
  rollNo: '',
  accessCode: '',
};

export default function SetupPage() {
  const storedProfile = getStoredProfile();
  const hasStoredCredentials = Boolean(getStoredCredentials());
  const [values, setValues] = useState(storedProfile || INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { authError, registerAndAuthenticate } = useAuth();

  function updateField(field, value) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
    setErrors((current) => ({
      ...current,
      [field]: '',
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validation = validateSetupForm(values);

    if (!validation.isValid) {
      setErrors(validation.errors);
      await log('frontend', 'warn', 'auth', `Validation failed for setup form: ${Object.keys(validation.errors).join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      await registerAndAuthenticate(validation.values);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="setup-shell">
      <section className="setup-panel" aria-labelledby="setup-title">
        <div className="setup-copy">
          <p className="setup-kicker">Evaluation setup</p>
          <h1 className="setup-title" id="setup-title">
            Campus Notifications
          </h1>
          <p className="setup-description">
            Register with the test server, authenticate, and open the protected notification dashboard.
          </p>
        </div>

        <form className="setup-form" onSubmit={handleSubmit} noValidate>
          <StatusMessage type="error" title={authError ? 'Authentication issue' : ''} message={authError} />
          {hasStoredCredentials ? (
            <StatusMessage
              type="info"
              title="Saved client credentials found"
              message="If registration already exists, the app will use the stored client ID and secret to authenticate."
            />
          ) : null}

          <div className="form-grid">
            <label className="form-field">
              <span className="form-label">Email</span>
              <input
                className="form-input"
                type="email"
                value={values.email}
                onChange={(event) => updateField('email', event.target.value)}
                autoComplete="email"
              />
              {errors.email ? <span className="form-error">{errors.email}</span> : null}
            </label>

            <label className="form-field">
              <span className="form-label">Full name</span>
              <input
                className="form-input"
                type="text"
                value={values.name}
                onChange={(event) => updateField('name', event.target.value)}
                autoComplete="name"
              />
              {errors.name ? <span className="form-error">{errors.name}</span> : null}
            </label>

            <label className="form-field">
              <span className="form-label">Mobile number</span>
              <input
                className="form-input"
                type="tel"
                value={values.mobileNo}
                onChange={(event) => updateField('mobileNo', event.target.value)}
                autoComplete="tel"
              />
              {errors.mobileNo ? <span className="form-error">{errors.mobileNo}</span> : null}
            </label>

            <label className="form-field">
              <span className="form-label">GitHub username</span>
              <input
                className="form-input"
                type="text"
                value={values.githubUsername}
                onChange={(event) => updateField('githubUsername', event.target.value)}
                autoComplete="username"
              />
              {errors.githubUsername ? <span className="form-error">{errors.githubUsername}</span> : null}
            </label>

            <label className="form-field">
              <span className="form-label">Roll number</span>
              <input
                className="form-input"
                type="text"
                value={values.rollNo}
                onChange={(event) => updateField('rollNo', event.target.value)}
              />
              {errors.rollNo ? <span className="form-error">{errors.rollNo}</span> : null}
            </label>

            <label className="form-field">
              <span className="form-label">Access code</span>
              <input
                className="form-input"
                type="password"
                value={values.accessCode}
                onChange={(event) => updateField('accessCode', event.target.value)}
                autoComplete="current-password"
              />
              {errors.accessCode ? <span className="form-error">{errors.accessCode}</span> : null}
            </label>
          </div>

          <button className="primary-button setup-submit" type="submit" disabled={submitting}>
            {submitting ? 'Connecting...' : 'Register and authenticate'}
          </button>
        </form>
      </section>
    </main>
  );
}
