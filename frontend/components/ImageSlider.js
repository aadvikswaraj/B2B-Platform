'use client';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import Image from 'next/image';

const ImageSlider = () => {
  return (
    <Swiper
      spaceBetween={50}
      slidesPerView={1}
      onSlideChange={() => console.log('slide change')}
      onSwiper={(swiper) => console.log(swiper)}
      className='w-7xl'
    >
      <SwiperSlide><Image width={1500} height={500} src="https://cdn.d4tcdn.com/staticdt/images/home-banner/sell-on-d4t.jpg" alt='Slider 1'/></SwiperSlide>
      <SwiperSlide><Image width={1500} height={500} src="https://cdn.d4tcdn.com/staticdt/images/home-banner/site-manager.jpg" alt='Slider 2'/></SwiperSlide>
      <SwiperSlide><Image width={1500} height={500} src="https://cdn.d4tcdn.com/staticdt/images/home-banner/india-sme-100-awards.jpg" alt='Slider 3'/></SwiperSlide>
    </Swiper>
  );
};

export default ImageSlider;