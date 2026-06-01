import { useState } from 'react';
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { CATEGORIES } from '../../lib/constants.js';
import { formatPrice } from '../../utils/formatters';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'top_rated',  label: 'Top Rated' },
];

export default function ProductFilters({
  filters = {},
  onFilterChange,
  categories = CATEGORIES,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryChange = (slug) => {
    const current = filters.category ? filters.category.split(',').filter(Boolean) : [];
    const updated = current.includes(slug)
      ? current.filter((c) => c !== slug)
      : [...current, slug];
    onFilterChange({ ...filters, category: updated.join(',') });
  };

  const handlePriceChange   = (key, value) => onFilterChange({ ...filters, [key]: Number(value) });
  const handleSortChange    = (value)       => onFilterChange({ ...filters, sort: value });
  const handleClearAll      = ()            => onFilterChange({ category: '', minPrice: 0, maxPrice: 100000, sort: 'newest' });

  const selectedCategories = filters.category
    ? filters.category.split(',').filter(Boolean)
    : [];

  const filterContent = (
    <div className="pf-content">

      {/* Header */}
      <div className="pf-content-header">
        <span className="pf-content-title">Filters</span>
        <button className="pf-clear-btn" onClick={handleClearAll}>
          <RotateCcw size={12} />
          Clear all
        </button>
      </div>

      {/* Divider */}
      <div className="pf-divider" />

      {/* Categories */}
      <div className="pf-section">
        <p className="pf-section-label">Categories</p>
        <div className="pf-cat-list">
          {categories.map((cat) => {
            const checked = selectedCategories.includes(cat.slug);
            return (
              <label key={cat.id} className={`pf-cat-row${checked ? ' pf-cat-row-active' : ''}`}>
                <span className={`pf-checkbox${checked ? ' pf-checkbox-checked' : ''}`}>
                  {checked && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCategoryChange(cat.slug)}
                  style={{ display: 'none' }}
                />
                <span className="pf-cat-name">{cat.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="pf-divider" />

      {/* Price Range */}
      <div className="pf-section">
        <p className="pf-section-label">Price Range</p>
        <div className="pf-price-rows">
          {[
            { key: 'minPrice', label: 'Min', value: filters.minPrice || 0 },
            { key: 'maxPrice', label: 'Max', value: filters.maxPrice || 100000 },
          ].map(({ key, label, value }) => (
            <div key={key} className="pf-price-row">
              <div className="pf-price-meta">
                <span className="pf-price-label">{label}</span>
                <span className="pf-price-val">{formatPrice(value)}</span>
              </div>
              <input
                type="range" min={0} max={100000} step={500}
                value={value}
                onChange={(e) => handlePriceChange(key, e.target.value)}
                className="pf-range"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pf-divider" />

      {/* Sort */}
      <div className="pf-section">
        <p className="pf-section-label">Sort By</p>
        <div className="pf-select-wrap">
          <select
            value={filters.sort || 'newest'}
            onChange={(e) => handleSortChange(e.target.value)}
            className="pf-select"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <svg className="pf-select-chevron" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

    </div>
  );

  return (
    <>
      <style>{`
        :root {
          --pf-bg:      #ffffff;
          --pf-surface: #f9fafb;
          --pf-border:  #e5e7eb;
          --pf-text:    #111827;
          --pf-text2:   #6b7280;
          --pf-text3:   #9ca3af;
          --pf-accent:  #4f46e5;
          --pf-accent2: #4338ca;
          --pf-accentl: rgba(79,70,229,0.13);
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --pf-bg:      #0f172a;
            --pf-surface: #1e293b;
            --pf-border:  #334155;
            --pf-text:    #f9fafb;
            --pf-text2:   #94a3b8;
            --pf-text3:   #64748b;
            --pf-accentl: rgba(99,102,241,0.18);
          }
        }

        /* ── FAB ── */
        .pf-fab {
          display: none;
        }
        @media (max-width: 1023px) {
          .pf-fab {
            display: flex;
            position: fixed; bottom: 24px; right: 24px; z-index: 40;
            width: 52px; height: 52px;
            background: var(--pf-accent);
            border: none; border-radius: 16px; cursor: pointer;
            align-items: center; justify-content: center; color: white;
            box-shadow: 0 6px 20px rgba(79,70,229,0.38);
            transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
            animation: pfPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
          }
          .pf-fab:hover {
            background: var(--pf-accent2);
            transform: translateY(-2px);
            box-shadow: 0 10px 28px rgba(79,70,229,0.45);
          }
          .pf-fab:active { transform: scale(0.95); }
        }

        /* ── Overlay ── */
        .pf-overlay {
          display: none;
        }
        @media (max-width: 1023px) {
          .pf-overlay {
            display: block;
            position: fixed; inset: 0; z-index: 50;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(4px);
            animation: pfFadeIn 0.25s ease both;
          }
        }

        /* ── Drawer ── */
        .pf-drawer {
          position: absolute; right: 0; top: 0;
          height: 100%; width: 300px; max-width: 85vw;
          background: var(--pf-bg);
          border-left: 1.5px solid var(--pf-border);
          padding: 0; overflow-y: auto;
          box-shadow: -4px 0 32px rgba(0,0,0,0.12);
          animation: pfSlideInRight 0.3s cubic-bezier(0.22,1,0.36,1) both;
        }
        .pf-drawer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 20px 16px;
          border-bottom: 1.5px solid var(--pf-border);
          position: sticky; top: 0; background: var(--pf-bg); z-index: 2;
        }
        .pf-drawer-header h2 {
          font-size: 15px; font-weight: 800;
          color: var(--pf-text); letter-spacing: -0.01em; margin: 0;
        }
        .pf-drawer-close {
          width: 32px; height: 32px; border-radius: 10px;
          border: 1.5px solid var(--pf-border);
          background: var(--pf-surface);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--pf-text2);
          transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.15s;
        }
        .pf-drawer-close:hover {
          background: var(--pf-accent); color: white;
          border-color: var(--pf-accent); transform: scale(1.08);
        }

        /* ── Desktop sidebar ── */
        .pf-sidebar {
          display: none;
        }
        @media (min-width: 1024px) {
          .pf-sidebar {
            display: block;
            width: 256px; flex-shrink: 0;
          }
        }
        .pf-sidebar-inner {
          position: sticky; top: 96px;
          background: var(--pf-surface);
          border: 1.5px solid var(--pf-border);
          border-radius: 20px;
          animation: pfSlideUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.15s both;
        }

        /* ── Filter content ── */
        .pf-content { padding: 20px; }

        .pf-content-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 0;
        }
        .pf-content-title {
          font-size: 11px; font-weight: 800;
          color: var(--pf-text); letter-spacing: 0.08em; text-transform: uppercase;
        }
        .pf-clear-btn {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 700;
          color: var(--pf-accent); background: none; border: none;
          cursor: pointer; padding: 0;
          transition: color 0.2s, opacity 0.2s;
          font-family: inherit;
        }
        .pf-clear-btn:hover { color: var(--pf-accent2); opacity: 0.85; }

        .pf-divider {
          height: 1px; background: var(--pf-border);
          margin: 18px 0;
        }

        .pf-section { margin-bottom: 0; }

        .pf-section-label {
          font-size: 11px; font-weight: 700;
          color: var(--pf-text2); letter-spacing: 0.06em;
          text-transform: uppercase; margin: 0 0 12px;
        }

        /* Category rows */
        .pf-cat-list { display: flex; flex-direction: column; gap: 6px; }
        .pf-cat-row {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px; border-radius: 10px;
          cursor: pointer; transition: background 0.15s;
          border: 1.5px solid transparent;
        }
        .pf-cat-row:hover { background: var(--pf-surface); }
        .pf-cat-row-active {
          background: var(--pf-accentl);
          border-color: rgba(79,70,229,0.22);
        }
        .pf-checkbox {
          width: 18px; height: 18px; border-radius: 6px;
          border: 1.5px solid var(--pf-border);
          background: var(--pf-bg);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
        }
        .pf-checkbox-checked {
          background: var(--pf-accent);
          border-color: var(--pf-accent);
          transform: scale(1.08);
          box-shadow: 0 0 0 3px var(--pf-accentl);
        }
        .pf-cat-name {
          font-size: 13px; color: var(--pf-text2);
          transition: color 0.15s;
        }
        .pf-cat-row:hover .pf-cat-name,
        .pf-cat-row-active .pf-cat-name {
          color: var(--pf-text);
        }

        /* Price range */
        .pf-price-rows { display: flex; flex-direction: column; gap: 14px; }
        .pf-price-row {}
        .pf-price-meta {
          display: flex; justify-content: space-between;
          margin-bottom: 6px;
        }
        .pf-price-label {
          font-size: 12px; color: var(--pf-text3); font-weight: 600;
        }
        .pf-price-val {
          font-size: 12px; color: var(--pf-accent); font-weight: 700;
        }
        .pf-range {
          width: 100%;
          -webkit-appearance: none; appearance: none;
          height: 4px; border-radius: 99px;
          background: var(--pf-border); outline: none;
          cursor: pointer;
        }
        .pf-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 18px; height: 18px; border-radius: 50%;
          background: var(--pf-accent);
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(79,70,229,0.35);
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .pf-range::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 14px rgba(79,70,229,0.45);
        }
        .pf-range::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: var(--pf-accent);
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(79,70,229,0.35);
          cursor: pointer;
        }

        /* Select */
        .pf-select-wrap { position: relative; }
        .pf-select {
          width: 100%;
          padding: 10px 36px 10px 14px;
          border-radius: 12px;
          border: 1.5px solid var(--pf-border);
          background: var(--pf-bg);
          color: var(--pf-text);
          font-size: 13px; font-weight: 600; font-family: inherit;
          outline: none;
          -webkit-appearance: none; appearance: none;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .pf-select:focus {
          border-color: var(--pf-accent);
          box-shadow: 0 0 0 3px var(--pf-accentl);
        }
        .pf-select-chevron {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%);
          color: var(--pf-text3); pointer-events: none;
        }

        /* Keyframes */
        @keyframes pfSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pfSlideInRight {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pfFadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes pfPop {
          from { opacity: 0; transform: scale(0.6) rotate(-8deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
      `}</style>

      {/* FAB (mobile) */}
      <button className="pf-fab" onClick={() => setIsOpen(true)} aria-label="Open filters">
        <SlidersHorizontal size={20} />
      </button>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="pf-overlay" onClick={() => setIsOpen(false)}>
          <div className="pf-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="pf-drawer-header">
              <h2>Filters</h2>
              <button className="pf-drawer-close" onClick={() => setIsOpen(false)} aria-label="Close filters">
                <X size={16} />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="pf-sidebar">
        <div className="pf-sidebar-inner">
          {filterContent}
        </div>
      </aside>
    </>
  );
}