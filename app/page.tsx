'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { BrandFeatureCards } from '@/components/BrandFeatureCards';
import { Stats } from '@/components/Stats';
import { CourseCard } from '@/components/CourseCard';
import { HowItWorks } from '@/components/HowItWorks';
import { Testimonials } from '@/components/Testimonials';
import { FAQ } from '@/components/FAQ';
import { Newsletter } from '@/components/Newsletter';
import { Watermark } from '@/components/Watermark';
import { SplashScreen } from '@/components/SplashScreen';
import { useAdminStore } from '@/lib/store';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const storeCourses = useAdminStore((state) => state.courses);
  const featuredCourses = storeCourses.filter((c) => c.active !== false).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      <SplashScreen />
      <Watermark position="top-right" opacity={0.08} size="medium" />
      <Header />
      
      <main className="flex-grow">
        <Hero />
        <BrandFeatureCards />
        <Stats />
        
        {/* Featured Courses Section */}
        <section className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-mindelo-dark mb-4">
                  Featured Classes
                </h2>
                <p className="text-lg text-gray-600">
                  Our most requested traditional recipes, taught step-by-step. Choose your next culinary adventure.
                </p>
              </div>
              <Link 
                href="/courses" 
                className="inline-flex items-center gap-2 text-mindelo-blue font-bold hover:text-mindelo-dark transition-colors group"
              >
                <span>View all classes</span>
                <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredCourses.map((course, index) => (
                <CourseCard key={course.id} course={course} index={index} />
              ))}
            </div>
          </div>
        </section>

        <HowItWorks />
        
        {/* Final CTA Section */}
        <section className="py-16 sm:py-20 md:py-24 bg-mindelo-blue relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-mindelo-dark/20 to-mindelo-blue/20 mix-blend-overlay"></div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">
              Ready to Get Cooking?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
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

        <Testimonials />
        <FAQ />
        <Newsletter />
      </main>

      <Footer />
    </div>
  );
}
