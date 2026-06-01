import { useState } from 'react';
import { Send, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success('Thanks for subscribing! 🎉');
    setEmail('');
    setIsSubmitting(false);
  };

  return (
    <>
      <style>{`
        .nl-section {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          padding: 80px 16px;
          box-sizing: border-box;
        }
        @media (min-width: 640px)  { .nl-section { padding: 88px 24px; } }
        @media (min-width: 1024px) { .nl-section { padding: 88px 32px; } }

        /* ── Decorative blobs ── */
        .nl-blob-tr {
          position: absolute;
          top: -80px; right: -80px;
          width: 288px; height: 288px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          pointer-events: none;
          filter: blur(48px);
        }
        .nl-blob-bl {
          position: absolute;
          bottom: -80px; left: -80px;
          width: 320px; height: 320px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          pointer-events: none;
          filter: blur(48px);
        }

        /* Floating shapes */
        .nl-shape {
          position: absolute;
          border: 1px solid rgba(255,255,255,0.1);
          pointer-events: none;
          animation: nlFloat var(--dur, 4s) ease-in-out infinite var(--delay, 0s);
        }
        .nl-shape-1 {
          top: 10%; left: 25%;
          width: 72px; height: 72px;
          border-radius: 14px;
          transform: rotate(12deg);
          --dur: 4s;
        }
        .nl-shape-2 {
          bottom: 10%; right: 25%;
          width: 56px; height: 56px;
          border-radius: 50%;
          --dur: 5s; --delay: 1s;
        }
        .nl-shape-3 {
          top: 50%; left: 40px;
          width: 44px; height: 44px;
          border-radius: 8px;
          transform: rotate(45deg);
          --dur: 6s; --delay: 2s;
        }

        /* Dot pattern */
        .nl-dots {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.04;
          background-image: radial-gradient(circle, white 1px, transparent 1px);
          background-size: 24px 24px;
        }

        /* ── Content ── */
        .nl-content {
          position: relative;
          z-index: 10;
          max-width: 640px;
          margin: 0 auto;
          text-align: center;
        }

        .nl-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px; height: 56px;
          border-radius: 16px;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          margin-bottom: 24px;
        }

        .nl-title {
          font-size: clamp(1.7rem, 5vw, 2.4rem);
          font-weight: 800;
          color: white;
          margin: 0 0 12px;
          letter-spacing: -0.02em;
        }

        .nl-desc {
          font-size: 15px;
          color: rgba(255,255,255,0.7);
          line-height: 1.65;
          margin: 0 auto 32px;
          max-width: 420px;
        }

        /* ── Form ── */
        .nl-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 480px;
          margin: 0 auto;
        }
        @media (min-width: 560px) {
          .nl-form { flex-direction: row; }
        }

        .nl-input {
          flex: 1;
          min-width: 0;
          padding: 13px 18px;
          border-radius: 12px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .nl-input::placeholder { color: rgba(255,255,255,0.45); }
        .nl-input:focus {
          border-color: rgba(255,255,255,0.5);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.16);
        }

        .nl-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 28px;
          border-radius: 12px;
          background: white;
          color: #4f46e5;
          font-size: 14px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
        }
        .nl-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.92);
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
        }
        .nl-btn:active:not(:disabled) { transform: scale(0.97); }
        .nl-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Spinner */
        .nl-spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid #4f46e5;
          border-top-color: transparent;
          border-radius: 50%;
          animation: nlSpin 0.7s linear infinite;
          flex-shrink: 0;
        }

        .nl-note {
          font-size: 12px;
          color: rgba(255,255,255,0.38);
          margin: 16px 0 0;
        }

        @keyframes nlFloat {
          0%, 100% { transform: translateY(0) rotate(var(--rot, 0deg)); }
          50%       { transform: translateY(-12px) rotate(var(--rot, 0deg)); }
        }
        @keyframes nlSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <section className="nl-section">
        {/* Blobs */}
        <div className="nl-blob-tr" />
        <div className="nl-blob-bl" />

        {/* Floating shapes */}
        <div className="nl-shape nl-shape-1" />
        <div className="nl-shape nl-shape-2" />
        <div className="nl-shape nl-shape-3" />

        {/* Dot grid */}
        <div className="nl-dots" />

        {/* Content */}
        <div className="nl-content">
          <div className="nl-icon">
            <Mail size={26} color="white" />
          </div>

          <h2 className="nl-title">Stay in the Loop</h2>
          <p className="nl-desc">
            Subscribe to our newsletter and never miss the latest deals,
            new arrivals, and exclusive offers.
          </p>

          <form onSubmit={handleSubmit} className="nl-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="nl-input"
            />
            <button type="submit" disabled={isSubmitting} className="nl-btn">
              {isSubmitting
                ? <span className="nl-spinner" />
                : <Send size={15} />}
              Subscribe
            </button>
          </form>

          <p className="nl-note">No spam, unsubscribe anytime. We respect your privacy.</p>
        </div>
      </section>
    </>
  );
}