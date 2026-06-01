import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Store,
  ArrowLeft,
  LogOut,
} from 'lucide-react'
import useAuthStore from '../../stores/useAuthStore'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dealer' },
  { label: 'My Products', icon: Package, path: '/dealer/products' },
  { label: 'Add Product', icon: PlusCircle, path: '/dealer/products/new' },
]

export default function DealerSidebar() {
  const navigate = useNavigate()
  const { logout, profile } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-800">
        <Link to="/dealer" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/25">
            <Store size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight text-white">
              {profile?.shop_name || 'My Store'}
            </h1>
            <p className="text-[10px] text-violet-400 uppercase tracking-widest font-semibold">
              Dealer Portal
            </p>
          </div>
        </Link>
      </div>

      {/* Dealer info badge */}
      <div className="px-4 py-3 mx-3 mt-3 bg-violet-600/10 border border-violet-500/20 rounded-xl">
        <p className="text-xs text-violet-300 font-medium truncate">
          {profile?.name || 'Dealer'}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-[10px] text-green-400 font-medium">Active Dealer</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/dealer'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-violet-600/20 text-violet-400 border-l-[3px] border-violet-400'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800 border-l-[3px] border-transparent'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Store
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium w-full text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
