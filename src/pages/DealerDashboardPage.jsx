import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, PlusCircle, TrendingUp, ShoppingBag, Eye } from 'lucide-react'
import useAuthStore from '../stores/useAuthStore'
import { supabase } from '../lib/supabase.js'
import { formatPrice, formatDate } from '../utils/formatters.js'

export default function DealerDashboardPage() {
  const { user, profile } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, featured: 0, revenue: 0 })
  const [recentProducts, setRecentProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Dealer Dashboard — ShopVerse'
  }, [])

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const [countRes, featRes, productsRes] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('dealer_id', user.id),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('dealer_id', user.id).eq('is_featured', true),
      supabase.from('products').select('*').eq('dealer_id', user.id).order('created_at', { ascending: false }).limit(5),
    ])
    setStats({
      total: countRes.count || 0,
      featured: featRes.count || 0,
      revenue: 0,
    })
    setRecentProducts(productsRes.data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  const statCards = [
    { label: 'Total Products', value: stats.total, icon: Package, color: 'from-violet-500 to-fuchsia-600', bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400' },
    { label: 'Featured Products', value: stats.featured, icon: TrendingUp, color: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400' },
    { label: 'Orders (Coming Soon)', value: '—', icon: ShoppingBag, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {profile?.name?.split(' ')[0] || 'Dealer'} 👋
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
            {profile?.shop_name} — Manage your products and grow your store
          </p>
        </div>
        <Link
          to="/dealer/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-violet-500/25 transition-all"
        >
          <PlusCircle size={17} />
          Add Product
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {statCards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center`}>
                  <Icon size={22} className={c.text} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading ? '—' : c.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{c.label}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Products */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Products</h2>
          <Link to="/dealer/products" className="text-sm text-violet-600 dark:text-violet-400 hover:underline font-medium">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton h-12 w-12 rounded-xl" />
                <div className="skeleton h-4 w-48 rounded" />
                <div className="skeleton h-4 w-20 rounded ml-auto" />
              </div>
            ))}
          </div>
        ) : recentProducts.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Package className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={44} />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No products yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your first product to get started.</p>
            <Link to="/dealer/products/new" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl transition-all">
              <PlusCircle size={15} /> Add Product
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {recentProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700 shrink-0">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Package size={18} className="text-gray-400" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(p.created_at)}</p>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(p.price)}</span>
                <Link to={`/dealer/products/${p.id}/edit`} className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                  <Eye size={15} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
