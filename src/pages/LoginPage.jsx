import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../stores/useAuthStore';

export default function LoginPage() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const { login, user } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => { document.title = 'Login — ShopVerse'; }, []);
  useEffect(() => { if (user) navigate(from, { replace: true }); }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const { error: err } = await login(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(err.message || 'Invalid email or password.');
    } else {
      toast.success('Welcome back! 👋');
      navigate(from, { replace: true });
    }
  };

  return (
    <>
      <style>{`
        /* ── Tokens ── */
        :root {
          --lp-bg:       #ffffff;
          --lp-surface:  #f9fafb;
          --lp-border:   #e5e7eb;
          --lp-text:     #111827;
          --lp-text2:    #6b7280;
          --lp-text3:    #9ca3af;
          --lp-accent:   #4f46e5;
          --lp-accent2:  #4338ca;
          --lp-accentl:  rgba(79,70,229,0.15);
          --lp-red:      #dc2626;
          --lp-redl:     #fef2f2;
          --lp-redborder:#fecaca;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --lp-bg:        #0f172a;
            --lp-surface:   #1e293b;
            --lp-border:    #334155;
            --lp-text:      #f9fafb;
            --lp-text2:     #94a3b8;
            --lp-text3:     #64748b;
            --lp-accentl:   rgba(99,102,241,0.18);
            --lp-red:       #f87171;
            --lp-redl:      rgba(127,29,29,0.2);
            --lp-redborder: rgba(127,29,29,0.4);
          }
        }

        /* ── Root ── */
        .lp-root {
          min-height: 100vh;
          display: flex;
        }

        /* ── Left decorative panel ── */
        .lp-panel {
          display: none;
        }
        @media (min-width: 1024px) {
          .lp-panel {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 50%;
            flex-shrink: 0;
            position: relative;
            overflow: hidden;
            padding: 48px;
            box-sizing: border-box;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%);
          }
        }

        /* Blobs */
        .lp-blob { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(48px); }
        .lp-blob-tl {
          top: 0; left: 0;
          width: 288px; height: 288px;
          background: rgba(255,255,255,0.1);
          transform: translate(-50%, -50%);
          animation: lpFloat 8s ease-in-out infinite;
        }
        .lp-blob-br {
          bottom: 0; right: 0;
          width: 384px; height: 384px;
          background: rgba(236,72,153,0.18);
          transform: translate(50%, 50%);
          animation: lpFloat 10s ease-in-out infinite reverse;
        }
        .lp-blob-mid {
          top: 50%; left: 50%;
          width: 256px; height: 256px;
          background: rgba(167,139,250,0.18);
          transform: translate(-50%, -50%);
          filter: blur(36px);
          animation: lpFloat 12s ease-in-out infinite 2s;
        }

        /* Panel inner content */
        .lp-panel-inner {
          position: relative;
          z-index: 10;
          color: white;
          text-align: center;
          animation: lpSlideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .lp-panel-logo {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          margin-bottom: 48px;
          gap: 1px;
        }
        .lp-panel-logo-shop  { font-size: 36px; font-weight: 900; color: white; }
        .lp-panel-logo-verse { font-size: 36px; font-weight: 700; color: rgba(255,255,255,0.75); }

        .lp-sparkle-wrap {
          width: 80px; height: 80px;
          background: rgba(255,255,255,0.14);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 32px;
          backdrop-filter: blur(8px);
          animation: lpPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.3s both;
        }
        .lp-panel-title {
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin: 0 0 16px;
          line-height: 1.3;
          animation: lpSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.15s both;
        }
        .lp-panel-desc {
          font-size: 15px;
          color: rgba(199,210,254,0.9);
          max-width: 280px;
          margin: 0 auto;
          line-height: 1.6;
          animation: lpSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.25s both;
        }
        .lp-features {
          margin-top: 40px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
          max-width: 260px;
          margin-left: auto;
          margin-right: auto;
        }
        .lp-feature-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: rgba(255,255,255,0.88);
          animation: lpSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) both;
        }
        .lp-feature-row:nth-child(1) { animation-delay: 0.35s; }
        .lp-feature-row:nth-child(2) { animation-delay: 0.45s; }
        .lp-feature-row:nth-child(3) { animation-delay: 0.55s; }
        .lp-check {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* ── Right form side ── */
        .lp-form-side {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: var(--lp-bg);
          box-sizing: border-box;
        }
        @media (min-width: 640px) { .lp-form-side { padding: 40px; } }

        .lp-form-wrap {
          width: 100%;
          max-width: 420px;
          animation: lpSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both;
        }

        /* Mobile logo */
        .lp-mobile-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 32px;
          text-decoration: none;
          gap: 1px;
        }
        @media (min-width: 1024px) { .lp-mobile-logo { display: none; } }
        .lp-mobile-logo-shop {
          font-size: 28px;
          font-weight: 900;
          background: linear-gradient(to right, #4f46e5, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .lp-mobile-logo-verse {
          font-size: 28px;
          font-weight: 700;
          color: var(--lp-text);
        }

        /* Heading */
        .lp-heading {
          margin-bottom: 32px;
          animation: lpSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.15s both;
        }
        .lp-heading h2 {
          font-size: 28px;
          font-weight: 800;
          color: var(--lp-text);
          margin: 0 0 6px;
          letter-spacing: -0.02em;
        }
        .lp-heading p {
          font-size: 14px;
          color: var(--lp-text2);
          margin: 0;
        }

        /* Error */
        .lp-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px 16px;
          margin-bottom: 24px;
          border-radius: 12px;
          background: var(--lp-redl);
          border: 1px solid var(--lp-redborder);
          font-size: 13px;
          color: var(--lp-red);
          animation: lpShake 0.4s cubic-bezier(0.36,0.07,0.19,0.97) both;
        }

        /* Fields */
        .lp-fields {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .lp-field {
          animation: lpSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) both;
        }
        .lp-field:nth-child(1) { animation-delay: 0.2s; }
        .lp-field:nth-child(2) { animation-delay: 0.3s; }

        .lp-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--lp-text);
          margin-bottom: 7px;
        }
        .lp-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 7px;
        }
        .lp-label-row .lp-label { margin-bottom: 0; }
        .lp-forgot {
          font-size: 12px;
          font-weight: 600;
          color: var(--lp-accent);
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .lp-forgot:hover { text-decoration: underline; }

        .lp-input-wrap { position: relative; }
        .lp-input-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--lp-text3);
          pointer-events: none;
          display: flex;
          transition: color 0.2s;
        }
        .lp-input-wrap:focus-within .lp-input-icon {
          color: var(--lp-accent);
        }

        .lp-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          border-radius: 12px;
          border: 1.5px solid var(--lp-border);
          background: var(--lp-surface);
          color: var(--lp-text);
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s, transform 0.15s;
          box-sizing: border-box;
        }
        .lp-input::placeholder { color: var(--lp-text3); }
        .lp-input:focus {
          border-color: var(--lp-accent);
          box-shadow: 0 0 0 3px var(--lp-accentl);
          background: var(--lp-bg);
          transform: translateY(-1px);
        }
        .lp-input-pr { padding-right: 44px; }

        .lp-eye-btn {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--lp-text3);
          display: flex;
          padding: 0;
          transition: color 0.2s;
        }
        .lp-eye-btn:hover { color: var(--lp-text); }

        /* Submit */
        .lp-submit-wrap {
          animation: lpSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.4s both;
        }
        .lp-submit {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px;
          border-radius: 12px;
          background: var(--lp-accent);
          color: white;
          font-size: 14px;
          font-weight: 700;
          font-family: inherit;
          border: none;
          cursor: pointer;
          margin-top: 8px;
          box-shadow: 0 4px 14px rgba(79,70,229,0.3);
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          letter-spacing: -0.01em;
        }
        .lp-submit:hover:not(:disabled) {
          background: var(--lp-accent2);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(79,70,229,0.4);
        }
        .lp-submit:active:not(:disabled) { transform: scale(0.98); box-shadow: none; }
        .lp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Spinner */
        .lp-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: lpSpin 0.7s linear infinite;
          flex-shrink: 0;
        }

        /* Footer */
        .lp-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 24px 0;
          color: var(--lp-text3);
          font-size: 13px;
          font-weight: 500;
          animation: lpSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.45s both;
        }
        .lp-divider::before, .lp-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--lp-border);
        }
        .lp-divider::before { margin-right: 12px; }
        .lp-divider::after { margin-left: 12px; }

        .lp-google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px;
          border-radius: 12px;
          background: var(--lp-surface);
          color: var(--lp-text);
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          border: 1.5px solid var(--lp-border);
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, border-color 0.2s;
          animation: lpSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.5s both;
        }
        .lp-google-btn:hover {
          background: var(--lp-bg);
          border-color: var(--lp-text3);
          transform: translateY(-1px);
        }
        .lp-google-btn:active { transform: scale(0.98); }

        .lp-footer {
          margin-top: 32px;
          text-align: center;
          font-size: 14px;
          color: var(--lp-text2);
          animation: lpSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.5s both;
        }
        .lp-signup-link {
          color: var(--lp-accent);
          font-weight: 700;
          text-decoration: none;
          position: relative;
        }
        .lp-signup-link::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 0;
          height: 1.5px;
          background: var(--lp-accent);
          transition: width 0.25s ease;
        }
        .lp-signup-link:hover::after { width: 100%; }

        /* ── Keyframes ── */
        @keyframes lpSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lpPop {
          from { opacity: 0; transform: scale(0.6) rotate(-8deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes lpFloat {
          0%, 100% { transform: translate(var(--tx, -50%), var(--ty, -50%)) translateY(0px); }
          50%       { transform: translate(var(--tx, -50%), var(--ty, -50%)) translateY(-18px); }
        }
        .lp-blob-tl { --tx: -50%; --ty: -50%; }
        .lp-blob-br { --tx: 50%;  --ty: 50%;  }
        .lp-blob-mid { --tx: -50%; --ty: -50%; }

        @keyframes lpShake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-6px); }
          30%       { transform: translateX(5px); }
          45%       { transform: translateX(-4px); }
          60%       { transform: translateX(3px); }
          75%       { transform: translateX(-2px); }
        }
        @keyframes lpSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="lp-root">

        {/* ── Left decorative panel ── */}
        <div className="lp-panel">
          <div className="lp-blob lp-blob-tl" />
          <div className="lp-blob lp-blob-br" />
          <div className="lp-blob lp-blob-mid" />

          <div className="lp-panel-inner">
            <Link to="/" className="lp-panel-logo">
              <span className="lp-panel-logo-shop">Shop</span>
              <span className="lp-panel-logo-verse">Verse</span>
            </Link>

            <div className="lp-sparkle-wrap">
              <Sparkles size={34} color="white" />
            </div>

            <h1 className="lp-panel-title">Welcome back to<br />ShopVerse</h1>
            <p className="lp-panel-desc">
              Your premium shopping destination for the latest products at unbeatable prices.
            </p>

            <div className="lp-features">
              {['Track all your orders', 'Save items to wishlist', 'Exclusive member deals'].map((item) => (
                <div key={item} className="lp-feature-row">
                  <div className="lp-check">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right form side ── */}
        <div className="lp-form-side">
          <div className="lp-form-wrap">

            {/* Mobile logo */}
            <Link to="/" className="lp-mobile-logo">
              <span className="lp-mobile-logo-shop">Shop</span>
              <span className="lp-mobile-logo-verse">Verse</span>
            </Link>

            <div className="lp-heading">
              <h2>Sign in</h2>
              <p>Welcome back! Please enter your details.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="lp-error">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="lp-fields">

                {/* Email */}
                <div className="lp-field">
                  <label className="lp-label">Email address</label>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon"><Mail size={17} /></span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className="lp-input"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="lp-field">
                  <div className="lp-label-row">
                    <label className="lp-label">Password</label>
                    <Link to="/forgot-password" className="lp-forgot">Forgot password?</Link>
                  </div>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon"><Lock size={17} /></span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="lp-input lp-input-pr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="lp-eye-btn"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

              </div>

              {/* Submit */}
              <div className="lp-submit-wrap">
                <button type="submit" disabled={loading} className="lp-submit">
                  {loading ? (
                    <>
                      <span className="lp-spinner" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="lp-divider">OR</div>

            <button type="button" onClick={() => useAuthStore.getState().loginWithGoogle()} className="lp-google-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>

            <p className="lp-footer">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="lp-signup-link">Create one</Link>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}