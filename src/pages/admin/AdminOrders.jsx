import { useState, useEffect, useCallback } from 'react'
import {
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Package,
  ImageOff,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase.js'
import Badge from '../../components/common/Badge'
import { formatPrice, formatDate } from '../../utils/formatters.js'
import { ORDER_STATUSES } from '../../lib/constants.js'

const STATUS_BADGE_MAP = {
  'Pending Payment': 'warning',
  Processing: 'info',
  Shipped: 'default',
  Delivered: 'success',
  Cancelled: 'danger',
}

const FILTER_TABS = ['All', ...ORDER_STATUSES]

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('orders')
        .select('*, order_items(*), profiles(name, email)')
        .order('created_at', { ascending: false })

      if (activeFilter !== 'All') {
        query = query.eq('status', activeFilter)
      }

      const { data, error } = await query
      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      console.error('Fetch orders error:', err)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [activeFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  async function handleStatusChange(orderId, newStatus) {
    setUpdatingId(orderId)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
      if (error) throw error

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
      toast.success(`Order status updated to "${newStatus}"`)
    } catch (err) {
      console.error('Update status error:', err)
      toast.error('Failed to update order status')
    } finally {
      setUpdatingId(null)
    }
  }

  function toggleExpand(orderId) {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId))
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          Orders
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage and track all customer orders
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
              activeFilter === tab
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-4 w-36 rounded" />
                <div className="skeleton h-4 w-28 rounded" />
                <div className="skeleton h-4 w-12 rounded" />
                <div className="skeleton h-4 w-20 rounded" />
                <div className="skeleton h-6 w-24 rounded-full" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <ShoppingBag
              className="mx-auto text-gray-300 dark:text-gray-600 mb-3"
              size={48}
            />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No orders found
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {activeFilter !== 'All'
                ? `No orders with status "${activeFilter}".`
                : 'Orders will appear here when customers start purchasing.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700/50">
                  <th className="w-10 px-6 py-3" />
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
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
                {orders.map((order, idx) => (
                  <>
                    <tr
                      key={order.id}
                      className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${
                        idx % 2 === 0
                          ? 'bg-white dark:bg-slate-800'
                          : 'bg-gray-50/50 dark:bg-slate-800/50'
                      } ${expandedOrder === order.id ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                      onClick={() => toggleExpand(order.id)}
                    >
                      <td className="px-6 py-4">
                        {expandedOrder === order.id ? (
                          <ChevronUp
                            size={16}
                            className="text-gray-400"
                          />
                        ) : (
                          <ChevronDown
                            size={16}
                            className="text-gray-400"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-700 dark:text-gray-300">
                        #{order.id?.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.profiles?.name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {order.profiles?.email || ''}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">
                        {order.order_items?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {formatPrice(order.total_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            STATUS_BADGE_MAP[order.status] || 'default'
                          }
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td
                        className="px-6 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          disabled={updatingId === order.id}
                          className="text-sm rounded-lg border bg-white dark:bg-slate-700 py-1.5 px-3 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer disabled:opacity-50 appearance-none"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>

                    {/* Expanded order items */}
                    {expandedOrder === order.id && (
                      <tr key={`${order.id}-expanded`}>
                        <td
                          colSpan={8}
                          className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50"
                        >
                          <div className="ml-10">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                              Order Items
                            </h4>
                            {order.order_items?.length > 0 ? (
                              <div className="space-y-3">
                                {order.order_items.map((item, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50"
                                  >
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 shrink-0 flex items-center justify-center">
                                      {item.image_url ? (
                                        <img
                                          src={item.image_url}
                                          alt={item.product_name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <ImageOff
                                          size={16}
                                          className="text-gray-400"
                                        />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {item.product_name || `Product #${item.product_id?.slice(0, 8)}`}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Qty: {item.quantity} ×{' '}
                                        {formatPrice(item.price)}
                                      </p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {formatPrice(
                                        (item.price || 0) *
                                          (item.quantity || 1)
                                      )}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 dark:text-gray-500">
                                No items data available
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
