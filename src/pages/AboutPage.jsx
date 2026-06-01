import React, { useEffect } from 'react';
import { Target, Eye, Truck, ShieldCheck, HeadphonesIcon, RefreshCw, Sparkles } from 'lucide-react';

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About Us — ShopVerse';
  }, []);

  const features = [
    { icon: Truck,           title: 'Fast & Free Shipping', desc: 'On all orders over ₹500 across India.' },
    { icon: ShieldCheck,     title: 'Secure Payments',      desc: '100% secure checkout via WhatsApp & UPI.' },
    { icon: HeadphonesIcon,  title: '24/7 Support',         desc: 'Dedicated team ready to help you anytime.' },
    { icon: RefreshCw,       title: 'Easy Returns',         desc: 'Hassle-free 30-day return policy.' },
  ];

  return (
    <>
      <style>{`
        .ab-root {
          background: var(--ab-bg);
          min-height: 100vh;
        }

        /* ── tokens ── */
        :root {
          --ab-bg:       #f6f5f2;
          --ab-surface:  #ffffff;
          --ab-surface2: #f0eeea;
          --ab-border:   #e8e4de;
          --ab-text:     #1a1714;
          --ab-text2:    #5c5650;
          --ab-text3:    #9c9690;
          --ab-accent:   #4f46e5;
          --ab-accent2:  #4338ca;
          --ab-accentl:  rgba(79,70,229,0.1);
          --ab-violet:   #7c3aed;
          --ab-violetl:  rgba(124,58,237,0.1);
          --ab-radius:   18px;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --ab-bg:      #0f0e0c;
            --ab-surface: #1a1917;
            --ab-surface2:#222019;
            --ab-border:  #2d2b27;
            --ab-text:    #f2ede8;
            --ab-text2:   #a09890;
            --ab-text3:   #6b6460;
            --ab-accentl: rgba(99,102,241,0.14);
            --ab-violetl: rgba(139,92,246,0.14);
          }
        }

        /* ── Shared layout ── */
        .ab-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 16px;
          box-sizing: border-box;
        }
        @media (min-width: 640px)  { .ab-container { padding: 0 24px; } }
        @media (min-width: 1024px) { .ab-container { padding: 0 40px; } }

        /* ─────────────────────────────
           HERO
        ───────────────────────────── */
        .ab-hero {
          position: relative;
          padding: 88px 0 80px;
          overflow: hidden;
          background: linear-gradient(160deg, rgba(79,70,229,0.07) 0%, rgba(124,58,237,0.05) 100%);
          border-bottom: 1px solid var(--ab-border);
        }
        .ab-hero-blob1 {
          position: absolute;
          top: -80px; right: -80px;
          width: 360px; height: 360px;
          border-radius: 50%;
          background: rgba(99,102,241,0.12);
          filter: blur(64px);
          pointer-events: none;
        }
        .ab-hero-blob2 {
          position: absolute;
          bottom: -60px; left: -60px;
          width: 280px; height: 280px;
          border-radius: 50%;
          background: rgba(139,92,246,0.1);
          filter: blur(56px);
          pointer-events: none;
        }
        .ab-hero-inner {
          position: relative;
          z-index: 1;
          text-align: center;
          animation: abFadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both;
        }
        .ab-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: var(--ab-accentl);
          border: 1px solid rgba(79,70,229,0.2);
          color: var(--ab-accent);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 6px 16px;
          border-radius: 9999px;
          margin-bottom: 24px;
        }
        .ab-hero-title {
          font-size: clamp(2.2rem, 6vw, 4rem);
          font-weight: 900;
          color: var(--ab-text);
          margin: 0 0 20px;
          letter-spacing: -0.04em;
          line-height: 1.1;
        }
        .ab-hero-title .grad {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ab-hero-desc {
          font-size: clamp(1rem, 2.5vw, 1.15rem);
          color: var(--ab-text2);
          max-width: 560px;
          margin: 0 auto;
          line-height: 1.72;
        }

        /* ─────────────────────────────
           STORY
        ───────────────────────────── */
        .ab-story {
          padding: 80px 0;
        }
        .ab-story-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .ab-story-grid { grid-template-columns: 1fr 1fr; gap: 64px; }
        }
        .ab-story-text { animation: abFadeUp 0.5s ease both; }
        .ab-section-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ab-accent);
          margin: 0 0 12px;
        }
        .ab-section-title {
          font-size: clamp(1.6rem, 4vw, 2.2rem);
          font-weight: 900;
          color: var(--ab-text);
          margin: 0 0 20px;
          letter-spacing: -0.03em;
        }
        .ab-story-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ab-story-body p {
          font-size: 15px;
          color: var(--ab-text2);
          line-height: 1.78;
          margin: 0;
        }

        /* Story image card */
        .ab-story-img-wrap {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,0.14);
          animation: abFadeIn 0.6s ease 0.1s both;
        }
        @media (prefers-color-scheme: dark) {
          .ab-story-img-wrap { box-shadow: 0 24px 64px rgba(0,0,0,0.45); }
        }
        .ab-story-img-wrap img {
          width: 100%;
          height: 380px;
          object-fit: cover;
          display: block;
        }
        @media (min-width: 1024px) {
          .ab-story-img-wrap img { height: 440px; }
        }
        /* Gradient overlay on image */
        .ab-story-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 55%, rgba(79,70,229,0.18) 100%);
        }

        /* ─────────────────────────────
           MISSION / VISION
        ───────────────────────────── */
        .ab-mv {
          padding: 72px 0;
          background: var(--ab-surface);
          border-top: 1px solid var(--ab-border);
          border-bottom: 1px solid var(--ab-border);
        }
        .ab-mv-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 768px) {
          .ab-mv-grid { grid-template-columns: 1fr 1fr; }
        }
        .ab-mv-card {
          padding: 32px;
          border-radius: 22px;
          border: 1px solid var(--ab-border);
          background: var(--ab-surface2);
          animation: abFadeUp 0.5s ease both;
        }
        .ab-mv-icon {
          width: 52px; height: 52px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          flex-shrink: 0;
        }
        .ab-mv-icon.indigo { background: var(--ab-accentl); color: var(--ab-accent); }
        .ab-mv-icon.violet { background: var(--ab-violetl); color: var(--ab-violet); }
        .ab-mv-card h3 {
          font-size: 20px;
          font-weight: 800;
          color: var(--ab-text);
          margin: 0 0 12px;
          letter-spacing: -0.02em;
        }
        .ab-mv-card p {
          font-size: 14px;
          color: var(--ab-text2);
          line-height: 1.72;
          margin: 0;
        }

        /* ─────────────────────────────
           WHY CHOOSE US
        ───────────────────────────── */
        .ab-why {
          padding: 80px 0;
        }
        .ab-section-header {
          text-align: center;
          margin-bottom: 52px;
        }
        .ab-section-header p {
          font-size: 15px;
          color: var(--ab-text3);
          max-width: 480px;
          margin: 10px auto 0;
          line-height: 1.65;
        }
        .ab-why-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (min-width: 768px) {
          .ab-why-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; }
        }
        .ab-why-card {
          background: var(--ab-surface);
          border: 1px solid var(--ab-border);
          border-radius: var(--ab-radius);
          padding: 24px 18px;
          text-align: center;
          transition: transform 0.25s, box-shadow 0.25s;
          animation: abFadeUp 0.45s ease both;
        }
        .ab-why-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.09);
        }
        @media (prefers-color-scheme: dark) {
          .ab-why-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,0.38); }
        }
        .ab-why-icon {
          width: 56px; height: 56px;
          border-radius: 16px;
          background: var(--ab-accentl);
          color: var(--ab-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          transition: background 0.2s, color 0.2s, transform 0.2s;
        }
        .ab-why-card:hover .ab-why-icon {
          background: var(--ab-accent);
          color: white;
          transform: scale(1.1);
        }
        .ab-why-card h4 {
          font-size: 14px;
          font-weight: 700;
          color: var(--ab-text);
          margin: 0 0 8px;
        }
        .ab-why-card p {
          font-size: 13px;
          color: var(--ab-text3);
          line-height: 1.6;
          margin: 0;
        }

        /* ─────────────────────────────
           BOTTOM CTA STRIP
        ───────────────────────────── */
        .ab-cta {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          padding: 64px 0;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .ab-cta-blob {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          pointer-events: none;
          filter: blur(40px);
        }
        .ab-cta-blob1 { width: 300px; height: 300px; top: -80px; right: -60px; }
        .ab-cta-blob2 { width: 240px; height: 240px; bottom: -60px; left: -40px; }
        .ab-cta-inner { position: relative; z-index: 1; animation: abFadeUp 0.5s ease both; }
        .ab-cta h2 {
          font-size: clamp(1.6rem, 4vw, 2.2rem);
          font-weight: 900;
          color: white;
          margin: 0 0 14px;
          letter-spacing: -0.03em;
        }
        .ab-cta p {
          font-size: 15px;
          color: rgba(255,255,255,0.72);
          max-width: 420px;
          margin: 0 auto 28px;
          line-height: 1.65;
        }
        .ab-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          border-radius: 14px;
          background: white;
          color: #4f46e5;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .ab-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.28);
        }

        @keyframes abFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes abFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="ab-root">

        {/* ── Hero ── */}
        <section className="ab-hero">
          <div className="ab-hero-blob1" />
          <div className="ab-hero-blob2" />
          <div className="ab-container">
            <div className="ab-hero-inner">
              <div className="ab-hero-badge">
                <Sparkles size={13} /> Est. 2024
              </div>
              <h1 className="ab-hero-title">
                Welcome to{' '}
                <span className="grad">ShopVerse</span>
              </h1>
              <p className="ab-hero-desc">
                Your ultimate destination for premium quality products. We believe in providing
                an exceptional shopping experience tailored just for you.
              </p>
            </div>
          </div>
        </section>

        {/* ── Our Story ── */}
        <section className="ab-story">
          <div className="ab-container">
            <div className="ab-story-grid">
              <div className="ab-story-text">
                <p className="ab-section-label">Our Story</p>
                <h2 className="ab-section-title">Built with a simple idea</h2>
                <div className="ab-story-body">
                  <p>
                    Founded in 2024, ShopVerse started with a simple idea: bringing premium,
                    curated products directly to consumers at fair prices. We noticed a gap in
                    the market for a truly customer-centric platform that values design, quality,
                    and user experience above all else.
                  </p>
                  <p>
                    We&apos;re just getting started — and we&apos;re committed to building something
                    you&apos;ll love. From handpicking our inventory to ensuring fast, reliable support,
                    every decision we make puts you first.
                  </p>
                </div>
              </div>

              <div className="ab-story-img-wrap">
                <img
                  src="https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?q=80&w=2070&auto=format&fit=crop"
                  alt="ShopVerse workspace"
                />
                <div className="ab-story-img-overlay" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Mission & Vision ── */}
        <section className="ab-mv">
          <div className="ab-container">
            <div className="ab-section-header">
              <p className="ab-section-label">What drives us</p>
              <h2 className="ab-section-title" style={{ margin: '8px 0 0' }}>Mission &amp; Vision</h2>
            </div>
            <div className="ab-mv-grid">
              <div className="ab-mv-card" style={{ animationDelay: '0ms' }}>
                <div className="ab-mv-icon indigo"><Target size={24} /></div>
                <h3>Our Mission</h3>
                <p>
                  To empower consumers by providing access to high-quality products through a
                  seamless, innovative, and secure platform — while fostering sustainable business
                  practices from day one.
                </p>
              </div>
              <div className="ab-mv-card" style={{ animationDelay: '80ms' }}>
                <div className="ab-mv-icon violet"><Eye size={24} /></div>
                <h3>Our Vision</h3>
                <p>
                  To become the most customer-centric e-commerce destination in India — where
                  anyone can discover and buy anything they desire online with absolute trust and joy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Why Choose Us ── */}
        <section className="ab-why">
          <div className="ab-container">
            <div className="ab-section-header">
              <p className="ab-section-label">Our Promise</p>
              <h2 className="ab-section-title" style={{ margin: '8px 0 0' }}>Why Choose ShopVerse</h2>
              <p>We don&apos;t just sell products — we provide an experience you can trust.</p>
            </div>
            <div className="ab-why-grid">
              {features.map(({ icon: Icon, title, desc }, i) => (
                <div
                  key={title}
                  className="ab-why-card"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div className="ab-why-icon"><Icon size={24} /></div>
                  <h4>{title}</h4>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA strip ── */}
        <section className="ab-cta">
          <div className="ab-cta-blob ab-cta-blob1" />
          <div className="ab-cta-blob ab-cta-blob2" />
          <div className="ab-container">
            <div className="ab-cta-inner">
              <h2>Ready to explore?</h2>
              <p>Browse our growing catalogue of premium products and find exactly what you need.</p>
              <a href="/products" className="ab-cta-btn">
                Shop Now →
              </a>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}