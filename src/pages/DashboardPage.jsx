import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import useWishlistStore from '../stores/useWishlistStore';
import { useOrders } from '../hooks/useOrders';
import { useAddresses, addAddress, deleteAddress } from '../hooks/useAddresses';
import { formatDate, formatPrice } from '../utils/formatters';
import Modal from '../components/common/Modal';
import {
  subscribeToInstallPrompt,
  installPWA,
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  triggerLocalTestNotification
} from '../utils/pwaHelper';

/* ─────────────────────────────────────────
   ROLE BADGE CONFIG
───────────────────────────────────────── */
const ROLE_CONFIG = {
  admin: {
    icon: 'ti-crown',
    label: 'Admin',
    style: {
      background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
      color: '#fff',
      boxShadow: '0 2px 10px rgba(124,58,237,0.35)',
    },
  },
  dealer: {
    icon: 'ti-building-store',
    label: 'Dealer',
    style: {
      background: 'linear-gradient(135deg, #d97706, #f59e0b)',
      color: '#fff',
      boxShadow: '0 2px 10px rgba(217,119,6,0.35)',
    },
  },
  user: {
    icon: 'ti-shield-check',
    label: 'Verified',
    style: {
      background: 'linear-gradient(135deg, #059669, #10b981)',
      color: '#fff',
      boxShadow: '0 2px 10px rgba(5,150,105,0.3)',
    },
  },
};

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [prevTab, setPrevTab]     = useState(null);
  const { user, profile, updateProfile, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { document.title = 'My Dashboard — ShopVerse'; }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const role = profile?.role || 'user';
  const roleCfg = ROLE_CONFIG[role] || ROLE_CONFIG.user;
  const initial = (profile?.name || user?.email || 'U').charAt(0).toUpperCase();

  const tabs = [
    { id: 'profile',   label: 'My Profile',     ti: 'ti-user'    },
    { id: 'orders',    label: 'My Orders',       ti: 'ti-package' },
    { id: 'addresses', label: 'Saved Addresses', ti: 'ti-map-pin' },
    { id: 'wishlist',  label: 'Wishlist',        ti: 'ti-heart'   },
    { id: 'settings',  label: 'App Settings',   ti: 'ti-settings' },
  ];

  const switchTab = (id) => {
    if (id === activeTab) return;
    setPrevTab(activeTab);
    setActiveTab(id);
  };

  // Banner gradient changes per role
  const bannerGradient = {
    admin:  'linear-gradient(135deg, #1e1035 0%, #2d1b69 50%, #4c1d95 100%)',
    dealer: 'linear-gradient(135deg, #1c1008 0%, #451a03 50%, #78350f 100%)',
    user:   'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
  }[role] || 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── ROOT & LAYOUT ── */
        .db-root { font-family: 'DM Sans', sans-serif; min-height: 100vh; }
        .db-layout {
          display: grid; grid-template-columns: 264px 1fr; gap: 20px;
          max-width: 1100px; margin: 0 auto; padding: 32px 20px; box-sizing: border-box;
          animation: db-page-in 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes db-page-in {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) { .db-layout { grid-template-columns: 1fr; padding: 14px; } }

        /* ── SIDEBAR ── */
        .db-sidebar { display: flex; flex-direction: column; gap: 12px;
        margin-top:3rem;
        }

        .db-profile-card {
          background: #fff; border: 0.5px solid rgba(0,0,0,0.09);
          border-radius: 20px; padding: 0 20px 22px; overflow: hidden;
          animation: db-slide-in 0.5s 0.05s cubic-bezier(0.22,1,0.36,1) both;
        }
        .dark .db-profile-card { background: #1e293b; border-color: rgba(255,255,255,0.07); }
        @keyframes db-slide-in {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .db-banner {
          height: 70px; margin: 0 -20px; position: relative; overflow: hidden;
          transition: background 0.6s ease;
        }
        .db-banner-dots {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 18px 18px;
        }
        .db-banner-glow {
          position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%);
          width: 120px; height: 60px; border-radius: 50%; filter: blur(24px); opacity: 0.5;
          transition: background 0.6s ease;
        }

        .db-avatar-wrap { margin-top: -26px; margin-bottom: 14px; position: relative; z-index: 1; }
        .db-avatar {
          width: 58px; height: 58px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 23px; color: #fff;
          border: 3px solid #fff;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
        }
        .dark .db-avatar { border-color: #1e293b; }
        .db-avatar:hover { transform: scale(1.08) rotate(-3deg); }

        .db-user-name {
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px;
          color: #111827; margin: 0 0 2px;
        }
        .dark .db-user-name { color: #f1f5f9; }
        .db-user-email { font-size: 12px; color: #6b7280; margin: 0 0 14px; }
        .dark .db-user-email { color: #94a3b8; }

        .db-role-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px;
          letter-spacing: 0.03em; transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .db-role-badge:hover { transform: translateY(-1px); }
        .db-role-badge i { font-size: 12px; }

        /* ── NAV ── */
        .db-nav {
          background: #fff; border: 0.5px solid rgba(0,0,0,0.08);
          border-radius: 20px; padding: 8px;
          animation: db-slide-in 0.5s 0.12s cubic-bezier(0.22,1,0.36,1) both;
        }
        .dark .db-nav { background: #1e293b; border-color: rgba(255,255,255,0.07); }

        .db-nav-btn {
          width: 100%; display: flex; align-items: center; gap: 12px;
          padding: 11px 14px; border-radius: 11px; border: none; cursor: pointer;
          background: transparent; font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 400; color: #6b7280;
          transition: all 0.2s cubic-bezier(0.22,1,0.36,1); text-align: left;
          position: relative; overflow: hidden;
        }
        .db-nav-btn::before {
          content: ''; position: absolute; inset: 0; background: currentColor;
          opacity: 0; transition: opacity 0.15s; border-radius: 11px;
        }
        .db-nav-btn:hover::before { opacity: 0.05; }
        .db-nav-btn:hover { color: #111827; transform: translateX(2px); }
        .dark .db-nav-btn:hover { color: #f1f5f9; background: rgba(255,255,255,0.04); }
        .db-nav-btn.active {
          background: #0f172a; color: #fff; font-weight: 500;
          box-shadow: 0 4px 14px rgba(15,23,42,0.25);
        }
        .dark .db-nav-btn.active { box-shadow: 0 4px 14px rgba(0,0,0,0.4); }
        .db-nav-btn.active .db-nav-icon { color: #a5b4fc; }
        .db-nav-btn.active:hover { transform: none; }

        .db-nav-icon { font-size: 18px; color: #9ca3af; transition: color 0.2s, transform 0.2s; flex-shrink: 0; }
        .db-nav-btn:hover .db-nav-icon { transform: scale(1.1); }

        .db-nav-divider { height: 0.5px; background: rgba(0,0,0,0.07); margin: 6px 8px; }
        .dark .db-nav-divider { background: rgba(255,255,255,0.07); }
        .db-nav-logout { color: #ef4444 !important; }
        .db-nav-logout .db-nav-icon { color: #ef4444 !important; }
        .db-nav-logout:hover { background: rgba(239,68,68,0.08) !important; }

        /* ── MAIN PANEL ── */
        .db-main {
                margin-top:3rem;
          background: #fff; border: 0.5px solid rgba(0,0,0,0.08);
          border-radius: 20px; padding: 32px; min-height: 560px; overflow: hidden;
          animation: db-slide-in-right 0.5s 0.08s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes db-slide-in-right {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .dark .db-main { background: #1e293b; border-color: rgba(255,255,255,0.07); }

        /* TAB ANIMATION */
        .db-tab-panel {
          animation: db-tab-in 0.3s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes db-tab-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* TAB HEADER */
        .db-tab-header {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 28px; padding-bottom: 20px;
          border-bottom: 0.5px solid rgba(0,0,0,0.07);
        }
        .dark .db-tab-header { border-bottom-color: rgba(255,255,255,0.07); }
        .db-tab-icon-wrap {
          width: 44px; height: 44px; border-radius: 12px;
          background: #0f172a; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .db-tab-icon-wrap:hover { transform: rotate(-8deg) scale(1.1); }
        .db-tab-icon-wrap i { font-size: 20px; color: #a5b4fc; }
        .db-tab-title {
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px;
          color: #111827; margin: 0;
        }
        .dark .db-tab-title { color: #f1f5f9; }
        .db-tab-sub { font-size: 13px; color: #6b7280; margin: 2px 0 0; }
        .dark .db-tab-sub { color: #94a3b8; }

        /* FORM */
        .db-form { max-width: 400px; display: flex; flex-direction: column; gap: 20px; }
        .db-field label {
          display: block; font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.07em; color: #6b7280; margin-bottom: 8px;
        }
        .dark .db-field label { color: #94a3b8; }
        .db-field input {
          width: 100%; box-sizing: border-box; padding: 11px 14px;
          background: #f8fafc; border: 0.5px solid rgba(0,0,0,0.12);
          border-radius: 10px; font-size: 14px; color: #111827;
          font-family: 'DM Sans', sans-serif; outline: none;
          transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
        }
        .dark .db-field input { background: #0f172a; border-color: rgba(255,255,255,0.1); color: #f1f5f9; }
        .db-field input:focus {
          border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.14);
          background: #fff; transform: translateY(-1px);
        }
        .dark .db-field input:focus { background: #1e293b; }
        .db-field input:disabled { opacity: 0.45; cursor: not-allowed; }

        .db-save-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #0f172a; color: #fff; border: none; border-radius: 10px;
          padding: 12px 24px; font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500; cursor: pointer; align-self: flex-start;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 4px 14px rgba(15,23,42,0.2);
        }
        .db-save-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(15,23,42,0.3); }
        .db-save-btn:active { transform: translateY(0) scale(0.97); }

        /* STATS */
        .db-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
        .db-stat {
          background: #f8fafc; border-radius: 13px; padding: 14px 16px;
          border: 0.5px solid rgba(0,0,0,0.06);
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
          animation: db-stat-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .db-stat:nth-child(1) { animation-delay: 0.05s; }
        .db-stat:nth-child(2) { animation-delay: 0.1s; }
        .db-stat:nth-child(3) { animation-delay: 0.15s; }
        @keyframes db-stat-pop {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        .db-stat:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
        .dark .db-stat { background: #0f172a; border-color: rgba(255,255,255,0.06); }
        .dark .db-stat:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.35); }
        .db-stat-label { font-size: 12px; color: #6b7280; margin-bottom: 6px; }
        .dark .db-stat-label { color: #94a3b8; }
        .db-stat-val { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: #111827; }
        .dark .db-stat-val { color: #f1f5f9; }

        /* ORDER CARDS */
        .db-order-card {
          border: 0.5px solid rgba(0,0,0,0.08); border-radius: 14px;
          margin-bottom: 12px; overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
          animation: db-card-in 0.35s cubic-bezier(0.22,1,0.36,1) both;
        }
        .db-order-card:nth-child(1) { animation-delay: 0.05s; }
        .db-order-card:nth-child(2) { animation-delay: 0.1s; }
        .db-order-card:nth-child(3) { animation-delay: 0.15s; }
        @keyframes db-card-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dark .db-order-card { border-color: rgba(255,255,255,0.07); }
        .db-order-card:hover { border-color: rgba(0,0,0,0.18); box-shadow: 0 4px 16px rgba(0,0,0,0.07); transform: translateY(-1px); }
        .dark .db-order-card:hover { border-color: rgba(255,255,255,0.14); box-shadow: 0 4px 16px rgba(0,0,0,0.3); }

        .db-order-head {
          display: grid; grid-template-columns: 1fr 1fr 1fr auto auto;
          align-items: center; gap: 12px; padding: 16px 20px;
          background: #f8fafc; cursor: pointer; transition: background 0.15s;
          user-select: none;
        }
        .dark .db-order-head { background: #0f172a; }
        .db-order-head:hover { background: #f1f5f9; }
        .dark .db-order-head:hover { background: #1a2540; }
        .db-order-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #9ca3af; margin-bottom: 4px; }
        .db-order-val { font-size: 14px; color: #111827; font-weight: 500; }
        .dark .db-order-val { color: #f1f5f9; }

        .db-chevron { font-size: 18px; color: #9ca3af; transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .db-chevron.open { transform: rotate(90deg); }

        .db-order-body {
          max-height: 0; overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.22,1,0.36,1), padding 0.3s ease;
          padding: 0 20px; border-top: 0 solid rgba(0,0,0,0.07);
        }
        .db-order-body.open { max-height: 700px; padding: 20px; border-top-width: 0.5px; }
        .dark .db-order-body { border-top-color: rgba(255,255,255,0.07); }

        .db-order-item {
          display: flex; align-items: center; gap: 14px;
          padding: 10px 0; border-bottom: 0.5px solid rgba(0,0,0,0.06);
          transition: background 0.15s; border-radius: 8px;
        }
        .dark .db-order-item { border-bottom-color: rgba(255,255,255,0.06); }
        .db-order-item:last-child { border-bottom: none; }
        .db-order-thumb {
          width: 44px; height: 44px; border-radius: 8px; object-fit: cover;
          background: #f1f5f9; border: 0.5px solid rgba(0,0,0,0.08); flex-shrink: 0;
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .db-order-item:hover .db-order-thumb { transform: scale(1.08) rotate(-2deg); }
        .dark .db-order-thumb { background: #334155; border-color: rgba(255,255,255,0.08); }
        .db-order-item-name { font-size: 14px; color: #111827; font-weight: 500; }
        .dark .db-order-item-name { color: #f1f5f9; }
        .db-order-item-qty { font-size: 12px; color: #6b7280; }
        .db-order-item-price { margin-left: auto; font-size: 14px; font-weight: 600; color: #111827; }
        .dark .db-order-item-price { color: #f1f5f9; }
        .db-order-addr { margin-top: 16px; padding-top: 14px; border-top: 0.5px solid rgba(0,0,0,0.07); }
        .dark .db-order-addr { border-top-color: rgba(255,255,255,0.07); }
        .db-order-addr-lbl { font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .dark .db-order-addr-lbl { color: #cbd5e1; }
        .db-order-addr-text { font-size: 13px; color: #6b7280; line-height: 1.7; }
        .dark .db-order-addr-text { color: #94a3b8; }

        /* BADGES */
        .db-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; }
        .badge-success { background: #ecfdf5; color: #065f46; }
        .badge-warning { background: #fffbeb; color: #92400e; }
        .badge-info    { background: #eff6ff; color: #1e40af; }
        .badge-danger  { background: #fef2f2; color: #991b1b; }
        .dark .badge-success { background: #064e3b; color: #6ee7b7; }
        .dark .badge-warning { background: #451a03; color: #fcd34d; }
        .dark .badge-info    { background: #1e3a5f; color: #93c5fd; }
        .dark .badge-danger  { background: #450a0a; color: #fca5a5; }

        /* ADDRESSES */
        .db-addr-header { display: flex; justify-content: flex-end; margin-bottom: 16px; }
        .db-add-btn {
          display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px;
          background: transparent; border: 0.5px solid rgba(0,0,0,0.15);
          border-radius: 10px; font-size: 13px; font-weight: 500;
          color: #374151; cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .dark .db-add-btn { border-color: rgba(255,255,255,0.15); color: #cbd5e1; }
        .db-add-btn:hover { background: #0f172a; color: #fff; border-color: transparent; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(15,23,42,0.2); }
        .db-add-btn i { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .db-add-btn:hover i { transform: rotate(90deg); }

        .db-addr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 640px) { .db-addr-grid { grid-template-columns: 1fr; } }

        .db-addr-card {
          background: #f8fafc; border: 0.5px solid rgba(0,0,0,0.08);
          border-radius: 14px; padding: 18px; position: relative;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          animation: db-card-in 0.35s cubic-bezier(0.22,1,0.36,1) both;
        }
        .db-addr-card:nth-child(1) { animation-delay: 0.05s; }
        .db-addr-card:nth-child(2) { animation-delay: 0.1s; }
        .dark .db-addr-card { background: #0f172a; border-color: rgba(255,255,255,0.07); }
        .db-addr-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.09); border-color: rgba(0,0,0,0.16); }
        .dark .db-addr-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.35); border-color: rgba(255,255,255,0.14); }

        .db-addr-tag {
          display: inline-flex; align-items: center; gap: 5px; margin-bottom: 12px;
          font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #374151;
        }
        .dark .db-addr-tag { color: #cbd5e1; }
        .db-addr-tag i { font-size: 14px; color: #6b7280; }
        .db-addr-name { font-size: 14px; font-weight: 500; color: #111827; margin-bottom: 4px; }
        .dark .db-addr-name { color: #f1f5f9; }
        .db-addr-line { font-size: 13px; color: #6b7280; line-height: 1.7; }
        .dark .db-addr-line { color: #94a3b8; }
        .db-default-pill {
          position: absolute; top: 14px; right: 14px;
          background: #0f172a; color: #a5b4fc;
          font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.05em;
        }
        .dark .db-default-pill { background: #312e81; color: #c7d2fe; }
        .db-addr-actions {
          margin-top: 14px; padding-top: 12px;
          border-top: 0.5px solid rgba(0,0,0,0.07); display: flex; justify-content: flex-end;
        }
        .dark .db-addr-actions { border-top-color: rgba(255,255,255,0.07); }
        .db-del-btn {
          background: none; border: 0.5px solid rgba(0,0,0,0.12); border-radius: 8px;
          padding: 6px 14px; font-size: 12px; color: #ef4444; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          display: inline-flex; align-items: center; gap: 5px;
        }
        .dark .db-del-btn { border-color: rgba(255,255,255,0.1); }
        .db-del-btn:hover { background: #fef2f2; border-color: #fca5a5; transform: scale(1.04); }
        .dark .db-del-btn:hover { background: #450a0a; border-color: #ef4444; }

        /* WISHLIST */
        .db-wish-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        @media (max-width: 640px) { .db-wish-grid { grid-template-columns: repeat(2, 1fr); } }

        .db-wish-card {
          border: 0.5px solid rgba(0,0,0,0.08); border-radius: 14px; overflow: hidden;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
          animation: db-card-in 0.35s cubic-bezier(0.22,1,0.36,1) both;
        }
        .db-wish-card:nth-child(1) { animation-delay: 0.04s; }
        .db-wish-card:nth-child(2) { animation-delay: 0.08s; }
        .db-wish-card:nth-child(3) { animation-delay: 0.12s; }
        .dark .db-wish-card { border-color: rgba(255,255,255,0.07); }
        .db-wish-card:hover { transform: translateY(-5px) scale(1.01); box-shadow: 0 12px 30px rgba(0,0,0,0.12); border-color: rgba(0,0,0,0.16); }
        .dark .db-wish-card:hover { box-shadow: 0 12px 30px rgba(0,0,0,0.4); border-color: rgba(255,255,255,0.15); }

        .db-wish-img {
          height: 110px; background: #f8fafc;
          display: flex; align-items: center; justify-content: center;
          border-bottom: 0.5px solid rgba(0,0,0,0.06); overflow: hidden;
          transition: background 0.2s;
        }
        .db-wish-card:hover .db-wish-img { background: #f1f5f9; }
        .dark .db-wish-img { background: #0f172a; border-bottom-color: rgba(255,255,255,0.06); }
        .db-wish-img i { font-size: 34px; color: #cbd5e1; transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .db-wish-card:hover .db-wish-img i { transform: scale(1.15) rotate(-5deg); }
        .dark .db-wish-img i { color: #475569; }
        .db-wish-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
        .db-wish-card:hover .db-wish-img img { transform: scale(1.06); }

        .db-wish-body { padding: 12px; }
        .db-wish-name { font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 8px; }
        .dark .db-wish-name { color: #cbd5e1; }
        .db-wish-footer { display: flex; align-items: center; justify-content: space-between; }
        .db-wish-price { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #111827; }
        .dark .db-wish-price { color: #f1f5f9; }
        .db-wish-remove {
          font-size: 16px; color: #d1d5db; cursor: pointer;
          border: none; background: none; padding: 4px;
          display: flex; align-items: center; border-radius: 6px;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .db-wish-remove:hover { color: #ef4444; background: #fef2f2; transform: scale(1.2) rotate(10deg); }

        /* SKELETON */
        .db-skeleton {
          background: linear-gradient(90deg, #f1f5f9 25%, #e8edf2 50%, #f1f5f9 75%);
          background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 10px;
        }
        .dark .db-skeleton {
          background: linear-gradient(90deg, #1e293b 25%, #293548 50%, #1e293b 75%);
          background-size: 200% 100%;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* EMPTY */
        .db-empty { text-align: center; padding: 56px 0; animation: db-tab-in 0.3s ease both; }
        .db-empty i {
          font-size: 44px; color: #d1d5db; display: block; margin-bottom: 14px;
          animation: db-empty-float 3s ease-in-out infinite;
        }
        .dark .db-empty i { color: #475569; }
        @keyframes db-empty-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
        .db-empty p { font-size: 14px; color: #9ca3af; margin: 0; }
        .dark .db-empty p { color: #64748b; }
      `}</style>

      <div className="db-root">
        <div className="db-layout">

          {/* ── SIDEBAR ── */}
          <div className="db-sidebar">
            <div className="db-profile-card">
              <div className="db-banner" style={{ background: bannerGradient }}>
                <div className="db-banner-dots" />
                <div
                  className="db-banner-glow"
                  style={{ background: roleCfg.style.background }}
                />
              </div>
              <div className="db-avatar-wrap">
                <div
                  className="db-avatar"
                  style={{
                    background: roleCfg.style.background,
                    boxShadow: roleCfg.style.boxShadow,
                  }}
                >
                  {initial}
                </div>
              </div>
              <p className="db-user-name">{profile?.name || 'User'}</p>
              <p className="db-user-email">{user?.email}</p>
              <span className="db-role-badge" style={roleCfg.style}>
                <i className={`ti ${roleCfg.icon}`} aria-hidden="true" />
                {roleCfg.label}
              </span>
            </div>

            <nav className="db-nav">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`db-nav-btn${activeTab === tab.id ? ' active' : ''}`}
                  onClick={() => switchTab(tab.id)}
                >
                  <i className={`ti ${tab.ti} db-nav-icon`} aria-hidden="true" />
                  {tab.label}
                </button>
              ))}
              <div className="db-nav-divider" />
              <button className="db-nav-btn db-nav-logout" onClick={handleLogout}>
                <i className="ti ti-logout db-nav-icon" aria-hidden="true" />
                Logout
              </button>
            </nav>
          </div>

          {/* ── MAIN PANEL ── */}
          <div className="db-main">
            {activeTab === 'profile'   && <ProfileTab   key="profile"   profile={profile} updateProfile={updateProfile} email={user?.email} />}
            {activeTab === 'orders'    && <OrdersTab    key="orders"    userId={user?.id} />}
            {activeTab === 'addresses' && <AddressesTab key="addresses" userId={user?.id} />}
            {activeTab === 'wishlist'  && <WishlistTab  key="wishlist" />}
            {activeTab === 'settings'  && <SettingsTab  key="settings"  userId={user?.id} />}
          </div>

        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   TAB HEADER
───────────────────────────────────────── */
function TabHeader({ icon, title, sub }) {
  return (
    <div className="db-tab-header">
      <div className="db-tab-icon-wrap">
        <i className={`ti ${icon}`} aria-hidden="true" />
      </div>
      <div>
        <p className="db-tab-title">{title}</p>
        {sub && <p className="db-tab-sub">{sub}</p>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PROFILE TAB
───────────────────────────────────────── */
function ProfileTab({ profile, updateProfile, email }) {
  const [formData, setFormData] = useState({ name: profile?.name || '', phone: profile?.phone || '' });
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (profile) setFormData({ name: profile.name || '', phone: profile.phone || '' });
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await updateProfile(formData);
    setLoading(false);
    if (!error) toast.success('Profile updated!');
  };

  return (
    <div className="db-tab-panel">
      <TabHeader icon="ti-user" title="Profile Settings" sub="Manage your personal info" />
      <form onSubmit={handleSubmit} className="db-form">
        <div className="db-field">
          <label>Email Address</label>
          <input type="email" value={email || ''} disabled readOnly />
        </div>
        <div className="db-field">
          <label>Full Name</label>
          <input
            type="text" value={formData.name} required
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="db-field">
          <label>Phone Number</label>
          <input
            type="tel" value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <button type="submit" className="db-save-btn" disabled={loading}>
          <i className={`ti ${loading ? 'ti-loader' : 'ti-check'}`} aria-hidden="true" />
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────
   ORDERS TAB
───────────────────────────────────────── */
const STATUS_BADGE = {
  'Pending Payment': 'badge-warning',
  'Processing':      'badge-warning',
  'Shipped':         'badge-info',
  'Delivered':       'badge-success',
  'Cancelled':       'badge-danger',
};

function OrdersTab({ userId }) {
  const { orders, loading, error } = useOrders(userId);
  const [expanded, setExpanded]   = useState(null);
  const toggle = (id) => setExpanded(expanded === id ? null : id);

  if (loading) return (
    <div className="db-tab-panel">
      <TabHeader icon="ti-package" title="Order History" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3].map(i => <div key={i} className="db-skeleton" style={{ height: 68 }} />)}
      </div>
    </div>
  );
  if (error) return <div style={{ color: '#ef4444', fontSize: 14 }}>Error loading orders.</div>;

  const totalSpent = orders?.reduce((s, o) => s + (o.total_amount || 0), 0) || 0;
  const delivered  = orders?.filter(o => o.status === 'Delivered').length || 0;

  return (
    <div className="db-tab-panel">
      <TabHeader icon="ti-package" title="Order History" sub={`${orders?.length || 0} orders placed`} />

      {orders?.length > 0 && (
        <div className="db-stats">
          <div className="db-stat">
            <div className="db-stat-label">Total Orders</div>
            <div className="db-stat-val">{orders.length}</div>
          </div>
          <div className="db-stat">
            <div className="db-stat-label">Total Spent</div>
            <div className="db-stat-val">{formatPrice(totalSpent)}</div>
          </div>
          <div className="db-stat">
            <div className="db-stat-label">Delivered</div>
            <div className="db-stat-val">{delivered}</div>
          </div>
        </div>
      )}

      {!orders?.length ? (
        <div className="db-empty">
          <i className="ti ti-package-off" aria-hidden="true" />
          <p>No orders yet</p>
        </div>
      ) : orders.map((order) => (
        <div key={order.id} className="db-order-card">
          <div
            className="db-order-head"
            onClick={() => toggle(order.id)}
            role="button"
            aria-expanded={expanded === order.id}
          >
            <div>
              <div className="db-order-lbl">Order ID</div>
              <div className="db-order-val" style={{ fontFamily: 'monospace' }}>{order.id.split('-')[0]}</div>
            </div>
            <div>
              <div className="db-order-lbl">Date</div>
              <div className="db-order-val">{formatDate(order.created_at).split(',')[0]}</div>
            </div>
            <div>
              <div className="db-order-lbl">Total</div>
              <div className="db-order-val">{formatPrice(order.total_amount)}</div>
            </div>
            <span className={`db-badge ${STATUS_BADGE[order.status] || 'badge-info'}`}>{order.status}</span>
            <i className={`ti ti-chevron-right db-chevron${expanded === order.id ? ' open' : ''}`} aria-hidden="true" />
          </div>

          <div className={`db-order-body${expanded === order.id ? ' open' : ''}`}>
            {order.order_items?.map((item) => (
              <div key={item.id} className="db-order-item">
                <img
                  src={item.product_image || 'https://via.placeholder.com/44'}
                  alt={item.product_name}
                  className="db-order-thumb"
                />
                <div>
                  <div className="db-order-item-name">{item.product_name}</div>
                  <div className="db-order-item-qty">Qty: {item.quantity}</div>
                </div>
                <div className="db-order-item-price">{formatPrice(item.price)}</div>
              </div>
            ))}
            {order.shipping_address && (
              <div className="db-order-addr">
                <div className="db-order-addr-lbl">Shipping Address</div>
                <div className="db-order-addr-text">
                  {order.shipping_address.full_name}<br />
                  {order.shipping_address.address_line}, {order.shipping_address.city},{' '}
                  {order.shipping_address.state} {order.shipping_address.pincode}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   ADDRESSES TAB
───────────────────────────────────────── */
const ADDR_ICONS = { Home: 'ti-home', Office: 'ti-briefcase', Other: 'ti-map-pin' };

function AddressesTab({ userId }) {
  const { addresses, loading, refetch } = useAddresses(userId);
  const [isOpen, setIsOpen] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'Home', full_name: '', phone: '',
    address_line: '', city: '', state: '', pincode: '', is_default: false,
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    const { error } = await addAddress({ ...newAddr, user_id: userId });
    if (!error) {
      toast.success('Address added');
      setIsOpen(false);
      refetch();
      // Reset form
      setNewAddr({
        label: 'Home', full_name: '', phone: '',
        address_line: '', city: '', state: '', pincode: '', is_default: false,
      });
    } else {
      toast.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this address?')) {
      const { error } = await deleteAddress(id);
      if (!error) {
        toast.success('Address deleted');
        refetch();
      } else {
        toast.error(error);
      }
    }
  };

  if (loading) return (
    <div className="db-tab-panel">
      <TabHeader icon="ti-map-pin" title="Saved Addresses" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[1, 2].map(i => <div key={i} className="db-skeleton" style={{ height: 140 }} />)}
      </div>
    </div>
  );

  return (
    <div className="db-tab-panel">
      <TabHeader icon="ti-map-pin" title="Saved Addresses" sub={`${addresses?.length || 0} addresses saved`} />

      <div className="db-addr-header">
        <button className="db-add-btn" onClick={() => setIsOpen(true)}>
          <i className="ti ti-plus" aria-hidden="true" />
          Add New
        </button>
      </div>

      {!addresses?.length ? (
        <div className="db-empty">
          <i className="ti ti-map-off" aria-hidden="true" />
          <p>No saved addresses yet</p>
        </div>
      ) : (
        <div className="db-addr-grid">
          {addresses.map((addr) => (
            <div key={addr.id} className="db-addr-card">
              {addr.is_default && <span className="db-default-pill">Default</span>}
              <div className="db-addr-tag">
                <i className={`ti ${ADDR_ICONS[addr.label] || 'ti-map-pin'}`} aria-hidden="true" />
                {addr.label}
              </div>
              <div className="db-addr-name">{addr.full_name}</div>
              <div className="db-addr-line">
                {addr.address_line}<br />
                {addr.city}, {addr.state} {addr.pincode}<br />
                {addr.phone}
              </div>
              <div className="db-addr-actions">
                <button className="db-del-btn" onClick={() => handleDelete(addr.id)}>
                  <i className="ti ti-trash" aria-hidden="true" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Address">
        <form onSubmit={handleAdd}>
          <div className="db-form" style={{ maxWidth: '100%' }}>
            <div className="db-field">
              <label>Label</label>
              <input value={newAddr.label} required onChange={e => setNewAddr({ ...newAddr, label: e.target.value })} placeholder="Home, Office…" />
            </div>
            <div className="db-field">
              <label>Full Name</label>
              <input value={newAddr.full_name} required onChange={e => setNewAddr({ ...newAddr, full_name: e.target.value })} />
            </div>
            <div className="db-field">
              <label>Phone</label>
              <input value={newAddr.phone} required onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })} />
            </div>
            <div className="db-field">
              <label>Address Line</label>
              <input value={newAddr.address_line} required onChange={e => setNewAddr({ ...newAddr, address_line: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="db-field">
                <label>City</label>
                <input value={newAddr.city} required onChange={e => setNewAddr({ ...newAddr, city: e.target.value })} />
              </div>
              <div className="db-field">
                <label>State</label>
                <input value={newAddr.state} required onChange={e => setNewAddr({ ...newAddr, state: e.target.value })} />
              </div>
            </div>
            <div className="db-field">
              <label>Pincode</label>
              <input value={newAddr.pincode} required onChange={e => setNewAddr({ ...newAddr, pincode: e.target.value })} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'inherit', cursor: 'pointer' }}>
              <input type="checkbox" checked={newAddr.is_default} onChange={e => setNewAddr({ ...newAddr, is_default: e.target.checked })} />
              Set as default address
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
              <button type="submit" className="db-save-btn">
                <i className="ti ti-check" aria-hidden="true" /> Save Address
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ─────────────────────────────────────────
   WISHLIST TAB
───────────────────────────────────────── */
function WishlistTab() {
  const { items, removeItem } = useWishlistStore();

  return (
    <div className="db-tab-panel">
      <TabHeader icon="ti-heart" title="My Wishlist" sub={`${items?.length || 0} saved items`} />
      {!items?.length ? (
        <div className="db-empty">
          <i className="ti ti-heart-off" aria-hidden="true" />
          <p>Your wishlist is empty</p>
        </div>
      ) : (
        <div className="db-wish-grid">
          {items.map((product) => (
            <div key={product.id} className="db-wish-card">
              <div className="db-wish-img">
                {product.image_url
                  ? <img src={product.image_url} alt={product.name} />
                  : <i className="ti ti-shopping-bag" aria-hidden="true" />
                }
              </div>
              <div className="db-wish-body">
                <div className="db-wish-name">{product.name}</div>
                <div className="db-wish-footer">
                  <span className="db-wish-price">{formatPrice(product.price)}</span>
                  {removeItem && (
                    <button
                      className="db-wish-remove"
                      onClick={() => removeItem(product.id)}
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      <i className="ti ti-x" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   SETTINGS TAB (PWA & PUSH NOTIFICATIONS)
───────────────────────────────────────── */
function SettingsTab({ userId }) {
  const [canInstall, setCanInstall] = useState(false);
  const [permission, setPermission] = useState(getNotificationPermission());
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToInstallPrompt((promptAvailable) => {
      setCanInstall(promptAvailable);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const checkSub = async () => {
      if (isPushSupported()) {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      }
    };
    checkSub();
  }, []);

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      toast.success('ShopVerse App installation started!');
    } else {
      toast.error('App installation cancelled or failed.');
    }
  };

  const handlePushToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      if (isSubscribed) {
        await unsubscribeFromPush(userId);
        setIsSubscribed(false);
        setPermission(getNotificationPermission());
        toast.success('Unsubscribed from push notifications.');
      } else {
        await subscribeToPush(userId);
        setIsSubscribed(true);
        setPermission('granted');
        toast.success('Subscribed to push notifications successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update push subscription.');
      setPermission(getNotificationPermission());
    } finally {
      setIsToggling(false);
    }
  };

  const handleTestNotification = async () => {
    toast.success('Triggered! Expect notification in 3 seconds.');
    await triggerLocalTestNotification(
      '🎉 ShopVerse Promotion!',
      'Check out the latest discounts and featured products on your favorite store.',
      3000
    );
  };

  const pushSupported = isPushSupported();

  return (
    <div className="db-tab-panel">
      <TabHeader icon="ti-settings" title="App Settings" sub="Manage application settings & offline alerts" />

      <style>{`
        .settings-card {
          background: #f8fafc;
          border: 0.5px solid rgba(0,0,0,0.08);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .dark .settings-card {
          background: #0f172a;
          border-color: rgba(255,255,255,0.07);
        }
        .settings-card:hover {
          border-color: rgba(0,0,0,0.16);
          box-shadow: 0 4px 16px rgba(0,0,0,0.05);
        }
        .dark .settings-card:hover {
          border-color: rgba(255,255,255,0.12);
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
        }
        .settings-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        @media (max-width: 560px) {
          .settings-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .settings-row button, .settings-row .switch-container {
            align-self: flex-start;
          }
        }
        .settings-title {
          font-size: 16px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 6px 0;
        }
        .dark .settings-title {
          color: #f1f5f9;
        }
        .settings-desc {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
        }
        .dark .settings-desc {
          color: #94a3b8;
        }
        .settings-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .badge-enabled {
          background: rgba(5,150,105,0.1);
          color: #059669;
        }
        .badge-disabled {
          background: rgba(239,68,68,0.1);
          color: #ef4444;
        }
        /* Custom Switch Toggle styling */
        .switch-container {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 26px;
          flex-shrink: 0;
        }
        .switch-input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .switch-slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background-color: #cbd5e1;
          transition: .3s;
          border-radius: 34px;
        }
        .dark .switch-slider {
          background-color: #334155;
        }
        .switch-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }
        .switch-input:checked + .switch-slider {
          background-color: #6366f1;
        }
        .switch-input:checked + .switch-slider:before {
          transform: translateX(24px);
        }
        .switch-input:disabled + .switch-slider {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      {/* PWA App Installation Card */}
      <div className="settings-card">
        <div className="settings-row">
          <div style={{ flex: 1 }}>
            <h3 className="settings-title">Install App (PWA)</h3>
            <p className="settings-desc">
              Install ShopVerse directly on your mobile device or computer to get offline features, fast startup, and native system integration.
            </p>
          </div>
          {canInstall ? (
            <button className="db-add-btn" onClick={handleInstall} style={{ whiteSpace: 'nowrap' }}>
              <i className="ti ti-download" aria-hidden="true" />
              Install App
            </button>
          ) : (
            <span className="settings-badge badge-enabled">
              <i className="ti ti-check" aria-hidden="true" />
              Ready/Installed
            </span>
          )}
        </div>
      </div>

      {/* Push Notifications Setup Card */}
      <div className="settings-card">
        <div className="settings-row">
          <div style={{ flex: 1 }}>
            <h3 className="settings-title">Push Notifications</h3>
            <p className="settings-desc">
              {!pushSupported 
                ? 'Your browser does not support push notifications. Try using Chrome, Firefox, or Safari.' 
                : 'Enable system notifications to receive alerts about discounts, orders status updates, and messaging notifications.'
              }
            </p>
          </div>
          {pushSupported && (
            <label className="switch-container">
              <input 
                type="checkbox" 
                className="switch-input"
                checked={isSubscribed}
                onChange={handlePushToggle}
                disabled={isToggling}
              />
              <span className="switch-slider"></span>
            </label>
          )}
        </div>

        {pushSupported && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 10, borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
            <span className={`settings-badge ${permission === 'granted' ? 'badge-enabled' : 'badge-disabled'}`}>
              <i className={`ti ${permission === 'granted' ? 'ti-bell' : 'ti-bell-off'}`} aria-hidden="true" />
              Status: {permission}
            </span>

            {permission === 'granted' && (
              <button 
                className="db-add-btn" 
                onClick={handleTestNotification} 
                style={{ padding: '6px 12px', fontSize: 12 }}
              >
                <i className="ti ti-send" aria-hidden="true" />
                Test Push
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}