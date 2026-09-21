'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowRight, Mail, Soup } from 'lucide-react';

export function BrandFeatureCards() {
  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Background subtle coastal watercolor glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-50/60 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Brand Ribbon Divider (from the design) */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-[#0A3D78] tracking-tight block">
            catiacookingmindelo
          </span>
        </div>

        {/* 3 Pillar Cards with Painterly Blue Rings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">

          {/* Card 1: RECIPES & CLASSES */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group flex flex-col items-center text-center p-5 sm:p-6 md:p-8 rounded-2xl bg-gradient-to-b from-blue-50/40 to-white border border-blue-100/80 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Circular Blue Brush Ring with Soup/Cooking Icon */}
            <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full text-mindelo-blue" viewBox="0 0 100 100" fill="none">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="44" 
                  stroke="currentColor" 
                  strokeWidth="5" 
                  strokeLinecap="round"
                  strokeDasharray="15 6 35 8 40 10"
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="41" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeDasharray="40 15 20 10"
                  className="opacity-70"
                />
              </svg>
              <div className="w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center text-mindelo-blue group-hover:scale-110 transition-transform">
                <Soup size={32} strokeWidth={1.75} />
              </div>
            </div>

            <h3 className="font-serif font-black text-xl text-mindelo-dark uppercase tracking-wider mb-3 group-hover:text-mindelo-blue transition-colors">
              Classes & Recipes
            </h3>

            <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">
              Discover traditional Cape Verdean recipes, from rich Cachupa Rica to crispy Tuna Pastels, prepared with passion and fresh market ingredients.
            </p>

            <Link 
              href="/courses"
              className="inline-flex items-center gap-1.5 font-bold text-sm text-[#0A3D78] group-hover:text-mindelo-red transition-colors"
            >
              <span>Explore</span>
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Card 2: ABOUT CÁTIA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-blue-50/40 to-white border border-blue-100/80 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Circular Blue Brush Ring with Photo of Catia */}
            <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full text-mindelo-blue" viewBox="0 0 100 100" fill="none">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="44" 
                  stroke="currentColor" 
                  strokeWidth="5" 
                  strokeLinecap="round"
                  strokeDasharray="25 8 45 10 30 6"
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="41" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeDasharray="30 10 50 15"
                  className="opacity-70"
                />
              </svg>
              <div className="relative w-18 h-18 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:scale-105 transition-transform">
                <Image 
                  src="/catia-cooking.jpg" 
                  alt="Cátia Sofia de Andrade" 
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <h3 className="font-serif font-black text-xl text-mindelo-dark uppercase tracking-wider mb-3 group-hover:text-mindelo-blue transition-colors">
              About Cátia
            </h3>

            <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">
              Where flavor meets style. Meet Cátia and explore a warm space dedicated to passing on rich culinary wisdom and cherished island recipes.
            </p>

            <Link 
              href="/about"
              className="inline-flex items-center gap-1.5 font-bold text-sm text-[#0A3D78] group-hover:text-mindelo-red transition-colors"
            >
              <span>Explore</span>
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Card 3: CONTACT & INQUIRIES */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-blue-50/40 to-white border border-blue-100/80 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Circular Blue Brush Ring with Envelope and Heart Icon */}
            <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full text-mindelo-blue" viewBox="0 0 100 100" fill="none">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="44" 
                  stroke="currentColor" 
                  strokeWidth="5" 
                  strokeLinecap="round"
                  strokeDasharray="20 10 50 12 25 8"
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="41" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeDasharray="45 15 25 8"
                  className="opacity-70"
                />
              </svg>
              <div className="w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center text-mindelo-blue relative group-hover:scale-110 transition-transform">
                <Mail size={30} strokeWidth={1.75} />
                <span className="absolute text-mindelo-red text-xs">❤️</span>
              </div>
            </div>

            <h3 className="font-serif font-black text-xl text-mindelo-dark uppercase tracking-wider mb-3 group-hover:text-mindelo-blue transition-colors">
              Contact
            </h3>

            <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">
              Let&apos;s talk! Questions, private group bookings, or special requests. We would be delighted to answer and welcome you to our kitchen.
            </p>

            <Link 
              href="/contact"
              className="inline-flex items-center gap-1.5 font-bold text-sm text-[#0A3D78] group-hover:text-mindelo-red transition-colors"
            >
              <span>Explore</span>
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
