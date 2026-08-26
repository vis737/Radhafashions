import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const CAROUSEL_IMAGES = [
  {
    id: 'c1',
    url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=900&h=600&fit=crop',
    alt: 'Silk Sarees Collection',
    label: 'Silk Sarees',
  },
  {
    id: 'c2',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&h=600&fit=crop',
    alt: 'Bridal Lehengas',
    label: 'Bridal Lehengas',
  },
  {
    id: 'c3',
    url: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=900&h=600&fit=crop',
    alt: 'Designer Kurtis',
    label: 'Designer Kurtis',
  },
  {
    id: 'c4',
    url: 'https://images.unsplash.com/photo-1594938298603-a8d9d09c7d7e?w=900&h=600&fit=crop',
    alt: 'Salwar Suits',
    label: 'Salwar Suits',
  },
  {
    id: 'c5',
    url: 'https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?w=900&h=600&fit=crop',
    alt: 'Dupattas & Stoles',
    label: 'Dupattas & Stoles',
  },
  {
    id: 'c6',
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&h=600&fit=crop',
    alt: 'Ethnic Jewellery',
    label: 'Ethnic Jewellery',
  },
  {
    id: 'c7',
    url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900&h=600&fit=crop',
    alt: 'Potli & Clutch Bags',
    label: 'Ethnic Bags',
  },
  {
    id: 'c8',
    url: 'https://images.unsplash.com/photo-1617119038459-4f6e9de4c21e?w=900&h=600&fit=crop',
    alt: 'Nightwear Collection',
    label: 'Nightwear',
  },
];

const SLIDE_INTERVAL = 3500; // 3.5 seconds per slide

export default function InstagramGallery() {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  const totalSlides = CAROUSEL_IMAGES.length;

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  // Auto-play
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(nextSlide, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [isPlaying, nextSlide]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
    }),
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12 font-sans">
      {/* Section Header */}
      <div className="text-center mb-6">
        <span className="text-[10px] font-mono text-pink-500 uppercase tracking-widest font-black block">
          Our Collections
        </span>
        <h3 className="font-display font-black text-gray-800 dark:text-white text-lg uppercase tracking-wider mt-1">
          Featured Products
        </h3>
        <div className="w-10 h-0.5 bg-[#D4648A] mt-2 rounded mx-auto"></div>
      </div>

      {/* Carousel Container */}
      <div className="relative rounded-3xl overflow-hidden bg-gray-900 dark:bg-black border border-gray-200 dark:border-gray-800 shadow-xl group">
        {/* Main Image */}
        <div className="relative aspect-[16/7] sm:aspect-[16/6] overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0"
            >
              <img
                src={CAROUSEL_IMAGES[current].url}
                alt={CAROUSEL_IMAGES[current].alt}
                className="w-full h-full object-cover"
                draggable={false}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              {/* Label */}
              <div className="absolute bottom-4 left-6 sm:bottom-6 sm:left-8">
                <span className="text-white text-xl sm:text-3xl font-display font-black tracking-wide drop-shadow-lg">
                  {CAROUSEL_IMAGES[current].label}
                </span>
                <div className="w-12 h-0.5 bg-[#D4648A] mt-2 rounded" />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#D4648A] cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#D4648A] cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#D4648A] cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Thumbnail Strip */}
        <div className="flex gap-2 p-3 bg-black/80 overflow-x-auto scrollbar-none">
          {CAROUSEL_IMAGES.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => goToSlide(idx)}
              className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                idx === current
                  ? 'border-[#D4648A] scale-105 shadow-lg shadow-pink-500/30'
                  : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/30'
              }`}
            >
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
