import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ArrowRight, CheckCircle2, Phone, FileText, Package, BarChart2, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../stores/useAuthStore';
import { supabase } from '../lib/supabase.js';

const BENEFITS = [
  { icon: Package,    title: 'Manage Products', desc: 'Upload & manage your inventory easily' },
  { icon: Image,      title: 'Upload Images',   desc: 'Showcase real product photos'          },
  { icon: BarChart2,  title: 'Track Sales',     desc: 'Monitor your store performance'        },
];

export default function DealerRegisterPage() {
  const [form, setForm]     = useState({ shop_name: '', shop_description: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, isDealer, isLoading, fetchProfile } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Become a Dealer — ShopVerse';
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!isLoading && isDealer) navigate('/dealer');
  }, [isDealer, isLoading, navigate]);

  useEffect(() => {
    if (!isLoading && !user) navigate('/login');
  }, [user, isLoading, navigate]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shop_name.trim()) { toast.error('Please enter your shop name.'); return; }
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        role:             'dealer',
        shop_name:        form.shop_name.trim(),
        shop_description: form.shop_description.trim(),
        phone:            form.phone.trim(),
        is_approved:      false,
      })
      .eq('id', user.id);

    if (error) { toast.error(error.message); setLoading(false); return; }
    await fetchProfile(user.id);
    setLoading(false);
    setDone(true);
  };

  /* ── Success screen ── */
  if (done) {
    return (
      <>
        <DRPStyles />
        <div className="drp-success-wrap">
          <div className="drp-success-card">
            <div className="drp-success-icon">
              <CheckCircle2 size={38} />
            </div>
            <h2 className="drp-success-title">Application Submitted!</h2>
            <p className="drp-success-body">
              Your dealer application for{' '}
              <strong style={{ color: 'var(--drp-text)' }}>{form.shop_name}</strong>{' '}
              has been received. Our team will review and approve your account within 24 hours.
            </p>
            <Link to="/" className="drp-btn-primary drp-btn--full">
              Back to Store
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DRPStyles />
      <div className="drp-root">

        {/* ── Left: form ── */}
        <div className="drp-left">
          <div className={`drp-form-wrap ${mounted ? 'drp-form-wrap--visible' : ''}`}>

            {/* Logo block */}
            <div className="drp-logo-block">
              <div className="drp-store-icon">
                <Store size={26} color="white" />
              </div>
              <h1 className="drp-heading">Become a Dealer</h1>
              <p className="drp-subheading">
                Register your shop on ShopVerse and start selling to thousands of customers.
              </p>
            </div>

            {/* Benefits */}
            <div className="drp-benefits">
              {BENEFITS.map(({ icon: Icon, title, desc }, i) => (
                <div
                  key={title}
                  className="drp-benefit-card"
                  style={{ animationDelay: `${0.1 + i * 0.07}s` }}
                >
                  <div className="drp-benefit-icon">
                    <Icon size={16} />
                  </div>
                  <p className="drp-benefit-title">{title}</p>
                  <p className="drp-benefit-desc">{desc}</p>
                </div>
              ))}
            </div>

            {/* Form card */}
            <div className="drp-card" style={{ animationDelay: '0.32s' }}>
              <h2 className="drp-card-title">Shop Information</h2>

              <form onSubmit={handleSubmit} className="drp-form">

                {/* Shop name */}
                <div className="drp-field">
                  <label className="drp-label">
                    Shop Name <span className="drp-required">*</span>
                  </label>
                  <div className="drp-input-wrap">
                    <Store size={15} className="drp-input-icon" />
                    <input
                      type="text"
                      value={form.shop_name}
                      onChange={set('shop_name')}
                      placeholder="e.g. Tech Galaxy Store"
                      required
                      className="drp-input"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="drp-field">
                  <label className="drp-label">Phone Number</label>
                  <div className="drp-input-wrap">
                    <Phone size={15} className="drp-input-icon" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      placeholder="+91 98765 43210"
                      className="drp-input"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="drp-field">
                  <label className="drp-label">Shop Description</label>
                  <div className="drp-input-wrap drp-textarea-wrap">
                    <FileText size={15} className="drp-input-icon drp-input-icon--top" />
                    <textarea
                      value={form.shop_description}
                      onChange={set('shop_description')}
                      placeholder="Tell customers what you sell and what makes your shop special..."
                      rows={3}
                      className="drp-input drp-textarea"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="drp-btn-primary drp-btn--full drp-submit"
                >
                  {loading ? (
                    <>
                      <span className="drp-spinner" />
                      Submitting application...
                    </>
                  ) : (
                    <>
                      <Store size={15} />
                      Submit Application
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

              </form>
            </div>

            <p className="drp-login-prompt">
              Already a dealer?{' '}
              <Link to="/dealer" className="drp-login-link">Go to your portal</Link>
            </p>

          </div>
        </div>


      </div>
    </>
  );
}

function DRPStyles() {
  return (
    <style>{`
      :root {
        --drp-bg:        #ffffff;
        --drp-surface:   #f7f6f3;
        --drp-border:    #e8e4de;
        --drp-text:      #1a1714;
        --drp-text2:     #5c5650;
        --drp-text3:     #9c9690;
        --drp-accent:    #6366f1;
        --drp-accent2:   #4f46e5;
        --drp-accentl:   rgba(99,102,241,0.1);
        --drp-red:       #ef4444;
        --drp-green:     #22c55e;
        --drp-greenl:    rgba(34,197,94,0.1);
        --drp-greenborder: rgba(34,197,94,0.25);
        --drp-radius:    14px;
        --drp-card-r:    20px;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --drp-bg:      #0f0e0c;
          --drp-surface: #1a1917;
          --drp-border:  #2d2b27;
          --drp-text:    #f2ede8;
          --drp-text2:   #a09890;
          --drp-text3:   #6b6460;
          --drp-accentl: rgba(99,102,241,0.14);
          --drp-greenl:  rgba(34,197,94,0.12);
        }
      }

      /* ── Root layout ── */
      .drp-root {
        min-height: 100vh;
        display: flex;
        background: var(--drp-bg);
      }

      /* ── Left column ── */
      .drp-left {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 48px 24px;
        box-sizing: border-box;
        overflow-y: auto;
      }
      .drp-form-wrap {
        width: 100%;
        max-width: 460px;
        opacity: 0;
        transform: translateY(16px);
        transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.22,1,0.36,1);
      }
      .drp-form-wrap--visible {
        opacity: 1;
        transform: translateY(0);
      }

      /* ── Logo block ── */
      .drp-logo-block {
        text-align: center;
        margin-bottom: 28px;
      }
      .drp-store-icon {
        width: 62px;
        height: 62px;
        border-radius: 18px;
        background: linear-gradient(135deg, #7c3aed, #6366f1);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 18px;
      }
      .drp-heading {
        font-size: clamp(22px, 4vw, 28px);
        font-weight: 800;
        color: var(--drp-text);
        margin: 0 0 8px;
        letter-spacing: -0.03em;
      }
      .drp-subheading {
        font-size: 14px;
        color: var(--drp-text2);
        margin: 0;
        line-height: 1.6;
        max-width: 320px;
        margin: 0 auto;
      }

      /* ── Benefits grid ── */
      .drp-benefits {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 20px;
      }
      @media (max-width: 480px) {
        .drp-benefits { grid-template-columns: 1fr; }
      }
      .drp-benefit-card {
        background: var(--drp-surface);
        border: 1px solid var(--drp-border);
        border-radius: var(--drp-radius);
        padding: 14px 12px;
        text-align: center;
        animation: drpSlideUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
      }
      .drp-benefit-icon {
        width: 32px;
        height: 32px;
        border-radius: 9px;
        background: var(--drp-accentl);
        color: var(--drp-accent);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 8px;
      }
      .drp-benefit-title {
        font-size: 12px;
        font-weight: 700;
        color: var(--drp-text);
        margin: 0 0 3px;
      }
      .drp-benefit-desc {
        font-size: 11px;
        color: var(--drp-text3);
        margin: 0;
        line-height: 1.4;
      }

      /* ── Form card ── */
      .drp-card {
        background: var(--drp-bg);
        border: 1px solid var(--drp-border);
        border-radius: var(--drp-card-r);
        padding: 28px;
        animation: drpSlideUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
      }
      .drp-card-title {
        font-size: 15px;
        font-weight: 700;
        color: var(--drp-text);
        margin: 0 0 20px;
        letter-spacing: -0.01em;
      }
      .drp-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      /* ── Fields ── */
      .drp-field { display: flex; flex-direction: column; gap: 6px; }
      .drp-label {
        font-size: 12px;
        font-weight: 700;
        color: var(--drp-text2);
        letter-spacing: 0.02em;
      }
      .drp-required { color: var(--drp-red); }

      .drp-input-wrap { position: relative; }
      .drp-input-icon {
        position: absolute;
        left: 13px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--drp-text3);
        pointer-events: none;
        flex-shrink: 0;
      }
      .drp-input-icon--top {
        top: 14px;
        transform: none;
      }
      .drp-input {
        width: 100%;
        padding: 11px 14px 11px 40px;
        border-radius: var(--drp-radius);
        border: 1.5px solid var(--drp-border);
        background: var(--drp-surface);
        color: var(--drp-text);
        font-size: 13.5px;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        box-sizing: border-box;
      }
      .drp-input::placeholder { color: var(--drp-text3); }
      .drp-input:focus {
        border-color: var(--drp-accent);
        box-shadow: 0 0 0 3px var(--drp-accentl);
        background: var(--drp-bg);
      }
      .drp-textarea {
        resize: vertical;
        min-height: 88px;
        line-height: 1.6;
        padding-top: 11px;
      }

      /* ── Buttons ── */
      .drp-btn-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 13px 24px;
        border-radius: var(--drp-radius);
        background: var(--drp-accent);
        color: #fff;
        font-size: 14px;
        font-weight: 700;
        font-family: inherit;
        border: none;
        cursor: pointer;
        text-decoration: none;
        box-shadow: 0 4px 16px rgba(99,102,241,0.3);
        transition: background 0.2s, transform 0.15s, opacity 0.2s;
        letter-spacing: -0.01em;
      }
      .drp-btn-primary:hover:not(:disabled) {
        background: var(--drp-accent2);
        transform: translateY(-1px);
      }
      .drp-btn-primary:active:not(:disabled) { transform: scale(0.98); }
      .drp-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
      .drp-btn--full { width: 100%; box-sizing: border-box; }
      .drp-submit { margin-top: 4px; }

      /* ── Spinner ── */
      .drp-spinner {
        width: 15px;
        height: 15px;
        border: 2.5px solid rgba(255,255,255,0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: drpSpin 0.7s linear infinite;
        flex-shrink: 0;
      }

      /* ── Login prompt ── */
      .drp-login-prompt {
        text-align: center;
        font-size: 13px;
        color: var(--drp-text2);
        margin: 20px 0 0;
      }
      .drp-login-link {
        color: var(--drp-accent);
        font-weight: 700;
        text-decoration: none;
      }
      .drp-login-link:hover { text-decoration: underline; }

      /* ── Right decorative panel ── */
      .drp-right {
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
        .drp-right {
          display: flex;
          width: 38%;
          flex-shrink: 0;
        }
      }
      .drp-right-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(60px);
        pointer-events: none;
      }
      .drp-right-orb--top {
        width: 260px; height: 260px;
        background: rgba(255,255,255,0.1);
        top: -80px; right: -60px;
      }
      .drp-right-orb--bottom {
        width: 300px; height: 300px;
        background: rgba(236,72,153,0.18);
        bottom: -80px; left: -60px;
      }
      .drp-right-content {
        position: relative;
        z-index: 1;
        text-align: center;
        color: #fff;
      }
      .drp-right-icon {
        width: 76px;
        height: 76px;
        border-radius: 22px;
        background: rgba(255,255,255,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
      }
      .drp-right-title {
        font-size: 26px;
        font-weight: 800;
        line-height: 1.25;
        margin: 0 0 14px;
        letter-spacing: -0.03em;
      }
      .drp-right-body {
        font-size: 14px;
        color: rgba(200,196,255,0.9);
        line-height: 1.7;
        max-width: 260px;
        margin: 0 auto 32px;
      }
      .drp-right-stats {
        display: flex;
        gap: 0;
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 16px;
        overflow: hidden;
      }
      .drp-right-stat {
        flex: 1;
        padding: 14px 12px;
        border-right: 1px solid rgba(255,255,255,0.15);
      }
      .drp-right-stat:last-child { border-right: none; }
      .drp-right-stat-value {
        font-size: 18px;
        font-weight: 800;
        color: #fff;
        margin: 0 0 2px;
        letter-spacing: -0.02em;
      }
      .drp-right-stat-label {
        font-size: 10px;
        color: rgba(200,196,255,0.8);
        font-weight: 500;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      /* ── Success screen ── */
      .drp-success-wrap {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--drp-bg);
        padding: 32px 16px;
        box-sizing: border-box;
      }
      .drp-success-card {
        max-width: 420px;
        width: 100%;
        background: var(--drp-bg);
        border: 1px solid var(--drp-border);
        border-radius: 24px;
        padding: 48px 36px;
        text-align: center;
        animation: drpFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
      }
      .drp-success-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: var(--drp-greenl);
        border: 1px solid var(--drp-greenborder);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
        color: var(--drp-green);
        animation: drpPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both;
      }
      .drp-success-title {
        font-size: 24px;
        font-weight: 800;
        color: var(--drp-text);
        margin: 0 0 12px;
        letter-spacing: -0.03em;
      }
      .drp-success-body {
        font-size: 14px;
        color: var(--drp-text2);
        line-height: 1.7;
        margin: 0 0 28px;
      }

      /* ── Keyframes ── */
      @keyframes drpSlideUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes drpFadeUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes drpSpin {
        to { transform: rotate(360deg); }
      }
      @keyframes drpPop {
        from { opacity: 0; transform: scale(0.5); }
        to   { opacity: 1; transform: scale(1); }
      }
    `}</style>
  );
}