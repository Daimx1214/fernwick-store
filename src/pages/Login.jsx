import { useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';
import { useUi } from '../state/UiContext.jsx';
import { EyeIcon, EyeOffIcon } from '../components/icons.jsx';

// Login page — Spec Sec. 7.3 / 10. Authenticates against POST /auth/login.
// The demo credentials are public sample data from the FakeStoreAPI docs.
const DEMO_USERNAME = 'mor_2314';
const DEMO_PASSWORD = '83r5^_';

export default function Login() {
  const { isLoggedIn, login } = useAuth();
  const { openDrawer, openCheckout, showToast } = useUi();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const usernameRef = useRef(null);

  if (isLoggedIn) return <Navigate to="/" replace />;

  const next = searchParams.get('next');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const session = await login(username.trim(), password);
      showToast(session.firstName ? `Welcome back, ${session.firstName}` : 'Welcome back');
      if (next === 'checkout') {
        navigate('/', { replace: true });
        openDrawer();
        openCheckout();
      } else if (next) {
        navigate(next, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch {
      setError('Username or password is incorrect');
      setPassword('');
      usernameRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setUsername(DEMO_USERNAME);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

  return (
    <main className="container page page--narrow">
      <div className="login-card">
        <h1 className="login-card__title">Welcome back</h1>
        <p className="login-card__text">Log in to check out and see your orders.</p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              ref={usernameRef}
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <div className="password-wrap">
              <input
                id="login-password"
                className="input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn--checkout" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" /> Logging in…
              </>
            ) : (
              'Log in'
            )}
          </button>
        </form>

        <button type="button" className="text-btn login-card__demo" onClick={fillDemo}>
          Use demo account
        </button>
        <p className="login-card__note">
          Demo account from the public FakeStoreAPI docs — it fills the form, you press Log in.
        </p>
      </div>
    </main>
  );
}
