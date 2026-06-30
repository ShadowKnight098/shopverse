import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, ShoppingBag, DollarSign, Clock,
  Eye, TrendingUp, ArrowUpRight, Send, Bell,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase.js'
import { formatPrice, formatDate } from '../../utils/formatters.js'

const STATUS_STYLES = {
  'Pending Payment': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
  'Processing':      { bg: 'rgba(99,102,241,0.12)',  color: '#818cf8', border: 'rgba(99,102,241,0.25)' },
  'Shipped':         { bg: 'rgba(14,165,233,0.12)',  color: '#38bdf8', border: 'rgba(14,165,233,0.25)' },
  'Delivered':       { bg: 'rgba(16,185,129,0.12)',  color: '#34d399', border: 'rgba(16,185,129,0.25)' },
  'Cancelled':       { bg: 'rgba(239,68,68,0.12)',   color: '#f87171', border: 'rgba(239,68,68,0.25)'  },
}

const STAT_CARDS = (stats) => [
  { label: 'Total Products', value: stats.totalProducts, icon: Package,     accent: '#6366f1', glow: 'rgba(99,102,241,0.2)'  },
  { label: 'Total Orders',   value: stats.totalOrders,   icon: ShoppingBag, accent: '#10b981', glow: 'rgba(16,185,129,0.2)'  },
  { label: 'Revenue',        value: formatPrice(stats.revenue), icon: DollarSign, accent: '#f59e0b', glow: 'rgba(245,158,11,0.2)', isPrice: true },
  { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock,       accent: '#ef4444', glow: 'rgba(239,68,68,0.2)'   },
]
export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, revenue: 0, pendingOrders: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [pushCount, setPushCount] = useState(0)
  const [notification, setNotification] = useState({ title: '', body: '', url: '/' })
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  async function fetchDashboardData() {
    setLoading(true)
    try {
      const [productsRes, ordersRes, revenueRes, pendingRes, recentRes] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount').neq('status', 'Cancelled'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Pending Payment'),
        supabase.from('orders').select('*, profiles(name, email)').order('created_at', { ascending: false }).limit(10),
      ])
      
      let pCount = 0
      try {
        const pushRes = await supabase.from('push_subscriptions').select('*', { count: 'exact', head: true })
        pCount = pushRes.count || 0
      } catch (err) {
        console.warn('push_subscriptions table may not exist yet:', err)
      }

      const revenue = (revenueRes.data || []).reduce((sum, o) => sum + (o.total_amount || 0), 0)
      setStats({
        totalProducts: productsRes.count || 0,
        totalOrders:   ordersRes.count   || 0,
        revenue,
        pendingOrders: pendingRes.count  || 0,
      })
      setRecentOrders(recentRes.data || [])
      setPushCount(pCount)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBroadcast = async (e) => {
    e.preventDefault()
    if (!notification.title || !notification.body) {
      toast.error('Title and message body are required.')
      return
    }
    setSending(true)
    try {
      const { data, error } = await supabase.functions.invoke('send-push', {
        body: {
          title: notification.title,
          body: notification.body,
          url: notification.url || '/'
        }
      })

      if (error) throw error
      toast.success('Broadcast notification sent successfully!')
      setNotification({ title: '', body: '', url: '/' })
    } catch (err) {
      console.warn('Edge function not found or failed, triggering local mockup broadcast:', err)
      
      try {
        const { data: subs } = await supabase.from('push_subscriptions').select('*')
        if (!subs || subs.length === 0) {
          toast.error('No active push subscriptions found in database.')
        } else {
          // Broadcast to active pages via service worker postMessage
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'MOCK_BROADCAST',
              title: notification.title,
              body: notification.body,
              url: notification.url || '/'
            })
          }
          toast.success(`Mock Broadcast: Dispatched to ${subs.length} active subscription devices!`)
          setNotification({ title: '', body: '', url: '/' })
        }
      } catch (dbErr) {
        toast.error('Please run the push subscription SQL script first.')
      }
    } finally {
      setSending(false)
    }
  }

  useEffect(() => { fetchDashboardData() }, [])

  if (loading) return <LoadingSkeleton />

  const cards = STAT_CARDS(stats)

  return (
    <>
      <AdStyles />
      <div className="ad-root">

        {/* ── Header ── */}
        <div className="ad-header">
          <div>
            <p className="ad-eyebrow">Overview</p>
            <h1 className="ad-title">Dashboard</h1>
            <p className="ad-subtitle">Welcome back! Here's what's happening in your store.</p>
          </div>
          <button className="ad-refresh-btn" onClick={fetchDashboardData} title="Refresh">
            <TrendingUp size={15} />
            Refresh
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div className="ad-stats-grid">
          {cards.map((card, i) => {
            const Icon = card.icon
            return (
              <div
                key={card.label}
                className="ad-stat-card"
                style={{ animationDelay: `${i * 0.07}s`, '--card-accent': card.accent, '--card-glow': card.glow }}
              >
                <div className="ad-stat-icon-wrap">
                  <Icon size={22} color={card.accent} />
                </div>
                <p className="ad-stat-value">
                  {card.isPrice ? card.value : card.value.toLocaleString()}
                </p>
                <p className="ad-stat-label">{card.label}</p>
                <div className="ad-stat-bar" />
              </div>
            )
          })}
        </div>

        {/* ── Recent orders ── */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h2 className="ad-card-title">Recent Orders</h2>
            <button className="ad-view-all-btn" onClick={() => navigate('/admin/orders')}>
              View All
              <ArrowUpRight size={14} />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="ad-empty">
              <div className="ad-empty-icon-wrap">
                <ShoppingBag size={30} color="rgba(255,255,255,0.2)" />
              </div>
              <p className="ad-empty-title">No orders yet</p>
              <p className="ad-empty-sub">Orders will appear here once customers start purchasing.</p>
            </div>
          ) : (
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr className="ad-thead-row">
                    {['Order ID', 'Customer', 'Date', 'Amount', 'Status', ''].map((h) => (
                      <th key={h} className="ad-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => {
                    const s = STATUS_STYLES[order.status] || STATUS_STYLES['Processing']
                    return (
                      <tr
                        key={order.id}
                        className="ad-tr"
                        style={{ animationDelay: `${0.25 + i * 0.04}s` }}
                      >
                        <td className="ad-td">
                          <span className="ad-order-id">#{order.id?.slice(0, 8)}</span>
                        </td>
                        <td className="ad-td">
                          <span className="ad-customer">
                            {order.profiles?.name || order.profiles?.email || 'N/A'}
                          </span>
                        </td>
                        <td className="ad-td">
                          <span className="ad-date">{formatDate(order.created_at)}</span>
                        </td>
                        <td className="ad-td">
                          <span className="ad-amount">{formatPrice(order.total_amount)}</span>
                        </td>
                        <td className="ad-td">
                          <span
                            className="ad-status-pill"
                            style={{ background: s.bg, color: s.color, borderColor: s.border }}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="ad-td ad-td-right">
                          <button
                            className="ad-eye-btn"
                            onClick={() => navigate('/admin/orders')}
                            title="View order"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Push Broadcast ── */}
        <div className="ad-card" style={{ marginTop: 20 }}>
          <div className="ad-card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={18} color="#818cf8" />
              </div>
              <div>
                <h2 className="ad-card-title" style={{ margin: 0 }}>Push Broadcast</h2>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                  Send system push notifications to all subscribed user devices ({pushCount} active subscriptions)
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleBroadcast} style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Notification Title
                </label>
                <input 
                  type="text" 
                  value={notification.title} 
                  onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                  placeholder="e.g. Special Holiday Sale! 🎉"
                  required
                  style={{
                    padding: '11px 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'white',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Destination URL / Path
                </label>
                <input 
                  type="text" 
                  value={notification.url} 
                  onChange={(e) => setNotification({ ...notification, url: e.target.value })}
                  placeholder="e.g. /sales or /products/123"
                  style={{
                    padding: '11px 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'white',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Notification Message Body
              </label>
              <textarea 
                value={notification.body} 
                onChange={(e) => setNotification({ ...notification, body: e.target.value })}
                placeholder="Write the message that users will see on their mobile / desktop screens..."
                required
                rows={3}
                style={{
                  padding: '11px 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'white',
                  fontSize: 13,
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
              <button 
                type="submit" 
                disabled={sending || pushCount === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#6366f1',
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: sending || pushCount === 0 ? 'not-allowed' : 'pointer',
                  opacity: sending || pushCount === 0 ? 0.6 : 1,
                  transition: 'opacity 0.2s, transform 0.2s',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.3)'
                }}
              >
                <Send size={14} />
                {sending ? 'Sending Broadcast...' : 'Send Push Broadcast'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </>
  )
}

/* ── Loading skeleton ── */
function LoadingSkeleton() {
  return (
    <>
      <AdStyles />
      <div className="ad-root">
        <div className="ad-header">
          <div>
            <div className="ad-skel" style={{ height: 10, width: 60, marginBottom: 10 }} />
            <div className="ad-skel" style={{ height: 28, width: 160, marginBottom: 8 }} />
            <div className="ad-skel" style={{ height: 13, width: 260 }} />
          </div>
        </div>
        <div className="ad-stats-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="ad-stat-card" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="ad-skel" style={{ width: 44, height: 44, borderRadius: 12, marginBottom: 16 }} />
              <div className="ad-skel" style={{ height: 28, width: '60%', marginBottom: 8 }} />
              <div className="ad-skel" style={{ height: 12, width: '80%' }} />
            </div>
          ))}
        </div>
        <div className="ad-card">
          <div className="ad-card-header">
            <div className="ad-skel" style={{ height: 16, width: 140 }} />
          </div>
          <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div className="ad-skel" style={{ height: 12, width: 80 }} />
                <div className="ad-skel" style={{ height: 12, width: 120 }} />
                <div className="ad-skel" style={{ height: 12, width: 90 }} />
                <div className="ad-skel" style={{ height: 12, width: 70 }} />
                <div className="ad-skel" style={{ height: 22, width: 90, borderRadius: 20 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function AdStyles() {
  return (
    <style>{`
      /* ── Root ── */
      .ad-root {
        display: flex;
        flex-direction: column;
        gap: 28px;
        animation: adFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
      }

      /* ── Header ── */
      .ad-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
      }
      .ad-eyebrow {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #6366f1;
        margin: 0 0 6px;
      }
      .ad-title {
        font-size: clamp(22px, 3vw, 28px);
        font-weight: 800;
        color: rgba(255,255,255,0.92);
        margin: 0 0 5px;
        letter-spacing: -0.03em;
      }
      .ad-subtitle {
        font-size: 13px;
        color: rgba(255,255,255,0.35);
        margin: 0;
      }
      .ad-refresh-btn {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 9px 18px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.55);
        font-size: 12px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
        white-space: nowrap;
      }
      .ad-refresh-btn:hover {
        background: rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.85);
        border-color: rgba(255,255,255,0.14);
      }

      /* ── Stat cards ── */
      .ad-stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 14px;
      }
      @media (min-width: 1024px) { .ad-stats-grid { grid-template-columns: repeat(4, 1fr); gap: 18px; } }

      .ad-stat-card {
        position: relative;
        background: #16141a;
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 18px;
        padding: 22px 20px 20px;
        overflow: hidden;
        cursor: default;
        animation: adFadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
        transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
      }
      .ad-stat-card:hover {
        border-color: var(--card-accent, #6366f1);
        transform: translateY(-3px);
        box-shadow: 0 12px 32px var(--card-glow, rgba(99,102,241,0.15));
      }
      .ad-stat-icon-wrap {
        width: 44px; height: 44px;
        border-radius: 12px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.07);
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 18px;
      }
      .ad-stat-value {
        font-size: clamp(22px, 3vw, 28px);
        font-weight: 800;
        color: rgba(255,255,255,0.92);
        margin: 0 0 5px;
        letter-spacing: -0.03em;
      }
      .ad-stat-label {
        font-size: 12px;
        color: rgba(255,255,255,0.35);
        margin: 0;
        font-weight: 500;
      }
      .ad-stat-bar {
        position: absolute;
        bottom: 0; left: 0; right: 0;
        height: 2px;
        background: linear-gradient(90deg, var(--card-accent, #6366f1), transparent);
        opacity: 0;
        transition: opacity 0.2s;
      }
      .ad-stat-card:hover .ad-stat-bar { opacity: 1; }

      /* ── Card ── */
      .ad-card {
        background: #16141a;
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 20px;
        overflow: hidden;
        animation: adFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.15s both;
      }
      .ad-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 24px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .ad-card-title {
        font-size: 15px;
        font-weight: 700;
        color: rgba(255,255,255,0.85);
        margin: 0;
        letter-spacing: -0.015em;
      }
      .ad-view-all-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        font-weight: 600;
        color: #6366f1;
        background: transparent;
        border: none;
        cursor: pointer;
        font-family: inherit;
        padding: 6px 10px;
        border-radius: 8px;
        transition: background 0.15s;
      }
      .ad-view-all-btn:hover { background: rgba(99,102,241,0.1); }

      /* ── Empty ── */
      .ad-empty {
        padding: 60px 24px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .ad-empty-icon-wrap {
        width: 64px; height: 64px;
        border-radius: 50%;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.07);
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 16px;
      }
      .ad-empty-title {
        font-size: 15px;
        font-weight: 700;
        color: rgba(255,255,255,0.5);
        margin: 0 0 6px;
      }
      .ad-empty-sub {
        font-size: 12px;
        color: rgba(255,255,255,0.25);
        margin: 0;
        max-width: 280px;
        line-height: 1.65;
      }

      /* ── Table ── */
      .ad-table-wrap { overflow-x: auto; }
      .ad-table {
        width: 100%;
        border-collapse: collapse;
      }
      .ad-thead-row {
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .ad-th {
        text-align: left;
        padding: 11px 20px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.25);
        white-space: nowrap;
      }
      .ad-tr {
        border-bottom: 1px solid rgba(255,255,255,0.04);
        transition: background 0.15s;
        animation: adFadeUp 0.4s ease both;
      }
      .ad-tr:last-child { border-bottom: none; }
      .ad-tr:hover { background: rgba(255,255,255,0.03); }
      .ad-td {
        padding: 13px 20px;
        vertical-align: middle;
      }
      .ad-td-right { text-align: right; }

      .ad-order-id {
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 12px;
        color: rgba(255,255,255,0.55);
        letter-spacing: 0.03em;
      }
      .ad-customer {
        font-size: 13px;
        font-weight: 500;
        color: rgba(255,255,255,0.75);
      }
      .ad-date {
        font-size: 12px;
        color: rgba(255,255,255,0.35);
        white-space: nowrap;
      }
      .ad-amount {
        font-size: 13px;
        font-weight: 700;
        color: rgba(255,255,255,0.88);
      }
      .ad-status-pill {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 600;
        border: 1px solid transparent;
        white-space: nowrap;
      }
      .ad-eye-btn {
        width: 30px; height: 30px;
        border-radius: 8px;
        border: none;
        background: transparent;
        color: rgba(255,255,255,0.3);
        display: inline-flex; align-items: center; justify-content: center;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
      }
      .ad-eye-btn:hover {
        background: rgba(99,102,241,0.12);
        color: #818cf8;
      }

      /* ── Skeleton ── */
      .ad-skel {
        border-radius: 8px;
        background: linear-gradient(
          90deg,
          rgba(255,255,255,0.06) 25%,
          rgba(255,255,255,0.02) 50%,
          rgba(255,255,255,0.06) 75%
        );
        background-size: 200% 100%;
        animation: adShimmer 1.5s ease infinite;
        display: block;
      }

      /* ── Keyframes ── */
      @keyframes adFadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes adShimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  )
}