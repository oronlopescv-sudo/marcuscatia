import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { MindeloWeatherWidget } from '@/components/MindeloWeatherWidget';

export function Footer() {
  return (
    <footer className="bg-[#0A2240] text-white relative overflow-hidden">
      {/* Top painted coastal blue decorative stroke */}
      <div className="h-2 w-full bg-gradient-to-r from-mindelo-dark via-mindelo-blue to-mindelo-dark"></div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Info with Official Logo */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-white group-hover:scale-105 transition-transform">
                <Image 
                  src="/logo.png" 
                  alt="Catia Cooking Mindelo Logo Oficial" 
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-serif italic font-black text-xl text-white block">
                  catiacookingmindelo
                </span>
                <span className="text-xs text-blue-200 tracking-wider uppercase block">
                  Cape Verde on your plate
                </span>
              </div>
            </Link>
            <p className="text-blue-100/80 text-sm leading-relaxed">
              Authentic Cape Verdean cooking classes in Mindelo, São Vicente. A warm, welcoming experience of flavors, island stories, and morabeza with Cátia.
            </p>
          </div>

          <div>
            <h3 className="text-base font-serif font-bold mb-4 text-mindelo-gold uppercase tracking-wider">Navigation</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="text-blue-100 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/cursos" className="text-blue-100 hover:text-white transition-colors">Classes & Courses</Link></li>
              <li><Link href="/sobre" className="text-blue-100 hover:text-white transition-colors">About Cátia</Link></li>
              <li><Link href="/galeria" className="text-blue-100 hover:text-white transition-colors">Photo Gallery</Link></li>
              <li><Link href="/contacto" className="text-blue-100 hover:text-white transition-colors">Bookings & Contact</Link></li>
              <li>
                <Link href="/admin" className="text-mindelo-gold hover:text-white font-medium transition-colors inline-flex items-center gap-1.5">
                  <span>🔒 Admin Portal (Cátia)</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-serif font-bold mb-4 text-mindelo-gold uppercase tracking-wider">Direct Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="text-mindelo-gold shrink-0 mt-0.5" size={18} />
                <span className="text-blue-100">Fonte Francês, Mindelo<br />São Vicente, Cape Verde</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-mindelo-gold shrink-0" size={18} />
                <a href="https://wa.me/2385953973" target="_blank" rel="noopener noreferrer" className="text-blue-100 hover:text-white transition-colors">
                  +238 5953973 (WhatsApp)
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-mindelo-gold shrink-0" size={18} />
                <a href="mailto:deandradeleukelcatiasofia@gmail.com" className="text-blue-100 hover:text-white transition-colors truncate max-w-[210px]" title="deandradeleukelcatiasofia@gmail.com">
                  deandradeleukelcatiasofia@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-serif font-bold mb-4 text-mindelo-gold uppercase tracking-wider">Follow Cátia</h3>
            <p className="text-xs text-blue-200 mb-3">
              Follow our daily recipes, fresh fish market visits, and behind-the-scenes moments from our cooking classes in Mindelo.
            </p>
            <div className="flex gap-3 mb-5">
              <a href="https://www.instagram.com/catiacookingmindelo/" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors" aria-label="Instagram">
                <Instagram size={18} className="text-white" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors" aria-label="Facebook">
                <Facebook size={18} className="text-white" />
              </a>
            </div>

            {/* Live Weather Widget for students planning their visit */}
            <MindeloWeatherWidget variant="footer" />
          </div>

        </div>

        {/* Coastal Brand Strip from the reference design */}
        <div className="border-t border-blue-900/80 mt-12 pt-8">
          
          {/* Crossed Utensils and Cape Verde Flag Colors Accent */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-0.5 w-12 bg-mindelo-blue rounded-full"></span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-blue-400/30 text-xs font-serif tracking-widest text-blue-200">
              <span>🍴</span>
              <span>CAPE VERDE FLAVORS</span>
            </div>
            <span className="h-0.5 w-12 bg-mindelo-red rounded-full"></span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-200/80">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-blue-300" />
              <a href="mailto:deandradeleukelcatiasofia@gmail.com" className="hover:text-white underline">
                deandradeleukelcatiasofia@gmail.com
              </a>
            </div>

            <p className="text-center">
              &copy; 2026 catiacookingmindelo. All rights reserved.
            </p>

            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-blue-300" />
              <span>Mindelo, Cape Verde</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
