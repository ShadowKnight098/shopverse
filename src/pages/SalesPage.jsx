import React, { useEffect, useState } from 'react';
import { Tag, Clock } from 'lucide-react';
import { useSales } from '../hooks/useSales';

const CountdownTimer = ({ saleId, endDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

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
    <>
      <style>{`
        .ct-root { display: flex; gap: 10px; }
        .ct-unit { display: flex; flex-direction: column; align-items: center; }
        .ct-box {
          width: 52px; height: 52px;
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; font-weight: 800; color: white;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }
        .ct-label {
          font-size: 10px; color: rgba(255,255,255,0.6);
          text-transform: uppercase; letter-spacing: 0.08em;
          font-weight: 600; margin-top: 5px;
        }
      `}</style>
      <div className="ct-root">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="ct-unit">
            <div className="ct-box">{String(value).padStart(2, '0')}</div>
            <div className="ct-label">{unit}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default function SalesPage() {
  const { sales, loading, error } = useSales();

  useEffect(() => { document.title = 'Sales & Deals — ShopVerse'; }, []);

  const activeSales = sales?.filter(s => new Date(s.end_date) > new Date()) || [];

  return (
    <>
      <style>{`
        /* ── Tokens ── */
        :root {
          --sp-bg:        #ffffff;
          --sp-surface:   #f9fafb;
          --sp-border:    #e5e7eb;
          --sp-text:      #111827;
          --sp-text2:     #6b7280;
          --sp-text3:     #9ca3af;
          --sp-accent:    #4f46e5;
          --sp-accentl:   rgba(79,70,229,0.12);
          --sp-red:       #dc2626;
          --sp-redl:      #fef2f2;
          --sp-redborder: #fecaca;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --sp-bg:        #0f172a;
            --sp-surface:   #1e293b;
            --sp-border:    #334155;
            --sp-text:      #f9fafb;
            --sp-text2:     #94a3b8;
            --sp-text3:     #64748b;
            --sp-accentl:   rgba(99,102,241,0.18);
            --sp-red:       #f87171;
            --sp-redl:      rgba(127,29,29,0.2);
            --sp-redborder: rgba(127,29,29,0.4);
          }
        }

        /* ── Page ── */
        .sp-root {
          max-width: 1280px;
          margin: 0 auto;
          padding: 40px 24px 64px;
          box-sizing: border-box;
        }
        @media (min-width: 640px)  { .sp-root { padding: 56px 32px 80px; } }
        @media (min-width: 1024px) { .sp-root { padding: 64px 40px 96px; } }

        /* ── Header ── */
        .sp-header {
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 40px;
          animation: spSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) both;
        }
        .sp-header-icon {
          width: 52px; height: 52px;
          border-radius: 16px;
          background: linear-gradient(135deg, #f97316 0%, #e11d48 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 18px rgba(239,68,68,0.32);
          flex-shrink: 0;
          animation: spPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both;
        }
        .sp-header h1 {
          font-size: 28px; font-weight: 800;
          color: var(--sp-text);
          letter-spacing: -0.02em;
          margin: 0;
        }

        /* ── Grid ── */
        .sp-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .sp-grid { grid-template-columns: 1fr 1fr; }
        }

        /* ── Skeleton ── */
        .sp-skeleton {
          height: 320px;
          border-radius: 24px;
          background: var(--sp-surface);
          position: relative; overflow: hidden;
        }
        .sp-skeleton::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(255,255,255,0.06) 50%,
            transparent 100%);
          background-size: 200% 100%;
          animation: spShimmer 1.4s infinite;
        }

        /* ── Error ── */
        .sp-error {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 16px; border-radius: 12px;
          background: var(--sp-redl);
          border: 1px solid var(--sp-redborder);
          font-size: 13px; color: var(--sp-red);
        }

        /* ── Empty ── */
        .sp-empty {
          grid-column: 1 / -1;
          text-align: center; padding: 80px 24px;
          background: var(--sp-surface);
          border-radius: 24px;
          border: 1.5px solid var(--sp-border);
          animation: spSlideUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.1s both;
        }
        .sp-empty-icon {
          width: 64px; height: 64px;
          background: var(--sp-bg);
          border: 1.5px solid var(--sp-border);
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
        }
        .sp-empty h2 {
          font-size: 20px; font-weight: 800;
          color: var(--sp-text); letter-spacing: -0.02em; margin: 0 0 8px;
        }
        .sp-empty p { font-size: 14px; color: var(--sp-text2); margin: 0; }

        /* ── Sale Card ── */
        .sp-card {
          border-radius: 24px; overflow: hidden;
          height: 320px; position: relative;
          box-shadow: 0 4px 24px rgba(0,0,0,0.1);
          cursor: pointer;
          animation: spSlideUp 0.65s cubic-bezier(0.22,1,0.36,1) both;
        }
        .sp-card:nth-child(1) { animation-delay: 0.1s; }
        .sp-card:nth-child(2) { animation-delay: 0.22s; }
        .sp-card:nth-child(3) { animation-delay: 0.34s; }
        .sp-card:nth-child(4) { animation-delay: 0.46s; }

        .sp-card-bg {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          transition: transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }
        .sp-card:hover .sp-card-bg { transform: scale(1.06); }

        .sp-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(100deg,
            rgba(15,23,42,0.92) 0%,
            rgba(15,23,42,0.65) 55%,
            rgba(15,23,42,0.15) 100%);
        }

        .sp-card-body {
          position: relative; z-index: 2;
          height: 100%; padding: 28px 32px;
          display: flex; flex-direction: column; justify-content: center;
        }

        /* ── Badge ── */
        .sp-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 12px; border-radius: 999px;
          background: rgba(244,63,94,0.18);
          border: 1px solid rgba(244,63,94,0.35);
          font-size: 11px; font-weight: 700;
          color: #fda4af; letter-spacing: 0.06em;
          text-transform: uppercase; width: fit-content;
          margin-bottom: 16px;
        }
        .sp-badge-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #f43f5e;
          animation: spPulse 1.4s ease-in-out infinite;
          flex-shrink: 0;
        }

        .sp-card-title {
          font-size: 26px; font-weight: 800; color: white;
          letter-spacing: -0.02em; margin: 0 0 6px; line-height: 1.2;
        }
        .sp-card-discount {
          font-size: 15px; color: rgba(203,213,225,0.9); margin: 0 0 20px;
        }
        .sp-card-discount span {
          font-size: 30px; font-weight: 800;
          color: #fbbf24; letter-spacing: -0.02em;
        }
        .sp-timer-label {
          font-size: 11px; font-weight: 600;
          color: rgba(148,163,184,0.85);
          letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px;
        }

        /* ── Keyframes ── */
        @keyframes spSlideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spPop {
          from { opacity: 0; transform: scale(0.6) rotate(-8deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes spPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
        @keyframes spShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="sp-root">

        {/* ── Header ── */}
        <div className="sp-header">
          <div className="sp-header-icon">
            <Tag size={26} color="white" />
          </div>
          <h1>Upcoming Sales &amp; Deals</h1>
        </div>

        {/* ── States ── */}
        {loading ? (
          <div className="sp-grid">
            {[1, 2].map(i => <div key={i} className="sp-skeleton" />)}
          </div>
        ) : error ? (
          <div className="sp-error">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0 }}>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Error loading sales: {error}
          </div>
        ) : activeSales.length === 0 ? (
          <div className="sp-grid">
            <div className="sp-empty">
              <div className="sp-empty-icon">
                <Clock size={28} color="var(--sp-text3)" />
              </div>
              <h2>No active sales right now</h2>
              <p>Check back later for exciting offers and discounts!</p>
            </div>
          </div>
        ) : (
          <div className="sp-grid">
            {activeSales.map(sale => (
              <div key={sale.id} className="sp-card">
                <div
                  className="sp-card-bg"
                  style={{ backgroundImage: `url(${sale.banner || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop'})` }}
                />
                <div className="sp-card-overlay" />
                <div className="sp-card-body">
                  <div className="sp-badge">
                    <span className="sp-badge-dot" />
                    Limited Time Offer
                  </div>
                  <h2 className="sp-card-title">{sale.title}</h2>
                  <p className="sp-card-discount">
                    Up to <span>{sale.discount}% OFF</span>
                  </p>
                  <div>
                    <p className="sp-timer-label">Sale ends in</p>
                    <CountdownTimer endDate={sale.end_date} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
}