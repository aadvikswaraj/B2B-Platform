'use client';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

// Import Swiper styles (basic + pagination)
import 'swiper/css';
import 'swiper/css/pagination';
import Image from 'next/image';
import Link from 'next/link';

/**
 * ImageSlider
 * A reusable hero/banner slider with optional overlay captions and links.
 * Props:
 *  - images: Array<{ src: string; alt?: string; title?: string; subtitle?: string; ctaLabel?: string; ctaHref?: string; }>
 *  - height: tailwind height class or custom style (default h-[420px])
 */
const DEFAULT_IMAGES = [
  { src: 'https://cdn.d4tcdn.com/staticdt/images/home-banner/sell-on-d4t.jpg', alt: 'Sell on Platform', title: 'Scale Your Global Reach', subtitle: 'List products & reach verified buyers worldwide.', ctaLabel: 'Become a Seller', ctaHref: '/seller' },
  { src: 'https://cdn.d4tcdn.com/staticdt/images/home-banner/site-manager.jpg', alt: 'Manage Everything', title: 'Unified Sourcing Workspace', subtitle: 'Quotes, messages & analytics integrated.', ctaLabel: 'Explore Features', ctaHref: '#features' },
  { src: 'https://cdn.d4tcdn.com/staticdt/images/home-banner/india-sme-100-awards.jpg', alt: 'Award Winning', title: 'Trusted B2B Network', subtitle: 'Join thousands of SMEs accelerating trade.', ctaLabel: 'Get Started', ctaHref: '/signup' }
];

export default function ImageSlider({ images = DEFAULT_IMAGES, height = 'h-[420px]' }) {
  return (
    <div className={`relative w-full ${height}`}>
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        loop
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className='w-full h-full'
      >
        {images.map((img, i) => (
          <SwiperSlide key={i} className='relative'>
            <div className='absolute inset-0'>
              <Image src={img.src} alt={img.alt || img.title || `Slide ${i+1}`} fill priority={i===0} className='object-cover' />
              <div className='absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-black/10' />
            </div>
            {(img.title || img.subtitle) && (
              <div className='relative z-10 h-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-white'>
                {img.title && <h2 className='text-2xl sm:text-4xl font-semibold tracking-tight max-w-xl'>{img.title}</h2>}
                {img.subtitle && <p className='mt-3 text-sm sm:text-base max-w-lg text-white/80'>{img.subtitle}</p>}
                {img.ctaLabel && img.ctaHref && (
                  <div className='mt-6'>
                    <Link href={img.ctaHref} className='inline-flex items-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium shadow hover:bg-indigo-500 transition'>
                      {img.ctaLabel}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}