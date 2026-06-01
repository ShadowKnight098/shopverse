import React, { useEffect, useState } from 'react';
import { Tag, Clock, Sparkles } from 'lucide-react';
import { useSales } from '../hooks/useSales';

const CountdownTimer = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const end = new Date(endDate).getTime();
    const tick = () => {
      const distance = end - Date.now();
      if (distance < 0) return;
      setTimeLeft({
        days:    Math.floor(distance / 86400000),
        hours:   Math.floor((distance % 86400000) / 3600000),
        minutes: Math.floor((distance % 3600000)  / 60000),
        seconds: Math.floor((distance % 60000)    / 1000),
      });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="ct-root">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="ct-unit">
          <div className="ct-box">{String(value).padStart(2, '0')}</div>
          <div className="ct-label">{unit}</div>
        </div>
      ))}
    </div>
  );
};

export default function SalesPage() {
  const { sales, loading, error } = useSales();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.title = 'Sales & Deals — ShopVerse';
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const activeSales = sales?.filter(s => new Date(s.end_date) > new Date()) || [];

  return (
    <>
      <SPStyles />
      <div className={`sp-root ${mounted ? 'sp-root--in' : ''}`}>

        {/* ── Hero ── */}
        <div className="sp-hero">
          <div className="sp-hero-grain" />
          <div className="sp-hero-blob sp-hero-blob-tl" />
          <div className="sp-hero-blob sp-hero-blob-br" />
          <div className="sp-hero-inner">
            <div className="sp-hero-tag">
              <Sparkles size={11} />
              Hot Deals
            </div>
            <h1 className="sp-hero-title">Sales &amp; Offers</h1>
            <p className="sp-hero-sub">Limited-time deals — grab them before they're gone.</p>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="sp-body">
          {loading ? (
            <div className="sp-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="sp-skeleton">
                  <div className="sp-skeleton-shine" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="sp-error">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0 }}>
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Failed to load sales: {error}
            </div>
          ) : activeSales.length === 0 ? (
            <div className="sp-empty">
              <div className="sp-empty-icon">
                <Clock size={28} color="var(--sp-accent)" />
              </div>
              <h2 className="sp-empty-title">No active sales right now</h2>
              <p className="sp-empty-sub">Check back later for exciting offers and discounts!</p>
            </div>
          ) : (
            <div className="sp-grid">
              {activeSales.map((sale, i) => (
                <div
                  key={sale.id}
                  className="sp-card"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {/* BG image */}
                  <div
                    className="sp-card-bg"
                    style={{
                      backgroundImage: `url(${sale.banner || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop'})`
                    }}
                  />

                  {/* Gradient overlay */}
                  <div className="sp-card-overlay" />

                  {/* Content */}
                  <div className="sp-card-body">

                    {/* Live badge */}
                    <div className="sp-live-badge">
                      <span className="sp-live-dot" />
                      Live Deal
                    </div>

                    {/* Discount pill */}
                    <div className="sp-discount-pill">
                      {sale.discount}% OFF
                    </div>

                    <h2 className="sp-card-title">{sale.title}</h2>

                    {sale.description && (
                      <p className="sp-card-desc">{sale.description}</p>
                    )}

                    {/* Divider */}
                    <div className="sp-card-divider" />

                    {/* Timer */}
                    <p className="sp-timer-label">
                      <Clock size={11} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                      Ends in
                    </p>
                    <CountdownTimer endDate={sale.end_date} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}

function SPStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

      :root {
        --sp-bg:       #faf9f7;
        --sp-surface:  #ffffff;
        --sp-border:   #ece9e3;
        --sp-text:     #18160f;
        --sp-text2:    #6b6257;
        --sp-text3:    #a8a098;
        --sp-accent:   #e8643a;
        --sp-accent2:  #c94e22;
        --sp-accentl:  rgba(232,100,58,0.1);
        --sp-accentb:  rgba(232,100,58,0.22);
        --sp-red:      #ef4444;
        --sp-redl:     rgba(239,68,68,0.08);
        --sp-redb:     rgba(239,68,68,0.3);
        --nav-h:       64px;
        --ff-head:     'Syne', sans-serif;
        --ff-body:     'DM Sans', sans-serif;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --sp-bg:      #0e0d0b;
          --sp-surface: #171512;
          --sp-border:  #2a2620;
          --sp-text:    #f0ebe3;
          --sp-text2:   #948880;
          --sp-text3:   #5a5248;
          --sp-accentl: rgba(232,100,58,0.12);
          --sp-accentb: rgba(232,100,58,0.18);
          --sp-redl:    rgba(239,68,68,0.12);
          --sp-redb:    rgba(239,68,68,0.25);
        }
      }

      /* ── Root ── */
      .sp-root {
        min-height: 100vh;
        background: var(--sp-bg);
        font-family: var(--ff-body);
        padding-top: var(--nav-h);
        opacity: 0;
        transition: opacity 0.35s ease;
      }
      .sp-root--in { opacity: 1; }

      /* ── Hero ── */
      .sp-hero {
        position: relative; overflow: hidden;
        padding: 52px 24px 48px;
        background: linear-gradient(140deg, #1a1208 0%, #2d1f0e 40%, #3b1a06 100%);
      }
      @media (max-width: 639px) { .sp-hero { padding: 32px 16px 28px; } }

      .sp-hero-grain {
        position: absolute; inset: 0; z-index: 1; pointer-events: none; opacity: 0.4;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
        background-size: 200px;
      }
      .sp-hero-blob {
        position: absolute; border-radius: 50%;
        pointer-events: none; filter: blur(64px); z-index: 1;
      }
      .sp-hero-blob-tl {
        top: -80px; left: -60px; width: 280px; height: 280px;
        background: rgba(232,100,58,0.18);
        animation: spFloat 9s ease-in-out infinite;
      }
      .sp-hero-blob-br {
        bottom: -100px; right: -80px; width: 360px; height: 360px;
        background: rgba(180,60,10,0.14);
        animation: spFloat 11s ease-in-out infinite reverse;
      }
      .sp-hero-inner {
        position: relative; z-index: 2;
        max-width: 1200px; margin: 0 auto;
        animation: spSlideUp 0.65s cubic-bezier(0.22,1,0.36,1) both;
      }
      .sp-hero-tag {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 4px 12px; border-radius: 20px;
        background: rgba(232,100,58,0.18);
        border: 1px solid rgba(232,100,58,0.3);
        color: #f0956a;
        font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
        margin-bottom: 14px; text-transform: uppercase;
      }
      .sp-hero-title {
        font-family: var(--ff-head);
        font-size: clamp(26px, 5vw, 44px);
        font-weight: 800; color: #f5ede2;
        letter-spacing: -0.03em; margin: 0 0 10px; line-height: 1.1;
      }
      .sp-hero-sub { font-size: 14px; color: rgba(200,185,165,0.8); margin: 0; }

      /* ── Body ── */
      .sp-body {
        max-width: 1200px; margin: 0 auto;
        padding: 32px 16px 80px;
        box-sizing: border-box;
      }
      @media (min-width: 768px) { .sp-body { padding: 40px 24px 80px; } }

      /* ── Grid ── */
      .sp-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;
      }
      @media (min-width: 640px)  { .sp-grid { grid-template-columns: 1fr 1fr; gap: 24px; } }
      @media (min-width: 1024px) { .sp-grid { gap: 28px; } }

      /* ── Skeleton ── */
      .sp-skeleton {
        height: 340px; border-radius: 24px;
        background: var(--sp-surface);
        border: 1.5px solid var(--sp-border);
        position: relative; overflow: hidden;
      }
      .sp-skeleton-shine {
        position: absolute; inset: 0;
        background: linear-gradient(90deg,
          transparent 0%,
          rgba(232,100,58,0.06) 50%,
          transparent 100%);
        background-size: 200% 100%;
        animation: spShimmer 1.4s ease-in-out infinite;
      }

      /* ── Error ── */
      .sp-error {
        display: flex; align-items: center; gap: 10px;
        padding: 14px 16px; border-radius: 14px;
        background: var(--sp-redl); border: 1px solid var(--sp-redb);
        font-size: 13px; color: var(--sp-red); font-weight: 500;
      }

      /* ── Empty ── */
      .sp-empty {
        grid-column: 1 / -1;
        text-align: center; padding: 72px 24px;
        background: var(--sp-surface);
        border: 1.5px solid var(--sp-border);
        border-radius: 24px;
        animation: spSlideUp 0.65s cubic-bezier(0.22,1,0.36,1) both;
      }
      .sp-empty-icon {
        width: 64px; height: 64px;
        background: var(--sp-accentl); border: 1.5px solid var(--sp-accentb);
        border-radius: 20px;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 20px;
      }
      .sp-empty-title {
        font-family: var(--ff-head); font-size: 20px; font-weight: 800;
        color: var(--sp-text); letter-spacing: -0.02em; margin: 0 0 8px;
      }
      .sp-empty-sub { font-size: 14px; color: var(--sp-text2); margin: 0; }

      /* ── Sale Card ── */
      .sp-card {
        border-radius: 24px; overflow: hidden;
        height: 340px; position: relative;
        box-shadow: 0 4px 28px rgba(0,0,0,0.12);
        cursor: pointer;
        animation: spSlideUp 0.65s cubic-bezier(0.22,1,0.36,1) both;
        transition: transform 0.3s cubic-bezier(0.22,1,0.36,1),
                    box-shadow 0.3s ease;
      }
      .sp-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 16px 48px rgba(0,0,0,0.2);
      }

      .sp-card-bg {
        position: absolute; inset: 0;
        background-size: cover; background-position: center;
        transition: transform 0.7s cubic-bezier(0.22,1,0.36,1);
      }
      .sp-card:hover .sp-card-bg { transform: scale(1.07); }

      .sp-card-overlay {
        position: absolute; inset: 0;
        background: linear-gradient(120deg,
          rgba(10,8,5,0.94) 0%,
          rgba(10,8,5,0.72) 50%,
          rgba(10,8,5,0.2) 100%);
      }

      .sp-card-body {
        position: relative; z-index: 2;
        height: 100%; padding: 28px 30px;
        display: flex; flex-direction: column; justify-content: center;
        gap: 0;
      }

      /* Live badge */
      .sp-live-badge {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 5px 12px; border-radius: 999px; width: fit-content;
        background: rgba(232,100,58,0.18);
        border: 1px solid rgba(232,100,58,0.35);
        font-size: 10px; font-weight: 700;
        color: #f0956a; letter-spacing: 0.06em; text-transform: uppercase;
        margin-bottom: 14px;
      }
      .sp-live-dot {
        width: 7px; height: 7px; border-radius: 50%;
        background: var(--sp-accent);
        animation: spPulse 1.4s ease-in-out infinite;
        flex-shrink: 0;
      }

      /* Discount pill */
      .sp-discount-pill {
        display: inline-flex; align-items: center;
        padding: 4px 14px; border-radius: 999px; width: fit-content;
        background: linear-gradient(135deg, #e8643a, #c94e22);
        font-family: var(--ff-head);
        font-size: 13px; font-weight: 800; color: #fff;
        letter-spacing: 0.02em;
        box-shadow: 0 4px 14px rgba(232,100,58,0.4);
        margin-bottom: 12px;
      }

      .sp-card-title {
        font-family: var(--ff-head);
        font-size: clamp(20px, 3vw, 26px);
        font-weight: 800; color: #f5ede2;
        letter-spacing: -0.03em; margin: 0 0 8px; line-height: 1.2;
      }
      .sp-card-desc {
        font-size: 13px; color: rgba(200,185,165,0.75);
        margin: 0 0 16px; line-height: 1.55;
        display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .sp-card-divider {
        width: 40px; height: 2px; border-radius: 2px;
        background: linear-gradient(90deg, var(--sp-accent), transparent);
        margin-bottom: 16px;
      }

      .sp-timer-label {
        font-size: 10px; font-weight: 700;
        color: rgba(160,145,130,0.85);
        letter-spacing: 0.1em; text-transform: uppercase;
        margin-bottom: 10px;
      }

      /* ── Countdown ── */
      .ct-root { display: flex; gap: 8px; }
      .ct-unit { display: flex; flex-direction: column; align-items: center; }
      .ct-box {
        width: 48px; height: 48px;
        background: rgba(232,100,58,0.15);
        border: 1px solid rgba(232,100,58,0.3);
        border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        font-family: var(--ff-head);
        font-size: 18px; font-weight: 800; color: #f0956a;
        letter-spacing: -0.02em;
        font-variant-numeric: tabular-nums;
        backdrop-filter: blur(4px);
      }
      .ct-label {
        font-size: 9px; color: rgba(160,145,130,0.7);
        text-transform: uppercase; letter-spacing: 0.08em;
        font-weight: 700; margin-top: 5px;
      }

      /* ── Keyframes ── */
      @keyframes spSlideUp {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes spFloat {
        0%, 100% { transform: translateY(0); }
        50%       { transform: translateY(-18px); }
      }
      @keyframes spPulse {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.3; }
      }
      @keyframes spShimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  );
}