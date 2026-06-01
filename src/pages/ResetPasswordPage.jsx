import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase.js';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { document.title = 'Set New Password — ShopVerse'; }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error: err } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      toast.success('Password updated successfully! 🎉');
    }
  };

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <>
      <style>{`
        .rp-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: ${isDark ? '#0f172a' : '#f9fafb'};
        }

        .rp-card {
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
        @media (min-width: 640px) { .rp-card { padding: 48px 40px; } }

        .rp-blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(40px);
        }
        .rp-blob-1 {
          top: -40px; right: -40px;
          width: 180px; height: 180px;
          background: rgba(99,102,241,0.1);
        }
        .rp-blob-2 {
          bottom: -60px; left: -60px;
          width: 200px; height: 200px;
          background: rgba(124,58,237,0.08);
        }

        .rp-content { position: relative; z-index: 10; }

        .rp-icon-wrap {
          width: 72px; height: 72px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }
        .rp-icon-key {
          background: ${isDark ? 'rgba(79,70,229,0.2)' : '#eef2ff'};
          color: ${isDark ? '#818cf8' : '#4f46e5'};
        }
        .rp-icon-success {
          background: ${isDark ? 'rgba(34,197,94,0.15)' : '#f0fdf4'};
          color: #22c55e;
        }

        .rp-title {
          text-align: center;
          font-size: 26px;
          font-weight: 800;
          color: ${isDark ? '#f9fafb' : '#111827'};
          margin: 0 0 8px;
          letter-spacing: -0.02em;
        }
        .rp-desc {
          text-align: center;
          font-size: 14px;
          color: ${isDark ? '#94a3b8' : '#6b7280'};
          margin: 0 0 32px;
          line-height: 1.6;
        }

        .rp-error {
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
          animation: rpFadeIn 0.2s ease;
        }

        .rp-fields { display: flex; flex-direction: column; gap: 20px; }

        .rp-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: ${isDark ? '#d1d5db' : '#374151'};
          margin-bottom: 7px;
        }

        .rp-input-wrap { position: relative; }
        .rp-input-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
          display: flex;
        }

        .rp-input {
          width: 100%;
          padding: 12px 44px 12px 42px;
          border-radius: 12px;
          border: 1px solid ${isDark ? '#334155' : '#e5e7eb'};
          background: ${isDark ? '#1e293b' : '#f9fafb'};
          color: ${isDark ? '#f9fafb' : '#111827'};
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .rp-input::placeholder { color: #9ca3af; }
        .rp-input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.15);
          background: ${isDark ? '#1e293b' : '#ffffff'};
        }

        .rp-eye-btn {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          padding: 0;
          transition: color 0.2s;
        }
        .rp-eye-btn:hover { color: ${isDark ? '#d1d5db' : '#4b5563'}; }

        .rp-submit {
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
          margin-top: 8px;
          box-shadow: 0 4px 14px rgba(79,70,229,0.3);
          transition: background 0.2s, transform 0.15s, opacity 0.2s;
        }
        .rp-submit:hover:not(:disabled) { background: #4338ca; }
        .rp-submit:active:not(:disabled) { transform: scale(0.98); }
        .rp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .rp-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: rpSpin 0.7s linear infinite;
          flex-shrink: 0;
        }

        .rp-login-btn {
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
        .rp-login-btn:hover { background: #4338ca; }

        .rp-strength {
          margin-top: 8px;
          display: flex;
          gap: 4px;
        }
        .rp-strength-bar {
          flex: 1;
          height: 4px;
          border-radius: 2px;
          transition: background 0.3s;
        }

        @keyframes rpFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rpSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="rp-root">
        <div className="rp-card">
          <div className="rp-blob rp-blob-1" />
          <div className="rp-blob rp-blob-2" />

          <div className="rp-content">
            {success ? (
              /* ── Success ── */
              <div style={{ animation: 'rpFadeIn 0.3s ease' }}>
                <div className="rp-icon-wrap rp-icon-success">
                  <CheckCircle2 size={34} />
                </div>
                <h2 className="rp-title">Password Updated!</h2>
                <p className="rp-desc">
                  Your password has been changed successfully. You can now log in with your new password.
                </p>
                <Link to="/login" className="rp-login-btn">
                  Go to Login <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              /* ── Form ── */
              <>
                <div className="rp-icon-wrap rp-icon-key">
                  <KeyRound size={34} />
                </div>
                <h2 className="rp-title">Set new password</h2>
                <p className="rp-desc">
                  Choose a strong password with at least 6 characters.
                </p>

                {error && (
                  <div className="rp-error">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0, marginTop: 1 }}>
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="rp-fields">
                    {/* New Password */}
                    <div>
                      <label className="rp-label">New Password</label>
                      <div className="rp-input-wrap">
                        <span className="rp-input-icon"><Lock size={17} /></span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          autoComplete="new-password"
                          className="rp-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="rp-eye-btn"
                          aria-label={showPassword ? 'Hide' : 'Show'}
                        >
                          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                      {/* Strength bar */}
                      {password && (
                        <div className="rp-strength">
                          {[0, 1, 2, 3].map((i) => {
                            let score = 0;
                            if (password.length >= 6) score++;
                            if (password.length >= 8) score++;
                            if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
                            if (/[0-9!@#$%^&*]/.test(password)) score++;
                            const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];
                            return (
                              <div
                                key={i}
                                className="rp-strength-bar"
                                style={{
                                  background: i < score ? colors[score - 1] : (isDark ? '#334155' : '#e5e7eb'),
                                }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="rp-label">Confirm Password</label>
                      <div className="rp-input-wrap">
                        <span className="rp-input-icon"><Lock size={17} /></span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          autoComplete="new-password"
                          className="rp-input"
                        />
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <p style={{ marginTop: 6, fontSize: 12, color: '#ef4444' }}>
                          Passwords don't match
                        </p>
                      )}
                      {confirmPassword && password === confirmPassword && confirmPassword.length >= 6 && (
                        <p style={{ marginTop: 6, fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={12} /> Passwords match
                        </p>
                      )}
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="rp-submit">
                    {loading ? (
                      <><span className="rp-spinner" /> Updating...</>
                    ) : (
                      <>Update Password</>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
