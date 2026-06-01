import { useState, useEffect, useCallback } from 'react';
import {
  Store, CheckCircle2, XCircle, Clock, Users,
  Bell, RefreshCw, ChevronDown, Search, ShieldCheck,
  TrendingUp, AlertCircle, Phone, FileText, Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase.js';

export default function AdminDealersPage() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedDealers, setApprovedDealers] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [tab, setTab]           = useState('pending');   // 'pending' | 'approved' | 'rejected'
  const [loading, setLoading]   = useState(true);
  const [actionId, setActionId] = useState(null);        // request id currently being actioned
  const [search, setSearch]     = useState('');
  const [mounted, setMounted]   = useState(false);

  useEffect(() => {
    document.title = 'Dealer Management — Admin';
    requestAnimationFrame(() => setMounted(true));
    fetchAll();

    // Real-time: listen for new dealer requests
    const channel = supabase
      .channel('dealer_requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dealer_requests' }, () => {
        fetchAll();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('dealer_requests')
      .select('*, profiles(name, email, avatar_url)')
      .order('created_at', { ascending: false });

    if (error) { toast.error(error.message); setLoading(false); return; }

    setPendingRequests((data || []).filter(r => r.status === 'pending'));
    setApprovedDealers((data || []).filter(r => r.status === 'approved'));
    setRejectedRequests((data || []).filter(r => r.status === 'rejected'));
    setLoading(false);
  }, []);

  const approve = async (req) => {
    setActionId(req.id);
    const { error: reqErr } = await supabase
      .from('dealer_requests')
      .update({ status: 'approved' })
      .eq('id', req.id);

    if (reqErr) { toast.error(reqErr.message); setActionId(null); return; }

    const { error: profErr } = await supabase
      .from('profiles')
      .update({ role: 'dealer', is_approved: true })
      .eq('id', req.user_id);

    if (profErr) { toast.error(profErr.message); setActionId(null); return; }

    toast.success(`${req.shop_name} approved!`);
    setActionId(null);
    fetchAll();
  };

  const reject = async (req) => {
    setActionId(req.id);
    const { error: reqErr } = await supabase
      .from('dealer_requests')
      .update({ status: 'rejected' })
      .eq('id', req.id);

    if (reqErr) { toast.error(reqErr.message); setActionId(null); return; }

    const { error: profErr } = await supabase
      .from('profiles')
      .update({ role: 'customer', is_approved: false })
      .eq('id', req.user_id);

    if (profErr) { toast.error(profErr.message); setActionId(null); return; }

    toast.success(`${req.shop_name} rejected.`);
    setActionId(null);
    fetchAll();
  };

  const filterList = (list) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(r =>
      r.shop_name?.toLowerCase().includes(q) ||
      r.profiles?.name?.toLowerCase().includes(q) ||
      r.profiles?.email?.toLowerCase().includes(q)
    );
  };

  const activeList = filterList(
    tab === 'pending'  ? pendingRequests  :
    tab === 'approved' ? approvedDealers  :
                         rejectedRequests
  );

  const fmt = (ts) => new Date(ts).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <>
      <ADMStyles />
      <div className={`adm-root ${mounted ? 'adm-root--visible' : ''}`}>

        {/* ── Header ── */}
        <div className="adm-header">
          <div className="adm-header-left">
            <div className="adm-header-icon">
              <Store size={22} color="white" />
            </div>
            <div>
              <h1 className="adm-title">Dealer Management</h1>
              <p className="adm-subtitle">Review and manage dealer applications</p>
            </div>
          </div>
          <button className="adm-refresh-btn" onClick={fetchAll} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'adm-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* ── Stats row ── */}
        <div className="adm-stats">
          <StatCard
            icon={Bell}
            label="Pending"
            value={pendingRequests.length}
            color="amber"
            pulse={pendingRequests.length > 0}
          />
          <StatCard
            icon={ShieldCheck}
            label="Approved Dealers"
            value={approvedDealers.length}
            color="green"
          />
          <StatCard
            icon={XCircle}
            label="Rejected"
            value={rejectedRequests.length}
            color="red"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Requests"
            value={pendingRequests.length + approvedDealers.length + rejectedRequests.length}
            color="indigo"
          />
        </div>

        {/* ── Tabs + Search ── */}
        <div className="adm-toolbar">
          <div className="adm-tabs">
            {[
              { key: 'pending',  label: 'Pending',  count: pendingRequests.length,  color: 'amber' },
              { key: 'approved', label: 'Approved', count: approvedDealers.length,  color: 'green' },
              { key: 'rejected', label: 'Rejected', count: rejectedRequests.length, color: 'red'   },
            ].map(t => (
              <button
                key={t.key}
                className={`adm-tab ${tab === t.key ? 'adm-tab--active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                <span className={`adm-tab-badge adm-tab-badge--${t.color}`}>{t.count}</span>
              </button>
            ))}
          </div>

          <div className="adm-search-wrap">
            <Search size={14} className="adm-search-icon" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by shop, name or email…"
              className="adm-search"
            />
          </div>
        </div>

        {/* ── List ── */}
        <div className="adm-list">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="adm-skel" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="adm-skel-avatar" />
                <div className="adm-skel-lines">
                  <div className="adm-skel-line adm-skel-line--wide" />
                  <div className="adm-skel-line adm-skel-line--narrow" />
                </div>
              </div>
            ))
          ) : activeList.length === 0 ? (
            <div className="adm-empty">
              <div className="adm-empty-icon">
                {tab === 'pending'  ? <Clock size={30} /> :
                 tab === 'approved' ? <Users size={30} /> :
                                      <XCircle size={30} />}
              </div>
              <p className="adm-empty-title">
                {search
                  ? 'No results found'
                  : tab === 'pending'  ? 'No pending requests'
                  : tab === 'approved' ? 'No approved dealers yet'
                  :                      'No rejected requests'}
              </p>
              <p className="adm-empty-sub">
                {search ? 'Try a different search term.' : 'Check back later.'}
              </p>
            </div>
          ) : (
            activeList.map((req, i) => (
              <DealerRow
                key={req.id}
                req={req}
                tab={tab}
                idx={i}
                actionId={actionId}
                onApprove={approve}
                onReject={reject}
                fmt={fmt}
              />
            ))
          )}
        </div>

      </div>
    </>
  );
}

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, color, pulse }) {
  return (
    <div className={`adm-stat adm-stat--${color}`}>
      <div className="adm-stat-icon-wrap">
        <Icon size={18} />
        {pulse && <span className="adm-stat-pulse" />}
      </div>
      <div>
        <p className="adm-stat-value">{value}</p>
        <p className="adm-stat-label">{label}</p>
      </div>
    </div>
  );
}

/* ── Dealer Row ── */
function DealerRow({ req, tab, idx, actionId, onApprove, onReject, fmt }) {
  const [expanded, setExpanded] = useState(false);
  const busy = actionId === req.id;
  const profile = req.profiles || {};
  const initials = (profile.name || req.shop_name || '?').slice(0, 2).toUpperCase();

  return (
    <div
      className="adm-row"
      style={{ animationDelay: `${idx * 0.05}s` }}
    >
      <div className="adm-row-main">
        {/* Avatar */}
        <div className="adm-avatar">
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt={initials} className="adm-avatar-img" />
            : <span className="adm-avatar-initials">{initials}</span>
          }
        </div>

        {/* Info */}
        <div className="adm-row-info">
          <p className="adm-row-shop">{req.shop_name}</p>
          <p className="adm-row-meta">
            {profile.name && <span>{profile.name}</span>}
            {profile.email && <span className="adm-dot">·</span>}
            {profile.email && <span>{profile.email}</span>}
          </p>
          <div className="adm-row-tags">
            {req.phone && (
              <span className="adm-tag">
                <Phone size={10} /> {req.phone}
              </span>
            )}
            <span className="adm-tag">
              <Calendar size={10} /> {fmt(req.created_at)}
            </span>
            <span className={`adm-status-badge adm-status-badge--${req.status}`}>
              {req.status === 'pending'  ? <Clock size={10} />        :
               req.status === 'approved' ? <CheckCircle2 size={10} /> :
                                           <XCircle size={10} />}
              {req.status}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="adm-row-actions">
          {tab === 'pending' && (
            <>
              <button
                className="adm-btn adm-btn--approve"
                onClick={() => onApprove(req)}
                disabled={busy}
              >
                {busy ? <span className="adm-mini-spin" /> : <CheckCircle2 size={14} />}
                Approve
              </button>
              <button
                className="adm-btn adm-btn--reject"
                onClick={() => onReject(req)}
                disabled={busy}
              >
                {busy ? <span className="adm-mini-spin" /> : <XCircle size={14} />}
                Reject
              </button>
            </>
          )}
          {req.shop_description && (
            <button
              className="adm-btn adm-btn--ghost"
              onClick={() => setExpanded(x => !x)}
            >
              <FileText size={13} />
              <ChevronDown size={12} className={`adm-chevron ${expanded ? 'adm-chevron--open' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded description */}
      {expanded && req.shop_description && (
        <div className="adm-row-desc">
          <AlertCircle size={12} className="adm-desc-icon" />
          <p>{req.shop_description}</p>
        </div>
      )}
    </div>
  );
}

/* ── Styles ── */
function ADMStyles() {
  return (
    <style>{`
      :root {
        --adm-bg:       #f9f8f6;
        --adm-surface:  #ffffff;
        --adm-border:   #e8e4de;
        --adm-text:     #1a1714;
        --adm-text2:    #5c5650;
        --adm-text3:    #9c9690;
        --adm-accent:   #6366f1;
        --adm-accent2:  #4f46e5;
        --adm-accentl:  rgba(99,102,241,0.1);
        --adm-green:    #16a34a;
        --adm-greenl:   rgba(22,163,74,0.1);
        --adm-red:      #dc2626;
        --adm-redl:     rgba(220,38,38,0.1);
        --adm-amber:    #d97706;
        --adm-amberl:   rgba(217,119,6,0.1);
        --adm-radius:   14px;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --adm-bg:      #0f0e0c;
          --adm-surface: #1a1917;
          --adm-border:  #2d2b27;
          --adm-text:    #f2ede8;
          --adm-text2:   #a09890;
          --adm-text3:   #6b6460;
          --adm-accentl: rgba(99,102,241,0.14);
          --adm-greenl:  rgba(22,163,74,0.12);
          --adm-redl:    rgba(220,38,38,0.12);
          --adm-amberl:  rgba(217,119,6,0.12);
        }
      }

      .adm-root {
        min-height: 100vh;
        background: var(--adm-bg);
        padding: 32px 24px 64px;
        box-sizing: border-box;
        max-width: 900px;
        margin: 0 auto;
        opacity: 0;
        transform: translateY(12px);
        transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1);
      }
      .adm-root--visible { opacity: 1; transform: translateY(0); }

      /* ── Header ── */
      .adm-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 28px;
        flex-wrap: wrap;
        gap: 12px;
      }
      .adm-header-left { display: flex; align-items: center; gap: 14px; }
      .adm-header-icon {
        width: 52px; height: 52px;
        border-radius: 16px;
        background: linear-gradient(135deg, #7c3aed, #6366f1);
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .adm-title {
        font-size: 22px; font-weight: 800;
        color: var(--adm-text);
        margin: 0 0 2px;
        letter-spacing: -0.03em;
      }
      .adm-subtitle { font-size: 13px; color: var(--adm-text2); margin: 0; }

      .adm-refresh-btn {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 9px 16px;
        border-radius: 10px;
        border: 1.5px solid var(--adm-border);
        background: var(--adm-surface);
        color: var(--adm-text2);
        font-size: 13px; font-weight: 600; font-family: inherit;
        cursor: pointer;
        transition: border-color 0.2s, color 0.2s;
      }
      .adm-refresh-btn:hover { border-color: var(--adm-accent); color: var(--adm-accent); }
      .adm-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

      /* ── Stats ── */
      .adm-stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 24px;
      }
      @media (min-width: 600px) { .adm-stats { grid-template-columns: repeat(4, 1fr); } }

      .adm-stat {
        background: var(--adm-surface);
        border: 1px solid var(--adm-border);
        border-radius: var(--adm-radius);
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .adm-stat-icon-wrap {
        position: relative;
        width: 38px; height: 38px;
        border-radius: 11px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .adm-stat--amber .adm-stat-icon-wrap { background: var(--adm-amberl); color: var(--adm-amber); }
      .adm-stat--green .adm-stat-icon-wrap  { background: var(--adm-greenl); color: var(--adm-green); }
      .adm-stat--red   .adm-stat-icon-wrap  { background: var(--adm-redl);   color: var(--adm-red);   }
      .adm-stat--indigo .adm-stat-icon-wrap { background: var(--adm-accentl); color: var(--adm-accent); }

      .adm-stat-pulse {
        position: absolute;
        top: -3px; right: -3px;
        width: 10px; height: 10px;
        border-radius: 50%;
        background: var(--adm-amber);
        animation: admPulse 1.8s ease infinite;
      }
      .adm-stat-value {
        font-size: 22px; font-weight: 800;
        color: var(--adm-text);
        margin: 0 0 1px;
        letter-spacing: -0.03em;
        line-height: 1;
      }
      .adm-stat-label {
        font-size: 11px; font-weight: 600;
        color: var(--adm-text3);
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      /* ── Toolbar ── */
      .adm-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }
      .adm-tabs { display: flex; gap: 4px; }
      .adm-tab {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 8px 14px;
        border-radius: 10px;
        border: 1.5px solid transparent;
        background: transparent;
        color: var(--adm-text2);
        font-size: 13px; font-weight: 600; font-family: inherit;
        cursor: pointer;
        transition: all 0.18s;
      }
      .adm-tab:hover { background: var(--adm-surface); border-color: var(--adm-border); }
      .adm-tab--active {
        background: var(--adm-surface);
        border-color: var(--adm-accent);
        color: var(--adm-accent);
      }
      .adm-tab-badge {
        font-size: 11px; font-weight: 700;
        padding: 1px 6px;
        border-radius: 20px;
      }
      .adm-tab-badge--amber { background: var(--adm-amberl); color: var(--adm-amber); }
      .adm-tab-badge--green { background: var(--adm-greenl); color: var(--adm-green); }
      .adm-tab-badge--red   { background: var(--adm-redl);   color: var(--adm-red);   }

      .adm-search-wrap { position: relative; }
      .adm-search-icon {
        position: absolute; left: 11px; top: 50%;
        transform: translateY(-50%);
        color: var(--adm-text3); pointer-events: none;
      }
      .adm-search {
        padding: 9px 14px 9px 34px;
        border-radius: 10px;
        border: 1.5px solid var(--adm-border);
        background: var(--adm-surface);
        color: var(--adm-text);
        font-size: 13px; font-family: inherit;
        outline: none;
        width: 220px;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .adm-search::placeholder { color: var(--adm-text3); }
      .adm-search:focus {
        border-color: var(--adm-accent);
        box-shadow: 0 0 0 3px var(--adm-accentl);
      }

      /* ── List ── */
      .adm-list { display: flex; flex-direction: column; gap: 10px; }

      /* Skeleton */
      .adm-skel {
        background: var(--adm-surface);
        border: 1px solid var(--adm-border);
        border-radius: var(--adm-radius);
        padding: 18px;
        display: flex; align-items: center; gap: 14px;
        animation: admFadeUp 0.4s ease both;
      }
      .adm-skel-avatar {
        width: 44px; height: 44px; border-radius: 12px;
        background: linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.06) 75%);
        background-size: 200% 100%;
        animation: admShimmer 1.5s ease infinite;
        flex-shrink: 0;
      }
      .adm-skel-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
      .adm-skel-line {
        height: 12px; border-radius: 6px;
        background: linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.06) 75%);
        background-size: 200% 100%;
        animation: admShimmer 1.5s ease infinite;
      }
      .adm-skel-line--wide   { width: 60%; }
      .adm-skel-line--narrow { width: 38%; }

      /* Dealer Row */
      .adm-row {
        background: var(--adm-surface);
        border: 1px solid var(--adm-border);
        border-radius: var(--adm-radius);
        overflow: hidden;
        animation: admFadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .adm-row:hover { border-color: #c5bfb8; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }

      .adm-row-main {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px 18px;
        flex-wrap: wrap;
      }

      .adm-avatar {
        width: 44px; height: 44px;
        border-radius: 12px;
        background: var(--adm-accentl);
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        overflow: hidden;
      }
      .adm-avatar-img { width: 100%; height: 100%; object-fit: cover; }
      .adm-avatar-initials {
        font-size: 14px; font-weight: 800;
        color: var(--adm-accent);
      }

      .adm-row-info { flex: 1; min-width: 0; }
      .adm-row-shop {
        font-size: 14px; font-weight: 700;
        color: var(--adm-text);
        margin: 0 0 3px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .adm-row-meta {
        font-size: 12px; color: var(--adm-text2);
        margin: 0 0 6px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .adm-dot { margin: 0 5px; color: var(--adm-text3); }
      .adm-row-tags { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

      .adm-tag {
        display: inline-flex; align-items: center; gap: 4px;
        font-size: 11px; font-weight: 500;
        color: var(--adm-text3);
        background: var(--adm-bg);
        border: 1px solid var(--adm-border);
        border-radius: 6px;
        padding: 2px 7px;
      }

      .adm-status-badge {
        display: inline-flex; align-items: center; gap: 4px;
        font-size: 11px; font-weight: 700;
        border-radius: 6px;
        padding: 2px 8px;
        text-transform: capitalize;
      }
      .adm-status-badge--pending  { background: var(--adm-amberl); color: var(--adm-amber); }
      .adm-status-badge--approved { background: var(--adm-greenl); color: var(--adm-green); }
      .adm-status-badge--rejected { background: var(--adm-redl);   color: var(--adm-red);   }

      /* Action buttons */
      .adm-row-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
      .adm-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 14px;
        border-radius: 10px;
        font-size: 13px; font-weight: 700; font-family: inherit;
        border: none; cursor: pointer;
        transition: opacity 0.2s, transform 0.15s;
      }
      .adm-btn:disabled { opacity: 0.55; cursor: not-allowed; }
      .adm-btn:active:not(:disabled) { transform: scale(0.97); }

      .adm-btn--approve {
        background: var(--adm-greenl);
        color: var(--adm-green);
        border: 1.5px solid rgba(22,163,74,0.2);
      }
      .adm-btn--approve:hover:not(:disabled) { background: rgba(22,163,74,0.18); }

      .adm-btn--reject {
        background: var(--adm-redl);
        color: var(--adm-red);
        border: 1.5px solid rgba(220,38,38,0.2);
      }
      .adm-btn--reject:hover:not(:disabled) { background: rgba(220,38,38,0.18); }

      .adm-btn--ghost {
        background: var(--adm-bg);
        color: var(--adm-text2);
        border: 1.5px solid var(--adm-border);
        padding: 8px 10px;
      }
      .adm-btn--ghost:hover { border-color: var(--adm-accent); color: var(--adm-accent); }

      .adm-chevron { transition: transform 0.2s; }
      .adm-chevron--open { transform: rotate(180deg); }

      /* Description expand */
      .adm-row-desc {
        display: flex; align-items: flex-start; gap: 8px;
        padding: 12px 18px 14px;
        border-top: 1px solid var(--adm-border);
        background: var(--adm-bg);
        animation: admFadeUp 0.25s ease both;
      }
      .adm-desc-icon { color: var(--adm-text3); flex-shrink: 0; margin-top: 2px; }
      .adm-row-desc p {
        font-size: 13px;
        color: var(--adm-text2);
        margin: 0;
        line-height: 1.65;
      }

      /* Mini spinner for action buttons */
      .adm-mini-spin {
        width: 13px; height: 13px;
        border: 2px solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        animation: admSpin 0.6s linear infinite;
        flex-shrink: 0;
      }

      /* Empty */
      .adm-empty {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        padding: 72px 24px; text-align: center;
        animation: admFadeUp 0.4s ease both;
      }
      .adm-empty-icon {
        width: 64px; height: 64px;
        border-radius: 18px;
        background: var(--adm-surface);
        border: 1px solid var(--adm-border);
        display: flex; align-items: center; justify-content: center;
        color: var(--adm-text3);
        margin-bottom: 16px;
      }
      .adm-empty-title {
        font-size: 15px; font-weight: 700;
        color: var(--adm-text); margin: 0 0 6px;
      }
      .adm-empty-sub { font-size: 13px; color: var(--adm-text3); margin: 0; }

      /* ── Keyframes ── */
      @keyframes admFadeUp {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes admShimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      @keyframes admSpin { to { transform: rotate(360deg); } }
      @keyframes admPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50%       { transform: scale(1.5); opacity: 0.4; }
      }
      .adm-spin { animation: admSpin 0.8s linear infinite; }
    `}</style>
  );
}