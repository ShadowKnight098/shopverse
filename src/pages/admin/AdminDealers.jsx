import { ShoppingBag } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductGrid({
  products = [],
  loading = false,
  emptyMessage = 'No products found.',
}) {
  if (loading) {
    return (
      <>
        <PgStyles />
        <div className="pg-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="pg-skel-card" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="pg-skel pg-skel-img" />
              <div className="pg-skel-body">
                <div className="pg-skel pg-skel-title" />
                <div className="pg-skel pg-skel-sub" />
                <div className="pg-skel pg-skel-price" />
                <div className="pg-skel pg-skel-btn" />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (!products || products.length === 0) {
    return (
      <>
        <PgStyles />
        <div className="pg-empty">
          <div className="pg-empty-icon-wrap">
            <ShoppingBag size={34} className="pg-empty-icon" />
          </div>
          <h3 className="pg-empty-title">Nothing here yet</h3>
          <p className="pg-empty-sub">{emptyMessage}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PgStyles />
      <div className="pg-grid">
        {products.map((product, i) => (
          <div
            key={product.id}
            className="pg-card-wrap"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </>
  );
}

function PgStyles() {
  return (
    <style>{`
      /* ── Grid ── */
      .pg-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 14px;
      }
      @media (min-width: 768px)  { .pg-grid { grid-template-columns: repeat(3, 1fr); gap: 18px; } }
      @media (min-width: 1024px) { .pg-grid { grid-template-columns: repeat(4, 1fr); gap: 22px; } }

      /* card entrance */
      .pg-card-wrap {
        animation: pgFadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      /* ── Skeleton card ── */
      .pg-skel-card {
        border-radius: 16px;
        overflow: hidden;
        background: rgba(0,0,0,0.03);
        border: 1px solid rgba(0,0,0,0.05);
        animation: pgFadeUp 0.4s ease both;
      }
      @media (prefers-color-scheme: dark) {
        .pg-skel-card {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.05);
        }
      }

      .pg-skel {
        border-radius: 8px;
        background: linear-gradient(
          90deg,
          rgba(0,0,0,0.06) 25%,
          rgba(0,0,0,0.02) 50%,
          rgba(0,0,0,0.06) 75%
        );
        background-size: 200% 100%;
        animation: pgShimmer 1.5s ease infinite;
      }
      @media (prefers-color-scheme: dark) {
        .pg-skel {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.07) 25%,
            rgba(255,255,255,0.02) 50%,
            rgba(255,255,255,0.07) 75%
          );
          background-size: 200% 100%;
        }
      }

      .pg-skel-img   { width: 100%; aspect-ratio: 1; border-radius: 0; }
      .pg-skel-body  { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
      .pg-skel-title { height: 13px; width: 80%; }
      .pg-skel-sub   { height: 11px; width: 55%; }
      .pg-skel-price { height: 17px; width: 38%; border-radius: 6px; }
      .pg-skel-btn   { height: 34px; width: 100%; border-radius: 10px; margin-top: 4px; }

      /* ── Empty state ── */
      .pg-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px 24px;
        text-align: center;
        animation: pgFadeUp 0.5s ease both;
      }
      .pg-empty-icon-wrap {
        width: 72px; height: 72px;
        border-radius: 20px;
        background: rgba(0,0,0,0.04);
        border: 1px solid rgba(0,0,0,0.06);
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 18px;
      }
      @media (prefers-color-scheme: dark) {
        .pg-empty-icon-wrap {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.07);
        }
      }
      .pg-empty-icon { color: #9ca3af; }
      @media (prefers-color-scheme: dark) { .pg-empty-icon { color: #4b5563; } }

      .pg-empty-title {
        font-size: 16px;
        font-weight: 700;
        color: #374151;
        margin: 0 0 8px;
        letter-spacing: -0.015em;
      }
      @media (prefers-color-scheme: dark) { .pg-empty-title { color: rgba(255,255,255,0.7); } }

      .pg-empty-sub {
        font-size: 13px;
        color: #9ca3af;
        margin: 0;
        max-width: 300px;
        line-height: 1.65;
      }
      @media (prefers-color-scheme: dark) { .pg-empty-sub { color: #6b7280; } }

      /* ── Keyframes ── */
      @keyframes pgFadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes pgShimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  );
}