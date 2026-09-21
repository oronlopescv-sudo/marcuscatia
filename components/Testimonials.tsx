import { Star } from 'lucide-react';
import Image from 'next/image';

export function Testimonials() {
  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Visitor from Portugal',
      content: 'The class with Cátia was truly the highlight of our stay in São Vicente! The Cachupa turned out divine and we learned so much about the island\'s traditions. The warm family atmosphere was unforgettable.',
      image: '/catia-cooking.jpg',
    },
    {
      name: 'John Doe',
      role: 'Global Food Traveler',
      content: 'I have taken cooking classes all over the world, but this one felt like cooking with an old friend. The Tuna Pastels were crunchy and packed with flavor. Highly recommended!',
      image: '/catia-cooking-hero.jpg',
    },
    {
      name: 'Elena Dupont',
      role: 'Traveler from France',
      content: 'The market tour was lively and fascinating, and Cátia showed us how to select the freshest fish. Cooking with her was joyful, educational, and absolutely delicious!',
      image: '/logo.jpg',
    }
  ];

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-mindelo-dark mb-6 sm:mb-8">
            What Our Students Say
          </h2>
          <p className="text-lg text-gray-600">
            The joy and fond memories of those who cook with us are our greatest pride.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-mindelo-cream/30 p-8 rounded-2xl border border-blue-50 relative mt-8">
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-md">
                  <Image 
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              
              <div className="pt-10 text-center">
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-mindelo-gold fill-mindelo-gold" />
                  ))}
                </div>
                
                <p className="text-gray-700 italic mb-6 text-sm leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                
                <div>
                  <h4 className="font-bold text-mindelo-dark">{testimonial.name}</h4>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">{testimonial.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
