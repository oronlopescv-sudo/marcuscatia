'use client';

import Image from 'next/image';

interface WatermarkProps {
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left' | 'center';
  opacity?: number;
  size?: 'small' | 'medium' | 'large';
}

export function Watermark({ 
  position = 'bottom-right', 
  opacity = 0.15,
  size = 'medium'
}: WatermarkProps) {
  const sizeMap = {
    small: 'w-14 h-14 sm:w-24 sm:h-24',
    medium: 'w-20 h-20 sm:w-40 sm:h-40',
    large: 'w-28 h-28 sm:w-56 sm:h-56'
  };

  // Bottom-right gets extra clearance on mobile so it doesn't collide with
  // the fixed WhatsApp button (which sits at bottom-6 right-6, ~56px).
  const positionMap = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-20 right-4 sm:bottom-4',
    'bottom-left': 'bottom-4 left-4',
    'top-left': 'top-4 left-4',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  };

  return (
    <div 
      className={`fixed ${positionMap[position]} pointer-events-none z-0`}
      style={{ opacity }}
    >
      <div className={`relative ${sizeMap[size]}`}>
        <Image
          src="/logo.png"
          alt="Catia Cooking Mindelo Watermark"
          fill
          className="object-contain"
          priority={false}
        />
      </div>
    </div>
  );
}

export function TextWatermark({
  position = 'bottom-right',
  opacity = 0.1
}: Omit<WatermarkProps, 'size'>) {
  const positionMap = {
    'top-right': 'top-6 right-6',
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-left': 'top-6 left-6',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  };

  return (
    <div 
      className={`fixed ${positionMap[position]} pointer-events-none z-0`}
      style={{ opacity }}
    >
      <div className="text-center space-y-1">
        <p className="font-serif text-2xl font-bold text-mindelo-dark tracking-wider">
          Catia Cooking
        </p>
        <p className="text-xs text-mindelo-blue uppercase tracking-widest">
          Mindelo
        </p>
      </div>
    </div>
  );
}
