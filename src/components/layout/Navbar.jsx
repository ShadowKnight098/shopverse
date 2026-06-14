  import { useState, useEffect, useRef, useCallback } from 'react';
  import { Link, NavLink, useNavigate } from 'react-router-dom';
  import {
    ShoppingCart, Heart, Sun, Moon, Menu, X,
    Search, User, LogOut, LayoutDashboard, Shield, ChevronDown, Store, TrendingUp,
  } from 'lucide-react';
  import useCartStore from '../../stores/useCartStore';
  import useWishlistStore from '../../stores/useWishlistStore';
  import useThemeStore from '../../stores/useThemeStore';
  import useAuthStore from '../../stores/useAuthStore';
  import { NAV_LINKS } from '../../lib/constants.js';
  import { supabase } from '../../lib/supabase.js';

  export default function Navbar() {
    const [mobileOpen, setMobileOpen]   = useState(false);
    const [searchOpen, setSearchOpen]   = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [scrolled, setScrolled]       = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [sugLoading, setSugLoading]   = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const navigate    = useNavigate();
    const searchRef   = useRef(null);
    const userMenuRef = useRef(null);
    const sugRef      = useRef(null);
    const debounceRef = useRef(null);

    const cartItems   = useCartStore((s) => s.items);
    const setCartOpen = useCartStore((s) => s.setCartOpen);
    const wishlistItems = useWishlistStore((s) => s.items);
    const { theme, toggleTheme } = useThemeStore();
    const { user, profile, isAdmin, isDealer, logout } = useAuthStore();

    const cartCount = cartItems?.reduce((n, i) => n + (i.quantity || 1), 0) || 0;
    const wishCount = wishlistItems?.length || 0;

    useEffect(() => {
      const onScroll = () => setScrolled(window.scrollY > 12);
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
      if (searchOpen) searchRef.current?.focus();
    }, [searchOpen]);

    useEffect(() => {
      const handler = (e) => {
        if (userMenuRef.current && !userMenuRef.current.contains(e.target))
          setUserMenuOpen(false);
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
      document.body.style.overflow = mobileOpen ? 'hidden' : '';
      return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    /* Debounced search suggestions from Supabase */
    const fetchSuggestions = useCallback(async (query) => {
      if (!query || query.trim().length < 2) {
        setSuggestions([]);
        setSugLoading(false);
        return;
      }
      setSugLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, image_url, category')
          .ilike('name', `%${query.trim()}%`)
          .limit(6);
        if (!error) setSuggestions(data || []);
      } catch (_) {
        setSuggestions([]);
      } finally {
        setSugLoading(false);
      }
    }, []);

    /* Handle typing — debounce 300 ms */
    const handleSearchChange = (e) => {
      const val = e.target.value;
      setSearchQuery(val);
      setActiveIndex(-1);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
    };

    const closeSuggestions = () => {
      setSuggestions([]);
      setActiveIndex(-1);
    };

    const goToProduct = (product) => {
      navigate(`/products/${product.id}`);
      setSearchQuery('');
      setSearchOpen(false);
      setMobileOpen(false);
      closeSuggestions();
    };

    const handleSearch = (e) => {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        goToProduct(suggestions[activeIndex]);
        return;
      }
      const q = searchQuery.trim();
      if (q) {
        navigate(`/products?search=${encodeURIComponent(q)}`);
        setSearchQuery('');
        setSearchOpen(false);
        setMobileOpen(false);
        closeSuggestions();
      }
    };

    /* Keyboard navigation for suggestions */
    const handleKeyDown = (e) => {
      if (!suggestions.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === 'Escape') {
        closeSuggestions();
        setSearchOpen(false);
      }
    };

    /* Close suggestions on outside click */
    useEffect(() => {
      const handler = (e) => {
        if (sugRef.current && !sugRef.current.contains(e.target)) {
          closeSuggestions();
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
      logout();
      setUserMenuOpen(false);
      setMobileOpen(false);
      navigate('/');
    };

    const isDark = theme === 'dark';

    /* ─── inline style helpers ─── */
    const S = {
      header: {
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: 'background 0.3s, box-shadow 0.3s, border-color 0.3s',
        background: scrolled
          ? (isDark ? 'rgba(15,23,42,0.96)' : 'rgba(255,255,255,0.96)')
          : (isDark ? 'rgba(15,23,42,0.82)' : 'rgba(255,255,255,0.82)'),
        borderBottom: scrolled
          ? `1px solid ${isDark ? '#1e293b' : '#f0f0f0'}`
          : '1px solid transparent',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.07)' : 'none',
      },
      inner: {
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 16px',
      },
      row: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
      },
      logoShop: {
        fontSize: 22,
        fontWeight: 900,
        background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      },
      logoVerse: {
        fontSize: 22,
        fontWeight: 700,
        color: isDark ? '#f9fafb' : '#111827',
        textDecoration: 'none',
        transition: 'color 0.2s',
      },
      iconBtn: {
        position: 'relative',
        padding: '8px',
        borderRadius: 12,
        color: isDark ? '#d1d5db' : '#4b5563',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s',
        textDecoration: 'none',
      },
      badge: (color) => ({
        position: 'absolute',
        top: -2, right: -2,
        minWidth: 18, minHeight: 18,
        padding: '0 3px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 9,
        fontWeight: 700,
        color: 'white',
        background: color,
        borderRadius: 9999,
        border: `2px solid ${isDark ? '#0f172a' : 'white'}`,
      }),
      loginBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 16px',
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 600,
        background: '#4f46e5',
        color: 'white',
        textDecoration: 'none',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.2s',
        marginLeft: 4,
      },
      avatarBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px',
        borderRadius: 12,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.2s',
      },
      avatarCircle: {
        width: 32, height: 32,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 13,
        fontWeight: 700,
      },
      dropdown: {
        position: 'absolute',
        right: 0,
        top: 'calc(100% + 8px)',
        width: 224,
        background: isDark ? '#1e293b' : 'white',
        borderRadius: 14,
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        border: `1px solid ${isDark ? '#334155' : '#f0f0f0'}`,
        overflow: 'hidden',
        zIndex: 50,
        animation: 'navSlideDown 0.18s ease',
      },
      dropdownHeader: {
        padding: '12px 16px',
        background: isDark
          ? 'linear-gradient(to right, rgba(79,70,229,0.15), rgba(124,58,237,0.15))'
          : 'linear-gradient(to right, #eef2ff, #f5f3ff)',
        borderBottom: `1px solid ${isDark ? '#334155' : '#f0f0f0'}`,
      },
      dropdownItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px',
        fontSize: 13,
        color: isDark ? '#d1d5db' : '#374151',
        textDecoration: 'none',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        width: '100%',
        textAlign: 'left',
        transition: 'background 0.15s',
      },
      searchBar: {
        borderTop: `1px solid ${isDark ? '#1e293b' : '#f0f0f0'}`,
        background: isDark ? '#0f172a' : 'white',
        animation: 'navSlideDown 0.18s ease',
      },
      searchInput: {
        width: '100%',
        paddingLeft: 44,
        paddingRight: 44,
        paddingTop: 11,
        paddingBottom: 11,
        borderRadius: 12,
        border: `1px solid ${isDark ? '#475569' : '#e5e7eb'}`,
        background: isDark ? '#1e293b' : '#f9fafb',
        color: isDark ? '#f9fafb' : '#111827',
        fontSize: 14,
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      },
      /* Mobile drawer */
      overlay: {
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.5)',
      },
      drawer: {
        position: 'absolute',
        top: 0, right: 0, bottom: 0,
        width: 'min(320px, 85vw)',
        background: isDark ? '#0f172a' : 'white',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.2)',
        animation: 'navSlideInRight 0.25s cubic-bezier(0.22,1,0.36,1)',
      },
      drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: `1px solid ${isDark ? '#1e293b' : '#f0f0f0'}`,
      },
      drawerSearch: {
        padding: '16px 24px',
        borderBottom: `1px solid ${isDark ? '#1e293b' : '#f0f0f0'}`,
      },
      drawerNav: {
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
      },
      drawerFooter: {
        borderTop: `1px solid ${isDark ? '#1e293b' : '#f0f0f0'}`,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      },
      mobileSearchInput: {
        width: '100%',
        paddingLeft: 40,
        paddingRight: 16,
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 12,
        border: `1px solid ${isDark ? '#475569' : '#e5e7eb'}`,
        background: isDark ? '#1e293b' : '#f9fafb',
        color: isDark ? '#f9fafb' : '#111827',
        fontSize: 13,
        outline: 'none',
        boxSizing: 'border-box',
      },
    };

    /* hover helper via onMouseEnter/Leave */
    const hov = (base, hoverBg) => ({
      ...base,
      onMouseEnter: (e) => { e.currentTarget.style.background = hoverBg; },
      onMouseLeave: (e) => { e.currentTarget.style.background = base.background || 'none'; },
    });

    return (
      <>
        <style>{`
          @keyframes navSlideDown {
            from { opacity: 0; transform: translateY(-8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes navSlideInRight {
            from { transform: translateX(100%); }
            to   { transform: translateX(0); }
          }
          @keyframes sugFadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .nav-icon-btn:hover { background: ${isDark ? 'rgba(51,65,85,0.7)' : 'rgba(243,244,246,1)'} !important; }
          .nav-avatar-btn:hover { background: ${isDark ? 'rgba(51,65,85,0.7)' : 'rgba(243,244,246,1)'} !important; }
          .nav-login-btn:hover { background: #4338ca !important; }
          .nav-dd-item:hover { background: ${isDark ? 'rgba(51,65,85,0.6)' : '#eef2ff'} !important; }
          .nav-dd-item-red:hover { background: ${isDark ? 'rgba(127,29,29,0.2)' : '#fef2f2'} !important; }
          .nav-search-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; }
          .nav-mobile-btn:hover { background: ${isDark ? 'rgba(30,41,59,0.8)' : '#f9fafb'} !important; }
          .nav-close-btn:hover  { background: ${isDark ? 'rgba(30,41,59,0.8)' : '#f3f4f6'} !important; }
          .sug-item:hover, .sug-item.active { background: ${isDark ? 'rgba(79,70,229,0.18)' : '#eef2ff'} !important; }
          .sug-view-all:hover { background: ${isDark ? 'rgba(51,65,85,0.6)' : '#f9fafb'} !important; }

          /* Desktop nav only visible ≥1024px */
          .nav-desktop { display: none; }
          @media (min-width: 1024px) { .nav-desktop { display: flex; align-items: center; gap: 2px; } }

          /* Mobile menu toggle hidden ≥1024px */
          .nav-hamburger { display: flex; }
          @media (min-width: 1024px) { .nav-hamburger { display: none; } }

          /* User menu hidden on mobile, show ≥640px */
          .nav-user-desktop { display: none; }
          @media (min-width: 640px) { .nav-user-desktop { display: block; } }

          /* Login btn hidden on mobile */
          .nav-login { display: none; }
          @media (min-width: 640px) { .nav-login { display: inline-flex; } }

          /* Inner padding responsive */
          @media (min-width: 640px)  { .nav-inner { padding: 0 24px !important; } }
          @media (min-width: 1024px) { .nav-inner { padding: 0 32px !important; } }
        `}</style>

        {/* ── Header ── */}
        <header style={S.header}>
          <div className="nav-inner" style={S.inner}>
            <div style={S.row}>

              {/* Logo */}
              <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: 1 }}>
                <span style={S.logoShop}>Shop</span>
                <span style={S.logoVerse}>Verse</span>
              </Link>

              {/* Desktop nav */}
              <nav className="nav-desktop">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    style={({ isActive }) => ({
                      padding: '8px 14px',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 500,
                      textDecoration: 'none',
                      transition: 'background 0.2s, color 0.2s',
                      background: isActive ? (isDark ? 'rgba(79,70,229,0.2)' : '#eef2ff') : 'transparent',
                      color: isActive
                        ? (isDark ? '#818cf8' : '#4f46e5')
                        : (isDark ? '#d1d5db' : '#4b5563'),
                    })}
                  >
                    {link.name}
                  </NavLink>
                ))}
              </nav>

              {/* Right actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>

                {/* Search */}
                <button
                  className="nav-icon-btn"
                  onClick={() => setSearchOpen(!searchOpen)}
                  style={S.iconBtn}
                  aria-label="Search"
                >
                  <Search size={19} />
                </button>

                {/* Theme */}
                <button
                  className="nav-icon-btn"
                  onClick={toggleTheme}
                  style={S.iconBtn}
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun size={19} /> : <Moon size={19} />}
                </button>

                {/* Wishlist */}
                <Link to="/wishlist" className="nav-icon-btn" style={S.iconBtn} aria-label="Wishlist">
                  <Heart size={19} />
                  {wishCount > 0 && (
                    <span style={S.badge('#ec4899')}>{wishCount > 99 ? '99+' : wishCount}</span>
                  )}
                </Link>

                {/* Cart */}
                <button
                  className="nav-icon-btn"
                  onClick={() => setCartOpen(true)}
                  style={S.iconBtn}
                  aria-label="Cart"
                >
                  <ShoppingCart size={19} />
                  {cartCount > 0 && (
                    <span style={S.badge('#4f46e5')}>{cartCount > 99 ? '99+' : cartCount}</span>
                  )}
                </button>

                {/* User menu (desktop) */}
                {user ? (
                  <div className="nav-user-desktop" style={{ position: 'relative' }} ref={userMenuRef}>
                    <button
                      className="nav-avatar-btn"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      style={S.avatarBtn}
                    >
                      <div style={S.avatarCircle}>
                        {(profile?.name || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <ChevronDown
                        size={14}
                        style={{
                          color: isDark ? '#94a3b8' : '#6b7280',
                          transition: 'transform 0.2s',
                          transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      />
                    </button>

                    {userMenuOpen && (
                      <div style={S.dropdown}>
                        <div style={S.dropdownHeader}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#f9fafb' : '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {profile?.name || 'User'}
                          </p>
                          <p style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#6b7280', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.email}
                          </p>
                        </div>

                        <Link
                          to="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="nav-dd-item"
                          style={S.dropdownItem}
                        >
                          <LayoutDashboard size={15} style={{ color: '#6366f1', flexShrink: 0 }} />
                          Dashboard
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="nav-dd-item"
                            style={S.dropdownItem}
                          >
                            <Shield size={15} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                            Admin Panel
                          </Link>
                        )}

                        <Link
                          to={isDealer ? "/dealer" : "/dealer/register"}
                          onClick={() => setUserMenuOpen(false)}
                          className="nav-dd-item"
                          style={S.dropdownItem}
                        >
                          <Store size={15} style={{ color: '#f59e0b', flexShrink: 0 }} />
                          {isDealer ? 'Dealer Portal' : 'Become a Dealer'}
                        </Link>

                        <div style={{ borderTop: `1px solid ${isDark ? '#334155' : '#f0f0f0'}` }}>
                          <button
                            onClick={handleLogout}
                            className="nav-dd-item-red"
                            style={{ ...S.dropdownItem, color: isDark ? '#f87171' : '#dc2626' }}
                          >
                            <LogOut size={15} style={{ flexShrink: 0 }} />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="nav-login nav-login-btn"
                    style={S.loginBtn}
                  >
                    <User size={15} />
                    Login
                  </Link>
                )}

                {/* Mobile hamburger */}
                <button
                  className="nav-hamburger nav-icon-btn"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  style={S.iconBtn}
                  aria-label="Menu"
                >
                  {mobileOpen ? <X size={21} /> : <Menu size={21} />}
                </button>
              </div>
            </div>
          </div>

          {/* Search bar */}
       {searchOpen && (
  <div style={S.searchBar}>
    <div className="nav-inner" style={{ ...S.inner, padding: '12px 16px' }}>
      <div ref={sugRef} style={{ position: 'relative' }}>
        <form onSubmit={handleSearch} style={{ position: 'relative' }}>
          <Search
            size={17}
            style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: '#6366f1', pointerEvents: 'none',
            }}
          />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder="Search products, categories..."
            className="nav-search-input"
            style={S.searchInput}
            autoComplete="off"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchOpen(false); setSearchQuery(''); closeSuggestions(); }}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: isDark ? '#334155' : '#f3f4f6',
                border: 'none', cursor: 'pointer',
                color: isDark ? '#94a3b8' : '#6b7280',
                display: 'flex', padding: '4px', borderRadius: 6,
              }}
            >
              <X size={14} />
            </button>
          )}
        </form>

        {/* Suggestions Dropdown */}
        {(suggestions.length > 0 || sugLoading) && searchQuery.length >= 2 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0, right: 0,
            background: isDark ? '#1e293b' : 'white',
            borderRadius: 18,
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
            overflow: 'hidden',
            zIndex: 999,
            animation: 'sugFadeIn 0.15s ease',
          }}>

            {/* Category pills */}
            {!sugLoading && suggestions.length > 0 && (
              <div style={{
                display: 'flex',
                gap: 6,
                padding: '10px 14px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                borderBottom: `1px solid ${isDark ? '#1e293b' : '#f3f4f6'}`,
              }}>
                {['All', ...new Set(suggestions.map(p => p.category).filter(Boolean))].map((cat, i) => (
                  <span key={cat} style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 20,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    flexShrink: 0,
                    background: i === 0 ? '#4f46e5' : (isDark ? '#0f172a' : '#f3f4f6'),
                    color: i === 0 ? 'white' : (isDark ? '#94a3b8' : '#6b7280'),
                    border: i === 0 ? 'none' : `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                  }}>
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {/* Results header */}
            {!sugLoading && suggestions.length > 0 && (
              <div style={{ padding: '6px 14px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? '#475569' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Top results
                </span>
                <span style={{ fontSize: 10, color: isDark ? '#475569' : '#9ca3af' }}>
                  {suggestions.length} found
                </span>
              </div>
            )}

            {/* Loading skeleton */}
            {sugLoading && [1, 2].map(i => (
              <div key={i} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${isDark ? '#1e293b' : '#f3f4f6'}` }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: isDark ? '#334155' : '#f3f4f6', flexShrink: 0, animation: 'pulse 1.4s ease infinite' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ width: '55%', height: 11, borderRadius: 6, background: isDark ? '#334155' : '#f3f4f6', marginBottom: 8, animation: 'pulse 1.4s ease infinite' }} />
                  <div style={{ width: '30%', height: 8, borderRadius: 6, background: isDark ? '#334155' : '#f3f4f6', animation: 'pulse 1.4s ease 0.2s infinite' }} />
                </div>
                <div style={{ width: 52, height: 18, borderRadius: 6, background: isDark ? '#334155' : '#f3f4f6', animation: 'pulse 1.4s ease infinite' }} />
              </div>
            ))}

            {/* Results */}
            {!sugLoading && suggestions.map((product, idx) => {
              const isActive = activeIndex === idx;
              // Highlight matching text
              const nameLC = product.name.toLowerCase();
              const queryLC = searchQuery.toLowerCase().trim();
              const matchIdx = nameLC.indexOf(queryLC);
              let nameEl;
              if (matchIdx >= 0 && queryLC.length > 0) {
                nameEl = (
                  <span>
                    {product.name.slice(0, matchIdx)}
                    <mark style={{ background: isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.15)', color: isDark ? '#a5b4fc' : '#4338ca', borderRadius: 3, padding: '0 2px', fontWeight: 700 }}>
                      {product.name.slice(matchIdx, matchIdx + queryLC.length)}
                    </mark>
                    {product.name.slice(matchIdx + queryLC.length)}
                  </span>
                );
              } else {
                nameEl = product.name;
              }

              return (
                <button
                  key={product.id}
                  className={`sug-item${isActive ? ' active' : ''}`}
                  onMouseDown={() => goToProduct(product)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    background: isActive
                      ? (isDark ? 'rgba(79,70,229,0.15)' : 'rgba(79,70,229,0.06)')
                      : 'transparent',
                    borderLeft: isActive ? '2px solid #6366f1' : '2px solid transparent',
                    borderBottom: idx < suggestions.length - 1
                      ? `1px solid ${isDark ? '#1e293b' : '#f3f4f6'}`
                      : 'none',
                    borderTop: 'none',
                    borderRight: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.12s, border-color 0.12s',
                  }}
                >
                  {/* Product image */}
                  <div style={{
                    width: 48, height: 48,
                    borderRadius: 12,
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: isDark ? '#334155' : '#f3f4f6',
                    border: `1px solid ${isDark ? '#475569' : '#e5e7eb'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <TrendingUp size={19} style={{ color: isDark ? '#64748b' : '#9ca3af' }} />
                    )}
                  </div>

                  {/* Product info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: isDark ? '#f1f5f9' : '#111827',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      lineHeight: 1.4,
                    }}>
                      {nameEl}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                      {product.category && (
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: isDark ? '#64748b' : '#9ca3af',
                          background: isDark ? '#0f172a' : '#f3f4f6',
                          border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                          borderRadius: 4,
                          padding: '1px 5px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}>
                          {product.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <span style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: isDark ? '#818cf8' : '#4f46e5',
                    flexShrink: 0,
                    letterSpacing: '-0.02em',
                  }}>
                    ₹{Number(product.price).toLocaleString('en-IN')}
                  </span>
                </button>
              );
            })}

            {/* No results */}
            {!sugLoading && suggestions.length === 0 && searchQuery.length >= 2 && (
              <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                <Search size={28} style={{ color: isDark ? '#334155' : '#e5e7eb', marginBottom: 8 }} />
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: isDark ? '#64748b' : '#9ca3af' }}>
                  No products found
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: isDark ? '#475569' : '#d1d5db' }}>
                  Try a different keyword
                </p>
              </div>
            )}

            {/* View all footer */}
            {!sugLoading && suggestions.length > 0 && (
              <button
                className="sug-view-all"
                onMouseDown={() => {
                  navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchOpen(false);
                  setSearchQuery('');
                  closeSuggestions();
                }}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: isDark ? '#818cf8' : '#4f46e5',
                  background: isDark ? '#0f172a' : '#fafafa',
                  border: 'none',
                  borderTop: `1px solid ${isDark ? '#1e293b' : '#e5e7eb'}`,
                  cursor: 'pointer',
                  letterSpacing: '0.03em',
                  transition: 'background 0.15s',
                }}
              >
                <Search size={12} />
                View all results for &ldquo;{searchQuery}&rdquo;
                <ChevronDown size={12} style={{ transform: 'rotate(-90deg)' }} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>

    <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
    `}</style>
  </div>
)}
        </header>

        {/* ── Mobile Drawer ── */}
        {mobileOpen && (
          <div style={S.overlay} onClick={() => setMobileOpen(false)}>
            <div style={S.drawer} onClick={(e) => e.stopPropagation()}>

              {/* Drawer header */}
              <div style={S.drawerHeader}>
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: 1 }}
                >
                  <span style={S.logoShop}>Shop</span>
                  <span style={{ ...S.logoVerse, fontSize: 20 }}>Verse</span>
                </Link>
                <button
                  className="nav-close-btn"
                  onClick={() => setMobileOpen(false)}
                  style={{ ...S.iconBtn, padding: 8 }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer search */}
              <div style={S.drawerSearch}>
                <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                  <Search
                    size={15}
                    style={{
                      position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                      color: '#9ca3af', pointerEvents: 'none',
                    }}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="nav-search-input"
                    style={S.mobileSearchInput}
                  />
                </form>
              </div>

              {/* Nav links */}
              <nav style={S.drawerNav}>
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className="nav-mobile-btn"
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 500,
                      textDecoration: 'none',
                      marginBottom: 2,
                      transition: 'background 0.15s',
                      background: isActive ? (isDark ? 'rgba(79,70,229,0.2)' : '#eef2ff') : 'transparent',
                      color: isActive
                        ? (isDark ? '#818cf8' : '#4f46e5')
                        : (isDark ? '#d1d5db' : '#374151'),
                    })}
                  >
                    {link.name}
                  </NavLink>
                ))}
              </nav>

              {/* Drawer footer */}
              <div style={S.drawerFooter}>
                {/* Theme toggle */}
                <button
                  className="nav-mobile-btn"
                  onClick={toggleTheme}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 12,
                    fontSize: 14, fontWeight: 500,
                    color: isDark ? '#d1d5db' : '#374151',
                    background: 'none', border: 'none', cursor: 'pointer',
                    transition: 'background 0.15s', width: '100%', textAlign: 'left',
                  }}
                >
                  {isDark ? <Sun size={17} /> : <Moon size={17} />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>

                {user ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 8px' }}>
                      <div style={{ ...S.avatarCircle, width: 40, height: 40, fontSize: 15, flexShrink: 0 }}>
                        {(profile?.name || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#f9fafb' : '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {profile?.name || 'User'}
                        </p>
                        <p style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '10px 16px', borderRadius: 12,
                        fontSize: 13, fontWeight: 600,
                        background: isDark ? 'rgba(79,70,229,0.2)' : '#eef2ff',
                        color: isDark ? '#818cf8' : '#4f46e5',
                        textDecoration: 'none',
                      }}
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          padding: '10px 16px', borderRadius: 12,
                          fontSize: 13, fontWeight: 600,
                          background: isDark ? 'rgba(124,58,237,0.15)' : '#f5f3ff',
                          color: isDark ? '#a78bfa' : '#7c3aed',
                          textDecoration: 'none',
                        }}
                      >
                        <Shield size={16} /> Admin Panel
                      </Link>
                    )}

                    <Link
                      to={isDealer ? "/dealer" : "/dealer/register"}
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '10px 16px', borderRadius: 12,
                        fontSize: 13, fontWeight: 600,
                        background: isDark ? 'rgba(245,158,11,0.15)' : '#fffbeb',
                        color: isDark ? '#fbbf24' : '#f59e0b',
                        textDecoration: 'none',
                      }}
                    >
                      <Store size={16} /> {isDealer ? 'Dealer Portal' : 'Become a Dealer'}
                    </Link>

                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '10px 16px', borderRadius: 12,
                        fontSize: 13, fontWeight: 600,
                        color: isDark ? '#f87171' : '#dc2626',
                        background: 'none',
                        border: `1px solid ${isDark ? 'rgba(127,29,29,0.4)' : '#fecaca'}`,
                        cursor: 'pointer', width: '100%', transition: 'background 0.15s',
                      }}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '12px 16px', borderRadius: 12,
                      fontSize: 14, fontWeight: 600,
                      background: '#4f46e5', color: 'white',
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
                    }}
                  >
                    <User size={16} /> Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }