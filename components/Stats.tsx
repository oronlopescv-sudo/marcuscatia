import { Users, Clock, Star, ChefHat } from 'lucide-react';

export function Stats() {
  const stats = [
    {
      id: 1,
      name: 'Happy Students',
      value: '500+',
      icon: Users,
    },
    {
      id: 2,
      name: 'Years Experience',
      value: '15+',
      icon: Clock,
    },
    {
      id: 3,
      name: 'Average Rating',
      value: '5.0',
      icon: Star,
    },
    {
      id: 4,
      name: 'Traditional Recipes',
      value: '20+',
      icon: ChefHat,
    },
  ];

  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="text-center group">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 group-hover:bg-mindelo-blue transition-colors duration-300 mb-4">
                <stat.icon className="h-8 w-8 text-mindelo-blue group-hover:text-white transition-colors duration-300" aria-hidden="true" />
              </div>
              <p className="text-3xl font-serif font-bold text-mindelo-dark mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
