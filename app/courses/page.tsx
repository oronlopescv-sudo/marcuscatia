'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CourseCard } from '@/components/CourseCard';
import { Watermark } from '@/components/Watermark';
import { useAdminStore } from '@/lib/store';

export default function CoursesPage() {
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

  const activeCourses = allCourses.filter(c => c.active !== false);

  const filteredCourses = activeCourses;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 relative">
      <Watermark position="bottom-right" opacity={0.08} size="medium" />
      <Header />
      
      <main className="flex-grow">
        {/* Header Section */}
        <div className="bg-mindelo-dark py-12 md:py-16 text-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              {/* Logo */}
              <div className="flex-shrink-0 w-20 h-20 md:w-28 md:h-28">
                <div className="relative w-full h-full rounded-full overflow-hidden shadow-lg border-4 border-mindelo-gold bg-white">
                  <Image 
                    src="/logo.png" 
                    alt="Catia Cooking Mindelo Logo" 
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              
              {/* Text */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
                  Our Cooking Classes
                </h1>
                <p className="text-base md:text-lg text-gray-300">
                  Choose the dish you wish to master and immerse yourself in Cape Verdean flavors with Cátia.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and List Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <h2 className="text-2xl font-bold text-mindelo-dark">
              Find Your Ideal Class
            </h2>
            
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {filteredCourses.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
            
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
