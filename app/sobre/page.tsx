import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Phone, Images } from 'lucide-react';

export default function SobrePage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-mindelo-dark py-16 text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              About Cátia
            </h1>
            <p className="text-lg text-gray-300">
              Discover our story, island hospitality (morabeza), and the culinary secrets of Mindelo.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-12 items-center mb-12">
            <div className="w-full md:w-1/2">
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-blue-50">
                 <Image 
                  src="/catia-cooking.jpg" 
                  alt="Cátia cooking overlooking the Bay of Mindelo" 
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  priority
                 />
                 <div className="absolute bottom-3 right-3 w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-white">
                   <Image 
                    src="/logo.png" 
                    alt="Official Logo" 
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                   />
                 </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-mindelo-blue">Where flavor meets style</span>
                <h2 className="text-3xl font-serif font-bold text-mindelo-dark mt-1">
                  Welcome to our home in Fonte Francês
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                Hello! I am Cátia Sofia de Andrade, and <strong>Catia Cooking Classes</strong> was born from my heartfelt desire to open my home in Mindelo and share the culinary richness of Cape Verde with guests from around the globe.
              </p>
              <div className="border-l-4 border-mindelo-blue pl-4 py-1 italic text-gray-700 bg-blue-50/50 rounded-r-xl text-sm md:text-base leading-relaxed">
                &ldquo;Catia Cooking Classes is dedicated to passing on cherished culinary knowledge. Our goal is to provide everyone, regardless of skill level, the opportunity to explore traditional island gastronomy, learning authentic techniques and time-tested recipes.&rdquo;
              </div>
              <p className="text-gray-600 leading-relaxed text-base">
                Our classes often begin with a lively visit to Mindelo&apos;s Municipal Market and Fish Market to hand-select the freshest ingredients, followed by transport to our kitchen where we cook together with laughter, music, and genuine Cape Verdean warmth.
              </p>
              <p className="text-mindelo-blue font-bold text-lg font-serif">
                We await you with open arms and a bountiful table!
              </p>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/cursos"
                  className="inline-flex items-center justify-center gap-2 bg-[#0A3D78] hover:bg-mindelo-blue text-white px-6 py-3.5 rounded-full font-bold text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <span>View Available Classes</span>
                  <ArrowRight size={16} />
                </Link>

                <a
                  href="https://wa.me/2385953973?text=Hello%20C%C3%A1tia!%20I%20read%20your%20story%20and%20would%20love%20to%20know%20more%20about%20your%20cooking%20classes."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-5 py-3 rounded-full font-bold text-sm transition-all"
                >
                  <Phone size={15} />
                  <span>Cátia on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Additional quick links card */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h3 className="font-serif font-bold text-lg text-mindelo-dark mb-1">
                Want to see real photos from our classes?
              </h3>
              <p className="text-sm text-gray-600">
                Explore the warm family setting and mouth-watering dishes crafted by our students.
              </p>
            </div>
            <Link
              href="/galeria"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-mindelo-blue hover:text-white text-[#0A3D78] font-bold text-sm transition-colors border border-blue-200 shrink-0 shadow-xs"
            >
              <Images size={16} />
              <span>View Gallery</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
