import { NavLink, Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, PlusCircle, Store, ArrowLeft, LogOut, X } from 'lucide-react'
import useAuthStore from '../../stores/useAuthStore'

const navItems = [
  { label: 'Dashboard',   icon: LayoutDashboard, path: '/dealer' },
  { label: 'My Products', icon: Package,          path: '/dealer/products' },
  { label: 'Add Product', icon: PlusCircle,       path: '/dealer/products/new' },
]

export default function DealerSidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { logout, profile } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
    if (onClose) onClose()
  }

  return (
    <>
      <style>{`
        .ds-aside {
          position: fixed;
          left: 0; top: 0; bottom: 0;
          width: 252px;
          background: #0f0d12;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          z-index: 40;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.32,0.72,0,1);
        }
        .ds-aside.open { transform: translateX(0); }
        @media (min-width: 1024px) { .ds-aside { transform: translateX(0); } }

        /* ── Close btn (mobile) ── */
        .ds-close {
          display: flex;
          position: absolute;
          right: 14px; top: 14px;
          width: 30px; height: 30px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: rgba(255,255,255,0.4);
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .ds-close:hover { background: rgba(255,255,255,0.08); color: white; }
        @media (min-width: 1024px) { .ds-close { display: none; } }

        /* ── Logo ── */
        .ds-logo-wrap {
          padding: 22px 20px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .ds-logo-link {
          display: flex;
          align-items: center;
          gap: 11px;
          text-decoration: none;
        }
        .ds-logo-icon {
          width: 38px; height: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, #7c3aed, #c026d3);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(124,58,237,0.35);
        }
        .ds-logo-text {}
        .ds-logo-name {
          font-size: 13px;
          font-weight: 800;
          color: #fff;
          margin: 0 0 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 128px;
          display: block;
          letter-spacing: -0.01em;
        }
        .ds-logo-tag {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #a78bfa;
        }

        /* ── Dealer badge ── */
        .ds-badge {
          margin: 12px 12px 0;
          padding: 10px 14px;
          background: rgba(124,58,237,0.08);
          border: 1px solid rgba(124,58,237,0.18);
          border-radius: 12px;
          flex-shrink: 0;
        }
        .ds-badge-name {
          font-size: 12px;
          font-weight: 600;
          color: #c4b5fd;
          margin: 0 0 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ds-badge-status {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ds-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #34d399;
          flex-shrink: 0;
          box-shadow: 0 0 6px rgba(52,211,153,0.6);
        }
        .ds-badge-label {
          font-size: 10px;
          font-weight: 600;
          color: #34d399;
          letter-spacing: 0.04em;
        }

        /* ── Nav ── */
        .ds-nav {
          flex: 1;
          padding: 14px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }
        .ds-nav::-webkit-scrollbar { width: 0; }

        .ds-nav-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 14px;
          border-radius: 11px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          border-left: 2.5px solid transparent;
          transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.15s;
          position: relative;
        }
        .ds-nav-item:hover {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.85);
          transform: translateX(2px);
        }
        .ds-nav-item.active {
          background: rgba(124,58,237,0.15);
          color: #a78bfa;
          border-left-color: #7c3aed;
          font-weight: 700;
        }
        .ds-nav-item.active:hover { transform: none; }

        /* ── Bottom actions ── */
        .ds-bottom {
          padding: 10px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex-shrink: 0;
        }
        .ds-bottom-link {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 14px;
          border-radius: 11px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .ds-bottom-link:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); }
        .ds-logout {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 14px;
          border-radius: 11px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(239,68,68,0.7);
          background: transparent;
          border: none;
          font-family: inherit;
          width: 100%;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          text-align: left;
        }
        .ds-logout:hover { background: rgba(239,68,68,0.1); color: #f87171; }
      `}</style>

      <aside className={`ds-aside ${isOpen ? 'open' : ''}`}>

        {/* Close (mobile) */}
        <button className="ds-close" onClick={onClose} aria-label="Close sidebar">
          <X size={16} />
        </button>

        {/* Logo */}
        <div className="ds-logo-wrap">
          <Link to="/dealer" className="ds-logo-link" onClick={onClose}>
            <div className="ds-logo-icon">
              <Store size={18} color="white" />
            </div>
            <div className="ds-logo-text">
              <span className="ds-logo-name">{profile?.shop_name || 'My Store'}</span>
              <span className="ds-logo-tag">Dealer Portal</span>
            </div>
          </Link>
        </div>

        {/* Dealer badge */}
        <div className="ds-badge">
          <p className="ds-badge-name">{profile?.name || 'Dealer'}</p>
          <div className="ds-badge-status">
            <span className="ds-badge-dot" />
            <span className="ds-badge-label">Active Dealer</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="ds-nav">
          {navItems.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/dealer'}
              onClick={onClose}
              className={({ isActive }) => `ds-nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="ds-bottom">
          <Link to="/" className="ds-bottom-link" onClick={onClose}>
            <ArrowLeft size={17} />
            Back to Store
          </Link>
          <button className="ds-logout" onClick={handleLogout}>
            <LogOut size={17} />
            Logout
          </button>
        </div>

      </aside>
    </>
  )
}