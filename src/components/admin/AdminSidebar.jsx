import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  MessageSquare,
  ArrowLeft,
  LogOut,
  Store,
} from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';

/**
 * Admin sidebar navigation – fixed left panel with nav items and footer actions.
 */
const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Dealers', icon: Store, path: '/admin/dealers' },
  { label: 'Products', icon: Package, path: '/admin/products' },
  { label: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
  { label: 'Sales', icon: Tag, path: '/admin/sales' },
  { label: 'Messages', icon: MessageSquare, path: '/admin/messages' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white flex flex-col z-40">
      {/* Logo / Title */}
      <div className="px-6 py-6 border-b border-slate-800">
        <Link to="/admin" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/25">
            SV
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">ShopVerse</h1>
            <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-semibold">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
               transition-all duration-200
               ${
                 isActive
                   ? 'bg-indigo-600/20 text-indigo-400 border-l-[3px] border-indigo-400'
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
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                     text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Store
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium w-full
                     text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
