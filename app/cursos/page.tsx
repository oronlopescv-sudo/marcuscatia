'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CourseCard } from '@/components/CourseCard';
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
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        {/* Header Section */}
        <div className="bg-mindelo-dark py-16 text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Our Cooking Classes
            </h1>
            <p className="text-lg text-gray-300">
              Choose the dish you wish to master and immerse yourself in Cape Verdean flavors with Cátia.
            </p>
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
