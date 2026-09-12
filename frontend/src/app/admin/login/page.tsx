'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiUrl } from '../../../utils/api-url';
import { resolveImageUrl } from '../../../utils/image-url';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8; // Matches the backend's rule, so the form fails fast.

type FieldErrors = { email?: string; password?: string };

/** Same rules the API applies, checked here so mistakes are caught before a request is sent. */
const checkEmail = (value: string) => {
  const email = value.trim();
  if (!email) return 'Enter your email address.';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address, like name@example.com.';
  return undefined;
};

const checkPassword = (value: string) => {
  if (!value) return 'Enter your password.';
  if (value.length < MIN_PASSWORD_LENGTH) return `Passwords are at least ${MIN_PASSWORD_LENGTH} characters.`;
  return undefined;
};

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState('');
  // services/api.ts leaves this behind when a session expires, so the sign-in page can say why.
  const signedOut = useSyncExternalStore(
    () => () => {},
    () => sessionStorage.getItem('admin_signed_out_reason') || '',
    () => ''
  );
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // The site logo lives in settings; the brand name is shown until (or unless) it loads.
  useEffect(() => {
    let active = true;
    fetch(apiUrl('/settings'))
      .then((res) => (res.ok ? res.json() : null))
      .then((settings) => {
        const url = settings?.light_logo_url || settings?.logo_url;
        if (active && url) setLogo(resolveImageUrl(url));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    sessionStorage.removeItem('admin_signed_out_reason');
    const errors: FieldErrors = { email: checkEmail(email), password: checkPassword(password) };
    setFieldErrors(errors);
    setError('');

    if (errors.email || errors.password) {
      (errors.email ? emailRef : passwordRef).current?.focus();
      return;
    }

    setLoading(true);

    try {
      // credentials: 'include' lets the browser keep the refresh-token cookie from the API's domain;
      // without it the session ends when the 15-minute access token expires.
      const res = await fetch(apiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.token) {
        sessionStorage.setItem('admin_token', data.token);
        setPassword('');
        router.push('/admin/dashboard');
        router.refresh();
        return;
      }

      if (res.status === 429) {
        // The server says how long to wait once it starts refusing attempts.
        const retryAfter = Number(res.headers.get('retry-after'));
        const minutes = Number.isFinite(retryAfter) && retryAfter > 0 ? Math.ceil(retryAfter / 60) : 15;
        setError(data.error || `Too many sign-in attempts. Please try again in about ${minutes} minutes.`);
      } else if (res.status === 401) {
        // Deliberately the same message whether the email or the password was wrong.
        setError('Those details did not match an account. Check your email and password and try again.');
      } else {
        setError(data.error || 'Sign-in failed. Please try again.');
      }
      setPassword('');
      passwordRef.current?.focus();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const trackCapsLock = (event: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(event.getModifierState?.('CapsLock') ?? false);
  };

  return (
    <div className="ks-login">
      <div className="ks-login__brand">
        <span className="ks-blob ks-blob--1" aria-hidden="true"></span>
        <span className="ks-blob ks-blob--2" aria-hidden="true"></span>
        <span className="ks-grain" aria-hidden="true"></span>
        <div className="ks-login__brand-inner">
          <Link href="/" className="ks-login__logo">
            {logo ? <img src={logo} alt="KN Softic" /> : <span className="ks-login__logo-text">KN Softic</span>}
          </Link>
          <h1 className="ks-display ks-login__headline">Admin Panel</h1>
          <p className="ks-lead ks-lead--light">
            Manage your services, courses, projects, blog and site settings in one place.
          </p>
          <ul className="ks-login__points">
            <li><i className="fa fa-lock" aria-hidden="true"></i> Encrypted sign-in over HTTPS</li>
            <li><i className="fa fa-shield" aria-hidden="true"></i> Repeated wrong passwords are blocked</li>
            <li><i className="fa fa-clock" aria-hidden="true"></i> Sessions renew quietly and expire on their own</li>
          </ul>
        </div>
      </div>

      <div className="ks-login__panel">
        <div className="ks-login__card">
          {/* Eyebrow and badge share one short row, so the heading below is never pushed around
              on a narrow screen. */}
          <div className="ks-login__card-head">
            <p className="ks-eyebrow">Sign in</p>
            <span className="ks-chip"><i className="fa fa-lock" aria-hidden="true"></i> Secure area</span>
          </div>
          <h2 className="ks-title ks-login__title">Welcome back</h2>
          <p className="ks-card__text ks-login__subtitle">Enter your admin details to continue.</p>

          <form onSubmit={handleLogin} noValidate>
            {signedOut && !error && (
              <div className="ks-login__notice" role="status">
                <i className="fa fa-circle-info" aria-hidden="true"></i>
                <span>Your session expired, so you were signed out. Please sign in again.</span>
              </div>
            )}

            {error && (
              <div className="ks-login__error" role="alert">
                <i className="fa fa-circle-exclamation" aria-hidden="true"></i>
                <span>{error}</span>
              </div>
            )}

            <div className="ks-login__field">
              <label className="ks-label" htmlFor="admin-email">
                Email address <span className="ks-req" aria-hidden="true">*</span>
              </label>
              <input
                ref={emailRef}
                id="admin-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                aria-required="true"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'admin-email-error' : undefined}
                className={`ks-input${fieldErrors.email ? ' ks-input--invalid' : ''}`}
                placeholder="you@knsoftic.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                onBlur={(event) => setFieldErrors((prev) => ({ ...prev, email: event.target.value ? checkEmail(event.target.value) : undefined }))}
              />
              {fieldErrors.email && (
                <p className="ks-field-error" id="admin-email-error">
                  <i className="fa fa-circle-exclamation" aria-hidden="true"></i> {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="ks-login__field">
              <label className="ks-label" htmlFor="admin-password">
                Password <span className="ks-req" aria-hidden="true">*</span>
              </label>
              <div className="ks-login__password">
                <input
                  ref={passwordRef}
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  aria-required="true"
                  minLength={MIN_PASSWORD_LENGTH}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={[fieldErrors.password ? 'admin-password-error' : '', capsLock ? 'caps-lock-hint' : ''].filter(Boolean).join(' ') || undefined}
                  className={`ks-input${fieldErrors.password ? ' ks-input--invalid' : ''}`}
                  placeholder="Your password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  onBlur={(event) => setFieldErrors((prev) => ({ ...prev, password: event.target.value ? checkPassword(event.target.value) : undefined }))}
                  onKeyUp={trackCapsLock}
                  onKeyDown={trackCapsLock}
                />
                <button
                  type="button"
                  className="ks-login__reveal"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  tabIndex={-1}
                >
                  <i className={showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'} aria-hidden="true"></i>
                </button>
              </div>
              {fieldErrors.password && (
                <p className="ks-field-error" id="admin-password-error">
                  <i className="fa fa-circle-exclamation" aria-hidden="true"></i> {fieldErrors.password}
                </p>
              )}
              {capsLock && !fieldErrors.password && (
                <p className="ks-login__hint" id="caps-lock-hint">
                  <i className="fa fa-triangle-exclamation" aria-hidden="true"></i> Caps Lock is on
                </p>
              )}
            </div>

            <button type="submit" className="ks-btn ks-btn--primary ks-btn--block" disabled={loading}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Signing in...</>
              ) : (
                <>Sign in <i className="fa fa-arrow-right" aria-hidden="true"></i></>
              )}
            </button>
          </form>

          <p className="ks-login__note">
            <i className="fa fa-lock" aria-hidden="true"></i>
            For KN Softic staff only. Forgotten your password? Ask an administrator to reset it.
          </p>
        </div>

        <div className="ks-login__foot">
          <Link href="/" className="ks-link">
            <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to the website
          </Link>
          <span className="ks-meta">© {new Date().getFullYear()} KN Softic</span>
        </div>
      </div>
    </div>
  );
}
