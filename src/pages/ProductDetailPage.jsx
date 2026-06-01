import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ShoppingCart, Heart, MessageCircle, Minus, Plus,
  ChevronRight, Package, Truck, ShieldCheck, RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useProduct } from '../hooks/useProducts'
import { useReviews, addReview } from '../hooks/useReviews'
import useCartStore from '../stores/useCartStore'
import useWishlistStore from '../stores/useWishlistStore'
import useAuthStore from '../stores/useAuthStore'
import ProductGallery from '../components/product/ProductGallery'
import RelatedProducts from '../components/product/RelatedProducts'
import StarRating from '../components/common/StarRating'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import Skeleton from '../components/common/Skeleton'
import { formatPrice, generateWhatsAppLink } from '../utils/formatters'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { product, loading, error } = useProduct(id)
  const { reviews, loading: reviewsLoading } = useReviews(id)
  const { user, profile } = useAuthStore()
  const addToCart      = useCartStore((s) => s.addItem)
  const toggleWishlist = useWishlistStore((s) => s.toggleItem)
  const isInWishlist   = useWishlistStore((s) => s.isInWishlist)

  const [quantity, setQuantity]           = useState(1)
  const [activeTab, setActiveTab]         = useState('description')
  const [reviewRating, setReviewRating]   = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    document.title = product ? `${product.name} — ShopVerse` : 'Product — ShopVerse'
  }, [product])

  useEffect(() => { setQuantity(1) }, [id])

  const handleBuyNow = () => {
    if (!product) return
    const link = generateWhatsAppLink(
      [{ id: product.id, name: product.name, price: product.price, image_url: product.image_url, quantity }],
      product.price * quantity,
      { name: profile?.name }
    )
    window.open(link, '_blank')
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!reviewComment.trim()) { toast.error('Please write a comment.'); return }
    setSubmittingReview(true)
    try {
      await addReview({
        product_id: id,
        user_id: user.id,
        user_name: profile?.name || 'Anonymous',
        rating: reviewRating,
        comment: reviewComment.trim(),
      })
      toast.success('Review submitted!')
      setReviewComment('')
      setReviewRating(5)
    } catch {
      toast.error('Failed to submit review.')
    } finally {
      setSubmittingReview(false)
    }
  }

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f7f4' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 40 }}>
            <Skeleton className="aspect-square rounded-2xl" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Skeleton className="h-8 w-3/4 rounded" />
              <Skeleton className="h-6 w-32 rounded" />
              <Skeleton className="h-24 w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ─── Error ─── */
  if (error || !product) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#f8f7f4', gap: 12,
      }}>
        <Package size={56} style={{ color: '#d1c8b8' }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#4a4035', margin: 0 }}>Product not found</h2>
        <Link to="/products" style={{ color: '#4f46e5', fontSize: 14, textDecoration: 'none' }}>
          ← Back to products
        </Link>
      </div>
    )
  }

  const inStock    = product.stock > 0
  const wishlisted = isInWishlist(product.id)
  const avgRating  = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : product.rating || 0
  const discount   = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null

  const promises = [
    { icon: Truck,       label: 'Free Shipping', sub: 'Orders over ₹500' },
    { icon: ShieldCheck, label: 'Genuine',        sub: '100% authentic' },
    { icon: RefreshCw,   label: 'Easy Returns',   sub: '7-day policy' },
  ]

  return (
    <>
      <style>{`
        /* ── Design tokens ── */
        :root {
          --bg:        #f8f7f4;
          --surface:   #ffffff;
          --surface2:  #f2f0ec;
          --border:    #e8e4de;
          --text:      #1a1714;
          --text-2:    #6b6460;
          --text-3:    #9c9690;
          --accent:    #4f46e5;
          --accent-2:  #4338ca;
          --accent-l:  rgba(79,70,229,0.1);
          --green:     #059669;
          --green-l:   rgba(5,150,105,0.1);
          --red:       #dc2626;
          --red-l:     rgba(220,38,38,0.08);
          --radius:    14px;
          --radius-lg: 20px;
          --shadow:    0 2px 12px rgba(0,0,0,0.07);
          --shadow-md: 0 6px 24px rgba(0,0,0,0.1);
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --bg:      #0f0e0d;
            --surface: #1a1917;
            --surface2:#221f1c;
            --border:  #2e2b27;
            --text:    #f5f2ee;
            --text-2:  #a09890;
            --text-3:  #6b6460;
            --accent-l: rgba(99,102,241,0.15);
            --green-l:  rgba(16,185,129,0.12);
            --red-l:    rgba(239,68,68,0.1);
          }
        }

        .pdp-root {
          min-height: 100vh;
          background: var(--bg);
        }
        .pdp-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 28px 16px 64px;
          box-sizing: border-box;
        }
        @media (min-width: 640px)  { .pdp-inner { padding: 32px 24px 80px; } }
        @media (min-width: 1024px) { .pdp-inner { padding: 36px 40px 96px; } }

        /* ── Breadcrumb ── */
        .pdp-breadcrumb {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px;
          font-size: 13px;
          color: var(--text-3);
          margin-bottom: 28px;
        }
        .pdp-breadcrumb a {
          color: var(--text-3);
          text-decoration: none;
          transition: color 0.2s;
        }
        .pdp-breadcrumb a:hover { color: var(--accent); }
        .pdp-breadcrumb .current {
          color: var(--text-2);
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 200px;
        }

        /* ── Main grid ── */
        .pdp-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          animation: pdpFade 0.45s ease both;
        }
        @media (min-width: 1024px) {
          .pdp-grid {
            grid-template-columns: 1fr 1fr;
            gap: 56px;
          }
        }

        /* ── Info column ── */
        .pdp-info { display: flex; flex-direction: column; }

        .pdp-category {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
          margin: 0 0 10px;
        }

        .pdp-title {
          font-size: clamp(1.5rem, 3.5vw, 2.1rem);
          font-weight: 800;
          color: var(--text);
          line-height: 1.2;
          letter-spacing: -0.025em;
          margin: 0 0 14px;
        }

        /* Rating row */
        .pdp-rating-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }
        .pdp-rating-count {
          font-size: 13px;
          color: var(--text-3);
        }

        /* Price block */
        .pdp-price-block {
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 16px;
          padding: 16px 20px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
        }
        .pdp-price {
          font-size: 2rem;
          font-weight: 900;
          color: var(--accent);
          letter-spacing: -0.03em;
          line-height: 1;
        }
        .pdp-original {
          font-size: 15px;
          color: var(--text-3);
          text-decoration: line-through;
        }
        .pdp-discount-tag {
          padding: 3px 10px;
          background: var(--green-l);
          color: var(--green);
          font-size: 12px;
          font-weight: 700;
          border-radius: 9999px;
        }

        /* Stock badge */
        .pdp-stock {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 18px;
          width: fit-content;
        }
        .pdp-stock.in  { background: var(--green-l); color: var(--green); }
        .pdp-stock.out { background: var(--red-l); color: var(--red); }
        .pdp-stock-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        /* Description */
        .pdp-desc {
          font-size: 14px;
          color: var(--text-2);
          line-height: 1.75;
          margin: 0 0 22px;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Quantity */
        .pdp-qty-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }
        .pdp-qty-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-2);
        }
        .pdp-qty-ctrl {
          display: flex;
          align-items: center;
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          background: var(--surface);
        }
        .pdp-qty-btn {
          width: 40px; height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-2);
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .pdp-qty-btn:hover { background: var(--surface2); color: var(--text); }
        .pdp-qty-val {
          min-width: 44px;
          text-align: center;
          font-size: 15px;
          font-weight: 700;
          color: var(--text);
          border-left: 1.5px solid var(--border);
          border-right: 1.5px solid var(--border);
          padding: 0 4px;
          line-height: 40px;
        }

        /* Actions */
        .pdp-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 28px;
        }
        .pdp-btn-cart {
          flex: 1;
          min-width: 150px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 20px;
          border-radius: var(--radius);
          background: var(--accent);
          color: white;
          font-size: 14px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(79,70,229,0.3);
        }
        .pdp-btn-cart:hover:not(:disabled)  { background: var(--accent-2); box-shadow: 0 6px 20px rgba(79,70,229,0.4); }
        .pdp-btn-cart:active:not(:disabled) { transform: scale(0.98); }
        .pdp-btn-cart:disabled { opacity: 0.5; cursor: not-allowed; }

        .pdp-btn-whatsapp {
          flex: 1;
          min-width: 150px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 20px;
          border-radius: var(--radius);
          background: linear-gradient(135deg, #22c55e, #059669);
          color: white;
          font-size: 14px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(5,150,105,0.3);
        }
        .pdp-btn-whatsapp:hover:not(:disabled)  { opacity: 0.9; box-shadow: 0 6px 20px rgba(5,150,105,0.4); }
        .pdp-btn-whatsapp:active:not(:disabled) { transform: scale(0.98); }
        .pdp-btn-whatsapp:disabled { opacity: 0.5; cursor: not-allowed; }

        .pdp-btn-wish {
          width: 52px; height: 52px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius);
          background: var(--surface);
          border: 1.5px solid var(--border);
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
        }
        .pdp-btn-wish.active  { background: var(--red-l); border-color: rgba(220,38,38,0.3); }
        .pdp-btn-wish:hover   { transform: scale(1.05); }

        /* Promises strip */
        .pdp-promises {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .pdp-promise {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          padding: 14px 8px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
        }
        .pdp-promise-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: var(--accent-l);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
        }
        .pdp-promise-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text);
          line-height: 1.2;
        }
        .pdp-promise-sub {
          font-size: 10px;
          color: var(--text-3);
          line-height: 1.2;
        }

        /* ── Tabs ── */
        .pdp-tabs-section { margin-top: 56px; }
        .pdp-tab-bar {
          display: flex;
          border-bottom: 1.5px solid var(--border);
          gap: 0;
          margin-bottom: 32px;
        }
        .pdp-tab-btn {
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-3);
          background: none;
          border: none;
          border-bottom: 2.5px solid transparent;
          margin-bottom: -1.5px;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
          text-transform: capitalize;
        }
        .pdp-tab-btn.active {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }
        .pdp-tab-btn:hover:not(.active) { color: var(--text-2); }

        /* Description prose */
        .pdp-prose {
          font-size: 15px;
          color: var(--text-2);
          line-height: 1.8;
          white-space: pre-line;
          animation: pdpFade 0.3s ease both;
        }

        /* Reviews */
        .pdp-reviews { animation: pdpFade 0.3s ease both; }
        .pdp-review-list { display: flex; flex-direction: column; gap: 14px; }
        .pdp-review-card {
          padding: 18px 20px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          transition: box-shadow 0.2s;
        }
        .pdp-review-card:hover { box-shadow: var(--shadow); }
        .pdp-review-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .pdp-review-user-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pdp-review-avatar {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: var(--accent-l);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: var(--accent);
          flex-shrink: 0;
        }
        .pdp-review-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 3px;
        }
        .pdp-review-date {
          font-size: 12px;
          color: var(--text-3);
        }
        .pdp-review-body {
          font-size: 14px;
          color: var(--text-2);
          line-height: 1.65;
          margin: 0;
        }
        .pdp-reviews-empty {
          text-align: center;
          padding: 48px 0;
          color: var(--text-3);
          font-size: 14px;
        }

        /* Review form */
        .pdp-review-form {
          margin-top: 32px;
          padding: 24px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
        }
        .pdp-review-form h3 {
          font-size: 17px;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 20px;
        }
        .pdp-field-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-2);
          margin-bottom: 8px;
        }
        .pdp-textarea {
          width: 100%;
          padding: 12px 14px;
          border-radius: var(--radius);
          border: 1.5px solid var(--border);
          background: var(--surface2);
          color: var(--text);
          font-size: 14px;
          line-height: 1.6;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
          font-family: inherit;
        }
        .pdp-textarea::placeholder { color: var(--text-3); }
        .pdp-textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-l);
          background: var(--surface);
        }
        .pdp-sign-in-prompt {
          text-align: center;
          padding: 24px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-size: 14px;
          color: var(--text-3);
        }
        .pdp-sign-in-prompt a {
          color: var(--accent);
          font-weight: 600;
          text-decoration: none;
        }
        .pdp-sign-in-prompt a:hover { text-decoration: underline; }

        /* Related */
        .pdp-related { margin-top: 64px; }

        @keyframes pdpFade {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="pdp-root">
        <div className="pdp-inner">

          {/* Breadcrumb */}
          <nav className="pdp-breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={13} />
            <Link to="/products">Products</Link>
            {product.category && (
              <>
                <ChevronRight size={13} />
                <Link to={`/products?category=${product.category}`} style={{ textTransform: 'capitalize' }}>
                  {product.category}
                </Link>
              </>
            )}
            <ChevronRight size={13} />
            <span className="current">{product.name}</span>
          </nav>

          {/* Main grid */}
          <div className="pdp-grid">
            {/* Gallery */}
            <ProductGallery images={product.images || [product.image_url]} name={product.name} />

            {/* Info */}
            <div className="pdp-info">
              {product.category && (
                <p className="pdp-category">{product.category}</p>
              )}

              <h1 className="pdp-title">{product.name}</h1>

              {/* Rating */}
              <div className="pdp-rating-row">
                <StarRating rating={avgRating} size="md" />
                <span className="pdp-rating-count">
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Price */}
              <div className="pdp-price-block">
                <span className="pdp-price">{formatPrice(product.price)}</span>
                {product.original_price && product.original_price > product.price && (
                  <>
                    <span className="pdp-original">{formatPrice(product.original_price)}</span>
                    {discount && <span className="pdp-discount-tag">{discount}% off</span>}
                  </>
                )}
              </div>

              {/* Stock */}
              <div className={`pdp-stock ${inStock ? 'in' : 'out'}`}>
                <span className="pdp-stock-dot" />
                {inStock ? `In Stock — ${product.stock} left` : 'Out of Stock'}
              </div>

              {/* Description */}
              <p className="pdp-desc">{product.description}</p>

              {/* Quantity */}
              {inStock && (
                <div className="pdp-qty-row">
                  <span className="pdp-qty-label">Quantity</span>
                  <div className="pdp-qty-ctrl">
                    <button
                      className="pdp-qty-btn"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="pdp-qty-val">{quantity}</span>
                    <button
                      className="pdp-qty-btn"
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      aria-label="Increase"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="pdp-actions">
                <button
                  className="pdp-btn-cart"
                  onClick={() => { addToCart({ ...product, quantity }); toast.success('Added to cart!', { duration: 1500 }) }}
                  disabled={!inStock}
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>

                <button
                  className="pdp-btn-whatsapp"
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  title="Buy via WhatsApp"
                >
                  <MessageCircle size={18} />
                  Buy via WhatsApp
                </button>

                <button
                  className={`pdp-btn-wish ${wishlisted ? 'active' : ''}`}
                  onClick={() => toggleWishlist(product)}
                  title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart
                    size={20}
                    style={wishlisted
                      ? { fill: '#dc2626', color: '#dc2626' }
                      : { color: 'var(--text-3)' }}
                  />
                </button>
              </div>

              {/* Promises */}
              <div className="pdp-promises">
                {promises.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="pdp-promise">
                    <div className="pdp-promise-icon"><Icon size={18} /></div>
                    <span className="pdp-promise-label">{label}</span>
                    <span className="pdp-promise-sub">{sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="pdp-tabs-section">
            <div className="pdp-tab-bar">
              {['description', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  className={`pdp-tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'reviews' ? `Reviews (${reviews.length})` : 'Description'}
                </button>
              ))}
            </div>

            {activeTab === 'description' ? (
              <p className="pdp-prose">
                {product.description || 'No description available.'}
              </p>
            ) : (
              <div className="pdp-reviews">
                {reviewsLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[1,2,3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="pdp-reviews-empty">
                    No reviews yet. Be the first to review this product!
                  </p>
                ) : (
                  <div className="pdp-review-list">
                    {reviews.map((review) => (
                      <div key={review.id} className="pdp-review-card">
                        <div className="pdp-review-header">
                          <div className="pdp-review-user-row">
                            <div className="pdp-review-avatar">
                              {(review.user_name || 'A')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="pdp-review-name">{review.user_name || 'Anonymous'}</p>
                              <StarRating rating={review.rating} size="sm" />
                            </div>
                          </div>
                          <span className="pdp-review-date">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="pdp-review-body">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                {user ? (
                  <form onSubmit={handleSubmitReview} className="pdp-review-form">
                    <h3>Write a Review</h3>
                    <div style={{ marginBottom: 18 }}>
                      <label className="pdp-field-label">Your Rating</label>
                      <StarRating rating={reviewRating} interactive onChange={setReviewRating} size="lg" />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <label className="pdp-field-label">Your Review</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={4}
                        placeholder="Share your experience with this product…"
                        className="pdp-textarea"
                      />
                    </div>
                    <Button type="submit" isLoading={submittingReview}>
                      Submit Review
                    </Button>
                  </form>
                ) : (
                  <div className="pdp-sign-in-prompt">
                    <Link to="/login">Sign in</Link> to leave a review.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Related */}
          <div className="pdp-related">
            <RelatedProducts category={product.category} excludeId={product.id} />
          </div>

        </div>
      </div>
    </>
  )
}