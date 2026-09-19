import Image from 'next/image';

interface SectionHeroWithLogoProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}

export function SectionHeroWithLogo({
  title,
  subtitle,
  showLogo = true
}: SectionHeroWithLogoProps) {
  return (
    <div className="relative py-8 sm:py-12 md:py-16 bg-gradient-to-br from-mindelo-cream via-white to-blue-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-72 h-72 bg-mindelo-blue rounded-full -mr-36 -mt-36"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-mindelo-gold rounded-full -ml-36 -mb-36"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Logo */}
          {showLogo && (
            <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40">
              <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl border-4 border-mindelo-gold bg-white">
                <Image
                  src="/logo.png"
                  alt="Catia Cooking Mindelo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          {/* Text */}
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-mindelo-dark mb-2 md:mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base sm:text-lg md:text-xl text-gray-700">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
