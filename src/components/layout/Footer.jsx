import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Camera, MessageCircle, Play, Send, MapPin, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Shop', path: '/products' },
  { label: 'Sales', path: '/sales' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

const customerLinks = [
  { label: 'FAQ', path: '/faq' },
  { label: 'Shipping Info', path: '/shipping' },
  { label: 'Returns & Exchanges', path: '/returns' },
  { label: 'Track Order', path: '/track-order' },
  { label: 'Privacy Policy', path: '/privacy' },
];

const socialLinks = [
  { icon: Globe,          label: 'Facebook',  href: '#' },
  { icon: Camera,         label: 'Instagram', href: '#' },
  { icon: MessageCircle,  label: 'Twitter',   href: '#' },
  { icon: Play,           label: 'Youtube',   href: '#' },
];

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Please enter your email'); return; }
    toast.success('Successfully subscribed! 🎉');
    setEmail('');
  };

  return (
    <>
      <style>{`
        .ft-root {
          background: #0f172a;
          color: #cbd5e1;
        }

        /* ── Top section ── */
        .ft-top {
          max-width: 1280px;
          margin: 0 auto;
          padding: 64px 16px;
          box-sizing: border-box;
        }
        @media (min-width: 640px)  { .ft-top { padding: 64px 24px; } }
        @media (min-width: 1024px) { .ft-top { padding: 64px 32px; } }

        .ft-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
        }
        @media (min-width: 640px) {
          .ft-grid { grid-template-columns: repeat(2, 1fr); gap: 40px 32px; }
        }
        @media (min-width: 1024px) {
          .ft-grid { grid-template-columns: repeat(4, 1fr); gap: 40px 48px; }
        }

        /* Brand col spans 2 on tablet, 1 on desktop */
        .ft-brand {
          grid-column: span 1;
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .ft-brand { grid-column: span 2; }
        }

        /* Logo */
        .ft-logo {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          margin-bottom: 16px;
          gap: 1px;
        }
        .ft-logo-shop {
          font-size: 22px;
          font-weight: 900;
          background: linear-gradient(to right, #818cf8, #a78bfa, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ft-logo-verse {
          font-size: 22px;
          font-weight: 700;
          color: #ffffff;
        }

        .ft-tagline {
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.65;
          margin: 0 0 24px;
          max-width: 260px;
        }

        /* Social icons */
        .ft-socials {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ft-social-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #1e293b;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          text-decoration: none;
          transition: background 0.2s, color 0.2s, transform 0.2s;
          flex-shrink: 0;
        }
        .ft-social-btn:hover {
          background: #4f46e5;
          color: white;
          transform: translateY(-2px);
        }

        /* Link columns */
        .ft-col-title {
          font-size: 11px;
          font-weight: 700;
          color: #f1f5f9;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 18px;
        }
        .ft-links {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ft-link {
          font-size: 13px;
          color: #94a3b8;
          text-decoration: none;
          transition: color 0.2s;
        }
        .ft-link:hover { color: #818cf8; }

        /* Newsletter */
        .ft-nl-desc {
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.6;
          margin: 0 0 16px;
        }
        .ft-nl-form {
          display: flex;
          gap: 8px;
        }
        .ft-nl-input {
          flex: 1;
          min-width: 0;
          padding: 10px 14px;
          border-radius: 10px;
          background: #1e293b;
          border: 1px solid #334155;
          color: white;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .ft-nl-input::placeholder { color: #64748b; }
        .ft-nl-input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.2);
        }
        .ft-nl-btn {
          padding: 10px 14px;
          border-radius: 10px;
          background: #4f46e5;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s, transform 0.15s;
        }
        .ft-nl-btn:hover  { background: #4338ca; }
        .ft-nl-btn:active { transform: scale(0.96); }

        /* Contact info */
        .ft-contact {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ft-contact-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          color: #94a3b8;
        }
        .ft-contact-icon {
          flex-shrink: 0;
          margin-top: 1px;
          color: #64748b;
        }

        /* ── Bottom bar ── */
        .ft-bottom {
          border-top: 1px solid #1e293b;
        }
        .ft-bottom-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          box-sizing: border-box;
        }
        @media (min-width: 640px) {
          .ft-bottom-inner {
            flex-direction: row;
            justify-content: space-between;
            padding: 20px 24px;
          }
        }
        @media (min-width: 1024px) { .ft-bottom-inner { padding: 20px 32px; } }

        .ft-copy {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        .ft-payments {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .ft-payment-pill {
          padding: 4px 10px;
          border-radius: 6px;
          background: #1e293b;
          font-size: 10px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
      `}</style>

      <footer className="ft-root">
        {/* Top */}
        <div className="ft-top">
          <div className="ft-grid">

            {/* Brand */}
            <div className="ft-brand">
              <Link to="/" className="ft-logo">
                <span className="ft-logo-shop">Shop</span>
                <span className="ft-logo-verse">Verse</span>
              </Link>
              <p className="ft-tagline">
                Discover a universe of premium products. Your one-stop destination for fashion,
                tech, and lifestyle essentials.
              </p>
              <div className="ft-socials">
                {socialLinks.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ft-social-btn"
                    aria-label={label}
                  >
                    <Icon size={17} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="ft-col-title">Quick Links</h4>
              <ul className="ft-links">
                {quickLinks.map(({ label, path }) => (
                  <li key={path}>
                    <Link to={path} className="ft-link">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="ft-col-title">Customer Service</h4>
              <ul className="ft-links">
                {customerLinks.map(({ label, path }) => (
                  <li key={path}>
                    <Link to={path} className="ft-link">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="ft-col-title">Newsletter</h4>
              <p className="ft-nl-desc">
                Subscribe to get special offers, free giveaways, and exclusive deals.
              </p>
              <form onSubmit={handleNewsletter} className="ft-nl-form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="ft-nl-input"
                />
                <button type="submit" className="ft-nl-btn" aria-label="Subscribe">
                  <Send size={17} />
                </button>
              </form>

              <div className="ft-contact">
                <div className="ft-contact-row">
                  <MapPin size={14} className="ft-contact-icon" />
                  <span>123 Commerce St, New York, NY</span>
                </div>
                <div className="ft-contact-row">
                  <Phone size={14} className="ft-contact-icon" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="ft-contact-row">
                  <Mail size={14} className="ft-contact-icon" />
                  <span>support@shopverse.com</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="ft-bottom">
          <div className="ft-bottom-inner">
            <p className="ft-copy">© {new Date().getFullYear()} ShopVerse. All rights reserved.</p>
            <div className="ft-payments">
              {['Visa', 'Mastercard', 'PayPal', 'Apple Pay'].map((name) => (
                <span key={name} className="ft-payment-pill">{name}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}