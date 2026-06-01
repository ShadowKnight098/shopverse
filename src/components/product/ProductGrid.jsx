import { ShoppingBag } from 'lucide-react';
import ProductCard from './ProductCard';
import Skeleton from '../common/Skeleton';

export default function ProductGrid({
  products = [],
  loading = false,
  emptyMessage = 'No products found.',
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        <Skeleton type="product" count={8} />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <ShoppingBag size={36} className="text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
          Nothing here yet
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}