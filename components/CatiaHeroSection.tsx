'use client';

import Image from 'next/image';

export function CatiaHeroSection() {
  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-b from-mindelo-cream to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-mindelo-blue/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-mindelo-gold/5 rounded-full blur-3xl -ml-36 -mb-36"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 items-center">
          
          {/* Logo Professional */}
          <div className="flex justify-center md:justify-start">
            <div className="relative w-80 md:w-96">
              {/* Drop shadow effect */}
              <div className="absolute inset-0 bg-black/10 rounded-full blur-2xl scale-95"></div>
              
              {/* Logo Image */}
              <Image
                src="/logo.png"
                alt="Catia Cooking Mindelo - Cape Verdean Cuisine"
                width={400}
                height={400}
                className="w-full h-auto drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-mindelo-dark mb-4">
                Tradition, Flavor and Mindelo
                <span className="block text-mindelo-blue">On Your Plate</span>
              </h2>
              <div className="w-12 h-1 bg-mindelo-red rounded-full"></div>
            </div>

            <p className="text-lg text-mindelo-blue font-semibold">
              Where flavor meets style
            </p>

            <p className="text-base md:text-lg text-gray-700 leading-relaxed">
              Join Cátia for an authentic culinary journey through the heart of Mindelo. 
              From the vibrant local markets to our kitchen overlooking the Atlantic, 
              discover the true essence of Cape Verdean cuisine.
            </p>

            <p className="text-base md:text-lg text-gray-600 leading-relaxed">
              Every class is more than just cooking — it's a celebration of culture, 
              tradition, and the passion that goes into every dish.
            </p>

            <div className="flex gap-4 pt-4">
              <a
                href="/courses"
                className="px-8 py-3 bg-mindelo-blue hover:bg-mindelo-dark text-white rounded-xl font-bold transition-all shadow-lg"
              >
                Explore Classes
              </a>
              <a
                href="https://wa.me/2385953973"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
              >
                <span>Contact Cátia</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
