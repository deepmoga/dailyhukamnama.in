'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Volume2, Sparkles } from 'lucide-react';

export default function Slider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      image: '/slider1.jpg',
      title: 'SACHKHAND SRI HARMANDIR SAHIB',
      subtitle: 'ਸੱਚਖੰਡ ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ, ਅੰਮ੍ਰਿਤਸਰ',
      description: 'The Golden Temple shines brilliantly, welcoming millions with divine peace and spiritual enlightenment.',
    },
    {
      image: '/slider2.jpg',
      title: 'DAILY MUKHWAK & GURBANI KIRTAN',
      subtitle: 'ਧੁਰ ਕੀ ਬਾਣੀ ਆਈ ॥ ਤਿਨਿ ਸਗਲੀ ਚਿੰਤ ਮਿਟਾਈ ॥',
      description: 'Receive the divine wisdom of the living Guru directly from Sri Darbar Sahib every day.',
    },
  ];

  // Auto-play interval
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <section 
      className="relative w-full h-[320px] sm:h-[420px] md:h-[500px] lg:h-[560px] overflow-hidden bg-slate-950 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* Background Image */}
          <div className="relative w-full h-full">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={idx === 0}
              className="object-cover object-center transform scale-105 transition-transform duration-10000 group-hover:scale-100"
            />
            {/* Spiritual dark vignette / golden gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/45 to-slate-950/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-slate-950/70" />
          </div>

          {/* Banner Content */}
          <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-4 sm:px-8">
            <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
              <div className="inline-flex items-center space-x-2 bg-gold-500/20 backdrop-blur-md border border-gold-400/40 px-3.5 py-1 rounded-full text-gold-300 text-xs sm:text-sm font-medium">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>Sri Darbar Sahib, Amritsar</span>
              </div>

              <h2 className="text-xl sm:text-3xl md:text-5xl font-bold text-white font-serif-heading tracking-wide drop-shadow-md">
                {slide.title}
              </h2>

              <p className="text-sm sm:text-lg md:text-xl font-gurmukhi text-gold-200 tracking-wider drop-shadow">
                {slide.subtitle}
              </p>

              <p className="hidden sm:block text-xs sm:text-sm md:text-base text-slate-200/90 max-w-xl mx-auto drop-shadow font-light">
                {slide.description}
              </p>

              <div className="pt-2 sm:pt-4 flex items-center justify-center space-x-3">
                <a
                  href="#hukamnama-view"
                  className="bg-gold-500 hover:bg-gold-600 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-lg hover:shadow-gold-500/30 transition duration-300 transform hover:-translate-y-0.5"
                >
                  View Today&apos;s Hukamnama
                </a>
                <a
                  href="#calendar"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 font-medium text-xs sm:text-sm px-5 py-2.5 rounded-full transition duration-300"
                >
                  Monthly Calendar
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Prev / Next Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-gold-500 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all opacity-80 hover:opacity-100 hover:scale-105"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-gold-500 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all opacity-80 hover:opacity-100 hover:scale-105"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Slide Indicators / Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'w-8 bg-gold-500'
                : 'w-2.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
