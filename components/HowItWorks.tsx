import { CalendarHeart, ClipboardCheck, Utensils, Star } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      title: 'Choose Your Class',
      description: 'Explore our traditional dishes and pick the culinary experience that whets your appetite.',
      icon: Utensils,
    },
    {
      title: 'Pick a Date',
      description: 'Select an available date on the calendar and fill out our quick, hassle-free booking form.',
      icon: CalendarHeart,
    },
    {
      title: 'Fast Confirmation',
      description: 'Cátia will receive your request and reserve your spot. You will get a WhatsApp confirmation message.',
      icon: ClipboardCheck,
    },
    {
      title: 'Cook & Savor',
      description: 'Join Cátia in Fonte Francês, master authentic island secrets, and share a delightful feast together.',
      icon: Star,
    },
  ];

  return (
    <section className="py-20 bg-mindelo-cream/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-mindelo-dark mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600">
            Booking your cooking class is quick and effortless. Payment is settled in cash on the day of the class.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full border-t-2 border-dashed border-blue-200" />
              )}
              
              <div className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-mindelo-blue flex items-center justify-center mb-6 shadow-md z-10">
                  <step.icon size={32} className="text-mindelo-blue" />
                </div>
                
                <h3 className="text-xl font-bold text-mindelo-dark mb-3">
                  {index + 1}. {step.title}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
