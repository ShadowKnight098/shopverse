import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductGrid from '../product/ProductGrid';
import { useFeaturedProducts } from '../../hooks/useProducts';

export default function FeaturedProducts() {
  const { products, loading } = useFeaturedProducts();

  return (
    <>
      <style>{`
        .fp-section {
          padding: 64px 16px;
          width: 100vw;
          margin: 0 auto;
          box-sizing: border-box;
          animation: fpFadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (min-width: 640px)  { .fp-section { padding: 64px 24px; } }
        @media (min-width: 1024px) { .fp-section { padding: 64px 32px; } }

        .fp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          gap: 16px;
        }

        .fp-title {
          font-size: clamp(1.4rem, 4vw, 1.9rem);
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 6px;
          letter-spacing: -0.02em;
        }
        @media (prefers-color-scheme: dark) { .fp-title { color: #f9fafb; } }

        .fp-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }
        @media (prefers-color-scheme: dark) { .fp-subtitle { color: #9ca3af; } }

        .fp-view-all {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #4f46e5;
          text-decoration: none;
          white-space: nowrap;
          padding: 8px 14px;
          border-radius: 10px;
          border: 1.5px solid rgba(79, 70, 229, 0.3);
          transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
          flex-shrink: 0;
        }
        .fp-view-all:hover {
          background: rgba(79, 70, 229, 0.07);
          border-color: rgba(79, 70, 229, 0.6);
          color: #4338ca;
          transform: translateX(2px);
        }
        @media (prefers-color-scheme: dark) {
          .fp-view-all {
            color: #818cf8;
            border-color: rgba(129, 140, 248, 0.3);
          }
          .fp-view-all:hover {
            background: rgba(129, 140, 248, 0.1);
            border-color: rgba(129, 140, 248, 0.6);
            color: #a5b4fc;
          }
        }

        .fp-arrow {
          transition: transform 0.2s;
        }
        .fp-view-all:hover .fp-arrow {
          transform: translateX(3px);
        }

        @keyframes fpFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <section className="fp-section">
        <div className="fp-header">
          <div>
            <h2 className="fp-title">Featured Products</h2>
            <p className="fp-subtitle">Handpicked products just for you</p>
          </div>
          <Link to="/products" className="fp-view-all">
            View All
            <ArrowRight size={15} className="fp-arrow" />
          </Link>
        </div>

        <ProductGrid
          products={products}
          loading={loading}
          emptyMessage="No featured products available right now."
        />
      </section>
    </>
  );
}