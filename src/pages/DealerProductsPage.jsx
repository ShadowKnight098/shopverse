import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Pencil, Trash2, Package, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../stores/useAuthStore'
import { supabase } from '../lib/supabase.js'
import { formatPrice, formatDate } from '../utils/formatters.js'
import Modal from '../components/common/Modal'

export default function DealerProductsPage() {
  const { user } = useAuthStore()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { document.title = 'My Products — ShopVerse' }, [])

  const fetchProducts = useCallback(async () => {
    if (!user) return
    setLoading(true)
    let query = supabase.from('products').select('*').eq('dealer_id', user.id).order('created_at', { ascending: false })
    if (search.trim()) {
      query = query.or(`name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`)
    }
    const { data } = await query
    setProducts(data || [])
    setLoading(false)
  }, [user, search])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    // Also delete image from storage if it's a Supabase storage URL
    if (deleteTarget.image_url?.includes('product-images')) {
      const path = deleteTarget.image_url.split('/product-images/')[1]
      if (path) await supabase.storage.from('product-images').remove([path])
    }
    const { error } = await supabase.from('products').delete().eq('id', deleteTarget.id).eq('dealer_id', user.id)
    if (error) { toast.error('Failed to delete product'); setDeleting(false); return }
    toast.success('Product deleted')
    setDeleteTarget(null)
    setDeleting(false)
    fetchProducts()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{products.length} products in your store</p>
        </div>
        <Link to="/dealer/products/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-violet-500/25 transition-all">
          <PlusCircle size={17} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your products..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all"
        />
      </div>

      {/* Products table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton h-14 w-14 rounded-xl shrink-0" />
                <div className="skeleton h-4 w-48 rounded" />
                <div className="skeleton h-4 w-20 rounded ml-auto" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Package className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={48} />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {search ? 'No products match your search.' : 'No products yet.'}
            </p>
            {!search && (
              <Link to="/dealer/products/new" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl transition-all">
                <PlusCircle size={15} /> Add Your First Product
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700">
                  {['Product', 'Category', 'Price', 'Stock', 'Added', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700 shrink-0">
                          {p.image_url
                            ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-gray-400" /></div>
                          }
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white max-w-[160px] truncate">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 text-xs font-medium rounded-full capitalize">{p.category || '—'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(p.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${p.stock <= 0 ? 'text-red-500' : p.stock <= 10 ? 'text-amber-500' : 'text-gray-700 dark:text-gray-300'}`}>
                        {p.stock ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(p.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Link to={`/dealer/products/${p.id}/edit`} className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                          <Pencil size={15} />
                        </Link>
                        <button onClick={() => setDeleteTarget(p)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product" size="sm">
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Are you sure you want to delete <strong className="text-gray-900 dark:text-white">"{deleteTarget?.name}"</strong>? This cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3 mt-5">
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all disabled:opacity-60 cursor-pointer">
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
