/**
 * Skeleton loading placeholder component.
 * Uses the .skeleton CSS class from index.css for shimmer animation.
 *
 * @param {'card'|'text'|'image'|'product'} type - Shape of the skeleton
 * @param {number} count - Number of skeletons to render
 */
function SkeletonBlock({ className = '' }) {
  return (
    <div className={`skeleton rounded-lg ${className}`} />
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700/50 p-4">
      {/* Image placeholder */}
      <SkeletonBlock className="w-full h-48 rounded-xl mb-4" />
      {/* Title line */}
      <SkeletonBlock className="w-3/4 h-4 mb-3" />
      {/* Subtitle line */}
      <SkeletonBlock className="w-1/2 h-4 mb-3" />
      {/* Short line */}
      <SkeletonBlock className="w-1/3 h-4" />
    </div>
  );
}

function TextSkeleton() {
  return (
    <div className="space-y-3">
      <SkeletonBlock className="w-full h-4" />
      <SkeletonBlock className="w-5/6 h-4" />
      <SkeletonBlock className="w-4/6 h-4" />
      <SkeletonBlock className="w-3/4 h-4" />
    </div>
  );
}

function ImageSkeleton() {
  return (
    <SkeletonBlock className="w-full aspect-square rounded-xl" />
  );
}

function ProductSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700/50">
      {/* Product image */}
      <SkeletonBlock className="w-full h-56 rounded-none" />
      <div className="p-4 space-y-3">
        {/* Category */}
        <SkeletonBlock className="w-16 h-3" />
        {/* Product title */}
        <SkeletonBlock className="w-3/4 h-4" />
        {/* Rating */}
        <SkeletonBlock className="w-24 h-3" />
        {/* Price row */}
        <div className="flex items-center justify-between pt-1">
          <SkeletonBlock className="w-20 h-6" />
          <SkeletonBlock className="w-10 h-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

const skeletonMap = {
  card: CardSkeleton,
  text: TextSkeleton,
  image: ImageSkeleton,
  product: ProductSkeleton,
};

export default function Skeleton({ type = 'card', count = 1 }) {
  const Component = skeletonMap[type] || CardSkeleton;

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Component key={i} />
      ))}
    </>
  );
}
