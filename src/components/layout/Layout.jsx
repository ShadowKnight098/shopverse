import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartSidebar from '../cart/CartSidebar';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <ScrollToTop />
      <Navbar />

      {/* pt-16 matches the fixed 64px navbar height */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      <Footer />

      {/* Global cart sidebar */}
      <CartSidebar />
    </div>
  );
}
