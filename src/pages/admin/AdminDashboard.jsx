import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package,
  ShoppingBag,
  DollarSign,
  Clock,
  Eye,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react'
import { supabase } from '../../lib/supabase.js'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { formatPrice, formatDate } from '../../utils/formatters.js'
import { ORDER_STATUSES } from '../../lib/constants.js'

const STATUS_BADGE_MAP = {
  'Pending Payment': 'warning',
  Processing: 'info',
  Shipped: 'default',
  Delivered: 'success',
  Cancelled: 'danger',
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchDashboardData() {
    setLoading(true)
    try {
      const [productsRes, ordersRes, revenueRes, pendingRes, recentRes] =
        await Promise.all([
          supabase
            .from('products')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('orders')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('orders')
            .select('total_amount')
            .neq('status', 'Cancelled'),
          supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Pending Payment'),
          supabase
            .from('orders')
            .select('*, profiles(name, email)')
            .order('created_at', { ascending: false })
            .limit(10),
        ])

      const revenue = (revenueRes.data || []).reduce(
        (sum, o) => sum + (o.total_amount || 0),
        0
      )

      setStats({
        totalProducts: productsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        revenue,
        pendingOrders: pendingRes.count || 0,
      })

      setRecentOrders(recentRes.data || [])
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const statCards = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      gradient: 'from-indigo-500 to-indigo-600',
      bgLight: 'bg-indigo-50 dark:bg-indigo-900/20',
      iconBg: 'bg-indigo-100 dark:bg-indigo-800/40',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      gradient: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconBg: 'bg-emerald-100 dark:bg-emerald-800/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Revenue',
      value: formatPrice(stats.revenue),
      icon: DollarSign,
      gradient: 'from-amber-500 to-amber-600',
      bgLight: 'bg-amber-50 dark:bg-amber-900/20',
      iconBg: 'bg-amber-100 dark:bg-amber-800/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      isPrice: true,
    },
    {
      label: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      gradient: 'from-rose-500 to-rose-600',
      bgLight: 'bg-rose-50 dark:bg-rose-900/20',
      iconBg: 'bg-rose-100 dark:bg-rose-800/40',
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
  ]

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="skeleton h-8 w-48 rounded-lg" />
          <div className="skeleton h-5 w-72 rounded-lg" />
        </div>

        {/* Stat cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="skeleton h-12 w-12 rounded-xl" />
                <div className="skeleton h-4 w-16 rounded" />
              </div>
              <div className="skeleton h-8 w-24 rounded mb-2" />
              <div className="skeleton h-4 w-32 rounded" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6">
          <div className="skeleton h-6 w-40 rounded mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-4 w-32 rounded" />
                <div className="skeleton h-4 w-28 rounded" />
                <div className="skeleton h-4 w-20 rounded" />
                <div className="skeleton h-4 w-20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Welcome back! Here's an overview of your store.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg}`}
                >
                  <Icon className={card.iconColor} size={24} />
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <TrendingUp size={14} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {card.isPrice ? card.value : card.value.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {card.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* Recent orders */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Orders
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/orders')}
          >
            View All
            <ArrowUpRight size={16} />
          </Button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <ShoppingBag
              className="mx-auto text-gray-300 dark:text-gray-600 mb-3"
              size={48}
            />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No orders yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Orders will appear here once customers start purchasing.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {recentOrders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                      idx % 2 === 0
                        ? 'bg-white dark:bg-slate-800'
                        : 'bg-gray-50/50 dark:bg-slate-800/50'
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-mono text-gray-700 dark:text-gray-300">
                      #{order.id?.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {order.profiles?.name || order.profiles?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {formatPrice(order.total_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={STATUS_BADGE_MAP[order.status] || 'default'}
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate('/admin/orders')}
                        className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer"
                        title="View order"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
