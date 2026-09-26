import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Mail, Soup } from 'lucide-react';

const cards = [
  {
    title: 'Classes & Recipes',
    text: 'Discover traditional Cape Verdean recipes, from rich Cachupa Rica to crispy Tuna Pastels, prepared with passion and fresh market ingredients.',
    href: '/courses',
    icon: <Soup size={22} strokeWidth={1.75} />,
  },
  {
    title: 'About Cátia',
    text: 'Where flavor meets style. Meet Cátia and explore a warm space dedicated to passing on rich culinary wisdom and cherished island recipes.',
    href: '/about',
    icon: (
      <span className="relative block w-full h-full rounded-full overflow-hidden">
        <Image src="/catia-cooking.jpg" alt="Cátia Sofia de Andrade" fill sizes="48px" className="object-cover" />
      </span>
    ),
  },
  {
    title: 'Contact',
    text: 'Let’s talk! Questions, private group bookings, or special requests. We would be delighted to answer and welcome you to our kitchen.',
    href: '/contact',
    icon: <Mail size={22} strokeWidth={1.75} />,
  },
];

// Compact "explore" cards shown at the end of the home page.
export function BrandFeatureCards() {
  return (
    <section className="py-10 sm:py-12 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group flex gap-4 p-4 sm:p-5 rounded-xl border border-blue-100 bg-blue-50/30 hover:bg-white hover:shadow-md hover:border-blue-200 transition-all"
          >
            <span className="shrink-0 w-12 h-12 rounded-full bg-white border-2 border-mindelo-blue text-mindelo-blue flex items-center justify-center">
              {card.icon}
            </span>
            <span className="min-w-0">
              <span className="block font-serif font-bold text-mindelo-dark group-hover:text-mindelo-blue transition-colors">
                {card.title}
              </span>
              <span className="block text-xs sm:text-sm text-gray-600 leading-snug mt-1">{card.text}</span>
              <span className="inline-flex items-center gap-1 mt-2 text-sm font-bold text-[#0A3D78] group-hover:text-mindelo-red transition-colors">
                Explore <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
