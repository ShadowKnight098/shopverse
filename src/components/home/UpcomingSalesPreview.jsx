import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Zap, Flame } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import { useSales } from '../../hooks/useSales';

function resolveBannerUrl(banner) {
  if (!banner) return null;
  if (banner.startsWith('http://') || banner.startsWith('https://')) return banner;
  const { data } = supabase.storage.from('sale-banners').getPublicUrl(banner);
  return data?.publicUrl ?? null;
}

export default function UpcomingSalesPreview() {
  const { sales, loading } = useSales();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(false);

  const upcomingSale = sales?.find((sale) => new Date(sale.start_date) > new Date());
  const bannerUrl = resolveBannerUrl(upcomingSale?.banner);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!upcomingSale) return;
    const calc = () => {
      const diff = new Date(upcomingSale.start_date).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };
    setTimeLeft(calc());
    const id = setInterval(() => { setTimeLeft(calc()); setTick(t => !t); }, 1000);
    return () => clearInterval(id);
  }, [upcomingSale]);

  if (loading || !upcomingSale) return null;

  const units = [
    { label: 'Days',    value: timeLeft.days },
    { label: 'Hours',   value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <>
      <USPStyles />
      <section className="usp-section">
        <div className={`usp-card ${mounted ? 'usp-card--in' : ''}`}>

          {bannerUrl ? (
            <>
              <div className="usp-bg-img" style={{ backgroundImage: `url(${bannerUrl})` }} />
              <div className="usp-bg-tint" />
            </>
          ) : (
            <>
              <div className="usp-bg-base" />
              <div className="usp-bg-mesh" />
              <div className="usp-orb usp-orb--tl" />
              <div className="usp-orb usp-orb--br" />
              <div className="usp-orb usp-orb--mid" />
            </>
          )}

          <div className="usp-lines" />

          <div className="usp-content">

            <div className="usp-badge">
              <Flame size={11} className="usp-badge-icon" />
              Upcoming Sale
            </div>

            <h2 className="usp-title">{upcomingSale.title || 'Mega Sale'}</h2>

            {upcomingSale.discount && (
              <div className="usp-discount">
                <Zap size={16} className="usp-zap" />
                {upcomingSale.discount}% OFF
              </div>
            )}

            <div className="usp-countdown-label">
              <Clock size={12} />
              Sale starts in
            </div>

            <div className="usp-timer">
              {units.map((u, i) => (
                <div key={u.label} className="usp-unit-wrap">
                  <div className="usp-unit">
                    <div className="usp-unit-inner">
                      <span className={`usp-digits ${u.label === 'Seconds' && tick ? 'usp-digits--tick' : ''}`}>
                        {String(u.value).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="usp-unit-shine" />
                  </div>
                  <span className="usp-unit-label">{u.label}</span>
                  {i < units.length - 1 && <span className="usp-sep">:</span>}
                </div>
              ))}
            </div>

            <Link to="/sales" className="usp-cta">
              View All Sales
              <ArrowRight size={15} className="usp-cta-arrow" />
            </Link>

          </div>
        </div>
      </section>
    </>
  );
}

function USPStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

      /* ── Section ── */
      .usp-section {
        padding: 40px 16px;
        font-family: 'DM Sans', sans-serif;
      }
      @media (min-width: 640px) {
        .usp-section { padding: 56px 20px; }
      }

      /* ── Card ── */
      .usp-card {
        position: relative;
        max-width: 860px;
        margin: 0 auto;
        border-radius: 20px;
        overflow: hidden;
        opacity: 0;
        transform: translateY(24px) scale(0.98);
        transition: opacity 0.6s cubic-bezier(0.22,1,0.36,1),
                    transform 0.6s cubic-bezier(0.22,1,0.36,1);
        box-shadow:
          0 0 0 1px rgba(255,255,255,0.1),
          0 16px 48px rgba(0,0,0,0.5);
      }
      @media (min-width: 640px) {
        .usp-card { border-radius: 28px; box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 32px 80px rgba(0,0,0,0.55); }
      }
      .usp-card--in {
        opacity: 1;
        transform: translateY(0) scale(1);
      }

      /* ── Banner bg ── */
      .usp-bg-img {
        position: absolute; inset: -20px;
        background-size: cover;
        background-position: center;
        filter: blur(18px) brightness(0.55) saturate(1.1);
        transform: scale(1.06);
        z-index: 0;
        will-change: transform;
      }
      .usp-bg-tint {
        position: absolute; inset: 0;
        background: linear-gradient(180deg,
          rgba(0,0,0,0.4) 0%,
          rgba(0,0,0,0.2) 40%,
          rgba(0,0,0,0.55) 100%
        );
        z-index: 1;
      }

      /* ── Fallback gradient ── */
      .usp-bg-base {
        position: absolute; inset: 0;
        background: linear-gradient(145deg, #1c0e04 0%, #2e1208 35%, #3d1a05 65%, #1e0c02 100%);
        z-index: 0;
      }
      .usp-bg-mesh {
        position: absolute; inset: 0; z-index: 1; opacity: 0.07;
        background-image:
          linear-gradient(rgba(255,100,30,0.4) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,100,30,0.4) 1px, transparent 1px);
        background-size: 44px 44px;
      }
      .usp-orb {
        position: absolute; border-radius: 50%;
        pointer-events: none; filter: blur(70px); z-index: 1;
      }
      .usp-orb--tl {
        width: 220px; height: 220px; top: -80px; left: -60px;
        background: rgba(230,80,20,0.25);
        animation: uspFloat 9s ease-in-out infinite;
      }
      .usp-orb--br {
        width: 260px; height: 260px; bottom: -100px; right: -70px;
        background: rgba(200,40,80,0.18);
        animation: uspFloat 12s ease-in-out infinite reverse;
      }
      .usp-orb--mid {
        width: 160px; height: 160px; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255,120,0,0.08);
        animation: uspFloat 7s ease-in-out infinite 2s;
      }
      @media (min-width: 640px) {
        .usp-orb--tl  { width: 320px; height: 320px; top: -120px; left: -80px; }
        .usp-orb--br  { width: 380px; height: 380px; bottom: -140px; right: -100px; }
        .usp-orb--mid { width: 200px; height: 200px; }
      }

      /* ── Lines texture ── */
      .usp-lines {
        position: absolute; inset: 0; z-index: 2; pointer-events: none;
        background: repeating-linear-gradient(
          -45deg,
          transparent 0px, transparent 20px,
          rgba(255,255,255,0.018) 20px, rgba(255,255,255,0.018) 21px
        );
      }

      /* ── Content ── */
      .usp-content {
        position: relative; z-index: 10;
        display: flex; flex-direction: column; align-items: center;
        text-align: center;
        padding: 36px 16px 32px;
      }
      @media (min-width: 640px) {
        .usp-content { padding: 56px 24px 52px; }
      }

      /* Badge */
      .usp-badge {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 4px 12px; border-radius: 20px;
        background: rgba(255,100,40,0.18);
        border: 1px solid rgba(255,100,40,0.35);
        color: #ff8a5b;
        font-size: 10px; font-weight: 700;
        letter-spacing: 0.07em; text-transform: uppercase;
        margin-bottom: 14px;
        backdrop-filter: blur(8px);
        animation: uspFadeUp 0.5s ease 0.1s both;
      }
      @media (min-width: 640px) {
        .usp-badge { font-size: 11px; padding: 5px 14px; margin-bottom: 20px; }
      }
      .usp-badge-icon { color: #ff6030; }

      /* Title */
      .usp-title {
        font-family: 'Syne', sans-serif;
        font-size: clamp(22px, 7vw, 52px);
        font-weight: 800; color: #ffffff;
        letter-spacing: -0.03em; line-height: 1.05;
        margin: 0 0 14px;
        text-shadow: 0 2px 24px rgba(0,0,0,0.6), 0 1px 0 rgba(0,0,0,0.5);
        animation: uspFadeUp 0.5s ease 0.15s both;
      }
      @media (min-width: 640px) {
        .usp-title { margin: 0 0 20px; }
      }

      /* Discount */
      .usp-discount {
        display: inline-flex; align-items: center; gap: 8px;
        font-family: 'Syne', sans-serif;
        font-size: clamp(36px, 12vw, 80px);
        font-weight: 800;
        background: linear-gradient(135deg, #ff8040 0%, #ff4060 50%, #ff8020 100%);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text;
        filter: drop-shadow(0 4px 20px rgba(255,80,30,0.5));
        margin-bottom: 20px;
        letter-spacing: -0.04em;
        animation: uspFadeUp 0.5s ease 0.2s both;
      }
      @media (min-width: 640px) {
        .usp-discount { margin-bottom: 28px; gap: 10px; }
      }
      .usp-zap {
        -webkit-text-fill-color: initial;
        color: #ff7030;
        filter: drop-shadow(0 0 8px rgba(255,100,30,0.8));
        animation: uspZap 2s ease-in-out infinite;
        flex-shrink: 0;
      }

      /* Countdown label */
      .usp-countdown-label {
        display: flex; align-items: center; gap: 6px;
        color: rgba(255,235,215,0.75);
        font-size: 12px; font-weight: 500;
        margin-bottom: 14px;
        animation: uspFadeUp 0.5s ease 0.25s both;
      }
      @media (min-width: 640px) {
        .usp-countdown-label { font-size: 10px; margin-bottom: 20px; gap: 7px; }
      }

      /* Timer */
      .usp-timer {
        display: flex; align-items: flex-start;
        gap: 4px;
        margin-bottom: 28px;
        animation: uspFadeUp 0.5s ease 0.3s both;
        flex-wrap: nowrap;
      }
      @media (min-width: 640px) {
        .usp-timer { gap: 6px; margin-bottom: 40px;

        }
      }
           @media (min-width: 400px) {
        .usp-timer { gap: 4px; margin-bottom: 40px;

        }
      }

      .usp-unit-wrap {
        display: flex; align-items: flex-start; gap: 4px;
      }
      @media (min-width: 640px) {
        .usp-unit-wrap { gap: 6px; }
      }

      .usp-unit {
        position: relative;
        width: 58px; height: 60px;
        border-radius: 12px;
        background: rgba(0,0,0,0.35);
        border: 1px solid rgba(255,255,255,0.15);
        display: flex; align-items: center; justify-content: center;
        overflow: hidden;
        backdrop-filter: blur(12px);
        box-shadow:
          0 6px 20px rgba(0,0,0,0.4),
          0 0 0 1px rgba(255,255,255,0.07) inset;
      }
      @media (min-width: 400px) {
        .usp-unit { width: 46px; height: 68px;

        
        }
      }
      @media (min-width: 640px) {
        .usp-unit { width: 78px; height: 80px; border-radius: 16px; }
      }

      .usp-unit-inner { position: relative; z-index: 2; }
      .usp-unit-shine {
        position: absolute; top: 0; left: 0; right: 0; height: 40%;
        background: linear-gradient(to bottom, rgba(255,255,255,0.1), transparent);
        border-radius: 12px 12px 0 0; z-index: 1; pointer-events: none;
      }
      @media (min-width: 640px) {
        .usp-unit-shine { border-radius: 16px 16px 0 0; }
      }

      .usp-digits {
        font-family: 'Syne', sans-serif;
        font-size: clamp(18px, 5vw, 34px);
        font-weight: 800; color: #fff;
        display: block;
        transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1);
        text-shadow: 0 2px 12px rgba(0,0,0,0.5);
        line-height: 1;
      }
      .usp-digits--tick {
        animation: uspTick 0.15s cubic-bezier(0.34,1.56,0.64,1);
      }

      .usp-unit-label {
        display: block;
        font-size: 9px; font-weight: 600;
        color: rgba(255,235,210,0.6);
        text-transform: uppercase; letter-spacing: 0.07em;
        margin-top: 6px; text-align: center;
        align-self: flex-end; padding-bottom: 2px;
      }
      @media (min-width: 640px) {
        .usp-unit-label { font-size: 15px; margin-top: 8px; }
      }

      .usp-sep {
        font-family: 'Syne', sans-serif;
        font-size: 20px; font-weight: 800;
        color: rgba(255,140,80,0.6);
        line-height: 60px; flex-shrink: 0;
      }
      @media (min-width: 400px) {
        .usp-sep { font-size: 22px; line-height: 68px; }
      }
      @media (min-width: 640px) {
        .usp-sep { font-size: 28px; line-height: 80px; }
      }

      /* CTA */
      .usp-cta {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 12px 24px; border-radius: 12px;
        background: linear-gradient(135deg, #ff6030 0%, #e8401a 100%);
        color: #fff; font-family: 'DM Sans', sans-serif;
        font-size: 14px; font-weight: 700; text-decoration: none;
        box-shadow:
          0 6px 20px rgba(232,64,26,0.45),
          0 0 0 1px rgba(255,255,255,0.1) inset;
        transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
        animation: uspFadeUp 0.5s ease 0.35s both;
        letter-spacing: -0.01em;
        width: 100%;
        
        max-width: 280px;
        justify-content: center;
      }
      @media (min-width: 640px) {
        .usp-cta {
          padding: 14px 32px; border-radius: 14px;
          font-size: 15px; width: auto; max-width: none;
          box-shadow: 0 8px 28px rgba(232,64,26,0.45), 0 0 0 1px rgba(255,255,255,0.1) inset;
        }
      }
      .usp-cta:hover {
        transform: translateY(-2px);
        box-shadow:
          0 14px 40px rgba(232,64,26,0.55),
          0 0 0 1px rgba(255,255,255,0.15) inset;
        background: linear-gradient(135deg, #ff7040 0%, #f04020 100%);
      }
      .usp-cta:active { transform: scale(0.97); }
      .usp-cta-arrow { transition: transform 0.2s; flex-shrink: 0; }
      .usp-cta:hover .usp-cta-arrow { transform: translateX(3px); }

      /* ── Animations ── */
      @keyframes uspFadeUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes uspFloat {
        0%, 100% { transform: translateY(0) scale(1); }
        50%       { transform: translateY(-20px) scale(1.05); }
      }
      @keyframes uspZap {
        0%, 100% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 8px rgba(255,100,30,0.8)); }
        50%       { transform: scale(1.2) rotate(-8deg); filter: drop-shadow(0 0 18px rgba(255,140,30,1)); }
      }
      @keyframes uspTick {
        0%   { transform: translateY(-4px) scale(1.08); }
        100% { transform: translateY(0) scale(1); }
      }
    `}</style>
  );
}