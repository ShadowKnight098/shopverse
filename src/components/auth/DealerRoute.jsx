import { useState, useEffect } from 'react'
import { Outlet, Navigate, Link } from 'react-router-dom'
import { Store, Menu } from 'lucide-react'
import useAuthStore from '../../stores/useAuthStore'
import DealerSidebar from '../dealer/DealerSidebar'

export default function DealerRoute() {
  const { user, isDealer, isDealerApproved, isLoading, profile } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (isLoading) return <LoadingScreen label="Loading dealer portal…" color="#7c3aed" />
  if (!user) return <Navigate to="/login" replace />
  if (!isDealer) return <Navigate to="/dealer/register" replace />
  if (!isDealerApproved) return <PendingScreen />

  return (
    <>
      <style>{`
        .dr-root {
          display: flex;
          min-height: 100vh;
          background: #0a0909;
        }

        /* pushes content right of the fixed sidebar on desktop */
        .dr-spacer {
          width: 252px;
          flex-shrink: 0;
          display: none;
        }
        @media (min-width: 1024px) { .dr-spacer { display: block; } }

        .dr-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        /* mobile topbar */
        .dr-topbar {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 13px 18px;
          background: #0f0d12;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky;
          top: 0;
          z-index: 30;
          flex-shrink: 0;
        }
        @media (min-width: 1024px) { .dr-topbar { display: none; } }

        .dr-menu-btn {
          width: 34px; height: 34px;
          border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: rgba(255,255,255,0.55);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s, color 0.15s;
        }
        .dr-menu-btn:hover { background: rgba(255,255,255,0.07); color: white; }

        .dr-topbar-label {
          font-size: 13px;
          font-weight: 700;
          color: rgba(255,255,255,0.75);
          margin: 0;
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* page content */
        .dr-content {
          flex: 1;
          padding: 32px 20px 60px;
          box-sizing: border-box;
        }
        @media (min-width: 640px)  { .dr-content { padding: 36px 28px 60px; } }
        @media (min-width: 1024px) { .dr-content { padding: 40px 40px 60px; } }

        /* mobile overlay */
        .dr-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 39;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(3px);
          animation: drFadeIn 0.2s ease both;
        }
        .dr-overlay.visible { display: block; }
        @media (min-width: 1024px) { .dr-overlay { display: none !important; } }

        @keyframes drFadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div className="dr-root">
        <DealerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="dr-spacer" />

        <div
          className={`dr-overlay ${sidebarOpen ? 'visible' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        <div className="dr-body">
          <div className="dr-topbar">
            <button className="dr-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={17} />
            </button>
            <p className="dr-topbar-label">{profile?.shop_name || 'Dealer Portal'}</p>
          </div>
          <div className="dr-content">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Shared loading screen ── */
function LoadingScreen({ label, color = '#6366f1' }) {
  return (
    <>
      <style>{`
        .ls-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0909;
          flex-direction: column;
          gap: 16px;
        }
        .ls-ring {
          width: 40px; height: 40px;
          border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.08);
          border-top-color: var(--ls-color);
          animation: lsSpin 0.75s linear infinite;
        }
        .ls-label {
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          margin: 0;
        }
        @keyframes lsSpin { to { transform: rotate(360deg); } }
      `}</style>
      <div className="ls-wrap">
        <div className="ls-ring" style={{ '--ls-color': color }} />
        <p className="ls-label">{label}</p>
      </div>
    </>
  )
}

/* ── Pending approval screen ── */
function PendingScreen() {
  return (
    <>
      <style>{`
        .ps-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0909;
          padding: 24px;
          box-sizing: border-box;
        }
        .ps-card {
          max-width: 420px;
          width: 100%;
          background: #16141a;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 44px 36px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          animation: psPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .ps-icon-wrap {
          width: 80px; height: 80px;
          border-radius: 50%;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.2);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px;
        }
        .ps-title {
          font-size: 22px;
          font-weight: 800;
          color: rgba(255,255,255,0.9);
          margin: 0 0 12px;
          letter-spacing: -0.025em;
        }
        .ps-body {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          line-height: 1.7;
          margin: 0 0 24px;
        }
        .ps-status {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.18);
          border-radius: 12px;
          font-size: 13px;
          color: #fbbf24;
          font-weight: 500;
          margin-bottom: 20px;
        }
        .ps-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #f59e0b;
          flex-shrink: 0;
          animation: psPulse 1.5s ease-in-out infinite;
        }
        .ps-back {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          background: #7c3aed;
          color: white;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(124,58,237,0.3);
          transition: opacity 0.2s, transform 0.15s;
          box-sizing: border-box;
        }
        .ps-back:hover { opacity: 0.88; transform: translateY(-1px); }
        @keyframes psPop {
          from { opacity: 0; transform: scale(0.9) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes psPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
      <div className="ps-wrap">
        <div className="ps-card">
          <div className="ps-icon-wrap">
            <Store size={34} color="#f59e0b" />
          </div>
          <h2 className="ps-title">Application Under Review</h2>
          <p className="ps-body">
            Your dealer application has been submitted. Our team will review and approve your account within 24 hours.
          </p>
          <div className="ps-status">
            <span className="ps-dot" />
            Awaiting admin approval
          </div>
          <Link to="/" className="ps-back">Back to Store</Link>
        </div>
      </div>
    </>
  )
}