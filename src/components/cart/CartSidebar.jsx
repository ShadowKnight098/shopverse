import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import useCartStore from '../../stores/useCartStore';
import LazyImage from '../common/LazyImage';

export default function CartSidebar() {
  const {
    items = [],
    cartOpen,
    setCartOpen,
    removeItem,
    updateQuantity,
  } = useCartStore();

  // Prevent body scroll when cart is open
  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [cartOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!cartOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') setCartOpen(false); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [cartOpen, setCartOpen]);

  const total     = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <>
      <CartStyles />

      {/* Overlay */}
      <div
        className={`cart-overlay ${cartOpen ? 'cart-overlay--visible' : ''}`}
        onClick={() => setCartOpen(false)}
      />

      {/* Panel */}
      <div className={`cart-panel ${cartOpen ? 'cart-panel--open' : ''}`}>

        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-left">
            <ShoppingBag size={20} className="cart-header-icon" />
            <h2 className="cart-header-title">Shopping Cart</h2>
            {itemCount > 0 && (
              <span className="cart-count-badge">{itemCount}</span>
            )}
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="cart-close-btn"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon-wrap">
              <ShoppingBag size={40} className="cart-empty-icon" />
            </div>
            <h3 className="cart-empty-title">Your cart is empty</h3>
            <p className="cart-empty-sub">Looks like you haven't added anything yet.</p>
            <Link to="/products" className="cart-empty-cta" onClick={() => setCartOpen(false)}>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.id || item._id} className="cart-item">
                  <div className="cart-item-img-wrap">
                    <LazyImage
                      src={item.image || item.images?.[0]}
                      alt={item.name}
                    />
                  </div>

                  <div className="cart-item-meta">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <p className="cart-item-price">₹{(item.price || 0).toFixed(2)}</p>

                    <div className="cart-item-controls">
                      <button
                        className="cart-qty-btn"
                        onClick={() => updateQuantity(item.id || item._id, Math.max(1, (item.quantity || 1) - 1))}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="cart-qty-value">{item.quantity || 1}</span>
                      <button
                        className="cart-qty-btn"
                        onClick={() => updateQuantity(item.id || item._id, (item.quantity || 1) + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>

                      <button
                        className="cart-remove-btn"
                        onClick={() => removeItem(item.id || item._id)}
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="cart-footer">
              <div className="cart-subtotal-row">
                <span className="cart-subtotal-label">Subtotal</span>
                <span className="cart-subtotal-value">₹{total.toFixed(2)}</span>
              </div>
              <p className="cart-tax-note">Shipping &amp; taxes calculated at checkout</p>

              <div className="cart-footer-actions">
                <Link to="/cart" onClick={() => setCartOpen(false)} className="cart-btn-outline">
                  View Cart
                </Link>
                <Link to="/checkout" onClick={() => setCartOpen(false)} className="cart-btn-primary">
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function CartStyles() {
  return (
    <style>{`
      :root {
        --cart-bg:       #ffffff;
        --cart-surface:  #f7f6f3;
        --cart-border:   #ebebeb;
        --cart-text:     #1a1714;
        --cart-text2:    #6b6560;
        --cart-text3:    #a09890;
        --cart-accent:   #4f46e5;
        --cart-accentl:  rgba(79, 70, 229, 0.1);
        --cart-red:      #ef4444;
        --cart-redl:     rgba(239, 68, 68, 0.08);
        --cart-radius:   14px;
        --cart-shadow:   0 0 0 1px rgba(0,0,0,0.06), 0 24px 64px rgba(0,0,0,0.12);
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --cart-bg:      #1a1917;
          --cart-surface: #222019;
          --cart-border:  #2d2b27;
          --cart-text:    #f2ede8;
          --cart-text2:   #a09890;
          --cart-text3:   #6b6460;
          --cart-accentl: rgba(99, 102, 241, 0.14);
          --cart-redl:    rgba(239, 68, 68, 0.12);
          --cart-shadow:  0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.5);
        }
      }

      /* ── Overlay ── */
      .cart-overlay {
        position: fixed;
        inset: 0;
        z-index: 50;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(4px);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      .cart-overlay--visible {
        opacity: 1;
        pointer-events: all;
      }

      /* ── Panel ── */
      .cart-panel {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        z-index: 51;
        width: 400px;
        max-width: 100vw;
        background: var(--cart-bg);
        box-shadow: var(--cart-shadow);
        display: flex;
        flex-direction: column;
        transform: translateX(100%);
        transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
      }
      .cart-panel--open {
        transform: translateX(0);
      }

      /* ── Header ── */
      .cart-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 20px;
        border-bottom: 1px solid var(--cart-border);
        flex-shrink: 0;
      }
      .cart-header-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .cart-header-icon {
        color: var(--cart-accent);
        flex-shrink: 0;
      }
      .cart-header-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--cart-text);
        margin: 0;
        letter-spacing: -0.02em;
      }
      .cart-count-badge {
        font-size: 11px;
        font-weight: 700;
        color: var(--cart-accent);
        background: var(--cart-accentl);
        padding: 2px 8px;
        border-radius: 9999px;
      }
      .cart-close-btn {
        width: 32px;
        height: 32px;
        border-radius: 9px;
        border: 1px solid var(--cart-border);
        background: transparent;
        color: var(--cart-text3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
        flex-shrink: 0;
      }
      .cart-close-btn:hover {
        background: var(--cart-surface);
        color: var(--cart-text);
      }

      /* ── Empty state ── */
      .cart-empty {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 24px;
        text-align: center;
      }
      .cart-empty-icon-wrap {
        width: 88px;
        height: 88px;
        border-radius: 50%;
        background: var(--cart-surface);
        border: 1px solid var(--cart-border);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
      }
      .cart-empty-icon { color: var(--cart-text3); }
      .cart-empty-title {
        font-size: 17px;
        font-weight: 700;
        color: var(--cart-text);
        margin: 0 0 8px;
        letter-spacing: -0.02em;
      }
      .cart-empty-sub {
        font-size: 13px;
        color: var(--cart-text2);
        margin: 0 0 24px;
        line-height: 1.6;
      }
      .cart-empty-cta {
        display: inline-block;
        font-size: 13px;
        font-weight: 600;
        color: #fff;
        background: var(--cart-accent);
        padding: 10px 24px;
        border-radius: 10px;
        text-decoration: none;
        transition: opacity 0.2s;
      }
      .cart-empty-cta:hover { opacity: 0.88; }

      /* ── Items list ── */
      .cart-items {
        flex: 1;
        overflow-y: auto;
        padding: 16px 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .cart-items::-webkit-scrollbar { width: 4px; }
      .cart-items::-webkit-scrollbar-track { background: transparent; }
      .cart-items::-webkit-scrollbar-thumb { background: var(--cart-border); border-radius: 4px; }

      /* ── Cart item ── */
      .cart-item {
        display: flex;
        gap: 14px;
        padding: 14px;
        border-radius: var(--cart-radius);
        background: var(--cart-surface);
        border: 1px solid var(--cart-border);
        transition: border-color 0.2s;
      }
      .cart-item:hover { border-color: rgba(79, 70, 229, 0.25); }

      .cart-item-img-wrap {
        width: 76px;
        height: 76px;
        border-radius: 10px;
        overflow: hidden;
        flex-shrink: 0;
        background: var(--cart-border);
        border: 1px solid var(--cart-border);
      }
      .cart-item-img-wrap img,
      .cart-item-img-wrap > * {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .cart-item-meta { flex: 1; min-width: 0; }
      .cart-item-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--cart-text);
        margin: 0 0 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cart-item-price {
        font-size: 14px;
        font-weight: 700;
        color: var(--cart-accent);
        margin: 0 0 10px;
      }

      /* Qty controls */
      .cart-item-controls {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .cart-qty-btn {
        width: 26px;
        height: 26px;
        border-radius: 7px;
        border: 1px solid var(--cart-border);
        background: var(--cart-bg);
        color: var(--cart-text2);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s;
        flex-shrink: 0;
      }
      .cart-qty-btn:hover {
        background: var(--cart-accentl);
        border-color: rgba(79, 70, 229, 0.3);
        color: var(--cart-accent);
      }
      .cart-qty-value {
        font-size: 13px;
        font-weight: 600;
        color: var(--cart-text);
        width: 22px;
        text-align: center;
      }
      .cart-remove-btn {
        margin-left: auto;
        width: 26px;
        height: 26px;
        border-radius: 7px;
        border: none;
        background: transparent;
        color: var(--cart-text3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
        flex-shrink: 0;
      }
      .cart-remove-btn:hover {
        background: var(--cart-redl);
        color: var(--cart-red);
      }

      /* ── Footer ── */
      .cart-footer {
        border-top: 1px solid var(--cart-border);
        padding: 18px 20px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .cart-subtotal-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 2px;
      }
      .cart-subtotal-label {
        font-size: 13px;
        color: var(--cart-text2);
      }
      .cart-subtotal-value {
        font-size: 20px;
        font-weight: 800;
        color: var(--cart-text);
        letter-spacing: -0.03em;
      }
      .cart-tax-note {
        font-size: 11px;
        color: var(--cart-text3);
        margin: 0 0 12px;
      }
      .cart-footer-actions {
        display: flex;
        gap: 10px;
      }
      .cart-btn-outline {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 11px 16px;
        border-radius: 11px;
        border: 1.5px solid var(--cart-border);
        background: transparent;
        color: var(--cart-text);
        font-size: 13px;
        font-weight: 600;
        text-decoration: none;
        transition: background 0.15s, border-color 0.15s;
      }
      .cart-btn-outline:hover {
        background: var(--cart-surface);
        border-color: var(--cart-text3);
      }
      .cart-btn-primary {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 11px 16px;
        border-radius: 11px;
        background: var(--cart-accent);
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        text-decoration: none;
        box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
        transition: opacity 0.2s, transform 0.15s;
      }
      .cart-btn-primary:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
    `}</style>
  );
}