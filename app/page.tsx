'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { BrandFeatureCards } from '@/components/BrandFeatureCards';
import { CourseCard } from '@/components/CourseCard';
import { HowItWorks } from '@/components/HowItWorks';
import { Testimonials } from '@/components/Testimonials';
import { FAQ } from '@/components/FAQ';
import { Newsletter } from '@/components/Newsletter';
import { Watermark } from '@/components/Watermark';
import { useAdminStore } from '@/lib/store';
import { RESTAURANT_DINNER } from '@/lib/restaurant';
import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const storeCourses = useAdminStore((state) => state.courses);
  const hydrate = useAdminStore((state) => state.hydrate);
  const featuredCourses = [...storeCourses.filter((c) => c.active !== false).slice(0, 2), RESTAURANT_DINNER];

  useEffect(() => {
    fetch('/api/courses')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const courses = Array.isArray(data) ? data : data?.courses;
        if (Array.isArray(courses)) hydrate({ courses });
      })
      .catch((err) => console.error('Failed to load courses:', err));
  }, [hydrate]);

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      <Watermark position="top-right" opacity={0.08} size="medium" />
      <Header />
      
      <main className="flex-grow">
        <Hero />
        <div className="py-8 sm:py-12 md:py-16"></div>

        {/* Featured Courses Section */}
        <section className="-mt-8 py-14 sm:py-24 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-4">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-mindelo-dark mb-4 sm:mb-8">
                  Classes &amp; Dinner
                </h2>
                <p className="text-base sm:text-lg text-gray-600">
                  Learn traditional recipes step by step, or sit down to a three-course Cape Verdean dinner at our family table.
                </p>
              </div>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 py-2 text-mindelo-blue font-bold hover:text-mindelo-dark transition-colors group"
              >
                <span>See all options</span>
                <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
              {featuredCourses.map((course, index) => (
                <CourseCard key={course.id} course={course} index={index} />
              ))}
            </div>
          </div>
        </section>

        <div className="py-8 sm:py-12 md:py-16"></div>

        <HowItWorks />

        <div className="py-8 sm:py-12 md:py-16"></div>

        {/* Final CTA Section */}
        <section className="py-16 sm:py-20 md:py-24 bg-mindelo-blue relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-mindelo-dark/20 to-mindelo-blue/20 mix-blend-overlay"></div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-8">
              Ready to Get Cooking?
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Classes are limited to 8 guests per session to guarantee the most authentic, personal experience.
            </p>
            <Link
              href="/courses"
              className="inline-block bg-mindelo-red hover:bg-red-700 text-white px-10 py-5 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Book My Spot Now
            </Link>
          </div>
        </section>

        <div className="py-8 sm:py-12 md:py-16"></div>

        <Testimonials />

        <div className="py-8 sm:py-12 md:py-16"></div>

        <FAQ />

        <div className="py-8 sm:py-12 md:py-16"></div>

        <Newsletter />

        <BrandFeatureCards />
      </main>

      <Footer />
    </div>
  );
}
