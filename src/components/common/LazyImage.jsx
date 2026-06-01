import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Lazy-loading image with IntersectionObserver, placeholder skeleton, and error fallback.
 *
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text
 * @param {string} className - Additional Tailwind classes
 * @param {string} fallback - Fallback image URL on error
 */

// Default placeholder SVG (inline data URI – a simple product icon)
const DEFAULT_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' fill='none'%3E%3Crect width='400' height='400' rx='12' fill='%23e5e7eb'/%3E%3Cpath d='M170 210h60M200 180v60' stroke='%239ca3af' stroke-width='6' stroke-linecap='round'/%3E%3C/svg%3E";

export default function LazyImage({
  src,
  alt = '',
  className = '',
  fallback = DEFAULT_FALLBACK,
  ...rest
}) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // IntersectionObserver to trigger load when element enters viewport
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: '200px' } // Start loading 200px before visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleLoad = useCallback(() => setIsLoaded(true), []);
  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  const imageSrc = hasError ? fallback : src;

  return (
    <div ref={imgRef} className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${className}`} {...rest}>
      {/* Skeleton placeholder shown while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 skeleton" />
      )}

      {/* Actual image – only start loading once in viewport */}
      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            w-full h-full object-cover
            transition-opacity duration-500 ease-out
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          loading="lazy"
        />
      )}
    </div>
  );
}
