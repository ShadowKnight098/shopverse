import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../stores/useAuthStore';

function PasswordStrength({ password }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9!@#$%^&*]/.test(password),
  ].filter(Boolean).length;

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  const labels = ['Too weak', 'Weak', 'Good', 'Strong'];
  const textColors = ['#ef4444', '#f97316', '#ca8a04', '#16a34a'];

  if (!password) return null;

  return (
    <div className="su-strength">
      <div className="su-strength-bars">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="su-strength-bar"
            style={{ background: i < score ? colors[score - 1] : undefined }}
          />
        ))}
      </div>
      <p className="su-strength-label" style={{ color: textColors[score - 1] }}>
        {labels[score - 1] || ''}
      </p>
    </div>
  );
}

export default function SignupPage() {
  const [form, setForm]               = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(false);

  const { signup, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Create Account — ShopVerse';
    if (user) navigate('/');
  }, [user, navigate]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim())           { setError('Please enter your name.'); return; }
    if (form.password.length < 8)    { setError('Password must be at least 8 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    const { error: err } = await signup(form.name.trim(), form.email.trim(), form.password);
    setLoading(false);
    if (err) { setError(err.message || 'Failed to create account.'); } else { setSuccess(true); }
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <>
        <SignupStyles />
        <div className="su-success-wrap">
          <div className="su-success-card">
            <div className="su-success-icon-wrap">
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="su-success-title">Account Created!</h2>
            <p className="su-success-body">
              Please check your email{' '}
              <strong style={{ color: 'var(--su-text)' }}>{form.email}</strong>{' '}
              for a confirmation link to verify your account.
            </p>
            <Link to="/login" className="su-btn-primary su-full-width">
              Go to Login
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SignupStyles />
      <div className="su-root">

        {/* ── Left: form ── */}
        <div className="su-left">
          <div className="su-form-wrap">

            {/* Logo */}
            <div className="su-logo-block">
              <Link to="/" className="su-logo">
                <span className="su-logo-shop">Shop</span>
                <span className="su-logo-verse">Verse</span>
              </Link>
              <h2 className="su-heading">Create account</h2>
              <p className="su-subheading">Join thousands of happy shoppers.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="su-error-box">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="su-form">

              {/* Name */}
              <div className="su-field">
                <label className="su-label">Full Name</label>
                <div className="su-input-wrap">
                  <User size={16} className="su-input-icon" />
                  <input
                    className="su-input"
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="su-field">
                <label className="su-label">Email Address</label>
                <div className="su-input-wrap">
                  <Mail size={16} className="su-input-icon" />
                  <input
                    className="su-input"
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="su-field">
                <label className="su-label">Password</label>
                <div className="su-input-wrap">
                  <Lock size={16} className="su-input-icon" />
                  <input
                    className="su-input su-input--pr"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="At least 8 characters"
                    required
                  />
                  <button
                    type="button"
                    className="su-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <PasswordStrength password={form.password} />
              </div>

              {/* Confirm Password */}
              <div className="su-field">
                <label className="su-label">Confirm Password</label>
                <div className="su-input-wrap">
                  <Lock size={16} className="su-input-icon" />
                  <input
                    className={`su-input ${form.confirm && form.confirm !== form.password ? 'su-input--error' : ''}`}
                    type={showPassword ? 'text' : 'password'}
                    value={form.confirm}
                    onChange={set('confirm')}
                    placeholder="••••••••"
                    required
                  />
                </div>
                {form.confirm && form.confirm !== form.password && (
                  <p className="su-field-error">Passwords don't match</p>
                )}
              </div>

              <button type="submit" className="su-btn-primary su-full-width su-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="su-spinner" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            <p className="su-signin-prompt">
              Already have an account?{' '}
              <Link to="/login" className="su-signin-link">Sign in</Link>
            </p>
          </div>
        </div>

        {/* ── Right: decorative panel ── */}
        <div className="su-right">
          <div className="su-right-orb su-right-orb--top" />
          <div className="su-right-orb su-right-orb--bottom" />
          <div className="su-right-content">
            <div className="su-right-icon-wrap">
              <ShoppingBag size={36} color="white" />
            </div>
            <h2 className="su-right-title">Start Shopping<br />with ShopVerse</h2>
            <p className="su-right-body">
              Create your account today and discover thousands of premium products with fast delivery.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}

function SignupStyles() {
  return (
    <style>{`
      :root {
        --su-bg:        #ffffff;
        --su-surface:   #f7f6f3;
        --su-border:    #e8e4de;
        --su-text:      #1a1714;
        --su-text2:     #5c5650;
        --su-text3:     #9c9690;
        --su-accent:    #4f46e5;
        --su-accent2:   #4338ca;
        --su-accentl:   rgba(79, 70, 229, 0.1);
        --su-red:       #ef4444;
        --su-redl:      rgba(239, 68, 68, 0.08);
        --su-redborder: rgba(239, 68, 68, 0.35);
        --su-green:     #22c55e;
        --su-greenl:    rgba(34, 197, 94, 0.1);
        --su-radius:    14px;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --su-bg:       #0f0e0c;
          --su-surface:  #1a1917;
          --su-border:   #2d2b27;
          --su-text:     #f2ede8;
          --su-text2:    #a09890;
          --su-text3:    #6b6460;
          --su-accentl:  rgba(99, 102, 241, 0.14);
          --su-redl:     rgba(239, 68, 68, 0.12);
          --su-greenl:   rgba(34, 197, 94, 0.12);
        }
      }

      /* ── Root layout ── */
      .su-root {
        min-height: 100vh;
        display: flex;
      }

      /* ── Left: form column ── */
      .su-left {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 24px;
        background: var(--su-bg);
        box-sizing: border-box;
      }
      .su-form-wrap {
        width: 100%;
        max-width: 420px;
      }

      /* ── Logo ── */
      .su-logo-block { margin-bottom: 32px; }
      .su-logo {
        display: inline-flex;
        align-items: baseline;
        gap: 1px;
        text-decoration: none;
        margin-bottom: 24px;
      }
      .su-logo-shop {
        font-size: 22px;
        font-weight: 900;
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .su-logo-verse {
        font-size: 22px;
        font-weight: 700;
        color: var(--su-text);
      }
      .su-heading {
        font-size: clamp(22px, 4vw, 28px);
        font-weight: 800;
        color: var(--su-text);
        margin: 0 0 8px;
        letter-spacing: -0.03em;
      }
      .su-subheading {
        font-size: 14px;
        color: var(--su-text2);
        margin: 0;
      }

      /* ── Error box ── */
      .su-error-box {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 13px 15px;
        background: var(--su-redl);
        border: 1px solid var(--su-redborder);
        border-radius: var(--su-radius);
        font-size: 13px;
        color: var(--su-red);
        margin-bottom: 20px;
        animation: suFadeIn 0.25s ease both;
      }

      /* ── Form ── */
      .su-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .su-field { display: flex; flex-direction: column; gap: 0; }
      .su-label {
        font-size: 12px;
        font-weight: 700;
        color: var(--su-text2);
        margin-bottom: 7px;
        letter-spacing: 0.02em;
      }
      .su-input-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }
      .su-input-icon {
        position: absolute;
        left: 13px;
        color: var(--su-text3);
        pointer-events: none;
        flex-shrink: 0;
      }
      .su-input {
        width: 100%;
        padding: 11px 14px 11px 40px;
        border-radius: 11px;
        border: 1.5px solid var(--su-border);
        background: var(--su-surface);
        color: var(--su-text);
        font-size: 14px;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
      }
      .su-input::placeholder { color: var(--su-text3); }
      .su-input:focus {
        border-color: var(--su-accent);
        box-shadow: 0 0 0 3px var(--su-accentl);
        background: var(--su-bg);
      }
      .su-input--pr { padding-right: 42px; }
      .su-input--error {
        border-color: var(--su-red);
        box-shadow: 0 0 0 3px var(--su-redl);
      }
      .su-input--error:focus { border-color: var(--su-red); box-shadow: 0 0 0 3px var(--su-redl); }

      .su-eye-btn {
        position: absolute;
        right: 12px;
        background: none;
        border: none;
        color: var(--su-text3);
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 2px;
        transition: color 0.15s;
      }
      .su-eye-btn:hover { color: var(--su-text); }

      .su-field-error {
        font-size: 12px;
        color: var(--su-red);
        margin: 5px 0 0;
      }

      /* ── Password strength ── */
      .su-strength { margin-top: 8px; }
      .su-strength-bars {
        display: flex;
        gap: 4px;
        margin-bottom: 5px;
      }
      .su-strength-bar {
        flex: 1;
        height: 4px;
        border-radius: 9999px;
        background: var(--su-border);
        transition: background 0.3s ease;
      }
      .su-strength-label {
        font-size: 11px;
        font-weight: 600;
        margin: 0;
      }

      /* ── Submit button ── */
      .su-btn-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 13px 22px;
        border-radius: 12px;
        background: var(--su-accent);
        color: #fff;
        font-size: 14px;
        font-weight: 700;
        font-family: inherit;
        border: none;
        cursor: pointer;
        text-decoration: none;
        box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3);
        transition: background 0.2s, transform 0.15s, opacity 0.2s;
        letter-spacing: -0.01em;
      }
      .su-btn-primary:hover:not(:disabled) {
        background: var(--su-accent2);
        transform: translateY(-1px);
      }
      .su-btn-primary:active:not(:disabled) { transform: scale(0.98); }
      .su-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
      .su-full-width { width: 100%; box-sizing: border-box; }
      .su-submit-btn { margin-top: 4px; }

      /* ── Spinner ── */
      .su-spinner {
        width: 16px;
        height: 16px;
        border: 2.5px solid rgba(255, 255, 255, 0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: suSpin 0.7s linear infinite;
        flex-shrink: 0;
      }

      /* ── Sign in prompt ── */
      .su-signin-prompt {
        text-align: center;
        font-size: 13px;
        color: var(--su-text2);
        margin: 24px 0 0;
      }
      .su-signin-link {
        color: var(--su-accent);
        font-weight: 700;
        text-decoration: none;
      }
      .su-signin-link:hover { text-decoration: underline; }

      /* ── Right decorative panel ── */
      .su-right {
        display: none;
        position: relative;
        overflow: hidden;
        background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px;
        box-sizing: border-box;
      }
      @media (min-width: 1024px) {
        .su-right {
          display: flex;
          width: 40%;
          flex-shrink: 0;
        }
      }
      .su-right-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(60px);
        pointer-events: none;
      }
      .su-right-orb--top {
        width: 260px; height: 260px;
        background: rgba(255, 255, 255, 0.12);
        top: -80px; right: -60px;
      }
      .su-right-orb--bottom {
        width: 280px; height: 280px;
        background: rgba(236, 72, 153, 0.2);
        bottom: -80px; left: -60px;
      }
      .su-right-content {
        position: relative;
        z-index: 1;
        text-align: center;
        color: #fff;
      }
      .su-right-icon-wrap {
        width: 80px;
        height: 80px;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 28px;
        backdrop-filter: blur(8px);
      }
      .su-right-title {
        font-size: 28px;
        font-weight: 800;
        line-height: 1.25;
        margin: 0 0 16px;
        letter-spacing: -0.03em;
      }
      .su-right-body {
        font-size: 14px;
        color: rgba(199, 193, 255, 0.9);
        line-height: 1.7;
        max-width: 280px;
        margin: 0 auto;
      }

      /* ── Success screen ── */
      .su-success-wrap {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--su-bg);
        padding: 32px 16px;
        box-sizing: border-box;
      }
      .su-success-card {
        max-width: 440px;
        width: 100%;
        background: var(--su-bg);
        border: 1px solid var(--su-border);
        border-radius: 24px;
        padding: 48px 36px;
        text-align: center;
        box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
        animation: suFadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
      }
      .su-success-icon-wrap {
        width: 84px;
        height: 84px;
        border-radius: 50%;
        background: var(--su-greenl);
        border: 1px solid rgba(34, 197, 94, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
        animation: suPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
      }
      .su-success-title {
        font-size: 24px;
        font-weight: 800;
        color: var(--su-text);
        margin: 0 0 12px;
        letter-spacing: -0.03em;
      }
      .su-success-body {
        font-size: 14px;
        color: var(--su-text2);
        line-height: 1.7;
        margin: 0 0 28px;
      }

      /* ── Keyframes ── */
      @keyframes suFadeIn  { from { opacity: 0; } to { opacity: 1; } }
      @keyframes suFadeUp  { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes suSpin    { to { transform: rotate(360deg); } }
      @keyframes suPop     { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
    `}</style>
  );
} 