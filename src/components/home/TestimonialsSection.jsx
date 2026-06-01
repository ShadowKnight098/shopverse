import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Quote } from 'lucide-react';
import StarRating from '../common/StarRating';
import { TESTIMONIALS } from '../../lib/constants.js';

/**
 * TestimonialsSection — customer testimonials carousel for the homepage.
 */
export default function TestimonialsSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
          What Our Customers Say
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Real reviews from our happy shoppers
        </p>
      </div>

      {/* Testimonials carousel */}
      <Swiper
        spaceBetween={24}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 1, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 24 },
          1024: { slidesPerView: 3, spaceBetween: 24 },
        }}
      >
        {TESTIMONIALS.map((testimonial) => (
          <SwiperSlide key={testimonial.id}>
            <div
              className="
                bg-white dark:bg-slate-800 rounded-2xl p-6
                shadow-lg border border-gray-100 dark:border-gray-700
                h-full flex flex-col relative
              "
            >
              {/* Decorative quote icon */}
              <div className="absolute top-4 right-4 text-indigo-100 dark:text-indigo-900/40">
                <Quote size={40} />
              </div>

              {/* Comment */}
              <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed mb-6 flex-1 relative z-10">
                "{testimonial.comment}"
              </p>

              {/* Rating */}
              <div className="mb-4">
                <StarRating rating={testimonial.rating} size="sm" />
              </div>

              {/* Author info */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-indigo-900/50"
                />
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
