import { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import useAuthStore from '../../stores/useAuthStore'
import AdminSidebar from '../admin/AdminSidebar'

export default function AdminRoute() {
  const { user, isAdmin, isLoading } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (isLoading) return <LoadingScreen label="Verifying admin access…" color="#6366f1" />
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />

  return (
    <>
      <style>{`
        .ar-root {
          display: flex;
          min-height: 100vh;
          background: #0a0909;
        }
        .ar-spacer {
          width: 240px;
          flex-shrink: 0;
          display: none;
        }
        @media (min-width: 1024px) { .ar-spacer { display: block; } }

        .ar-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .ar-topbar {
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
        @media (min-width: 1024px) { .ar-topbar { display: none; } }

        .ar-menu-btn {
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
        .ar-menu-btn:hover { background: rgba(255,255,255,0.07); color: white; }

        .ar-topbar-label {
          font-size: 12px;
          font-weight: 700;
          color: rgba(255,255,255,0.6);
          margin: 0;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .ar-content {
          flex: 1;
          padding: 32px 20px 60px;
          box-sizing: border-box;
        }
        @media (min-width: 640px)  { .ar-content { padding: 36px 28px 60px; } }
        @media (min-width: 1024px) { .ar-content { padding: 40px 40px 60px; } }

        @keyframes arFadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div className="ar-root">
        {/* ✅ fixed: mobileOpen not isOpen */}
        <AdminSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="ar-spacer" />

        <div className="ar-body">
          <div className="ar-topbar">
            <button className="ar-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={17} />
            </button>
            <p className="ar-topbar-label">ShopVerse Admin</p>
          </div>
          <div className="ar-content">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  )
}

function LoadingScreen({ label, color = '#6366f1' }) {
  return (
    <>
      <style>{`
        .ls-wrap {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          background: #0a0909;
          flex-direction: column; gap: 16px;
        }
        .ls-ring {
          width: 40px; height: 40px;
          border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.08);
          border-top-color: var(--ls-color);
          animation: lsSpin 0.75s linear infinite;
        }
        .ls-label { font-size: 13px; color: rgba(255,255,255,0.35); margin: 0; }
        @keyframes lsSpin { to { transform: rotate(360deg); } }
      `}</style>
      <div className="ls-wrap">
        <div className="ls-ring" style={{ '--ls-color': color }} />
        <p className="ls-label">{label}</p>
      </div>
    </>
  )
}