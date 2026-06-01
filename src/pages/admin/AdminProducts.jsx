import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Search, Pencil, Trash2, Package,
  Filter, ImageOff, X, Check, AlertTriangle,
  TrendingUp, Star, ChevronLeft, ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase.js'
import { formatPrice } from '../../utils/formatters.js'
import { CATEGORIES } from '../../lib/constants.js'
import ImageUpload from '../../components/common/ImageUpload'

const ITEMS_PER_PAGE = 10

const EMPTY_FORM = {
  name: '', description: '', price: '', category: '',
  stock: '', image_url: '', is_featured: false, is_trending: false,
}

export default function AdminProducts() {
  const [products, setProducts]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [currentPage, setCurrentPage]   = useState(1)
  const [totalPages, setTotalPages]     = useState(1)
  const [totalCount, setTotalCount]     = useState(0)
  const [showForm, setShowForm]         = useState(false)
  const [showDelete, setShowDelete]     = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(null)
  const [formData, setFormData]         = useState(EMPTY_FORM)
  const [formErrors, setFormErrors]     = useState({})
  const [saving, setSaving]             = useState(false)
  const [deleting, setDeleting]         = useState(false)
  const [mounted, setMounted]           = useState(false)

  useEffect(() => {
    document.title = 'Products — Admin'
    requestAnimationFrame(() => setMounted(true))
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
      if (search.trim())    query = query.or(`name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`)
      if (categoryFilter)   query = query.eq('category', categoryFilter)
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      query = query.range(from, from + ITEMS_PER_PAGE - 1)
      const { data, count, error } = await query
      if (error) throw error
      setProducts(data || [])
      setTotalCount(count || 0)
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))
    } catch (err) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [search, categoryFilter, currentPage])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { setCurrentPage(1) }, [search, categoryFilter])

  const openAddModal = () => {
    setEditingProduct(null); setFormData(EMPTY_FORM); setFormErrors({}); setShowForm(true)
  }
  const openEditModal = (p) => {
    setEditingProduct(p)
    setFormData({ name: p.name||'', description: p.description||'', price: p.price?.toString()||'',
      category: p.category||'', stock: p.stock?.toString()||'', image_url: p.image_url||'',
      is_featured: p.is_featured||false, is_trending: p.is_trending||false })
    setFormErrors({}); setShowForm(true)
  }

  const validateForm = () => {
    const e = {}
    if (!formData.name.trim()) e.name = 'Name is required'
    if (!formData.price || parseFloat(formData.price) <= 0) e.price = 'Valid price required'
    if (!formData.category) e.category = 'Category required'
    setFormErrors(e); return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return
    setSaving(true)
    try {
      const payload = {
        name: formData.name.trim(), description: formData.description.trim(),
        price: parseFloat(formData.price), category: formData.category,
        stock: parseInt(formData.stock)||0, image_url: formData.image_url.trim(),
        is_featured: formData.is_featured, is_trending: formData.is_trending,
      }
      if (editingProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id)
        if (error) throw error
        toast.success('Product updated')
      } else {
        const { error } = await supabase.from('products').insert(payload)
        if (error) throw error
        toast.success('Product added')
      }
      setShowForm(false); fetchProducts()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deletingProduct) return
    setDeleting(true)
    try {
      const { error } = await supabase.from('products').delete().eq('id', deletingProduct.id)
      if (error) throw error
      toast.success('Product deleted')
      setShowDelete(false); setDeletingProduct(null); fetchProducts()
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    } finally { setDeleting(false) }
  }

  const toggleFeatured = async (product) => {
    try {
      const { error } = await supabase.from('products').update({ is_featured: !product.is_featured }).eq('id', product.id)
      if (error) throw error
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_featured: !p.is_featured } : p))
      toast.success(product.is_featured ? 'Removed from featured' : 'Added to featured')
    } catch { toast.error('Failed to update') }
  }

  const fd = (k) => (e) => setFormData(f => ({ ...f, [k]: e.target.value }))
  const fc = (k) => (e) => setFormData(f => ({ ...f, [k]: e.target.checked }))

  const stockColor = (s) => s <= 0 ? '#f87171' : s <= 10 ? '#fbbf24' : '#34d399'

  return (
    <>
      <APStyles />
      <div className={`ap-root ${mounted ? 'ap-root--in' : ''}`}>

        {/* ── Header ── */}
        <div className="ap-header">
          <div className="ap-header-left">
            <div className="ap-header-icon"><Package size={20} /></div>
            <div>
              <h1 className="ap-title">Products</h1>
              <p className="ap-subtitle">{totalCount} items in catalogue</p>
            </div>
          </div>
          <button className="ap-add-btn" onClick={openAddModal}>
            <Plus size={16} />
            Add Product
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="ap-filters">
          <div className="ap-search-wrap">
            <Search size={14} className="ap-search-ico" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products…" className="ap-search"
            />
            {search && (
              <button className="ap-search-clear" onClick={() => setSearch('')}>
                <X size={13} />
              </button>
            )}
          </div>
          <div className="ap-select-wrap">
            <Filter size={13} className="ap-select-ico" />
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="ap-select">
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="ap-table-wrap">
          {loading ? (
            <div className="ap-skel-list">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="ap-skel-row" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="ap-skel ap-skel--thumb" />
                  <div className="ap-skel ap-skel--name" />
                  <div className="ap-skel ap-skel--badge" />
                  <div className="ap-skel ap-skel--price" />
                  <div className="ap-skel ap-skel--stock" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="ap-empty">
              <div className="ap-empty-icon"><Package size={32} /></div>
              <p className="ap-empty-title">No products found</p>
              <p className="ap-empty-sub">
                {search || categoryFilter ? 'Try adjusting your filters.' : 'Click "Add Product" to get started.'}
              </p>
            </div>
          ) : (
            <>
              <div className="ap-table-head">
                <span>Product</span>
                <span>Category</span>
                <span>Price</span>
                <span>Stock</span>
                <span style={{ textAlign: 'center' }}>Featured</span>
                <span style={{ textAlign: 'right' }}>Actions</span>
              </div>
              <div className="ap-table-body">
                {products.map((p, i) => (
                  <div key={p.id} className="ap-row" style={{ animationDelay: `${i * 0.04}s` }}>
                    {/* Product */}
                    <div className="ap-row-product">
                      <div className="ap-thumb">
                        {p.image_url
                          ? <img src={p.image_url} alt={p.name} className="ap-thumb-img" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                          : null}
                        <div className={`ap-thumb-fallback ${p.image_url ? 'ap-hidden' : ''}`}>
                          <ImageOff size={14} />
                        </div>
                      </div>
                      <span className="ap-product-name">{p.name}</span>
                    </div>

                    {/* Category */}
                    <div>
                      <span className="ap-cat-badge">
                        {CATEGORIES.find(c => c.slug === p.category)?.name || p.category}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="ap-price">{formatPrice(p.price)}</div>

                    {/* Stock */}
                    <div className="ap-stock" style={{ color: stockColor(p.stock) }}>
                      {p.stock}
                      {p.stock <= 10 && p.stock > 0 && <span className="ap-low-badge">Low</span>}
                      {p.stock <= 0 && <span className="ap-out-badge">Out</span>}
                    </div>

                    {/* Featured toggle */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        className={`ap-toggle ${p.is_featured ? 'ap-toggle--on' : ''}`}
                        onClick={() => toggleFeatured(p)}
                      >
                        <span className="ap-toggle-thumb" />
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="ap-row-actions">
                      <button className="ap-act-btn ap-act-btn--edit" onClick={() => openEditModal(p)} title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button className="ap-act-btn ap-act-btn--del" onClick={() => { setDeletingProduct(p); setShowDelete(true) }} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="ap-pagination">
              <button className="ap-page-btn" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>
                <ChevronLeft size={15} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`ap-page-btn ap-page-num ${currentPage === i+1 ? 'ap-page-num--active' : ''}`}
                  onClick={() => setCurrentPage(i+1)}
                >
                  {i+1}
                </button>
              ))}
              <button className="ap-page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}>
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>

        {/* ── Add/Edit Modal ── */}
        {showForm && (
          <div className="ap-modal-overlay" onClick={() => setShowForm(false)}>
            <div className="ap-modal" onClick={e => e.stopPropagation()}>
              <div className="ap-modal-header">
                <h2 className="ap-modal-title">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
                <button className="ap-modal-close" onClick={() => setShowForm(false)}><X size={18} /></button>
              </div>

              <div className="ap-modal-body">
                <ImageUpload value={formData.image_url} onChange={url => setFormData(f => ({...f, image_url: url}))} label="Product Image" />

                <div className="ap-mfield">
                  <label className="ap-mlabel">Product Name <span className="ap-req">*</span></label>
                  <input type="text" value={formData.name} onChange={fd('name')} placeholder="e.g. Wireless Headphones" className={`ap-minput ${formErrors.name ? 'ap-minput--err' : ''}`} />
                  {formErrors.name && <p className="ap-merror">{formErrors.name}</p>}
                </div>

                <div className="ap-mfield">
                  <label className="ap-mlabel">Description</label>
                  <textarea value={formData.description} onChange={fd('description')} placeholder="What makes this product special?" rows={3} className="ap-minput ap-mtextarea" />
                </div>

                <div className="ap-mgrid">
                  <div className="ap-mfield">
                    <label className="ap-mlabel">Price (₹) <span className="ap-req">*</span></label>
                    <input type="number" min="0" step="0.01" value={formData.price} onChange={fd('price')} placeholder="999" className={`ap-minput ${formErrors.price ? 'ap-minput--err' : ''}`} />
                    {formErrors.price && <p className="ap-merror">{formErrors.price}</p>}
                  </div>
                  <div className="ap-mfield">
                    <label className="ap-mlabel">Stock</label>
                    <input type="number" min="0" value={formData.stock} onChange={fd('stock')} placeholder="0" className="ap-minput" />
                  </div>
                </div>

                <div className="ap-mfield">
                  <label className="ap-mlabel">Category <span className="ap-req">*</span></label>
                  <select value={formData.category} onChange={fd('category')} className={`ap-minput ap-mselect ${formErrors.category ? 'ap-minput--err' : ''}`}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                  {formErrors.category && <p className="ap-merror">{formErrors.category}</p>}
                </div>

                <div className="ap-mtoggles">
                  {[
                    { key: 'is_featured', icon: Star,       label: 'Featured',  desc: 'Show on homepage' },
                    { key: 'is_trending', icon: TrendingUp, label: 'Trending',  desc: 'Show in trending' },
                  ].map(({ key, icon: Icon, label, desc }) => (
                    <label key={key} className="ap-mtoggle-row">
                      <div className="ap-mtoggle-icon"><Icon size={14} /></div>
                      <div className="ap-mtoggle-text">
                        <p className="ap-mtoggle-label">{label}</p>
                        <p className="ap-mtoggle-desc">{desc}</p>
                      </div>
                      <div className={`ap-toggle ap-toggle--sm ${formData[key] ? 'ap-toggle--on' : ''}`}>
                        <input type="checkbox" checked={formData[key]} onChange={fc(key)} style={{ display: 'none' }} />
                        <span className="ap-toggle-thumb" />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="ap-modal-footer">
                <button className="ap-mfooter-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="ap-mfooter-save" onClick={handleSave} disabled={saving}>
                  {saving ? <span className="ap-mini-spin" /> : <Check size={15} />}
                  {saving ? 'Saving…' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Modal ── */}
        {showDelete && (
          <div className="ap-modal-overlay" onClick={() => setShowDelete(false)}>
            <div className="ap-modal ap-modal--sm" onClick={e => e.stopPropagation()}>
              <div className="ap-modal-header">
                <h2 className="ap-modal-title">Delete Product</h2>
                <button className="ap-modal-close" onClick={() => setShowDelete(false)}><X size={18} /></button>
              </div>
              <div className="ap-modal-body">
                <div className="ap-del-warn">
                  <div className="ap-del-icon"><AlertTriangle size={22} /></div>
                  <p className="ap-del-text">
                    Are you sure you want to delete <strong>"{deletingProduct?.name}"</strong>? This cannot be undone.
                  </p>
                </div>
              </div>
              <div className="ap-modal-footer">
                <button className="ap-mfooter-cancel" onClick={() => setShowDelete(false)}>Cancel</button>
                <button className="ap-mfooter-del" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <span className="ap-mini-spin" /> : <Trash2 size={14} />}
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  )
}

function APStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

      :root {
        --ap-bg:       #0c0b0a;
        --ap-surface:  #161412;
        --ap-surface2: #1e1b18;
        --ap-border:   #2a2723;
        --ap-border2:  #353027;
        --ap-text:     #f0ebe4;
        --ap-text2:    #8a8078;
        --ap-text3:    #504840;
        --ap-accent:   #e87c3a;
        --ap-accentl:  rgba(232,124,58,0.12);
        --ap-accentb:  rgba(232,124,58,0.25);
        --ap-green:    #34d399;
        --ap-greenl:   rgba(52,211,153,0.1);
        --ap-red:      #f87171;
        --ap-redl:     rgba(248,113,113,0.1);
        --ap-amber:    #fbbf24;
        --ap-amberl:   rgba(251,191,36,0.1);
        --ap-radius:   12px;
        --ff-head:     'Syne', sans-serif;
        --ff-body:     'DM Sans', sans-serif;
      }

      .ap-root {
        font-family: var(--ff-body);
        color: var(--ap-text);
        padding: 0 0 64px;
        opacity: 0;
        transform: translateY(10px);
        transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1);
      }
      .ap-root--in { opacity: 1; transform: translateY(0); }

      /* ── Header ── */
      .ap-header {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
      }
      .ap-header-left { display: flex; align-items: center; gap: 14px; }
      .ap-header-icon {
        width: 44px; height: 44px; border-radius: 13px;
        background: var(--ap-accentl);
        border: 1px solid var(--ap-accentb);
        color: var(--ap-accent);
        display: flex; align-items: center; justify-content: center;
      }
      .ap-title {
        font-family: var(--ff-head); font-size: 22px; font-weight: 800;
        color: var(--ap-text); margin: 0 0 2px; letter-spacing: -0.02em;
      }
      .ap-subtitle { font-size: 12px; color: var(--ap-text2); margin: 0; }

      .ap-add-btn {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 10px 20px; border-radius: var(--ap-radius);
        background: var(--ap-accent); color: #fff;
        font-family: var(--ff-body); font-size: 13px; font-weight: 600;
        border: none; cursor: pointer;
        box-shadow: 0 4px 20px rgba(232,124,58,0.35);
        transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
      }
      .ap-add-btn:hover { background: #d06a28; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(232,124,58,0.4); }
      .ap-add-btn:active { transform: scale(0.97); }

      /* ── Filters ── */
      .ap-filters {
        display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap;
      }
      .ap-search-wrap {
        position: relative; flex: 1; min-width: 200px; max-width: 360px;
      }
      .ap-search-ico {
        position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
        color: var(--ap-text3); pointer-events: none;
      }
      .ap-search-clear {
        position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
        color: var(--ap-text3); background: none; border: none; cursor: pointer;
        display: flex; align-items: center; padding: 2px;
        transition: color 0.15s;
      }
      .ap-search-clear:hover { color: var(--ap-text); }
      .ap-search {
        width: 100%; padding: 10px 34px 10px 36px;
        border-radius: var(--ap-radius); border: 1.5px solid var(--ap-border);
        background: var(--ap-surface); color: var(--ap-text);
        font-family: var(--ff-body); font-size: 13px; outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
      }
      .ap-search::placeholder { color: var(--ap-text3); }
      .ap-search:focus { border-color: var(--ap-accent); box-shadow: 0 0 0 3px var(--ap-accentl); }

      .ap-select-wrap { position: relative; }
      .ap-select-ico {
        position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
        color: var(--ap-text3); pointer-events: none;
      }
      .ap-select {
        padding: 10px 16px 10px 32px;
        border-radius: var(--ap-radius); border: 1.5px solid var(--ap-border);
        background: var(--ap-surface); color: var(--ap-text);
        font-family: var(--ff-body); font-size: 13px; outline: none; cursor: pointer;
        transition: border-color 0.2s;
        appearance: none; min-width: 160px;
      }
      .ap-select:focus { border-color: var(--ap-accent); }

      /* ── Table wrap ── */
      .ap-table-wrap {
        background: var(--ap-surface);
        border: 1px solid var(--ap-border);
        border-radius: 18px;
        overflow: hidden;
      }

      /* Table head */
      .ap-table-head {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr 80px 80px;
        padding: 12px 20px;
        border-bottom: 1px solid var(--ap-border);
        font-family: var(--ff-body);
        font-size: 11px; font-weight: 600;
        color: var(--ap-text3);
        text-transform: uppercase; letter-spacing: 0.06em;
        gap: 12px;
      }
      @media (max-width: 700px) {
        .ap-table-head { display: none; }
      }

      /* Table body */
      .ap-table-body { display: flex; flex-direction: column; }

      .ap-row {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr 80px 80px;
        align-items: center;
        padding: 14px 20px;
        gap: 12px;
        border-bottom: 1px solid var(--ap-border);
        animation: apFadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both;
        transition: background 0.15s;
      }
      .ap-row:last-child { border-bottom: none; }
      .ap-row:hover { background: var(--ap-surface2); }
      @media (max-width: 700px) {
        .ap-row {
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto auto;
        }
      }

      /* Product cell */
      .ap-row-product { display: flex; align-items: center; gap: 12px; min-width: 0; }
      .ap-thumb {
        width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
        background: var(--ap-surface2); border: 1px solid var(--ap-border);
        overflow: hidden; position: relative;
        display: flex; align-items: center; justify-content: center;
      }
      .ap-thumb-img { width: 100%; height: 100%; object-fit: cover; }
      .ap-thumb-fallback { color: var(--ap-text3); display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
      .ap-hidden { display: none !important; }
      .ap-product-name {
        font-size: 13px; font-weight: 600; color: var(--ap-text);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }

      .ap-cat-badge {
        display: inline-block;
        padding: 3px 10px; border-radius: 20px;
        background: var(--ap-surface2); border: 1px solid var(--ap-border2);
        font-size: 11px; font-weight: 600; color: var(--ap-text2);
        white-space: nowrap;
      }
      .ap-price {
        font-family: var(--ff-head); font-size: 13px; font-weight: 700;
        color: var(--ap-text);
      }
      .ap-stock {
        font-size: 13px; font-weight: 700;
        display: flex; align-items: center; gap: 6px;
      }
      .ap-low-badge, .ap-out-badge {
        font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px;
        text-transform: uppercase; letter-spacing: 0.04em;
      }
      .ap-low-badge { background: var(--ap-amberl); color: var(--ap-amber); }
      .ap-out-badge { background: var(--ap-redl); color: var(--ap-red); }

      /* Toggle */
      .ap-toggle {
        position: relative; width: 38px; height: 21px; border-radius: 99px;
        background: var(--ap-border2); cursor: pointer;
        transition: background 0.2s; border: none; outline: none;
        flex-shrink: 0;
      }
      .ap-toggle--sm { width: 34px; height: 19px; }
      .ap-toggle--on { background: var(--ap-accent); }
      .ap-toggle-thumb {
        position: absolute; top: 3px; left: 3px;
        width: 15px; height: 15px; border-radius: 50%; background: #fff;
        transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        pointer-events: none;
      }
      .ap-toggle--sm .ap-toggle-thumb { width: 13px; height: 13px; }
      .ap-toggle--on .ap-toggle-thumb { transform: translateX(17px); }
      .ap-toggle--sm.ap-toggle--on .ap-toggle-thumb { transform: translateX(15px); }

      /* Action buttons */
      .ap-row-actions { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }
      .ap-act-btn {
        width: 32px; height: 32px; border-radius: 9px;
        display: flex; align-items: center; justify-content: center;
        border: 1px solid var(--ap-border); background: var(--ap-surface2);
        cursor: pointer; transition: all 0.15s; color: var(--ap-text2);
      }
      .ap-act-btn--edit:hover { border-color: var(--ap-accent); color: var(--ap-accent); background: var(--ap-accentl); }
      .ap-act-btn--del:hover  { border-color: var(--ap-red); color: var(--ap-red); background: var(--ap-redl); }

      /* Skeleton */
      .ap-skel-list { display: flex; flex-direction: column; gap: 0; }
      .ap-skel-row {
        display: flex; align-items: center; gap: 16px;
        padding: 16px 20px; border-bottom: 1px solid var(--ap-border);
        animation: apFadeUp 0.4s ease both;
      }
      .ap-skel {
        border-radius: 8px; flex-shrink: 0;
        background: linear-gradient(90deg, var(--ap-surface2) 25%, var(--ap-border) 50%, var(--ap-surface2) 75%);
        background-size: 200% 100%;
        animation: apShimmer 1.5s ease infinite;
      }
      .ap-skel--thumb  { width: 42px; height: 42px; border-radius: 10px; }
      .ap-skel--name   { width: 140px; height: 12px; }
      .ap-skel--badge  { width: 80px; height: 22px; border-radius: 20px; }
      .ap-skel--price  { width: 60px; height: 12px; }
      .ap-skel--stock  { width: 40px; height: 12px; }

      /* Empty */
      .ap-empty {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        padding: 72px 24px; text-align: center;
      }
      .ap-empty-icon {
        width: 64px; height: 64px; border-radius: 18px;
        background: var(--ap-surface2); border: 1px solid var(--ap-border);
        display: flex; align-items: center; justify-content: center;
        color: var(--ap-text3); margin-bottom: 16px;
      }
      .ap-empty-title { font-family: var(--ff-head); font-size: 15px; font-weight: 700; color: var(--ap-text); margin: 0 0 6px; }
      .ap-empty-sub { font-size: 13px; color: var(--ap-text2); margin: 0; }

      /* Pagination */
      .ap-pagination {
        display: flex; align-items: center; justify-content: center; gap: 6px;
        padding: 16px 20px; border-top: 1px solid var(--ap-border);
      }
      .ap-page-btn {
        width: 34px; height: 34px; border-radius: 9px;
        display: flex; align-items: center; justify-content: center;
        border: 1px solid var(--ap-border); background: var(--ap-surface2);
        color: var(--ap-text2); cursor: pointer; font-family: var(--ff-body);
        font-size: 13px; font-weight: 600;
        transition: all 0.15s;
      }
      .ap-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
      .ap-page-btn:not(:disabled):hover { border-color: var(--ap-accent); color: var(--ap-accent); }
      .ap-page-num--active { background: var(--ap-accent) !important; border-color: var(--ap-accent) !important; color: #fff !important; }

      /* ── Modal ── */
      .ap-modal-overlay {
        position: fixed; inset: 0; z-index: 999;
        background: rgba(0,0,0,0.7);
        backdrop-filter: blur(6px);
        display: flex; align-items: center; justify-content: center;
        padding: 20px; box-sizing: border-box;
        animation: apFadeIn 0.2s ease both;
      }
      .ap-modal {
        width: 100%; max-width: 560px; max-height: 90vh;
        background: var(--ap-surface);
        border: 1px solid var(--ap-border2);
        border-radius: 20px;
        display: flex; flex-direction: column;
        overflow: hidden;
        animation: apModalIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
        box-shadow: 0 24px 64px rgba(0,0,0,0.5);
      }
      .ap-modal--sm { max-width: 400px; }

      .ap-modal-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 20px 24px 16px;
        border-bottom: 1px solid var(--ap-border);
        flex-shrink: 0;
      }
      .ap-modal-title {
        font-family: var(--ff-head); font-size: 17px; font-weight: 800;
        color: var(--ap-text); margin: 0; letter-spacing: -0.02em;
      }
      .ap-modal-close {
        width: 32px; height: 32px; border-radius: 9px;
        display: flex; align-items: center; justify-content: center;
        border: 1px solid var(--ap-border); background: none;
        color: var(--ap-text2); cursor: pointer; transition: all 0.15s;
      }
      .ap-modal-close:hover { border-color: var(--ap-red); color: var(--ap-red); background: var(--ap-redl); }

      .ap-modal-body {
        padding: 20px 24px;
        overflow-y: auto;
        flex: 1;
        display: flex; flex-direction: column; gap: 14px;
      }

      /* Modal fields */
      .ap-mfield { display: flex; flex-direction: column; gap: 6px; }
      .ap-mlabel { font-size: 12px; font-weight: 600; color: var(--ap-text2); letter-spacing: 0.02em; }
      .ap-req { color: var(--ap-accent); }
      .ap-minput {
        padding: 10px 14px;
        border-radius: var(--ap-radius);
        border: 1.5px solid var(--ap-border);
        background: var(--ap-surface2);
        color: var(--ap-text);
        font-family: var(--ff-body); font-size: 13px; outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box; width: 100%;
      }
      .ap-minput::placeholder { color: var(--ap-text3); }
      .ap-minput:focus { border-color: var(--ap-accent); box-shadow: 0 0 0 3px var(--ap-accentl); }
      .ap-minput--err { border-color: var(--ap-red); }
      .ap-mtextarea { resize: vertical; min-height: 80px; line-height: 1.6; }
      .ap-mselect { cursor: pointer; }
      .ap-merror { font-size: 11.5px; color: var(--ap-red); margin: 0; }

      .ap-mgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      @media (max-width: 480px) { .ap-mgrid { grid-template-columns: 1fr; } }

      /* Modal toggles */
      .ap-mtoggles { display: flex; flex-direction: column; gap: 8px; }
      .ap-mtoggle-row {
        display: flex; align-items: center; gap: 12px;
        padding: 12px 14px; border-radius: var(--ap-radius);
        border: 1px solid var(--ap-border);
        background: var(--ap-surface2); cursor: pointer;
        transition: border-color 0.15s;
      }
      .ap-mtoggle-row:hover { border-color: var(--ap-border2); }
      .ap-mtoggle-icon {
        width: 28px; height: 28px; border-radius: 8px;
        background: var(--ap-accentl); color: var(--ap-accent);
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .ap-mtoggle-text { flex: 1; }
      .ap-mtoggle-label { font-size: 13px; font-weight: 600; color: var(--ap-text); margin: 0 0 1px; }
      .ap-mtoggle-desc  { font-size: 11px; color: var(--ap-text3); margin: 0; }

      /* Modal footer */
      .ap-modal-footer {
        display: flex; align-items: center; justify-content: flex-end; gap: 10px;
        padding: 16px 24px 20px;
        border-top: 1px solid var(--ap-border);
        flex-shrink: 0;
      }
      .ap-mfooter-cancel {
        padding: 10px 18px; border-radius: var(--ap-radius);
        border: 1.5px solid var(--ap-border); background: none;
        color: var(--ap-text2); font-family: var(--ff-body); font-size: 13px; font-weight: 600;
        cursor: pointer; transition: all 0.15s;
      }
      .ap-mfooter-cancel:hover { border-color: var(--ap-border2); color: var(--ap-text); }
      .ap-mfooter-save {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 10px 22px; border-radius: var(--ap-radius);
        background: var(--ap-accent); color: #fff;
        font-family: var(--ff-body); font-size: 13px; font-weight: 700;
        border: none; cursor: pointer;
        box-shadow: 0 4px 14px rgba(232,124,58,0.3);
        transition: background 0.2s, transform 0.15s;
      }
      .ap-mfooter-save:hover:not(:disabled) { background: #d06a28; transform: translateY(-1px); }
      .ap-mfooter-save:disabled { opacity: 0.6; cursor: not-allowed; }
      .ap-mfooter-del {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 10px 22px; border-radius: var(--ap-radius);
        background: var(--ap-red); color: #fff;
        font-family: var(--ff-body); font-size: 13px; font-weight: 700;
        border: none; cursor: pointer;
        box-shadow: 0 4px 14px rgba(248,113,113,0.25);
        transition: background 0.2s;
      }
      .ap-mfooter-del:hover:not(:disabled) { background: #ef4444; }
      .ap-mfooter-del:disabled { opacity: 0.6; cursor: not-allowed; }

      /* Delete warning */
      .ap-del-warn {
        display: flex; align-items: flex-start; gap: 14px;
        padding: 16px; border-radius: var(--ap-radius);
        background: var(--ap-redl); border: 1px solid rgba(248,113,113,0.2);
      }
      .ap-del-icon { color: var(--ap-red); flex-shrink: 0; margin-top: 1px; }
      .ap-del-text { font-size: 13.5px; color: var(--ap-text2); line-height: 1.65; margin: 0; }
      .ap-del-text strong { color: var(--ap-text); }

      /* Spinner */
      .ap-mini-spin {
        width: 13px; height: 13px;
        border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
        border-radius: 50%; animation: apSpin 0.6s linear infinite; flex-shrink: 0;
      }

      /* ── Keyframes ── */
      @keyframes apFadeUp {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes apFadeIn {
        from { opacity: 0; } to { opacity: 1; }
      }
      @keyframes apModalIn {
        from { opacity: 0; transform: scale(0.95) translateY(10px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes apShimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      @keyframes apSpin { to { transform: rotate(360deg); } }
    `}</style>
  )
}