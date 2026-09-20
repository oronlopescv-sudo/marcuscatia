'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Show splash screen for 2-3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-mindelo-blue via-white to-mindelo-gold opacity-10" />

      {/* Logo container */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6">
        {/* Animated logo */}
        <div className="relative w-48 h-48 md:w-64 md:h-64 animate-fade-in-scale">
          <Image
            src="/logo.png"
            alt="Cátia Cooking Mindelo"
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Loading text */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-mindelo-dark text-center">
            Cátia Cooking Mindelo
          </h1>

          {/* Animated dots */}
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-600">Loading</p>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-mindelo-blue rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="w-2 h-2 bg-mindelo-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 bg-mindelo-blue rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-sm text-gray-500 font-medium text-center">
          Flavors of Cape Verde on Your Plate
        </p>
      </div>

      {/* Bottom decorative waves */}
      <div className="absolute bottom-0 left-0 right-0 opacity-20">
        <svg viewBox="0 0 1200 120" className="w-full h-auto">
          <path
            d="M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z"
            fill="#0A3D78"
            className="animate-pulse"
          />
        </svg>
      </div>

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        :global(.animate-fade-in-scale) {
          animation: fadeInScale 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
