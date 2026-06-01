import { useEffect } from 'react'
import HeroSlider from '../components/home/HeroSlider'
import CategoriesSection from '../components/home/CategoriesSection'
import FeaturedProducts from '../components/home/FeaturedProducts'
import TrendingProducts from '../components/home/TrendingProducts'
import UpcomingSalesPreview from '../components/home/UpcomingSalesPreview'
import TestimonialsSection from '../components/home/TestimonialsSection'
import NewsletterSection from '../components/home/NewsletterSection'

export default function HomePage() {
  useEffect(() => {
    document.title = 'ShopVerse — Premium Online Shopping'
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">

      {/* ── Hero — full screen, flush with navbar ── */}
      <HeroSlider />

      {/* ── Shop by Category ── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategoriesSection />
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-20 lg:py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturedProducts />
        </div>
      </section>

      {/* ── Trending Now ── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TrendingProducts />
        </div>
      </section>

      {/* ── Upcoming Sales Banner ── */}
      <UpcomingSalesPreview />


      {/* ── Newsletter ── */}
      <NewsletterSection />

    </div>
  )
}
