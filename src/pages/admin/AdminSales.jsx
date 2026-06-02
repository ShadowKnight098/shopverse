import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Tag, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase.js'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { formatDate } from '../../utils/formatters.js'

const EMPTY_FORM = { title: '', discount: '', start_date: '', end_date: '', banner_url: '' }

function getSaleStatus(startDate, endDate) {
  const now = new Date(), start = new Date(startDate), end = new Date(endDate)
  if (now < start) return { label: 'Upcoming', color: '#4f46e5', bg: 'rgba(79,70,229,0.12)', border: 'rgba(79,70,229,0.25)' }
  if (now >= start && now <= end) return { label: 'Active', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' }
  return { label: 'Expired', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.2)' }
}

export default function AdminSales() {
  const [sales, setSales]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [showForm, setShowForm]         = useState(false)
  const [showDelete, setShowDelete]     = useState(false)
  const [editingSale, setEditingSale]   = useState(null)
  const [deletingSale, setDeletingSale] = useState(null)
  const [formData, setFormData]         = useState(EMPTY_FORM)
  const [formErrors, setFormErrors]     = useState({})
  const [saving, setSaving]             = useState(false)
  const [deleting, setDeleting]         = useState(false)

  useEffect(() => { fetchSales() }, [])

  async function fetchSales() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('upcoming_sales').select('*').order('start_date', { ascending: true })
      if (error) throw error
      setSales(data || [])
    } catch { toast.error('Failed to load sales') }
    finally { setLoading(false) }
  }

  function openAddModal() {
    setEditingSale(null); setFormData(EMPTY_FORM); setFormErrors({}); setShowForm(true)
  }

  function openEditModal(sale) {
    setEditingSale(sale)
    setFormData({
      title:      sale.title || '',
      discount:   sale.discount?.toString() || '',
      start_date: sale.start_date ? new Date(sale.start_date).toISOString().slice(0, 16) : '',
      end_date:   sale.end_date   ? new Date(sale.end_date).toISOString().slice(0, 16)   : '',
      banner_url: sale.banner || '',
    })
    setFormErrors({}); setShowForm(true)
  }

  function validateForm() {
    const errors = {}
    if (!formData.title.trim()) errors.title = 'Title is required'
    if (!formData.discount || parseFloat(formData.discount) <= 0) errors.discount = 'Valid discount required'
    if (parseFloat(formData.discount) > 100) errors.discount = 'Cannot exceed 100%'
    if (!formData.start_date) errors.start_date = 'Start date required'
    if (!formData.end_date)   errors.end_date   = 'End date required'
    if (formData.start_date && formData.end_date &&
        new Date(formData.end_date) <= new Date(formData.start_date))
      errors.end_date = 'End date must be after start date'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSave() {
    if (!validateForm()) return
    setSaving(true)
    try {
      const payload = {
        title:      formData.title.trim(),
        discount:   parseFloat(formData.discount),
        start_date: new Date(formData.start_date).toISOString(),
        end_date:   new Date(formData.end_date).toISOString(),
        banner:     formData.banner_url.trim() || null,
      }
      if (editingSale) {
        const { error } = await supabase.from('upcoming_sales').update(payload).eq('id', editingSale.id)
        if (error) throw error
        toast.success('Sale updated')
      } else {
        const { error } = await supabase.from('upcoming_sales').insert(payload)
        if (error) throw error
        toast.success('Sale created')
      }
      setShowForm(false); fetchSales()
    } catch (err) { toast.error(err.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deletingSale) return
    setDeleting(true)
    try {
      const { error } = await supabase.from('upcoming_sales').delete().eq('id', deletingSale.id)
      if (error) throw error
      toast.success('Sale deleted')
      setShowDelete(false); setDeletingSale(null); fetchSales()
    } catch (err) { toast.error(err.message || 'Failed to delete') }
    finally { setDeleting(false) }
  }

  const set = (key) => (e) => setFormData(f => ({ ...f, [key]: e.target.value }))

  return (
    <>
      <style>{`
        :root {
          --as-bg:      #faf9f7;
          --as-surface: #ffffff;
          --as-border:  #ece9e3;
          --as-text:    #18160f;
          --as-text2:   #6b6257;
          --as-text3:   #a8a098;
          --as-accent:  #e8643a;
          --as-accent2: #c94e22;
          --as-accentl: rgba(232,100,58,0.1);
          --as-accentb: rgba(232,100,58,0.22);
          --as-red:     #ef4444;
          --as-redl:    rgba(239,68,68,0.08);
          --as-redb:    rgba(239,68,68,0.3);
          --ff-head:    'Syne', sans-serif;
          --ff-body:    'DM Sans', sans-serif;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --as-bg:      #0e0d0b;
            --as-surface: #171512;
            --as-border:  #2a2620;
            --as-text:    #f0ebe3;
            --as-text2:   #948880;
            --as-text3:   #5a5248;
            --as-accentl: rgba(232,100,58,0.12);
            --as-accentb: rgba(232,100,58,0.18);
            --as-redl:    rgba(239,68,68,0.12);
            --as-redb:    rgba(239,68,68,0.25);
          }
        }

        .as-root {
          font-family: var(--ff-body);
          display: flex; flex-direction: column; gap: 24px;
          padding-bottom: 40px;
        }

        /* ── Header ── */
        .as-header {
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 12px;
        }
        .as-header-left { display: flex; align-items: center; gap: 14px; }
        .as-header-icon {
          width: 46px; height: 46px; border-radius: 14px;
          background: var(--as-accentl); border: 1.5px solid var(--as-accentb);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .as-title {
          font-family: var(--ff-head); font-size: clamp(20px, 3vw, 26px);
          font-weight: 800; color: var(--as-text); letter-spacing: -0.03em; margin: 0;
        }
        .as-subtitle { font-size: 13px; color: var(--as-text2); margin: 2px 0 0; }

        .as-add-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 18px; border-radius: 12px;
          background: var(--as-accent); color: #fff;
          font-family: var(--ff-body); font-size: 13px; font-weight: 700;
          border: none; cursor: pointer;
          box-shadow: 0 4px 14px var(--as-accentb);
          transition: background 0.18s, transform 0.15s;
        }
        .as-add-btn:hover  { background: var(--as-accent2); transform: translateY(-1px); }
        .as-add-btn:active { transform: scale(0.97); }

        /* ── Grid ── */
        .as-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
        @media (min-width: 640px)  { .as-grid { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 1024px) { .as-grid { grid-template-columns: 1fr 1fr 1fr; } }

        /* ── Skeleton ── */
        .as-skeleton {
          background: var(--as-surface); border: 1.5px solid var(--as-border);
          border-radius: 20px; overflow: hidden;
        }
        .as-skeleton-banner {
          height: 140px; background: var(--as-border);
          animation: asPulse 1.4s ease-in-out infinite;
        }
        .as-skeleton-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .as-skel { background: var(--as-border); border-radius: 6px; animation: asPulse 1.4s ease-in-out infinite; }
        .as-skel--title { height: 14px; width: 70%; }
        .as-skel--sub   { height: 11px; width: 50%; }
        .as-skel--sub2  { height: 11px; width: 60%; }

        /* ── Empty ── */
        .as-empty {
          text-align: center; padding: 64px 24px;
          background: var(--as-surface); border: 1.5px solid var(--as-border);
          border-radius: 20px;
        }
        .as-empty-icon {
          width: 60px; height: 60px; border-radius: 18px;
          background: var(--as-accentl); border: 1.5px solid var(--as-accentb);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .as-empty-title {
          font-family: var(--ff-head); font-size: 18px; font-weight: 800;
          color: var(--as-text); letter-spacing: -0.02em; margin: 0 0 6px;
        }
        .as-empty-sub { font-size: 13px; color: var(--as-text2); margin: 0; }

        /* ── Card ── */
        .as-card {
          background: var(--as-surface); border: 1.5px solid var(--as-border);
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          transition: transform 0.25s, box-shadow 0.25s;
          animation: asSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) both;
        }
        .as-card:hover { transform: translateY(-4px); box-shadow: 0 10px 32px rgba(0,0,0,0.1); }

        .as-card-banner {
          height: 140px; position: relative; overflow: hidden;
          background: linear-gradient(135deg, #1a1208, #3b1a06);
        }
        .as-card-banner-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.6s ease;
        }
        .as-card:hover .as-card-banner-img { transform: scale(1.06); }
        .as-card-banner-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
        }
        .as-card-banner-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(10,8,5,0.7) 0%, transparent 60%);
        }
        .as-card-discount {
          position: absolute; bottom: 12px; left: 12px;
          padding: 4px 12px; border-radius: 999px;
          background: linear-gradient(135deg, var(--as-accent), var(--as-accent2));
          color: #fff; font-family: var(--ff-head);
          font-size: 12px; font-weight: 800;
          box-shadow: 0 3px 10px rgba(232,100,58,0.4);
          letter-spacing: 0.02em;
        }
        .as-card-status {
          position: absolute; top: 10px; right: 10px;
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 999px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.04em;
          border: 1px solid; text-transform: uppercase;
          backdrop-filter: blur(6px);
        }
        .as-status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

        .as-card-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .as-card-title {
          font-family: var(--ff-head); font-size: 15px; font-weight: 800;
          color: var(--as-text); letter-spacing: -0.02em; margin: 0;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .as-card-dates { display: flex; flex-direction: column; gap: 5px; }
        .as-date-row {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: var(--as-text3);
        }
        .as-date-val { color: var(--as-text2); font-weight: 600; margin-left: auto; }

        .as-card-actions {
          display: flex; gap: 8px;
          padding-top: 10px; border-top: 1.5px solid var(--as-border); margin-top: 2px;
        }
        .as-action-btn {
          flex: 1; display: inline-flex; align-items: center; justify-content: center;
          gap: 6px; padding: 8px 10px; border-radius: 10px;
          font-family: var(--ff-body); font-size: 12px; font-weight: 600;
          border: 1.5px solid var(--as-border); cursor: pointer; transition: all 0.18s;
        }
        .as-action-btn--edit  { background: var(--as-surface); color: var(--as-text2); }
        .as-action-btn--edit:hover  { border-color: var(--as-accent); color: var(--as-accent); background: var(--as-accentl); }
        .as-action-btn--delete { background: var(--as-surface); color: var(--as-text3); }
        .as-action-btn--delete:hover { border-color: var(--as-red); color: var(--as-red); background: var(--as-redl); }

        /* ── Modal ── */
        .as-modal-body { display: flex; flex-direction: column; gap: 16px; }
        .as-modal-row  { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 480px) { .as-modal-row { grid-template-columns: 1fr; } }

        .as-modal-field { display: flex; flex-direction: column; gap: 6px; }
        .as-modal-label {
          font-size: 11px; font-weight: 700; color: var(--as-text2);
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .as-modal-input {
          width: 100%; padding: 10px 14px; border-radius: 11px;
          border: 1.5px solid var(--as-border);
          background: var(--as-bg); color: var(--as-text);
          font-family: var(--ff-body); font-size: 13px;
          outline: none; box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
          color-scheme: dark light;
        }
        .as-modal-input:focus { border-color: var(--as-accent); box-shadow: 0 0 0 3px var(--as-accentl); }
        .as-modal-input--err  { border-color: var(--as-red) !important; }
        .as-field-error { font-size: 11px; color: var(--as-red); margin: 0; }

        .as-modal-footer {
          display: flex; align-items: center; justify-content: flex-end; gap: 10px;
          padding-top: 16px; border-top: 1.5px solid var(--as-border); margin-top: 4px;
        }
        .as-modal-cancel {
          padding: 9px 16px; border-radius: 10px;
          background: none; border: 1.5px solid var(--as-border);
          color: var(--as-text2); font-family: var(--ff-body);
          font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.18s;
        }
        .as-modal-cancel:hover { border-color: var(--as-text3); color: var(--as-text); }

        .as-modal-save {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 20px; border-radius: 10px;
          background: var(--as-accent); color: #fff;
          font-family: var(--ff-body); font-size: 13px; font-weight: 700;
          border: none; cursor: pointer;
          box-shadow: 0 4px 14px var(--as-accentb);
          transition: background 0.18s, transform 0.15s;
        }
        .as-modal-save:hover:not(:disabled)  { background: var(--as-accent2); transform: translateY(-1px); }
        .as-modal-save:active:not(:disabled) { transform: scale(0.97); }
        .as-modal-save:disabled { opacity: 0.6; cursor: not-allowed; }

        .as-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          border-radius: 50%; animation: asSpin 0.7s linear infinite;
        }

        .as-delete-text { font-size: 14px; color: var(--as-text2); line-height: 1.6; margin: 0; }
        .as-delete-text strong { color: var(--as-text); }

        @keyframes asSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes asPulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
        }
        @keyframes asSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="as-root">

        {/* ── Header ── */}
        <div className="as-header">
          <div className="as-header-left">
            <div className="as-header-icon">
              <Tag size={20} color="#e8643a" />
            </div>
            <div>
              <h1 className="as-title">Upcoming Sales</h1>
              <p className="as-subtitle">Manage promotions and discount events</p>
            </div>
          </div>
          <button className="as-add-btn" onClick={openAddModal}>
            <Plus size={16} /> Add Sale
          </button>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="as-grid">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="as-skeleton">
                <div className="as-skeleton-banner" />
                <div className="as-skeleton-body">
                  <div className="as-skel as-skel--title" />
                  <div className="as-skel as-skel--sub" />
                  <div className="as-skel as-skel--sub2" />
                </div>
              </div>
            ))}
          </div>
        ) : sales.length === 0 ? (
          <div className="as-empty">
            <div className="as-empty-icon"><Tag size={28} color="var(--as-accent)" /></div>
            <h2 className="as-empty-title">No sales yet</h2>
            <p className="as-empty-sub">Click "Add Sale" to create your first promotion.</p>
          </div>
        ) : (
          <div className="as-grid">
            {sales.map((sale, i) => {
              const status = getSaleStatus(sale.start_date, sale.end_date)
              return (
                <div key={sale.id} className="as-card" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="as-card-banner">
                    {sale.banner ? (
                      <img src={sale.banner} alt={sale.title} className="as-card-banner-img"
                        onError={(e) => { e.target.style.display = 'none' }} />
                    ) : (
                      <div className="as-card-banner-placeholder">
                        <Tag size={32} color="rgba(232,100,58,0.4)" />
                      </div>
                    )}
                    <div className="as-card-banner-overlay" />
                    <div className="as-card-discount">{sale.discount}% OFF</div>
                    <div className="as-card-status"
                      style={{ color: status.color, background: status.bg, borderColor: status.border }}>
                      <span className="as-status-dot" style={{ background: status.color }} />
                      {status.label}
                    </div>
                  </div>
                  <div className="as-card-body">
                    <h3 className="as-card-title">{sale.title}</h3>
                    <div className="as-card-dates">
                      <div className="as-date-row">
                        <Calendar size={11} /><span>Start</span>
                        <span className="as-date-val">{formatDate(sale.start_date)}</span>
                      </div>
                      <div className="as-date-row">
                        <Calendar size={11} /><span>End</span>
                        <span className="as-date-val">{formatDate(sale.end_date)}</span>
                      </div>
                    </div>
                    <div className="as-card-actions">
                      <button className="as-action-btn as-action-btn--edit" onClick={() => openEditModal(sale)}>
                        <Pencil size={13} /> Edit
                      </button>
                      <button className="as-action-btn as-action-btn--delete"
                        onClick={() => { setDeletingSale(sale); setShowDelete(true) }}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Add/Edit Modal ── */}
        <Modal isOpen={showForm} onClose={() => setShowForm(false)}
          title={editingSale ? 'Edit Sale' : 'Add Sale'} size="md">
          <div className="as-modal-body">
            <div className="as-modal-field">
              <label className="as-modal-label">Title *</label>
              <input className={`as-modal-input${formErrors.title ? ' as-modal-input--err' : ''}`}
                placeholder="Summer Mega Sale" value={formData.title} onChange={set('title')} />
              {formErrors.title && <p className="as-field-error">{formErrors.title}</p>}
            </div>
            <div className="as-modal-field">
              <label className="as-modal-label">Discount (%) *</label>
              <input className={`as-modal-input${formErrors.discount ? ' as-modal-input--err' : ''}`}
                type="number" placeholder="e.g. 25" value={formData.discount} onChange={set('discount')} />
              {formErrors.discount && <p className="as-field-error">{formErrors.discount}</p>}
            </div>
            <div className="as-modal-row">
              <div className="as-modal-field">
                <label className="as-modal-label">Start Date *</label>
                <input className={`as-modal-input${formErrors.start_date ? ' as-modal-input--err' : ''}`}
                  type="datetime-local" value={formData.start_date} onChange={set('start_date')} />
                {formErrors.start_date && <p className="as-field-error">{formErrors.start_date}</p>}
              </div>
              <div className="as-modal-field">
                <label className="as-modal-label">End Date *</label>
                <input className={`as-modal-input${formErrors.end_date ? ' as-modal-input--err' : ''}`}
                  type="datetime-local" value={formData.end_date} onChange={set('end_date')} />
                {formErrors.end_date && <p className="as-field-error">{formErrors.end_date}</p>}
              </div>
            </div>
            <div className="as-modal-field">
              <label className="as-modal-label">Banner URL</label>
              <input className="as-modal-input" placeholder="https://..."
                value={formData.banner_url} onChange={set('banner_url')} />
            </div>
            <div className="as-modal-footer">
              <button className="as-modal-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="as-modal-save" onClick={handleSave} disabled={saving}>
                {saving ? <><span className="as-spinner" /> Saving...</> : (editingSale ? 'Update Sale' : 'Create Sale')}
              </button>
            </div>
          </div>
        </Modal>

        {/* ── Delete Modal ── */}
        <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Delete Sale" size="sm">
          <div className="as-modal-body">
            <p className="as-delete-text">
              Are you sure you want to delete <strong>"{deletingSale?.title}"</strong>? This cannot be undone.
            </p>
            <div className="as-modal-footer">
              <button className="as-modal-cancel" onClick={() => setShowDelete(false)}>Cancel</button>
              <Button variant="danger" onClick={handleDelete} isLoading={deleting}>Delete</Button>
            </div>
          </div>
        </Modal>

      </div>
    </>
  )
}