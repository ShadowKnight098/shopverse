import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, MessageCircle } from 'lucide-react';
import LazyImage from '../common/LazyImage';
import StarRating from '../common/StarRating';
import useCartStore from '../../stores/useCartStore';
import useWishlistStore from '../../stores/useWishlistStore';
import { formatPrice, generateWhatsAppLink } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function ProductCard({ product, compact = false }) {
  const addItem       = useCartStore((s) => s.addItem);
  const toggleItem    = useWishlistStore((s) => s.toggleItem);
  const isInWishlist  = useWishlistStore((s) => s.isInWishlist(product.id));

  const handleAddToCart = (e) => {
    e.preventDefault(); e.stopPropagation();
    addItem(product);
    toast.success('Added to cart!', { duration: 1500 });
  };

  const handleBuyNow = (e) => {
    e.preventDefault(); e.stopPropagation();
    const link = generateWhatsAppLink([{ ...product, quantity: 1 }], product.price, {});
    window.open(link, '_blank');
  };

  const handleWishlist = (e) => {
    e.preventDefault(); e.stopPropagation();
    toggleItem(product);
    toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist!', { duration: 1500 });
  };

  const discount = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  return (
    <>
      <style>{`
        .pc-card {
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #f0f0f0;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.055);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .pc-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.1);
        }
        @media (prefers-color-scheme: dark) {
          .pc-card {
            background: #1e293b;
            border-color: #334155;
            box-shadow: 0 2px 10px rgba(0,0,0,0.25);
          }
          .pc-card:hover { box-shadow: 0 10px 28px rgba(0,0,0,0.4); }
        }

        /* Discount badge */
        .pc-discount {
          position: absolute;
          top: 12px; left: 12px;
          z-index: 10;
          padding: 3px 8px;
          background: #ec4899;
          color: white;
          font-size: 10px;
          font-weight: 700;
          border-radius: 9999px;
          letter-spacing: 0.02em;
        }

        /* Wishlist button */
        .pc-wish {
          position: absolute;
          top: 12px; right: 12px;
          z-index: 10;
          width: 34px; height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          transition: transform 0.2s, background 0.2s;
        }
        .pc-wish:hover { transform: scale(1.12); }
        .pc-wish.active  { background: #fdf2f8; color: #ec4899; }
        .pc-wish.inactive { background: white; color: #9ca3af; }
        .pc-wish.inactive:hover { color: #ec4899; }
        @media (prefers-color-scheme: dark) {
          .pc-wish.active   { background: rgba(236,72,153,0.2); color: #f472b6; }
          .pc-wish.inactive { background: #334155; color: #94a3b8; }
          .pc-wish.inactive:hover { color: #f472b6; }
        }

        /* Image container */
        .pc-img-wrap {
          overflow: hidden;
          background: #f9fafb;
          flex-shrink: 0;
          display: block;
          text-decoration: none;
        }
        .pc-img-wrap.normal  { height: 208px; }
        .pc-img-wrap.compact { height: 160px; }
        @media (prefers-color-scheme: dark) {
          .pc-img-wrap { background: rgba(51,65,85,0.5); }
        }
        .pc-img-wrap img,
        .pc-img-wrap > * {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
          display: block;
        }
        .pc-card:hover .pc-img-wrap img,
        .pc-card:hover .pc-img-wrap > * {
          transform: scale(1.05);
        }

        /* Body */
        .pc-body {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .pc-body.normal  { padding: 16px; }
        .pc-body.compact { padding: 12px; }

        /* Category */
        .pc-category {
          font-size: 10px;
          font-weight: 700;
          color: #4f46e5;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin: 0 0 5px;
        }
        @media (prefers-color-scheme: dark) { .pc-category { color: #818cf8; } }

        /* Name */
        .pc-name {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
          text-decoration: none;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.45;
          margin: 0 0 8px;
          transition: color 0.2s;
        }
        .pc-name:hover { color: #4f46e5; }
        @media (prefers-color-scheme: dark) {
          .pc-name { color: #f1f5f9; }
          .pc-name:hover { color: #818cf8; }
        }

        /* Rating row */
        .pc-rating {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
        }
        .pc-rating-count {
          font-size: 11px;
          color: #9ca3af;
        }
        @media (prefers-color-scheme: dark) { .pc-rating-count { color: #64748b; } }

        /* Spacer */
        .pc-spacer { flex: 1; }

        /* Price row */
        .pc-price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 12px;
        }
        .pc-price {
          font-weight: 800;
          color: #111827;
        }
        .pc-price.normal  { font-size: 17px; }
        .pc-price.compact { font-size: 15px; }
        @media (prefers-color-scheme: dark) { .pc-price { color: #f9fafb; } }

        .pc-original {
          font-size: 12px;
          color: #9ca3af;
          text-decoration: line-through;
        }

        /* Action buttons */
        .pc-actions {
          display: flex;
          gap: 8px;
        }
        .pc-btn-cart {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 12px;
          border-radius: 10px;
          background: #4f46e5;
          color: white;
          font-size: 12px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .pc-btn-cart:hover  { background: #4338ca; }
        .pc-btn-cart:active { transform: scale(0.97); }

        .pc-btn-buy {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 9px 12px;
          border-radius: 10px;
          background: #10b981;
          color: white;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .pc-btn-buy:hover  { background: #059669; }
        .pc-btn-buy:active { transform: scale(0.97); }
      `}</style>

      <div className="pc-card">
        {discount && <span className="pc-discount">-{discount}%</span>}

        <button
          onClick={handleWishlist}
          className={`pc-wish ${isInWishlist ? 'active' : 'inactive'}`}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={15} style={isInWishlist ? { fill: '#ec4899', color: '#ec4899' } : {}} />
        </button>

        <Link
          to={`/products/${product.id}`}
          className={`pc-img-wrap ${compact ? 'compact' : 'normal'}`}
        >
          <LazyImage src={product.image_url} alt={product.name} />
        </Link>

        <div className={`pc-body ${compact ? 'compact' : 'normal'}`}>
          {product.category && <p className="pc-category">{product.category}</p>}

          <Link to={`/products/${product.id}`} className="pc-name">
            {product.name}
          </Link>

          {product.rating !== undefined && (
            <div className="pc-rating">
              <StarRating rating={product.rating} size="sm" />
              <span className="pc-rating-count">({product.rating})</span>
            </div>
          )}

          <div className="pc-spacer" />

          <div className="pc-price-row">
            <span className={`pc-price ${compact ? 'compact' : 'normal'}`}>
              {formatPrice(product.price)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="pc-original">{formatPrice(product.original_price)}</span>
            )}
          </div>

          <div className="pc-actions">
            <button onClick={handleAddToCart} className="pc-btn-cart">
              <ShoppingCart size={13} />
              Add to Cart
            </button>
            <button onClick={handleBuyNow} className="pc-btn-buy" title="Buy Now via WhatsApp">
              <MessageCircle size={13} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}