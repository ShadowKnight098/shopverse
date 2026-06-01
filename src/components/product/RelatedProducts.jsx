import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import ProductCard from './ProductCard';
import Skeleton from '../common/Skeleton';
import { useRelatedProducts } from '../../hooks/useProducts';

/**
 * RelatedProducts — "You May Also Like" section with a Swiper carousel.
 *
 * @param {string} category - Category to filter related products by
 * @param {string} excludeId - Product ID to exclude (current product)
 */
export default function RelatedProducts({ category, excludeId }) {
  const { products, loading } = useRelatedProducts(category, excludeId);

  // Don't render if no related products and not loading
  if (!loading && (!products || products.length === 0)) {
    return null;
  }

  return (
    <section className="mt-16 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        You May Also Like
      </h2>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton type="product" count={4} />
        </div>
      ) : (
        <Swiper
          spaceBetween={16}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 3, spaceBetween: 20 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
          }}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} compact />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
}
