import React, { Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useThemeStore from './stores/useThemeStore.js'
import useAuthStore from './stores/useAuthStore.js'

/* ---------- Layout ---------- */
import Layout from './components/layout/Layout.jsx'

/* ---------- Route guards ---------- */
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import AdminRoute from './components/auth/AdminRoute.jsx'
import DealerRoute from './components/auth/DealerRoute.jsx'

/* ---------- Pages (lazy-loaded for code splitting) ---------- */
const HomePage = React.lazy(() => import('./pages/HomePage.jsx'))
const ProductsPage = React.lazy(() => import('./pages/ProductsPage.jsx'))
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage.jsx'))
const CartPage = React.lazy(() => import('./pages/CartPage.jsx'))
const WishlistPage = React.lazy(() => import('./pages/WishlistPage.jsx'))
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage.jsx'))
const LoginPage = React.lazy(() => import('./pages/LoginPage.jsx'))
const SignupPage = React.lazy(() => import('./pages/SignupPage.jsx'))
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage.jsx'))
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage.jsx'))
const DashboardPage = React.lazy(() => import('./pages/DashboardPage.jsx'))
const SalesPage = React.lazy(() => import('./pages/SalesPage.jsx'))
const AboutPage = React.lazy(() => import('./pages/AboutPage.jsx'))
const ContactPage = React.lazy(() => import('./pages/ContactPage.jsx'))
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard.jsx'))
const AdminProducts = React.lazy(() => import('./pages/admin/AdminProducts.jsx'))
const AdminOrders = React.lazy(() => import('./pages/admin/AdminOrders.jsx'))
const AdminSales = React.lazy(() => import('./pages/admin/AdminSales.jsx'))
const AdminMessages = React.lazy(() => import('./pages/admin/AdminMessages.jsx'))
const AdminDealers = React.lazy(() => import('./pages/admin/AdminDealers.jsx'))

const DealerRegisterPage = React.lazy(() => import('./pages/DealerRegisterPage.jsx'))
const DealerDashboardPage = React.lazy(() => import('./pages/DealerDashboardPage.jsx'))
const DealerProductsPage = React.lazy(() => import('./pages/DealerProductsPage.jsx'))
const DealerAddProductPage = React.lazy(() => import('./pages/DealerAddProductPage.jsx'))
const DealerEditProductPage = React.lazy(() => import('./pages/DealerEditProductPage.jsx'))

/** Centered loading spinner shown while lazy chunks are loading */
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-background-dark">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}

export default function App() {
  const initTheme = useThemeStore((s) => s.initTheme)
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initTheme()
    const unsubscribe = initialize()
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [initTheme, initialize])

  return (
    <>
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--toast-bg, #fff)',
            color: 'var(--toast-color, #1e293b)',
          },
          className: 'dark:!bg-surface-dark dark:!text-white',
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* ---- Public routes wrapped in Layout ---- */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />

            {/* ---- Authenticated routes ---- */}
            <Route
              path="checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* ---- Admin routes ---- */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="sales" element={<AdminSales />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="dealers" element={<AdminDealers />} />
          </Route>

          {/* ---- Dealer routes ---- */}
          <Route path="/dealer/register" element={
            <ProtectedRoute>
              <DealerRegisterPage />
            </ProtectedRoute>
          } />
          <Route path="/dealer" element={<DealerRoute />}>
            <Route index element={<DealerDashboardPage />} />
            <Route path="products" element={<DealerProductsPage />} />
            <Route path="products/new" element={<DealerAddProductPage />} />
            <Route path="products/:id/edit" element={<DealerEditProductPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}
