import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Zap } from 'lucide-react';
import { useSales } from '../../hooks/useSales';

/**
 * UpcomingSalesPreview — countdown banner for the next upcoming sale.
 * Renders nothing if no upcoming sales exist.
 */
export default function UpcomingSalesPreview() {
  const { sales, loading } = useSales();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Find the first upcoming sale (start_date > now)
  const upcomingSale = sales?.find((sale) => {
    const startDate = new Date(sale.start_date);
    return startDate > new Date();
  });

  useEffect(() => {
    if (!upcomingSale) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(upcomingSale.start_date).getTime();
      const diff = target - now;

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [upcomingSale]);

  // Don't render if loading or no upcoming sale
  if (loading || !upcomingSale) return null;

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden relative">
        {/* Gradient background */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-6 sm:px-12 py-12 sm:py-16">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-6 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-6 left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <Zap size={14} className="fill-white" />
              Upcoming Sale
            </div>

            {/* Sale title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
              {upcomingSale.title || 'Mega Sale'}
            </h2>

            {/* Discount */}
            {upcomingSale.discount_percentage && (
              <p className="text-5xl sm:text-6xl font-extrabold text-white/90 mb-6">
                {upcomingSale.discount_percentage}% OFF
              </p>
            )}

            {/* Countdown label */}
            <div className="flex items-center justify-center gap-2 text-white/80 text-sm mb-6">
              <Clock size={16} />
              <span>Sale starts in</span>
            </div>

            {/* Countdown timer */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8">
              {timeUnits.map((unit) => (
                <div
                  key={unit.label}
                  className="glass rounded-2xl px-4 sm:px-6 py-3 sm:py-4 min-w-[70px] sm:min-w-[85px] animate-pulse-glow"
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tabular-nums">
                    {String(unit.value).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider mt-1">
                    {unit.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA button */}
            <Link
              to="/sales"
              className="
                inline-flex items-center gap-2
                bg-white text-orange-600 font-semibold
                px-8 py-3.5 rounded-xl
                hover:bg-white/90 hover:shadow-lg hover:shadow-black/20
                transition-all duration-300 active:scale-[0.97]
                text-sm sm:text-base
              "
            >
              View All Sales
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
