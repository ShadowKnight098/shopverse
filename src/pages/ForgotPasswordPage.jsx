import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => { document.title = 'Reset Password — ShopVerse'; }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError('');

    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
    }
  };

  /* ─── Reuse LoginPage-like inline styles ─── */
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <>
      <style>{`
        .fp-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: ${isDark ? '#0f172a' : '#f9fafb'};
        }

        .fp-card {
          width: 100%;
          max-width: 440px;
          background: ${isDark ? '#1e293b' : '#ffffff'};
          border-radius: 24px;
          padding: 40px 32px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          border: 1px solid ${isDark ? '#334155' : '#f0f0f0'};
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 640px) { .fp-card { padding: 48px 40px; } }

        .fp-blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(40px);
        }
        .fp-blob-1 {
          top: -40px; right: -40px;
          width: 180px; height: 180px;
          background: rgba(99,102,241,0.1);
        }
        .fp-blob-2 {
          bottom: -60px; left: -60px;
          width: 200px; height: 200px;
          background: rgba(124,58,237,0.08);
        }

        .fp-content { position: relative; z-index: 10; }

        .fp-icon-wrap {
          width: 72px; height: 72px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }
        .fp-icon-reset {
          background: ${isDark ? 'rgba(79,70,229,0.2)' : '#eef2ff'};
          color: ${isDark ? '#818cf8' : '#4f46e5'};
        }
        .fp-icon-success {
          background: ${isDark ? 'rgba(34,197,94,0.15)' : '#f0fdf4'};
          color: #22c55e;
        }

        .fp-title {
          text-align: center;
          font-size: 26px;
          font-weight: 800;
          color: ${isDark ? '#f9fafb' : '#111827'};
          margin: 0 0 8px;
          letter-spacing: -0.02em;
        }
        .fp-desc {
          text-align: center;
          font-size: 14px;
          color: ${isDark ? '#94a3b8' : '#6b7280'};
          margin: 0 0 32px;
          line-height: 1.6;
          max-width: 320px;
          margin-left: auto;
          margin-right: auto;
        }

        .fp-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px 16px;
          margin-bottom: 20px;
          border-radius: 12px;
          background: ${isDark ? 'rgba(127,29,29,0.2)' : '#fef2f2'};
          border: 1px solid ${isDark ? 'rgba(127,29,29,0.4)' : '#fecaca'};
          font-size: 13px;
          color: ${isDark ? '#f87171' : '#dc2626'};
          animation: fpFadeIn 0.2s ease;
        }

        .fp-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: ${isDark ? '#d1d5db' : '#374151'};
          margin-bottom: 7px;
        }

        .fp-input-wrap { position: relative; }
        .fp-input-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
          display: flex;
        }

        .fp-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          border-radius: 12px;
          border: 1px solid ${isDark ? '#334155' : '#e5e7eb'};
          background: ${isDark ? '#1e293b' : '#f9fafb'};
          color: ${isDark ? '#f9fafb' : '#111827'};
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .fp-input::placeholder { color: #9ca3af; }
        .fp-input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.15);
          background: ${isDark ? '#1e293b' : '#ffffff'};
        }

        .fp-submit {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px;
          border-radius: 12px;
          background: #4f46e5;
          color: white;
          font-size: 14px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          margin-top: 20px;
          box-shadow: 0 4px 14px rgba(79,70,229,0.3);
          transition: background 0.2s, transform 0.15s, opacity 0.2s;
        }
        .fp-submit:hover:not(:disabled) { background: #4338ca; }
        .fp-submit:active:not(:disabled) { transform: scale(0.98); }
        .fp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .fp-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: fpSpin 0.7s linear infinite;
          flex-shrink: 0;
        }

        .fp-back {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 24px;
          font-size: 14px;
          font-weight: 600;
          color: ${isDark ? '#94a3b8' : '#6b7280'};
          text-decoration: none;
          transition: color 0.2s;
        }
        .fp-back:hover { color: ${isDark ? '#818cf8' : '#4f46e5'}; }

        .fp-return-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px;
          border-radius: 12px;
          background: #4f46e5;
          color: white;
          font-size: 14px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          text-decoration: none;
          margin-top: 8px;
          box-shadow: 0 4px 14px rgba(79,70,229,0.3);
          transition: background 0.2s;
        }
        .fp-return-btn:hover { background: #4338ca; }

        .fp-email-highlight {
          font-weight: 600;
          color: ${isDark ? '#e2e8f0' : '#374151'};
        }

        @keyframes fpFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fpSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="fp-root">
        <div className="fp-card">
          <div className="fp-blob fp-blob-1" />
          <div className="fp-blob fp-blob-2" />

          <div className="fp-content">
            {success ? (
              /* ── Success state ── */
              <div style={{ animation: 'fpFadeIn 0.3s ease' }}>
                <div className="fp-icon-wrap fp-icon-success">
                  <CheckCircle2 size={34} />
                </div>
                <h2 className="fp-title">Check your email</h2>
                <p className="fp-desc">
                  We've sent a password reset link to{' '}
                  <span className="fp-email-highlight">{email}</span>.
                  Open the email and click the link to set a new password.
                </p>
                <Link to="/login" className="fp-return-btn">
                  Return to Login
                </Link>
              </div>
            ) : (
              /* ── Form ── */
              <>
                <div className="fp-icon-wrap fp-icon-reset">
                  <KeyRound size={34} />
                </div>
                <h2 className="fp-title">Reset password</h2>
                <p className="fp-desc">
                  Enter the email associated with your account and we'll send you a link to reset your password.
                </p>

                {error && (
                  <div className="fp-error">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0, marginTop: 1 }}>
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div>
                    <label className="fp-label">Email address</label>
                    <div className="fp-input-wrap">
                      <span className="fp-input-icon"><Mail size={17} /></span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        className="fp-input"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="fp-submit">
                    {loading ? (
                      <><span className="fp-spinner" /> Sending...</>
                    ) : (
                      <>Send Reset Link</>
                    )}
                  </button>
                </form>

                <Link to="/login" className="fp-back">
                  <ArrowLeft size={16} /> Back to login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
