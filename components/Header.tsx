'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Lock } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MindeloWeatherWidget } from '@/components/MindeloWeatherWidget';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Classes & Courses', href: '/cursos' },
    { name: 'About Cátia', href: '/sobre' },
    { name: 'Gallery', href: '/galeria' },
    { name: 'Contact', href: '/contacto' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-sm">
      {/* Top painted coastal blue decorative stroke */}
      <div className="h-1.5 w-full bg-gradient-to-r from-mindelo-dark via-mindelo-blue to-mindelo-dark"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo + Cape Verde Flag + Slogan */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-mindelo-blue shadow-sm group-hover:scale-105 transition-transform bg-white">
                <Image 
                  src="/logo.png" 
                  alt="Catia Cooking Mindelo Logo Oficial" 
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif italic font-extrabold text-xl text-mindelo-dark tracking-tight leading-none group-hover:text-mindelo-blue transition-colors">
                  catiacookingmindelo
                </span>
              </div>
            </Link>

            {/* Vertical divider & Cape Verde Flag badge */}
            <div className="hidden lg:flex items-center gap-2.5 pl-3 border-l border-blue-200">
              {/* Cape Verde Flag mini badge */}
              <div className="w-6 h-4 bg-[#003893] relative rounded-xs shadow-xs overflow-hidden flex flex-col justify-center shrink-0 border border-black/10" title="Cape Verde">
                <div className="h-0.5 bg-white w-full"></div>
                <div className="h-0.5 bg-[#CF2027] w-full"></div>
                <div className="h-0.5 bg-white w-full"></div>
                <div className="absolute left-1 w-2 h-2 rounded-full border border-[#FFD100] border-dotted opacity-90"></div>
              </div>
              <span className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                Cape Verde flavors on your plate
              </span>
            </div>
          </div>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link, idx) => (
              <span key={link.name} className="flex items-center">
                <Link 
                  href={link.href}
                  className="text-gray-700 hover:text-mindelo-blue font-medium transition-colors duration-150 text-sm tracking-wide py-1 border-b-2 border-transparent hover:border-mindelo-blue"
                >
                  {link.name}
                </Link>
                {idx < navLinks.length - 1 && (
                  <span className="ml-6 lg:ml-8 text-blue-200 text-xs select-none">|</span>
                )}
              </span>
            ))}
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Live Weather Widget for students */}
            <MindeloWeatherWidget variant="header" />

            <div className="hidden sm:flex items-center gap-2 lg:gap-3">
              <Link 
                href="/admin" 
                className="p-2 text-gray-500 hover:text-mindelo-blue transition-colors rounded-full hover:bg-blue-50 flex items-center gap-1.5 text-xs font-semibold"
                title="Management Area & Bookings (Admin)"
                aria-label="Access Admin Portal"
              >
                <Lock size={15} />
                <span className="hidden xl:inline">Admin</span>
              </Link>

              <a 
                href="https://www.instagram.com/catiacookingmindelo/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 text-mindelo-dark hover:text-mindelo-blue transition-colors rounded-full hover:bg-blue-50"
                aria-label="Cátia on Instagram"
                title="Instagram @catiacookingmindelo"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              <Link 
                href="/cursos" 
                className="bg-mindelo-red hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 whitespace-nowrap"
              >
                Book a Class
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center ml-1">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-mindelo-dark hover:text-mindelo-blue p-2"
              aria-label="Open navigation menu"
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-blue-100"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-mindelo-blue hover:bg-blue-50/50 rounded-md"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-mindelo-blue hover:bg-blue-50/50 rounded-md"
              >
                🔒 Management Area (Admin)
              </Link>
              <div className="pt-2">
                <Link
                  href="/cursos"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-mindelo-red hover:bg-red-700 text-white px-6 py-3 rounded-md font-bold transition-colors"
                >
                  Book a Class
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
