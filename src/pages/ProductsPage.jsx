import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, Search, Package } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import ProductFilters from '../components/product/ProductFilters'
import ProductGrid from '../components/product/ProductGrid'
import Pagination from '../components/common/Pagination'
import { CATEGORIES } from '../lib/constants'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen]   = useState(false)

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

  useEffect(() => { document.title = 'Shop Products — ShopVerse' }, [])

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

  return (
    <>
      <style>{`
        :root {
          --pp-bg:        #ffffff;
          --pp-surface:   #f9fafb;
          --pp-border:    #e5e7eb;
          --pp-text:      #111827;
          --pp-text2:     #6b7280;
          --pp-text3:     #9ca3af;
          --pp-accent:    #4f46e5;
          --pp-accent2:   #4338ca;
          --pp-accentl:   rgba(79,70,229,0.13);
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --pp-bg:      #0f172a;
            --pp-surface: #1e293b;
            --pp-border:  #334155;
            --pp-text:    #f9fafb;
            --pp-text2:   #94a3b8;
            --pp-text3:   #64748b;
            --pp-accentl: rgba(99,102,241,0.18);
          }
        }

        .pp-root { min-height: 100vh; background: var(--pp-bg); }

        /* Hero */
        .pp-hero {
          position: relative; overflow: hidden;
          padding: 56px 24px 52px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%);
        }
        .pp-hero-blob {
          position: absolute; border-radius: 50%;
          pointer-events: none; filter: blur(48px);
        }
        .pp-hero-blob-tl {
          top: -60px; left: -60px; width: 240px; height: 240px;
          background: rgba(255,255,255,0.1);
          animation: ppFloat 8s ease-in-out infinite;
        }
        .pp-hero-blob-br {
          bottom: -80px; right: -60px; width: 320px; height: 320px;
          background: rgba(236,72,153,0.18);
          animation: ppFloat 10s ease-in-out infinite reverse;
        }
        .pp-hero-inner {
          position: relative; z-index: 2;
          max-width: 1200px; margin: 0 auto;
          animation: ppSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) both;
        }
        .pp-hero h1 {
          font-size: 32px; font-weight: 800; color: white;
          letter-spacing: -0.03em; margin: 0 0 8px;
        }
        @media (min-width: 1024px) { .pp-hero h1 { font-size: 40px; } }
        .pp-hero-sub { font-size: 14px; color: rgba(199,210,254,0.9); margin: 0; }

        /* Body */
        .pp-body {
          max-width: 1200px; margin: 0 auto;
          padding: 32px 24px 80px; box-sizing: border-box;
        }

        /* Mobile filter button */
        .pp-filter-btn {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 24px; padding: 10px 18px;
          border-radius: 12px;
          background: var(--pp-accentl);
          border: 1.5px solid var(--pp-border);
          color: var(--pp-accent);
          font-size: 13px; font-weight: 700; font-family: inherit;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          animation: ppSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both;
        }
        .pp-filter-btn:hover {
          background: var(--pp-accent); color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(79,70,229,0.25);
        }
        @media (min-width: 1024px) { .pp-filter-btn { display: none; } }

        /* Layout */
        .pp-layout { display: flex; gap: 32px; }

        /* Sidebar */
        .pp-sidebar { display: none; width: 256px; flex-shrink: 0; }
        @media (min-width: 1024px) { .pp-sidebar { display: block; } }
        .pp-sidebar-sticky { position: sticky; top: 96px; }
        .pp-sidebar-inner {
          background: var(--pp-surface);
          border: 1.5px solid var(--pp-border);
          border-radius: 20px; padding: 24px;
          animation: ppSlideUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.15s both;
        }
        .pp-sidebar-title {
          font-size: 11px; font-weight: 800; color: var(--pp-text);
          letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 20px;
        }

        /* Drawer */
        .pp-drawer-overlay { position: fixed; inset: 0; z-index: 50; }
        .pp-drawer-bg {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
          animation: ppFadeIn 0.25s ease both;
        }
        .pp-drawer {
          position: absolute; left: 0; top: 0;
          height: 100%; width: 300px; max-width: 85vw;
          background: var(--pp-bg);
          border-right: 1.5px solid var(--pp-border);
          padding: 28px 24px; overflow-y: auto;
          box-shadow: 4px 0 32px rgba(0,0,0,0.15);
          animation: ppSlideInLeft 0.3s cubic-bezier(0.22,1,0.36,1) both;
        }
        .pp-drawer-header {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 28px;
        }
        .pp-drawer-header h2 {
          font-size: 16px; font-weight: 800;
          color: var(--pp-text); letter-spacing: -0.01em; margin: 0;
        }
        .pp-drawer-close {
          width: 34px; height: 34px; border-radius: 10px;
          border: 1.5px solid var(--pp-border);
          background: var(--pp-surface);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--pp-text2);
          transition: background 0.2s, color 0.2s, transform 0.15s;
        }
        .pp-drawer-close:hover {
          background: var(--pp-accent); color: white;
          border-color: var(--pp-accent); transform: scale(1.08);
        }

        /* Main */
        .pp-main {
          flex: 1; min-width: 0;
          animation: ppSlideUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.2s both;
        }

        /* Error */
        .pp-error {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 96px 24px; text-align: center;
          background: var(--pp-surface);
          border: 1.5px solid var(--pp-border);
          border-radius: 24px;
        }
        .pp-error-icon {
          width: 72px; height: 72px;
          background: var(--pp-bg); border: 1.5px solid var(--pp-border);
          border-radius: 22px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          animation: ppPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .pp-error h3 {
          font-size: 18px; font-weight: 800; color: var(--pp-text);
          letter-spacing: -0.02em; margin: 0 0 8px;
        }
        .pp-error p { font-size: 14px; color: var(--pp-text2); margin: 0; }

        .pp-pagination {
          margin-top: 40px;
          animation: ppSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.3s both;
        }

        /* Keyframes */
        @keyframes ppSlideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ppSlideInLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes ppFadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes ppFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-16px); }
        }
        @keyframes ppPop {
          from { opacity: 0; transform: scale(0.6) rotate(-8deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
      `}</style>

      <div className="pp-root">

        {/* Hero */}
        <div className="pp-hero">
          <div className="pp-hero-blob pp-hero-blob-tl" />
          <div className="pp-hero-blob pp-hero-blob-br" />
          <div className="pp-hero-inner">
            <h1>{heading}</h1>
            <p className="pp-hero-sub">
              {loading
                ? 'Searching for the best products…'
                : `Showing ${products.length} product${products.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="pp-body">

          <button className="pp-filter-btn" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal size={16} />
            Filters
          </button>

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

            {/* Main */}
            <main className="pp-main">
              {error ? (
                <div className="pp-error">
                  <div className="pp-error-icon">
                    <Package size={30} color="var(--pp-text3)" />
                  </div>
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