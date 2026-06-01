import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import DealerSidebar from '../components/dealer/DealerSidebar'

export default function DealerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <style>{`
        .dl-root {
          display: flex;
          min-height: 100vh;
          background: #0a0909;
        }

        /* ── Sidebar spacer (desktop) ── */
        .dl-sidebar-spacer {
          width: 252px;
          flex-shrink: 0;
          display: none;
        }
        @media (min-width: 1024px) {
          .dl-sidebar-spacer { display: block; }
        }

        /* ── Main area ── */
        .dl-main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        /* ── Mobile topbar ── */
        .dl-topbar {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 20px;
          background: #0f0d12;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky;
          top: 0;
          z-index: 30;
        }
        @media (min-width: 1024px) { .dl-topbar { display: none; } }

        .dl-menu-btn {
          width: 36px; height: 36px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: rgba(255,255,255,0.6);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .dl-menu-btn:hover { background: rgba(255,255,255,0.07); color: white; }

        .dl-topbar-title {
          font-size: 14px;
          font-weight: 700;
          color: rgba(255,255,255,0.85);
          margin: 0;
          letter-spacing: -0.01em;
        }

        /* ── Page content ── */
        .dl-content {
          flex: 1;
          padding: 32px 24px 60px;
          box-sizing: border-box;
        }
        @media (min-width: 640px)  { .dl-content { padding: 36px 32px 60px; } }
        @media (min-width: 1024px) { .dl-content { padding: 40px 40px 60px; } }

        /* ── Mobile overlay ── */
        .dl-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 39;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(3px);
        }
        .dl-overlay.visible { display: block; }
        @media (min-width: 1024px) { .dl-overlay { display: none !important; } }
      `}</style>

      <div className="dl-root">

        {/* Sidebar */}
        <DealerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Spacer so content doesn't go under sidebar on desktop */}
        <div className="dl-sidebar-spacer" />

        {/* Mobile overlay */}
        <div
          className={`dl-overlay ${sidebarOpen ? 'visible' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Main */}
        <div className="dl-main">

          {/* Mobile topbar */}
          <div className="dl-topbar">
            <button
              className="dl-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <p className="dl-topbar-title">Dealer Portal</p>
          </div>

          {/* Page content */}
          <div className="dl-content">
            <Outlet />
          </div>

        </div>
      </div>
    </>
  )
}