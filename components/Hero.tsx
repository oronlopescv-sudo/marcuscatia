'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-[#F3F8FC] via-white to-[#F8FAFC] overflow-hidden py-10 lg:py-16">
      {/* Decorative top watercolor brush texture / splash */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-mindelo-dark via-mindelo-blue to-mindelo-dark opacity-90"></div>
      
      {/* Soft atmospheric blue watercolor background blobs */}
      <div className="absolute top-12 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-0"></div>
      <div className="absolute top-20 right-10 w-80 h-80 bg-sky-100/60 rounded-full blur-3xl pointer-events-none -z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Circular Painterly Blue Brush Ring with Catia Cooking */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-6 flex justify-center lg:justify-start"
          >
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] flex items-center justify-center">
              
              {/* Outer Painterly Brush Stroke Circle (SVG) */}
              <svg 
                className="absolute inset-0 w-full h-full text-mindelo-blue pointer-events-none drop-shadow-md"
                viewBox="0 0 400 400" 
                fill="none"
              >
                {/* Thick brush ring layer 1 */}
                <circle 
                  cx="200" 
                  cy="200" 
                  r="185" 
                  stroke="currentColor" 
                  strokeWidth="14" 
                  strokeLinecap="round"
                  strokeDasharray="40 10 90 15 130 10 80 20"
                  className="opacity-95"
                />
                {/* Layer 2 with slight offset for dynamic textured paint feel */}
                <circle 
                  cx="200" 
                  cy="200" 
                  r="192" 
                  stroke="currentColor" 
                  strokeWidth="6" 
                  strokeLinecap="round"
                  strokeDasharray="120 25 70 15 100 30"
                  className="opacity-75"
                />
                {/* Inner edge texture */}
                <circle 
                  cx="200" 
                  cy="200" 
                  r="178" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  strokeDasharray="60 40 150 20"
                  className="opacity-60"
                />
              </svg>

              {/* Masked Photo of Catia Cooking with Mindelo bay */}
              <div className="relative w-[78%] h-[78%] rounded-full overflow-hidden shadow-inner border-4 border-white bg-white">
                <Image 
                  src="/catia-cooking.jpg" 
                  alt="Cátia cooking in the Bay of Mindelo, Cape Verde" 
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  priority
                />
              </div>

              {/* Floating Cape Verde mini seal badge on bottom right of the circle */}
              <div className="absolute -bottom-2 right-4 sm:right-6 bg-white rounded-full p-1.5 shadow-lg border-2 border-mindelo-blue flex items-center gap-1.5 z-20">
                <div className="w-8 h-8 rounded-full overflow-hidden relative">
                  <Image 
                    src="/logo.png" 
                    alt="Official Logo" 
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[11px] font-bold text-mindelo-dark pr-2 font-serif">
                  Mindelo, CV
                </span>
              </div>
            </div>
          </motion.div>
          
          {/* Right Column: High-Impact Typography matching the requested design */}
          <motion.div 
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-6 text-center lg:text-left flex flex-col items-center lg:items-start"
          >
            {/* Main Headline - Bold Serif Uppercase */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[44px] xl:text-[50px] font-serif font-black text-mindelo-dark leading-[1.12] tracking-tight mb-3">
              TRADITION, FLAVOR <br className="hidden sm:inline" />
              AND MINDELO <br />
              ON YOUR PLATE
            </h1>
            
            {/* Painted Red Accent Bar (from the design) */}
            <div className="w-20 h-1.5 bg-mindelo-red rounded-full mb-6"></div>
            
            {/* Subtitle description */}
            <p className="text-base sm:text-lg text-gray-700 mb-8 max-w-xl leading-relaxed font-sans">
              <span className="font-semibold text-mindelo-blue block mb-1">Where flavor meets style</span>
              Market tour to Mindelo&apos;s main municipal and fish market, traditional local transport to our home in Fonte Francês, and a hands-on cooking class in an authentic and warm Cape Verdean setting.
            </p>
            
            {/* Interactive Row: CTA Button + Official Mini Logo Seal */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link 
                href="/cursos" 
                className="inline-flex items-center justify-center gap-3 bg-[#0A3D78] hover:bg-mindelo-blue text-white px-8 py-3.5 rounded-full font-bold text-base uppercase tracking-wider transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <span>View Classes & Recipes</span>
                <ArrowRight size={18} />
              </Link>
              
              {/* Circular Logo Badge with matching painted frame */}
              <Link 
                href="/sobre" 
                className="group flex items-center gap-3 bg-white/90 backdrop-blur-xs py-1.5 px-3 rounded-full border border-blue-200 shadow-xs hover:border-mindelo-blue transition-all"
                title="Discover Cátia's story"
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-mindelo-blue group-hover:scale-105 transition-transform bg-white">
                  <Image 
                    src="/logo.png" 
                    alt="Catia Cooking Mindelo Official Seal" 
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-serif font-bold text-mindelo-dark group-hover:text-mindelo-blue transition-colors">
                    Cátia Sofia
                  </span>
                  <span className="block text-[11px] text-gray-500">
                    The Mindelo Chef →
                  </span>
                </div>
              </Link>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
