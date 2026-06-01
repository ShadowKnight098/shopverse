import { useState, useMemo } from 'react';
import { Package } from 'lucide-react';

/**
 * ProductGallery — main image with thumbnail strip for product detail pages.
 *
 * @param {Array|string} images - Array of image URLs (or a single URL string)
 * @param {string} productName - Product name for alt text
 */
export default function ProductGallery({ images, productName = 'Product' }) {
  const imageList = useMemo(() => {
    if (!images) return [];
    if (typeof images === 'string') return [images];
    if (Array.isArray(images)) return images;
    return [];
  }, [images]);

  const [activeIndex, setActiveIndex]       = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleThumbnailClick = (index) => {
    if (index === activeIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsTransitioning(false);
    }, 220);
  };

  return (
    <>
      <style>{`
        :root {
          --pg-bg:      #ffffff;
          --pg-surface: #f9fafb;
          --pg-border:  #e5e7eb;
          --pg-text:    #111827;
          --pg-text3:   #9ca3af;
          --pg-accent:  #4f46e5;
          --pg-accentl: rgba(79,70,229,0.13);
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --pg-bg:      #0f172a;
            --pg-surface: #1e293b;
            --pg-border:  #334155;
            --pg-text:    #f9fafb;
            --pg-text3:   #64748b;
            --pg-accentl: rgba(99,102,241,0.18);
          }
        }

        /* ── Wrapper ── */
        .pg-root {
          display: flex; flex-direction: column; gap: 12px;
          animation: pgSlideUp 0.65s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* ── Placeholder ── */
        .pg-placeholder {
          aspect-ratio: 1 / 1;
          border-radius: 20px;
          background: var(--pg-surface);
          border: 1.5px solid var(--pg-border);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 10px;
          animation: pgSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) both;
        }
        .pg-placeholder-icon {
          width: 72px; height: 72px;
          border-radius: 22px;
          background: var(--pg-bg);
          border: 1.5px solid var(--pg-border);
          display: flex; align-items: center; justify-content: center;
          animation: pgPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.15s both;
        }
        .pg-placeholder p {
          font-size: 13px; color: var(--pg-text3);
          font-weight: 600; margin: 0;
        }

        /* ── Main image ── */
        .pg-main {
          aspect-ratio: 1 / 1;
          border-radius: 20px;
          overflow: hidden;
          background: var(--pg-surface);
          border: 1.5px solid var(--pg-border);
          position: relative;
          transition: box-shadow 0.25s;
        }
        .pg-main:hover {
          box-shadow: 0 8px 32px rgba(79,70,229,0.1);
          border-color: rgba(79,70,229,0.25);
        }
        .pg-main img {
          width: 100%; height: 100%; object-fit: cover;
          transition: opacity 0.22s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1);
        }
        .pg-main img.pg-fading  { opacity: 0; transform: scale(1.03); }
        .pg-main img.pg-visible { opacity: 1; transform: scale(1); }

        /* Image counter badge */
        .pg-counter {
          position: absolute; bottom: 14px; right: 14px;
          padding: 4px 10px; border-radius: 999px;
          background: rgba(15,23,42,0.55);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.15);
          font-size: 11px; font-weight: 700; color: white;
          letter-spacing: 0.04em;
          pointer-events: none;
        }

        /* ── Thumbnail strip ── */
        .pg-thumbs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .pg-thumb-btn {
          aspect-ratio: 1 / 1;
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          border: 1.5px solid var(--pg-border);
          background: var(--pg-surface);
          padding: 0;
          position: relative;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          animation: pgSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        .pg-thumb-btn:nth-child(1) { animation-delay: 0.1s; }
        .pg-thumb-btn:nth-child(2) { animation-delay: 0.17s; }
        .pg-thumb-btn:nth-child(3) { animation-delay: 0.24s; }
        .pg-thumb-btn:nth-child(4) { animation-delay: 0.31s; }

        .pg-thumb-btn:hover {
          border-color: rgba(79,70,229,0.4);
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(79,70,229,0.15);
        }

        .pg-thumb-btn.pg-thumb-active {
          border-color: var(--pg-accent);
          box-shadow: 0 0 0 3px var(--pg-accentl);
          transform: scale(0.96);
        }

        .pg-thumb-btn img {
          width: 100%; height: 100%; object-fit: cover;
          transition: opacity 0.2s, transform 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        .pg-thumb-btn:hover img { transform: scale(1.07); }
        .pg-thumb-btn.pg-thumb-active img { opacity: 0.85; }

        /* Active indicator line */
        .pg-thumb-btn.pg-thumb-active::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 3px;
          background: var(--pg-accent);
          border-radius: 0 0 12px 12px;
        }

        /* ── Keyframes ── */
        @keyframes pgSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pgPop {
          from { opacity: 0; transform: scale(0.6) rotate(-8deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
      `}</style>

      {imageList.length === 0 ? (
        <div className="pg-placeholder">
          <div className="pg-placeholder-icon">
            <Package size={32} color="var(--pg-text3)" />
          </div>
          <p>No image available</p>
        </div>
      ) : (
        <div className="pg-root">

          {/* Main image */}
          <div className="pg-main">
            <img
              src={imageList[activeIndex]}
              alt={`${productName} — image ${activeIndex + 1}`}
              className={isTransitioning ? 'pg-fading' : 'pg-visible'}
            />
            {imageList.length > 1 && (
              <span className="pg-counter">
                {activeIndex + 1} / {imageList.length}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {imageList.length > 1 && (
            <div className="pg-thumbs">
              {imageList.map((img, index) => (
                <button
                  key={index}
                  className={`pg-thumb-btn${index === activeIndex ? ' pg-thumb-active' : ''}`}
                  onClick={() => handleThumbnailClick(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img
                    src={img}
                    alt={`${productName} thumbnail ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          )}

        </div>
      )}
    </>
  );
}