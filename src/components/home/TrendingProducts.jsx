import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Flame } from 'lucide-react';
import ProductCard from '../product/ProductCard';
import Skeleton from '../common/Skeleton';
import { useTrendingProducts } from '../../hooks/useProducts';

export default function TrendingProducts() {
  const { products, loading } = useTrendingProducts();

  return (
    <>
      <style>{`
        .tp-section {
          padding: 64px 16px;
          max-width: 1280px;
          margin: 0 auto;
          box-sizing: border-box;
          animation: tpFadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (min-width: 640px)  { .tp-section { padding: 64px 24px; } }
        @media (min-width: 1024px) { .tp-section { padding: 64px 32px; } }

        .tp-header { margin-bottom: 32px; }

        .tp-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: clamp(1.4rem, 4vw, 1.9rem);
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 6px;
          letter-spacing: -0.02em;
        }
        @media (prefers-color-scheme: dark) { .tp-title { color: #f9fafb; } }

        .tp-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }
        @media (prefers-color-scheme: dark) { .tp-subtitle { color: #9ca3af; } }

        /* Skeleton grid while loading */
        .tp-skeleton-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (min-width: 768px) {
          .tp-skeleton-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
        }

        /* Swiper override — remove any default overflow clipping issues */
        .tp-swiper {
          width: 100%;
          overflow: hidden;
        }
        .tp-swiper .swiper-slide {
          height: auto;
        }

        @keyframes tpFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <section className="tp-section">
        <div className="tp-header">
          <h2 className="tp-title">
            Trending Now
            <Flame size={26} style={{ color: '#f97316', flexShrink: 0 }} />
          </h2>
          <p className="tp-subtitle">What everyone&apos;s loving right now 🔥</p>
        </div>

        {loading ? (
          <div className="tp-skeleton-grid">
            <Skeleton type="product" count={4} />
          </div>
        ) : (
          <Swiper
            className="tp-swiper"
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              480:  { slidesPerView: 2, spaceBetween: 16 },
              768:  { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
            }}
          >
            {products?.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </section>
    </>
  );
}