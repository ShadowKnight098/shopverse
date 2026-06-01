import { Outlet, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';
import AdminSidebar from '../admin/AdminSidebar';

/**
 * Admin route protection wrapper.
 * - Loading → centered spinner
 * - No user → redirect to /login
 * - User but not admin → redirect to /
 * - Admin → render admin layout with sidebar + Outlet
 */
export default function AdminRoute() {
  const { user, isAdmin, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-slate-950">
      {/* Fixed sidebar */}
      <AdminSidebar />

      {/* Main admin content – offset by sidebar width */}
      <div className="flex-1 ml-64">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
