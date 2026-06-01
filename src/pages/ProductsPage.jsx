import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, Package, ChevronDown, Sparkles } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import ProductFilters from '../components/product/ProductFilters'
import ProductGrid from '../components/product/ProductGrid'
import Pagination from '../components/common/Pagination'
import { CATEGORIES } from '../lib/constants'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen]   = useState(false)
  const [mounted, setMounted]           = useState(false)

  const category = searchParams.get('category') || ''
  const search   = searchParams.get('search')   || ''
  const sort     = searchParams.get('sort')     || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const page     = parseInt(searchParams.get('page') || '1', 10)

  const { products, loading, error, totalPages } = useProducts({
    category, search, sort,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    page, limit: 12,
  })

  useEffect(() => {
    document.title = 'Shop Products — ShopVerse'
    requestAnimationFrame(() => setMounted(true))
  }, [])

  const updateFilter = useCallback((key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      value ? next.set(key, value) : next.delete(key)
      if (key !== 'page') next.set('page', '1')
      return next
    })
  }, [setSearchParams])

  const categoryLabel = category
    ? CATEGORIES.find((c) => c.slug === category)?.name || category
    : ''
  const heading = search
    ? `Results for "${search}"`
    : categoryLabel || 'All Products'

  const activeFilterCount = [category, sort, minPrice, maxPrice].filter(Boolean).length

  return (
    <>
      <PPStyles />
      <div className={`pp-root ${mounted ? 'pp-root--in' : ''}`}>

        {/* ── Hero ── */}
        <div className="pp-hero">
          <div className="pp-hero-grain" />
          <div className="pp-hero-blob pp-hero-blob-tl" />
          <div className="pp-hero-blob pp-hero-blob-br" />
          <div className="pp-hero-inner">
            <div className="pp-hero-tag">
              <Sparkles size={11} />
              ShopVerse Store
            </div>
            <h1 className="pp-hero-title">{heading}</h1>
            <p className="pp-hero-sub">
              {loading
                ? 'Finding the best products for you…'
                : `${products.length} product${products.length !== 1 ? 's' : ''} available`}
            </p>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="pp-body">

          {/* Mobile filter bar */}
          <div className="pp-mobile-bar">
            <button className="pp-filter-btn" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="pp-filter-count">{activeFilterCount}</span>
              )}
            </button>

            <div className="pp-cat-pills">
              <button
                className={`pp-cat-pill ${!category ? 'pp-cat-pill--active' : ''}`}
                onClick={() => updateFilter('category', '')}
              >All</button>
              {CATEGORIES.slice(0, 5).map(c => (
                <button
                  key={c.slug}
                  className={`pp-cat-pill ${category === c.slug ? 'pp-cat-pill--active' : ''}`}
                  onClick={() => updateFilter('category', c.slug)}
                >{c.name}</button>
              ))}
            </div>
          </div>

          <div className="pp-layout">

            {/* Desktop sidebar */}
            <aside className="pp-sidebar">
              <div className="pp-sidebar-sticky">
                <div className="pp-sidebar-inner">
                  <p className="pp-sidebar-title">Filters</p>
                  <ProductFilters
                    category={category} sort={sort}
                    minPrice={minPrice} maxPrice={maxPrice}
                    onFilterChange={updateFilter}
                  />
                </div>
              </div>
            </aside>

            {/* Mobile drawer */}
            {filtersOpen && (
              <div className="pp-drawer-overlay">
                <div className="pp-drawer-bg" onClick={() => setFiltersOpen(false)} />
                <div className="pp-drawer">
                  <div className="pp-drawer-header">
                    <h2>Filters</h2>
                    <button className="pp-drawer-close" onClick={() => setFiltersOpen(false)}>
                      <X size={18} />
                    </button>
                  </div>
                  <ProductFilters
                    category={category} sort={sort}
                    minPrice={minPrice} maxPrice={maxPrice}
                    onFilterChange={(key, value) => {
                      updateFilter(key, value)
                      setFiltersOpen(false)
                    }}
                  />
                </div>
              </div>
            )}

            {/* Main content */}
            <main className="pp-main">
              {error ? (
                <div className="pp-error">
                  <div className="pp-error-icon"><Package size={30} /></div>
                  <h3>Something went wrong</h3>
                  <p>{error}</p>
                </div>
              ) : (
                <>
                  <ProductGrid products={products} loading={loading} />
                  {totalPages > 1 && (
                    <div className="pp-pagination">
                      <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(p) => updateFilter('page', String(p))}
                      />
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  )
}

function PPStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

      :root {
        --pp-bg:       #faf9f7;
        --pp-surface:  #ffffff;
        --pp-border:   #ece9e3;
        --pp-text:     #18160f;
        --pp-text2:    #6b6257;
        --pp-text3:    #a8a098;
        --pp-accent:   #e8643a;
        --pp-accent2:  #c94e22;
        --pp-accentl:  rgba(232,100,58,0.1);
        --pp-accentb:  rgba(232,100,58,0.22);
        --pp-radius:   14px;
        --ff-head:     'Syne', sans-serif;
        --ff-body:     'DM Sans', sans-serif;
        --nav-h:       64px;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --pp-bg:      #0e0d0b;
          --pp-surface: #171512;
          --pp-border:  #2a2620;
          --pp-text:    #f0ebe3;
          --pp-text2:   #948880;
          --pp-text3:   #5a5248;
          --pp-accentl: rgba(232,100,58,0.12);
          --pp-accentb: rgba(232,100,58,0.2);
        }
      }

      /* ── Root — offset by navbar height ── */
      .pp-root {
        min-height: 100vh;
        background: var(--pp-bg);
        font-family: var(--ff-body);
        opacity: 0;
        transition: opacity 0.35s ease;
        padding-top: var(--nav-h);
      }
      .pp-root--in { opacity: 1; }

      /* ── Hero ── */
      .pp-hero {
        position: relative;
        overflow: hidden;
        padding: 48px 24px 44px;
        background: linear-gradient(140deg, #1a1208 0%, #2d1f0e 40%, #3b1a06 100%);
      }
      @media (max-width: 639px) {
        .pp-hero { padding: 32px 16px 28px; }
      }
      .pp-hero-grain {
        position: absolute; inset: 0; z-index: 1; pointer-events: none; opacity: 0.4;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
        background-size: 200px;
      }
      .pp-hero-blob {
        position: absolute; border-radius: 50%;
        pointer-events: none; filter: blur(64px); z-index: 1;
      }
      .pp-hero-blob-tl {
        top: -80px; left: -60px; width: 280px; height: 280px;
        background: rgba(232,100,58,0.15);
        animation: ppFloat 9s ease-in-out infinite;
      }
      .pp-hero-blob-br {
        bottom: -100px; right: -80px; width: 360px; height: 360px;
        background: rgba(180,60,10,0.12);
        animation: ppFloat 11s ease-in-out infinite reverse;
      }
      .pp-hero-inner {
        position: relative; z-index: 2;
        max-width: 1200px; margin: 0 auto;
        animation: ppSlideUp 0.65s cubic-bezier(0.22,1,0.36,1) both;
      }
      .pp-hero-tag {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 4px 12px; border-radius: 20px;
        background: rgba(232,100,58,0.18);
        border: 1px solid rgba(232,100,58,0.3);
        color: #f0956a;
        font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
        margin-bottom: 14px;
        text-transform: uppercase;
      }
      .pp-hero-title {
        font-family: var(--ff-head);
        font-size: clamp(22px, 5vw, 42px);
        font-weight: 800; color: #f5ede2;
        letter-spacing: -0.03em; margin: 0 0 10px;
        line-height: 1.1;
      }
      .pp-hero-sub {
        font-size: 14px; color: rgba(200,185,165,0.8); margin: 0;
      }

      /* ── Body ── */
      .pp-body {
        max-width: 1200px; margin: 0 auto;
        padding: 24px 16px 80px;
        box-sizing: border-box;
      }
      @media (min-width: 768px) { .pp-body { padding: 32px 24px 80px; } }

      /* ── Mobile bar ── */
      .pp-mobile-bar {
        display: flex; align-items: center; gap: 10px;
        margin-bottom: 16px; overflow: hidden;
      }
      @media (min-width: 1024px) { .pp-mobile-bar { display: none; } }

      .pp-filter-btn {
        display: inline-flex; align-items: center; gap: 7px;
        flex-shrink: 0;
        padding: 9px 14px; border-radius: 10px;
        border: 1.5px solid var(--pp-border);
        background: var(--pp-surface);
        color: var(--pp-text2);
        font-family: var(--ff-body); font-size: 13px; font-weight: 600;
        cursor: pointer; transition: all 0.18s;
      }
      .pp-filter-btn:hover { border-color: var(--pp-accent); color: var(--pp-accent); }
      .pp-filter-count {
        width: 18px; height: 18px; border-radius: 50%;
        background: var(--pp-accent); color: #fff;
        font-size: 10px; font-weight: 800;
        display: flex; align-items: center; justify-content: center;
      }

      /* Category pills */
      .pp-cat-pills {
        display: flex; gap: 7px;
        overflow-x: auto; flex: 1;
        scrollbar-width: none; -ms-overflow-style: none;
        padding-bottom: 2px;
      }
      .pp-cat-pills::-webkit-scrollbar { display: none; }
      .pp-cat-pill {
        flex-shrink: 0;
        padding: 7px 13px; border-radius: 20px;
        border: 1.5px solid var(--pp-border);
        background: var(--pp-surface);
        color: var(--pp-text2);
        font-family: var(--ff-body); font-size: 12px; font-weight: 600;
        cursor: pointer; white-space: nowrap;
        transition: all 0.18s;
      }
      .pp-cat-pill:hover { border-color: var(--pp-accent); color: var(--pp-accent); }
      .pp-cat-pill--active {
        background: var(--pp-accent); border-color: var(--pp-accent);
        color: #fff;
        box-shadow: 0 3px 10px var(--pp-accentb);
      }

      /* ── Layout ── */
      .pp-layout { display: flex; gap: 28px; align-items: flex-start; }

      /* ── Sidebar ── */
      .pp-sidebar { display: none; width: 248px; flex-shrink: 0; }
      @media (min-width: 1024px) { .pp-sidebar { display: block; } }
      .pp-sidebar-sticky { position: sticky; top: calc(var(--nav-h) + 16px); }
      .pp-sidebar-inner {
        background: var(--pp-surface);
        border: 1.5px solid var(--pp-border);
        border-radius: 18px; padding: 22px;
        animation: ppSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both;
      }
      .pp-sidebar-title {
        font-family: var(--ff-head);
        font-size: 11px; font-weight: 800; color: var(--pp-text3);
        letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 18px;
      }

      /* ── Drawer ── */
      .pp-drawer-overlay { position: fixed; inset: 0; z-index: 150; }
      .pp-drawer-bg {
        position: absolute; inset: 0;
        background: rgba(0,0,0,0.55); backdrop-filter: blur(5px);
        animation: ppFadeIn 0.22s ease both;
      }
      .pp-drawer {
        position: absolute; left: 0; top: 0;
        height: 100%; width: 290px; max-width: 88vw;
        background: var(--pp-bg);
        border-right: 1.5px solid var(--pp-border);
        padding: 24px 20px; overflow-y: auto; box-sizing: border-box;
        box-shadow: 6px 0 40px rgba(0,0,0,0.18);
        animation: ppSlideInLeft 0.28s cubic-bezier(0.22,1,0.36,1) both;
      }
      .pp-drawer-header {
        display: flex; align-items: center;
        justify-content: space-between; margin-bottom: 24px;
      }
      .pp-drawer-header h2 {
        font-family: var(--ff-head);
        font-size: 16px; font-weight: 800; color: var(--pp-text); margin: 0;
      }
      .pp-drawer-close {
        width: 32px; height: 32px; border-radius: 9px;
        border: 1.5px solid var(--pp-border); background: var(--pp-surface);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: var(--pp-text2); transition: all 0.15s;
      }
      .pp-drawer-close:hover {
        background: var(--pp-accent); color: #fff; border-color: var(--pp-accent);
      }

      /* ── Main ── */
      .pp-main {
        flex: 1; min-width: 0;
        animation: ppSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.15s both;
      }

      /* ── Mobile product grid — 2 columns, no card hacks ── */
      @media (max-width: 639px) {
        .pg-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 10px !important;
        }
      }

      /* ── Error ── */
      .pp-error {
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        padding: 80px 24px; text-align: center;
        background: var(--pp-surface);
        border: 1.5px solid var(--pp-border);
        border-radius: 20px;
      }
      .pp-error-icon {
        width: 64px; height: 64px; border-radius: 18px;
        background: var(--pp-bg); border: 1.5px solid var(--pp-border);
        display: flex; align-items: center; justify-content: center;
        color: var(--pp-text3); margin-bottom: 16px;
        animation: ppPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
      }
      .pp-error h3 {
        font-family: var(--ff-head); font-size: 17px; font-weight: 800;
        color: var(--pp-text); letter-spacing: -0.02em; margin: 0 0 8px;
      }
      .pp-error p { font-size: 13px; color: var(--pp-text2); margin: 0; }

      .pp-pagination {
        margin-top: 36px;
        animation: ppSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.25s both;
      }

      /* ── Keyframes ── */
      @keyframes ppSlideUp {
        from { opacity: 0; transform: translateY(18px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes ppSlideInLeft {
        from { opacity: 0; transform: translateX(-20px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes ppFadeIn {
        from { opacity: 0; } to { opacity: 1; }
      }
      @keyframes ppFloat {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-18px); }
      }
      @keyframes ppPop {
        from { opacity: 0; transform: scale(0.6); }
        to   { opacity: 1; transform: scale(1); }
      }
    `}</style>
  )
}