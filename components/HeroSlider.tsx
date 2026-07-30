"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";

const slides = [
  { 
    id: 1, 
    image: "https://i.pinimg.com/1200x/b9/54/30/b954305212dc819ade776bdc414c087c.jpg", 
    link: "/products" 
  },
  { 
    id: 2, 
    image: "https://i.pinimg.com/736x/90/22/9f/90229f568fcf8e658143ba83a8667895.jpg", 
    link: "/products" 
  },
  { 
    id: 3, 
    image: "https://i.pinimg.com/1200x/22/ab/ac/22abacd68fb2fa5cc13417df54d483de.jpg", 
    link: "/products" 
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent(current === 0 ? slides.length - 1 : current - 1);
  };

  const nextSlide = useCallback(() => {
    setCurrent(current === slides.length - 1 ? 0 : current + 1);
  }, [current]);

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000); 
    return () => clearInterval(slideInterval);
  }, [nextSlide]);

  return (
    <div className="w-full bg-(--background) pt-6 pb-2">
      <div className="container mx-auto px-4">
        {/* Aspect ratio container matching exactly 1400x467 with canonical classes */}
        <div className="relative w-full max-w-350 mx-auto aspect-1400/467 rounded-3xl overflow-hidden group shadow-sm border border-(--border)">
          
          <div 
            className="flex transition-transform duration-700 ease-out h-full"
            style={{ transform: `translateX(${current * 100}%)` }}
          >
            {slides.map((slide) => (
              <Link 
                href={slide.link} 
                key={slide.id} 
                className="w-full h-full shrink-0 relative block"
              >
                <img 
                  src={slide.image} 
                  alt={`Banner ${slide.id}`} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/5 hover:bg-black/0 transition-colors cursor-pointer" />
              </Link>
            ))}
          </div>

          <button 
            onClick={prevSlide}
            className="absolute top-1/2 right-4 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/80 hover:bg-white text-[var(--foreground)] rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all z-10"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute top-1/2 left-4 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/80 hover:bg-white text-[var(--foreground)] rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all z-10"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`transition-all duration-300 rounded-full shadow-sm ${
                  current === idx 
                    ? "w-8 h-2.5 bg-[var(--primary)]" 
                    : "w-2.5 h-2.5 bg-white/70 hover:bg-white"
                }`}
              />
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
}