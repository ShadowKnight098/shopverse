import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { validateEmail, validateRequired } from '../utils/validators';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', subject: '', message: ''
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  useEffect(() => { document.title = 'Contact Us — ShopVerse'; }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const nameVal = validateRequired(formData.name, 'Name');
    if (!nameVal.valid) newErrors.name = nameVal.message;
    if (!validateEmail(formData.email)) newErrors.email = 'Valid email is required.';
    const subVal = validateRequired(formData.subject, 'Subject');
    if (!subVal.valid) newErrors.subject = subVal.message;
    const msgVal = validateRequired(formData.message, 'Message');
    if (!msgVal.valid) newErrors.message = msgVal.message;
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      const { error } = await supabase.from('contact_messages').insert([{
        name: formData.name, email: formData.email,
        subject: formData.subject, message: formData.message
      }]);
      if (error) throw error;
      toast.success('Message sent! We\'ll get back to you soon. 👋');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        /* ── Tokens ── */
        :root {
          --cp-bg:        #ffffff;
          --cp-surface:   #f9fafb;
          --cp-border:    #e5e7eb;
          --cp-text:      #111827;
          --cp-text2:     #6b7280;
          --cp-text3:     #9ca3af;
          --cp-accent:    #4f46e5;
          --cp-accent2:   #4338ca;
          --cp-accentl:   rgba(79,70,229,0.13);
          --cp-red:       #dc2626;
          --cp-redl:      #fef2f2;
          --cp-redborder: #fecaca;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --cp-bg:        #0f172a;
            --cp-surface:   #1e293b;
            --cp-border:    #334155;
            --cp-text:      #f9fafb;
            --cp-text2:     #94a3b8;
            --cp-text3:     #64748b;
            --cp-accentl:   rgba(99,102,241,0.18);
            --cp-red:       #f87171;
            --cp-redl:      rgba(127,29,29,0.2);
            --cp-redborder: rgba(127,29,29,0.4);
          }
        }

        /* ── Root ── */
        .cp-root {
          background: var(--cp-bg);
          min-height: 100vh;
          padding: 64px 24px 96px;
          box-sizing: border-box;
        }
        .cp-inner {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ── Page Header ── */
        .cp-page-header {
          text-align: center;
          margin-bottom: 56px;
          animation: cpSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) both;
        }
        .cp-page-header h1 {
          font-size: 36px;
          font-weight: 800;
          color: var(--cp-text);
          letter-spacing: -0.03em;
          margin: 0 0 12px;
        }
        .cp-page-header p {
          font-size: 15px;
          color: var(--cp-text2);
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ── Layout ── */
        .cp-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .cp-layout { grid-template-columns: 340px 1fr; gap: 32px; }
        }

        /* ── Sidebar ── */
        .cp-sidebar {
          display: flex; flex-direction: column; gap: 20px;
          animation: cpSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both;
        }

        /* Info Card */
        .cp-info-card {
          background: var(--cp-surface);
          border: 1.5px solid var(--cp-border);
          border-radius: 24px;
          padding: 32px;
        }
        .cp-info-card h3 {
          font-size: 16px;
          font-weight: 800;
          color: var(--cp-text);
          letter-spacing: -0.01em;
          margin: 0 0 28px;
        }
        .cp-info-rows { display: flex; flex-direction: column; gap: 24px; }
        .cp-info-row  { display: flex; align-items: flex-start; gap: 16px; }

        .cp-info-icon {
          width: 44px; height: 44px;
          border-radius: 14px;
          background: var(--cp-accentl);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .cp-info-row:hover .cp-info-icon { transform: scale(1.12) rotate(-4deg); }

        .cp-info-text h4 {
          font-size: 13px; font-weight: 700;
          color: var(--cp-text); margin: 0 0 4px;
        }
        .cp-info-text p {
          font-size: 13px; color: var(--cp-text2);
          margin: 0; line-height: 1.55;
        }
        .cp-info-text span {
          font-size: 11px; color: var(--cp-text3);
          display: block; margin-top: 3px;
        }

        /* Hours Card */
        .cp-hours-card {
          border-radius: 24px;
          padding: 32px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%);
          position: relative;
          overflow: hidden;
        }
        .cp-hours-blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(32px);
        }
        .cp-hours-blob-1 {
          top: -40px; right: -40px;
          width: 140px; height: 140px;
          background: rgba(255,255,255,0.1);
          animation: cpFloat 8s ease-in-out infinite;
        }
        .cp-hours-blob-2 {
          bottom: -30px; left: -30px;
          width: 100px; height: 100px;
          background: rgba(236,72,153,0.18);
          animation: cpFloat 10s ease-in-out infinite reverse;
        }
        .cp-hours-heading {
          position: relative; z-index: 2;
          display: flex; align-items: center; gap: 10px;
          font-size: 16px; font-weight: 800;
          color: white; margin: 0 0 24px;
        }
        .cp-hours-list {
          position: relative; z-index: 2;
          list-style: none; margin: 0; padding: 0;
          display: flex; flex-direction: column; gap: 0;
        }
        .cp-hours-row {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 13px; color: rgba(199,210,254,0.9);
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.12);
        }
        .cp-hours-row:last-child { border-bottom: none; padding-bottom: 0; }
        .cp-hours-row span:last-child { font-weight: 700; color: white; }

        /* ── Form Panel ── */
        .cp-form-panel {
          background: var(--cp-surface);
          border: 1.5px solid var(--cp-border);
          border-radius: 24px;
          padding: 40px;
          animation: cpSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.2s both;
        }
        .cp-form-panel h2 {
          font-size: 22px; font-weight: 800;
          color: var(--cp-text); letter-spacing: -0.02em;
          margin: 0 0 32px;
        }

        /* ── Fields ── */
        .cp-fields { display: flex; flex-direction: column; gap: 20px; }
        .cp-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 600px) { .cp-row-2 { grid-template-columns: 1fr; } }

        .cp-field { display: flex; flex-direction: column; }
        .cp-label {
          font-size: 13px; font-weight: 700;
          color: var(--cp-text); margin-bottom: 7px;
        }

        .cp-input-wrap { position: relative; }
        .cp-input-icon {
          position: absolute; left: 13px; top: 50%;
          transform: translateY(-50%);
          color: var(--cp-text3); pointer-events: none;
          display: flex; transition: color 0.2s;
        }
        .cp-input-wrap:focus-within .cp-input-icon { color: var(--cp-accent); }

        .cp-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          border-radius: 12px;
          border: 1.5px solid var(--cp-border);
          background: var(--cp-bg);
          color: var(--cp-text);
          font-size: 14px; font-family: inherit;
          outline: none; box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
        }
        .cp-input::placeholder { color: var(--cp-text3); }
        .cp-input:focus {
          border-color: var(--cp-accent);
          box-shadow: 0 0 0 3px var(--cp-accentl);
          transform: translateY(-1px);
        }
        .cp-input-err { border-color: var(--cp-red) !important; }

        .cp-textarea {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1.5px solid var(--cp-border);
          background: var(--cp-bg);
          color: var(--cp-text);
          font-size: 14px; font-family: inherit;
          outline: none; resize: vertical; min-height: 140px;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
        }
        .cp-textarea::placeholder { color: var(--cp-text3); }
        .cp-textarea:focus {
          border-color: var(--cp-accent);
          box-shadow: 0 0 0 3px var(--cp-accentl);
          transform: translateY(-1px);
        }

        .cp-field-err {
          font-size: 12px; color: var(--cp-red);
          margin-top: 5px;
          animation: cpShake 0.4s cubic-bezier(0.36,0.07,0.19,0.97) both;
        }

        /* ── Submit ── */
        .cp-submit {
          display: inline-flex; align-items: center;
          justify-content: center; gap: 8px;
          padding: 13px 28px;
          border-radius: 12px;
          background: var(--cp-accent);
          color: white;
          font-size: 14px; font-weight: 700; font-family: inherit;
          border: none; cursor: pointer;
          box-shadow: 0 4px 14px rgba(79,70,229,0.3);
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          letter-spacing: -0.01em;
          margin-top: 8px;
        }
        .cp-submit:hover:not(:disabled) {
          background: var(--cp-accent2);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(79,70,229,0.4);
        }
        .cp-submit:active:not(:disabled) { transform: scale(0.98); box-shadow: none; }
        .cp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .cp-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: cpSpin 0.7s linear infinite;
          flex-shrink: 0;
        }

        /* ── Keyframes ── */
        @keyframes cpSlideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cpFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes cpShake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-5px); }
          30%       { transform: translateX(4px); }
          45%       { transform: translateX(-3px); }
          60%       { transform: translateX(2px); }
          75%       { transform: translateX(-1px); }
        }
        @keyframes cpSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="cp-root">
        <div className="cp-inner">

          {/* ── Page Header ── */}
          <div className="cp-page-header">
            <h1>Get in Touch</h1>
            <p>Have a question, feedback, or need assistance? Our team is here to help. Fill out the form or reach us directly.</p>
          </div>

          <div className="cp-layout">

            {/* ── Sidebar ── */}
            <div className="cp-sidebar">

              {/* Info Card */}
              <div className="cp-info-card">
                <h3>Contact Information</h3>
                <div className="cp-info-rows">
                  {[
                    { icon: <MapPin size={18} color="var(--cp-accent)" />, title: 'Our Location', line1: '123 Commerce St, Tech Park,', line2: 'New York, NY 10001' },
                    { icon: <Phone size={18} color="var(--cp-accent)" />, title: 'Phone Number', line1: '+1 (555) 123-4567', sub: 'Mon–Fri, 9am–6pm' },
                    { icon: <Mail  size={18} color="var(--cp-accent)" />, title: 'Email Address', line1: 'support@shopverse.com', sub: '24/7 Online Support' },
                  ].map(({ icon, title, line1, line2, sub }) => (
                    <div className="cp-info-row" key={title}>
                      <div className="cp-info-icon">{icon}</div>
                      <div className="cp-info-text">
                        <h4>{title}</h4>
                        <p>{line1}{line2 && <><br />{line2}</>}</p>
                        {sub && <span>{sub}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hours Card */}
              <div className="cp-hours-card">
                <div className="cp-hours-blob cp-hours-blob-1" />
                <div className="cp-hours-blob cp-hours-blob-2" />
                <p className="cp-hours-heading">
                  <Clock size={20} color="white" />
                  Business Hours
                </p>
                <ul className="cp-hours-list">
                  {[
                    ['Monday – Friday', '9:00 AM – 8:00 PM'],
                    ['Saturday',        '10:00 AM – 4:00 PM'],
                    ['Sunday',          'Closed'],
                  ].map(([day, hrs]) => (
                    <li className="cp-hours-row" key={day}>
                      <span>{day}</span>
                      <span>{hrs}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* ── Form Panel ── */}
            <div className="cp-form-panel">
              <h2>Send us a Message</h2>

              <form onSubmit={handleSubmit}>
                <div className="cp-fields">

                  {/* Name + Email */}
                  <div className="cp-row-2">
                    <div className="cp-field" style={{ animationDelay: '0.25s', animation: 'cpSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.25s both' }}>
                      <label className="cp-label">Your Name</label>
                      <div className="cp-input-wrap">
                        <span className="cp-input-icon">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </span>
                        <input
                          className={`cp-input${errors.name ? ' cp-input-err' : ''}`}
                          name="name" value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          onFocus={() => setFocused('name')}
                          onBlur={() => setFocused('')}
                        />
                      </div>
                      {errors.name && <span className="cp-field-err">{errors.name}</span>}
                    </div>

                    <div className="cp-field" style={{ animation: 'cpSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.32s both' }}>
                      <label className="cp-label">Email Address</label>
                      <div className="cp-input-wrap">
                        <span className="cp-input-icon"><Mail size={17} /></span>
                        <input
                          className={`cp-input${errors.email ? ' cp-input-err' : ''}`}
                          name="email" type="email" value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          onFocus={() => setFocused('email')}
                          onBlur={() => setFocused('')}
                        />
                      </div>
                      {errors.email && <span className="cp-field-err">{errors.email}</span>}
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="cp-field" style={{ animation: 'cpSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.39s both' }}>
                    <label className="cp-label">Subject</label>
                    <div className="cp-input-wrap">
                      <span className="cp-input-icon">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                      </span>
                      <input
                        className={`cp-input${errors.subject ? ' cp-input-err' : ''}`}
                        name="subject" value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help?"
                        onFocus={() => setFocused('subject')}
                        onBlur={() => setFocused('')}
                      />
                    </div>
                    {errors.subject && <span className="cp-field-err">{errors.subject}</span>}
                  </div>

                  {/* Message */}
                  <div className="cp-field" style={{ animation: 'cpSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.46s both' }}>
                    <label className="cp-label">Message</label>
                    <textarea
                      className={`cp-textarea${errors.message ? ' cp-input-err' : ''}`}
                      name="message" value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Write your message here..."
                      onFocus={() => setFocused('message')}
                      onBlur={() => setFocused('')}
                    />
                    {errors.message && <span className="cp-field-err">{errors.message}</span>}
                  </div>

                  {/* Submit */}
                  <div style={{ animation: 'cpSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.53s both' }}>
                    <button type="submit" disabled={loading} className="cp-submit">
                      {loading ? (
                        <><span className="cp-spinner" /> Sending...</>
                      ) : (
                        <><Send size={16} /> Send Message</>
                      )}
                    </button>
                  </div>

                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}