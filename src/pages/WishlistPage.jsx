import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import useWishlistStore from '../stores/useWishlistStore';
import ProductCard from '../components/product/ProductCard';

export default function WishlistPage() {
  const { items } = useWishlistStore();

  useEffect(() => {
    document.title = 'My Wishlist — ShopVerse';
  }, []);

  return (
    <>
      <WlStyles />
      <div className="wl-root">
        <div className="wl-orb wl-orb-top" />
        <div className="wl-orb wl-orb-bottom" />

        <div className="wl-inner">

          {/* ── Header ── */}
          <div className="wl-page-head">
            <div className="wl-title-block">
              <p className="wl-eyebrow">Your collection</p>
              <h1 className="wl-title">
                <span className="wl-title-heart-wrap" aria-hidden="true">
                  <Heart size={34} fill="#E2546A" strokeWidth={0} />
                </span>
                Wishlist
              </h1>
            </div>
            {items.length > 0 && (
              <span className="wl-count-pill">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>

          <div className="wl-divider" />

          {/* ── Content ── */}
          {items.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="wl-grid">
                {items.map((product, i) => (
                  <div
                    key={product.id}
                    className="wl-card-wrap"
                    style={{ animationDelay: `${i * 0.07}s` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              <p className="wl-footer-note">Items are saved to your account</p>
            </>
          )}

        </div>
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="wl-empty">
      <div className="wl-empty-icon-wrap">
        <span className="wl-empty-ring" aria-hidden="true" />
        <div className="wl-empty-icon-inner">
          <Heart size={30} fill="#E2546A" strokeWidth={0} opacity={0.7} />
        </div>
      </div>
      <h2 className="wl-empty-title">Nothing saved yet</h2>
      <p className="wl-empty-sub">
        Pieces you fall for live here. Start curating your personal collection.
      </p>
      <Link to="/products" className="wl-empty-cta">
        Explore the Collection
      </Link>
    </div>
  );
}

function WlStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

      :root {
        --wl-rose:        #E2546A;
        --wl-rose-muted:  rgba(226, 84, 106, 0.12);
        --wl-rose-border: rgba(226, 84, 106, 0.32);
        --wl-bg:          #0D0B10;
        --wl-text:        rgba(255, 255, 255, 0.90);
        --wl-muted:       rgba(255, 255, 255, 0.38);
        --wl-serif:       'Cormorant Garamond', Georgia, serif;
        --wl-sans:        'DM Sans', system-ui, sans-serif;
      }

      /* ── Page shell ── */
      .wl-root {
        position: relative;
        min-height: 100vh;
        background: var(--wl-bg);
        overflow: hidden;
        font-family: var(--wl-sans);
        color: var(--wl-text);
      }

      /* ── Ambient orbs ── */
      .wl-orb {
        pointer-events: none;
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        z-index: 0;
      }
      .wl-orb-top {
        width: 380px;
        height: 380px;
        background: rgba(226, 84, 106, 0.11);
        top: -100px;
        right: -80px;
      }
      .wl-orb-bottom {
        width: 240px;
        height: 240px;
        background: rgba(90, 50, 120, 0.18);
        bottom: 80px;
        left: -60px;
      }

      /* ── Inner container ── */
      .wl-inner {
        position: relative;
        z-index: 1;
        max-width: 1280px;
        margin: 0 auto;
        padding: 40px 16px 80px;
        box-sizing: border-box;
      }
      @media (min-width: 640px)  { .wl-inner { padding: 48px 24px 80px; } }
      @media (min-width: 1024px) { .wl-inner { padding: 64px 40px 96px; } }

      /* ── Header ── */
      .wl-page-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 2.25rem;
      }
      .wl-title-block {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .wl-eyebrow {
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--wl-rose);
        margin: 0;
      }
      .wl-title {
        font-family: var(--wl-serif);
        font-size: clamp(36px, 5vw, 52px);
        font-weight: 300;
        line-height: 1;
        color: var(--wl-text);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 14px;
        letter-spacing: -0.01em;
      }
      .wl-title-heart-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .wl-count-pill {
        font-family: var(--wl-sans);
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.06em;
        color: var(--wl-rose);
        background: var(--wl-rose-muted);
        border: 0.5px solid var(--wl-rose-border);
        padding: 5px 16px;
        border-radius: 40px;
        white-space: nowrap;
        margin-bottom: 4px;
      }

      /* ── Divider ── */
      .wl-divider {
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(255, 255, 255, 0.1) 35%,
          rgba(226, 84, 106, 0.28) 65%,
          transparent 100%
        );
        margin-bottom: 2.75rem;
      }

      /* ── Product grid ── */
      .wl-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 14px;
      }
      @media (min-width: 640px)  { .wl-grid { grid-template-columns: repeat(3, 1fr); } }
      @media (min-width: 1024px) { .wl-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; } }

      .wl-card-wrap {
        animation: wlFadeUp 0.5s ease both;
      }

      /* ── Footer note ── */
      .wl-footer-note {
        text-align: center;
        margin-top: 3rem;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.18);
        letter-spacing: 0.05em;
      }

      /* ── Empty state ── */
      .wl-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 6rem 2rem;
        text-align: center;
        animation: wlFadeUp 0.6s ease both;
      }
      .wl-empty-icon-wrap {
        position: relative;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 2rem;
      }
      .wl-empty-ring {
        position: absolute;
        inset: -10px;
        border-radius: 50%;
        border: 1px dashed rgba(226, 84, 106, 0.22);
        animation: wlSpin 14s linear infinite;
      }
      .wl-empty-icon-inner {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: rgba(226, 84, 106, 0.09);
        border: 0.5px solid rgba(226, 84, 106, 0.22);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .wl-empty-title {
        font-family: var(--wl-serif);
        font-size: 30px;
        font-weight: 300;
        color: var(--wl-text);
        margin: 0 0 12px;
        letter-spacing: -0.01em;
      }
      .wl-empty-sub {
        font-size: 13px;
        line-height: 1.7;
        color: var(--wl-muted);
        max-width: 300px;
        margin: 0 0 2.5rem;
      }
      .wl-empty-cta {
        display: inline-block;
        font-family: var(--wl-sans);
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--wl-rose);
        background: transparent;
        border: 0.5px solid var(--wl-rose-border);
        padding: 13px 32px;
        border-radius: 40px;
        text-decoration: none;
        transition: background 0.22s ease, color 0.22s ease, border-color 0.22s ease;
      }
      .wl-empty-cta:hover {
        background: var(--wl-rose);
        color: #fff;
        border-color: var(--wl-rose);
      }

      /* ── Keyframes ── */
      @keyframes wlFadeUp {
        from { opacity: 0; transform: translateY(18px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes wlSpin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  );
}