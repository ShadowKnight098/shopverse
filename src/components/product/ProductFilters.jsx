import { RotateCcw } from 'lucide-react';
import { CATEGORIES } from '../../lib/constants.js';
import { formatPrice } from '../../utils/formatters';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'top_rated',  label: 'Top Rated' },
];

/**
 * Props (flat, matching ProductsPage usage):
 *   category      — comma-separated slug string, e.g. "electronics,fashion"
 *   sort          — sort value string
 *   minPrice      — string | number
 *   maxPrice      — string | number
 *   onFilterChange(key, value)  — called with a single key + value
 */
export default function ProductFilters({
  category   = '',
  sort       = '',
  minPrice   = '',
  maxPrice   = '',
  onFilterChange,
  categories = CATEGORIES,
}) {
  const selectedCategories = category
    ? category.split(',').filter(Boolean)
    : [];

  const handleCategoryChange = (slug) => {
    const updated = selectedCategories.includes(slug)
      ? selectedCategories.filter((c) => c !== slug)
      : [...selectedCategories, slug];
    onFilterChange('category', updated.join(','));
  };

  const handleClearAll = () => {
    onFilterChange('category', '');
    onFilterChange('sort', '');
    onFilterChange('minPrice', '');
    onFilterChange('maxPrice', '');
  };

  return (
    <>
      <PFStyles />
      <div className="pf-content">

        {/* Header */}
        <div className="pf-content-header">
          <span className="pf-content-title">Filters</span>
          <button className="pf-clear-btn" onClick={handleClearAll}>
            <RotateCcw size={11} />
            Clear all
          </button>
        </div>

        <div className="pf-divider" />

        {/* Categories */}
        <div className="pf-section">
          <p className="pf-section-label">Categories</p>
          <div className="pf-cat-list">
            {categories.map((cat) => {
              const checked = selectedCategories.includes(cat.slug);
              return (
                <label
                  key={cat.id ?? cat.slug}
                  className={`pf-cat-row${checked ? ' pf-cat-row--active' : ''}`}
                >
                  <span className={`pf-checkbox${checked ? ' pf-checkbox--checked' : ''}`}>
                    {checked && (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
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
              { key: 'minPrice', label: 'Min', value: minPrice || 0 },
              { key: 'maxPrice', label: 'Max', value: maxPrice || 100000 },
            ].map(({ key, label, value }) => (
              <div key={key} className="pf-price-row">
                <div className="pf-price-meta">
                  <span className="pf-price-label">{label}</span>
                  <span className="pf-price-val">{formatPrice(Number(value))}</span>
                </div>
                <input
                  type="range" min={0} max={100000} step={500}
                  value={Number(value)}
                  onChange={(e) => onFilterChange(key, e.target.value)}
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
              value={sort || 'newest'}
              onChange={(e) => onFilterChange('sort', e.target.value)}
              className="pf-select"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <svg className="pf-select-chevron" width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

      </div>
    </>
  );
}

function PFStyles() {
  return (
    <style>{`
      /* ── Inherits warm theme tokens from ProductsPage (PPStyles) ── */

      .pf-content { padding: 0; }

      .pf-content-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0;
      }
      .pf-content-title {
        font-family: var(--ff-head, 'Syne', sans-serif);
        font-size: 11px;
        font-weight: 800;
        color: var(--pp-text3);
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }
      .pf-clear-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        font-weight: 700;
        color: var(--pp-accent);
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        font-family: var(--ff-body, 'DM Sans', sans-serif);
        transition: opacity 0.18s;
      }
      .pf-clear-btn:hover { opacity: 0.7; }

      .pf-divider {
        height: 1px;
        background: var(--pp-border);
        margin: 16px 0;
      }

      .pf-section { margin-bottom: 0; }

      .pf-section-label {
        font-family: var(--ff-body, 'DM Sans', sans-serif);
        font-size: 11px;
        font-weight: 700;
        color: var(--pp-text3);
        letter-spacing: 0.07em;
        text-transform: uppercase;
        margin: 0 0 10px;
      }

      /* ── Category rows ── */
      .pf-cat-list { display: flex; flex-direction: column; gap: 2px; }

      .pf-cat-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 7px 8px;
        border-radius: 10px;
        cursor: pointer;
        transition: background 0.15s;
        border: 1.5px solid transparent;
        user-select: none;
      }
      .pf-cat-row:hover { background: var(--pp-bg); }
      .pf-cat-row--active {
        background: var(--pp-accentl);
        border-color: var(--pp-accentb);
      }

      .pf-checkbox {
        width: 17px;
        height: 17px;
        border-radius: 5px;
        border: 1.5px solid var(--pp-border);
        background: var(--pp-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: background 0.15s, border-color 0.15s, transform 0.15s;
      }
      .pf-checkbox--checked {
        background: var(--pp-accent);
        border-color: var(--pp-accent);
        transform: scale(1.08);
        box-shadow: 0 0 0 3px var(--pp-accentl);
      }

      .pf-cat-name {
        font-size: 13px;
        color: var(--pp-text2);
        transition: color 0.15s;
        font-family: var(--ff-body, 'DM Sans', sans-serif);
      }
      .pf-cat-row:hover .pf-cat-name,
      .pf-cat-row--active .pf-cat-name {
        color: var(--pp-text);
      }

      /* ── Price range ── */
      .pf-price-rows { display: flex; flex-direction: column; gap: 14px; }

      .pf-price-meta {
        display: flex;
        justify-content: space-between;
        margin-bottom: 7px;
      }
      .pf-price-label {
        font-size: 12px;
        color: var(--pp-text3);
        font-weight: 600;
        font-family: var(--ff-body, 'DM Sans', sans-serif);
      }
      .pf-price-val {
        font-size: 12px;
        color: var(--pp-accent);
        font-weight: 700;
        font-family: var(--ff-body, 'DM Sans', sans-serif);
      }

      .pf-range {
        width: 100%;
        -webkit-appearance: none;
        appearance: none;
        height: 4px;
        border-radius: 99px;
        background: var(--pp-border);
        outline: none;
        cursor: pointer;
      }
      .pf-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--pp-accent);
        border: 2.5px solid var(--pp-surface);
        box-shadow: 0 2px 8px var(--pp-accentb);
        cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s;
      }
      .pf-range::-webkit-slider-thumb:hover {
        transform: scale(1.2);
        box-shadow: 0 4px 14px var(--pp-accentb);
      }
      .pf-range::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--pp-accent);
        border: 2.5px solid var(--pp-surface);
        box-shadow: 0 2px 8px var(--pp-accentb);
        cursor: pointer;
      }

      /* ── Sort select ── */
      .pf-select-wrap { position: relative; }

      .pf-select {
        width: 100%;
        padding: 10px 36px 10px 13px;
        border-radius: 11px;
        border: 1.5px solid var(--pp-border);
        background: var(--pp-bg);
        color: var(--pp-text);
        font-size: 13px;
        font-weight: 600;
        font-family: var(--ff-body, 'DM Sans', sans-serif);
        outline: none;
        -webkit-appearance: none;
        appearance: none;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
      }
      .pf-select:focus {
        border-color: var(--pp-accent);
        box-shadow: 0 0 0 3px var(--pp-accentl);
      }
      .pf-select-chevron {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--pp-text3);
        pointer-events: none;
      }
    `}</style>
  );
}