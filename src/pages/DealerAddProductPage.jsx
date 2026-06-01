import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Package, DollarSign, BarChart2, Tag, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../stores/useAuthStore';
import { supabase } from '../lib/supabase.js';
import { CATEGORIES } from '../lib/constants.js';
import ImageUpload from '../components/common/ImageUpload';

const EMPTY = {
  name: '', description: '', price: '', category: '',
  stock: '', image_url: '', is_featured: false, is_trending: false,
};

export default function DealerAddProductPage() {
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Add Product — ShopVerse';
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const set      = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setImg   = (url) => setForm((f) => ({ ...f, image_url: url }));
  const setCheck = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())                    e.name     = 'Product name is required';
    if (!form.price || parseFloat(form.price) <= 0) e.price = 'Enter a valid price';
    if (!form.category)                       e.category = 'Please select a category';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const { error } = await supabase.from('products').insert({
      name:        form.name.trim(),
      description: form.description.trim(),
      price:       parseFloat(form.price),
      category:    form.category,
      stock:       parseInt(form.stock) || 0,
      image_url:   form.image_url,
      is_featured: form.is_featured,
      is_trending: form.is_trending,
      dealer_id:   user.id,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Product added successfully! 🎉');
    navigate('/dealer/products');
  };

  return (
    <>
      <DAPStyles />
      <div className={`dap-root ${mounted ? 'dap-root--visible' : ''}`}>

        {/* ── Page header ── */}
        <div className="dap-page-header">
          <button
            onClick={() => navigate('/dealer/products')}
            className="dap-back-btn"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="dap-page-title">Add New Product</h1>
            <p className="dap-page-sub">Fills in details below — your product goes live after admin review.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="dap-form">

          {/* ── Image upload ── */}
          <div className="dap-card" style={{ animationDelay: '0.05s' }}>
            <div className="dap-card-header">
              <div className="dap-card-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                <Package size={16} />
              </div>
              <h2 className="dap-card-title">Product Image</h2>
            </div>
            <ImageUpload value={form.image_url} onChange={setImg} label="" />
          </div>

          {/* ── Basic info ── */}
          <div className="dap-card" style={{ animationDelay: '0.1s' }}>
            <div className="dap-card-header">
              <div className="dap-card-icon" style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80' }}>
                <Layers size={16} />
              </div>
              <h2 className="dap-card-title">Basic Information</h2>
            </div>

            <div className="dap-field">
              <label className="dap-label">
                Product Name <span className="dap-required">*</span>
              </label>
              <div className="dap-input-wrap">
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="e.g. Wireless Bluetooth Headphones"
                  className={`dap-input ${errors.name ? 'dap-input--error' : ''}`}
                />
              </div>
              {errors.name && <p className="dap-field-error">{errors.name}</p>}
            </div>

            <div className="dap-field">
              <label className="dap-label">Description</label>
              <textarea
                value={form.description}
                onChange={set('description')}
                placeholder="Describe your product in detail — what makes it special?"
                rows={4}
                className="dap-input dap-textarea"
              />
            </div>

            <div className="dap-grid-2">
              <div className="dap-field">
                <label className="dap-label">
                  Price (₹) <span className="dap-required">*</span>
                </label>
                <div className="dap-input-wrap dap-input-prefix-wrap">
                  <span className="dap-input-prefix">
                    <DollarSign size={14} />
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={set('price')}
                    placeholder="1999"
                    className={`dap-input dap-input--prefix ${errors.price ? 'dap-input--error' : ''}`}
                  />
                </div>
                {errors.price && <p className="dap-field-error">{errors.price}</p>}
              </div>

              <div className="dap-field">
                <label className="dap-label">Stock Quantity</label>
                <div className="dap-input-wrap dap-input-prefix-wrap">
                  <span className="dap-input-prefix">
                    <BarChart2 size={14} />
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={set('stock')}
                    placeholder="100"
                    className="dap-input dap-input--prefix"
                  />
                </div>
              </div>
            </div>

            <div className="dap-field">
              <label className="dap-label">
                Category <span className="dap-required">*</span>
              </label>
              <div className="dap-input-wrap dap-input-prefix-wrap">
                <span className="dap-input-prefix">
                  <Tag size={14} />
                </span>
                <select
                  value={form.category}
                  onChange={set('category')}
                  className={`dap-input dap-select dap-input--prefix ${errors.category ? 'dap-input--error' : ''}`}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              {errors.category && <p className="dap-field-error">{errors.category}</p>}
            </div>
          </div>

          {/* ── Visibility ── */}
          <div className="dap-card" style={{ animationDelay: '0.15s' }}>
            <div className="dap-card-header">
              <div className="dap-card-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}>
                <BarChart2 size={16} />
              </div>
              <h2 className="dap-card-title">Visibility Options</h2>
            </div>
            <div className="dap-toggle-list">
              {[
                { key: 'is_featured', label: 'Featured Product',  desc: 'Shown on the homepage featured section' },
                { key: 'is_trending', label: 'Trending Product',  desc: 'Shown in the trending section' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="dap-toggle-item">
                  <div className="dap-toggle-text">
                    <p className="dap-toggle-label">{label}</p>
                    <p className="dap-toggle-desc">{desc}</p>
                  </div>
                  <div className={`dap-switch ${form[key] ? 'dap-switch--on' : ''}`}>
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={setCheck(key)}
                      className="dap-switch-input"
                    />
                    <span className="dap-switch-thumb" />
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="dap-actions" style={{ animationDelay: '0.2s' }}>
            <button
              type="submit"
              disabled={saving}
              className="dap-btn-primary"
            >
              {saving ? (
                <>
                  <span className="dap-spinner" />
                  Saving product...
                </>
              ) : (
                <>
                  <Save size={15} />
                  Add Product
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dealer/products')}
              className="dap-btn-ghost"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </>
  );
}

function DAPStyles() {
  return (
    <style>{`
      :root {
        --dap-bg:        #ffffff;
        --dap-surface:   #f8f7f5;
        --dap-border:    #ece9e4;
        --dap-text:      #1a1714;
        --dap-text2:     #5c5650;
        --dap-text3:     #9c9690;
        --dap-accent:    #6366f1;
        --dap-accent2:   #4f46e5;
        --dap-accentl:   rgba(99,102,241,0.1);
        --dap-red:       #ef4444;
        --dap-redl:      rgba(239,68,68,0.08);
        --dap-redborder: rgba(239,68,68,0.3);
        --dap-radius:    14px;
        --dap-card-r:    18px;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --dap-bg:        #0f0e0c;
          --dap-surface:   #1a1917;
          --dap-border:    #2d2b27;
          --dap-text:      #f2ede8;
          --dap-text2:     #a09890;
          --dap-text3:     #6b6460;
          --dap-accentl:   rgba(99,102,241,0.14);
          --dap-redl:      rgba(239,68,68,0.12);
        }
      }

      /* ── Root ── */
      .dap-root {
        max-width: 720px;
        padding: 0 0 48px;
        opacity: 0;
        transform: translateY(14px);
        transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1);
      }
      .dap-root--visible {
        opacity: 1;
        transform: translateY(0);
      }

      /* ── Page header ── */
      .dap-page-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 28px;
      }
      .dap-back-btn {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        background: var(--dap-surface);
        border: 1px solid var(--dap-border);
        color: var(--dap-text2);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: background 0.15s, color 0.15s, transform 0.15s;
      }
      .dap-back-btn:hover {
        background: var(--dap-border);
        color: var(--dap-text);
        transform: translateX(-2px);
      }
      .dap-page-title {
        font-size: 22px;
        font-weight: 800;
        color: var(--dap-text);
        margin: 0 0 4px;
        letter-spacing: -0.03em;
      }
      .dap-page-sub {
        font-size: 13px;
        color: var(--dap-text3);
        margin: 0;
      }

      /* ── Form ── */
      .dap-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      /* ── Card ── */
      .dap-card {
        background: var(--dap-bg);
        border: 1px solid var(--dap-border);
        border-radius: var(--dap-card-r);
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 18px;
        animation: dapSlideUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
      }
      .dap-card-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 2px;
      }
      .dap-card-icon {
        width: 30px;
        height: 30px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .dap-card-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--dap-text);
        margin: 0;
        letter-spacing: -0.01em;
      }

      /* ── Fields ── */
      .dap-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .dap-label {
        font-size: 12px;
        font-weight: 700;
        color: var(--dap-text2);
        letter-spacing: 0.02em;
      }
      .dap-required { color: var(--dap-red); }

      .dap-input-wrap { position: relative; }
      .dap-input-prefix-wrap { display: flex; align-items: center; position: relative; }
      .dap-input-prefix {
        position: absolute;
        left: 13px;
        color: var(--dap-text3);
        pointer-events: none;
        display: flex;
        align-items: center;
        z-index: 1;
      }

      .dap-input {
        width: 100%;
        padding: 11px 14px;
        border-radius: var(--dap-radius);
        border: 1.5px solid var(--dap-border);
        background: var(--dap-surface);
        color: var(--dap-text);
        font-size: 13.5px;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        box-sizing: border-box;
      }
      .dap-input::placeholder { color: var(--dap-text3); }
      .dap-input:focus {
        border-color: var(--dap-accent);
        box-shadow: 0 0 0 3px var(--dap-accentl);
        background: var(--dap-bg);
      }
      .dap-input--prefix { padding-left: 38px; }
      .dap-input--error {
        border-color: var(--dap-red);
        box-shadow: 0 0 0 3px var(--dap-redl);
      }
      .dap-textarea {
        resize: vertical;
        min-height: 100px;
        line-height: 1.6;
      }
      .dap-select { cursor: pointer; appearance: auto; }

      .dap-field-error {
        font-size: 11.5px;
        color: var(--dap-red);
        margin: 0;
        animation: dapFadeIn 0.2s ease both;
      }

      /* ── 2-col grid ── */
      .dap-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      @media (max-width: 520px) {
        .dap-grid-2 { grid-template-columns: 1fr; }
      }

      /* ── Toggle list ── */
      .dap-toggle-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .dap-toggle-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 14px 16px;
        border-radius: var(--dap-radius);
        border: 1.5px solid var(--dap-border);
        background: var(--dap-surface);
        cursor: pointer;
        transition: border-color 0.2s, background 0.2s;
      }
      .dap-toggle-item:hover {
        border-color: var(--dap-accent);
        background: var(--dap-bg);
      }
      .dap-toggle-text { flex: 1; min-width: 0; }
      .dap-toggle-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--dap-text);
        margin: 0 0 2px;
      }
      .dap-toggle-desc {
        font-size: 12px;
        color: var(--dap-text3);
        margin: 0;
      }

      /* ── Toggle switch ── */
      .dap-switch {
        position: relative;
        width: 40px;
        height: 22px;
        border-radius: 999px;
        background: var(--dap-border);
        flex-shrink: 0;
        transition: background 0.2s;
        cursor: pointer;
      }
      .dap-switch--on { background: var(--dap-accent); }
      .dap-switch-input {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
      }
      .dap-switch-thumb {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: white;
        transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      }
      .dap-switch--on .dap-switch-thumb {
        transform: translateX(18px);
      }

      /* ── Actions ── */
      .dap-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-top: 4px;
        animation: dapSlideUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
      }
      .dap-btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 13px 28px;
        border-radius: var(--dap-radius);
        background: var(--dap-accent);
        color: #fff;
        font-size: 14px;
        font-weight: 700;
        font-family: inherit;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(99,102,241,0.3);
        transition: background 0.2s, transform 0.15s, opacity 0.2s;
        letter-spacing: -0.01em;
      }
      .dap-btn-primary:hover:not(:disabled) {
        background: var(--dap-accent2);
        transform: translateY(-1px);
      }
      .dap-btn-primary:active:not(:disabled) { transform: scale(0.98); }
      .dap-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

      .dap-btn-ghost {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 13px 22px;
        border-radius: var(--dap-radius);
        background: none;
        color: var(--dap-text2);
        font-size: 14px;
        font-weight: 600;
        font-family: inherit;
        border: 1.5px solid var(--dap-border);
        cursor: pointer;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
      }
      .dap-btn-ghost:hover {
        background: var(--dap-surface);
        color: var(--dap-text);
        border-color: var(--dap-text3);
      }

      /* ── Spinner ── */
      .dap-spinner {
        width: 15px;
        height: 15px;
        border: 2.5px solid rgba(255,255,255,0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: dapSpin 0.7s linear infinite;
        flex-shrink: 0;
      }

      /* ── Keyframes ── */
      @keyframes dapFadeIn {
        from { opacity: 0; transform: translateY(-4px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes dapSlideUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes dapSpin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  );
}