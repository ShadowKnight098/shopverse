import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag,
  Tag, MessageSquare, ArrowLeft, LogOut, Store, X, ChevronLeft, ChevronRight,
} from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
      { label: 'Dealers',   icon: Store,           path: '/admin/dealers' },
      { label: 'Products',  icon: Package,          path: '/admin/products' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { label: 'Orders',   icon: ShoppingBag,   path: '/admin/orders' },
      { label: 'Sales',    icon: Tag,           path: '/admin/sales' },
      { label: 'Messages', icon: MessageSquare, path: '/admin/messages' },
    ],
  },
];

export default function AdminSidebar({ mobileOpen, onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout, user, profile } = useAuthStore();

  const initials = (profile?.name || user?.email || 'A')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose?.();
  };

  return (
    <>
      <AdminSidebarStyles />

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="asb-backdrop" onClick={onClose} />
      )}

      <aside
        className={[
          'asb-root',
          mobileOpen  ? 'asb-root--mobile-open' : '',
          collapsed   ? 'asb-root--collapsed'   : '',
        ].join(' ')}
      >

        {/* ── Header ── */}
        <div className="asb-header">
          {!collapsed && (
            <Link to="/admin" onClick={onClose} className="asb-brand">
              <div className="asb-brand-icon">SV</div>
              <div className="asb-brand-text">
                <p className="asb-brand-name">
                  <span className="asb-brand-shop">Shop</span>
                  <span className="asb-brand-verse">Verse</span>
                </p>
                <p className="asb-brand-sub">Admin Panel</p>
              </div>
            </Link>
          )}

          {collapsed && (
            <div className="asb-brand-icon asb-brand-icon--centered">SV</div>
          )}

          {/* Desktop collapse toggle */}
          <button
            className="asb-collapse-btn"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>

          {/* Mobile close */}
          <button
            className="asb-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="asb-nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="asb-section">
              {!collapsed && (
                <p className="asb-section-label">{section.label}</p>
              )}
              {collapsed && <div className="asb-section-divider" />}

              {section.items.map(({ label, icon: Icon, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/admin'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `asb-nav-item ${isActive ? 'asb-nav-item--active' : ''} ${collapsed ? 'asb-nav-item--icon-only' : ''}`
                  }
                  title={collapsed ? label : undefined}
                >
                  <Icon size={18} strokeWidth={1.75} className="asb-nav-icon" />
                  {!collapsed && <span className="asb-nav-label">{label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* ── Footer ── */}
        <div className="asb-footer">
          {!collapsed && (
            <div className="asb-user-card">
              <div className="asb-user-avatar">{initials}</div>
              <div className="asb-user-info">
                <p className="asb-user-name">{profile?.name || 'Admin'}</p>
                <p className="asb-user-email">{user?.email}</p>
              </div>
            </div>
          )}

          {collapsed && (
            <div
              className="asb-user-avatar asb-user-avatar--centered"
              title={profile?.name || 'Admin'}
            >
              {initials}
            </div>
          )}

          <Link
            to="/"
            onClick={onClose}
            className={`asb-footer-item ${collapsed ? 'asb-footer-item--icon-only' : ''}`}
            title={collapsed ? 'Back to store' : undefined}
          >
            <ArrowLeft size={16} />
            {!collapsed && <span>Back to store</span>}
          </Link>

          <button
            onClick={handleLogout}
            className={`asb-footer-item asb-footer-item--danger ${collapsed ? 'asb-footer-item--icon-only' : ''}`}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={16} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

      </aside>
    </>
  );
}

function AdminSidebarStyles() {
  return (
    <style>{`
      :root {
        --asb-bg:          #0c0f1a;
        --asb-surface:     #111827;
        --asb-surface2:    #1a2235;
        --asb-border:      rgba(255,255,255,0.07);
        --asb-text:        #f1f5f9;
        --asb-text2:       #94a3b8;
        --asb-text3:       #4b5c74;
        --asb-accent:      #6366f1;
        --asb-accentl:     rgba(99,102,241,0.12);
        --asb-red:         #f87171;
        --asb-redl:        rgba(248,113,113,0.08);
        --asb-redborder:   rgba(248,113,113,0.2);
        --asb-radius:      12px;
        --asb-w-full:      240px;
        --asb-w-collapsed: 64px;
      }

      /* ── Backdrop (mobile only) ── */
      .asb-backdrop {
        position: fixed;
        inset: 0;
        z-index: 39;
        background: rgba(0,0,0,0.55);
        backdrop-filter: blur(4px);
        animation: asbFadeIn 0.2s ease both;
      }
      @media (min-width: 1024px) {
        .asb-backdrop { display: none; }
      }

      /* ── Root ── */
      .asb-root {
        position: fixed;
        top: 0; left: 0; bottom: 0;
        width: var(--asb-w-full);
        background: var(--asb-bg);
        display: flex;
        flex-direction: column;
        z-index: 40;
        border-right: 1px solid var(--asb-border);
        /* mobile: hidden by default */
        transform: translateX(-100%);
        transition: width 0.25s cubic-bezier(0.22,1,0.36,1),
                    transform 0.3s cubic-bezier(0.22,1,0.36,1);
        overflow: hidden;
      }
      /* mobile open */
      .asb-root--mobile-open {
        transform: translateX(0);
      }
      /* desktop: always visible */
      @media (min-width: 1024px) {
        .asb-root {
          transform: translateX(0);
        }
        .asb-root--collapsed {
          width: var(--asb-w-collapsed);
        }
      }

      /* ── Header ── */
      .asb-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 12px 16px;
        border-bottom: 1px solid var(--asb-border);
        flex-shrink: 0;
        min-height: 64px;
        gap: 8px;
      }
      .asb-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        flex: 1;
        min-width: 0;
      }
      .asb-brand-text { min-width: 0; }
      .asb-brand-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: var(--asb-accent);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.5px;
        flex-shrink: 0;
      }
      .asb-brand-icon--centered {
        margin: 0 auto;
      }
      .asb-brand-name {
        font-size: 15px;
        font-weight: 800;
        margin: 0;
        line-height: 1.2;
        letter-spacing: -0.02em;
        white-space: nowrap;
      }
      .asb-brand-shop {
        background: linear-gradient(135deg, #818cf8, #a78bfa);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .asb-brand-verse { color: var(--asb-text); }
      .asb-brand-sub {
        font-size: 10px;
        font-weight: 700;
        color: var(--asb-accent);
        text-transform: uppercase;
        letter-spacing: 1.2px;
        margin: 3px 0 0;
        white-space: nowrap;
      }

      /* Collapse toggle — desktop only */
      .asb-collapse-btn {
        display: none;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 8px;
        background: var(--asb-surface2);
        border: 1px solid var(--asb-border);
        color: var(--asb-text2);
        cursor: pointer;
        flex-shrink: 0;
        transition: background 0.15s, color 0.15s;
      }
      .asb-collapse-btn:hover {
        background: var(--asb-surface);
        color: var(--asb-text);
      }
      @media (min-width: 1024px) {
        .asb-collapse-btn { display: flex; }
      }

      /* Mobile close — mobile only */
      .asb-close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 8px;
        background: none;
        border: none;
        color: var(--asb-text2);
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
        flex-shrink: 0;
      }
      .asb-close-btn:hover {
        background: var(--asb-surface2);
        color: var(--asb-text);
      }
      @media (min-width: 1024px) {
        .asb-close-btn { display: none; }
      }

      /* ── Nav ── */
      .asb-nav {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 12px 8px;
        scrollbar-width: none;
      }
      .asb-nav::-webkit-scrollbar { display: none; }

      .asb-section { margin-bottom: 18px; }

      .asb-section-label {
        font-size: 10px;
        font-weight: 700;
        color: var(--asb-text3);
        text-transform: uppercase;
        letter-spacing: 1.2px;
        padding: 0 12px;
        margin: 0 0 6px;
        white-space: nowrap;
      }
      .asb-section-divider {
        height: 1px;
        background: var(--asb-border);
        margin: 0 8px 8px;
      }

      /* Nav item — full */
      .asb-nav-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 12px;
        font-size: 13px;
        font-weight: 500;
        color: var(--asb-text2);
        text-decoration: none;
        margin-bottom: 2px;
        border-left: 3px solid transparent;
        border-radius: 0 var(--asb-radius) var(--asb-radius) 0;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
        white-space: nowrap;
        overflow: hidden;
      }
      .asb-nav-item:hover {
        background: var(--asb-surface);
        color: var(--asb-text);
      }
      .asb-nav-item--active {
        background: var(--asb-accentl);
        color: #818cf8;
        border-left-color: var(--asb-accent);
      }
      .asb-nav-item--active:hover {
        background: var(--asb-accentl);
        color: #818cf8;
      }

      /* Nav item — collapsed (icon only) */
      .asb-nav-item--icon-only {
        justify-content: center;
        padding: 10px;
        border-left: 3px solid transparent;
        border-radius: 0 var(--asb-radius) var(--asb-radius) 0;
      }
      .asb-nav-icon { flex-shrink: 0; }
      .asb-nav-label { overflow: hidden; }

      /* ── Footer ── */
      .asb-footer {
        padding: 10px 8px 16px;
        border-top: 1px solid var(--asb-border);
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex-shrink: 0;
      }

      .asb-user-card {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: var(--asb-radius);
        background: var(--asb-surface);
        border: 1px solid var(--asb-border);
        margin-bottom: 8px;
        overflow: hidden;
      }
      .asb-user-avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--asb-accent);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        flex-shrink: 0;
      }
      .asb-user-avatar--centered {
        margin: 4px auto 10px;
        width: 32px;
        height: 32px;
      }
      .asb-user-info { min-width: 0; flex: 1; }
      .asb-user-name {
        font-size: 12px;
        font-weight: 600;
        color: var(--asb-text);
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .asb-user-email {
        font-size: 11px;
        color: var(--asb-text3);
        margin: 2px 0 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .asb-footer-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 12px;
        border-radius: var(--asb-radius);
        font-size: 13px;
        font-weight: 500;
        color: var(--asb-text2);
        text-decoration: none;
        background: none;
        border: none;
        width: 100%;
        text-align: left;
        cursor: pointer;
        font-family: inherit;
        transition: background 0.15s, color 0.15s;
        white-space: nowrap;
        overflow: hidden;
        box-sizing: border-box;
      }
      .asb-footer-item:hover {
        background: var(--asb-surface);
        color: var(--asb-text);
      }
      .asb-footer-item--danger { color: var(--asb-red); }
      .asb-footer-item--danger:hover {
        background: var(--asb-redl);
        color: var(--asb-red);
        border: 1px solid var(--asb-redborder);
      }
      .asb-footer-item--icon-only {
        justify-content: center;
        padding: 10px;
      }

      /* ── Animations ── */
      @keyframes asbFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
    `}</style>
  );
}