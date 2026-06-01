import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import ProductCard from './ProductCard';
import Skeleton from '../common/Skeleton';
import { useRelatedProducts } from '../../hooks/useProducts';

export default function RelatedProducts({ category, excludeId }) {
  const { products, loading } = useRelatedProducts(category, excludeId);

  if (!loading && (!products || products.length === 0)) return null;

  return (
    <>
      <RpStyles />
      <section className="rp-root">
        <h2 className="rp-heading">You May Also Like</h2>

        {loading ? (
          <div className="rp-skeleton-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rp-skeleton-card" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="rp-skel rp-skel-img" />
                <div className="rp-skel-body">
                  <div className="rp-skel rp-skel-title" />
                  <div className="rp-skel rp-skel-sub" />
                  <div className="rp-skel rp-skel-price" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Swiper
            spaceBetween={16}
            slidesPerView={2}
            breakpoints={{
              640:  { slidesPerView: 2, spaceBetween: 16 },
              768:  { slidesPerView: 3, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
            }}
            className="rp-swiper"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id} className="rp-slide">
                <ProductCard product={product} compact />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </section>
    </>
  );
}

function RpStyles() {
  return (
    <style>{`
      /* ── Section ── */
      .rp-root {
        margin-top: 64px;
        animation: rpFadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .rp-heading {
        font-size: clamp(18px, 3vw, 22px);
        font-weight: 800;
        color: var(--rp-text, #1a1714);
        margin: 0 0 24px;
        letter-spacing: -0.025em;
        position: relative;
        display: inline-block;
      }
      .rp-heading::after {
        content: '';
        position: absolute;
        bottom: -6px;
        left: 0;
        width: 32px;
        height: 3px;
        border-radius: 9999px;
        background: #7c3aed;
      }
      @media (prefers-color-scheme: dark) {
        .rp-heading { color: rgba(255,255,255,0.9); }
      }

      /* ── Skeleton grid ── */
      .rp-skeleton-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 14px;
      }
      @media (min-width: 768px)  { .rp-skeleton-grid { grid-template-columns: repeat(3, 1fr); } }
      @media (min-width: 1024px) { .rp-skeleton-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; } }

      .rp-skeleton-card {
        border-radius: 16px;
        overflow: hidden;
        background: rgba(0,0,0,0.03);
        animation: rpFadeUp 0.4s ease both;
      }
      @media (prefers-color-scheme: dark) {
        .rp-skeleton-card { background: rgba(255,255,255,0.04); }
      }

      .rp-skel {
        border-radius: 8px;
        background: linear-gradient(
          90deg,
          rgba(0,0,0,0.06) 25%,
          rgba(0,0,0,0.02) 50%,
          rgba(0,0,0,0.06) 75%
        );
        background-size: 200% 100%;
        animation: rpShimmer 1.5s ease infinite;
      }
      @media (prefers-color-scheme: dark) {
        .rp-skel {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.06) 25%,
            rgba(255,255,255,0.02) 50%,
            rgba(255,255,255,0.06) 75%
          );
          background-size: 200% 100%;
        }
      }

      .rp-skel-img   { width: 100%; aspect-ratio: 1; border-radius: 0; }
      .rp-skel-body  { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
      .rp-skel-title { height: 13px; width: 75%; }
      .rp-skel-sub   { height: 11px; width: 50%; }
      .rp-skel-price { height: 16px; width: 40%; border-radius: 6px; }

      /* ── Swiper overrides ── */
      .rp-swiper {
        width: 100%;
        padding-bottom: 4px !important;
      }
      .rp-slide {
        height: auto;
      }

      /* ── Keyframes ── */
      @keyframes rpFadeUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes rpShimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  );
}