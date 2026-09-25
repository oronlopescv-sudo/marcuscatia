'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, Users, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export interface CourseProps {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  maxCapacity: number;
  level?: string;
  price: string;
}

export function CourseCard({ course, index = 0 }: { course: CourseProps; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className="flex h-full"
    >
      <div className="flex-1 group flex flex-col bg-white rounded-xl border border-blue-50 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative h-40 sm:h-48 md:h-56 w-full overflow-hidden bg-gray-100">
          <Image
            src={course.image || '/catia-cooking.jpg'}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
            <span className="text-mindelo-dark font-bold text-sm">{course.price}</span>
          </div>
        </div>
        
        <div className="flex flex-col flex-1 p-4 sm:p-5 md:p-6">
          <h3 className="text-lg sm:text-xl font-serif font-bold text-mindelo-dark mb-2 sm:mb-3 group-hover:text-mindelo-blue transition-colors line-clamp-2">
            {course.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1">
            {course.description}
          </p>
          
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-mindelo-blue" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={16} className="text-mindelo-blue" />
              <span>Max. {course.maxCapacity} guests</span>
            </div>
          </div>
          
          <Link 
            href={`/courses/${course.id}`}
            className="inline-flex items-center justify-between w-full font-bold text-mindelo-dark group-hover:text-mindelo-blue transition-colors"
          >
            <span>View Details</span>
            <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
