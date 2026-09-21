'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-[#F3F8FC] via-white to-[#F8FAFC] overflow-hidden py-8 sm:py-12 lg:py-16">
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-mindelo-dark via-mindelo-blue to-mindelo-dark opacity-90"></div>
      
      {/* Background decorative blobs */}
      <div className="absolute top-12 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-0"></div>
      <div className="absolute top-20 right-10 w-80 h-80 bg-sky-100/60 rounded-full blur-3xl pointer-events-none -z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center">
          
          {/* Left Column: Professional Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-6 flex justify-center lg:justify-start -mt-4 sm:mt-0"
          >
            <div className="relative w-48 sm:w-72 md:w-96 lg:w-[420px]">
              <Image
                src="/logo.png"
                alt="Catia Cooking Mindelo - Flavors of Cape Verde"
                width={420}
                height={420}
                className="w-full h-auto drop-shadow-2xl"
                priority
              />
            </div>
          </motion.div>
          
          {/* Right Column: Typography and CTAs */}
          <motion.div 
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-6 text-center lg:text-left flex flex-col items-center lg:items-start"
          >
            {/* Main Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-[44px] xl:text-[50px] font-serif font-black text-mindelo-dark leading-[1.12] tracking-tight mb-4 sm:mb-6">
              Tradition, Flavor and Mindelo
              <span className="block text-mindelo-blue">On Your Plate</span>
            </h1>

            {/* Decorative line */}
            <div className="w-12 h-1 bg-mindelo-red rounded-full mb-4 sm:mb-6"></div>

            {/* Tagline */}
            <p className="text-base sm:text-lg md:text-xl text-mindelo-blue font-semibold mb-4 sm:mb-6">
              Where flavor meets style
            </p>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mb-3 sm:mb-4 max-w-lg">
              Join Cátia for an authentic culinary journey through the heart of Mindelo. From the vibrant local markets to our kitchen overlooking the Atlantic, discover the true essence of Cape Verdean cuisine.
            </p>

            {/* Secondary Description */}
            <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed mb-8 sm:mb-10 max-w-lg">
              Every class is more than just cooking — it&apos;s a celebration of culture, tradition, and the passion that goes into every dish.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center lg:justify-start">
              <Link
                href="/courses"
                className="group inline-flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 py-3.5 sm:py-3 md:py-4 bg-mindelo-blue hover:bg-mindelo-dark text-white font-bold text-base sm:text-sm md:text-base rounded-lg sm:rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Explore Classes
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://wa.me/2385953973"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 py-3.5 sm:py-3 md:py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-base sm:text-sm md:text-base rounded-lg sm:rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                💬 Contact Cátia
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row gap-6 mt-12 pt-8 border-t border-gray-200">
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-mindelo-dark">7+</div>
                <p className="text-xs md:text-sm text-gray-600">Authentic Classes</p>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-mindelo-dark">500+</div>
                <p className="text-xs md:text-sm text-gray-600">Happy Students</p>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-mindelo-dark">Mindelo</div>
                <p className="text-xs md:text-sm text-gray-600">Fonte Francês, CV</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
