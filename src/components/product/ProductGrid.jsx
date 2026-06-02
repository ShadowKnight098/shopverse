import { ShoppingBag } from 'lucide-react';
import ProductCard from './ProductCard';
import Skeleton from '../common/Skeleton';

export default function ProductGrid({
  products = [],
  loading = false,
  emptyMessage = 'No products found.',
}) {
  if (loading) {
    return (
      <>
        <PGStyles />
        <div className="pg-grid">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} type="product" />
          ))}
        </div>
      </>
    );
  }

  if (!products || products.length === 0) {
    return (
      <>
        <PGStyles />
        <div className="pg-empty">
          <div className="pg-empty-icon">
            <ShoppingBag size={32} />
          </div>
          <h3 className="pg-empty-title">Nothing here yet</h3>
          <p className="pg-empty-sub">{emptyMessage}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PGStyles />
      <div className="pg-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}

function PGStyles() {
  return (
    <style>{`
      .pg-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 18px;
      }

      /* Tighten gap on small screens, force 2-col */
      @media (max-width: 639px) {
        .pg-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
      }

      /* Empty state */
      .pg-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px 24px;
        text-align: center;
        background: var(--pp-surface);
        border: 1.5px solid var(--pp-border);
        border-radius: 20px;
        animation: ppSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
      }
      .pg-empty-icon {
        width: 64px;
        height: 64px;
        border-radius: 18px;
        background: var(--pp-bg);
        border: 1.5px solid var(--pp-border);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--pp-text3);
        margin-bottom: 16px;
      }
      .pg-empty-title {
        font-family: var(--ff-head, 'Syne', sans-serif);
        font-size: 17px;
        font-weight: 800;
        color: var(--pp-text);
        letter-spacing: -0.02em;
        margin: 0 0 8px;
      }
      .pg-empty-sub {
        font-size: 13px;
        color: var(--pp-text2);
        margin: 0;
        max-width: 300px;
      }
    `}</style>
  );
}