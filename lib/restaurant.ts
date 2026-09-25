import type { Course } from '@/lib/store';

// The restaurant dinner is booked through the same reservations table as the
// classes, using this fixed "course" instead of a row in the courses table.
export const RESTAURANT_MIN_GUESTS = 4;
export const RESTAURANT_MAX_GUESTS = 20;

export const RESTAURANT_DINNER: Course = {
  id: 'restaurant-dinner',
  title: 'Restaurant Dinner',
  description:
    'A three-course Cape Verdean dinner at Cátia’s family table in Fonte Francês: starter, main course and dessert, cooked with fresh produce from the Mindelo market.',
  image: '/catia-cooking.jpg',
  duration: 'From 19:00',
  maxCapacity: RESTAURANT_MAX_GUESTS,
  price: '€20',
  priceNumber: 20,
  active: true,
  timeSlot: '19:00',
  includes: ['Starter', 'Main course', 'Dessert'],
};

export const DEFAULT_MENU = [
  { title: 'Starter', description: 'Seasonal Cape Verdean starter', body: 'Made with fresh ingredients from the Mindelo market.' },
  { title: 'Main course', description: 'Traditional dish of the day', body: 'A classic Cape Verdean recipe cooked the way Cátia’s family makes it.' },
  { title: 'Dessert', description: 'Homemade dessert', body: 'A sweet island finish to the evening.' },
];

export function isRestaurantBooking(courseId: string | undefined | null): boolean {
  return courseId === RESTAURANT_DINNER.id;
}
