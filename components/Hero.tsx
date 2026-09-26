'use client';

import { useSiteInfo } from '@/lib/useSiteInfo';
import { whatsappLink } from '@/lib/siteInfo';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ChefHat, UtensilsCrossed, MessageCircle } from 'lucide-react';
import { RESTAURANT_DINNER } from '@/lib/restaurant';
import { useSiteContent } from '@/lib/useSiteContent';

export function Hero() {
  // Optional override from the admin Content Editor (Hero Section): Title =
  // headline, Description = tagline, Content = intro paragraph.
  const hero = useSiteContent('hero')?.[0];
  const { site_whatsapp, hero_image } = useSiteInfo();

  return (
    <section className="relative bg-gradient-to-b from-[#F3F8FC] via-white to-[#F8FAFC] overflow-hidden py-8 sm:py-12 lg:py-16">
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-mindelo-dark via-mindelo-blue to-mindelo-dark opacity-90"></div>
      
      {/* Background decorative blobs */}
      <div className="absolute top-12 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-0"></div>
      <div className="absolute top-20 right-10 w-80 h-80 bg-sky-100/60 rounded-full blur-3xl pointer-events-none -z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center">
          
          {/* Left Column: photo of Cátia (changeable in Admin → Settings) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-6 flex justify-center lg:justify-start"
          >
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-[440px]">
              <div className="relative w-full h-56 sm:h-80 lg:h-auto lg:aspect-[4/5] rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-gray-100">
                <Image
                  src={hero_image}
                  alt="Cátia Sofia de Andrade in her kitchen in Mindelo"
                  fill
                  priority
                  sizes="(min-width: 1024px) 440px, (min-width: 640px) 448px, 100vw"
                  className="object-cover object-[center_20%]"
                />
              </div>
              <div className="absolute -bottom-4 -right-2 sm:-right-4 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white p-1 shadow-xl">
                <Image src="/logo.png" alt="Catia Cooking Mindelo logo" width={96} height={96} className="w-full h-full rounded-full object-cover" />
              </div>
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
              {hero?.title ? (
                hero.title
              ) : (
                <>
                  Tradition, Flavor and Mindelo
                  <span className="block text-mindelo-blue">On Your Plate</span>
                </>
              )}
            </h1>

            {/* Decorative line */}
            <div className="w-12 h-1 bg-mindelo-red rounded-full mb-4 sm:mb-6"></div>

            {/* Tagline */}
            <p className="text-base sm:text-lg md:text-xl text-mindelo-blue font-semibold mb-5 sm:mb-6">
              {hero?.description || 'Where flavor meets style'}
            </p>

            {/* Booking choice: classes or the restaurant dinner */}
            <p className="text-sm font-bold uppercase tracking-wider text-mindelo-dark mb-3">What would you like to book?</p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-lg">
              <Link
                href="/courses"
                className="group flex flex-col items-center lg:items-start text-center lg:text-left gap-1.5 p-4 sm:p-5 rounded-2xl bg-mindelo-blue hover:bg-mindelo-dark text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <ChefHat size={30} className="shrink-0" />
                <span className="font-bold text-base sm:text-lg leading-tight">Cooking Classes</span>
                <span className="text-xs sm:text-sm text-blue-100 leading-snug">Hands-on class with Cátia</span>
              </Link>
              <Link
                href={`/courses/${RESTAURANT_DINNER.id}`}
                className="group flex flex-col items-center lg:items-start text-center lg:text-left gap-1.5 p-4 sm:p-5 rounded-2xl bg-mindelo-red hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <UtensilsCrossed size={30} className="shrink-0" />
                <span className="font-bold text-base sm:text-lg leading-tight">Restaurant</span>
                <span className="text-xs sm:text-sm text-red-100 leading-snug">3-course dinner · €{RESTAURANT_DINNER.priceNumber}/person</span>
              </Link>
            </div>
            <a
              href={whatsappLink(site_whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 py-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <MessageCircle size={16} /> Questions? Chat with Cátia on WhatsApp
            </a>

            {/* Description (hidden on phones so the booking buttons are visible right away) */}
            <p className="hidden sm:block text-sm sm:text-base text-gray-700 leading-relaxed mt-6 mb-2 max-w-lg">
              {hero?.body || 'Join Cátia for an authentic culinary journey through the heart of Mindelo. From the vibrant local markets to our kitchen overlooking the Atlantic, discover the true essence of Cape Verdean cuisine.'}
            </p>

            {/* Secondary Description */}
            <p className="hidden sm:block text-xs sm:text-sm text-gray-600 leading-relaxed max-w-lg">
              Every class is more than just cooking — it&apos;s a celebration of culture, tradition, and the passion that goes into every dish.
            </p>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
