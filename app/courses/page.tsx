'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CourseCard } from '@/components/CourseCard';
import { Watermark } from '@/components/Watermark';
import { useAdminStore } from '@/lib/store';

export default function CursosPage() {
  const [filter, setFilter] = useState<string>('All');
  const allCourses = useAdminStore((state) => state.courses);

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const activeCourses = allCourses.filter(c => c.active !== false);

  const filteredCourses = filter === 'All'
    ? activeCourses
    : activeCourses.filter(c => c.level === filter);

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
            
            <div className="flex flex-wrap gap-2 justify-center">
              {levels.map(level => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={`px-5 py-2 rounded-full font-medium transition-colors ${
                    filter === level 
                      ? 'bg-mindelo-blue text-white shadow-md' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-mindelo-blue hover:text-mindelo-blue'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
            
            {filteredCourses.length === 0 && (
              <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 max-w-md mx-auto">
                <p className="text-gray-600 text-lg mb-4">No classes found for level &quot;{filter}&quot;.</p>
                <button
                  onClick={() => setFilter('All')}
                  className="px-6 py-2.5 bg-mindelo-blue hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-colors shadow-sm"
                >
                  View All Classes
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
