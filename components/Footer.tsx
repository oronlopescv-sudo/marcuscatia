import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { MindeloWeatherWidget } from '@/components/MindeloWeatherWidget';

export function Footer() {
  return (
    <footer className="bg-[#0A2240] text-white relative overflow-hidden">
      {/* Top decorative line */}
      <div className="h-2 w-full bg-gradient-to-r from-mindelo-dark via-mindelo-blue to-mindelo-dark"></div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 sm:gap-8 lg:gap-10">
          
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="relative w-12 sm:w-16 h-12 sm:h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-white group-hover:scale-105 transition-transform">
                <Image 
                  src="/logo.png" 
                  alt="Catia Cooking Mindelo Logo" 
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-serif italic font-black text-base sm:text-xl text-white block">
                  catiacookingmindelo
                </span>
                <span className="text-xs text-blue-200 tracking-wider uppercase block">
                  Cape Verde on your plate
                </span>
              </div>
            </Link>
            <p className="text-blue-100/80 text-xs sm:text-sm leading-relaxed">
              Authentic Cape Verdean cooking classes in Mindelo, São Vicente.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs sm:text-base font-serif font-bold mb-3 sm:mb-4 text-mindelo-gold uppercase tracking-wider">Navigation</h3>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
              <li><Link href="/" className="text-blue-100 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/courses" className="text-blue-100 hover:text-white transition-colors">Classes</Link></li>
              <li><Link href="/about" className="text-blue-100 hover:text-white transition-colors">About</Link></li>
              <li><Link href="/gallery" className="text-blue-100 hover:text-white transition-colors">Gallery</Link></li>
              <li><Link href="/contact" className="text-blue-100 hover:text-white transition-colors">Contact</Link></li>
              <li>
                <Link href="/admin" className="text-mindelo-gold hover:text-white font-medium transition-colors inline-flex items-center gap-1.5">
                  🔒 Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs sm:text-base font-serif font-bold mb-3 sm:mb-4 text-mindelo-gold uppercase tracking-wider">Direct Contact</h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <Phone size={16} className="text-mindelo-gold flex-shrink-0 mt-0.5" />
                <a href="tel:+2385953973" className="text-blue-100 hover:text-white transition-colors">+238 595 3973</a>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={16} className="text-mindelo-gold flex-shrink-0 mt-0.5" />
                <a href="mailto:deandradeleukelcatiasofia@gmail.com" className="text-blue-100 hover:text-white transition-colors break-all">deandradeleukelcatiasofia@gmail.com</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-mindelo-gold flex-shrink-0 mt-0.5" />
                <span className="text-blue-100">Fonte Francês, Mindelo, São Vicente, Cabo Verde</span>
              </li>
            </ul>
          </div>

          {/* Weather Widget */}
          <div>
            <h3 className="text-xs sm:text-base font-serif font-bold mb-3 sm:mb-4 text-mindelo-gold uppercase tracking-wider">Live Weather</h3>
            <MindeloWeatherWidget />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-blue-800/50 my-8 sm:my-10"></div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-blue-200">
          <p>&copy; 2026 Catia Cooking Mindelo. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://www.instagram.com/catiacookingmindelo/" target="_blank" rel="noopener noreferrer" className="hover:text-mindelo-gold transition-colors">
              <Instagram size={18} />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61563087589223&mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" className="hover:text-mindelo-gold transition-colors">
              <Facebook size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
