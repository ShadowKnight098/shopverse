import { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, XCircle, Store, Clock, Users, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase.js'
import { formatDate } from '../../utils/formatters.js'
import Modal from '../../components/common/Modal'

const TABS = ['All', 'Pending', 'Approved', 'Rejected']

const STATUS_STYLE = {
  approved: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  pending:  'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  rejected: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
}

function getDealerStatus(profile) {
  if (profile.role !== 'dealer') return 'rejected'
  return profile.is_approved ? 'approved' : 'pending'
}

export default function AdminDealers() {
  const [dealers, setDealers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('All')
  const [updating, setUpdating] = useState(null)
  const [viewDealer, setViewDealer] = useState(null)

  useEffect(() => { document.title = 'Dealer Management — ShopVerse Admin' }, [])

  const fetchDealers = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or('role.eq.dealer,role.eq.customer')
      .not('shop_name', 'is', null)
      .order('created_at', { ascending: false })
    if (error) { toast.error('Failed to load dealers'); setLoading(false); return }
    setDealers(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchDealers() }, [fetchDealers])

  const filtered = dealers.filter((d) => {
    const status = getDealerStatus(d)
    if (tab === 'All') return true
    return status === tab.toLowerCase()
  })

  const approve = async (dealer) => {
    setUpdating(dealer.id)
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'dealer', is_approved: true })
      .eq('id', dealer.id)
    if (error) { toast.error(error.message); setUpdating(null); return }
    toast.success(`✅ ${dealer.shop_name} approved!`)
    setUpdating(null)
    fetchDealers()
  }

  const reject = async (dealer) => {
    setUpdating(dealer.id)
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'customer', is_approved: false })
      .eq('id', dealer.id)
    if (error) { toast.error(error.message); setUpdating(null); return }
    toast.success(`Dealer account revoked for ${dealer.shop_name}`)
    setUpdating(null)
    fetchDealers()
  }

  const pendingCount = dealers.filter((d) => getDealerStatus(d) === 'pending').length
  const approvedCount = dealers.filter((d) => getDealerStatus(d) === 'approved').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Dealer Management</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Approve or reject dealer applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: 'Total Applications', value: dealers.length, icon: Users, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Pending Review', value: pendingCount, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Active Dealers', value: approvedCount, icon: Store, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
              <Icon size={22} className={color} />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading ? '—' : value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              tab === t
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            {t}
            {t === 'Pending' && pendingCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-white/25 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton h-11 w-11 rounded-xl" />
                <div className="skeleton h-4 w-40 rounded" />
                <div className="skeleton h-4 w-28 rounded ml-auto" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Store className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={48} />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No {tab !== 'All' ? tab.toLowerCase() : ''} dealer applications found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700">
                  {['Shop', 'Owner', 'Phone', 'Applied On', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {filtered.map((d) => {
                  const status = getDealerStatus(d)
                  return (
                    <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {d.shop_name?.charAt(0)?.toUpperCase() || 'S'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{d.shop_name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[150px] truncate">{d.shop_description || 'No description'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{d.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[160px]">{d.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{d.phone || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(d.created_at)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[status]}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewDealer(d)}
                            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye size={15} />
                          </button>
                          {status !== 'approved' && (
                            <button
                              onClick={() => approve(d)}
                              disabled={updating === d.id}
                              className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle2 size={15} />
                            </button>
                          )}
                          {status !== 'rejected' && (
                            <button
                              onClick={() => reject(d)}
                              disabled={updating === d.id}
                              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer disabled:opacity-50"
                              title="Revoke"
                            >
                              <XCircle size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      <Modal isOpen={!!viewDealer} onClose={() => setViewDealer(null)} title="Dealer Details" size="md">
        {viewDealer && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-xl">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-black text-xl">
                {viewDealer.shop_name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{viewDealer.shop_name}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[getDealerStatus(viewDealer)]}`}>
                  {getDealerStatus(viewDealer)}
                </span>
              </div>
            </div>
            {[
              { label: 'Owner Name', value: viewDealer.name },
              { label: 'Email', value: viewDealer.email },
              { label: 'Phone', value: viewDealer.phone || '—' },
              { label: 'Description', value: viewDealer.shop_description || '—' },
              { label: 'Applied On', value: formatDate(viewDealer.created_at) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-start py-2 border-b border-gray-100 dark:border-slate-700 last:border-0">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</span>
                <span className="text-sm text-gray-900 dark:text-white text-right max-w-[60%]">{value}</span>
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              {getDealerStatus(viewDealer) !== 'approved' && (
                <button onClick={() => { approve(viewDealer); setViewDealer(null) }} className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <CheckCircle2 size={16} /> Approve
                </button>
              )}
              {getDealerStatus(viewDealer) !== 'rejected' && (
                <button onClick={() => { reject(viewDealer); setViewDealer(null) }} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <XCircle size={16} /> Revoke
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
