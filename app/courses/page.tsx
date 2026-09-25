'use client';

import { Suspense, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ChefHat, Clock, Users, UtensilsCrossed } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CourseCard } from '@/components/CourseCard';
import { Watermark } from '@/components/Watermark';
import { useAdminStore } from '@/lib/store';
import { useSiteContent } from '@/lib/useSiteContent';
import { DEFAULT_MENU, RESTAURANT_DINNER, RESTAURANT_MIN_GUESTS } from '@/lib/restaurant';

type BookingType = 'classes' | 'restaurant';

function RestaurantOffer() {
  const stored = useSiteContent('restaurant_menu');
  const fromAdmin = (stored || []).filter((m) => m.title || m.description);
  const menu = fromAdmin.length > 0 ? fromAdmin : DEFAULT_MENU;

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
      <div className="relative h-56 sm:h-72 md:h-auto min-h-[14rem] bg-gray-100">
        <Image src={RESTAURANT_DINNER.image} alt="Dinner at Cátia's table" fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
        <div className="absolute top-4 right-4 bg-white/95 px-3 py-1 rounded-full shadow-sm">
          <span className="text-mindelo-dark font-bold text-sm">€{RESTAURANT_DINNER.priceNumber} / person</span>
        </div>
      </div>

      <div className="p-5 sm:p-8 flex flex-col">
        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-mindelo-dark mb-3">Dinner at Cátia&apos;s Table</h3>
        <p className="text-gray-600 mb-5">{RESTAURANT_DINNER.description}</p>

        <ol className="space-y-3 mb-6">
          {menu.map((item, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="w-7 h-7 shrink-0 rounded-full bg-mindelo-blue text-white text-sm font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <div>
                <p className="font-bold text-mindelo-dark">
                  {item.title}
                  {item.description && <span className="font-normal text-gray-600"> — {item.description}</span>}
                </p>
                {item.body && <p className="text-sm text-gray-500">{item.body}</p>}
              </div>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-100">
          <span className="flex items-center gap-1.5"><Users size={16} className="text-mindelo-blue" /> Groups from {RESTAURANT_MIN_GUESTS} guests</span>
          <span className="flex items-center gap-1.5"><Clock size={16} className="text-mindelo-blue" /> {RESTAURANT_DINNER.duration}</span>
        </div>

        <Link
          href={`/courses/${RESTAURANT_DINNER.id}`}
          className="mt-auto inline-flex items-center justify-center gap-2 w-full bg-mindelo-red hover:bg-red-700 text-white px-6 py-3.5 rounded-xl font-bold transition-colors"
        >
          Book a Dinner <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

function BookingChooser() {
  const router = useRouter();
  const params = useSearchParams();
  const type: BookingType = params.get('type') === 'restaurant' ? 'restaurant' : 'classes';

  const allCourses = useAdminStore((state) => state.courses);
  const hydrate = useAdminStore((state) => state.hydrate);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    (async () => {
      try {
        const res = await fetch('/api/courses');
        const data = await res.json();
        const courses = Array.isArray(data) ? data : data?.courses;
        if (Array.isArray(courses)) hydrate({ courses });
      } catch (e) {
        console.error('Failed to load courses:', e);
      }
    })();
  }, [hydrate]);

  const activeCourses = allCourses.filter((c) => c.active !== false);

  const tabs: { id: BookingType; label: string; icon: typeof ChefHat }[] = [
    { id: 'classes', label: 'Cooking Classes', icon: ChefHat },
    { id: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-xl mx-auto mb-10 sm:mb-12 p-1.5 bg-white rounded-2xl border border-blue-100 shadow-sm" role="tablist">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={type === id}
            onClick={() => router.replace(id === 'restaurant' ? '/courses?type=restaurant' : '/courses', { scroll: false })}
            className={`flex items-center justify-center gap-2 min-h-12 px-3 py-3 rounded-xl font-bold text-sm sm:text-base transition-colors ${
              type === id ? 'bg-mindelo-blue text-white shadow-md' : 'text-mindelo-dark hover:bg-blue-50'
            }`}
          >
            <Icon size={18} className="shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {type === 'restaurant' ? (
        <RestaurantOffer />
      ) : activeCourses.length === 0 ? (
        <p className="text-center text-gray-500 py-12">Classes will be announced soon.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {activeCourses.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CoursesPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 relative">
      <Watermark position="bottom-right" opacity={0.08} size="medium" />
      <Header />

      <main className="flex-grow">
        <div className="bg-mindelo-dark py-10 md:py-16 text-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="flex-shrink-0 w-20 h-20 md:w-28 md:h-28">
                <div className="relative w-full h-full rounded-full overflow-hidden shadow-lg border-4 border-mindelo-gold bg-white">
                  <Image src="/logo.png" alt="Catia Cooking Mindelo Logo" fill className="object-cover" />
                </div>
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Book With Cátia</h1>
                <p className="text-base md:text-lg text-gray-300">
                  Learn to cook Cape Verdean dishes in a class, or join us for a three-course dinner at our family table.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={<div className="py-24" />}>
          <BookingChooser />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
