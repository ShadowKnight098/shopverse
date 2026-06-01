import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Pencil, Trash2, Package, Search, X, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../stores/useAuthStore'
import { supabase } from '../lib/supabase.js'
import { formatPrice, formatDate } from '../utils/formatters.js'

export default function DealerProductsPage() {
  const { user } = useAuthStore()
  const [products, setProducts]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]       = useState(false)

  useEffect(() => { document.title = 'My Products — ShopVerse' }, [])

  const fetchProducts = useCallback(async () => {
    if (!user) return
    setLoading(true)
    let query = supabase
      .from('products')
      .select('*')
      .eq('dealer_id', user.id)
      .order('created_at', { ascending: false })
    if (search.trim()) {
      query = query.or(`name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`)
    }
    const { data } = await query
    setProducts(data || [])
    setLoading(false)
  }, [user, search])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    if (deleteTarget.image_url?.includes('product-images')) {
      const path = deleteTarget.image_url.split('/product-images/')[1]
      if (path) await supabase.storage.from('product-images').remove([path])
    }
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', deleteTarget.id)
      .eq('dealer_id', user.id)
    if (error) { toast.error('Failed to delete product'); setDeleting(false); return }
    toast.success('Product deleted')
    setDeleteTarget(null)
    setDeleting(false)
    fetchProducts()
  }

  const stockStatus = (stock) => {
    if (stock <= 0)  return { label: 'Out of stock', cls: 'dp-stock-out' }
    if (stock <= 10) return { label: `${stock} left`,  cls: 'dp-stock-low' }
    return               { label: stock,               cls: 'dp-stock-ok'  }
  }

  return (
    <>
      <DpStyles />
      <div className="dp-root">

        {/* ── Header ── */}
        <div className="dp-header">
          <div className="dp-header-left">
            <p className="dp-eyebrow">Dealer Dashboard</p>
            <h1 className="dp-title">My Products</h1>
            <p className="dp-subtitle">
              {products.length} {products.length === 1 ? 'product' : 'products'} in your store
            </p>
          </div>
          <Link to="/dealer/products/new" className="dp-add-btn">
            <PlusCircle size={16} />
            Add Product
          </Link>
        </div>

        {/* ── Search ── */}
        <div className="dp-search-wrap">
          <Search size={15} className="dp-search-icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or description…"
            className="dp-search-input"
          />
          {search && (
            <button className="dp-search-clear" onClick={() => setSearch('')} aria-label="Clear">
              <X size={14} />
            </button>
          )}
        </div>

        {/* ── Table card ── */}
        <div className="dp-card">
          {loading ? (
            <div className="dp-skeletons">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="dp-skeleton-row" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="dp-skel dp-skel-img" />
                  <div className="dp-skel dp-skel-name" />
                  <div className="dp-skel dp-skel-pill" />
                  <div className="dp-skel dp-skel-price" />
                  <div className="dp-skel dp-skel-date" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="dp-empty">
              <div className="dp-empty-icon-wrap">
                <Package size={32} className="dp-empty-icon" />
              </div>
              <p className="dp-empty-title">
                {search ? 'No products match your search.' : 'No products yet.'}
              </p>
              <p className="dp-empty-sub">
                {search
                  ? 'Try a different keyword or clear the search.'
                  : 'Add your first product to start selling.'}
              </p>
              {!search && (
                <Link to="/dealer/products/new" className="dp-add-btn" style={{ marginTop: '20px' }}>
                  <PlusCircle size={15} />
                  Add Your First Product
                </Link>
              )}
            </div>
          ) : (
            <div className="dp-table-wrap">
              <table className="dp-table">
                <thead>
                  <tr className="dp-thead-row">
                    {['Product', 'Category', 'Price', 'Stock', 'Added', 'Actions'].map((h) => (
                      <th key={h} className="dp-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => {
                    const stock = stockStatus(p.stock)
                    return (
                      <tr
                        key={p.id}
                        className="dp-tr"
                        style={{ animationDelay: `${i * 0.04}s` }}
                      >
                        {/* Product */}
                        <td className="dp-td">
                          <div className="dp-product-cell">
                            <div className="dp-img-wrap">
                              {p.image_url
                                ? <img src={p.image_url} alt={p.name} className="dp-img" />
                                : <div className="dp-img-placeholder"><Package size={14} /></div>
                              }
                            </div>
                            <span className="dp-product-name">{p.name}</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="dp-td">
                          <span className="dp-category-pill">
                            {p.category || '—'}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="dp-td">
                          <span className="dp-price">{formatPrice(p.price)}</span>
                        </td>

                        {/* Stock */}
                        <td className="dp-td">
                          <span className={`dp-stock ${stock.cls}`}>{stock.label}</span>
                        </td>

                        {/* Added */}
                        <td className="dp-td">
                          <span className="dp-date">{formatDate(p.created_at)}</span>
                        </td>

                        {/* Actions */}
                        <td className="dp-td">
                          <div className="dp-actions">
                            <Link
                              to={`/dealer/products/${p.id}/edit`}
                              className="dp-action-btn dp-action-edit"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </Link>
                            <button
                              onClick={() => setDeleteTarget(p)}
                              className="dp-action-btn dp-action-delete"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Delete modal ── */}
        {deleteTarget && (
          <div className="dp-modal-overlay" onClick={() => setDeleteTarget(null)}>
            <div className="dp-modal" onClick={(e) => e.stopPropagation()}>
              <div className="dp-modal-icon-wrap">
                <AlertTriangle size={24} color="#ef4444" />
              </div>
              <h3 className="dp-modal-title">Delete Product?</h3>
              <p className="dp-modal-body">
                Are you sure you want to delete{' '}
                <strong className="dp-modal-name">"{deleteTarget.name}"</strong>?
                This action cannot be undone.
              </p>
              <div className="dp-modal-actions">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="dp-modal-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="dp-modal-confirm"
                >
                  {deleting ? <><span className="dp-spinner" /> Deleting…</> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  )
}

function DpStyles() {
  return (
    <style>{`
      :root {
        --dp-bg:        #f7f6f3;
        --dp-surface:   #ffffff;
        --dp-border:    #ebebeb;
        --dp-text:      #1a1714;
        --dp-text2:     #6b6560;
        --dp-text3:     #a09890;
        --dp-accent:    #7c3aed;
        --dp-accent2:   #6d28d9;
        --dp-accentl:   rgba(124, 58, 237, 0.1);
        --dp-red:       #ef4444;
        --dp-redl:      rgba(239, 68, 68, 0.08);
        --dp-redborder: rgba(239, 68, 68, 0.3);
        --dp-amber:     #f59e0b;
        --dp-green:     #10b981;
        --dp-radius:    16px;
        --dp-shadow:    0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --dp-bg:      #0f0e0c;
          --dp-surface: #1a1917;
          --dp-border:  #2d2b27;
          --dp-text:    #f2ede8;
          --dp-text2:   #a09890;
          --dp-text3:   #6b6460;
          --dp-accentl: rgba(139, 92, 246, 0.15);
          --dp-redl:    rgba(239, 68, 68, 0.12);
          --dp-shadow:  0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2);
        }
      }

      /* ── Root ── */
      .dp-root {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 32px 0;
        animation: dpFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
      }

      /* ── Header ── */
      .dp-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
      }
      .dp-eyebrow {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--dp-accent);
        margin: 0 0 6px;
      }
      .dp-title {
        font-size: clamp(20px, 3vw, 26px);
        font-weight: 800;
        color: var(--dp-text);
        margin: 0 0 4px;
        letter-spacing: -0.025em;
      }
      .dp-subtitle {
        font-size: 13px;
        color: var(--dp-text3);
        margin: 0;
      }
      .dp-add-btn {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 10px 20px;
        border-radius: 12px;
        background: var(--dp-accent);
        color: #fff;
        font-size: 13px;
        font-weight: 700;
        font-family: inherit;
        text-decoration: none;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(124,58,237,0.3);
        transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
        white-space: nowrap;
      }
      .dp-add-btn:hover {
        background: var(--dp-accent2);
        transform: translateY(-2px);
        box-shadow: 0 8px 22px rgba(124,58,237,0.35);
      }
      .dp-add-btn:active { transform: scale(0.97); }

      /* ── Search ── */
      .dp-search-wrap {
        position: relative;
        max-width: 440px;
      }
      .dp-search-icon {
        position: absolute;
        left: 13px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--dp-text3);
        pointer-events: none;
        transition: color 0.2s;
      }
      .dp-search-wrap:focus-within .dp-search-icon { color: var(--dp-accent); }
      .dp-search-input {
        width: 100%;
        padding: 11px 40px 11px 40px;
        border-radius: 12px;
        border: 1.5px solid var(--dp-border);
        background: var(--dp-surface);
        color: var(--dp-text);
        font-size: 13px;
        font-family: inherit;
        outline: none;
        box-sizing: border-box;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .dp-search-input::placeholder { color: var(--dp-text3); }
      .dp-search-input:focus {
        border-color: var(--dp-accent);
        box-shadow: 0 0 0 3px var(--dp-accentl);
      }
      .dp-search-clear {
        position: absolute;
        right: 11px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--dp-text3);
        cursor: pointer;
        display: flex;
        padding: 3px;
        border-radius: 6px;
        transition: color 0.15s, background 0.15s;
      }
      .dp-search-clear:hover { color: var(--dp-text); background: var(--dp-border); }

      /* ── Card ── */
      .dp-card {
        background: var(--dp-surface);
        border: 1px solid var(--dp-border);
        border-radius: 20px;
        box-shadow: var(--dp-shadow);
        overflow: hidden;
      }

      /* ── Skeleton ── */
      .dp-skeletons {
        padding: 16px 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .dp-skeleton-row {
        display: flex;
        align-items: center;
        gap: 14px;
        animation: dpFadeUp 0.4s ease both;
      }
      .dp-skel {
        border-radius: 8px;
        background: linear-gradient(90deg, var(--dp-border) 25%, rgba(0,0,0,0.04) 50%, var(--dp-border) 75%);
        background-size: 200% 100%;
        animation: dpShimmer 1.4s ease infinite;
      }
      .dp-skel-img   { width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0; }
      .dp-skel-name  { height: 14px; width: 160px; }
      .dp-skel-pill  { height: 22px; width: 72px; border-radius: 9999px; margin-left: auto; }
      .dp-skel-price { height: 14px; width: 56px; }
      .dp-skel-date  { height: 14px; width: 80px; }

      /* ── Empty ── */
      .dp-empty {
        padding: 64px 24px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        animation: dpFadeUp 0.5s ease both;
      }
      .dp-empty-icon-wrap {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: var(--dp-accentl);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
      }
      .dp-empty-icon { color: var(--dp-accent); }
      .dp-empty-title {
        font-size: 15px;
        font-weight: 700;
        color: var(--dp-text);
        margin: 0 0 6px;
      }
      .dp-empty-sub {
        font-size: 13px;
        color: var(--dp-text3);
        margin: 0;
        max-width: 280px;
        line-height: 1.6;
      }

      /* ── Table ── */
      .dp-table-wrap { overflow-x: auto; }
      .dp-table {
        width: 100%;
        border-collapse: collapse;
      }
      .dp-thead-row {
        border-bottom: 1px solid var(--dp-border);
      }
      .dp-th {
        text-align: left;
        padding: 12px 20px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--dp-text3);
        white-space: nowrap;
      }
      .dp-tr {
        border-bottom: 1px solid var(--dp-border);
        transition: background 0.15s;
        animation: dpFadeUp 0.4s ease both;
      }
      .dp-tr:last-child { border-bottom: none; }
      .dp-tr:hover { background: rgba(124,58,237,0.04); }
      .dp-td {
        padding: 14px 20px;
        vertical-align: middle;
      }

      /* Product cell */
      .dp-product-cell {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .dp-img-wrap {
        width: 44px;
        height: 44px;
        border-radius: 11px;
        overflow: hidden;
        background: var(--dp-bg);
        border: 1px solid var(--dp-border);
        flex-shrink: 0;
      }
      .dp-img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .dp-img-placeholder {
        width: 100%; height: 100%;
        display: flex; align-items: center; justify-content: center;
        color: var(--dp-text3);
      }
      .dp-product-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--dp-text);
        max-width: 160px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: block;
      }

      /* Category pill */
      .dp-category-pill {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 9999px;
        background: var(--dp-accentl);
        color: var(--dp-accent);
        font-size: 11px;
        font-weight: 600;
        text-transform: capitalize;
        white-space: nowrap;
      }

      /* Price */
      .dp-price {
        font-size: 13px;
        font-weight: 700;
        color: var(--dp-text);
      }

      /* Stock */
      .dp-stock {
        font-size: 12px;
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 9999px;
        display: inline-block;
      }
      .dp-stock-ok  { background: rgba(16,185,129,0.1); color: #059669; }
      .dp-stock-low { background: rgba(245,158,11,0.1);  color: #d97706; }
      .dp-stock-out { background: var(--dp-redl);         color: var(--dp-red); }

      /* Date */
      .dp-date { font-size: 12px; color: var(--dp-text3); white-space: nowrap; }

      /* Actions */
      .dp-actions { display: flex; align-items: center; gap: 4px; }
      .dp-action-btn {
        width: 30px; height: 30px;
        border-radius: 8px;
        border: none;
        background: transparent;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        text-decoration: none;
        transition: background 0.15s, color 0.15s, transform 0.15s;
        color: var(--dp-text3);
      }
      .dp-action-btn:hover { transform: scale(1.1); }
      .dp-action-edit:hover  { background: var(--dp-accentl); color: var(--dp-accent); }
      .dp-action-delete:hover { background: var(--dp-redl); color: var(--dp-red); }

      /* ── Delete modal ── */
      .dp-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 60;
        background: rgba(0,0,0,0.45);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: dpFadeIn 0.2s ease both;
      }
      .dp-modal {
        background: var(--dp-surface);
        border: 1px solid var(--dp-border);
        border-radius: 20px;
        padding: 32px 28px;
        max-width: 380px;
        width: 100%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        animation: dpPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
      }
      .dp-modal-icon-wrap {
        width: 56px; height: 56px;
        border-radius: 50%;
        background: var(--dp-redl);
        border: 1px solid var(--dp-redborder);
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 18px;
      }
      .dp-modal-title {
        font-size: 18px;
        font-weight: 800;
        color: var(--dp-text);
        margin: 0 0 10px;
        letter-spacing: -0.02em;
      }
      .dp-modal-body {
        font-size: 13px;
        color: var(--dp-text2);
        line-height: 1.65;
        margin: 0 0 24px;
      }
      .dp-modal-name { color: var(--dp-text); font-weight: 700; }
      .dp-modal-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
      }
      .dp-modal-cancel {
        padding: 10px 22px;
        border-radius: 11px;
        border: 1.5px solid var(--dp-border);
        background: transparent;
        color: var(--dp-text2);
        font-size: 13px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s;
      }
      .dp-modal-cancel:hover { background: var(--dp-bg); border-color: var(--dp-text3); }
      .dp-modal-confirm {
        padding: 10px 22px;
        border-radius: 11px;
        border: none;
        background: var(--dp-red);
        color: #fff;
        font-size: 13px;
        font-weight: 700;
        font-family: inherit;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        box-shadow: 0 4px 14px rgba(239,68,68,0.3);
        transition: opacity 0.2s, transform 0.15s;
      }
      .dp-modal-confirm:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
      .dp-modal-confirm:disabled { opacity: 0.6; cursor: not-allowed; }

      /* Spinner */
      .dp-spinner {
        width: 14px; height: 14px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: dpSpin 0.7s linear infinite;
        flex-shrink: 0;
      }

      /* ── Keyframes ── */
      @keyframes dpFadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes dpFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes dpPop {
        from { opacity: 0; transform: scale(0.88) translateY(10px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes dpShimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      @keyframes dpSpin { to { transform: rotate(360deg); } }
    `}</style>
  )
}