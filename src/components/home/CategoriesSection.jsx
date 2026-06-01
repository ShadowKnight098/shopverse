import { Link } from 'react-router-dom';
import {
  Smartphone, Shirt, Sofa, Dumbbell,
  BookOpen, Sparkles, Gamepad2, ShoppingBasket,
} from 'lucide-react';
import { CATEGORIES } from '../../lib/constants.js';

const iconMap = {
  Smartphone, Shirt, Sofa, Dumbbell,
  BookOpen, Sparkles, Gamepad2, ShoppingBasket,
};

const GRADIENTS = [
  ['#6366f1', '#a855f7'],
  ['#ec4899', '#f43f5e'],
  ['#10b981', '#14b8a6'],
  ['#f97316', '#f59e0b'],
  ['#3b82f6', '#06b6d4'],
  ['#d946ef', '#ec4899'],
  ['#8b5cf6', '#6366f1'],
  ['#84cc16', '#10b981'],
];

export default function CategoriesSection() {
  return (
    <>
      <style>{`
        .cat-section {
          padding: 64px 16px;
          max-width: 1280px;
          margin: 0 auto;
          box-sizing: border-box;
        }
        @media (min-width: 640px) {
          .cat-section { padding: 64px 24px; }
        }
        @media (min-width: 1024px) {
          .cat-section { padding: 64px 32px; }
        }

        .cat-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .cat-header h2 {
          font-size: clamp(1.4rem, 4vw, 1.9rem);
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 8px;
          letter-spacing: -0.02em;
        }
        @media (prefers-color-scheme: dark) {
          .cat-header h2 { color: #f9fafb; }
        }
        .cat-header p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .cat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        @media (min-width: 480px) {
          .cat-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
        }
        @media (min-width: 768px) {
          .cat-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; }
        }

        .cat-card {
          position: relative;
          background: #ffffff;
          border-radius: 18px;
          padding: 24px 16px 20px;
          text-align: center;
          text-decoration: none;
          border: 1px solid #f0f0f0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0;
          animation: catFadeUp 0.45s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @media (prefers-color-scheme: dark) {
          .cat-card {
            background: #1e293b;
            border-color: #334155;
            box-shadow: 0 2px 10px rgba(0,0,0,0.25);
          }
        }
        .cat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.12);
        }
        @media (prefers-color-scheme: dark) {
          .cat-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,0.4); }
        }

        /* Gradient hover tint overlay */
        .cat-card-overlay {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .cat-card:hover .cat-card-overlay { opacity: 0.07; }
        @media (prefers-color-scheme: dark) {
          .cat-card:hover .cat-card-overlay { opacity: 0.14; }
        }

        /* Icon circle */
        .cat-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          flex-shrink: 0;
          transition: transform 0.25s ease;
          box-shadow: 0 6px 18px rgba(0,0,0,0.18);
        }
        .cat-card:hover .cat-icon { transform: scale(1.1); }

        /* On smaller screens, tighten icon */
        @media (max-width: 479px) {
          .cat-icon { width: 52px; height: 52px; border-radius: 14px; }
          .cat-card { padding: 20px 12px 16px; border-radius: 14px; }
        }

        .cat-name {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          line-height: 1.3;
          transition: color 0.2s;
          margin: 0;
        }
        @media (min-width: 640px) { .cat-name { font-size: 14px; } }
        @media (prefers-color-scheme: dark) { .cat-name { color: #e2e8f0; } }
        .cat-card:hover .cat-name { color: #111827; }
        @media (prefers-color-scheme: dark) {
          .cat-card:hover .cat-name { color: #f9fafb; }
        }

        @keyframes catFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <section className="cat-section">
        <div className="cat-header">
          <h2>Shop by Category</h2>
          <p>Browse our wide range of categories</p>
        </div>

        <div className="cat-grid">
          {CATEGORIES.map((category, index) => {
            const IconComponent = iconMap[category.icon] || ShoppingBasket;
            const [colorA, colorB] = GRADIENTS[index % GRADIENTS.length];
            const gradient = `linear-gradient(135deg, ${colorA}, ${colorB})`;

            return (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="cat-card"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Hover tint */}
                <div
                  className="cat-card-overlay"
                  style={{ background: gradient }}
                />

                {/* Icon */}
                <div
                  className="cat-icon"
                  style={{ background: gradient }}
                >
                  <IconComponent size={26} color="white" strokeWidth={2} />
                </div>

                {/* Label */}
                <p className="cat-name">{category.name}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}