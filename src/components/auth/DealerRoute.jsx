import { Outlet, Navigate } from 'react-router-dom'
import { Loader2, Store } from 'lucide-react'
import useAuthStore from '../../stores/useAuthStore'
import DealerSidebar from '../dealer/DealerSidebar'

/**
 * DealerRoute — protects dealer pages.
 * - Not logged in → /login
 * - Logged in but not dealer → /dealer/register
 * - Dealer but not approved → pending approval screen
 * - Approved dealer → show dealer layout
 */
export default function DealerRoute() {
  const { user, isDealer, isDealerApproved, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-violet-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading dealer portal...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (!isDealer) return <Navigate to="/dealer/register" replace />

  if (!isDealerApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-6">
        <div className="max-w-md w-full text-center bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-xl border border-gray-100 dark:border-slate-700">
          <div className="w-20 h-20 mx-auto mb-6 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
            <Store size={36} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Application Under Review
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
            Your dealer application has been submitted successfully. Our admin team will review and approve your account within 24 hours.
          </p>
          <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-sm text-amber-700 dark:text-amber-400">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            Awaiting admin approval
          </div>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 mt-6 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all"
          >
            Back to Store
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-slate-950">
      <DealerSidebar />
      <div className="flex-1 ml-64">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
