import { useState, useEffect } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  Calendar,
  Percent,
  ImageOff,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase.js'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import Badge from '../../components/common/Badge'
import { formatDate } from '../../utils/formatters.js'

const EMPTY_FORM = {
  title: '',
  discount: '',
  start_date: '',
  end_date: '',
  banner_url: '',
}

function getSaleStatus(startDate, endDate) {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (now < start) return { label: 'Upcoming', variant: 'info' }
  if (now >= start && now <= end) return { label: 'Active', variant: 'success' }
  return { label: 'Expired', variant: 'danger' }
}

export default function AdminSales() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [showForm, setShowForm] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [editingSale, setEditingSale] = useState(null)
  const [deletingSale, setDeletingSale] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchSales()
  }, [])

  async function fetchSales() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('upcoming_sales')
        .select('*')
        .order('start_date', { ascending: true })
      if (error) throw error
      setSales(data || [])
    } catch (err) {
      console.error('Fetch sales error:', err)
      toast.error('Failed to load sales')
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setEditingSale(null)
    setFormData(EMPTY_FORM)
    setFormErrors({})
    setShowForm(true)
  }

  function openEditModal(sale) {
    setEditingSale(sale)
    setFormData({
      title: sale.title || '',
      discount: sale.discount?.toString() || '',
      start_date: sale.start_date
        ? new Date(sale.start_date).toISOString().slice(0, 16)
        : '',
      end_date: sale.end_date
        ? new Date(sale.end_date).toISOString().slice(0, 16)
        : '',
      banner_url: sale.banner_url || '',
    })
    setFormErrors({})
    setShowForm(true)
  }

  function validateForm() {
    const errors = {}
    if (!formData.title.trim()) errors.title = 'Title is required'
    if (!formData.discount || parseFloat(formData.discount) <= 0)
      errors.discount = 'Valid discount is required'
    if (parseFloat(formData.discount) > 100)
      errors.discount = 'Discount cannot exceed 100%'
    if (!formData.start_date) errors.start_date = 'Start date is required'
    if (!formData.end_date) errors.end_date = 'End date is required'
    if (
      formData.start_date &&
      formData.end_date &&
      new Date(formData.end_date) <= new Date(formData.start_date)
    ) {
      errors.end_date = 'End date must be after start date'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSave() {
    if (!validateForm()) return
    setSaving(true)
    try {
      const payload = {
        title: formData.title.trim(),
        discount: parseFloat(formData.discount),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        banner_url: formData.banner_url.trim(),
      }

      if (editingSale) {
        const { error } = await supabase
          .from('upcoming_sales')
          .update(payload)
          .eq('id', editingSale.id)
        if (error) throw error
        toast.success('Sale updated successfully')
      } else {
        const { error } = await supabase.from('upcoming_sales').insert(payload)
        if (error) throw error
        toast.success('Sale created successfully')
      }

      setShowForm(false)
      fetchSales()
    } catch (err) {
      console.error('Save sale error:', err)
      toast.error(err.message || 'Failed to save sale')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingSale) return
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('upcoming_sales')
        .delete()
        .eq('id', deletingSale.id)
      if (error) throw error
      toast.success('Sale deleted successfully')
      setShowDelete(false)
      setDeletingSale(null)
      fetchSales()
    } catch (err) {
      console.error('Delete sale error:', err)
      toast.error(err.message || 'Failed to delete sale')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Upcoming Sales
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage promotions and discount events
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus size={18} />
          Add Sale
        </Button>
      </div>

      {/* Sales list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-4"
            >
              <div className="skeleton h-32 w-full rounded-xl" />
              <div className="skeleton h-5 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="skeleton h-4 w-2/3 rounded" />
            </div>
          ))}
        </div>
      ) : sales.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 px-6 py-16 text-center">
          <Tag
            className="mx-auto text-gray-300 dark:text-gray-600 mb-3"
            size={48}
          />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            No sales created yet
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Click "Add Sale" to create your first promotion.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sales.map((sale) => {
            const status = getSaleStatus(sale.start_date, sale.end_date)
            return (
              <div
                key={sale.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                {/* Banner */}
                <div className="h-36 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                  {sale.banner_url ? (
                    <img
                      src={sale.banner_url}
                      alt={sale.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <Tag size={40} className="text-white/50" />
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {sale.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Percent size={14} className="shrink-0" />
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {sale.discount}% off
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar size={12} className="shrink-0" />
                      <span>Start: {formatDate(sale.start_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar size={12} className="shrink-0" />
                      <span>End: {formatDate(sale.end_date)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => openEditModal(sale)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeletingSale(sale)
                        setShowDelete(true)
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingSale ? 'Edit Sale' : 'Add Sale'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Title *"
            placeholder="Sale title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            error={formErrors.title}
          />

          <Input
            label="Discount (%) *"
            type="number"
            placeholder="e.g. 25"
            value={formData.discount}
            onChange={(e) =>
              setFormData({ ...formData, discount: e.target.value })
            }
            error={formErrors.discount}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Start Date *
              </label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                className={`w-full rounded-xl border bg-white dark:bg-slate-800 py-3 px-4 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200 ${
                  formErrors.start_date
                    ? 'border-red-500 dark:border-red-400'
                    : ''
                }`}
              />
              {formErrors.start_date && (
                <p className="mt-1.5 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                  {formErrors.start_date}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                End Date *
              </label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                className={`w-full rounded-xl border bg-white dark:bg-slate-800 py-3 px-4 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200 ${
                  formErrors.end_date
                    ? 'border-red-500 dark:border-red-400'
                    : ''
                }`}
              />
              {formErrors.end_date && (
                <p className="mt-1.5 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                  {formErrors.end_date}
                </p>
              )}
            </div>
          </div>

          <Input
            label="Banner URL"
            placeholder="https://..."
            value={formData.banner_url}
            onChange={(e) =>
              setFormData({ ...formData, banner_url: e.target.value })
            }
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={saving}>
              {editingSale ? 'Update Sale' : 'Create Sale'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete Sale"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              "{deletingSale?.title}"
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
