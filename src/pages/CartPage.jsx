import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Trash2, Minus, Plus, ArrowLeft, ArrowRight, Tag, Truck } from 'lucide-react'
import useCartStore from '../stores/useCartStore'
import Button from '../components/common/Button'
import LazyImage from '../components/common/LazyImage'
import { formatPrice } from '../utils/formatters'

export default function CartPage() {
  const items          = useCartStore((s) => s.items)
  const removeItem     = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const clearCart      = useCartStore((s) => s.clearCart)

  useEffect(() => { document.title = 'Shopping Cart — ShopVerse' }, [])

  const subtotal  = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shipping  = subtotal > 500 ? 0 : 49
  const total     = subtotal + shipping
  const savings   = items.reduce((sum, i) => sum + ((i.original_price || i.price) - i.price) * i.quantity, 0)
  const progress  = Math.min((subtotal / 500) * 100, 100)
  const remaining = Math.max(500 - subtotal, 0)

  /* ── Empty state ── */
  if (items.length === 0) {
    return (
      <>
        <style>{`
          .cart-empty {
            min-height: 72vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 32px 20px;
            background: var(--cp-bg);
            text-align: center;
          }
          .cart-empty-icon {
            width: 120px; height: 120px;
            border-radius: 32px;
            background: var(--cp-surface);
            border: 1px solid var(--cp-border);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 28px;
            animation: cpFloat 3s ease-in-out infinite;
          }
          .cart-empty h2 {
            font-size: 24px;
            font-weight: 800;
            color: var(--cp-text);
            margin: 0 0 10px;
            letter-spacing: -0.02em;
          }
          .cart-empty p {
            font-size: 14px;
            color: var(--cp-text3);
            max-width: 300px;
            line-height: 1.65;
            margin: 0 0 32px;
          }
          .cart-empty-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 13px 28px;
            border-radius: 14px;
            background: var(--cp-accent);
            color: white;
            font-size: 14px;
            font-weight: 700;
            text-decoration: none;
            box-shadow: 0 4px 18px rgba(79,70,229,0.35);
            transition: background 0.2s, transform 0.15s;
          }
          .cart-empty-btn:hover { background: var(--cp-accent2); transform: translateY(-2px); }
        `}</style>
        <CartStyles />
        <div className="cart-empty">
          <div className="cart-empty-icon">
            <ShoppingBag size={52} style={{ color: 'var(--cp-text3)' }} strokeWidth={1.2} />
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven&apos;t added anything yet. Start exploring to find something you&apos;ll love!</p>
          <Link to="/products" className="cart-empty-btn">
            <ArrowLeft size={17} /> Continue Shopping
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <CartStyles />
      <div className="cp-root">
        <div className="cp-inner">

          {/* ── Page header ── */}
          <div className="cp-header">
            <div>
              <h1 className="cp-title">Shopping Cart</h1>
              <p className="cp-subtitle">{items.length} item{items.length !== 1 ? 's' : ''} in your bag</p>
            </div>
            <button onClick={clearCart} className="cp-clear-btn">
              <Trash2 size={14} /> Clear all
            </button>
          </div>

          {/* ── Two-col layout ── */}
          <div className="cp-layout">

            {/* Left: items list */}
            <div className="cp-items">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="cp-card"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* Image */}
                  <Link to={`/products/${item.id}`} className="cp-img-link">
                    <div className="cp-img-wrap">
                      <LazyImage src={item.image_url} alt={item.name} />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="cp-item-body">
                    <div className="cp-item-top">
                      <div className="cp-item-meta">
                        {item.category && <span className="cp-item-cat">{item.category}</span>}
                        <Link to={`/products/${item.id}`} className="cp-item-name">
                          {item.name}
                        </Link>
                        <div className="cp-item-prices">
                          <span className="cp-item-price">{formatPrice(item.price)}</span>
                          {item.original_price && item.original_price > item.price && (
                            <span className="cp-item-orig">{formatPrice(item.original_price)}</span>
                          )}
                        </div>
                      </div>

                      {/* Remove btn */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="cp-remove-btn"
                        title="Remove"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Bottom: qty + line total */}
                    <div className="cp-item-foot">
                      <div className="cp-qty-ctrl">
                        <button
                          className="cp-qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="cp-qty-val">{item.quantity}</span>
                        <button
                          className="cp-qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <span className="cp-line-total">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Continue shopping */}
              <Link to="/products" className="cp-continue-link">
                <ArrowLeft size={15} /> Continue Shopping
              </Link>
            </div>

            {/* Right: summary */}
            <aside className="cp-aside">
              <div className="cp-summary">
                <h2 className="cp-summary-title">Order Summary</h2>

                {/* Free shipping progress */}
                <div className="cp-shipping-bar">
                  <div className="cp-shipping-bar-top">
                    <span className="cp-shipping-label">
                      <Truck size={14} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                      {shipping === 0
                        ? '🎉 You have free shipping!'
                        : `Add ${formatPrice(remaining)} more for free shipping`}
                    </span>
                  </div>
                  <div className="cp-bar-track">
                    <div className="cp-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                {/* Line items */}
                <div className="cp-summary-rows">
                  <div className="cp-summary-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="cp-summary-row savings">
                      <span>
                        <Tag size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                        You save
                      </span>
                      <span>−{formatPrice(savings)}</span>
                    </div>
                  )}
                  <div className="cp-summary-row">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'free' : ''}>
                      {shipping === 0 ? 'Free' : formatPrice(shipping)}
                    </span>
                  </div>
                </div>

                <div className="cp-summary-total">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                {/* CTA */}
                <Link to="/checkout" className="cp-checkout-btn">
                  Proceed to Checkout <ArrowRight size={17} />
                </Link>

                {/* Trust badges */}
                <div className="cp-trust">
                  {['🔒 Secure Checkout', '↩️ Easy Returns', '✅ Genuine Products'].map((t) => (
                    <span key={t} className="cp-trust-item">{t}</span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── All styles in one place ── */
function CartStyles() {
  return (
    <style>{`
      :root {
        --cp-bg:      #f6f5f2;
        --cp-surface: #ffffff;
        --cp-surface2:#f0eeea;
        --cp-border:  #e8e4de;
        --cp-text:    #1a1714;
        --cp-text2:   #5c5650;
        --cp-text3:   #9c9690;
        --cp-accent:  #4f46e5;
        --cp-accent2: #4338ca;
        --cp-accentl: rgba(79,70,229,0.1);
        --cp-green:   #059669;
        --cp-greenl:  rgba(5,150,105,0.1);
        --cp-red:     #dc2626;
        --cp-redl:    rgba(220,38,38,0.07);
        --cp-radius:  16px;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --cp-bg:      #0f0e0c;
          --cp-surface: #1a1917;
          --cp-surface2:#222019;
          --cp-border:  #2d2b27;
          --cp-text:    #f2ede8;
          --cp-text2:   #a09890;
          --cp-text3:   #6b6460;
          --cp-accentl: rgba(99,102,241,0.14);
          --cp-greenl:  rgba(16,185,129,0.12);
          --cp-redl:    rgba(239,68,68,0.09);
        }
      }

      .cp-root {
        min-height: 100vh;
        background: var(--cp-bg);
      }
      .cp-inner {
        max-width: 1280px;
        margin: 0 auto;
        padding: 32px 16px 80px;
        box-sizing: border-box;
      }
      @media (min-width: 640px)  { .cp-inner { padding: 40px 24px 80px; } }
      @media (min-width: 1024px) { .cp-inner { padding: 48px 40px 96px; } }

      /* Header */
      .cp-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 32px;
        gap: 16px;
      }
      .cp-title {
        font-size: clamp(1.5rem, 4vw, 2rem);
        font-weight: 900;
        color: var(--cp-text);
        margin: 0 0 4px;
        letter-spacing: -0.03em;
      }
      .cp-subtitle {
        font-size: 14px;
        color: var(--cp-text3);
        margin: 0;
      }
      .cp-clear-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
        color: var(--cp-red);
        background: var(--cp-redl);
        border: 1px solid rgba(220,38,38,0.18);
        padding: 7px 14px;
        border-radius: 9999px;
        cursor: pointer;
        transition: background 0.2s, transform 0.15s;
        flex-shrink: 0;
      }
      .cp-clear-btn:hover { background: rgba(220,38,38,0.14); transform: scale(0.97); }

      /* Layout */
      .cp-layout {
        display: grid;
        grid-template-columns: 1fr;
        gap: 24px;
        align-items: start;
      }
      @media (min-width: 1024px) {
        .cp-layout {
          grid-template-columns: 1fr 340px;
          gap: 32px;
        }
      }

      /* ── Cart card ── */
      .cp-items { display: flex; flex-direction: column; gap: 12px; }
      .cp-card {
        display: flex;
        gap: 16px;
        padding: 16px;
        background: var(--cp-surface);
        border: 1px solid var(--cp-border);
        border-radius: var(--cp-radius);
        transition: box-shadow 0.25s, transform 0.25s;
        animation: cpSlideIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
      }
      .cp-card:hover {
        box-shadow: 0 8px 28px rgba(0,0,0,0.09);
        transform: translateY(-2px);
      }
      @media (prefers-color-scheme: dark) {
        .cp-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.35); }
      }

      .cp-img-link { flex-shrink: 0; display: block; text-decoration: none; }
      .cp-img-wrap {
        width: 96px; height: 96px;
        border-radius: 12px;
        overflow: hidden;
        background: var(--cp-surface2);
        transition: transform 0.3s;
      }
      @media (min-width: 480px) { .cp-img-wrap { width: 112px; height: 112px; } }
      .cp-card:hover .cp-img-wrap { transform: scale(1.03); }
      .cp-img-wrap img,
      .cp-img-wrap > * { width: 100%; height: 100%; object-fit: cover; display: block; }

      .cp-item-body {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .cp-item-top {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        align-items: flex-start;
      }
      .cp-item-meta { flex: 1; min-width: 0; }
      .cp-item-cat {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--cp-accent);
        display: block;
        margin-bottom: 4px;
      }
      .cp-item-name {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        font-size: 14px;
        font-weight: 600;
        color: var(--cp-text);
        text-decoration: none;
        line-height: 1.4;
        transition: color 0.2s;
        margin-bottom: 6px;
      }
      .cp-item-name:hover { color: var(--cp-accent); }
      .cp-item-prices { display: flex; align-items: baseline; gap: 8px; }
      .cp-item-price {
        font-size: 15px;
        font-weight: 700;
        color: var(--cp-accent);
      }
      .cp-item-orig {
        font-size: 12px;
        color: var(--cp-text3);
        text-decoration: line-through;
      }

      .cp-remove-btn {
        width: 32px; height: 32px;
        flex-shrink: 0;
        border-radius: 9px;
        background: none;
        border: 1px solid transparent;
        cursor: pointer;
        color: var(--cp-text3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s, color 0.2s, border-color 0.2s;
      }
      .cp-remove-btn:hover {
        background: var(--cp-redl);
        color: var(--cp-red);
        border-color: rgba(220,38,38,0.2);
      }

      /* Quantity + line total row */
      .cp-item-foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 12px;
      }
      .cp-qty-ctrl {
        display: flex;
        align-items: center;
        background: var(--cp-surface2);
        border: 1px solid var(--cp-border);
        border-radius: 10px;
        overflow: hidden;
      }
      .cp-qty-btn {
        width: 34px; height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--cp-text2);
        transition: background 0.15s, color 0.15s;
        flex-shrink: 0;
      }
      .cp-qty-btn:hover:not(:disabled) {
        background: var(--cp-accentl);
        color: var(--cp-accent);
      }
      .cp-qty-btn:disabled { opacity: 0.35; cursor: not-allowed; }
      .cp-qty-val {
        min-width: 36px;
        text-align: center;
        font-size: 14px;
        font-weight: 700;
        color: var(--cp-text);
        border-left: 1px solid var(--cp-border);
        border-right: 1px solid var(--cp-border);
        line-height: 34px;
      }
      .cp-line-total {
        font-size: 15px;
        font-weight: 800;
        color: var(--cp-text);
        letter-spacing: -0.01em;
      }

      /* Continue link */
      .cp-continue-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
        color: var(--cp-text3);
        text-decoration: none;
        padding: 10px 0;
        transition: color 0.2s;
      }
      .cp-continue-link:hover { color: var(--cp-accent); }

      /* ── Order Summary ── */
      .cp-aside { position: relative; }
      .cp-summary {
        position: sticky;
        top: 80px;
        background: var(--cp-surface);
        border: 1px solid var(--cp-border);
        border-radius: 20px;
        padding: 24px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      }
      @media (prefers-color-scheme: dark) {
        .cp-summary { box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
      }
      .cp-summary-title {
        font-size: 17px;
        font-weight: 800;
        color: var(--cp-text);
        margin: 0 0 20px;
        letter-spacing: -0.02em;
      }

      /* Shipping progress bar */
      .cp-shipping-bar {
        background: var(--cp-surface2);
        border: 1px solid var(--cp-border);
        border-radius: 12px;
        padding: 12px 14px;
        margin-bottom: 20px;
      }
      .cp-shipping-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--cp-text2);
        display: block;
        margin-bottom: 8px;
      }
      .cp-bar-track {
        height: 6px;
        background: var(--cp-border);
        border-radius: 9999px;
        overflow: hidden;
      }
      .cp-bar-fill {
        height: 100%;
        background: linear-gradient(to right, var(--cp-accent), #06b6d4);
        border-radius: 9999px;
        transition: width 0.5s cubic-bezier(0.22,1,0.36,1);
      }

      /* Row items */
      .cp-summary-rows {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 16px;
      }
      .cp-summary-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        color: var(--cp-text2);
      }
      .cp-summary-row.savings { color: var(--cp-green); font-weight: 600; }
      .cp-summary-row .free {
        color: var(--cp-green);
        font-weight: 700;
      }

      .cp-summary-total {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        padding: 16px 0 0;
        border-top: 1.5px solid var(--cp-border);
        font-size: 18px;
        font-weight: 900;
        color: var(--cp-text);
        letter-spacing: -0.02em;
        margin-bottom: 20px;
      }

      /* Checkout CTA */
      .cp-checkout-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 15px 20px;
        border-radius: 14px;
        background: linear-gradient(135deg, var(--cp-accent), #6366f1);
        color: white;
        font-size: 15px;
        font-weight: 700;
        text-decoration: none;
        box-shadow: 0 6px 20px rgba(79,70,229,0.35);
        transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
        margin-bottom: 16px;
        letter-spacing: -0.01em;
        box-sizing: border-box;
      }
      .cp-checkout-btn:hover {
        opacity: 0.93;
        transform: translateY(-2px);
        box-shadow: 0 10px 28px rgba(79,70,229,0.45);
      }
      .cp-checkout-btn:active { transform: scale(0.98); }

      /* Trust badges */
      .cp-trust {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .cp-trust-item {
        font-size: 11px;
        color: var(--cp-text3);
        text-align: center;
        display: block;
      }

      /* Animations */
      @keyframes cpSlideIn {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes cpFloat {
        0%, 100% { transform: translateY(0); }
        50%       { transform: translateY(-12px); }
      }
    `}</style>
  )
} 