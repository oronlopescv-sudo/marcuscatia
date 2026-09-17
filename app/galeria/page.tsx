'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, ZoomIn, ArrowRight, Utensils, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GalleryItem {
  src: string;
  title: string;
  category: string;
}

const galleryItems: GalleryItem[] = [
  {
    src: 'https://static.wixstatic.com/media/f4fd80_ec9272a13451476a845b928470b355eb~mv2.jpg',
    title: 'Hands-on cooking class with Cátia and enthusiastic students',
    category: 'Hands-On Class'
  },
  {
    src: 'https://static.wixstatic.com/media/f4fd80_4ae355554a644923a2290e145fe89000~mv2.jpg',
    title: 'Traditional Cape Verdean dish plated with style and care',
    category: 'Tasting'
  },
  {
    src: 'https://static.wixstatic.com/media/f4fd80_2b55881c018d431e93f168054ac1a22a~mv2.jpg',
    title: 'Guided tour of the Mindelo Municipal Market and Fish Market',
    category: 'Market Tour'
  },
  {
    src: 'https://static.wixstatic.com/media/f4fd80_d539e27b44eb44299b751dfa7af7219d~mv2.jpg',
    title: 'Selecting authentic island spices, hominy, and fresh ingredients',
    category: 'Ingredients'
  },
  {
    src: 'https://static.wixstatic.com/media/f4fd80_eff5a4e083fe40478fb642ec935dfd8c~mv2.jpg',
    title: 'Traditional Cachupa Rica simmering gently on the stove',
    category: 'Kitchen'
  },
  {
    src: 'https://static.wixstatic.com/media/f4fd80_df722da0f9d64552824877d9974b8511~mv2.jpg',
    title: 'Crispy pastry and savory spiced filling of Tuna Pastels',
    category: 'Pastries'
  },
  {
    src: 'https://static.wixstatic.com/media/f4fd80_df372cb7dc234c4b876dbbfda91d0f56~mv2.jpg',
    title: 'Warm, welcoming home kitchen environment in Fonte Francês',
    category: 'Ambiance'
  },
  {
    src: 'https://static.wixstatic.com/media/f4fd80_e7fc2953b4884fd3a51eb8db30d3516b~mv2.jpg',
    title: 'Moments of joy, laughter, and morabeza around the stove',
    category: 'Moments'
  },
  {
    src: 'https://static.wixstatic.com/media/f4fd80_5b31e58350534d69bcc87999a830c300~mv2.jpg',
    title: 'Authentic flavors and textures of the islands ready to savor',
    category: 'Tasting'
  },
];

export default function GaleriaPage() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const handlePrev = useCallback(() => {
    if (activeIdx === null) return;
    setActiveIdx((prev) => (prev! === 0 ? galleryItems.length - 1 : prev! - 1));
  }, [activeIdx]);

  const handleNext = useCallback(() => {
    if (activeIdx === null) return;
    setActiveIdx((prev) => (prev! === galleryItems.length - 1 ? 0 : prev! + 1));
  }, [activeIdx]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (activeIdx === null) return;
      if (e.key === 'Escape') setActiveIdx(null);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIdx, handlePrev, handleNext]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        {/* Header */}
        <div className="bg-mindelo-dark py-16 text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Photo Gallery
            </h1>
            <p className="text-lg text-gray-300">
              Take a peek at our previous classes and experience the joy of cooking together in Mindelo.
            </p>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {galleryItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 text-left focus:outline-none focus:ring-4 focus:ring-mindelo-blue/30"
                aria-label={`View enlarged photo: ${item.title}`}
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                  <span className="text-xs uppercase font-bold text-mindelo-gold tracking-wider mb-1">
                    {item.category}
                  </span>
                  <p className="text-sm font-semibold leading-snug">
                    {item.title}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-200">
                    <ZoomIn size={14} />
                    <span>Click to enlarge</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Bottom CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-[#0A3D78] via-[#0A2240] to-[#0A3D78] rounded-3xl p-8 sm:p-12 text-white text-center sm:text-left shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-mindelo-gold text-xs uppercase font-bold tracking-widest block">
                Join Our Table
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black">
                Would you like to experience these moments in Cátia&apos;s kitchen?
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Classes are limited to 8 people to ensure personalized guidance and an authentic, unforgettable experience.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/cursos"
                className="inline-flex items-center justify-center gap-2 bg-mindelo-red hover:bg-red-700 text-white px-7 py-3.5 rounded-full font-bold text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Utensils size={16} />
                <span>Book a Class</span>
              </Link>
              <a
                href="https://wa.me/2385953973?text=Hello%20C%C3%A1tia!%20I%20saw%20the%20photos%20in%20your%20gallery%20and%20would%20love%20to%20book%20a%20class%20for%20our%20group."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3.5 rounded-full font-bold text-sm transition-all"
              >
                <MessageCircle size={16} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Lightbox Modal */}
      <AnimatePresence>
        {activeIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActiveIdx(null)}
          >
            {/* Top Toolbar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-20">
              <span className="text-xs uppercase tracking-wider font-semibold text-gray-300">
                {activeIdx + 1} of {galleryItems.length} · {galleryItems[activeIdx].category}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIdx(null);
                }}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Close gallery"
              >
                <X size={22} />
              </button>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors z-20"
              aria-label="Previous photo"
            >
              <ChevronLeft size={28} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors z-20"
              aria-label="Next photo"
            >
              <ChevronRight size={28} />
            </button>

            {/* Main Modal Image Container */}
            <div 
              className="relative max-w-4xl w-full max-h-[80vh] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={galleryItems[activeIdx].src}
                alt={galleryItems[activeIdx].title}
                fill
                className="object-contain sm:object-cover"
                referrerPolicy="no-referrer"
                priority
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                <p className="font-serif font-bold text-lg">
                  {galleryItems[activeIdx].title}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
