import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Package, DollarSign, BarChart2, Tag, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../stores/useAuthStore';
import { supabase } from '../lib/supabase.js';
import { CATEGORIES } from '../lib/constants.js';
import MultiImageUpload from '../components/common/MultiImageUpload';

export default function DealerEditProductPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm]     = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.title = 'Edit Product — ShopVerse';
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products').select('*').eq('id', id).eq('dealer_id', user.id).single();
      if (error || !data) { toast.error('Product not found'); navigate('/dealer/products'); return; }
      setForm({
        name:        data.name || '',
        description: data.description || '',
        price:       data.price?.toString() || '',
        category:    data.category || '',
        stock:       data.stock?.toString() || '',
        image_url:   data.image_url || '',
        images:      data.images || [],
        is_featured: data.is_featured || false,
        is_trending: data.is_trending || false,
        sizes:       data.sizes || [],
      });
      setLoading(false);
      requestAnimationFrame(() => setMounted(true));
    };
    fetchProduct();
  }, [id, user, navigate]);

  const set      = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setImg   = (url) => setForm((f) => ({ ...f, image_url: url }));
  const setImages = (urls) => setForm((f) => ({ ...f, images: urls }));
  const setCheck = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())                         e.name     = 'Product name is required';
    if (!form.price || parseFloat(form.price) <= 0) e.price   = 'Enter a valid price';
    if (!form.category)                             e.category = 'Please select a category';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const { error } = await supabase.from('products').update({
      name:        form.name.trim(),
      description: form.description.trim(),
      price:       parseFloat(form.price),
      category:    form.category,
      stock:       parseInt(form.stock) || 0,
      image_url:   form.image_url,
      images:      form.images,
      is_featured: form.is_featured,
      is_trending: form.is_trending,
      sizes:       form.category === 'fashion' ? form.sizes : null,
    }).eq('id', id).eq('dealer_id', user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Product updated! ✅');
    navigate('/dealer/products');
  };

  /* ── Loading state ── */
  if (loading) return (
    <>
      <DEPStyles />
      <div className="dep-loader">
        <span className="dep-spinner dep-spinner--dark" />
      </div>
    </>
  );

  return (
    <>
      <DEPStyles />
      <div className={`dep-root ${mounted ? 'dep-root--visible' : ''}`}>

        {/* ── Page header ── */}
        <div className="dep-page-header">
          <button onClick={() => navigate('/dealer/products')} className="dep-back-btn" aria-label="Go back">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="dep-page-title">Edit Product</h1>
            <p className="dep-page-sub">Update your product details below.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="dep-form">

          {/* ── Image ── */}
          <div className="dep-card" style={{ animationDelay: '0.05s' }}>
            <div className="dep-card-header">
              <div className="dep-card-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                <Package size={16} />
              </div>
              <h2 className="dep-card-title">Product Gallery</h2>
            </div>
            <MultiImageUpload
              images={form.images}
              coverImage={form.image_url}
              onImagesChange={setImages}
              onCoverImageChange={setImg}
              label="Upload multiple product images. Star an image to make it the main cover image."
            />
          </div>

          {/* ── Basic info ── */}
          <div className="dep-card" style={{ animationDelay: '0.1s' }}>
            <div className="dep-card-header">
              <div className="dep-card-icon" style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80' }}>
                <Layers size={16} />
              </div>
              <h2 className="dep-card-title">Basic Information</h2>
            </div>

            <div className="dep-field">
              <label className="dep-label">Product Name <span className="dep-required">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="e.g. Wireless Bluetooth Headphones"
                className={`dep-input ${errors.name ? 'dep-input--error' : ''}`}
              />
              {errors.name && <p className="dep-field-error">{errors.name}</p>}
            </div>

            <div className="dep-field">
              <label className="dep-label">Description</label>
              <textarea
                value={form.description}
                onChange={set('description')}
                rows={4}
                placeholder="Describe your product..."
                className="dep-input dep-textarea"
              />
            </div>

            <div className="dep-grid-2">
              <div className="dep-field">
                <label className="dep-label">Price (₹) <span className="dep-required">*</span></label>
                <div className="dep-input-prefix-wrap">
                  <span className="dep-input-prefix"><DollarSign size={14} /></span>
                  <input
                    type="number" min="0" step="0.01"
                    value={form.price}
                    onChange={set('price')}
                    placeholder="1999"
                    className={`dep-input dep-input--prefix ${errors.price ? 'dep-input--error' : ''}`}
                  />
                </div>
                {errors.price && <p className="dep-field-error">{errors.price}</p>}
              </div>

              <div className="dep-field">
                <label className="dep-label">Stock Quantity</label>
                <div className="dep-input-prefix-wrap">
                  <span className="dep-input-prefix"><BarChart2 size={14} /></span>
                  <input
                    type="number" min="0"
                    value={form.stock}
                    onChange={set('stock')}
                    placeholder="100"
                    className="dep-input dep-input--prefix"
                  />
                </div>
              </div>
            </div>

            <div className="dep-field">
              <label className="dep-label">Category <span className="dep-required">*</span></label>
              <div className="dep-input-prefix-wrap">
                <span className="dep-input-prefix"><Tag size={14} /></span>
                <select
                  value={form.category}
                  onChange={set('category')}
                  className={`dep-input dep-select dep-input--prefix ${errors.category ? 'dep-input--error' : ''}`}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              {errors.category && <p className="dep-field-error">{errors.category}</p>}
            </div>

            {form.category === 'fashion' && (
              <div className="dep-field" style={{ marginTop: '12px' }}>
                <label className="dep-label">Available Sizes</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                  {['S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                    const hasSize = form.sizes?.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          const currentSizes = form.sizes || [];
                          const nextSizes = currentSizes.includes(size)
                            ? currentSizes.filter((s) => s !== size)
                            : [...currentSizes, size];
                          setForm((f) => ({ ...f, sizes: nextSizes }));
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontWeight: '600',
                          border: '1.5px solid var(--dep-border)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: hasSize ? 'var(--dep-accent)' : 'var(--dep-surface)',
                          color: hasSize ? '#fff' : 'var(--dep-text2)',
                          borderColor: hasSize ? 'var(--dep-accent)' : 'var(--dep-border)',
                          boxShadow: hasSize ? '0 2px 8px rgba(99,102,241,0.2)' : 'none',
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Visibility ── */}
          <div className="dep-card" style={{ animationDelay: '0.15s' }}>
            <div className="dep-card-header">
              <div className="dep-card-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}>
                <BarChart2 size={16} />
              </div>
              <h2 className="dep-card-title">Visibility Options</h2>
            </div>
            <div className="dep-toggle-list">
              {[
                { key: 'is_featured', label: 'Featured Product', desc: 'Shown on the homepage featured section' },
                { key: 'is_trending', label: 'Trending Product',  desc: 'Shown in the trending section' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="dep-toggle-item">
                  <div className="dep-toggle-text">
                    <p className="dep-toggle-label">{label}</p>
                    <p className="dep-toggle-desc">{desc}</p>
                  </div>
                  <div className={`dep-switch ${form[key] ? 'dep-switch--on' : ''}`}>
                    <input type="checkbox" checked={form[key]} onChange={setCheck(key)} className="dep-switch-input" />
                    <span className="dep-switch-thumb" />
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="dep-actions" style={{ animationDelay: '0.2s' }}>
            <button type="submit" disabled={saving} className="dep-btn-primary">
              {saving ? (
                <><span className="dep-spinner" />Saving...</>
              ) : (
                <><Save size={15} />Save Changes</>
              )}
            </button>
            <button type="button" onClick={() => navigate('/dealer/products')} className="dep-btn-ghost">
              Cancel
            </button>
          </div>

        </form>
      </div>
    </>
  );
}

function DEPStyles() {
  return (
    <style>{`
      :root {
        --dep-bg:        #ffffff;
        --dep-surface:   #f8f7f5;
        --dep-border:    #ece9e4;
        --dep-text:      #1a1714;
        --dep-text2:     #5c5650;
        --dep-text3:     #9c9690;
        --dep-accent:    #6366f1;
        --dep-accent2:   #4f46e5;
        --dep-accentl:   rgba(99,102,241,0.1);
        --dep-red:       #ef4444;
        --dep-redl:      rgba(239,68,68,0.08);
        --dep-redborder: rgba(239,68,68,0.3);
        --dep-radius:    14px;
        --dep-card-r:    18px;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --dep-bg:      #0f0e0c;
          --dep-surface: #1a1917;
          --dep-border:  #2d2b27;
          --dep-text:    #f2ede8;
          --dep-text2:   #a09890;
          --dep-text3:   #6b6460;
          --dep-accentl: rgba(99,102,241,0.14);
          --dep-redl:    rgba(239,68,68,0.12);
        }
      }

      .dep-loader {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 240px;
      }
      .dep-spinner--dark {
        width: 28px; height: 28px;
        border: 3px solid var(--dep-border);
        border-top-color: var(--dep-accent);
        border-radius: 50%;
        animation: depSpin 0.7s linear infinite;
        display: inline-block;
      }

      .dep-root {
        max-width: 720px;
        padding-bottom: 48px;
        opacity: 0;
        transform: translateY(14px);
        transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1);
      }
      .dep-root--visible { opacity: 1; transform: translateY(0); }

      .dep-page-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 28px;
      }
      .dep-back-btn {
        width: 38px; height: 38px;
        border-radius: 12px;
        background: var(--dep-surface);
        border: 1px solid var(--dep-border);
        color: var(--dep-text2);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; flex-shrink: 0;
        transition: background 0.15s, color 0.15s, transform 0.15s;
      }
      .dep-back-btn:hover { background: var(--dep-border); color: var(--dep-text); transform: translateX(-2px); }

      .dep-page-title {
        font-size: 22px; font-weight: 800;
        color: var(--dep-text); margin: 0 0 4px;
        letter-spacing: -0.03em;
      }
      .dep-page-sub { font-size: 13px; color: var(--dep-text3); margin: 0; }

      .dep-form { display: flex; flex-direction: column; gap: 16px; }

      .dep-card {
        background: var(--dep-bg);
        border: 1px solid var(--dep-border);
        border-radius: var(--dep-card-r);
        padding: 24px;
        display: flex; flex-direction: column; gap: 18px;
        animation: depSlideUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
      }
      .dep-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }
      .dep-card-icon {
        width: 30px; height: 30px; border-radius: 9px;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .dep-card-title { font-size: 14px; font-weight: 700; color: var(--dep-text); margin: 0; }

      .dep-field { display: flex; flex-direction: column; gap: 6px; }
      .dep-label { font-size: 12px; font-weight: 700; color: var(--dep-text2); letter-spacing: 0.02em; }
      .dep-required { color: var(--dep-red); }

      .dep-input-prefix-wrap { position: relative; }
      .dep-input-prefix {
        position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
        color: var(--dep-text3); pointer-events: none;
        display: flex; align-items: center; z-index: 1;
      }
      .dep-input {
        width: 100%; padding: 11px 14px;
        border-radius: var(--dep-radius);
        border: 1.5px solid var(--dep-border);
        background: var(--dep-surface);
        color: var(--dep-text);
        font-size: 13.5px; font-family: inherit;
        outline: none; box-sizing: border-box;
        transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      }
      .dep-input::placeholder { color: var(--dep-text3); }
      .dep-input:focus {
        border-color: var(--dep-accent);
        box-shadow: 0 0 0 3px var(--dep-accentl);
        background: var(--dep-bg);
      }
      .dep-input--prefix { padding-left: 38px; }
      .dep-input--error { border-color: var(--dep-red); box-shadow: 0 0 0 3px var(--dep-redl); }
      .dep-textarea { resize: vertical; min-height: 100px; line-height: 1.6; }
      .dep-select { cursor: pointer; appearance: auto; }
      .dep-field-error {
        font-size: 11.5px; color: var(--dep-red); margin: 0;
        animation: depFadeIn 0.2s ease both;
      }

      .dep-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      @media (max-width: 520px) { .dep-grid-2 { grid-template-columns: 1fr; } }

      .dep-toggle-list { display: flex; flex-direction: column; gap: 10px; }
      .dep-toggle-item {
        display: flex; align-items: center; justify-content: space-between; gap: 16px;
        padding: 14px 16px; border-radius: var(--dep-radius);
        border: 1.5px solid var(--dep-border);
        background: var(--dep-surface); cursor: pointer;
        transition: border-color 0.2s, background 0.2s;
      }
      .dep-toggle-item:hover { border-color: var(--dep-accent); background: var(--dep-bg); }
      .dep-toggle-label { font-size: 13px; font-weight: 600; color: var(--dep-text); margin: 0 0 2px; }
      .dep-toggle-desc  { font-size: 12px; color: var(--dep-text3); margin: 0; }

      .dep-switch {
        position: relative; width: 40px; height: 22px;
        border-radius: 999px; background: var(--dep-border);
        flex-shrink: 0; transition: background 0.2s; cursor: pointer;
      }
      .dep-switch--on { background: var(--dep-accent); }
      .dep-switch-input { position: absolute; opacity: 0; width: 0; height: 0; }
      .dep-switch-thumb {
        position: absolute; top: 3px; left: 3px;
        width: 16px; height: 16px; border-radius: 50%;
        background: white;
        transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      }
      .dep-switch--on .dep-switch-thumb { transform: translateX(18px); }

      .dep-actions {
        display: flex; align-items: center; gap: 12px; padding-top: 4px;
        animation: depSlideUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
      }
      .dep-btn-primary {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 13px 28px; border-radius: var(--dep-radius);
        background: var(--dep-accent); color: #fff;
        font-size: 14px; font-weight: 700; font-family: inherit;
        border: none; cursor: pointer;
        box-shadow: 0 4px 16px rgba(99,102,241,0.3);
        transition: background 0.2s, transform 0.15s, opacity 0.2s;
      }
      .dep-btn-primary:hover:not(:disabled) { background: var(--dep-accent2); transform: translateY(-1px); }
      .dep-btn-primary:active:not(:disabled) { transform: scale(0.98); }
      .dep-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

      .dep-btn-ghost {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 13px 22px; border-radius: var(--dep-radius);
        background: none; color: var(--dep-text2);
        font-size: 14px; font-weight: 600; font-family: inherit;
        border: 1.5px solid var(--dep-border); cursor: pointer;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
      }
      .dep-btn-ghost:hover { background: var(--dep-surface); color: var(--dep-text); border-color: var(--dep-text3); }

      .dep-spinner {
        width: 15px; height: 15px;
        border: 2.5px solid rgba(255,255,255,0.3);
        border-top-color: #fff; border-radius: 50%;
        animation: depSpin 0.7s linear infinite; flex-shrink: 0;
      }

      @keyframes depFadeIn  { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes depSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes depSpin    { to { transform: rotate(360deg); } }
    `}</style>
  );
}