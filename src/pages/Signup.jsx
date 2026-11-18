import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';
import { useUi } from '../state/UiContext.jsx';
import { EyeIcon, EyeOffIcon } from '../components/icons.jsx';

// Sign up page — the companion to Login (Spec Sec. 7.3). FakeStoreAPI
// cannot persist new accounts (POST /users saves nothing and
// /auth/login only knows the sample users), so accounts made here are
// stored locally in this browser — see utils/localUsers.js and the
// README. Validation mirrors the checkout form: a validate() function,
// per-field errors shown on blur and on submit, first invalid focused.
const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
};

function validate(form) {
  const errors = {};
  if (form.firstName.trim().length < 2)
    errors.firstName = 'Please enter your first name.';
  if (!form.lastName.trim()) errors.lastName = 'Please enter your last name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = 'Please enter a valid email address.';
  if (!/^[A-Za-z0-9_]{3,}$/.test(form.username.trim()))
    errors.username = 'Use at least 3 characters — letters, numbers or underscore.';
  if (form.password.length < 6)
    errors.password = 'Password must be at least 6 characters.';
  if (form.confirmPassword !== form.password)
    errors.confirmPassword = 'Passwords do not match.';
  return errors;
}

export default function Signup() {
  const { isLoggedIn, signup } = useAuth();
  const { openDrawer, openCheckout, showToast } = useUi();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  if (isLoggedIn) return <Navigate to="/" replace />;

  const next = searchParams.get('next');
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : '/login';

  const fieldError = (name) => (touched[name] ? errors[name] : undefined);

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const blurField = (name) => {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validate(form));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const errs = validate(form);
    setErrors(errs);
    setTouched({
      firstName: true, lastName: true, email: true,
      username: true, password: true, confirmPassword: true,
    });
    const firstBad = Object.keys(errs)[0];
    if (firstBad) {
      document.getElementById(`su-${firstBad}`)?.focus();
      return;
    }
    setLoading(true);
    try {
      const session = await signup({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        username: form.username,
        password: form.password,
      });
      showToast(
        session.firstName ? `Welcome to Fernwick, ${session.firstName}` : 'Welcome to Fernwick'
      );
      if (next === 'checkout') {
        navigate('/', { replace: true });
        openDrawer();
        openCheckout();
      } else if (next) {
        navigate(next, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      if (err.code === 'USERNAME_TAKEN') {
        setErrors({ username: 'That username is taken — try another, or log in.' });
        setTouched((t) => ({ ...t, username: true }));
        document.getElementById('su-username')?.focus();
      } else {
        setFormError('Something went wrong while creating your account — please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container page page--narrow">
      <div className="login-card">
        <h1 className="login-card__title">Create your account</h1>
        <p className="login-card__text">
          One account for checkout and your orders — everything kept on one shelf.
        </p>

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <Field
            id="su-firstName" label="First name" error={fieldError('firstName')}
            inputProps={{
              value: form.firstName, autoComplete: 'given-name',
              onChange: (e) => setField('firstName', e.target.value),
              onBlur: () => blurField('firstName'),
            }}
          />
          <Field
            id="su-lastName" label="Last name" error={fieldError('lastName')}
            inputProps={{
              value: form.lastName, autoComplete: 'family-name',
              onChange: (e) => setField('lastName', e.target.value),
              onBlur: () => blurField('lastName'),
            }}
          />
          <Field
            id="su-email" label="Email" error={fieldError('email')}
            inputProps={{
              type: 'email', value: form.email, autoComplete: 'email',
              onChange: (e) => setField('email', e.target.value),
              onBlur: () => blurField('email'),
            }}
          />
          <Field
            id="su-username" label="Username" error={fieldError('username')}
            inputProps={{
              value: form.username, autoComplete: 'username',
              onChange: (e) => setField('username', e.target.value),
              onBlur: () => blurField('username'),
            }}
          />
          <div className="field">
            <label htmlFor="su-password">Password</label>
            <div className="password-wrap">
              <input
                id="su-password"
                name="password"
                className={fieldError('password') ? 'input input--invalid' : 'input'}
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setField('password', e.target.value)}
                onBlur={() => blurField('password')}
                autoComplete="new-password"
                aria-invalid={Boolean(fieldError('password'))}
                aria-describedby={fieldError('password') ? 'su-password-error' : undefined}
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
            {fieldError('password') && (
              <p className="field__error" id="su-password-error" role="alert">
                {fieldError('password')}
              </p>
            )}
          </div>
          <Field
            id="su-confirmPassword" label="Confirm password" error={fieldError('confirmPassword')}
            inputProps={{
              type: 'password', value: form.confirmPassword, autoComplete: 'new-password',
              onChange: (e) => setField('confirmPassword', e.target.value),
              onBlur: () => blurField('confirmPassword'),
            }}
          />
          <button type="submit" className="btn btn--checkout" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" /> Creating account…
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="login-card__switch">
          Already have an account? <Link to={loginHref}>Log in</Link>
        </p>
        <p className="login-card__note">
          Your account is saved in this browser — the demo catalogue service does not
          keep accounts of its own.
        </p>
      </div>
    </main>
  );
}

function Field({ id, label, error, inputProps }) {
  const name = id.replace('su-', '');
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        className={error ? 'input input--invalid' : 'input'}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...inputProps}
      />
      {error && (
        <p className="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
