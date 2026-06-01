import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Phone, CreditCard, ChevronRight, CheckCircle2, Plus, Truck, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '../stores/useCartStore';
import useAuthStore from '../stores/useAuthStore';
import { useAddresses } from '../hooks/useAddresses';
import { createOrder } from '../hooks/useOrders';
import { generateWhatsAppLink, formatPrice } from '../utils/formatters';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LazyImage from '../components/common/LazyImage';

export default function CheckoutPage() {
  const navigate  = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user, profile }               = useAuthStore();
  const { addresses, loading: addressesLoading } = useAddresses(user?.id);

  const [loading, setLoading]                 = useState(false);
  const [success, setSuccess]                 = useState(false);
  const [orderId, setOrderId]                 = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [newAddress, setNewAddress] = useState({
    full_name: profile?.name || '',
    phone: '', address_line: '', city: '', state: '', pincode: '',
  });

  const shippingCost = 0; // Free shipping
  const finalTotal   = totalPrice + shippingCost;
  const savings      = items.reduce((sum, i) => sum + ((i.original_price || i.price) - i.price) * i.quantity, 0);

  useEffect(() => {
    document.title = 'Checkout — ShopVerse';
    if (items.length === 0 && !success) navigate('/cart');
  }, [items.length, navigate, success]);

  useEffect(() => {
    if (addresses?.length > 0 && !selectedAddressId) {
      const def = addresses.find(a => a.is_default);
      setSelectedAddressId(def ? def.id : addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) return;

    let shippingAddressData = null;
    if (selectedAddressId === 'new') {
      if (!newAddress.full_name || !newAddress.address_line || !newAddress.city || !newAddress.state || !newAddress.pincode) {
        toast.error('Please fill all required address fields.');
        return;
      }
      shippingAddressData = newAddress;
    } else {
      shippingAddressData = addresses.find(a => a.id === selectedAddressId);
      if (!shippingAddressData) { toast.error('Please select a shipping address.'); return; }
    }

    setLoading(true);
    try {
      const { data, error } = await createOrder({
        userId: user.id, items, totalAmount: finalTotal, shippingAddress: shippingAddressData,
      });
      if (error) throw new Error(error.message);
      setOrderId(data.id);
      setSuccess(true);
      clearCart();
      toast.success('Order placed successfully!');
      const waLink = generateWhatsAppLink(
        items.map(i => ({ ...i, quantity: i.quantity || 1 })), finalTotal,
        { name: profile?.name || shippingAddressData.full_name, phone: shippingAddressData.phone }
      );
      window.open(waLink, '_blank');
    } catch (err) {
      toast.error(err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <>
        <ChkStyles />
        <div className="chk-success-wrap">
          <div className="chk-success-card">
            <div className="chk-success-icon">
              <CheckCircle2 size={52} style={{ color: '#059669' }} />
            </div>
            <h1 className="chk-success-title">Order Placed!</h1>
            <p className="chk-success-body">
              Thank you for your order. Your order ID is{' '}
              <span style={{ color: 'var(--chk-accent)', fontWeight: 700 }}>{orderId}</span>.
              We&apos;ve redirected you to WhatsApp to complete your payment.
            </p>
            <div className="chk-success-actions">
              <Link to="/dashboard" className="chk-btn-outline">View Orders</Link>
              <Link to="/products"  className="chk-btn-primary">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ── Step badge ── */
  const Step = ({ n, icon: Icon, label, active }) => (
    <div className={`chk-step ${active ? 'active' : ''}`}>
      <div className="chk-step-circle">
        <Icon size={15} />
      </div>
      <span className="chk-step-label">{label}</span>
    </div>
  );

  return (
    <>
      <ChkStyles />
      <div className="chk-root">
        <div className="chk-inner">

          {/* Page heading */}
          <div className="chk-page-head">
            <h1 className="chk-page-title">Checkout</h1>
            {/* Step indicators */}
            <div className="chk-steps">
              <Step n={1} icon={MapPin}      label="Shipping" active />
              <div className="chk-step-line" />
              <Step n={2} icon={CreditCard}  label="Payment"  active />
              <div className="chk-step-line" />
              <Step n={3} icon={CheckCircle2} label="Confirm" active={false} />
            </div>
          </div>

          <form onSubmit={handlePlaceOrder} className="chk-layout">

            {/* ── Left column ── */}
            <div className="chk-left">

              {/* Shipping address */}
              <div className="chk-card">
                <div className="chk-card-header">
                  <div className="chk-card-icon-wrap">
                    <MapPin size={17} style={{ color: 'var(--chk-accent)' }} />
                  </div>
                  <h2 className="chk-card-title">Shipping Address</h2>
                </div>

                {addressesLoading ? (
                  <div className="chk-loading-text">Loading addresses…</div>
                ) : (
                  <div className="chk-addr-list">
                    {addresses?.map(addr => (
                      <label
                        key={addr.id}
                        className={`chk-addr-option ${selectedAddressId === addr.id ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={addr.id}
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          style={{ display: 'none' }}
                        />
                        <div className="chk-addr-radio">
                          {selectedAddressId === addr.id && (
                            <div className="chk-addr-radio-dot" />
                          )}
                        </div>
                        <div className="chk-addr-info">
                          <p className="chk-addr-name">
                            {addr.label}
                            <span style={{ fontWeight: 400, color: 'var(--chk-text3)' }}> — {addr.full_name}</span>
                          </p>
                          <p className="chk-addr-line">{addr.address_line}, {addr.city}, {addr.state} {addr.pincode}</p>
                          <p className="chk-addr-line">📞 {addr.phone}</p>
                        </div>
                        {selectedAddressId === addr.id && (
                          <div className="chk-addr-check"><CheckCircle2 size={18} /></div>
                        )}
                      </label>
                    ))}

                    {/* Add new */}
                    <label className={`chk-addr-option new ${selectedAddressId === 'new' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="address"
                        value="new"
                        checked={selectedAddressId === 'new'}
                        onChange={() => setSelectedAddressId('new')}
                        style={{ display: 'none' }}
                      />
                      <div className="chk-addr-radio">
                        {selectedAddressId === 'new' && <div className="chk-addr-radio-dot" />}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Plus size={16} style={{ color: 'var(--chk-accent)' }} />
                        <span className="chk-addr-name">Add new address</span>
                      </div>
                    </label>
                  </div>
                )}

                {/* New address form */}
                {selectedAddressId === 'new' && (
                  <div className="chk-new-addr-form">
                    <div className="chk-form-grid">
                      <div>
                        <label className="chk-label">Full Name *</label>
                        <input className="chk-input" name="full_name" value={newAddress.full_name} onChange={handleInputChange} required placeholder="Your full name" />
                      </div>
                      <div>
                        <label className="chk-label">Phone Number</label>
                        <input className="chk-input" name="phone" value={newAddress.phone} onChange={handleInputChange} placeholder="+91 XXXXX XXXXX" />
                      </div>
                      <div className="chk-full-col">
                        <label className="chk-label">Address Line *</label>
                        <input className="chk-input" name="address_line" value={newAddress.address_line} onChange={handleInputChange} required placeholder="Street, building, flat no." />
                      </div>
                      <div>
                        <label className="chk-label">City *</label>
                        <input className="chk-input" name="city" value={newAddress.city} onChange={handleInputChange} required placeholder="City" />
                      </div>
                      <div>
                        <label className="chk-label">State *</label>
                        <input className="chk-input" name="state" value={newAddress.state} onChange={handleInputChange} required placeholder="State" />
                      </div>
                      <div>
                        <label className="chk-label">Pincode *</label>
                        <input className="chk-input" name="pincode" value={newAddress.pincode} onChange={handleInputChange} required placeholder="6-digit pincode" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment info card */}
              <div className="chk-card chk-payment-card">
                <div className="chk-card-header">
                  <div className="chk-card-icon-wrap muted">
                    <CreditCard size={17} style={{ color: 'var(--chk-text3)' }} />
                  </div>
                  <h2 className="chk-card-title">Payment</h2>
                  <span className="chk-wa-badge">Via WhatsApp</span>
                </div>
                <p className="chk-payment-note">
                  After placing your order, you&apos;ll be redirected to WhatsApp to complete payment. Your order will be held for 24 hours.
                </p>
                <div className="chk-payment-icons">
                  {['💳 UPI', '🏦 Bank Transfer', '💵 Cash on Delivery'].map(m => (
                    <span key={m} className="chk-payment-method">{m}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right column: order summary ── */}
            <aside className="chk-right">
              <div className="chk-summary">
                <h2 className="chk-summary-title">Order Summary</h2>

                {/* Items */}
                <div className="chk-items-list">
                  {items.map(item => (
                    <div key={item.id} className="chk-item-row">
                      <div className="chk-item-img-wrap">
                        <LazyImage src={item.image_url} alt={item.name} />
                        <span className="chk-item-qty-badge">{item.quantity}</span>
                      </div>
                      <div className="chk-item-meta">
                        <p className="chk-item-name">{item.name}</p>
                        <p className="chk-item-unit">
                          {formatPrice(item.price)} each
                          {item.original_price && item.original_price > item.price && (
                            <span style={{ textDecoration: 'line-through', color: 'var(--chk-text3)', marginLeft: 6, fontSize: 11 }}>
                              {formatPrice(item.original_price)}
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="chk-item-total">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="chk-totals">
                  <div className="chk-total-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="chk-total-row" style={{ color: 'var(--chk-green)', fontWeight: 600 }}>
                      <span>You save</span>
                      <span>−{formatPrice(savings)}</span>
                    </div>
                  )}
                  <div className="chk-total-row">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? 'free' : ''}>
                      {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  {shippingCost > 0 && (
                    <p className="chk-free-ship-hint">
                      <Truck size={12} style={{ display: 'inline', marginRight: 4 }} />
                      Add {formatPrice(500 - totalPrice)} more for free shipping
                    </p>
                  )}
                  <div className="chk-grand-total">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* CTA */}
                <button type="submit" className="chk-place-btn" disabled={loading}>
                  {loading ? (
                    <span className="chk-spinner" />
                  ) : (
                    <>Place Order &amp; Pay via WhatsApp <ChevronRight size={18} /></>
                  )}
                </button>

                {/* Trust strip */}
                <div className="chk-trust-strip">
                  <span><ShieldCheck size={13} /> Secure &amp; Encrypted</span>
                  <span>🔁 Easy Returns</span>
                  <span>✅ Genuine Products</span>
                </div>
              </div>
            </aside>
          </form>
        </div>
      </div>
    </>
  );
}

function ChkStyles() {
  return (
    <style>{`
      :root {
        --chk-bg:       #f6f5f2;
        --chk-surface:  #ffffff;
        --chk-surface2: #f0eeea;
        --chk-border:   #e8e4de;
        --chk-text:     #1a1714;
        --chk-text2:    #5c5650;
        --chk-text3:    #9c9690;
        --chk-accent:   #4f46e5;
        --chk-accent2:  #4338ca;
        --chk-accentl:  rgba(79,70,229,0.1);
        --chk-green:    #059669;
        --chk-greenl:   rgba(5,150,105,0.1);
        --chk-radius:   16px;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --chk-bg:      #0f0e0c;
          --chk-surface: #1a1917;
          --chk-surface2:#222019;
          --chk-border:  #2d2b27;
          --chk-text:    #f2ede8;
          --chk-text2:   #a09890;
          --chk-text3:   #6b6460;
          --chk-accentl: rgba(99,102,241,0.14);
          --chk-greenl:  rgba(16,185,129,0.12);
        }
      }

      .chk-root {
        min-height: 100vh;
        background: var(--chk-bg);
      }
      .chk-inner {
        max-width: 1280px;
        margin: 0 auto;
        padding: 32px 16px 80px;
        box-sizing: border-box;
      }
      @media (min-width: 640px)  { .chk-inner { padding: 40px 24px 80px; } }
      @media (min-width: 1024px) { .chk-inner { padding: 48px 40px 96px; } }

      /* Page head */
      .chk-page-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 36px;
      }
      .chk-page-title {
        font-size: clamp(1.5rem, 4vw, 2rem);
        font-weight: 900;
        color: var(--chk-text);
        margin: 0;
        letter-spacing: -0.03em;
      }

      /* Steps */
      .chk-steps {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .chk-step {
        display: flex;
        align-items: center;
        gap: 7px;
        opacity: 0.4;
        transition: opacity 0.2s;
      }
      .chk-step.active { opacity: 1; }
      .chk-step-circle {
        width: 30px; height: 30px;
        border-radius: 50%;
        background: var(--chk-accentl);
        color: var(--chk-accent);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .chk-step.active .chk-step-circle {
        background: var(--chk-accent);
        color: white;
      }
      .chk-step-label { font-size: 12px; font-weight: 600; color: var(--chk-text2); }
      .chk-step-line { width: 28px; height: 1.5px; background: var(--chk-border); }

      /* Layout */
      .chk-layout {
        display: grid;
        grid-template-columns: 1fr;
        gap: 24px;
        align-items: start;
      }
      @media (min-width: 1024px) {
        .chk-layout { grid-template-columns: 1fr 380px; gap: 32px; }
      }

      .chk-left { display: flex; flex-direction: column; gap: 20px; }

      /* Card */
      .chk-card {
        background: var(--chk-surface);
        border: 1px solid var(--chk-border);
        border-radius: 20px;
        padding: 24px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.05);
      }
      @media (prefers-color-scheme: dark) { .chk-card { box-shadow: 0 2px 12px rgba(0,0,0,0.25); } }

      .chk-card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 22px;
      }
      .chk-card-icon-wrap {
        width: 36px; height: 36px;
        border-radius: 10px;
        background: var(--chk-accentl);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .chk-card-icon-wrap.muted { background: var(--chk-surface2); }
      .chk-card-title {
        font-size: 16px;
        font-weight: 800;
        color: var(--chk-text);
        margin: 0;
        letter-spacing: -0.02em;
        flex: 1;
      }
      .chk-wa-badge {
        font-size: 11px;
        font-weight: 700;
        color: #059669;
        background: rgba(5,150,105,0.12);
        padding: 3px 10px;
        border-radius: 9999px;
      }

      /* Address options */
      .chk-addr-list { display: flex; flex-direction: column; gap: 10px; }
      .chk-addr-option {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 14px 16px;
        border: 1.5px solid var(--chk-border);
        border-radius: var(--chk-radius);
        cursor: pointer;
        transition: border-color 0.2s, background 0.2s;
        background: var(--chk-surface2);
      }
      .chk-addr-option:hover { border-color: rgba(79,70,229,0.35); background: var(--chk-accentl); }
      .chk-addr-option.selected {
        border-color: var(--chk-accent);
        background: var(--chk-accentl);
      }
      .chk-addr-radio {
        width: 18px; height: 18px;
        border-radius: 50%;
        border: 2px solid var(--chk-border);
        flex-shrink: 0;
        margin-top: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: border-color 0.2s;
      }
      .chk-addr-option.selected .chk-addr-radio { border-color: var(--chk-accent); }
      .chk-addr-radio-dot {
        width: 9px; height: 9px;
        border-radius: 50%;
        background: var(--chk-accent);
      }
      .chk-addr-info { flex: 1; min-width: 0; }
      .chk-addr-name {
        font-size: 14px;
        font-weight: 700;
        color: var(--chk-text);
        margin: 0 0 4px;
      }
      .chk-addr-line {
        font-size: 13px;
        color: var(--chk-text2);
        margin: 0 0 2px;
        line-height: 1.5;
      }
      .chk-addr-check { color: var(--chk-accent); flex-shrink: 0; }

      /* New address form */
      .chk-new-addr-form {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid var(--chk-border);
        animation: chkFadeUp 0.3s ease both;
      }
      .chk-form-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 14px;
      }
      @media (min-width: 560px) {
        .chk-form-grid { grid-template-columns: 1fr 1fr; }
      }
      .chk-full-col { grid-column: 1 / -1; }
      .chk-label {
        display: block;
        font-size: 12px;
        font-weight: 700;
        color: var(--chk-text2);
        margin-bottom: 7px;
        letter-spacing: 0.02em;
      }
      .chk-input {
        width: 100%;
        padding: 11px 14px;
        border-radius: 11px;
        border: 1.5px solid var(--chk-border);
        background: var(--chk-surface2);
        color: var(--chk-text);
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
        font-family: inherit;
      }
      .chk-input::placeholder { color: var(--chk-text3); }
      .chk-input:focus {
        border-color: var(--chk-accent);
        box-shadow: 0 0 0 3px var(--chk-accentl);
        background: var(--chk-surface);
      }

      /* Payment card */
      .chk-payment-card { opacity: 0.82; }
      .chk-payment-note {
        font-size: 13px;
        color: var(--chk-text2);
        line-height: 1.65;
        margin: 0 0 16px;
      }
      .chk-payment-icons { display: flex; flex-wrap: wrap; gap: 8px; }
      .chk-payment-method {
        font-size: 12px;
        font-weight: 600;
        color: var(--chk-text2);
        background: var(--chk-surface2);
        border: 1px solid var(--chk-border);
        padding: 5px 12px;
        border-radius: 9999px;
      }

      .chk-loading-text { font-size: 14px; color: var(--chk-text3); padding: 8px 0; }

      /* ── Right: summary ── */
      .chk-right { position: relative; }
      .chk-summary {
        position: sticky;
        top: 80px;
        background: var(--chk-surface);
        border: 1px solid var(--chk-border);
        border-radius: 22px;
        padding: 24px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.07);
      }
      @media (prefers-color-scheme: dark) { .chk-summary { box-shadow: 0 4px 24px rgba(0,0,0,0.35); } }
      .chk-summary-title {
        font-size: 17px;
        font-weight: 800;
        color: var(--chk-text);
        margin: 0 0 20px;
        letter-spacing: -0.02em;
      }

      /* Items list */
      .chk-items-list {
        display: flex;
        flex-direction: column;
        gap: 14px;
        max-height: 320px;
        overflow-y: auto;
        margin-bottom: 20px;
        padding-right: 4px;
      }
      .chk-items-list::-webkit-scrollbar { width: 4px; }
      .chk-items-list::-webkit-scrollbar-track { background: var(--chk-surface2); border-radius: 4px; }
      .chk-items-list::-webkit-scrollbar-thumb { background: var(--chk-border); border-radius: 4px; }

      .chk-item-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .chk-item-img-wrap {
        position: relative;
        flex-shrink: 0;
        width: 56px; height: 56px;
        border-radius: 12px;
        overflow: hidden;
        background: var(--chk-surface2);
        border: 1px solid var(--chk-border);
      }
      .chk-item-img-wrap img,
      .chk-item-img-wrap > * { width: 100%; height: 100%; object-fit: cover; display: block; }
      .chk-item-qty-badge {
        position: absolute;
        top: -5px; right: -5px;
        width: 18px; height: 18px;
        border-radius: 50%;
        background: var(--chk-accent);
        color: white;
        font-size: 10px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--chk-surface);
      }
      .chk-item-meta { flex: 1; min-width: 0; }
      .chk-item-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--chk-text);
        margin: 0 0 3px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .chk-item-unit { font-size: 12px; color: var(--chk-text3); margin: 0; }
      .chk-item-total { font-size: 13px; font-weight: 700; color: var(--chk-text); flex-shrink: 0; }

      /* Totals */
      .chk-totals {
        border-top: 1.5px solid var(--chk-border);
        padding-top: 16px;
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .chk-total-row {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: var(--chk-text2);
      }
      .chk-total-row .free { color: var(--chk-green); font-weight: 700; }
      .chk-free-ship-hint {
        font-size: 12px;
        color: var(--chk-text3);
        margin: -4px 0 0;
      }
      .chk-grand-total {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        font-size: 19px;
        font-weight: 900;
        color: var(--chk-text);
        letter-spacing: -0.025em;
        padding-top: 12px;
        border-top: 1.5px solid var(--chk-border);
        margin-top: 4px;
      }

      /* Place order CTA */
      .chk-place-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 15px 20px;
        border-radius: 14px;
        background: linear-gradient(135deg, #25d366 0%, #059669 100%);
        color: white;
        font-size: 14px;
        font-weight: 700;
        border: none;
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(5,150,105,0.35);
        transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
        margin-bottom: 14px;
        letter-spacing: -0.01em;
        box-sizing: border-box;
      }
      .chk-place-btn:hover:not(:disabled) {
        opacity: 0.92;
        transform: translateY(-2px);
        box-shadow: 0 10px 28px rgba(5,150,105,0.45);
      }
      .chk-place-btn:active:not(:disabled) { transform: scale(0.98); }
      .chk-place-btn:disabled { opacity: 0.6; cursor: not-allowed; }

      /* Spinner */
      .chk-spinner {
        width: 18px; height: 18px;
        border: 2.5px solid rgba(255,255,255,0.35);
        border-top-color: white;
        border-radius: 50%;
        animation: chkSpin 0.7s linear infinite;
      }

      /* Trust strip */
      .chk-trust-strip {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px 14px;
      }
      .chk-trust-strip span {
        font-size: 11px;
        color: var(--chk-text3);
        display: flex;
        align-items: center;
        gap: 4px;
      }

      /* ── Success screen ── */
      .chk-success-wrap {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--chk-bg);
        padding: 32px 16px;
        box-sizing: border-box;
      }
      .chk-success-card {
        max-width: 480px;
        width: 100%;
        background: var(--chk-surface);
        border: 1px solid var(--chk-border);
        border-radius: 24px;
        padding: 48px 36px;
        text-align: center;
        box-shadow: 0 8px 40px rgba(0,0,0,0.08);
        animation: chkFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
      }
      .chk-success-icon {
        width: 88px; height: 88px;
        border-radius: 50%;
        background: rgba(5,150,105,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
        animation: chkPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both;
      }
      .chk-success-title {
        font-size: 26px;
        font-weight: 900;
        color: var(--chk-text);
        margin: 0 0 14px;
        letter-spacing: -0.03em;
      }
      .chk-success-body {
        font-size: 14px;
        color: var(--chk-text2);
        line-height: 1.7;
        margin: 0 0 32px;
      }
      .chk-success-actions {
        display: flex;
        justify-content: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .chk-btn-outline {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 11px 22px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 700;
        color: var(--chk-accent);
        border: 1.5px solid var(--chk-accent);
        text-decoration: none;
        transition: background 0.2s;
      }
      .chk-btn-outline:hover { background: var(--chk-accentl); }
      .chk-btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 11px 22px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 700;
        color: white;
        background: var(--chk-accent);
        text-decoration: none;
        box-shadow: 0 4px 14px rgba(79,70,229,0.3);
        transition: background 0.2s, transform 0.15s;
      }
      .chk-btn-primary:hover { background: var(--chk-accent2); transform: translateY(-1px); }

      @keyframes chkFadeUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes chkSpin { to { transform: rotate(360deg); } }
      @keyframes chkPop {
        from { opacity: 0; transform: scale(0.5); }
        to   { opacity: 1; transform: scale(1); }
      }
    `}</style>
  );
}