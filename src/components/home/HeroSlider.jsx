import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ShoppingBag, Zap, Star,
  TrendingUp, Shield, ChevronLeft, ChevronRight,
} from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    badge: '🔥 Best Seller',
    title: ['Discover the', 'Latest in Tech'],
    subtitle: 'Explore cutting-edge electronics, smart gadgets, and premium accessories at unbeatable prices.',
    cta: 'Shop Electronics',
    ctaLink: '/products?category=electronics',
    secondaryCta: 'View Deals',
    secondaryLink: '/sales',
    gradient: ['#4f46e5', '#7c3aed', '#6d28d9'],
    accentColor: '#a78bfa',
    glowColor: '#4f46e5',
    imageSrc: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=90&auto=format&fit=crop',
    imageLabel: '🎧 Premium Audio',
    priceBadge: '₹1,999',
    floatBadge: '⚡ Pro Sound',
  },
  {
    id: 2,
    badge: '✨ New Arrival',
    title: ['Refresh Your', 'Wearable Style'],
    subtitle: 'Trending smartwatches, timeless classics, and exclusive collections curated just for you.',
    cta: 'Explore Watches',
    ctaLink: '/products?category=fashion',
    secondaryCta: 'View All',
    secondaryLink: '/products',
    gradient: ['#7c3aed', '#be185d', '#db2777'],
    accentColor: '#f9a8d4',
    glowColor: '#be185d',
    imageSrc: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=90&auto=format&fit=crop',
    imageLabel: '⌚ Smart Watch',
    priceBadge: '₹4,999',
    floatBadge: '💎 Premium Build',
  },
  {
    id: 3,
    badge: '🏷️ Up to 70% Off',
    title: ['Mega Tech Sale', "Don't Miss Out"],
    subtitle: "Limited-time deals on thousands of products across every category. Shop before it's too late!",
    cta: 'View All Deals',
    ctaLink: '/sales',
    secondaryCta: 'Browse Shop',
    secondaryLink: '/products',
    gradient: ['#0369a1', '#4f46e5', '#7c3aed'],
    accentColor: '#7dd3fc',
    glowColor: '#0ea5e9',
    imageSrc: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=90&auto=format&fit=crop',
    imageLabel: '💻 Gaming Laptop',
    priceBadge: '₹49,999',
    floatBadge: '🎮 Gaming Ready',
  },
];

const INTERVAL = 5500;

export default function HeroSlider() {
  const [active, setActive] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef(null);

  const go = (idx) => {
    if (isAnimating) return;
    const next = ((idx % SLIDES.length) + SLIDES.length) % SLIDES.length;
    setIsAnimating(true);
    setActive(next);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const goNext = () => go(active + 1);
  const goPrev = () => go(active - 1);

  useEffect(() => {
    timerRef.current = setInterval(goNext, INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [active]);

  const slide = SLIDES[active];

  return (
    <>
      <style>{`
        .hero-slider {
          position: relative;
          width: 100%;
          overflow: hidden;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          transition: background 0.8s ease;
        }

        /* ── Grid texture ── */
        .hero-mesh {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.15;
          background-image:
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 56px 56px;
        }

        /* ── Glow blobs ── */
        .hero-glow-tl,
        .hero-glow-br {
          position: absolute;
          pointer-events: none;
          border-radius: 50%;
          transition: background 0.8s ease;
        }
        .hero-glow-tl {
          width: min(520px, 90vw);
          height: min(520px, 90vw);
          top: -160px;
          left: -160px;
        }
        .hero-glow-br {
          width: min(440px, 80vw);
          height: min(440px, 80vw);
          bottom: -120px;
          right: -80px;
        }

        /* ── Particles ── */
        .hero-particle {
          position: absolute;
          border-radius: 50%;
          background: white;
          pointer-events: none;
          animation: heroFloat var(--dur, 4s) ease-in-out infinite var(--delay, 0s);
        }

        /* ── Inner wrapper ── */
        .hero-inner {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          flex: 1;
          display: flex;
          align-items: center;
          padding: 80px 20px 96px;
          box-sizing: border-box;
        }

        /* ── Content grid ── */
        .hero-grid {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .hero-inner {
            padding: 80px 48px 96px;
          }
          .hero-grid {
            grid-template-columns: 1fr 1fr;
            gap: 64px;
          }
        }

        /* ── Left: text block ── */
        .hero-text {
          animation: heroFadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          backdrop-filter: blur(8px);
          padding: 7px 16px;
          border-radius: 9999px;
          margin-bottom: 24px;
        }
        .hero-badge span {
          color: white;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.03em;
        }

        .hero-title {
          font-weight: 900;
          color: white;
          line-height: 1.06;
          letter-spacing: -0.02em;
          margin: 0 0 20px;
          font-size: clamp(2rem, 7vw, 4rem);
        }
        @media (min-width: 1024px) {
          .hero-title { font-size: clamp(2.4rem, 3.8vw, 4.2rem); }
        }

        .hero-subtitle {
          color: rgba(255,255,255,0.78);
          font-size: clamp(0.9rem, 2.5vw, 1.05rem);
          line-height: 1.65;
          margin: 0 0 36px;
          max-width: 440px;
        }

        /* ── CTAs ── */
        .hero-ctas {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 36px;
        }
        .hero-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          color: #111;
          font-weight: 700;
          font-size: 14px;
          padding: 14px 24px;
          border-radius: 12px;
          text-decoration: none;
          transition: transform 0.2s, opacity 0.2s;
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        }
        .hero-btn-primary:hover { opacity: 0.92; transform: translateY(-2px); }
        .hero-btn-primary:active { transform: scale(0.97); }

        .hero-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 2px solid rgba(255,255,255,0.4);
          color: white;
          font-weight: 600;
          font-size: 14px;
          padding: 12px 24px;
          border-radius: 12px;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s;
        }
        .hero-btn-secondary:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.7);
        }

        /* ── Stats ── */
        .hero-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .hero-stat {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          backdrop-filter: blur(6px);
          padding: 9px 14px;
          border-radius: 12px;
        }
        .hero-stat-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .hero-stat-val {
          color: white;
          font-size: 11px;
          font-weight: 700;
          line-height: 1;
        }
        .hero-stat-lbl {
          color: rgba(255,255,255,0.55);
          font-size: 9px;
          line-height: 1;
          margin-top: 3px;
        }

        /* ── Right: product visual ── */
        .hero-visual {
          display: none;
          position: relative;
          justify-content: center;
          align-items: center;
          animation: heroFadeIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
        }
        @media (min-width: 1024px) {
          .hero-visual { display: flex; }
        }

        /* Mobile visual strip (shows on mobile only) */
        .hero-visual-mobile {
          display: flex;
          justify-content: center;
          padding: 0 0 8px;
          animation: heroFadeIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;
        }
        @media (min-width: 1024px) {
          .hero-visual-mobile { display: none; }
        }

        .hero-img-card {
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          animation: heroFloat 5s ease-in-out infinite;
        }
        .hero-img-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .hero-img-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        /* Desktop card sizing */
        @media (min-width: 1024px) {
          .hero-img-card { width: 340px; height: 340px; }
        }
        /* Mobile card sizing */
        @media (max-width: 1023px) {
          .hero-img-card {
            width: min(240px, 70vw);
            height: min(240px, 70vw);
          }
        }

        /* Float badges — desktop only */
        .hero-float-badge {
          position: absolute;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 18px;
          z-index: 20;
          background: rgba(255,255,255,0.15);
        }

        /* Glow rings */
        .hero-ring-outer {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          pointer-events: none;
          width: 440px;
          height: 440px;
        }
        .hero-ring-inner {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.15);
          pointer-events: none;
          width: 310px;
          height: 310px;
        }

        /* ── Nav arrows ── */
        .hero-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 30;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: background 0.2s;
          padding: 0;
        }
        .hero-arrow:hover { background: rgba(255,255,255,0.22); }
        .hero-arrow-prev { left: 12px; }
        .hero-arrow-next { right: 12px; }
        @media (min-width: 640px) {
          .hero-arrow { width: 44px; height: 44px; }
          .hero-arrow-prev { left: 16px; }
          .hero-arrow-next { right: 16px; }
        }

        /* ── Bottom controls ── */
        .hero-controls {
          position: absolute;
          bottom: 24px;
          left: 0;
          right: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }
        .hero-counter {
          color: rgba(255,255,255,0.4);
          font-size: 11px;
          font-family: monospace;
        }
        .hero-dots {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .hero-dot {
          border-radius: 9999px;
          cursor: pointer;
          border: none;
          padding: 0;
          transition: all 0.3s;
        }
        .hero-dot.active {
          width: 28px;
          height: 10px;
          background: white;
        }
        .hero-dot.inactive {
          width: 10px;
          height: 10px;
          background: rgba(255,255,255,0.35);
        }
        .hero-dot.inactive:hover { background: rgba(255,255,255,0.55); }
        .hero-next-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          color: rgba(255,255,255,0.4);
          font-size: 11px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
        }
        .hero-next-btn:hover { color: rgba(255,255,255,0.8); }

        /* ── Progress bar ── */
        .hero-progress-track {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: rgba(255,255,255,0.1);
          z-index: 20;
        }
        .hero-progress-fill {
          height: 100%;
          background: rgba(255,255,255,0.5);
          border-radius: 9999px;
          animation: heroProgress var(--interval, 5500ms) linear forwards;
        }

        /* ── Keyframes ── */
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-13px); }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(26px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes heroProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>

      <section
        className="hero-slider"
        style={{
          background: `linear-gradient(135deg, ${slide.gradient[0]} 0%, ${slide.gradient[1]} 50%, ${slide.gradient[2]} 100%)`,
        }}
      >
        {/* Mesh texture */}
        <div className="hero-mesh" />

        {/* Glow blobs */}
        <div
          className="hero-glow-tl"
          style={{ background: `radial-gradient(circle, ${slide.glowColor}55 0%, transparent 65%)` }}
        />
        <div
          className="hero-glow-br"
          style={{ background: `radial-gradient(circle, ${slide.accentColor}38 0%, transparent 65%)` }}
        />

        {/* Floating particles */}
        {[
          { w: 7,  top: '18%', left: '3%',  opacity: 0.28, dur: '4s' },
          { w: 5,  top: '65%', left: '6%',  opacity: 0.2,  dur: '5s',   delay: '1s' },
          { w: 9,  top: '82%', left: '18%', opacity: 0.22, dur: '3.5s', delay: '0.5s' },
          { w: 6,  top: '12%', right: '6%', opacity: 0.28, dur: '4.5s', delay: '1.5s' },
          { w: 8,  top: '72%', right: '5%', opacity: 0.18, dur: '6s',   delay: '0.8s' },
        ].map((p, i) => (
          <div
            key={i}
            className="hero-particle"
            style={{
              width: p.w, height: p.w,
              top: p.top, left: p.left, right: p.right,
              opacity: p.opacity,
              '--dur': p.dur,
              '--delay': p.delay || '0s',
            }}
          />
        ))}

        {/* ── Main content ── */}
        <div className="hero-inner">
          <div className="hero-grid">

            {/* LEFT: Text */}
            <div key={`text-${active}`} className="hero-text">
              {/* Badge */}
              <div className="hero-badge">
                <span style={{ fontSize: 14 }}>{slide.badge.split(' ')[0]}</span>
                <span>{slide.badge.split(' ').slice(1).join(' ')}</span>
              </div>

              {/* Title */}
              <h1 className="hero-title">
                {slide.title.map((line, i) => (
                  <span key={i} style={{ display: 'block' }}>
                    {i === 1
                      ? <span style={{ color: slide.accentColor }}>{line}</span>
                      : line}
                  </span>
                ))}
              </h1>

              {/* Subtitle */}
              <p className="hero-subtitle">{slide.subtitle}</p>

              {/* Mobile product image */}
              <div key={`mv-${active}`} className="hero-visual-mobile">
                <div
                  className="hero-img-card"
                  style={{
                    boxShadow: `0 24px 60px rgba(0,0,0,0.45), 0 0 40px ${slide.glowColor}35`,
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <img src={slide.imageSrc} alt={slide.title[0]} />
                  <div
                    className="hero-img-overlay"
                    style={{
                      background: `linear-gradient(135deg, ${slide.gradient[0]}20 0%, transparent 60%, ${slide.gradient[2]}28 100%)`,
                    }}
                  />
                </div>
              </div>

              {/* CTAs */}
              <div className="hero-ctas">
                <Link to={slide.ctaLink} className="hero-btn-primary">
                  <ShoppingBag size={16} />
                  {slide.cta}
                  <ArrowRight size={14} />
                </Link>
                <Link to={slide.secondaryLink} className="hero-btn-secondary">
                  <Zap size={14} />
                  {slide.secondaryCta}
                </Link>
              </div>

              {/* Stats */}
              <div className="hero-stats">
                {[
                  { Icon: Star,       val: '4.9/5', lbl: 'Customer Rating'  },
                  { Icon: TrendingUp, val: '50K+',  lbl: 'Orders Delivered' },
                  { Icon: Shield,     val: '100%',  lbl: 'Secure Checkout'  },
                ].map(({ Icon, val, lbl }) => (
                  <div key={lbl} className="hero-stat">
                    <div className="hero-stat-icon">
                      <Icon size={13} color="white" />
                    </div>
                    <div>
                      <div className="hero-stat-val">{val}</div>
                      <div className="hero-stat-lbl">{lbl}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Desktop visual */}
            <div key={`vis-${active}`} className="hero-visual">
              {/* Glow rings */}
              <div
                className="hero-ring-outer"
                style={{ boxShadow: `0 0 90px 28px ${slide.glowColor}28` }}
              />
              <div className="hero-ring-inner" />

              {/* Product image card */}
              <div
                className="hero-img-card"
                style={{
                  position: 'relative',
                  zIndex: 10,
                  boxShadow: `0 40px 80px rgba(0,0,0,0.45), 0 0 60px ${slide.glowColor}38`,
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <img src={slide.imageSrc} alt={slide.title[0]} />
                <div
                  className="hero-img-overlay"
                  style={{
                    background: `linear-gradient(135deg, ${slide.gradient[0]}20 0%, transparent 60%, ${slide.gradient[2]}28 100%)`,
                  }}
                />
              </div>

              {/* Float: Pro Sound — top left */}
              <div
                className="hero-float-badge"
                style={{
                  top: 4, left: 4,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  animation: 'heroFloat 4s ease-in-out infinite 0.4s',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>
                  {slide.floatBadge.split(' ')[0]}
                </div>
                <div>
                  <p style={{ color: 'white', fontSize: 11, fontWeight: 700, margin: 0, lineHeight: 1 }}>
                    {slide.floatBadge.split(' ').slice(1).join(' ')}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 9, margin: '3px 0 0', lineHeight: 1 }}>
                    {slide.imageLabel}
                  </p>
                </div>
              </div>

              {/* Float: Stars — bottom left */}
              <div
                className="hero-float-badge"
                style={{
                  bottom: 24, left: 0,
                  padding: '12px 16px',
                  animation: 'heroFloat 4.5s ease-in-out infinite 1.1s',
                }}
              >
                <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="#fbbf24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p style={{ color: 'white', fontSize: 11, fontWeight: 700, margin: 0 }}>Rated 4.9/5</p>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 9, margin: '3px 0 0' }}>12,000+ reviews</p>
              </div>

              {/* Float: Price — top right */}
              <div
                style={{
                  position: 'absolute',
                  top: 28, right: 0,
                  background: 'white',
                  color: '#111',
                  padding: '10px 16px',
                  borderRadius: 18,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  zIndex: 20,
                  animation: 'heroFloat 3.5s ease-in-out infinite 0.7s',
                }}
              >
                <p style={{ fontSize: 9, color: '#999', margin: 0, fontWeight: 500 }}>Starting from</p>
                <p style={{ fontSize: 18, fontWeight: 900, margin: '2px 0 0', lineHeight: 1 }}>{slide.priceBadge}</p>
              </div>
            </div>

          </div>
        </div>

        {/* ── Arrows ── */}
        <button className="hero-arrow hero-arrow-prev" onClick={goPrev} aria-label="Previous slide">
          <ChevronLeft size={19} />
        </button>
        <button className="hero-arrow hero-arrow-next" onClick={goNext} aria-label="Next slide">
          <ChevronRight size={19} />
        </button>

        {/* ── Dots & counter ── */}
        <div className="hero-controls">
          <span className="hero-counter">
            {String(active + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
          </span>
          <div className="hero-dots">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`hero-dot ${i === active ? 'active' : 'inactive'}`}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button className="hero-next-btn" onClick={goNext}>
            Next <ArrowRight size={11} />
          </button>
        </div>

        {/* ── Progress bar ── */}
        <div className="hero-progress-track">
          <div
            key={`bar-${active}`}
            className="hero-progress-fill"
            style={{ '--interval': `${INTERVAL}ms` }}
          />
        </div>
      </section>
    </>
  );
}