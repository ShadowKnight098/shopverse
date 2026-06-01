import { Outlet, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';

/**
 * Route protection wrapper.
 * Shows a spinner while auth state is loading.
 * Redirects unauthenticated users to /login.
 * Renders children if provided, otherwise falls back to Outlet for nested routes.
 */
export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Checking authentication…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
}
