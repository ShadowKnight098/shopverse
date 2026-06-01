import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Package, PlusCircle, TrendingUp, ShoppingBag, Eye } from 'lucide-react';
import useAuthStore from '../stores/useAuthStore';
import { supabase } from '../lib/supabase.js';
import { formatPrice, formatDate } from '../utils/formatters.js';

export default function DealerDashboardPage() {
  const { user, profile } = useAuthStore();
  const [stats, setStats]           = useState({ total: 0, featured: 0 });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => { document.title = 'Dealer Dashboard — ShopVerse'; }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [countRes, featRes, productsRes] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('dealer_id', user.id),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('dealer_id', user.id).eq('is_featured', true),
      supabase.from('products').select('*').eq('dealer_id', user.id).order('created_at', { ascending: false }).limit(5),
    ]);
    setStats({ total: countRes.count || 0, featured: featRes.count || 0 });
    setRecentProducts(productsRes.data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const STAT_CARDS = [
    { label: 'Total Products',       value: stats.total,    icon: Package,     accent: '#6366f1', accentl: 'rgba(99,102,241,0.1)'  },
    { label: 'Featured Products',    value: stats.featured, icon: TrendingUp,  accent: '#8b5cf6', accentl: 'rgba(139,92,246,0.1)'  },
    { label: 'Orders (Coming Soon)', value: '—',            icon: ShoppingBag, accent: '#10b981', accentl: 'rgba(16,185,129,0.1)'  },
  ];

  return (
    <>
      <DDStyles />
      <div className="dd-root">

        {/* ── Header ── */}
        <div className="dd-header">
          <div>
            <h1 className="dd-title">
              Welcome back, {profile?.name?.split(' ')[0] || 'Dealer'} 👋
            </h1>
            <p className="dd-subtitle">
              {profile?.shop_name} — manage your products and grow your store
            </p>
          </div>
          <Link to="/dealer/products/new" className="dd-add-btn">
            <PlusCircle size={16} />
            Add Product
          </Link>
        </div>

        {/* ── Stat cards ── */}
        <div className="dd-stats">
          {STAT_CARDS.map(({ label, value, icon: Icon, accent, accentl }) => (
            <div key={label} className="dd-stat-card">
              <div className="dd-stat-icon" style={{ background: accentl, color: accent }}>
                <Icon size={20} />
              </div>
              <p className="dd-stat-value">{loading ? '—' : value}</p>
              <p className="dd-stat-label">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Recent products ── */}
        <div className="dd-card">
          <div className="dd-card-header">
            <h2 className="dd-card-title">Recent Products</h2>
            <Link to="/dealer/products" className="dd-view-all">View all</Link>
          </div>

          {loading ? (
            <div className="dd-list">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="dd-skeleton-row">
                  <div className="dd-skeleton dd-skeleton--thumb" />
                  <div className="dd-skeleton dd-skeleton--line" />
                  <div className="dd-skeleton dd-skeleton--short" />
                </div>
              ))}
            </div>
          ) : recentProducts.length === 0 ? (
            <div className="dd-empty">
              <Package size={40} className="dd-empty-icon" />
              <p className="dd-empty-title">No products yet</p>
              <p className="dd-empty-sub">Add your first product to get started.</p>
              <Link to="/dealer/products/new" className="dd-add-btn" style={{ marginTop: 16 }}>
                <PlusCircle size={15} /> Add Product
              </Link>
            </div>
          ) : (
            <div className="dd-list">
              {recentProducts.map((p) => (
                <div key={p.id} className="dd-product-row">
                  <div className="dd-product-thumb">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="dd-product-img" />
                      : <Package size={16} className="dd-product-placeholder" />
                    }
                  </div>
                  <div className="dd-product-info">
                    <p className="dd-product-name">{p.name}</p>
                    <p className="dd-product-date">{formatDate(p.created_at)}</p>
                  </div>
                  <span className="dd-product-price">{formatPrice(p.price)}</span>
                  <Link to={`/dealer/products/${p.id}/edit`} className="dd-eye-btn" aria-label="Edit product">
                    <Eye size={15} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}

function DDStyles() {
  return (
    <style>{`
      :root {
        --dd-bg:      #ffffff;
        --dd-surface: #f7f6f3;
        --dd-border:  #ece9e4;
        --dd-text:    #1a1714;
        --dd-text2:   #5c5650;
        --dd-text3:   #9c9690;
        --dd-accent:  #6366f1;
        --dd-accentl: rgba(99,102,241,0.1);
        --dd-radius:  14px;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --dd-bg:      #0f0e0c;
          --dd-surface: #1a1917;
          --dd-border:  #2d2b27;
          --dd-text:    #f2ede8;
          --dd-text2:   #a09890;
          --dd-text3:   #6b6460;
        }
      }

      .dd-root {
        display: flex;
        flex-direction: column;
        gap: 24px;
        max-width: 860px;
      }

      /* ── Header ── */
      .dd-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      .dd-title {
        font-size: 22px;
        font-weight: 800;
        color: var(--dd-text);
        margin: 0 0 4px;
        letter-spacing: -0.03em;
      }
      .dd-subtitle {
        font-size: 13px;
        color: var(--dd-text3);
        margin: 0;
      }
      .dd-add-btn {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 10px 18px;
        border-radius: var(--dd-radius);
        background: var(--dd-accent);
        color: #fff;
        font-size: 13px;
        font-weight: 700;
        font-family: inherit;
        border: none;
        cursor: pointer;
        text-decoration: none;
        box-shadow: 0 4px 14px rgba(99,102,241,0.28);
        transition: background 0.2s, transform 0.15s;
        white-space: nowrap;
      }
      .dd-add-btn:hover { background: #4f46e5; transform: translateY(-1px); }
      .dd-add-btn:active { transform: scale(0.98); }

      /* ── Stat cards ── */
      .dd-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
      }
      @media (max-width: 580px) {
        .dd-stats { grid-template-columns: 1fr; }
      }
      .dd-stat-card {
        background: var(--dd-bg);
        border: 1px solid var(--dd-border);
        border-radius: var(--dd-radius);
        padding: 20px;
        transition: border-color 0.2s;
      }
      .dd-stat-card:hover { border-color: var(--dd-text3); }
      .dd-stat-icon {
        width: 40px;
        height: 40px;
        border-radius: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 14px;
      }
      .dd-stat-value {
        font-size: 28px;
        font-weight: 800;
        color: var(--dd-text);
        margin: 0 0 4px;
        letter-spacing: -0.03em;
      }
      .dd-stat-label {
        font-size: 12px;
        color: var(--dd-text3);
        margin: 0;
        font-weight: 500;
      }

      /* ── Card ── */
      .dd-card {
        background: var(--dd-bg);
        border: 1px solid var(--dd-border);
        border-radius: var(--dd-radius);
        overflow: hidden;
      }
      .dd-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--dd-border);
      }
      .dd-card-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--dd-text);
        margin: 0;
      }
      .dd-view-all {
        font-size: 12px;
        font-weight: 600;
        color: var(--dd-accent);
        text-decoration: none;
      }
      .dd-view-all:hover { text-decoration: underline; }

      /* ── Product list ── */
      .dd-list { display: flex; flex-direction: column; }
      .dd-product-row {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px 20px;
        border-bottom: 1px solid var(--dd-border);
        transition: background 0.15s;
      }
      .dd-product-row:last-child { border-bottom: none; }
      .dd-product-row:hover { background: var(--dd-surface); }

      .dd-product-thumb {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        overflow: hidden;
        background: var(--dd-surface);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border: 1px solid var(--dd-border);
      }
      .dd-product-img { width: 100%; height: 100%; object-fit: cover; }
      .dd-product-placeholder { color: var(--dd-text3); }

      .dd-product-info { flex: 1; min-width: 0; }
      .dd-product-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--dd-text);
        margin: 0 0 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .dd-product-date {
        font-size: 11px;
        color: var(--dd-text3);
        margin: 0;
      }
      .dd-product-price {
        font-size: 13px;
        font-weight: 700;
        color: var(--dd-text);
        white-space: nowrap;
      }
      .dd-eye-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 8px;
        color: var(--dd-text3);
        text-decoration: none;
        transition: background 0.15s, color 0.15s;
        flex-shrink: 0;
      }
      .dd-eye-btn:hover { background: var(--dd-accentl); color: var(--dd-accent); }

      /* ── Empty state ── */
      .dd-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 48px 24px;
        text-align: center;
      }
      .dd-empty-icon { color: var(--dd-border); margin-bottom: 12px; }
      .dd-empty-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--dd-text2);
        margin: 0 0 4px;
      }
      .dd-empty-sub {
        font-size: 13px;
        color: var(--dd-text3);
        margin: 0;
      }

      /* ── Skeleton ── */
      .dd-skeleton-row {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px 20px;
        border-bottom: 1px solid var(--dd-border);
      }
      .dd-skeleton-row:last-child { border-bottom: none; }
      .dd-skeleton {
        background: var(--dd-surface);
        border-radius: 8px;
        animation: ddPulse 1.4s ease-in-out infinite;
      }
      .dd-skeleton--thumb { width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0; }
      .dd-skeleton--line  { flex: 1; height: 13px; }
      .dd-skeleton--short { width: 56px; height: 13px; }

      @keyframes ddPulse {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.4; }
      }
    `}</style>
  );
}