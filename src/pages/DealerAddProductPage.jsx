import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../stores/useAuthStore'
import { supabase } from '../lib/supabase.js'
import { CATEGORIES } from '../lib/constants.js'
import ImageUpload from '../components/common/ImageUpload'

const EMPTY = {
  name: '', description: '', price: '', category: '',
  stock: '', image_url: '', is_featured: false, is_trending: false,
}

export default function DealerAddProductPage() {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const { user, profile } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => { document.title = 'Add Product — ShopVerse' }, [])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const setImg = (url) => setForm((f) => ({ ...f, image_url: url }))
  const setCheck = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.price || parseFloat(form.price) <= 0) e.price = 'Valid price required'
    if (!form.category) e.category = 'Category is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const { error } = await supabase.from('products').insert({
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      category: form.category,
      stock: parseInt(form.stock) || 0,
      image_url: form.image_url,
      is_featured: form.is_featured,
      is_trending: form.is_trending,
      dealer_id: user.id,
    })
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Product added successfully! 🎉')
    navigate('/dealer/products')
  }

  const inputClass = (err) =>
    `w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-violet-500 transition-all text-sm ${
      err ? 'border-red-400 focus:ring-red-500/40' : 'border-gray-200 dark:border-slate-600 focus:ring-violet-500/40'
    }`

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/dealer/products')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Product</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">This product will go live after admin review</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Product Image</h2>
          <ImageUpload value={form.image_url} onChange={setImg} label="" />
        </div>

        {/* Basic Info */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input type="text" value={form.name} onChange={set('name')} placeholder="e.g. Wireless Bluetooth Headphones" className={inputClass(errors.name)} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={set('description')} placeholder="Describe your product..." rows={4} className={`${inputClass()} resize-none`} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="e.g. 1999" className={inputClass(errors.price)} />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Stock Quantity</label>
              <input type="number" min="0" value={form.stock} onChange={set('stock')} placeholder="e.g. 100" className={inputClass()} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select value={form.category} onChange={set('category')} className={inputClass(errors.category)}>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>
        </div>

        {/* Visibility */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Visibility Options</h2>
          <div className="space-y-3">
            {[
              { key: 'is_featured', label: 'Featured Product', desc: 'Show on homepage featured section' },
              { key: 'is_trending', label: 'Trending Product', desc: 'Show in trending section' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={setCheck(key)}
                  className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 cursor-pointer"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-violet-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : (
              <><Save size={16} /> Add Product</>
            )}
          </button>
          <button type="button" onClick={() => navigate('/dealer/products')} className="px-6 py-3.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
