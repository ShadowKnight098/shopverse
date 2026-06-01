/**
 * Application-wide constants for ShopVerse
 */

/** Product categories with icons matching lucide-react icon names */
export const CATEGORIES = [
  { id: 1, name: 'Electronics', icon: 'Smartphone', slug: 'electronics' },
  { id: 2, name: 'Fashion', icon: 'Shirt', slug: 'fashion' },
  { id: 3, name: 'Home & Living', icon: 'Sofa', slug: 'home-living' },
  { id: 4, name: 'Sports', icon: 'Dumbbell', slug: 'sports' },
  { id: 5, name: 'Books', icon: 'BookOpen', slug: 'books' },
  { id: 6, name: 'Beauty', icon: 'Sparkles', slug: 'beauty' },
  { id: 7, name: 'Toys', icon: 'Gamepad2', slug: 'toys' },
  { id: 8, name: 'Groceries', icon: 'ShoppingBasket', slug: 'groceries' },
]

/** Possible order statuses */
export const ORDER_STATUSES = [
  'Pending Payment',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
]

/** Main navigation links */
export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/products' },
  { name: 'Sales', path: '/sales' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
]

/** WhatsApp business number for order placement */
export const WHATSAPP_NUMBER =
  import.meta.env.VITE_WHATSAPP_NUMBER || '919999999999'

/** Hero carousel slides for the homepage */
export const HERO_SLIDES = [
  {
    id: 1,
    title: 'Discover the Latest in Tech',
    subtitle:
      'Explore cutting-edge electronics, smart gadgets, and premium accessories at unbeatable prices.',
    cta: 'Shop Electronics',
    ctaLink: '/products?category=electronics',
    image: '/images/hero/headphones.png',
  },
  {
    id: 2,
    title: 'Refresh Your Wearables',
    subtitle:
      'Trending styles, timeless classics, and exclusive collections curated just for you.',
    cta: 'Explore Watches',
    ctaLink: '/products?category=fashion',
    image: '/images/hero/smartwatch.png',
  },
  {
    id: 3,
    title: 'Mega Tech Sale — Up to 70% Off',
    subtitle:
      'Limited-time deals on thousands of products across every category. Don\'t miss out!',
    cta: 'View Deals',
    ctaLink: '/sales',
    image: '/images/hero/keyboard.png',
  },
]

/** Customer testimonials for social proof */
export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Verified Buyer',
    avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    comment:
      'Absolutely love the quality of products on ShopVerse! Ordered a wireless headphone and it arrived within two days. Sound quality is incredible and the packaging was premium. Will definitely order again!',
  },
  {
    id: 2,
    name: 'Rahul Mehta',
    role: 'Regular Customer',
    avatar: 'https://i.pravatar.cc/150?img=3',
    rating: 5,
    comment:
      'I\'ve been shopping here for months and have never been disappointed. The fashion collection is always up to date, and the prices are very competitive compared to other platforms. Customer support is also very responsive.',
  },
  {
    id: 3,
    name: 'Ananya Patel',
    role: 'Verified Buyer',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 4,
    comment:
      'Great selection of home decor items. I furnished my entire living room with products from ShopVerse. The only reason I\'m giving 4 stars is that one item took a bit longer to deliver, but the quality made up for it.',
  },
  {
    id: 4,
    name: 'Vikram Singh',
    role: 'Tech Enthusiast',
    avatar: 'https://i.pravatar.cc/150?img=8',
    rating: 5,
    comment:
      'Best place to buy electronics online. I got my gaming laptop from here at the lowest price I could find anywhere. The WhatsApp ordering system is brilliant — so convenient and personal!',
  },
  {
    id: 5,
    name: 'Meera Joshi',
    role: 'Fitness Enthusiast',
    avatar: 'https://i.pravatar.cc/150?img=9',
    rating: 4,
    comment:
      'Ordered sports equipment and fitness gear. Everything was exactly as described. The yoga mat quality is superb and the dumbbells are well-built. Shipping was fast and the tracking updates kept me informed throughout.',
  },
]

/** Team members for the About page */
export const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Arjun Kapoor',
    role: 'Founder & CEO',
    image: 'https://i.pravatar.cc/300?img=11',
    social: {
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
      github: 'https://github.com',
    },
  },
  {
    id: 2,
    name: 'Sneha Reddy',
    role: 'Head of Design',
    image: 'https://i.pravatar.cc/300?img=16',
    social: {
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
      dribbble: 'https://dribbble.com',
    },
  },
  {
    id: 3,
    name: 'Karthik Nair',
    role: 'CTO',
    image: 'https://i.pravatar.cc/300?img=12',
    social: {
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
      github: 'https://github.com',
    },
  },
  {
    id: 4,
    name: 'Divya Menon',
    role: 'Marketing Director',
    image: 'https://i.pravatar.cc/300?img=20',
    social: {
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
    },
  },
]
