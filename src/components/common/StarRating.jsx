import { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';

/**
 * Star rating display (and optional interactive picker).
 *
 * @param {number} rating - Current rating value (e.g. 3.5)
 * @param {number} maxStars - Maximum stars (default 5)
 * @param {'sm'|'md'|'lg'} size - Star icon size
 * @param {boolean} interactive - If true, stars are clickable
 * @param {Function} onChange - Called with new rating when interactive
 */
const iconSizes = { sm: 14, md: 18, lg: 24 };

export default function StarRating({
  rating = 0,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange,
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const iconSize = iconSizes[size] || iconSizes.md;
  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    const isFilled = displayRating >= i;
    const isHalf = !isFilled && displayRating >= i - 0.5;

    stars.push(
      <span
        key={i}
        className={`
          inline-flex
          ${interactive ? 'cursor-pointer' : ''}
          transition-transform duration-100
          ${interactive ? 'hover:scale-110' : ''}
        `}
        onClick={() => {
          if (interactive && onChange) onChange(i);
        }}
        onMouseEnter={() => {
          if (interactive) setHoverRating(i);
        }}
        onMouseLeave={() => {
          if (interactive) setHoverRating(0);
        }}
      >
        {isFilled ? (
          <Star
            size={iconSize}
            className="text-amber-400 fill-amber-400"
          />
        ) : isHalf ? (
          /* Half-star: we layer a half-filled icon over an empty one */
          <span className="relative inline-flex">
            <Star size={iconSize} className="text-gray-300 dark:text-gray-600" />
            <span className="absolute inset-0 overflow-hidden w-1/2">
              <Star
                size={iconSize}
                className="text-amber-400 fill-amber-400"
              />
            </span>
          </span>
        ) : (
          <Star
            size={iconSize}
            className="text-gray-300 dark:text-gray-600"
          />
        )}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating} out of ${maxStars} stars`}>
      {stars}
    </div>
  );
}
